import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// What the child makes in a lesson's workshop, kept in the account
// (jfb_lesson_work, one row per login and workshop) and on this device.
// Signed in, the account's copy wins; the first time, the device copy moves
// into the account. Each change is saved a moment later, with no button.
// Not signed in, it is kept on this device only.

export function useLessonWork<T>(workshop: string, empty: T, parse: (raw: unknown) => T) {
  const key = `kib-work-${workshop}`;
  const [data, setData] = useState<T>(empty);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const parseRef = useRef(parse);
  parseRef.current = parse;

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setData(parseRef.current(JSON.parse(raw)));
    } catch {
      /* no device copy */
    }
    setLoaded(true);
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      const { data: row } = await supabase
        .from("jfb_lesson_work" as never)
        .select("data")
        .eq("user_id", user.id)
        .eq("workshop", workshop)
        .maybeSingle();
      if (cancelled) return;
      const r = row as { data: unknown } | null;
      if (r && r.data && Object.keys(r.data as object).length > 0) setData(parseRef.current(r.data));
      setUserId(user.id);
    });
    return () => {
      cancelled = true;
    };
  }, [key, workshop]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* full or private mode: the account still keeps it */
    }
    if (!userId) return;
    setSaved("saving");
    const t = setTimeout(async () => {
      const { error } = await supabase
        .from("jfb_lesson_work" as never)
        .upsert({ user_id: userId, workshop, data, updated_at: new Date().toISOString() } as never, { onConflict: "user_id,workshop" });
      setSaved(error ? "error" : "saved");
    }, 800);
    return () => clearTimeout(t);
  }, [data, loaded, userId, key, workshop]);

  return { data, setData, signedIn: Boolean(userId), saved };
}
