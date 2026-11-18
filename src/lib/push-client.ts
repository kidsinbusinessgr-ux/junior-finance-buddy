// Browser side of the daily notifications (stock note and founder reminder).
import { supabase } from "@/integrations/supabase/client";

// Public half of the server's push key pair (VAPID_PUBLIC_KEY on Vercel); must match it.
export const VAPID_PUBLIC = "BJkiC8Pupl55Cio9Bc7lEctrtQum413E7eMmWCRkCuBDwclVSud9uvsuatBAq3EPMciO4EWpt-3MJA37pTYpk1k";

// The server key a browser subscription was made with, in the same base64url form.
export function subscriptionKey(sub: PushSubscription): string {
  const key = sub.options.applicationServerKey;
  if (!key) return "";
  return btoa(String.fromCharCode(...new Uint8Array(key)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Saves the subscription on the server. With a signed-in child it is linked to
// them (for founder reminders); `ticker` sets which stock the daily note is about.
export async function saveSubscription(sub: PushSubscription, ticker?: string) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ subscription: sub.toJSON(), ...(ticker ? { ticker } : {}) }),
  });
  if (!res.ok) throw new Error("subscribe failed: " + res.status);
}

export type PushState = "subscribed" | "denied" | "error" | "unsupported";

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// Asks for permission if needed and subscribes this browser.
export async function subscribeThisBrowser(ticker?: string): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC });
    await saveSubscription(sub, ticker);
    return "subscribed";
  } catch (err) {
    console.error("Push subscribe error:", err);
    return Notification.permission === "denied" ? "denied" : "error";
  }
}

// Whether this browser already has a working subscription (made with the current key).
export async function hasSubscription(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return Boolean(sub && subscriptionKey(sub) === VAPID_PUBLIC);
}
