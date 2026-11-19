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

// Daily job (see vercel.json, every day at 09:00 UTC). A founder whose startup
// still waits for today's decision gets a reminder; otherwise, Tuesday–Saturday
// (after each US trading day), a note about the stock the browser follows.
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

        // Close last month's startup season (prizes, badges); does nothing if already closed.
        const now = new Date();
        const lastSeason = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString().slice(0, 10);
        const { data: winners, error: seasonError } = await supabase.rpc("jfb_finalize_startup_season" as never, { p_season: lastSeason } as never);
        if (seasonError) console.error("news-push: season close failed", seasonError.message);
        else if (Number(winners) > 0) console.log("news-push: season closed", lastSeason, winners);

        // Give back pledges of funding rounds that ended without reaching their goal.
        const { data: refunds, error: roundError } = await supabase.rpc("jfb_settle_startup_rounds" as never, { p_startup_id: null } as never);
        if (roundError) console.error("news-push: round refunds failed", roundError.message);
        else if (Number(refunds) > 0) console.log("news-push: round pledges refunded", refunds);

        const { data: subs, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth, tickers, child_id");
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
        // Sunday and Monday have no new US trading day, so no stock note then
        // (a run started by hand on those days talks about Friday).
        const day = new Date().getUTCDay();
        const tradingNote = day >= 2 && day <= 6;
        const when = day === 0 || day === 1 ? "την Παρασκευή" : "χθες";

        // Startups of subscribed children that still wait for today's decision.
        const today = new Date().toISOString().slice(0, 10);
        const childIds = [...new Set(subs.map((s) => s.child_id).filter((id): id is string => Boolean(id)))];
        const waiting = new Map<string, { id: string; name: string; ceo_streak: number }>();
        if (childIds.length) {
          const { data: startups } = await supabase
            .from("startups")
            .select("id, name, child_id, ceo_streak, last_decision_date")
            .in("child_id", childIds);
          for (const st of startups ?? []) {
            if (!st.child_id || st.last_decision_date === today || waiting.has(st.child_id)) continue;
            waiting.set(st.child_id, { id: st.id, name: st.name, ceo_streak: st.ceo_streak });
          }
        }
        let reminders = 0;

        let sent = 0;
        let removed = 0;
        let failed = 0;
        let skipped = 0;
        for (const sub of subs) {
          let payload: string;
          const startup = sub.child_id ? waiting.get(sub.child_id) : undefined;
          if (startup) {
            payload = JSON.stringify({
              title: `📣 Η ${startup.name} σε χρειάζεται!`,
              body: startup.ceo_streak > 0
                ? `Η απόφαση της ημέρας σε περιμένει. Κράτα το σερί σου: 🔥 ${startup.ceo_streak}!`
                : "Η απόφαση της ημέρας σε περιμένει. Δες πώς πάει η εταιρεία σου!",
              url: `/startups/${startup.id}`,
            });
            reminders++;
          } else {
            // The stock the child chose; older subscriptions without one follow Apple.
            const ticker = sub.tickers?.find((t: string) => KID_STOCKS.some((s) => s.ticker === t)) ?? "AAPL";
            const meta = KID_STOCKS.find((s) => s.ticker === ticker)!;
            const quote = quotes[ticker];
            if (!tradingNote || !quote) {
              skipped++;
              continue;
            }
            const { title, body } = priceMessage(meta.name, quote.changePercent, quote.price * eurPerUsd, when);
            payload = JSON.stringify({ title, body, url: "/stocks" });
          }
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

        const result = { subscribers: subs.length, sent, reminders, removed, failed, skipped };
        console.log("news-push:", JSON.stringify(result));
        await record(result);
        return json(result);
      },
    },
  },
});
