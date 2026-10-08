import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  useCurrentUser,
  useParent,
  useChildren,
  useChores,
  useChoreSubmissions,
  useRewards,
  useRewardRequests,
  useTransactions,
  reviewChore,
  approveRewardRequest as approveRewardRequestFn,
  parentLoadCoins,
  xpToLevel,
  LEVEL_NAMES,
  XP_LEVELS,
} from "@/hooks/useJFB";

export const Route = createFileRoute("/parent-dashboard")({
  component: ParentDashboard,
});

function ParentDashboard() {
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useCurrentUser();
  const { parent, loading: parentLoading } = useParent();

  const { children, loading: childrenLoading } = useChildren(parent?.id ?? null);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const child = children[selectedChildIdx] ?? null;

  const { chores } = useChores(parent?.id ?? null);
  const { rewards } = useRewards(parent?.id ?? null);
  const { submissions, refetch: refetchSubmissions } = useChoreSubmissions(child?.id ?? null);
  const { requests, refetch: refetchRequests } = useRewardRequests(child?.id ?? null);
  const { transactions } = useTransactions(child?.id ?? null);

  const [activeTab, setActiveTab] = useState<"overview" | "chores" | "rewards" | "settings">("overview");
  const [showLoadCoins, setShowLoadCoins] = useState(false);
  const [loadAmount, setLoadAmount] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (!authLoading && !userId) {
    navigate({ to: "/login" });
    return null;
  }
  if (!parentLoading && !parent) {
    navigate({ to: "/onboarding" });
    return null;
  }

  const loading = authLoading || parentLoading || childrenLoading;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "oklch(0.98 0.01 292)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[oklch(0.57_0.23_292)] border-t-transparent" />
          <p className="font-black text-gray-500">Φόρτωση…</p>
        </div>
      </div>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const pendingRequests = requests.filter((r) => r.status === "pending");

  const getChore = (choreId: string) => chores.find((c) => c.id === choreId);
  const getReward = (rewardId: string) => rewards.find((r) => r.id === rewardId);

  const level = child ? xpToLevel(child.xp) : 1;
  const levelName = LEVEL_NAMES[level - 1];
  const xpNext = XP_LEVELS[level] ?? XP_LEVELS[XP_LEVELS.length - 1];
  const xpCurrent = XP_LEVELS[level - 1] ?? 0;
  const xpPct = xpNext === xpCurrent ? 100 : Math.round(((child?.xp ?? 0) - xpCurrent) / (xpNext - xpCurrent) * 100);

  const lessonCount = transactions.filter((t) => t.type === "lesson").length;
  const approvedChoreCount = transactions.filter((t) => t.type === "chore").length;
  const investCount = transactions.filter((t) => t.type === "investment").length;

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleReviewChore(submissionId: string, status: "approved" | "rejected") {
    if (!child) return;
    const submission = submissions.find((s) => s.id === submissionId);
    if (!submission) return;
    const chore = getChore(submission.chore_id);
    if (!chore) return;
    setBusyId(submissionId);
    try {
      await reviewChore(submissionId, status, child.id, chore.coins, chore.name);
      await refetchSubmissions();
    } finally {
      setBusyId(null);
    }
  }

  async function handleApproveReward(requestId: string) {
    if (!child) return;
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;
    const reward = getReward(request.reward_id);
    if (!reward) return;
    if ((child.coins ?? 0) < reward.cost) return;
    setBusyId(requestId);
    try {
      await approveRewardRequestFn(requestId, child.id, reward.cost, reward.name);
      await refetchRequests();
    } finally {
      setBusyId(null);
    }
  }

  async function handleLoadCoins() {
    if (!child) return;
    const n = parseInt(loadAmount);
    if (!n || n <= 0) return;
    setBusyId("load");
    try {
      await parentLoadCoins(child.id, n);
      setLoadAmount("");
      setShowLoadCoins(false);
    } finally {
      setBusyId(null);
    }
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
          {child && (
            <Link
              to="/child-dashboard"
              className="bg-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl hover:-translate-y-0.5 transition-all"
            >
              👦 Εμφάνιση παιδιού
            </Link>
          )}
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {children.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelectedChildIdx(i)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                style={{
                  background: i === selectedChildIdx ? "white" : "rgba(255,255,255,0.15)",
                  color: i === selectedChildIdx ? "oklch(0.35 0.18 268)" : "rgba(255,255,255,0.8)",
                }}
              >
                {c.avatar} {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Child summary card */}
        {child ? (
          <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              {child.avatar || "🧒"}
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-lg">{child.name}</p>
              <p className="text-white/60 text-sm font-semibold">
                Επίπεδο {level} · {levelName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(xpPct, 100))}%`, background: "oklch(0.89 0.11 51)" }}
                  />
                </div>
                <span className="text-white/70 text-xs font-semibold">
                  {child.xp}/{xpNext} XP
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-black">{child.coins}</p>
              <p className="text-white/60 text-xs font-semibold">🪙 KidsCoins</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 rounded-2xl p-4 text-center text-white/60 font-semibold text-sm">
            Δεν υπάρχει παιδί στο λογαριασμό σου ακόμα.
          </div>
        )}
      </div>

      {/* Tab nav */}
      <div className="px-5 py-3">
        <div className="flex gap-1 bg-white rounded-2xl p-1 ring-1 ring-border shadow-sm">
          {[
            { key: "overview", label: "Σύνοψη" },
            { key: "chores", label: pendingSubmissions.length > 0 ? `Δουλειές (${pendingSubmissions.length})` : "Δουλειές" },
            { key: "rewards", label: pendingRequests.length > 0 ? `Βραβεία (${pendingRequests.length})` : "Βραβεία" },
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

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Μαθήματα", value: String(lessonCount), icon: "📚" },
                { label: "Εγκρ. δουλ.", value: String(approvedChoreCount), icon: "✅" },
                { label: "Επενδύσεις", value: String(investCount), icon: "📈" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-3 ring-1 ring-border text-center shadow-sm">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="font-black text-gray-800 text-xl">{s.value}</p>
                  <p className="text-xs font-semibold text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {pendingSubmissions.length > 0 && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                style={{ background: "oklch(0.89 0.11 51 / 0.2)" }}
                onClick={() => setActiveTab("chores")}
              >
                <span className="text-2xl">⏳</span>
                <div className="flex-1">
                  <p className="font-black text-gray-800">{pendingSubmissions.length} δουλειές περιμένουν έγκριση</p>
                  <p className="text-sm text-gray-500 font-semibold">Πάτησε για να εγκρίνεις</p>
                </div>
                <span className="text-gray-400 font-bold">›</span>
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                style={{ background: "oklch(0.76 0.15 173 / 0.15)" }}
                onClick={() => setActiveTab("rewards")}
              >
                <span className="text-2xl">🎁</span>
                <div className="flex-1">
                  <p className="font-black text-gray-800">{pendingRequests.length} αιτήματα για βραβεία</p>
                  <p className="text-sm text-gray-500 font-semibold">Πάτησε για να διαχειριστείς</p>
                </div>
                <span className="text-gray-400 font-bold">›</span>
              </div>
            )}

            {child && (
              <div className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-black text-gray-800">Φόρτωσε KidsCoins</p>
                  <p className="text-sm text-gray-500 font-semibold">Υπόλοιπο: {child.coins} 🪙</p>
                </div>
                <button
                  onClick={() => setShowLoadCoins(true)}
                  className="font-black text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: "oklch(0.57 0.23 292)" }}
                >
                  + Φόρτωσε
                </button>
              </div>
            )}

            <h2 className="font-black text-gray-800 text-lg">Πρόσφατη Δραστηριότητα</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-semibold text-sm">Καμία δραστηριότητα ακόμα</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg">{tx.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-400 font-semibold">
                        {new Date(tx.created_at).toLocaleDateString("el-GR", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className="text-sm font-black shrink-0"
                      style={{ color: tx.amount >= 0 ? "oklch(0.55 0.20 142)" : "oklch(0.55 0.18 22)" }}
                    >
                      {tx.amount >= 0 ? "+" : ""}{tx.amount}🪙
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CHORES TAB */}
        {activeTab === "chores" && (
          <>
            <h2 className="font-black text-gray-800 text-lg">Εκκρεμείς Εγκρίσεις</h2>

            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-semibold">Όλα εγκρίθηκαν!</p>
                <p className="text-sm">Δεν υπάρχουν εκκρεμείς δουλειές</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => {
                const chore = getChore(submission.chore_id);
                const isBusy = busyId === submission.id;
                const ms = Date.now() - new Date(submission.submitted_at).getTime();
                const mins = Math.round(ms / 60000);
                const timeAgo = mins < 60 ? `πριν ${mins} λεπτά` : mins < 1440 ? `πριν ${Math.round(mins / 60)} ώρες` : `πριν ${Math.round(mins / 1440)} μέρες`;
                return (
                  <div key={submission.id} className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-gray-800">{chore?.emoji} {chore?.name ?? "Δουλειά"}</p>
                        <p className="text-xs text-gray-400 font-semibold">{child?.name} · {timeAgo}</p>
                      </div>
                      {chore && (
                        <div className="text-lg font-black px-3 py-1 rounded-xl" style={{ background: "oklch(0.89 0.11 51 / 0.2)", color: "oklch(0.60 0.15 51)" }}>
                          +{chore.coins}🪙
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewChore(submission.id, "rejected")}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-xl font-bold bg-red-50 text-red-500 ring-1 ring-red-100 transition-all hover:-translate-y-0.5 disabled:opacity-40"
                      >
                        ✗ Απόρριψη
                      </button>
                      <button
                        onClick={() => handleReviewChore(submission.id, "approved")}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
                        style={{ background: "oklch(0.65 0.20 142)" }}
                      >
                        {isBusy ? "…" : `✓ Έγκριση +${chore?.coins ?? 0}🪙`}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <h2 className="font-black text-gray-800 text-lg pt-2">Διαχείριση Δουλειών</h2>
            {chores.length === 0 ? (
              <p className="text-sm text-gray-400 font-semibold">Δεν υπάρχουν ενεργές δουλειές</p>
            ) : (
              <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
                {chores.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-4">
                    <span className="text-xl">{c.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700 text-sm">{c.name}</p>
                      {c.is_obligatory && <p className="text-xs text-gray-400 font-semibold">Υποχρεωτική · Δωρεάν</p>}
                    </div>
                    {!c.is_obligatory && (
                      <span className="text-sm font-black px-2 py-0.5 rounded-lg" style={{ background: "oklch(0.89 0.11 51 / 0.2)", color: "oklch(0.60 0.15 51)" }}>
                        {c.coins}🪙
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* REWARDS TAB */}
        {activeTab === "rewards" && (
          <>
            <h2 className="font-black text-gray-800 text-lg">Αιτήματα Βραβείων</h2>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🎁</p>
                <p className="font-semibold">Κανένα αίτημα αυτή τη στιγμή</p>
              </div>
            ) : (
              pendingRequests.map((request) => {
                const reward = getReward(request.reward_id);
                const isBusy = busyId === request.id;
                const canAfford = (child?.coins ?? 0) >= (reward?.cost ?? 0);
                return (
                  <div key={request.id} className="bg-white rounded-2xl p-4 ring-1 ring-border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "oklch(0.57 0.23 292 / 0.1)" }}>
                        {reward?.emoji ?? "🎁"}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-gray-800">{reward?.name ?? "Βραβείο"}</p>
                        <p className="text-sm font-bold" style={{ color: "oklch(0.57 0.23 292)" }}>
                          {reward?.cost ?? 0}🪙
                          {!canAfford && (
                            <span className="text-red-400 ml-2 text-xs">(λείπουν {(reward?.cost ?? 0) - (child?.coins ?? 0)}🪙)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveReward(request.id)}
                      disabled={!canAfford || isBusy}
                      className="w-full py-2.5 rounded-xl font-black text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:scale-95"
                      style={{ background: "oklch(0.65 0.20 142)" }}
                    >
                      {isBusy ? "Επεξεργασία…" : `✓ Δώσε την άδεια (-${reward?.cost ?? 0}🪙)`}
                    </button>
                  </div>
                );
              })
            )}

            <h2 className="font-black text-gray-800 text-lg pt-2">Κατάστημα Βραβείων</h2>
            <p className="text-sm text-gray-500 font-semibold -mt-2">Αυτά βλέπει το παιδί σου</p>
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-400 font-semibold">Δεν υπάρχουν ενεργά βραβεία</p>
            ) : (
              <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
                {rewards.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-4">
                    <span className="text-xl">{r.emoji}</span>
                    <p className="flex-1 font-semibold text-gray-700 text-sm">{r.name}</p>
                    <span className="text-sm font-black px-2 py-0.5 rounded-lg" style={{ background: "oklch(0.57 0.23 292 / 0.1)", color: "oklch(0.57 0.23 292)" }}>
                      {r.cost}🪙
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <>
            <h2 className="font-black text-gray-800 text-lg">Ρυθμίσεις</h2>

            <div className="bg-white rounded-2xl ring-1 ring-border shadow-sm divide-y divide-gray-100">
              {[
                { icon: "👦", label: "Προφίλ παιδιού", sub: child ? `${child.name} · Επίπεδο ${level}` : "—" },
                { icon: "🔔", label: "Ειδοποιήσεις", sub: "Ενεργές" },
                { icon: "🔒", label: "Όρια δαπανών", sub: "Χωρίς όριο" },
                { icon: "📊", label: "Εβδομαδιαία αναφορά", sub: "Κάθε Κυριακή" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{s.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400 font-semibold">{s.sub}</p>
                  </div>
                  <span className="text-gray-300 font-bold text-xl">›</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, oklch(0.57 0.23 292) 0%, oklch(0.50 0.25 268) 100%)" }}>
              <p className="text-white font-black text-lg mb-1">Kids in Business Premium</p>
              <p className="text-white/70 text-sm font-semibold mb-3">Πλήρης πρόσβαση σε όλα τα μαθήματα, επενδύσεις και εργαλεία</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
                  <p className="text-white font-black text-lg">€4.99</p>
                  <p className="text-white/60 text-xs font-semibold">/μήνα</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-3 text-center relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: "oklch(0.70 0.18 42)" }}>
                    BEST VALUE
                  </div>
                  <p className="font-black text-lg" style={{ color: "oklch(0.57 0.23 292)" }}>€39</p>
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
      {showLoadCoins && child && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h3 className="font-black text-gray-800 text-xl mb-1">Φόρτωσε KidsCoins</h3>
            <p className="text-gray-400 text-sm font-semibold mb-5">Υπόλοιπο: {child.coins} 🪙</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setLoadAmount(String(p))}
                  className="py-2.5 rounded-xl font-black text-sm transition-all"
                  style={{
                    background: loadAmount === String(p) ? "oklch(0.57 0.23 292)" : "oklch(0.97 0.01 292)",
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
              <button onClick={() => setShowLoadCoins(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600">
                Άκυρο
              </button>
              <button
                onClick={handleLoadCoins}
                disabled={!loadAmount || parseInt(loadAmount) <= 0 || busyId === "load"}
                className="flex-1 py-3 rounded-xl font-black text-white disabled:opacity-40 transition-all"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                {busyId === "load" ? "…" : "Φόρτωσε 🪙"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="flex items-stretch h-16 max-w-md mx-auto">
          {[
            { icon: "👨‍👩‍👦", label: "Αρχική", tabKey: "overview" },
            { icon: "⏳", label: pendingSubmissions.length > 0 ? `Εγκρίσεις (${pendingSubmissions.length})` : "Εγκρίσεις", tabKey: "chores" },
            { icon: "🎁", label: "Βραβεία", tabKey: "rewards" },
            { icon: "⚙️", label: "Ρυθμίσεις", tabKey: "settings" },
          ].map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(tab.tabKey as typeof activeTab)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
            >
              <span className="text-xl">{tab.icon}</span>
              <span
                className="text-[10px] font-black"
                style={{ color: activeTab === tab.tabKey ? "oklch(0.35 0.18 268)" : "oklch(0.60 0.01 292)" }}
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
