import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function getStripe() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  const { default: Stripe } = await import("stripe");
  return new Stripe(key);
}

export type ActivatePremiumResult =
  | { ok: true; plan: "monthly" | "yearly" }
  | { ok: false; reason: "login" | "unpaid" | "mismatch" };

/**
 * Verifies a Stripe Checkout session (from our Payment Links) and marks the
 * signed-in user as premium in app_metadata, which users cannot edit.
 * The payment must belong to this user (client_reference_id, or the same email),
 * and each session can unlock only one account.
 */
export const activatePremium = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ sessionId: z.string().min(1).max(255) }).parse(data))
  .handler(async ({ data }): Promise<ActivatePremiumResult> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getAdminClient, getUserFromRequest } = await import("./supabase-admin.server");

    const user = await getUserFromRequest(getRequest());
    if (!user) return { ok: false, reason: "login" };

    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const paid =
      session.status === "complete" &&
      (session.payment_status === "paid" || session.payment_status === "no_payment_required");
    if (!paid) return { ok: false, reason: "unpaid" };

    const payerEmail = (session.customer_details?.email ?? session.customer_email ?? "").toLowerCase();
    const ownsPayment = session.client_reference_id
      ? session.client_reference_id === user.id
      : !!payerEmail && payerEmail === (user.email ?? "").toLowerCase();
    if (!ownsPayment) return { ok: false, reason: "mismatch" };

    const admin = getAdminClient();
    const { error: claimError } = await admin
      .from("jfb_premium_claims")
      .insert({ session_id: session.id, user_id: user.id });
    if (claimError) {
      if (claimError.code !== "23505") throw new Error(claimError.message);
      const { data: existing } = await admin
        .from("jfb_premium_claims")
        .select("user_id")
        .eq("session_id", session.id)
        .maybeSingle();
      if (existing?.user_id !== user.id) return { ok: false, reason: "mismatch" };
    }

    const plan: "monthly" | "yearly" = (session.amount_total ?? 0) >= 3000 ? "yearly" : "monthly";
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { subscription_tier: "paid", subscription_plan: plan },
    });
    if (updateError) throw new Error(updateError.message);

    return { ok: true, plan };
  });
