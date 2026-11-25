import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useChild,
  useCurrentUser,
  useSavingsGoals,
  createSavingsGoal,
  depositToGoal,
  saveGoalReflection,
} from "@/hooks/useJFB";
import {
  GoalCardBuilder,
  coinsToEuros,
  euro,
  eurosToCoins,
  formatDate,
  goalPlanStatus,
  planFor,
  type GoalDraft,
} from "@/components/smart-goals";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Στόχοι — Kids in Business" },
      { name: "description", content: "Οι αποταμιευτικοί σου στόχοι" },
    ],
  }),
  component: GoalsPage,
});

const EMOJI_PICKER = ["🎯", "🎧", "📱", "💻", "🎮", "✈️", "🎫", "👟", "🛹", "📷", "🎸", "🏋️"];
const GOAL_COLORS = [
  "oklch(0.57 0.23 292)",
  "oklch(0.65 0.20 142)",
  "oklch(0.70 0.18 42)",
  "oklch(0.65 0.18 214)",
  "oklch(0.68 0.18 20)",
];
const MAX_SUGGESTED = 5;

function GoalsPage() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalEmoji, setNewGoalEmoji] = useState("🎯");
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [savingReflection, setSavingReflection] = useState(false);

  const { userId, loading: authLoading } = useCurrentUser();
  const { child, loading: childLoading, refetch: refetchChild } = useChild();
  const { goals, loading: goalsLoading, refetch: refetchGoals } = useSavingsGoals(child?.id ?? null);

  if (!authLoading && !childLoading) {
    if (!userId) { navigate({ to: "/login" }); return null; }
    if (!child) { navigate({ to: "/onboarding" }); return null; }
  }

  if (authLoading || childLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "oklch(0.98 0.01 292)" }}>
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.57_0.23_292)]" />
      </div>
    );
  }

  if (!child) return null;

  const activeGoals = goals.filter((g) => !g.completed);
  const doneGoals = goals.filter((g) => g.completed);
  const totalSaved = activeGoals.reduce((s, g) => s + g.saved_coins, 0);
  const totalTarget = activeGoals.reduce((s, g) => s + g.target_coins, 0);

  async function handleAddGoal(d: GoalDraft) {
    if (!child) return;
    const p = planFor(d);
    setCreatingGoal(true);
    setCreateError("");
    try {
      await createSavingsGoal(child.id, d.what.trim(), newGoalEmoji, eurosToCoins(p.price), {
        why: d.why.trim(),
        weeklyCoins: Math.max(1, eurosToCoins(p.weekly)),
        deadline: d.deadline,
      });
      await refetchGoals();
      setNewGoalEmoji("🎯");
      setShowAddModal(false);
    } catch {
      setCreateError("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
    } finally {
      setCreatingGoal(false);
    }
  }

  async function handleDeposit(goalId: string) {
    const amount = parseInt(depositAmount);
    if (!amount || amount <= 0 || !child) return;
    if (amount > child.coins) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    setDepositing(true);
    try {
      await depositToGoal(goalId, amount);
    } catch (err) {
      console.error("Deposit failed:", err);
      setDepositing(false);
      return;
    }
    await Promise.all([refetchGoals(), refetchChild()]);
    setDepositing(false);
    if (Math.min(goal.saved_coins + amount, goal.target_coins) >= goal.target_coins) {
      setReflection("");
      setCelebrateId(goalId);
    }
    setDepositGoalId(null); setDepositAmount("");
  }

  async function handleReflection() {
    if (!celebrateId || !reflection.trim()) { setCelebrateId(null); return; }
    setSavingReflection(true);
    try {
      await saveGoalReflection(celebrateId, reflection.trim());
      await refetchGoals();
    } catch {
      /* keep going: the goal itself is done */
    }
    setSavingReflection(false);
    setCelebrateId(null);
  }

  const depositGoal = goals.find((g) => g.id === depositGoalId);
  const celebrated = goals.find((g) => g.id === celebrateId);

  return (
    <div className="min-h-screen pb-24" style={{ background: "oklch(0.98 0.01 292)" }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(135deg, oklch(0.57 0.23 292) 0%, oklch(0.50 0.25 268) 100%)" }}
      >
        <Link to="/child-dashboard" className="mb-4 flex items-center gap-1 text-sm font-bold text-white/70">
          ← Αρχική
        </Link>
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">Αποταμίευση</p>
        <h1 className="text-white text-3xl font-black mb-4">Οι στόχοι μου</h1>
        <div className="bg-white/15 rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Συνολική πρόοδος</p>
            <div className="w-full bg-white/20 rounded-full h-3 mb-1">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}%` : "0%",
                  background: "oklch(0.89 0.11 51)",
                }}
              />
            </div>
            <p className="text-white text-sm font-bold">
              {totalSaved} / {totalTarget} 🪙 <span className="font-semibold text-white/70">· {euro(coinsToEuros(totalSaved))} από {euro(coinsToEuros(totalTarget))}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-black">{doneGoals.length}</p>
            <p className="text-white/70 text-xs font-semibold">Ολοκλ.</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-gray-800 text-lg">Ενεργοί στόχοι</h2>
          <button
            onClick={() => { setCreateError(""); setShowAddModal(true); }}
            className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            + Νέος στόχος
          </button>
        </div>

        {activeGoals.length >= MAX_SUGGESTED && (
          <p className="rounded-xl bg-[oklch(0.89_0.11_51/0.2)] px-4 py-3 text-sm font-semibold text-gray-700">
            Έχεις {activeGoals.length} ενεργούς στόχους. Τα καλύτερα αποτελέσματα έρχονται με 3–5 στόχους· ολοκλήρωσε κάποιον πριν βάλεις
            καινούριο.
          </p>
        )}

        {goalsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "oklch(0.57 0.23 292)" }} />
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="font-semibold">Δεν έχεις ακόμα στόχους.</p>
            <p className="text-sm">Πρόσθεσε έναν: κάτι που θέλεις να αγοράσεις, ένα ταξίδι, μια εμπειρία.</p>
          </div>
        ) : (
          activeGoals.map((goal, idx) => {
            const pct = Math.round((goal.saved_coins / goal.target_coins) * 100);
            const remaining = goal.target_coins - goal.saved_coins;
            const color = GOAL_COLORS[idx % GOAL_COLORS.length];
            const status = goalPlanStatus(goal);
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-5 ring-1 ring-border shadow-sm">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `color-mix(in oklch, ${color} 15%, white)` }}
                    >
                      {goal.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-gray-800">{goal.name}</p>
                      <p className="text-xs font-semibold text-gray-400">
                        {euro(coinsToEuros(goal.target_coins))}
                        {goal.deadline ? ` · μέχρι ${formatDate(goal.deadline)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-gray-800 text-lg">{pct}%</p>
                    <p className="text-xs text-gray-400 font-semibold">{remaining}🪙 ακόμα</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                  <div
                    className="h-4 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                {goal.why && <p className="mb-2 text-sm text-gray-500"><span className="font-bold text-gray-700">Γιατί:</span> {goal.why}</p>}
                {(goal.weekly_coins || status) && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                    {goal.weekly_coins ? (
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-600">
                        Πλάνο: {goal.weekly_coins} 🪙 ({euro(coinsToEuros(goal.weekly_coins))}) την εβδομάδα
                      </span>
                    ) : null}
                    {status && (
                      <span
                        className={`rounded-lg px-2 py-1 ${
                          status.tone === "ok"
                            ? "bg-[oklch(0.96_0.04_160)] text-[oklch(0.42_0.12_160)]"
                            : status.tone === "behind"
                              ? "bg-[oklch(0.96_0.05_70)] text-[oklch(0.45_0.12_60)]"
                              : "bg-[oklch(0.96_0.03_25)] text-[oklch(0.5_0.15_25)]"
                        }`}
                      >
                        {status.text}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-600">
                    <span style={{ color }}>{goal.saved_coins}🪙</span>
                    {" / "}{goal.target_coins}🪙
                  </p>
                  <button
                    onClick={() => { setDepositGoalId(goal.id); setDepositAmount(goal.weekly_coins ? String(Math.min(goal.weekly_coins, remaining)) : ""); }}
                    className="text-sm font-bold px-4 py-1.5 rounded-xl ring-1 ring-inset transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}
                  >
                    Βάλε στην άκρη
                  </button>
                </div>
              </div>
            );
          })
        )}

        {doneGoals.length > 0 && (
          <>
            <h2 className="font-black text-gray-800 text-lg pt-2">Ολοκληρώθηκαν</h2>
            {doneGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-green-50">{goal.emoji}</div>
                  <div className="flex-1">
                    <p className="font-black text-gray-700">{goal.name}</p>
                    <div className="w-full bg-green-100 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full bg-green-400 w-full" />
                    </div>
                  </div>
                  <div className="text-xl font-black">🏆</div>
                </div>
                {goal.reflection && (
                  <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                    <span className="font-bold text-gray-700">Τι έμαθα:</span> {goal.reflection}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        <div className="rounded-2xl p-5 mt-2" style={{ background: "oklch(0.89 0.11 51 / 0.15)" }}>
          <p className="font-black text-gray-800 mb-1">Στόχοι που πετυχαίνουν</p>
          <p className="text-sm font-semibold text-gray-600">
            Κάθε στόχος εδώ είναι S.M.A.R.T.: συγκεκριμένος, μετρήσιμος, εφικτός, σχετικός και με ημερομηνία.
          </p>
          <Link to="/save" hash="karta" className="mt-3 inline-block text-sm font-black" style={{ color: "oklch(0.5 0.2 292)" }}>
            Δες το μάθημα και γράψε κάρτα στόχου →
          </Link>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 pb-10">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-gray-800">Νέος στόχος</h3>
                <p className="text-sm font-semibold text-gray-400">Συμπλήρωσε τα πέντε γράμματα S.M.A.R.T.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600">
                Άκυρο
              </button>
            </div>
            <GoalCardBuilder
              mode="app"
              onSave={handleAddGoal}
              saving={creatingGoal}
              emojiPicker={
                <div className="mb-4 flex flex-wrap gap-2">
                  {EMOJI_PICKER.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewGoalEmoji(e)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all"
                      style={{
                        background: newGoalEmoji === e ? "oklch(0.57 0.23 292 / 0.15)" : "oklch(0.97 0.01 292)",
                        outline: newGoalEmoji === e ? "2px solid oklch(0.57 0.23 292)" : "none",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              }
            />
            {createError && <p className="mt-3 text-sm font-bold text-red-600">{createError}</p>}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoalId !== null && depositGoal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-10">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" />
            <h3 className="mb-1 text-xl font-black text-gray-800">{depositGoal.emoji} {depositGoal.name}</h3>
            <p className="mb-5 text-sm font-semibold text-gray-500">
              Στην άκρη: {depositGoal.saved_coins}🪙 · Λείπουν: {depositGoal.target_coins - depositGoal.saved_coins}🪙 · Πορτοφόλι: <strong>{child.coins}🪙</strong>
            </p>
            <p className="mb-1 text-sm font-bold text-gray-500">Πόσα 🪙 βάζεις στην άκρη τώρα;</p>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="50"
              min={1}
              max={Math.min(child.coins, depositGoal.target_coins - depositGoal.saved_coins)}
              className="mb-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-800 focus:outline-none"
            />
            {depositGoal.weekly_coins ? (
              <p className="text-xs font-semibold text-gray-400">Σύμφωνα με το πλάνο σου, βάζεις {depositGoal.weekly_coins} 🪙 την εβδομάδα.</p>
            ) : null}
            {depositAmount && parseInt(depositAmount) > child.coins && (
              <p className="mb-2 text-xs font-bold text-red-500">Δεν έχεις αρκετά κέρματα.</p>
            )}
            <div className="mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setDepositGoalId(null)} className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600">
                Άκυρο
              </button>
              <button
                onClick={() => handleDeposit(depositGoalId)}
                disabled={!depositAmount || parseInt(depositAmount) <= 0 || parseInt(depositAmount) > child.coins || depositing}
                className="flex-1 rounded-xl py-3 font-black text-white disabled:opacity-40"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                {depositing ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Βάλε στην άκρη"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration and reflection */}
      {celebrateId !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <p className="mb-3 text-5xl">🏆</p>
            <h3 className="mb-1 text-2xl font-black text-gray-800">Τον πέτυχες</h3>
            <p className="text-lg font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
              {celebrated?.emoji} {celebrated?.name}
            </p>
            <p className="mt-4 text-left text-sm font-bold text-gray-600">Τι έμαθες πετυχαίνοντας αυτόν τον στόχο;</p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              maxLength={300}
              placeholder="π.χ. ότι €6 την εβδομάδα φτάνουν, αν τα βάζω στην άκρη μόλις πάρω χαρτζιλίκι"
              className="mt-1 min-h-[80px] w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setCelebrateId(null)} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600">
                Αργότερα
              </button>
              <button
                onClick={handleReflection}
                disabled={savingReflection}
                className="flex-1 rounded-xl py-3 text-sm font-black text-white disabled:opacity-40"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                {savingReflection ? "…" : "Αποθήκευση"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-lg">
        <div className="mx-auto flex h-16 max-w-md items-stretch">
          {[
            { href: "/child-dashboard", icon: "🏠", label: "Αρχική" },
            { href: "/learn", icon: "📚", label: "Μάθε" },
            { href: "/wallet", icon: "💰", label: "Πορτοφόλι" },
            { href: "/goals", icon: "🎯", label: "Στόχοι", active: true },
            { href: "/investments", icon: "📈", label: "Επενδύσεις" },
          ].map((tab) => (
            <Link
              key={tab.href}
              to={tab.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-black" style={{ color: tab.active ? "oklch(0.57 0.23 292)" : "oklch(0.60 0.01 292)" }}>
                {tab.label}
              </span>
              {tab.active && <div className="mt-0.5 h-1 w-1 rounded-full" style={{ background: "oklch(0.57 0.23 292)" }} />}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
