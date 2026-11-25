import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { stageFor } from "@/lib/startup-stages";

// Startups phase 4: emoji reactions (fixed set, no free text) and the
// leaderboard. Data comes from jfb_startup_reaction_counts,
// jfb_toggle_startup_reaction and jfb_startup_leaderboard.

const EMOJIS = ["🔥", "💡", "🚀", "❤️", "👏"] as const;
const EMOJI_LABELS: Record<(typeof EMOJIS)[number], string> = {
  "🔥": "Τέλειο",
  "💡": "Έξυπνη ιδέα",
  "🚀": "Θα πετύχει",
  "❤️": "Μου αρέσει",
  "👏": "Μπράβο",
};

type Count = { emoji: string; total: number; mine: boolean };

// Only other children react: the founder sees the counts but can't vote for their own idea.
export function StartupReactions({ startupId, canReact, isFounder = false }: { startupId: string; canReact: boolean; isFounder?: boolean }) {
  const [counts, setCounts] = useState<Count[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () =>
    supabase
      .rpc("jfb_startup_reaction_counts" as never, { p_startup_id: startupId } as never)
      .then(({ data }) => setCounts((data ?? []) as unknown as Count[]));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  const toggle = async (emoji: string) => {
    if (!canReact || busy) return;
    setBusy(true);
    await supabase.rpc("jfb_toggle_startup_reaction" as never, { p_startup_id: startupId, p_emoji: emoji } as never);
    await load();
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm font-black">{isFounder ? "Τι λένε οι άλλοι για την ιδέα σου" : "Τι λες για αυτή την ιδέα;"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {EMOJIS.map((e) => {
          const c = counts.find((x) => x.emoji === e);
          return (
            <button
              key={e}
              onClick={() => toggle(e)}
              disabled={!canReact || busy}
              title={EMOJI_LABELS[e]}
              className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-black transition-all ${
                c?.mine ? "border-[oklch(0.57_0.23_292)] bg-[oklch(0.95_0.04_292)]" : "bg-background hover:bg-muted"
              } disabled:cursor-default`}
            >
              <span className="text-lg">{e}</span>
              <span>{c?.total ?? 0}</span>
            </button>
          );
        })}
      </div>
      {isFounder ? (
        <p className="mt-2 text-xs text-muted-foreground">Τις αντιδράσεις τις δίνουν οι άλλοι μαθητές. Δείξε το startup σου στους φίλους σου.</p>
      ) : !canReact && <p className="mt-2 text-xs text-muted-foreground">Συνδέσου ως μαθητής για να αντιδράσεις.</p>}
    </div>
  );
}

type Row = { id: string; name: string; emoji: string; valuation: number; growth: number; ceo_streak: number };

// Week's champions on the startups list.
export function StartupLeaderboard() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase
      .rpc("jfb_startup_leaderboard" as never)
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]));
  }, []);

  const growers = [...rows].filter((r) => r.growth > 0).sort((a, b) => b.growth - a.growth).slice(0, 5);
  const streaks = [...rows].filter((r) => r.ceo_streak > 0).sort((a, b) => b.ceo_streak - a.ceo_streak).slice(0, 5);
  const star = growers[0];
  if (!star && !streaks.length) return null;

  return (
    <div className="mb-10 space-y-4">
      {star && (
        <Link to="/startups/$id" params={{ id: star.id }}
          className="block rounded-2xl bg-gradient-to-r from-[oklch(0.75_0.17_70)] to-[oklch(0.7_0.2_30)] p-5 text-white shadow-lg transition-all hover:-translate-y-0.5">
          <p className="text-xs font-black uppercase tracking-widest opacity-90">⭐ Startup της εβδομάδας</p>
          <p className="mt-1 text-2xl font-black">{star.emoji} {star.name}</p>
          <p className="text-sm font-bold opacity-95">
            +🪙 {star.growth.toLocaleString("el-GR")} αξία σε 7 μέρες · {stageFor(star.valuation).stage.emoji} {stageFor(star.valuation).stage.name}
          </p>
        </Link>
      )}
      {streaks.length > 0 && (
        <Board title="🔥 Σερί CEO" rows={streaks} value={(r) => `${r.ceo_streak} ${r.ceo_streak === 1 ? "μέρα" : "μέρες"}`} />
      )}
    </div>
  );
}

const MONTHS_GEN = [
  "Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
  "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου",
];
const MEDALS = ["🥇", "🥈", "🥉"];

type SeasonRow = { id: string; name: string; emoji: string; valuation: number; growth: number };
type Winner = { rank: number; startup_id: string | null; name: string; emoji: string; growth: number; prize: number };

// This month's season race and last month's winners.
export function SeasonBoard() {
  const [rows, setRows] = useState<SeasonRow[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const now = new Date();
  const monthName = MONTHS_GEN[now.getMonth()]!;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastSeason = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}-01`;
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysLeft = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / 86400000));

  useEffect(() => {
    supabase
      .rpc("jfb_startup_season_board" as never)
      .then(({ data }) => setRows(((data ?? []) as unknown as SeasonRow[]).sort((a, b) => b.growth - a.growth).slice(0, 5)));
    supabase
      .from("jfb_startup_season_results" as never)
      .select("rank, startup_id, name, emoji, growth, prize")
      .eq("season", lastSeason)
      .order("rank")
      .then(({ data }) => setWinners((data ?? []) as unknown as Winner[]));
  }, [lastSeason]);

  if (!rows.length && !winners.length) return null;

  return (
    <div className="mb-10 space-y-4">
      <div className="rounded-2xl border-2 border-[oklch(0.75_0.17_70)] bg-[oklch(0.98_0.03_80)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-black">Σεζόν {monthName}</h2>
          <p className="text-xs font-bold text-muted-foreground">
            Λήγει σε {daysLeft} {daysLeft === 1 ? "μέρα" : "μέρες"}
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Κερδίζει όποια εταιρεία ανεβάσει περισσότερο την αξία της μέσα στον μήνα. Βραβεία για τον ιδρυτή:
          🥇 🚀100 · 🥈 🚀50 · 🥉 🚀25 επενδυτικά κέρματα. Κάθε μήνα ο αγώνας ξεκινά από την αρχή.
        </p>
        <ol className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <li key={r.id}>
              <Link to="/startups/$id" params={{ id: r.id }}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm hover:shadow">
                <span className="font-bold">{MEDALS[i] ?? `${i + 1}.`} {r.emoji} {r.name}</span>
                <span className={`font-black ${r.growth > 0 ? "text-green-700" : r.growth < 0 ? "text-red-600" : ""}`}>
                  {r.growth > 0 ? "+" : ""}{r.growth.toLocaleString("el-GR")}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {winners.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-black">👑 Νικητές σεζόν {MONTHS_GEN[lastMonth.getMonth()]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {winners.map((w) => (
              <span key={w.rank} className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold">
                {MEDALS[w.rank - 1]} {w.emoji} {w.name} <span className="text-green-700">+{w.growth.toLocaleString("el-GR")}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Board({ title, rows, value }: { title: string; rows: Row[]; value: (r: Row) => string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm font-black">{title}</p>
      <ol className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <li key={r.id}>
            <Link to="/startups/$id" params={{ id: r.id }} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm hover:bg-muted">
              <span className="font-bold">{i + 1}. {r.emoji} {r.name}</span>
              <span className="font-black">{value(r)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
