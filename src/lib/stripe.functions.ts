import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-06-30.basil" });
}

const PLANS = {
  monthly: {
    amount: 499, // €4.99
    interval: "month" as const,
    label: "Μηνιαία συνδρομή — €4,99/μήνα",
  },
  yearly: {
    amount: 3900, // €39
    interval: "year" as const,
    label: "Ετήσια συνδρομή — €39/χρόνο",
  },
} as const;

const checkoutInputSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data) => checkoutInputSchema.parse(data))
  .handler(async ({ data }) => {
    const stripe = getStripe();
    const plan = PLANS[data.plan];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Kids in Business Premium",
              description: plan.label,
              images: [],
            },
            unit_amount: plan.amount,
            recurring: { interval: plan.interval },
          },
          quantity: 1,
        },
      ],
      customer_email: data.userEmail,
      metadata: {
        userId: data.userId ?? "",
        plan: data.plan,
      },
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      locale: "el",
      allow_promotion_codes: true,
    });

    return { sessionId: session.id, url: session.url };
  });

const verifyInputSchema = z.object({
  sessionId: z.string(),
});

export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data) => verifyInputSchema.parse(data))
  .handler(async ({ data }) => {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    const paid =
      session.payment_status === "paid" &&
      session.status === "complete";

    return {
      paid,
      plan: (session.metadata?.plan ?? "monthly") as "monthly" | "yearly",
      userId: session.metadata?.userId ?? "",
      customerEmail: session.customer_email ?? session.customer_details?.email ?? "",
    };
  });
