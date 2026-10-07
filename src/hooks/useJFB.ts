/**
 * Junior Finance Buddy — Supabase data hooks
 * Import from "@/hooks/useJFB"
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Level helpers ────────────────────────────────────────────────────────────
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

// ── Auth helpers ─────────────────────────────────────────────────────────────
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

// ── Child profile ────────────────────────────────────────────────────────────
export function useChild() {
  const { userId } = useCurrentUser();
  const [child, setChild] = useState<JFBChild | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("jfb_children")
      .select("*")
      .eq("user_id", userId)
      .single();
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

// ── Parent profile ───────────────────────────────────────────────────────────
export function useParent() {
  const { userId } = useCurrentUser();
  const [parent, setParent] = useState<JFBParent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("jfb_parents")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        setParent(data);
        setLoading(false);
      });
  }, [userId]);

  return { parent, loading };
}

// ── Children list (for parent) ───────────────────────────────────────────────
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

// ── Transactions ─────────────────────────────────────────────────────────────
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

export async function addTransaction(
  tx: TablesInsert<"jfb_transactions">
): Promise<void> {
  await supabase.from("jfb_transactions").insert(tx);
  // Update child coins via DB function
  await supabase.rpc("jfb_add_coins", {
    p_child_id: tx.child_id,
    p_amount: tx.amount,
    p_xp: tx.type === "lesson" ? tx.amount : 0,
  });
}

// ── Chores ───────────────────────────────────────────────────────────────────
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

// ── Chore submissions ─────────────────────────────────────────────────────────
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
  status: "approved" | "rejected",
  childId: string,
  coins: number,
  choreName: string
): Promise<void> {
  await supabase
    .from("jfb_chore_submissions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);

  if (status === "approved") {
    await addTransaction({
      child_id: childId,
      type: "chore",
      amount: coins,
      description: choreName,
      icon: "✅",
    });
  }
}

// ── Savings goals ─────────────────────────────────────────────────────────────
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

export async function depositToGoal(
  goalId: string,
  childId: string,
  amount: number,
  goalName: string,
  currentSaved: number,
  targetCoins: number
): Promise<void> {
  const newSaved = Math.min(currentSaved + amount, targetCoins);
  const completed = newSaved >= targetCoins;

  await supabase
    .from("jfb_savings_goals")
    .update({ saved_coins: newSaved, completed })
    .eq("id", goalId);

  await addTransaction({
    child_id: childId,
    type: "withdrawal",
    amount: -amount,
    description: `Αποταμίευση: ${goalName}`,
    icon: "🎯",
  });
}

// ── Rewards ───────────────────────────────────────────────────────────────────
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

export async function approveRewardRequest(
  requestId: string,
  childId: string,
  cost: number,
  rewardName: string
): Promise<void> {
  await supabase
    .from("jfb_reward_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  await addTransaction({
    child_id: childId,
    type: "reward",
    amount: -cost,
    description: `Βραβείο: ${rewardName}`,
    icon: "🎁",
  });
}

// ── Lesson progress ───────────────────────────────────────────────────────────
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

export async function completeLesson(
  childId: string,
  lessonId: string,
  lessonTitle: string,
  xpEarned: number,
  coinsEarned: number
): Promise<void> {
  // Upsert — if lesson already completed, skip
  const { error } = await supabase.from("jfb_lesson_progress").upsert(
    { child_id: childId, lesson_id: lessonId, lesson_title: lessonTitle, xp_earned: xpEarned, coins_earned: coinsEarned },
    { onConflict: "child_id,lesson_id", ignoreDuplicates: true }
  );
  if (!error) {
    await addTransaction({
      child_id: childId,
      type: "lesson",
      amount: coinsEarned,
      description: `Μάθημα: ${lessonTitle}`,
      icon: "📚",
    });
    // XP is added inside addTransaction via jfb_add_coins (xp = amount for lessons)
    // But we want xpEarned, not coinsEarned, for XP — call directly
    await supabase.rpc("jfb_add_coins", {
      p_child_id: childId,
      p_amount: 0,
      p_xp: xpEarned,
    });
  }
}

// ── Stock holdings ────────────────────────────────────────────────────────────
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
  quantity: number,
  pricePerShare: number,
  currentShares: number,
  currentAvgPrice: number
): Promise<void> {
  const totalCost = quantity * pricePerShare;
  const newShares = currentShares + quantity;
  const newAvgPrice = currentShares === 0
    ? pricePerShare
    : Math.round(((currentShares * currentAvgPrice) + (quantity * pricePerShare)) / newShares);

  await supabase.from("jfb_stock_holdings").upsert({
    child_id: childId,
    ticker,
    company_name: companyName,
    emoji,
    shares: newShares,
    avg_buy_price: newAvgPrice,
    updated_at: new Date().toISOString(),
  }, { onConflict: "child_id,ticker" });

  await addTransaction({
    child_id: childId,
    type: "investment",
    amount: -totalCost,
    description: `Αγορά ${quantity} μετοχών ${companyName}`,
    icon: emoji,
  });
}

export async function sellStock(
  childId: string,
  ticker: string,
  companyName: string,
  emoji: string,
  quantity: number,
  pricePerShare: number,
  currentShares: number
): Promise<void> {
  const totalValue = quantity * pricePerShare;
  const newShares = Math.max(0, currentShares - quantity);

  if (newShares === 0) {
    await supabase.from("jfb_stock_holdings").delete()
      .eq("child_id", childId).eq("ticker", ticker);
  } else {
    await supabase.from("jfb_stock_holdings").update({
      shares: newShares,
      updated_at: new Date().toISOString(),
    }).eq("child_id", childId).eq("ticker", ticker);
  }

  await addTransaction({
    child_id: childId,
    type: "investment",
    amount: totalValue,
    description: `Πώληση ${quantity} μετοχών ${companyName}`,
    icon: emoji,
  });
}

// ── Startup investments ───────────────────────────────────────────────────────
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
  quantity: number,
  pricePerShare: number,
  currentShares: number
): Promise<void> {
  const totalCost = quantity * pricePerShare;

  await supabase.from("jfb_startup_investments").upsert({
    child_id: childId,
    startup_name: startupName,
    emoji,
    shares: currentShares + quantity,
    price_per_share: pricePerShare,
    invested_at: new Date().toISOString(),
  }, { onConflict: "child_id,startup_name" });

  await addTransaction({
    child_id: childId,
    type: "investment",
    amount: -totalCost,
    description: `Επένδυση σε ${startupName} (${quantity} μερίδια)`,
    icon: emoji,
  });
}

// ── Parent: load coins manually ───────────────────────────────────────────────
export async function parentLoadCoins(childId: string, amount: number): Promise<void> {
  await addTransaction({
    child_id: childId,
    type: "deposit",
    amount,
    description: "Φόρτωση από γονέα",
    icon: "💰",
  });
}

// ── Onboarding helpers ────────────────────────────────────────────────────────
export async function createParentProfile(userId: string, name: string): Promise<JFBParent | null> {
  const { data, error } = await supabase
    .from("jfb_parents")
    .insert({ user_id: userId, name })
    .select()
    .single();
  if (error || !data) return null;

  // Seed default chores
  await supabase.rpc("jfb_seed_default_chores", { p_parent_id: data.id });
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
