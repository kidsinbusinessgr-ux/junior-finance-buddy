import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useChild,
  useCurrentUser,
  useSavingsGoals,
  createSavingsGoal,
  depositToGoal,
} from "@/hooks/useJFB";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Στόχοι — Kids in Business" },
      { name: "description", content: "Οι αποταμιευτικοί σου στόχοι" },
    ],
  }),
  component: GoalsPage,
});

const EMOJI_PICKER = ["🎯", "🎮", "🚲", "⚽", "🎸", "📱", "🏄", "✈️", "🐶", "📚", "🎨", "🏆"];
const GOAL_COLORS = [
  "oklch(0.57 0.23 292)",
  "oklch(0.65 0.20 142)",
  "oklch(0.70 0.18 42)",
  "oklch(0.65 0.18 214)",
  "oklch(0.68 0.18 20)",
];

function GoalsPage() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalEmoji, setNewGoalEmoji] = useState("🎯");
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

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

  async function handleAddGoal() {
    if (!newGoalName.trim() || !newGoalTarget || !child) return;
    setCreatingGoal(true);
    await createSavingsGoal(child.id, newGoalName.trim(), newGoalEmoji, parseInt(newGoalTarget));
    await refetchGoals();
    setNewGoalName(""); setNewGoalTarget(""); setNewGoalEmoji("🎯");
    setShowAddModal(false); setCreatingGoal(false);
  }

  async function handleDeposit(goalId: string) {
    const amount = parseInt(depositAmount);
    if (!amount || amount <= 0 || !child) return;
    if (amount > child.coins) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    setDepositing(true);
    await depositToGoal(goalId, child.id, amount, goal.name, goal.saved_coins, goal.target_coins);
    await Promise.all([refetchGoals(), refetchChild()]);
    setDepositing(false);
    if (Math.min(goal.saved_coins + amount, goal.target_coins) >= goal.target_coins) {
      setCelebrateId(goalId);
    }
    setDepositGoalId(null); setDepositAmount("");
  }

  const depositGoal = goals.find((g) => g.id === depositGoalId);

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
        <h1 className="text-white text-3xl font-black mb-4">Οι Στόχοι μου 🎯</h1>
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
            <p className="text-white text-sm font-bold">{totalSaved} / {totalTarget} 🪙</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-black">{doneGoals.length}</p>
            <p className="text-white/70 text-xs font-semibold">Ολοκλ.</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-gray-800 text-lg">Ενεργοί Στόχοι</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm font-bold px-4 py-2 rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            + Νέος Στόχος
          </button>
        </div>

        {goalsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "oklch(0.57 0.23 292)" }} />
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">🌟</p>
            <p className="font-semibold">Δεν έχεις ακόμα στόχους!</p>
            <p className="text-sm">Πρόσθεσε έναν για να ξεκινήσεις</p>
          </div>
        ) : (
          activeGoals.map((goal, idx) => {
            const pct = Math.round((goal.saved_coins / goal.target_coins) * 100);
            const remaining = goal.target_coins - goal.saved_coins;
            const color = GOAL_COLORS[idx % GOAL_COLORS.length];
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-5 ring-1 ring-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `color-mix(in oklch, ${color} 15%, white)` }}
                    >
                      {goal.emoji}
                    </div>
                    <p className="font-black text-gray-800">{goal.name}</p>
                  </div>
                  <div className="text-right">
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
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-600">
                    <span style={{ color }}>{goal.saved_coins}🪙</span>
                    {" / "}{goal.target_coins}🪙
                  </p>
                  <button
                    onClick={() => { setDepositGoalId(goal.id); setDepositAmount(""); }}
                    className="text-sm font-bold px-4 py-1.5 rounded-xl ring-1 ring-inset transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: `color-mix(in oklch, ${color} 10%, white)`, color }}
                  >
                    💰 Αποταμίευσε
                  </button>
                </div>
              </div>
            );
          })
        )}

        {doneGoals.length > 0 && (
          <>
            <h2 className="font-black text-gray-800 text-lg pt-2">✅ Ολοκληρώθηκαν</h2>
            {doneGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm opacity-70">
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
              </div>
            ))}
          </>
        )}

        <div className="rounded-2xl p-5 mt-2" style={{ background: "oklch(0.89 0.11 51 / 0.15)" }}>
          <p className="font-black text-gray-800 mb-3">💡 Συμβουλές Αποταμίευσης</p>
          <div className="space-y-2">
            {[
              { icon: "🎯", tip: "Βάλε συγκεκριμένο στόχο — ξέρεις πού πας!" },
              { icon: "⏰", tip: "Αποτάμιευε λίγο κάθε μέρα, όχι όλα μαζί." },
              { icon: "🏆", tip: "Γιόρτασε κάθε μικρή επιτυχία — αξίζει!" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm font-semibold text-gray-700">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-10">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-300" />
            <h3 className="mb-5 text-xl font-black text-gray-800">Νέος Στόχος</h3>
            <p className="mb-2 text-sm font-bold text-gray-500">Επίλεξε emoji</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {EMOJI_PICKER.map((e) => (
                <button
                  key={e}
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
            <p className="mb-1 text-sm font-bold text-gray-500">Τι θέλεις να αγοράσεις;</p>
            <input
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="π.χ. Lego Technic, ποδήλατο…"
              className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-800 focus:outline-none"
            />
            <p className="mb-1 text-sm font-bold text-gray-500">Πόσα 🪙 χρειάζεσαι;</p>
            <input
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              placeholder="300"
              min={1}
              className="mb-5 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-800 focus:outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600">
                Άκυρο
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoalName.trim() || !newGoalTarget || creatingGoal}
                className="flex-1 rounded-xl py-3 font-black text-white disabled:opacity-40"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                {creatingGoal ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Δημιουργία 🎯"}
              </button>
            </div>
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
              Αποταμιευμένα: {depositGoal.saved_coins}🪙 · Λείπουν: {depositGoal.target_coins - depositGoal.saved_coins}🪙 · Πορτοφόλι: <strong>{child.coins}🪙</strong>
            </p>
            <p className="mb-1 text-sm font-bold text-gray-500">Πόσα 🪙 αποταμιεύεις τώρα;</p>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="50"
              min={1}
              max={Math.min(child.coins, depositGoal.target_coins - depositGoal.saved_coins)}
              className="mb-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-800 focus:outline-none"
            />
            {depositAmount && parseInt(depositAmount) > child.coins && (
              <p className="mb-2 text-xs font-bold text-red-500">Δεν έχεις αρκετά 🪙!</p>
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
                {depositing ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Αποταμίευσε 💰"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration */}
      {celebrateId !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60"
          onClick={() => setCelebrateId(null)}
        >
          <div className="mx-6 rounded-3xl bg-white p-8 text-center shadow-2xl">
            <p className="mb-4 text-6xl">🏆</p>
            <h3 className="mb-2 text-2xl font-black text-gray-800">Συγχαρητήρια!</h3>
            <p className="font-semibold text-gray-500 mb-1">Πέτυχες τον στόχο σου:</p>
            <p className="text-xl font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
              {goals.find((g) => g.id === celebrateId)?.emoji} {goals.find((g) => g.id === celebrateId)?.name}
            </p>
            <p className="mt-4 text-sm font-semibold text-gray-400">Πάτησε οπουδήποτε για να κλείσεις</p>
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
