import { createFileRoute } from "@tanstack/react-router";

const FMP_BASE = "https://financialmodelingprep.com/stable";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Daily job (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export const Route = createFileRoute("/api/cron/news-push")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env["CRON_SECRET"];
        // Fail closed: without a secret configured, nobody can trigger this.
        if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const fmpKey = process.env["FMP_API_KEY"];
        const vapidPublic = process.env["VAPID_PUBLIC_KEY"];
        const vapidPrivate = process.env["VAPID_PRIVATE_KEY"];
        if (!fmpKey || !vapidPublic || !vapidPrivate) return json({ error: "Missing env vars" }, 500);

        const { getAdminClient } = await import("@/lib/supabase-admin.server");
        // web-push only has named exports (no default), so use the module itself.
        const webpush = await import("web-push");
        webpush.setVapidDetails("mailto:info@kidsinbusiness.gr", vapidPublic, vapidPrivate);

        const supabase = getAdminClient();
        const { data: subs, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
        if (error) return json({ error: error.message }, 500);
        if (!subs || subs.length === 0) return json({ sent: 0 });

        const tickers = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "META", "AMZN"];
        const newsRes = await fetch(
          `${FMP_BASE}/news/stock?symbols=${tickers.join(",")}&limit=3&apikey=${fmpKey}`,
          { headers: { Accept: "application/json" } },
        );
        if (!newsRes.ok) return json({ error: "FMP news failed" }, 502);
        const newsData = await newsRes.json();
        if (!Array.isArray(newsData) || newsData.length === 0) return json({ sent: 0, reason: "no news" });

        const top = newsData[0];
        const payload = JSON.stringify({
          title: `📰 ${top.symbol || "Αγορά"} — Νέο άρθρο`,
          body: top.title?.slice(0, 120) || "Δες τα τελευταία νέα της αγοράς!",
          url: "/stocks",
        });

        let sent = 0;
        let removed = 0;
        let failed = 0;
        for (const sub of subs) {
          try {
            // web-push encrypts the payload (aes128gcm) and signs the VAPID JWT.
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
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

        return json({ sent, removed, failed });
      },
    },
  },
});
