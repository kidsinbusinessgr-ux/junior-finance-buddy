import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/push/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { subscription?: PushSubscriptionJSON; ticker?: string; adminAlerts?: boolean };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const sub = body.subscription;
        const endpoint = sub?.endpoint ?? "";
        const p256dh = sub?.keys?.["p256dh"] ?? "";
        const auth = sub?.keys?.["auth"] ?? "";
        if (!endpoint.startsWith("https://") || endpoint.length > 1000 || !p256dh || !auth
            || p256dh.length > 200 || auth.length > 100) {
          return json({ error: "Invalid subscription" }, 400);
        }
        const ticker = typeof body.ticker === "string" && /^[A-Z.]{1,10}$/.test(body.ticker) ? body.ticker : null;

        try {
          const { getAdminClient, getUserFromRequest } = await import("@/lib/supabase-admin.server");
          const admin = getAdminClient();
          // A signed-in child's browser is linked to them (founder reminders).
          const user = await getUserFromRequest(request);
          const { data: child } = user
            ? await admin.from("jfb_children").select("id").eq("user_id", user.id).maybeSingle()
            : { data: null };
          // The founder's "new feedback" alert: only for accounts in ADMIN_EMAILS.
          let adminAlerts = false;
          if (body.adminAlerts === true) {
            const { adminEmails } = await import("@/lib/admin.functions");
            adminAlerts = Boolean(user?.email && adminEmails().includes(user.email.toLowerCase()));
            if (!adminAlerts) return json({ error: "Forbidden" }, 403);
          }
          // Columns left out keep their saved value (e.g. the followed stock).
          const row = {
            endpoint, p256dh, auth, updated_at: new Date().toISOString(),
            ...(ticker ? { tickers: [ticker] } : {}),
            ...(child ? { child_id: child.id } : {}),
            ...(user ? { user_id: user.id } : {}),
            ...(adminAlerts ? { admin_alerts: true } : {}),
          };
          const { error } = await admin.from("push_subscriptions").upsert(row as never, { onConflict: "endpoint" });
          if (error) throw error;
          return json({ ok: true });
        } catch (err) {
          console.error("subscribe error", err);
          return json({ error: "Internal error" }, 500);
        }
      },
    },
  },
});
