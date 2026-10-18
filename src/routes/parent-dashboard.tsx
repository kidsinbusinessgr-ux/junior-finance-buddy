import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  useParent,
  useParentChildren,
  usePendingSubmissions,
  approveChoreSubmission,
  rejectChoreSubmission,
  sendAllowanceCoins,
  type PendingSubmission,
} from "@/hooks/useJFB";

export const Route = createFileRoute("/parent-dashboard")({
  component: ParentDashboard,
});

function ParentDashboard() {
  const navigate = useNavigate();
  const parent = useParent();
  const { children, refresh: refreshChildren } = useParentChildren(parent?.id);
  const { submissions, refresh: refreshSubmissions } = usePendingSubmissions(parent?.id);

  const [selectedChild, setSelectedChild] = useState<string>("");
  const [allowanceCoins, setAllowanceCoins] = useState<number>(50);
  const [allowanceNote, setAllowanceNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  async function handleApprove(sub: PendingSubmission) {
    setActing(sub.id);
    await approveChoreSubmission(
      sub.id,
      sub.child_id,
      sub.jfb_chores?.name ?? "",
      sub.jfb_chores?.emoji ?? "🧹",
      sub.jfb_chores?.coins ?? 0,
    );
    await refreshSubmissions();
    await refreshChildren();
    setActing(null);
  }

  async function handleReject(sub: PendingSubmission) {
    setActing(sub.id);
        await rejectChoreSubmission(sub.id, sub.child_id, sub.jfb_chores?.name ?? "");
    await refreshSubmissions();
    setActing(null);
  }

  async function handleSendAllowance() {
    if (!selectedChild || allowanceCoins <= 0) return;
    setSending(true);
    await sendAllowanceCoins(selectedChild, allowanceCoins, allowanceNote);
    await refreshChildren();
    setSending(false);
    setSendDone(true);
    setAllowanceNote("");
    setTimeout(() => setSendDone(false), 2500);
  }

  const levelEmoji = (lvl: number) =>
    lvl >= 10 ? "🏆" : lvl >= 5 ? "⭐" : lvl >= 3 ? "🌟" : "🌱";

  if (!parent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.01_250)]">
        <p className="text-[oklch(0.5_0.04_250)]">Φόρτωση…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_250)] px-4 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[oklch(0.97_0.01_250)] py-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-full bg-white p-2 shadow text-[oklch(0.4_0.1_250)]"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-[oklch(0.3_0.08_250)]">
          👨‍👩‍👧 {parent.name}
        </h1>
        <div className="w-10" />
      </div>

      {/* Children overview */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-[oklch(0.35_0.08_250)]">
          Τα παιδιά μου
        </h2>
        {children.length === 0 ? (
          <p className="text-[oklch(0.55_0.04_250)]">Δεν υπάρχουν παιδιά ακόμα.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <span className="text-3xl">{c.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[oklch(0.3_0.08_250)]">{c.name}</p>
                  <p className="text-sm text-[oklch(0.5_0.04_250)]">
                    🪙 {c.coins} · 🔥 {c.current_streak} · {levelEmoji(c.level)} Lv {c.level}
                  </p>
                  {(c as any).invite_code && (
                    <p className="text-xs mt-1 font-mono font-bold tracking-widest text-purple-600 bg-purple-50 rounded-lg px-2 py-0.5 inline-block">
                      🔑 {(c as any).invite_code}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending submissions */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-[oklch(0.35_0.08_250)]">
          Εκκρεμείς δουλειές
        </h2>
        {submissions.length === 0 ? (
          <p className="text-[oklch(0.55_0.04_250)]">Καμία εκκρεμής υποβολή. ✅</p>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <span className="text-2xl">{sub.jfb_chores?.emoji ?? "🧹"}</span>
                <div className="flex-1">
                  <p className="font-medium text-[oklch(0.3_0.08_250)]">
                    {sub.jfb_children?.name} — {sub.jfb_chores?.name}
                  </p>
                  <p className="text-sm text-[oklch(0.5_0.04_250)]">
                    🪙 {sub.jfb_chores?.coins} νομίσματα
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={acting === sub.id}
                    onClick={() => handleApprove(sub)}
                    className="rounded-xl bg-[oklch(0.65_0.18_145)] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    ✓
                  </button>
                  <button
                    disabled={acting === sub.id}
                    onClick={() => handleReject(sub)}
                    className="rounded-xl bg-[oklch(0.65_0.18_25)] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Send allowance */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[oklch(0.35_0.08_250)]">
          💸 Στείλε χαρτζιλίκι
        </h2>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="mb-3 w-full rounded-xl border border-[oklch(0.85_0.04_250)] p-3 text-[oklch(0.3_0.08_250)]"
        >
          <option value="">Επίλεξε παιδί…</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.avatar} {c.name}
            </option>
          ))}
        </select>
        <div className="mb-3 flex gap-2">
          {[10, 25, 50, 100].map((amt) => (
            <button
              key={amt}
              onClick={() => setAllowanceCoins(amt)}
              className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${allowanceCoins === amt ? "bg-[oklch(0.55_0.18_250)] text-white" : "bg-[oklch(0.94_0.03_250)] text-[oklch(0.4_0.08_250)]"}`}
            >
              {amt}🪙
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={allowanceCoins}
          onChange={(e) => setAllowanceCoins(Number(e.target.value))}
          className="mb-3 w-full rounded-xl border border-[oklch(0.85_0.04_250)] p-3 text-[oklch(0.3_0.08_250)]"
          placeholder="Ή γράψε ποσό…"
        />
        <input
          type="text"
          value={allowanceNote}
          onChange={(e) => setAllowanceNote(e.target.value)}
          className="mb-4 w-full rounded-xl border border-[oklch(0.85_0.04_250)] p-3 text-[oklch(0.3_0.08_250)]"
          placeholder="Σημείωση (προαιρετικό)"
        />
        <button
          disabled={!selectedChild || sending}
          onClick={handleSendAllowance}
          className="w-full rounded-2xl bg-[oklch(0.55_0.18_250)] py-3 font-bold text-white disabled:opacity-50"
        >
          {sendDone ? "✅ Στάλθηκε!" : sending ? "Αποστολή…" : "Στείλε χαρτζιλίκι"}
        </button>
      </section>
    </div>
  );
}
