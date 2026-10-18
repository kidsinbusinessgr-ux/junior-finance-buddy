/**
 * Junior Finance Buddy â Supabase data hooks
 * Import from "@/hooks/useJFB"
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// ââ Types ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Level helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export const XP_LEVELS = [0, 400, 1000, 1800, 3000, 5000] as const;
export const LEVEL_NAMES = [
  "ÎÏÏÎ¬ÏÎ¹Î¿Ï",
  "ÎÎ±Î¸Î·ÏÎ®Ï",
  "ÎÎ¹ÎºÏÏÏ ÎÏÎ¹ÏÎµÎ¹ÏÎ·Î¼Î±ÏÎ¯Î±Ï",
  "ÎÏÎµÎ½Î´ÏÏÎ®Ï",
  "ÎÎ¹ÎºÎ¿Î½Î¿Î¼Î¿Î»ÏÎ³Î¿Ï",
  "Î§ÏÎ·Î¼Î±ÏÎ¿Î´ÏÏÎ·Ï",
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

// ââ Auth helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Child profile ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Parent profile âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Children list (for parent) âââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Transactions âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Chores âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Chore submissions âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
      icon: "â",
    });
  }
}

// ââ Savings goals âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    description: `ÎÏÎ¿ÏÎ±Î¼Î¯ÎµÏÏÎ·: ${goalName}`,
    icon: "ð¯",
  });
}

// ââ Rewards âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    description: `ÎÏÎ±Î²ÎµÎ¯Î¿: ${rewardName}`,
    icon: "ð",
  });
}

// ââ Lesson progress âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
  // Upsert â if lesson already completed, skip
  const { error } = await supabase.from("jfb_lesson_progress").upsert(
    { child_id: childId, lesson_id: lessonId, lesson_title: lessonTitle, xp_earned: xpEarned, coins_earned: coinsEarned },
    { onConflict: "child_id,lesson_id", ignoreDuplicates: true }
  );
  if (!error) {
    await addTransaction({
      child_id: childId,
      type: "lesson",
      amount: coinsEarned,
      description: `ÎÎ¬Î¸Î·Î¼Î±: ${lessonTitle}`,
      icon: "ð",
    });
    // XP is added inside addTransaction via jfb_add_coins (xp = amount for lessons)
    // But we want xpEarned, not coinsEarned, for XP â call directly
    await supabase.rpc("jfb_add_coins", {
      p_child_id: childId,
      p_amount: 0,
      p_xp: xpEarned,
    });
  }
}

// ââ Stock holdings ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    description: `ÎÎ³Î¿ÏÎ¬ ${quantity} Î¼ÎµÏÎ¿ÏÏÎ½ ${companyName}`,
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
    description: `Î ÏÎ»Î·ÏÎ· ${quantity} Î¼ÎµÏÎ¿ÏÏÎ½ ${companyName}`,
    icon: emoji,
  });
}

// ââ Startup investments âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    description: `ÎÏÎ­Î½Î´ÏÏÎ· ÏÎµ ${startupName} (${quantity} Î¼ÎµÏÎ¯Î´Î¹Î±)`,
    icon: emoji,
  });
}

// ââ Parent: load coins manually âââââââââââââââââââââââââââââââââââââââââââââââ
export async function parentLoadCoins(childId: string, amount: number): Promise<void> {
  await addTransaction({
    child_id: childId,
    type: "deposit",
    amount,
    description: "Î¦ÏÏÏÏÏÎ· Î±ÏÏ Î³Î¿Î½Î­Î±",
    icon: "ð°",
  });
}

// ââ Onboarding helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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


// ââ Allowances ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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


// ââ Achievements ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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


// ââ Spending Analytics ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
        if (t.type === "allowance" || desc.includes("ÏÎ±ÏÏÎ¶Î¹Î»Î¯ÎºÎ¹") || desc.includes("allowance")) {
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
        { label: "Î§Î±ÏÏÎ¶Î¹Î»Î¯ÎºÎ¹", amount: sources.allowance, color: "oklch(0.65 0.2 292)" },
        { label: "ÎÎ¿ÏÎ»ÎµÎ¹Î­Ï", amount: sources.chore, color: "oklch(0.65 0.18 170)" },
        { label: "ÎÎ»Î»Î¿", amount: sources.other_in, color: "oklch(0.65 0.18 60)" },
      ].filter((s) => s.amount > 0),
    });
    setLoading(false);
  }, [childId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

// ── Streak ────────────────────────────────────────────────────────────────────
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
        // already visited today — no change
      } else if (last === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
        // visited yesterday — increment
        newStreak = newStreak + 1;
        await supabase
          .from("jfb_children")
          .update({ current_streak: newStreak, last_login_date: today })
          .eq("id", childId);
      } else {
        // gap — reset to 1
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
