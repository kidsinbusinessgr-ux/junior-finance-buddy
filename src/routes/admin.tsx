import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASSWORD = "kidsbiz2026";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Stats {
  totalParents: number;
  totalChildren: number;
  activeChildren7d: number;
  activeChildren30d: number;
  totalChoresApproved: number;
  totalCoinsGiven: number;
  waitlistCount: number;
  bookRegistrations: number;
  parentsWithChildren: number;
  newParentsThisMonth: number;
  newChildrenThisMonth: number;
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Λάθος κωδικός.");
    }
  }

  useEffect(() => {
    if (!authenticated) return;
    async function fetchStats() {
      setLoading(true);
      setFetchError("");
      try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [
          parentsRes,
          childrenRes,
          active7Res,
          active30Res,
          choresRes,
          coinsRes,
          waitlistRes,
          bookRes,
          childrenParentRes,
          newParentsRes,
          newChildrenRes,
        ] = await Promise.all([
          supabase.from("jfb_parents").select("*", { count: "exact", head: true }),
          supabase.from("jfb_children").select("*", { count: "exact", head: true }),
          supabase.from("jfb_children").select("*", { count: "exact", head: true }).gte("last_login_date", sevenDaysAgo),
          supabase.from("jfb_children").select("*", { count: "exact", head: true }).gte("last_login_date", thirtyDaysAgo),
          supabase.from("jfb_chore_submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("jfb_transactions").select("amount").gt("amount", 0),
          supabase.from("waitlist").select("*", { count: "exact", head: true }),
          supabase.from("book_registrations").select("*", { count: "exact", head: true }),
          supabase.from("jfb_children").select("parent_id"),
          supabase.from("jfb_parents").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
          supabase.from("jfb_children").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
        ]);

        const totalCoinsGiven = (coinsRes.data ?? []).reduce(
          (sum: number, t: { amount: number }) => sum + t.amount,
          0
        );
        const uniqueParentIds = new Set(
          (childrenParentRes.data ?? []).map((c: { parent_id: string }) => c.parent_id)
        );

        setStats({
          totalParents: parentsRes.count ?? 0,
          totalChildren: childrenRes.count ?? 0,
          activeChildren7d: active7Res.count ?? 0,
          activeChildren30d: active30Res.count ?? 0,
          totalChoresApproved: choresRes.count ?? 0,
          totalCoinsGiven,
          waitlistCount: waitlistRes.count ?? 0,
          bookRegistrations: bookRes.count ?? 0,
          parentsWithChildren: uniqueParentIds.size,
          newParentsThisMonth: newParentsRes.count ?? 0,
          newChildrenThisMonth: newChildrenRes.count ?? 0,
        });
      } catch {
        setFetchError("Σφάλμα φόρτωσης δεδομένων.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [authenticated]);

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-xs bg-white rounded-2xl p-8 shadow-sm ring-1 ring-gray-200">
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">🔐</p>
            <h1 className="text-xl font-black text-gray-800">Founder Dashboard</h1>
            <p className="text-sm text-gray-400 font-semibold mt-1">Kids in Business</p>
          </div>
          {authError && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-2 mb-4 text-center">
              {authError}
            </div>
          )}
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Κωδικός πρόσβaσης"
              autoFocus
              required
              className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-black text-white transition-all hover:-v_translate-y-0.5 active:scale-95"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              Είσοδος →
            </button>
          </form>
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

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-semibold">
              ⚠️ <strong>Σημείωση ασφάλειας:</strong> Ο πίνακας <code>jfb_achievements</code> έχει απενεργοποιθμένο RLS.
              Ενεργοποιησέ το στο Supabase dashboard πριν την κυκλοφορία στο κοινό.
            </div>
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
