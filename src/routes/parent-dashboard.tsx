import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/parent-dashboard")({
  component: ParentDashboard,
});

interface PendingChore {
  id: number;
  name: string;
  coins: number;
  submittedAt: string;
  childName: string;
}

interface Reward {
  id: number;
  name: string;
  emoji: string;
  cost: number;
  requested: boolean;
}

interface Activity {
  icon: string;
  text: string;
  coins: string;
  time: string;
  positive: boolean;
}

const pendingChoresData: PendingChore[] = [
  { id: 1, name: "Σκούπισα το σαλόνι", coins: 15, submittedAt: "πριν 20 λεπτά", childName: "Αχιλλέας" },
  { id: 2, name: "Πότισα τα φυτά", coins: 10, submittedAt: "πριν 1 ώρα", childName: "Αχιλλέας" },
  { id: 3, name: "Έπλυνα τα πιάτα", coins: 20, submittedAt: "πριν 2 ώρες", childName: "Αχιλλέας" },
];

const requestedRewards: Reward[] = [
  { id: 1, name: "Επίσκεψη στο Escape Room", emoji: "🔐", cost: 200, requested: true },
  { id: 2, name: "Pizza παραγγελία", emoji: "🍕", cost: 80, requested: true },
];

const recentActivity: Activity[] = [
  { icon: "📚", text: "Ολοκλήρωσε μάθημα: Τι είναι η Αποταμίευση", coins: "+30", time: "σήμερα 14:20", positive: true },
  { icon: "✅", text: "Εγκρίθηκε: Σκούπισε το δωμάτιο", coins: "+15", time: "χθες 18:00", positive: true },
  { icon: "📈", text: "Αγόρασε 2 μετοχές Apple", coins: "-170", time: "χθες 16:30", positive: false },
  { icon: "🎯", text: "Αποτάμιευσε για Lego Technic", coins: "-50", time: "χθες 10:00", positive: false },
  { icon: "📚", text: "Ολοκλήρωσε μάθημα: Τι είναι Επένδυση", coins: "+30", time: "προχθές", positive: true },
];

