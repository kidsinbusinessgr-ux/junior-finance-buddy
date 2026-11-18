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

export function StartupReactions({ startupId, canReact }: { startupId: string; canReact: boolean }) {
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
      <p className="text-sm font-black">Τι λες για αυτή την ιδέα;</p>
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
      {!canReact && <p className="mt-2 text-xs text-muted-foreground">Συνδέσου ως παιδί για να αντιδράσεις.</p>}
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
      <div className="grid gap-4 sm:grid-cols-2">
        {growers.length > 0 && (
          <Board title="📈 Μεγαλύτερη άνοδος (7 μέρες)" rows={growers} value={(r) => `+🪙 ${r.growth.toLocaleString("el-GR")}`} />
        )}
        {streaks.length > 0 && (
          <Board title="🔥 Σερί CEO" rows={streaks} value={(r) => `${r.ceo_streak} ${r.ceo_streak === 1 ? "μέρα" : "μέρες"}`} />
        )}
      </div>
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
