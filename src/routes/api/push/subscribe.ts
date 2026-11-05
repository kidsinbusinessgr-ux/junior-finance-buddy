import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!;

export const APIRoute = createAPIFileRoute("/api/push/subscribe")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { subscription, ticker } = body as {
        subscription: PushSubscriptionJSON;
        ticker?: string;
      };

      if (!subscription?.endpoint) {
        return new Response(JSON.stringify({ error: "No subscription" }), { status: 400 });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from("push_subscriptions").upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
          tickers: ticker ? [ticker] : [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" }
      );

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("subscribe error", err);
      return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
    }
  },
});
