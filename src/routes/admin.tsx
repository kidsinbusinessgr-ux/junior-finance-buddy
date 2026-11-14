import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAdminStats, type AdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

// Access is checked on the server (ADMIN_EMAILS); the page only shows what it gets back.
function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [denied, setDenied] = useState<"login" | "forbidden" | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    getAdminStats()
      .then((res) => {
        if (res.ok) setStats(res.stats);
        else if (res.reason === "failed") setFetchError("Σφάλμα φόρτωσης δεδομένων.");
        else setDenied(res.reason);
      })
      .catch(() => setFetchError("Σφάλμα φόρτωσης δεδομένων."))
      .finally(() => setLoading(false));
  }, []);

  if (denied) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-xs bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <p className="text-3xl mb-2">🔐</p>
          <h1 className="text-xl font-black text-gray-800">Founder Dashboard</h1>
          <p className="text-sm text-gray-500 font-semibold mt-3">
            {denied === "login"
              ? "Συνδέσου με τον λογαριασμό διαχειριστή για να δεις τα στατιστικά."
              : "Αυτός ο λογαριασμός δεν έχει πρόσβαση σε αυτή τη σελίδα."}
          </p>
          {denied === "login" && (
            <Link
              to="/login"
              className="mt-5 inline-block w-full py-3 rounded-xl font-black text-white"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              Σύνδεση →
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-black text-gray-800">Founder Dashboard</h1>
          </div>
          <p className="text-gray-400 font-semibold text-sm ml-9">
            Kids in Business ·{" "}
            {new Date().toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {fetchError && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-6">
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-semibold animate-pulse">Φόρτωση…</div>
        ) : stats ? (
          <>
            <section className="mb-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                Χρήστες
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard emoji="👨‍👩‍👧" label="Γονείς" value={stats.totalParents} sub="σύνολο" />
                <StatCard emoji="🎒" label="Παιδιά / Μαθητές" value={stats.totalChildren} sub="σύνολο" />
                <StatCard
                  emoji="✅"
                  label="Γονείς με παιδί"
                  value={stats.parentsWithChildren}
                  sub={
                    stats.totalParents > 0
                      ? `${Math.round((stats.parentsWithChildren / stats.totalParents) * 100)}% activation`
                      : "—"
                  }
                  highlight
                />
                <StatCard emoji="🆕" label="Νέοι γονείς" value={stats.newParentsThisMonth} sub="αυτόν τον μήνα" />
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                Ενεργότητα
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  emoji="🔥"
                  label="Ενεργά παιδιά"
                  value={stats.activeChildren7d}
                  sub="τελευταίες 7 μέρες"
                  highlight
                />
                <StatCard
                  emoji="📅"
                  label="Ενεργά παιδιά"
                  value={stats.activeChildren30d}
                  sub="τελευταίες 30 μέρες"
                />
                <StatCard
                  emoji="🧹"
                  label="Δουλειές ολοκληρωμένες"
                  value={stats.totalChoresApproved}
                  sub="εγκεκριμένες"
                />
                <StatCard
                  emoji="🪙"
                  label="Νομίσματα"
                  value={stats.totalCoinsGiven}
                  sub="διανεμήθηκαν συνολικά"
                />
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                Pipeline & Αγορά
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard emoji="📋" label="Waitlist" value={stats.waitlistCount} sub="εγγεγραμμένοι" />
                <StatCard emoji="📖" label="Book Registrations" value={stats.bookRegistrations} sub="παιδιά" />
                <StatCard emoji="🌱" label="Νέα παιδιά" value={stats.newChildrenThisMonth} sub="αυτόν τον μήνα" />
              </div>
            </section>

            <section className="bg-white rounded-2xl ring-1 ring-gray-200 p-6 mb-6">
              <h2 className="text-sm font-black text-gray-700 mb-5">Funnel μετατροπής</h2>
              <div className="space-y-4">
                {(() => {
                  const maxVal = Math.max(
                    stats.waitlistCount,
                    stats.totalParents,
                    stats.parentsWithChildren,
                    stats.activeChildren7d,
                    1
                  );
                  return (
                    <>
                      <FunnelRow label="Waitlist" value={stats.waitlistCount} max={maxVal} color="bg-blue-400" />
                      <FunnelRow label="Εγγεγραμμένοι γονείς" value={stats.totalParents} max={maxVal} color="bg-purple-500" />
                      <FunnelRow
                        label="Γονείς που ενεργοποίησαν παιδί"
                        value={stats.parentsWithChildren}
                        max={maxVal}
                        color="bg-green-500"
                      />
                      <FunnelRow
                        label="Ενεργά παιδιά (7 μέρες)"
                        value={stats.activeChildren7d}
                        max={maxVal}
                        color="bg-yellow-400"
                      />
                    </>
                  );
                })()}
              </div>
            </section>

          </>
        ) : null}
      </div>
    </main>
  );
}

function StatCard({
  emoji,
  label,
  value,
  sub,
  highlight,
}: {
  emoji: string;
  label: string;
  value: number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ring-1 ${
        highlight ? "bg-purple-50 ring-purple-200" : "bg-white ring-gray-200"
      }`}
    >
      <p className="text-xl mb-1">{emoji}</p>
      <p className={`text-3xl font-black tabular-nums ${highlight ? "text-purple-700" : "text-gray-800"}`}>
        {value.toLocaleString("el-GR")}
      </p>
      <p className="text-xs font-black text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 font-semibold">{sub}</p>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-bold text-gray-600">{label}</span>
        <span className="text-xs font-black text-gray-800 tabular-nums">
          {value}{" "}
          <span className="text-gray-400 font-semibold">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
