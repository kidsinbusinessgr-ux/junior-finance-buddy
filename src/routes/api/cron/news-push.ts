import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createClient } from "@supabase/supabase-js";

const FMP_BASE = "https://financialmodelingprep.com/stable";

// Minimal VAPID JWT signing for web push
async function createVapidJWT(audience: string, subject: string, privateKeyB64u: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 86400, sub: subject };

  const b64u = (s: string) => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const encode = (obj: object) => b64u(JSON.stringify(obj));
  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the private key
  const rawPrivate = Uint8Array.from(atob(privateKeyB64u.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawPrivate,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64u = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${signingInput}.${sigB64u}`;
}

async function sendPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: object,
  vapidPublic: string,
  vapidPrivate: string
) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createVapidJWT(audience, "mailto:info@kidsinbusiness.gr", vapidPrivate);

  const payloadStr = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(payloadStr);

  // Send push (simplified - no encryption for now, using basic push)
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "TTL": "86400",
      "Authorization": `vapid t=${jwt},k=${vapidPublic}`,
    },
    body: payloadBytes,
  });
  return res.status;
}

export const APIRoute = createAPIFileRoute("/api/cron/news-push")({
  GET: async ({ request }) => {
    // Verify cron secret to prevent abuse
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const fmpKey = process.env.FMP_API_KEY;
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!fmpKey || !vapidPublic || !vapidPrivate) {
      return new Response(JSON.stringify({ error: "Missing env vars" }), { status: 500 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!
    );

    // Get all subscriptions
    const { data: subs } = await supabase.from("push_subscriptions").select("*");
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }));
    }

    // Fetch news for top tickers
    const tickers = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "META", "AMZN"];
    const newsRes = await fetch(
      `${FMP_BASE}/news/stock?symbols=${tickers.join(",")}&limit=3&apikey=${fmpKey}`,
      { headers: { Accept: "application/json" } }
    );

    if (!newsRes.ok) {
      return new Response(JSON.stringify({ error: "FMP news failed" }), { status: 500 });
    }

    const newsData = await newsRes.json();
    if (!Array.isArray(newsData) || newsData.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no news" }));
    }

    // Pick the most recent news item
    const topNews = newsData[0];
    const payload = {
      title: `📰 ${topNews.symbol || "Αγορά"} — Νέο άρθρο`,
      body: topNews.title?.slice(0, 120) || "Δες τα τελευταία νέα της αγοράς!",
      url: "/stocks",
    };

    let sent = 0;
    for (const sub of subs) {
      try {
        await sendPush(sub.endpoint, sub.p256dh, sub.auth, payload, vapidPublic, vapidPrivate);
        sent++;
      } catch {
        // Remove invalid subscriptions
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});
