import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/goals")({
  component: GoalsPage,
});

interface SavingsGoal {
  id: number;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  color: string;
  daysLeft?: number;
  completed: boolean;
}

const initialGoals: SavingsGoal[] = [
  {
    id: 1,
    name: "Lego Technic Ferrari",
    emoji: "🏎️",
    target: 300,
    saved: 180,
    color: "oklch(0.57 0.23 292)",
    daysLeft: 14,
    completed: false,
  },
  {
    id: 2,
    name: "PlayStation Gift Card",
    emoji: "🎮",
    target: 500,
    saved: 500,
    color: "oklch(0.65 0.20 142)",
    completed: true,
  },
  {
    id: 3,
    name: "Ποδήλατο",
    emoji: "🚲",
    target: 1200,
    saved: 320,
    color: "oklch(0.70 0.18 42)",
    daysLeft: 60,
    completed: false,
  },
];

function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalEmoji, setNewGoalEmoji] = useState("🎯");
  const [depositGoalId, setDepositGoalId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [celebrateId, setCelebrateId] = useState<number | null>(null);

  const totalSaved = goals.filter((g) => !g.completed).reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.filter((g) => !g.completed).reduce((s, g) => s + g.target, 0);
  const completedCount = goals.filter((g) => g.completed).length;

  function addGoal() {
    if (!newGoalName.trim() || !newGoalTarget) return;
    const goal: SavingsGoal = {
      id: Date.now(),
      name: newGoalName.trim(),
      emoji: newGoalEmoji,
      target: parseInt(newGoalTarget),
      saved: 0,
      color: "oklch(0.57 0.23 292)",
      daysLeft: undefined,
      completed: false,
    };
    setGoals((prev) => [...prev, goal]);
    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalEmoji("🎯");
    setShowAddModal(false);
  }

  function doDeposit(goalId: number) {
    const amount = parseInt(depositAmount);
    if (!amount || amount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newSaved = Math.min(g.saved + amount, g.target);
        const nowComplete = newSaved >= g.target;
        if (nowComplete) setCelebrateId(goalId);
        return { ...g, saved: newSaved, completed: nowComplete };
      })
    );
    setDepositGoalId(null);
    setDepositAmount("");
  }

  const activeGoals = goals.filter((g) => !g.completed);
  const doneGoals = goals.filter((g) => g.completed);

  const emojiPicker = ["🎯", "🎮", "🚲", "⚽", "🎸", "📱", "🏄", "✈️", "🐶", "📚", "🎨", "🏆"];

  return (
    <div className="min-h-screen pb-24" style={{ background: "oklch(0.98 0.01 292)" }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{
          background: "linear-gradient(135deg, oklch(0.57 0.23 292) 0%, oklch(0.50 0.25 268) 100%)",
        }}
      >
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">Αποταμίευση</p>
        <h1 className="text-white text-3xl font-black mb-4">Οι Στόχοι μου 🎯</h1>

        {/* Summary */}
        <div className="bg-white/15 rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">
              Συνολική πρόοδος
            </p>
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
              {totalSaved} / {totalTarget} 🪙
            </p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-black">{completedCount}</p>
            <p className="text-white/70 text-xs font-semibold">Ολοκλ.</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Active Goals header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-gray-800 text-lg">Ενεργοί Στόχοι</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm font-bold px-4 py-2 rounded-xl text-white ring-1 ring-inset ring-white/20 transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            + Νέος Στόχος
          </button>
        </div>

        {activeGoals.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">🌟</p>
            <p className="font-semibold">Δεν έχεις ακόμα στόχους!</p>
            <p className="text-sm">Πρόσθεσε έναν για να ξεκινήσεις</p>
          </div>
        )}

        {activeGoals.map((goal) => {
          const pct = Math.round((goal.saved / goal.target) * 100);
          const remaining = goal.target - goal.saved;
          return (
            <div key={goal.id} className="bg-white rounded-2xl p-5 ring-1 ring-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `color-mix(in oklch, ${goal.color} 15%, white)` }}
                  >
                    {goal.emoji}
                  </div>
                  <div>
                    <p className="font-black text-gray-800">{goal.name}</p>
                    {goal.daysLeft && (
                      <p className="text-xs font-semibold text-gray-400">⏰ {goal.daysLeft} μέρες</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-800 text-lg">{pct}%</p>
                  <p className="text-xs text-gray-400 font-semibold">{remaining}🪙 ακόμα</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: goal.color }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-600">
                  <span style={{ color: goal.color }}>{goal.saved}🪙</span>
                  {" / "}
                  {goal.target}🪙
                </p>
                <button
                  onClick={() => {
                    setDepositGoalId(goal.id);
                    setDepositAmount("");
                  }}
                  className="text-sm font-bold px-4 py-1.5 rounded-xl ring-1 ring-inset transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: `color-mix(in oklch, ${goal.color} 10%, white)`,
                    color: goal.color,
                  }}
                >
                  💰 Αποταμίευσε
                </button>
              </div>
            </div>
          );
        })}

        {/* Completed Goals */}
        {doneGoals.length > 0 && (
          <>
            <h2 className="font-black text-gray-800 text-lg pt-2">✅ Ολοκληρώθηκαν</h2>
            {doneGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm opacity-70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-green-50">
                    {goal.emoji}
                  </div>
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

        {/* Savings Tips */}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h3 className="font-black text-gray-800 text-xl mb-5">Νέος Στόχος</h3>

            <p className="text-sm font-bold text-gray-500 mb-2">Επίλεξε emoji</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {emojiPicker.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewGoalEmoji(e)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{
                    background:
                      newGoalEmoji === e ? "oklch(0.57 0.23 292 / 0.15)" : "oklch(0.97 0.01 292)",
                    outline: newGoalEmoji === e ? "2px solid oklch(0.57 0.23 292)" : "none",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            <p className="text-sm font-bold text-gray-500 mb-1">Τι θέλεις να αγοράσεις;</p>
            <input
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              placeholder="π.χ. Lego Technic, ποδήλατο…"
              className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none mb-3"
            />

            <p className="text-sm font-bold text-gray-500 mb-1">Πόσα 🪙 χρειάζεσαι;</p>
            <input
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              placeholder="300"
              min={1}
              className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600"
              >
                Άκυρο
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoalName.trim() || !newGoalTarget}
                className="flex-1 py-3 rounded-xl font-black text-white disabled:opacity-40 transition-all"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                Δημιουργία 🎯
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoalId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            {(() => {
              const g = goals.find((x) => x.id === depositGoalId)!;
              return (
                <>
                  <h3 className="font-black text-gray-800 text-xl mb-1">
                    {g.emoji} {g.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-semibold mb-5">
                    Έχεις {g.saved}🪙 · χρειάζεσαι άλλα {g.target - g.saved}🪙
                  </p>
                  <p className="text-sm font-bold text-gray-500 mb-1">Πόσα 🪙 αποταμιεύεις τώρα;</p>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="50"
                    min={1}
                    max={g.target - g.saved}
                    className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none mb-5"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDepositGoalId(null)}
                      className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600"
                    >
                      Άκυρο
                    </button>
                    <button
                      onClick={() => doDeposit(depositGoalId)}
                      disabled={!depositAmount || parseInt(depositAmount) <= 0}
                      className="flex-1 py-3 rounded-xl font-black text-white disabled:opacity-40 transition-all"
                      style={{ background: "oklch(0.57 0.23 292)" }}
                    >
                      Αποταμίευσε 💰
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Celebration overlay */}
      {celebrateId !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60"
          onClick={() => setCelebrateId(null)}
        >
          <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl">
            <p className="text-6xl mb-4">🏆</p>
            <h3 className="font-black text-gray-800 text-2xl mb-2">Συγχαρητήρια!</h3>
            <p className="text-gray-500 font-semibold mb-1">Πέτυχες τον στόχο σου:</p>
            <p className="font-black text-xl" style={{ color: "oklch(0.57 0.23 292)" }}>
              {goals.find((g) => g.id === celebrateId)?.emoji}{" "}
              {goals.find((g) => g.id === celebrateId)?.name}
            </p>
            <p className="text-gray-400 text-sm font-semibold mt-4">Πάτησε οπουδήποτε για να κλείσεις</p>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="flex items-stretch h-16 max-w-md mx-auto">
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
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
            >
              <span className="text-xl">{tab.icon}</span>
              <span
                className="text-[10px] font-black"
                style={{
                  color: tab.active ? "oklch(0.57 0.23 292)" : "oklch(0.60 0.01 292)",
                }}
              >
                {tab.label}
              </span>
              {tab.active && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: "oklch(0.57 0.23 292)" }}
                />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
