/**
 * Junior Finance Buddy Ã¢ÂÂ Supabase data hooks
 * Import from "@/hooks/useJFB"
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// Ã¢ÂÂÃ¢ÂÂ Types Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export type JFBChild = Tables<"jfb_children">;
export type JFBParent = Tables<"jfb_parents">;
export type JFBTransaction = Tables<"jfb_transactions">;
export type JFBChore = Tables<"jfb_chores">;
export type JFBChoreSubmission = Tables<"jfb_chore_submissions">;
export type JFBSavingsGoal = Tables<"jfb_savings_goals">;
export type JFBReward = Tables<"jfb_rewards">;
export type JFBRewardRequest = Tables<"jfb_reward_requests">;
export type JFBLessonProgress = Tables<"jfb_lesson_progress">;
export type JFBStockHolding = Tables<"jfb_stock_holdings">;
export type JFBStartupInvestment = Tables<"jfb_startup_investments">;

// Ã¢ÂÂÃ¢ÂÂ Level helpers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export const XP_LEVELS = [0, 400, 1000, 1800, 3000, 5000] as const;
export const LEVEL_NAMES = [
  "Αρχάριος",
  "Μαθητής",
  "Μικρός Επιχειρηματίας",
  "Επενδυτής",
  "Οικονομολόγος",
  "Χρηματοδότης",
] as const;

export function xpToLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) level = i + 1;
  }
  return Math.min(level, 6);
}

export function xpForNextLevel(xp: number): { current: number; next: number; pct: number } {
  const level = xpToLevel(xp);
  const current = XP_LEVELS[level - 1] ?? 0;
  const next = XP_LEVELS[level] ?? XP_LEVELS[XP_LEVELS.length - 1];
  const pct = next === current ? 100 : Math.round(((xp - current) / (next - current)) * 100);
  return { current, next, pct };
}

// Ã¢ÂÂÃ¢ÂÂ Auth helpers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { userId, loading };
}

// Ã¢ÂÂÃ¢ÂÂ Child profile Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// ── Invite codes ──────────────────────────────────────────────────────────────
/** Child's first name if the invite code is valid and unused, else null. Works logged out. */
export async function checkInviteCode(code: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("jfb_check_invite", { p_code: code });
  if (error) return null;
  return (data as string | null) ?? null;
}

/** Links the signed-in account to the child row for this invite code. */
export async function claimInviteCode(code: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)("jfb_claim_invite", { p_code: code });
  if (error) throw new Error(error.message);
}

/**
 * After email confirmation the child is signed in but not linked yet: the code
 * was saved in their sign-up metadata. Links it once; returns true if it did.
 */
export async function claimPendingInvite(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  const code = data.user?.user_metadata?.["invite_code"] as string | undefined;
  if (!code) return false;
  try {
    await claimInviteCode(code);
    return true;
  } catch {
    return false;
  }
}

