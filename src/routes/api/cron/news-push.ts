import { createFileRoute } from "@tanstack/react-router";
import { KID_STOCKS } from "@/lib/stocks.functions";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const fmtNumber = (n: number, digits: number) => n.toFixed(digits).replace(".", ",");

// The Greek notification about how the stock a child follows did on the last
// trading day. (FMP news isn't part of the free plan, so prices are used.)
function priceMessage(
  name: string,
  changePercent: number,
  priceEur: number,
  when: string,
): { title: string; body: string } {
  const pct = fmtNumber(Math.abs(changePercent), 1);
  const price = `€${fmtNumber(priceEur, 2)}`;
  if (changePercent >= 0.1) {
    return {
      title: `📈 Η ${name} ανέβηκε ${pct}% ${when}!`,
      body: `Μία μετοχή κοστίζει τώρα ${price}. Δες στις Μετοχές τι σημαίνει αυτό για τις επενδύσεις σου!`,
    };
  }
  if (changePercent <= -0.1) {
    return {
      title: `📉 Η ${name} έπεσε ${pct}% ${when}`,
      body: `Μία μετοχή κοστίζει τώρα ${price}. Οι τιμές ανεβοκατεβαίνουν, είναι φυσιολογικό! Μάθε γιατί στις Μετοχές.`,
    };
  }
  return {
    title: `➖ Η ${name} έμεινε σχεδόν ίδια ${when}`,
    body: `Μία μετοχή κοστίζει ${price}. Οι ήρεμες μέρες είναι κι αυτές μέρος του χρηματιστηρίου!`,
  };
}

// Daily job (see vercel.json; Tuesday–Saturday, after each US trading day).
// Every subscribed browser gets a note about the stock it follows.
// Vercel sends `Authorization: Bearer $CRON_SECRET`.
export const Route = createFileRoute("/api/cron/news-push")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.log("news-push: started");
        const cronSecret = process.env["CRON_SECRET"];
        // Fail closed: without a secret configured, nobody can trigger this.
        if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
          console.warn("news-push: unauthorized", { hasSecret: Boolean(cronSecret), hasHeader: request.headers.has("authorization") });
          return new Response("Unauthorized", { status: 401 });
        }

        const vapidPublic = process.env["VAPID_PUBLIC_KEY"];
        const vapidPrivate = process.env["VAPID_PRIVATE_KEY"];
        if (!vapidPublic || !vapidPrivate) {
          console.error("news-push: missing env vars");
          return json({ error: "Missing env vars" }, 500);
        }

        const { getAdminClient } = await import("@/lib/supabase-admin.server");
        const { getStoredQuotes, getEurPerUsd } = await import("@/lib/market-data.server");
        // web-push only has named exports (no default), so use the module itself.
        const webpush = await import("web-push");
        webpush.setVapidDetails("mailto:info@kidsinbusiness.gr", vapidPublic, vapidPrivate);

        const supabase = getAdminClient();
        // Keep the last run's result in the database (Vercel keeps logs for 1 hour only).
        const record = async (result: Record<string, unknown>) => {
          await supabase
            .from("jfb_market_cache" as never)
            .upsert({ key: "cron:news-push", data: { ...result, at: new Date().toISOString() }, updated_at: new Date().toISOString() } as never, { onConflict: "key" });
        };

        const { data: subs, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth, tickers");
        if (error) return json({ error: error.message }, 500);
        if (!subs || subs.length === 0) {
          console.log("news-push: no subscribers");
          await record({ subscribers: 0, sent: 0 });
          return json({ sent: 0 });
        }

        const [{ quotes }, eurPerUsd] = await Promise.all([
          getStoredQuotes(KID_STOCKS.map((s) => s.ticker)),
          getEurPerUsd(),
        ]);
        // Sunday and Monday runs (only when started by hand) talk about Friday.
        const day = new Date().getUTCDay();
        const when = day === 0 || day === 1 ? "την Παρασκευή" : "χθες";

        let sent = 0;
        let removed = 0;
        let failed = 0;
        let skipped = 0;
        for (const sub of subs) {
          // The stock the child chose; older subscriptions without one follow Apple.
          const ticker = sub.tickers?.find((t: string) => KID_STOCKS.some((s) => s.ticker === t)) ?? "AAPL";
          const meta = KID_STOCKS.find((s) => s.ticker === ticker)!;
          const quote = quotes[ticker];
          if (!quote) {
            skipped++;
            continue;
          }
          const { title, body } = priceMessage(meta.name, quote.changePercent, quote.price * eurPerUsd, when);
          const payload = JSON.stringify({ title, body, url: "/stocks" });
          try {
            // web-push encrypts the payload (aes128gcm) and signs the VAPID JWT.
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh ?? "", auth: sub.auth ?? "" } },
              payload,
              { TTL: 86400 },
            );
            sent++;
          } catch (err) {
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 404 || status === 410) {
              // Only subscriptions the push service says are gone get removed.
              await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
              removed++;
            } else {
              failed++;
              console.error("push failed", status, err);
            }
          }
        }

        const result = { subscribers: subs.length, sent, removed, failed, skipped };
        console.log("news-push:", JSON.stringify(result));
        await record(result);
        return json(result);
      },
    },
  },
});
