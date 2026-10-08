import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen, Home, Target, TrendingUp, Wallet,
  Zap, Check, ChevronRight, Bell, Trophy, Star, PiggyBank,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  useChild,
  useTransactions,
  useSavingsGoals,
  useChores,
  useChoreSubmissions,
  submitChore,
  xpForNextLevel,
  LEVEL_NAMES,
} from "@/hooks/useJFB";

export const Route = createFileRoute("/child-dashboard")({
  head: () => ({
    meta: [
      { title: "Αρχική — Kids in Business" },
      { name: "description", content: "Το dashboard σου στο Kids in Business" },
    ],
  }),
  component: ChildDashboard,
});

const bottomNav = [
  { label: "Αρχική", to: "/child-dashboard" as const, icon: Home },
  { label: "Μάθε", to: "/learn" as const, icon: BookOpen },
  { label: "Πορτοφόλι", to: "/wallet" as const, icon: Wallet },
  { label: "Στόχοι", to: "/goals" as const, icon: Target },
  { label: "Επενδύσεις", to: "/investments" as const, icon: TrendingUp },
];

function ChildDashboard() {
  const navigate = useNavigate();
  const { child, loading: childLoading } = useChild();
  const { transactions } = useTransactions(child?.id);
  const { goals } = useSavingsGoals(child?.id);
  const { chores } = useChores(child?.parent_id);
  const { submissions, refetch: refetchSubmissions } = useChoreSubmissions(child?.id);

  const [selectedChores, setSelectedChores] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Auth guard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/login" });
    });
  }, [navigate]);

  // Redirect to onboarding if no profile yet
  useEffect(() => {
    if (!childLoading && !child) navigate({ to: "/onboarding" });
  }, [childLoading, child, navigate]);

  if (childLoading || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.98 0.01 292)" }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🪙</div>
          <p className="font-bold text-gray-400">Φόρτωση…</p>
        </div>
      </div>
    );
  }

  // XP progress
  const { next: xpNext, pct: xpPct } = xpForNextLevel(child.xp);
  const levelName = LEVEL_NAMES[child.level - 1] ?? "Αρχάριος";

  // First active savings goal
  const activeGoal = goals.find((g) => !g.completed);

  // Extra chores not yet submitted today
  const pendingSubmissionIds = submissions
    .filter((s) => s.status === "pending")
    .map((s) => s.chore_id);

  const extraChores = chores.filter(
    (c) => !c.is_obligatory && !pendingSubmissionIds.includes(c.id)
  );
  const obligatoryChores = chores.filter((c) => c.is_obligatory);

  async function handleSubmitChores() {
    if (!child || selectedChores.length === 0) return;
    setSubmitting(true);
    await Promise.all(selectedChores.map((id) => submitChore(id, child.id)));
    setSelectedChores([]);
    await refetchSubmissions();
    setSubmitting(false);
  }

  // Recent transactions (last 3)
  const recentTx = transactions.slice(0, 3);

  const txIcon: Record<string, string> = {
    lesson: "📚",
    chore: "✅",
    investment: "📈",
    reward: "🎁",
    deposit: "💰",
    withdrawal: "🎯",
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <section className="bg-primary px-5 pb-10 pt-6 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black tracking-tight">
              <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-base leading-none text-primary-foreground mr-1">
                ∞
              </span>
              Kids in Business
            </span>
            <button className="relative grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.46_0.18_292)] text-primary-foreground">
              <Bell size={18} />
              {(extraChores.length > 0 || pendingSubmissionIds.length > 0) && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-[10px] font-black">
                  {extraChores.length}
                </span>
              )}
            </button>
          </div>

          <div className="mt-8">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[oklch(0.86_0.1_292)]">
              Καλημέρα 👋
            </p>
            <h1 className="mt-1 text-4xl font-black">{child.name}!</h1>

            {/* Coins + Level */}
            <div className="mt-6 flex items-end gap-5">
              <div className="rounded-2xl bg-[oklch(0.46_0.18_292)] px-5 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">KidsCoins</p>
                <p className="mt-1 text-4xl font-black">🪙 {child.coins}</p>
              </div>
              <div className="flex-1 rounded-2xl bg-[oklch(0.46_0.18_292)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">
                    Επίπεδο {child.level}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-black text-[oklch(0.86_0.1_292)]">
                    <Zap size={12} /> {child.xp}/{xpNext} XP
                  </span>
                </div>
                <p className="mt-1 text-sm font-black">{levelName}</p>
                <Progress value={xpPct} className="mt-2 h-2 bg-[oklch(0.36_0.13_292)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-xl px-5 sm:px-8">

        {/* Pending chores from parent */}
        {extraChores.length > 0 && (
          <section className="mt-6 rounded-2xl bg-[oklch(0.95_0.08_51)] p-5 ring-1 ring-[oklch(0.85_0.14_51)]">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[oklch(0.55_0.18_37)]" />
              <p className="text-sm font-black text-[oklch(0.35_0.12_37)]">
                {extraChores.length} διαθέσιμες πληρωμένες δουλειές!
              </p>
            </div>
            <div className="mt-3 grid gap-2">
              {extraChores.slice(0, 3).map((chore) => (
                <button
                  key={chore.id}
                  onClick={() =>
                    setSelectedChores((d) =>
                      d.includes(chore.id) ? d.filter((x) => x !== chore.id) : [...d, chore.id]
                    )
                  }
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
                        selectedChores.includes(chore.id)
                          ? "border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedChores.includes(chore.id) && <Check size={14} />}
                    </span>
                    <div>
                      <span
                        className={`text-sm font-bold ${
                          selectedChores.includes(chore.id) ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {chore.name}
                      </span>
                      <span className="ml-2 rounded-full bg-[oklch(0.88_0.1_292)] px-2 py-0.5 text-[10px] font-black text-[oklch(0.36_0.18_292)]">
                        ΕΞΤΡΑ
                      </span>
                    </div>
                  </span>
                  <span className="text-sm font-black text-[oklch(0.55_0.18_37)]">
                    +{chore.coins} 🪙
                  </span>
                </button>
              ))}
            </div>
            {selectedChores.length > 0 && (
              <Button
                onClick={handleSubmitChores}
                disabled={submitting}
                className="mt-3 h-10 w-full rounded-full text-sm"
              >
                {submitting ? "…" : `Στείλε για έγκριση (${selectedChores.length})`}
              </Button>
            )}
          </section>
        )}

        {/* Pending submissions waiting */}
        {pendingSubmissionIds.length > 0 && (
          <section className="mt-4 rounded-2xl bg-[oklch(0.95_0.04_292)] p-4 ring-1 ring-[oklch(0.85_0.05_292)]">
            <p className="text-sm font-black text-gray-600">
              ⏳ {pendingSubmissionIds.length} δουλειές αναμένουν έγκριση γονέα…
            </p>
          </section>
        )}

        {/* Savings Goal */}
        {activeGoal && (
          <section className="mt-6 rounded-2xl bg-[oklch(0.76_0.15_173)] p-5 text-[oklch(0.17_0.065_195)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.35_0.12_175)]">
                  Στόχος αποταμίευσης
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {activeGoal.emoji} {activeGoal.name}
                </h2>
              </div>
              <PiggyBank size={24} className="text-[oklch(0.35_0.12_175)]" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-black">🪙 {activeGoal.saved_coins}</p>
              <p className="pb-1 font-bold text-[oklch(0.35_0.12_175)]">
                από {activeGoal.target_coins}
              </p>
            </div>
            <Progress
              value={Math.round((activeGoal.saved_coins / activeGoal.target_coins) * 100)}
              className="mt-2 h-3 bg-[oklch(0.95_0.08_105)]"
            />
            <p className="mt-2 text-sm font-bold">
              {Math.round((activeGoal.saved_coins / activeGoal.target_coins) * 100)}% εκεί! Λείπουν{" "}
              {activeGoal.target_coins - activeGoal.saved_coins} 🪙
            </p>
          </section>
        )}

        {!activeGoal && (
          <Link
            to="/goals"
            className="mt-6 flex items-center gap-3 rounded-2xl bg-[oklch(0.92_0.08_105)] p-5 ring-1 ring-[oklch(0.80_0.12_142)] transition-transform hover:-translate-y-0.5 block"
          >
            <Target size={24} className="text-[oklch(0.45_0.15_142)]" />
            <div>
              <p className="font-black text-gray-800">Βάλε στόχο αποταμίευσης!</p>
              <p className="text-sm text-gray-500">Κάτι που θέλεις να αγοράσεις 🎯</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-gray-400" />
          </Link>
        )}

        {/* Quick actions */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/learn"
            className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.88_0.1_292)] p-5 transition-transform hover:-translate-y-0.5"
          >
            <BookOpen size={22} className="text-primary" />
            <p className="font-black text-foreground">Μάθε</p>
            <p className="text-xs text-muted-foreground">6 μαθήματα · +XP</p>
          </Link>
          <Link
            to="/investments"
            className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.89_0.11_51)] p-5 transition-transform hover:-translate-y-0.5"
          >
            <TrendingUp size={22} className="text-[oklch(0.55_0.18_37)]" />
            <p className="font-black text-foreground">Επένδυσε</p>
            <p className="text-xs text-muted-foreground">Μετοχές · Startups</p>
          </Link>
          <Link
            to="/wallet"
            className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.86_0.09_214)] p-5 transition-transform hover:-translate-y-0.5"
          >
            <Wallet size={22} className="text-[oklch(0.4_0.14_214)]" />
            <p className="font-black text-foreground">Πορτοφόλι</p>
            <p className="text-xs text-muted-foreground">Coins · Δουλειές</p>
          </Link>
          <Link
            to="/goals"
            className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.92_0.08_105)] p-5 transition-transform hover:-translate-y-0.5"
          >
            <Target size={22} className="text-[oklch(0.45_0.15_142)]" />
            <p className="font-black text-foreground">Στόχοι</p>
            <p className="text-xs text-muted-foreground">Αποταμίευση</p>
          </Link>
        </section>

        {/* Achievements */}
        <section className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Επιτεύγματα</h2>
            <Trophy size={18} className="text-[oklch(0.7_0.2_60)]" />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {[
              { emoji: "🥇", label: "1ο Μάθημα", done: transactions.some((t) => t.type === "lesson") },
              { emoji: "💰", label: "100 Coins", done: child.coins >= 100 },
              { emoji: "📈", label: "1η Επένδυση", done: transactions.some((t) => t.type === "investment" && t.amount < 0) },
              { emoji: "🎯", label: "1ος Στόχος", done: goals.length > 0 },
              { emoji: "🌟", label: "Lvl 5", done: child.level >= 5 },
            ].map((badge) => (
              <div
                key={badge.label}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3 ${
                  badge.done ? "bg-[oklch(0.88_0.1_292)]" : "bg-secondary opacity-50"
                }`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <span className="text-[10px] font-black">{badge.label}</span>
                {badge.done && <Star size={10} className="text-[oklch(0.6_0.2_60)]" fill="oklch(0.6 0.2 60)" />}
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Πρόσφατη Δραστηριότητα</h2>
            <Link
              to="/wallet"
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground"
            >
              Όλα <ChevronRight size={14} />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {recentTx.length === 0 && (
              <p className="text-sm text-muted-foreground py-3 text-center">
                Καμία δραστηριότητα ακόμα. Ξεκίνα μαθήματα ή δουλειές! 🚀
              </p>
            )}
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[oklch(0.93_0.03_292)] text-lg">
                  {txIcon[tx.type] ?? "🪙"}
                </span>
                <p className="min-w-0 flex-1 text-sm font-bold leading-tight">{tx.description}</p>
                <div className="text-right">
                  <p
                    className="text-sm font-black"
                    style={{ color: tx.amount >= 0 ? "oklch(0.55 0.18 37)" : "oklch(0.55 0.18 22)" }}
                  >
                    {tx.amount >= 0 ? "+" : ""}{tx.amount} 🪙
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-3 shadow-lg">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/child-dashboard";
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-black ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