export function useChild() {
  const { userId } = useCurrentUser();
  const [child, setChild] = useState<JFBChild | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const load = () =>
      supabase.from("jfb_children").select("*").eq("user_id", userId).maybeSingle();
    let { data } = await load();
    if (!data && (await claimPendingInvite())) {
      ({ data } = await load());
    }
    setChild(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!child?.id) return;
    const channel = supabase
      .channel(`child-${child.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "jfb_children",
        filter: `id=eq.${child.id}`,
      }, (payload) => setChild(payload.new as JFBChild))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [child?.id]);

  return { child, loading, refetch: fetch };
}

// Ã¢ÂÂÃ¢ÂÂ Children list (for parent) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useChildren(parentId: string | null | undefined) {
  const [children, setChildren] = useState<JFBChild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) return;
    supabase
      .from("jfb_children")
      .select("*")
      .eq("parent_id", parentId)
      .then(({ data }) => {
        setChildren(data ?? []);
        setLoading(false);
      });
  }, [parentId]);

  return { children, loading };
}

// Ã¢ÂÂÃ¢ÂÂ Transactions Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useTransactions(childId: string | null | undefined) {
  const [transactions, setTransactions] = useState<JFBTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    supabase
      .from("jfb_transactions")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTransactions(data ?? []);
        setLoading(false);
      });
  }, [childId]);

  return { transactions, loading };
}

// All coin changes go through SECURITY DEFINER functions in Supabase
// (see supabase/migrations/20261111120000_secure_coin_functions.sql).
// They check who is calling and read prices/amounts from the database.
async function callRpc(fn: string, args: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.rpc as any)(fn, args);
  if (error) throw new Error(error.message);
}

// Ã¢ÂÂÃ¢ÂÂ Chores Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useChores(parentId: string | null | undefined) {
  const [chores, setChores] = useState<JFBChore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!parentId) return;
    const { data } = await supabase
      .from("jfb_chores")
      .select("*")
      .eq("parent_id", parentId)
      .eq("active", true)
      .order("is_obligatory", { ascending: false });
    setChores(data ?? []);
    setLoading(false);
  }, [parentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { chores, loading, refetch: fetch };
}

// Ã¢ÂÂÃ¢ÂÂ Chore submissions Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useChoreSubmissions(childId: string | null | undefined) {
  const [submissions, setSubmissions] = useState<JFBChoreSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("jfb_chore_submissions")
      .select("*")
      .eq("child_id", childId)
      .order("submitted_at", { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { submissions, loading, refetch: fetch };
}

export async function submitChore(choreId: string, childId: string): Promise<void> {
  await supabase.from("jfb_chore_submissions").insert({
    chore_id: choreId,
    child_id: childId,
    status: "pending",
  });
}

export async function reviewChore(
  submissionId: string,
  status: "approved" | "rejected"
): Promise<void> {
  if (status === "approved") {
    await callRpc("jfb_approve_chore", { p_submission_id: submissionId });
    return;
  }
  await supabase
    .from("jfb_chore_submissions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId)
    .eq("status", "pending");
}

// Ã¢ÂÂÃ¢ÂÂ Savings goals Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useSavingsGoals(childId: string | null | undefined) {
  const [goals, setGoals] = useState<JFBSavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("jfb_savings_goals")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false });
    setGoals(data ?? []);
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { goals, loading, refetch: fetch };
}

export async function createSavingsGoal(
  childId: string,
  name: string,
  emoji: string,
  targetCoins: number
): Promise<void> {
  await supabase.from("jfb_savings_goals").insert({
    child_id: childId,
    name,
    emoji,
    target_coins: targetCoins,
  });
}

export async function depositToGoal(goalId: string, amount: number): Promise<void> {
  await callRpc("jfb_deposit_to_goal", { p_goal_id: goalId, p_amount: amount });
}

// Ã¢ÂÂÃ¢ÂÂ Rewards Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useRewards(parentId: string | null | undefined) {
  const [rewards, setRewards] = useState<JFBReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) return;
    supabase
      .from("jfb_rewards")
      .select("*")
      .eq("parent_id", parentId)
      .eq("active", true)
      .then(({ data }) => {
        setRewards(data ?? []);
        setLoading(false);
      });
  }, [parentId]);

  return { rewards, loading };
}

export function useRewardRequests(childId: string | null | undefined) {
  const [requests, setRequests] = useState<JFBRewardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("jfb_reward_requests")
      .select("*")
      .eq("child_id", childId)
      .order("requested_at", { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { requests, loading, refetch: fetch };
}

export async function requestReward(rewardId: string, childId: string): Promise<void> {
  await supabase.from("jfb_reward_requests").insert({
    reward_id: rewardId,
    child_id: childId,
    status: "pending",
  });
}

export async function approveRewardRequest(requestId: string): Promise<void> {
  await callRpc("jfb_approve_reward", { p_request_id: requestId });
}

// Ã¢ÂÂÃ¢ÂÂ Lesson progress Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useLessonProgress(childId: string | null | undefined) {
  const [progress, setProgress] = useState<JFBLessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    supabase
      .from("jfb_lesson_progress")
      .select("*")
      .eq("child_id", childId)
      .then(({ data }) => {
        setProgress(data ?? []);
        setLoading(false);
      });
  }, [childId]);

  return { progress, loading };
}

/**
 * Saves a finished lesson quiz and awards XP for the child's best score
 * (jfb_complete_lesson, which fixes the max XP per lesson). Returns the XP
 * added now: 0 when this score doesn't beat an earlier attempt.
 */
export async function completeLesson(
  childId: string, lessonId: string, lessonTitle: string, score: number, total: number,
): Promise<number> {
  const { data, error } = await (supabase.rpc as any)("jfb_complete_lesson", {
    p_child_id: childId,
    p_lesson_id: lessonId,
    p_lesson_title: lessonTitle,
    p_score: score,
    p_total: total,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

// Ã¢ÂÂÃ¢ÂÂ Stock holdings Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useStockHoldings(childId: string | null | undefined) {
  const [holdings, setHoldings] = useState<JFBStockHolding[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("jfb_stock_holdings")
      .select("*")
      .eq("child_id", childId);
    setHoldings(data ?? []);
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { holdings, loading, refetch: fetch };
}

export async function buyStock(
  childId: string,
  ticker: string,
  companyName: string,
  emoji: string,
  quantity: number
): Promise<void> {
  await callRpc("jfb_trade_stock", {
    p_child_id: childId, p_ticker: ticker, p_company: companyName,
    p_emoji: emoji, p_quantity: quantity, p_side: "buy",
  });
}

export async function sellStock(
  childId: string,
  ticker: string,
  companyName: string,
  emoji: string,
  quantity: number
): Promise<void> {
  await callRpc("jfb_trade_stock", {
    p_child_id: childId, p_ticker: ticker, p_company: companyName,
    p_emoji: emoji, p_quantity: quantity, p_side: "sell",
  });
}

// Ã¢ÂÂÃ¢ÂÂ Startup investments Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export function useStartupInvestments(childId: string | null | undefined) {
  const [investments, setInvestments] = useState<JFBStartupInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("jfb_startup_investments")
      .select("*")
      .eq("child_id", childId);
    setInvestments(data ?? []);
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { investments, loading, refetch: fetch };
}

export async function investInStartup(
  childId: string,
  startupName: string,
  emoji: string,
  quantity: number
): Promise<void> {
  await callRpc("jfb_invest_startup", {
    p_child_id: childId, p_startup_name: startupName, p_emoji: emoji, p_quantity: quantity,
  });
}

// Ã¢ÂÂÃ¢ÂÂ Parent: load coins manually Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export async function parentLoadCoins(childId: string, amount: number): Promise<void> {
  await callRpc("jfb_parent_give_coins", { p_child_id: childId, p_amount: amount, p_note: "Φόρτωση από γονέα" });
}

// Ã¢ÂÂÃ¢ÂÂ Onboarding helpers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export async function createParentProfile(userId: string, name: string): Promise<JFBParent | null> {
  const { data, error } = await supabase
    .from("jfb_parents")
    .insert({ user_id: userId, name })
    .select()
    .single();
  if (error || !data) return null;

  // Default chores are added by the database (trigger on jfb_parents).
  return data;
}

export async function createChildProfile(
  userId: string,
  parentId: string,
  name: string
): Promise<JFBChild | null> {
  const { data } = await supabase
    .from("jfb_children")
    .insert({ user_id: userId, parent_id: parentId, name })
    .select()
    .single();
  return data;
}



function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function addFirstChild(
  parentId: string, name: string, avatar: string
): Promise<JFBChild> {
  const invite_code = generateInviteCode();
  const { data, error } = await supabase
    .from("jfb_children")
    .insert({ parent_id: parentId, name, avatar, invite_code })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create child");
  return data;
}

// Ã¢ÂÂÃ¢ÂÂ Allowances Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export type JFBAllowance = Tables<"jfb_allowances">;

export function useAllowances(
  parentId: string | null | undefined,
  childId: string | null | undefined
) {
  const [allowance, setAllowance] = useState<JFBAllowance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllowance = useCallback(async () => {
    if (!parentId || !childId) { setLoading(false); return; }
    const { data } = await supabase
      .from("jfb_allowances")
      .select("*")
      .eq("parent_id", parentId)
      .eq("child_id", childId)
      .maybeSingle();
    setAllowance(data ?? null);
    setLoading(false);
  }, [parentId, childId]);

  useEffect(() => { fetchAllowance(); }, [fetchAllowance]);

  return { allowance, loading, refetch: fetchAllowance };
}

export async function upsertAllowance(
  parentId: string,
  childId: string,
  amountCoins: number,
  dayOfWeek: number,
  active: boolean,
  existingId?: string
): Promise<void> {
  if (existingId) {
    await supabase
      .from("jfb_allowances")
      .update({ amount_coins: amountCoins, day_of_week: dayOfWeek, active, updated_at: new Date().toISOString() })
      .eq("id", existingId);
  } else {
    await supabase.from("jfb_allowances").insert({
      parent_id: parentId,
      child_id: childId,
      amount_coins: amountCoins,
      day_of_week: dayOfWeek,
      active,
    });
  }
}

export async function deleteAllowance(id: string): Promise<void> {
  await supabase.from("jfb_allowances").delete().eq("id", id);
}


// Ã¢ÂÂÃ¢ÂÂ Achievements Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export type JFBAchievement = {
  key: string;
  name_gr: string;
  description_gr: string;
  icon: string;
  sort_order: number;
};

export function useAchievements(childId: string | null | undefined) {
  const [earned, setEarned] = useState<{ badge_key: string; earned_at: string }[]>([]);
  const [all, setAll] = useState<JFBAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!childId) { setLoading(false); return; }
    const [{ data: allBadges }, { data: earnedBadges }] = await Promise.all([
      supabase.from("jfb_achievements").select("*").order("sort_order"),
      supabase
        .from("jfb_child_achievements")
        .select("badge_key, earned_at")
        .eq("child_id", childId),
    ]);
    setAll((allBadges ?? []) as JFBAchievement[]);
    setEarned((earnedBadges ?? []) as { badge_key: string; earned_at: string }[]);
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  return { earned, all, loading, refetch: fetchAchievements };
}


// Ã¢ÂÂÃ¢ÂÂ Spending Analytics Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
export type SpendingSource = {
  label: string;
  amount: number;
  color: string;
};

export type SpendingStats = {
  totalIn: number;
  totalOut: number;
  savingsRate: number;
  bySource: SpendingSource[];
  monthLabel: string;
};

export function useSpendingAnalytics(childId: string | null | undefined) {
  const [stats, setStats] = useState<SpendingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!childId) { setLoading(false); return; }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthLabel = now.toLocaleDateString("el-GR", { month: "long", year: "numeric" });

    const { data } = await supabase
      .from("jfb_transactions")
      .select("amount, type, description")
      .eq("child_id", childId)
      .gte("created_at", startOfMonth);

    if (!data) { setLoading(false); return; }

    let totalIn = 0;
    let totalOut = 0;
    const sources: Record<string, number> = { allowance: 0, chore: 0, other_in: 0 };

    for (const t of data) {
      if (t.amount > 0) {
        totalIn += t.amount;
        const desc = (t.description ?? "").toLowerCase();
        if (t.type === "allowance" || desc.includes("ÃÂÃÂ±ÃÂÃÂÃÂ¶ÃÂ¹ÃÂ»ÃÂ¯ÃÂºÃÂ¹") || desc.includes("allowance")) {
          sources.allowance += t.amount;
        } else if (t.type === "chore_payment") {
          sources.chore += t.amount;
        } else {
          sources.other_in += t.amount;
        }
      } else {
        totalOut += Math.abs(t.amount);
      }
    }

    const savingsRate = totalIn > 0 ? Math.round(((totalIn - totalOut) / totalIn) * 100) : 0;

    setStats({
      totalIn,
      totalOut,
      savingsRate,
      monthLabel,
      bySource: [
        { label: "ÃÂ§ÃÂ±ÃÂÃÂÃÂ¶ÃÂ¹ÃÂ»ÃÂ¯ÃÂºÃÂ¹", amount: sources.allowance, color: "oklch(0.65 0.2 292)" },
        { label: "ÃÂÃÂ¿ÃÂÃÂ»ÃÂµÃÂ¹ÃÂ­ÃÂ", amount: sources.chore, color: "oklch(0.65 0.18 170)" },
        { label: "ÃÂÃÂ»ÃÂ»ÃÂ¿", amount: sources.other_in, color: "oklch(0.65 0.18 60)" },
      ].filter((s) => s.amount > 0),
    });
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

// ââ Streak ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export function useStreak(childId: string | null | undefined) {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    if (!childId) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

      // Read current values
      const { data: child } = await supabase
        .from("jfb_children")
        .select("current_streak, last_login_date")
        .eq("id", childId)
        .single();

      if (!child) return;

      const last = child.last_login_date as string | null;

      let newStreak = child.current_streak as number;

      if (last === today) {
        // already visited today â no change
      } else if (last === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
        // visited yesterday â increment
        newStreak = newStreak + 1;
        await supabase
          .from("jfb_children")
          .update({ current_streak: newStreak, last_login_date: today })
          .eq("id", childId);
      } else {
        // gap â reset to 1
        newStreak = 1;
        await supabase
          .from("jfb_children")
          .update({ current_streak: 1, last_login_date: today })
          .eq("id", childId);
      }

      setStreak(newStreak);
    })();
  }, [childId]);

  return streak;
}

// ─── Parent hooks ─────────────────────────────────────────────────────────────

export function useParent() {
  const [parent, setParent] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("jfb_parents").select("id, name").eq("user_id", user.id).single().then(({ data }) => setParent(data));
    });
  }, []);
  return parent;
}

export interface ParentChild { id: string; name: string; avatar: string; coins: number; xp: number; level: number; current_streak: number; }

export function useParentChildren(parentId: string | null | undefined) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const refresh = useCallback(async () => {
    if (!parentId) return;
    const { data } = await supabase.from("jfb_children").select("id, name, avatar, coins, xp, level, current_streak").eq("parent_id", parentId).order("name");
    setChildren(data ?? []);
  }, [parentId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { children, refresh };
}

export interface PendingSubmission { id: string; child_id: string; chore_id: string; submitted_at: string; jfb_chores: { name: string; emoji: string; coins: number } | null; jfb_children: { name: string; avatar: string } | null; }

export function usePendingSubmissions(parentId: string | null | undefined) {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const refresh = useCallback(async () => {
    if (!parentId) return;
    const { data: cr } = await supabase.from("jfb_children").select("id").eq("parent_id", parentId);
    const ids = (cr ?? []).map((c: { id: string }) => c.id);
    if (!ids.length) { setSubmissions([]); return; }
    const { data } = await supabase.from("jfb_chore_submissions").select("id, child_id, chore_id, submitted_at, jfb_chores(name, emoji, coins), jfb_children(name, avatar)").in("child_id", ids).eq("status", "pending").order("submitted_at", { ascending: false });
    setSubmissions((data as PendingSubmission[]) ?? []);
  }, [parentId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { submissions, refresh };
}

export async function approveChoreSubmission(subId: string) {
  await callRpc("jfb_approve_chore", { p_submission_id: subId });
}

export async function rejectChoreSubmission(subId: string, childId: string, choreName: string) {
  const { data } = await supabase.from("jfb_chore_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", subId).eq("status", "pending").select("id");
  if (!data || data.length === 0) return;
  await supabase.from("jfb_notifications").insert({ child_id: childId, type: "chore_rejected", message: "❌ " + choreName + " δεν εγκρίθηκε. Προσπάθησε ξανά!" });
}

export async function sendAllowanceCoins(childId: string, coins: number, note: string) {
  await callRpc("jfb_parent_give_coins", { p_child_id: childId, p_amount: coins, p_note: note });
}

// ── Notifications ─────────────────────────────────────────────────────────────────────────────────

export interface JFBNotification {
  id: string;
  child_id: string;
  type: "chore_approved" | "chore_rejected" | "allowance_received";
  message: string;
  read: boolean;
  created_at: string;
}

export function useChildNotifications(childId: string | null) {
  const [notifications, setNotifications] = useState<JFBNotification[]>([]);

  useEffect(() => {
    if (!childId) return;

    supabase
      .from("jfb_notifications")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data as JFBNotification[]);
      });

    const channel = supabase
      .channel("notifications:" + childId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "jfb_notifications",
          filter: "child_id=eq." + childId,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as JFBNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount };
}

export async function markNotificationRead(id: string) {
  await supabase.from("jfb_notifications").update({ read: true }).eq("id", id);
}


// ── Subscription / paid tier ──────────────────────────────────────────────────────────────────────────────────
// Checks the Supabase auth user's app_metadata for subscription_tier.
// Set by activatePremium (src/lib/stripe.functions.ts). To mark a user as paid by hand:
//   UPDATE auth.users SET raw_app_meta_data =
//   raw_app_meta_data || '{"subscription_tier":"paid"}' WHERE id = '<uid>';
export function useSubscription() {
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // app_metadata can only be set server-side (see activatePremium), unlike user_metadata.
    supabase.auth.getUser().then(({ data }) => {
      const tier = data.user?.app_metadata?.subscription_tier as string | undefined;
      setIsPaid(tier === "paid" || tier === "premium");
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      const tier = session?.user?.app_metadata?.subscription_tier as string | undefined;
      setIsPaid(tier === "paid" || tier === "premium");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { isPaid, loading };
}