function ParentDashboard() {
  const [pending, setPending] = useState<PendingChore[]>(pendingChoresData);
  const [rewards, setRewards] = useState<Reward[]>(requestedRewards);
  const [coinsBalance, setCoinsBalance] = useState(347);
  const [showLoadCoins, setShowLoadCoins] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [approvedIds, setApprovedIds] = useState<number[]>([]);
  const [rejectedIds, setRejectedIds] = useState<number[]>([]);
  const [rewardDoneIds, setRewardDoneIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "chores" | "rewards" | "settings">("overview");

  function approveChore(chore: PendingChore) {
    setCoinsBalance((b) => b + chore.coins);
    setApprovedIds((ids) => [...ids, chore.id]);
    setTimeout(() => setPending((p) => p.filter((c) => c.id !== chore.id)), 800);
  }

  function rejectChore(id: number) {
    setRejectedIds((ids) => [...ids, id]);
    setTimeout(() => setPending((p) => p.filter((c) => c.id !== id)), 800);
  }

  function approveReward(reward: Reward) {
    setCoinsBalance((b) => b - reward.cost);
    setRewardDoneIds((ids) => [...ids, reward.id]);
    setTimeout(() => setRewards((r) => r.filter((x) => x.id !== reward.id)), 800);
  }

  function loadCoins() {
    const n = parseInt(loadAmount);
    if (!n || n <= 0) return;
    setCoinsBalance((b) => b + n);
    setLoadAmount("");
    setShowLoadCoins(false);
  }

  const presets = [50, 100, 200, 500];

  return (
    <div className="min-h-screen pb-24" style={{ background: "oklch(0.98 0.01 292)" }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{
          background: "linear-gradient(135deg, oklch(0.35 0.18 268) 0%, oklch(0.28 0.20 280) 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest">Γονεϊκός Λογαριασμός</p>
            <h1 className="text-white text-2xl font-black">Πίνακας Ελέγχου 👨‍👩‍👦</h1>
          </div>
          <Link
            to="/child-dashboard"
            className="bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl hover:-translate-y-0.5 transition-all"
          >
            👦 Εμφάνιση παιδιού
          </Link>
        </div>

        {/* Child summary card */}
        <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            🧒
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-lg">Αχιλλέας</p>
            <p className="text-white/60 text-sm font-semibold">Επίπεδο 3 · Μικρός Επιχειρηματίας</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div className="h-2 rounded-full w-4/5" style={{ background: "oklch(0.89 0.11 51)" }} />
              </div>
              <span className="text-white/70 text-xs font-semibold">820/1000 XP</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-black">{coinsBalance}</p>
            <p className="text-white/60 text-xs font-semibold">🪙 KidsCoins</p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="px-5 py-3">
        <div className="flex gap-1 bg-white rounded-2xl p-1 ring-1 ring-border shadow-sm">
          {[
            { key: "overview", label: "Σύνοψη" },
            { key: "chores", label: `Δουλειές${pending.length > 0 ? ` (${pending.length})` : ""}` },
            { key: "rewards", label: `Βραβεία${rewards.length > 0 ? ` (${rewards.length})` : ""}` },
            { key: "settings", label: "Ρυθμίσεις" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
              style={{
                background: activeTab === tab.key ? "oklch(0.35 0.18 268)" : "transparent",
                color: activeTab === tab.key ? "white" : "oklch(0.50 0.05 292)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Μαθήματα", value: "12", icon: "📚", color: "oklch(0.57 0.23 292)" },
                { label: "Εγκρ. δουλ.", value: "8", icon: "✅", color: "oklch(0.65 0.20 142)" },
                { label: "Επενδύσεις", value: "3", icon: "📈", color: "oklch(0.70 0.18 42)" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-3 ring-1 ring-border text-center shadow-sm">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="font-black text-gray-800 text-xl">{s.value}</p>
                  <p className="text-xs font-semibold text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Pending chores alert */}
            {pending.length > 0 && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                style={{ background: "oklch(0.89 0.11 51 / 0.2)" }}
                onClick={() => setActiveTab("chores")}
              >
                <span className="text-2xl">⏳</span>
                <div className="flex-1">
                  <p className="font-black text-gray-800">
                    {pending.length} δουλειές περιμένουν έγκριση
                  </p>
                  <p className="text-sm text-gray-500 font-semibold">Πάτησε για να εγκρίνεις</p>
                </div>
                <span className="text-gray-400 font-bold">›</span>
              </div>
            )}

            {/* Reward requests alert */}
            {rewards.length > 0 && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                style={{ background: "oklch(0.76 0.15 173 / 0.15)" }}
                onClick={() => setActiveTab("rewards")}
              >
                <span className="text-2xl">🎁</span>
                <div className="flex-1">
                  <p className="font-black text-gray-800">
                    {rewards.length} αιτήματα για βραβεία
                  </p>
                  <p className="text-sm text-gray-500 font-semibold">Πάτησε για να διαχειριστείς</p>
                </div>
                <span className="text-gray-400 font-bold">›</span>
              </div>
            )}

            {/* Load coins */}
            <div className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm flex items-center justify-between">
              <div>
                <p className="font-black text-gray-800">Φόρτωσε KidsCoins</p>
                <p className="text-sm text-gray-500 font-semibold">Υπόλοιπο: {coinsBalance} 🪙</p>
              </div>
              <button
                onClick={() => setShowLoadCoins(true)}
                className="font-black text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                + Φόρτωσε
              </button>
            </div>

            {/* Recent activity */}
            <h2 className="font-black text-gray-800 text-lg">Πρόσφατη Δραστηριότητα</h2>
            <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{a.text}</p>
                    <p className="text-xs text-gray-400 font-semibold">{a.time}</p>
                  </div>
                  <span
                    className="text-sm font-black"
                    style={{ color: a.positive ? "oklch(0.55 0.20 142)" : "oklch(0.55 0.18 22)" }}
                  >
                    {a.coins}🪙
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CHORES TAB ── */}
        {activeTab === "chores" && (
          <>
            <h2 className="font-black text-gray-800 text-lg">Εκκρεμείς Εγκρίσεις</h2>

            {pending.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-semibold">Όλα εγκρίθηκαν!</p>
                <p className="text-sm">Δεν υπάρχουν εκκρεμείς δουλειές</p>
              </div>
            )}

            {pending.map((chore) => {
              const isApproved = approvedIds.includes(chore.id);
              const isRejected = rejectedIds.includes(chore.id);
              return (
                <div
                  key={chore.id}
                  className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm transition-all"
                  style={{
                    opacity: isApproved || isRejected ? 0.5 : 1,
                    background: isApproved
                      ? "oklch(0.95 0.08 142)"
                      : isRejected
                      ? "oklch(0.97 0.03 22)"
                      : "white",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-gray-800">{chore.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {chore.childName} · {chore.submittedAt}
                      </p>
                    </div>
                    <div
                      className="text-lg font-black px-3 py-1 rounded-xl"
                      style={{
                        background: "oklch(0.89 0.11 51 / 0.2)",
                        color: "oklch(0.60 0.15 51)",
                      }}
                    >
                      +{chore.coins}🪙
                    </div>
                  </div>

                  {isApproved ? (
                    <p className="text-center font-black text-green-600">✅ Εγκρίθηκε!</p>
                  ) : isRejected ? (
                    <p className="text-center font-black text-red-500">❌ Απορρίφθηκε</p>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectChore(chore.id)}
                        className="flex-1 py-2.5 rounded-xl font-bold bg-red-50 text-red-500 ring-1 ring-red-100 transition-all hover:-translate-y-0.5 active:scale-95"
                      >
                        ✗ Απόρριψη
                      </button>
                      <button
                        onClick={() => approveChore(chore)}
                        className="flex-1 py-2.5 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 active:scale-95"
                        style={{ background: "oklch(0.65 0.20 142)" }}
                      >
                        ✓ Έγκριση +{chore.coins}🪙
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Chore management */}
            <h2 className="font-black text-gray-800 text-lg pt-2">Διαχείριση Δουλειών</h2>
            <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
              {[
                { name: "Σκούπισε το σαλόνι", coins: 15, emoji: "🧹" },
                { name: "Πότισε τα φυτά", coins: 10, emoji: "🪴" },
                { name: "Έπλυνε τα πιάτα", coins: 20, emoji: "🍽️" },
                { name: "Βοήθησε με τα ψώνια", coins: 25, emoji: "🛒" },
                { name: "Καθάρισε το δωμάτιό του", coins: 30, emoji: "🛏️" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <span className="text-xl">{c.emoji}</span>
                  <p className="flex-1 font-semibold text-gray-700 text-sm">{c.name}</p>
                  <span
                    className="text-sm font-black px-2 py-0.5 rounded-lg"
                    style={{ background: "oklch(0.89 0.11 51 / 0.2)", color: "oklch(0.60 0.15 51)" }}
                  >
                    {c.coins}🪙
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── REWARDS TAB ── */}
        {activeTab === "rewards" && (
          <>
            <h2 className="font-black text-gray-800 text-lg">Αιτήματα Βραβείων</h2>

            {rewards.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🎁</p>
                <p className="font-semibold">Κανένα αίτημα αυτή τη στιγμή</p>
              </div>
            )}

            {rewards.map((reward) => {
              const isDone = rewardDoneIds.includes(reward.id);
              const canAfford = coinsBalance >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm"
                  style={{ opacity: isDone ? 0.5 : 1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: "oklch(0.57 0.23 292 / 0.1)" }}
                    >
                      {reward.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-800">{reward.name}</p>
                      <p className="text-sm font-bold" style={{ color: "oklch(0.57 0.23 292)" }}>
                        {reward.cost}🪙
                        {!canAfford && (
                          <span className="text-red-400 ml-2 text-xs">
                            (λείπουν {reward.cost - coinsBalance}🪙)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {isDone ? (
                    <p className="text-center font-black text-green-600">✅ Εξαργυρώθηκε!</p>
                  ) : (
                    <button
                      onClick={() => canAfford && approveReward(reward)}
                      disabled={!canAfford}
                      className="w-full py-2.5 rounded-xl font-black text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:scale-95"
                      style={{ background: "oklch(0.65 0.20 142)" }}
                    >
                      ✓ Δώσε την άδεια (-{reward.cost}🪙)
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add reward */}
            <h2 className="font-black text-gray-800 text-lg pt-2">Κατάστημα Βραβείων</h2>
            <p className="text-sm text-gray-500 font-semibold -mt-2">
              Αυτά βλέπει το παιδί σου στο Κατάστημα
            </p>
            <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
              {[
                { name: "Επίσκεψη στο Escape Room", emoji: "🔐", cost: 200 },
                { name: "Pizza παραγγελία", emoji: "🍕", cost: 80 },
                { name: "Έξοδος κινηματογράφου", emoji: "🎬", cost: 120 },
                { name: "Παιχνίδι Steam", emoji: "🎮", cost: 300 },
                { name: "Παγωτό επιλογής σου", emoji: "🍦", cost: 30 },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <span className="text-xl">{r.emoji}</span>
                  <p className="flex-1 font-semibold text-gray-700 text-sm">{r.name}</p>
                  <span
                    className="text-sm font-black px-2 py-0.5 rounded-lg"
                    style={{ background: "oklch(0.57 0.23 292 / 0.1)", color: "oklch(0.57 0.23 292)" }}
                  >
                    {r.cost}🪙
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <>
            <h2 className="font-black text-gray-800 text-lg">Ρυθμίσεις</h2>

            <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
              {[
                { icon: "👦", label: "Προφίλ παιδιού", sub: "Αχιλλέας · Επίπεδο 3" },
                { icon: "🔔", label: "Ειδοποιήσεις", sub: "Ενεργές" },
                { icon: "🔒", label: "Όρια δαπανών", sub: "Χωρίς όριο" },
                { icon: "📊", label: "Εβδομαδιαία αναφορά", sub: "Κάθε Κυριακή" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400 font-semibold">{s.sub}</p>
                  </div>
                  <span className="text-gray-300 font-bold text-xl">›</span>
                </div>
              ))}
            </div>

            {/* Subscription */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, oklch(0.57 0.23 292) 0%, oklch(0.50 0.25 268) 100%)" }}
            >
              <p className="text-white font-black text-lg mb-1">Kids in Business Premium</p>
              <p className="text-white/70 text-sm font-semibold mb-3">
                Πλήρης πρόσβαση σε όλα τα μαθήματα, επενδύσεις και εργαλεία
              </p>
              <div className="flex gap-3">
                <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
                  <p className="text-white font-black text-lg">€4.99</p>
                  <p className="text-white/60 text-xs font-semibold">/μήνα</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-3 text-center relative">
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: "oklch(0.70 0.18 42)" }}
                  >
                    BEST VALUE
                  </div>
                  <p className="font-black text-lg" style={{ color: "oklch(0.57 0.23 292)" }}>
                    €39
                  </p>
                  <p className="text-gray-400 text-xs font-semibold">/χρόνο</p>
                </div>
              </div>
              <button className="w-full mt-3 bg-white/20 text-white font-black py-3 rounded-xl hover:-translate-y-0.5 transition-all active:scale-95">
                Διαχείριση Συνδρομής →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Load Coins Modal */}
      {showLoadCoins && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h3 className="font-black text-gray-800 text-xl mb-1">Φόρτωσε KidsCoins</h3>
            <p className="text-gray-400 text-sm font-semibold mb-5">
              Υπόλοιπο: {coinsBalance} 🪙
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setLoadAmount(String(p))}
                  className="py-2.5 rounded-xl font-black text-sm transition-all"
                  style={{
                    background:
                      loadAmount === String(p)
                        ? "oklch(0.57 0.23 292)"
                        : "oklch(0.97 0.01 292)",
                    color: loadAmount === String(p) ? "white" : "oklch(0.40 0.10 292)",
                  }}
                >
                  {p}🪙
                </button>
              ))}
            </div>

            <input
              type="number"
              value={loadAmount}
              onChange={(e) => setLoadAmount(e.target.value)}
              placeholder="Ή πληκτρολόγησε ποσό…"
              className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowLoadCoins(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600"
              >
                Άκυρο
              </button>
              <button
                onClick={loadCoins}
                disabled={!loadAmount || parseInt(loadAmount) <= 0}
                className="flex-1 py-3 rounded-xl font-black text-white disabled:opacity-40 transition-all"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                Φόρτωσε 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="flex items-stretch h-16 max-w-md mx-auto">
          {[
            { href: "/parent-dashboard", icon: "👨‍👩‍👦", label: "Αρχική", active: true },
            { href: "/parent-dashboard", icon: "⏳", label: `Εγκρίσεις${pending.length > 0 ? ` (${pending.length})` : ""}`, tabKey: "chores" },
            { href: "/parent-dashboard", icon: "🎁", label: "Βραβεία", tabKey: "rewards" },
            { href: "/parent-dashboard", icon: "⚙️", label: "Ρυθμίσεις", tabKey: "settings" },
          ].map((tab, i) => (
            <button
              key={i}
              onClick={() => tab.tabKey && setActiveTab(tab.tabKey as typeof activeTab)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
            >
              <span className="text-xl">{tab.icon}</span>
              <span
                className="text-[10px] font-black"
                style={{
                  color:
                    (tab.tabKey && activeTab === tab.tabKey) || (!tab.tabKey && activeTab === "overview")
                      ? "oklch(0.35 0.18 268)"
                      : "oklch(0.60 0.01 292)",
                }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
