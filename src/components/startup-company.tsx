import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  answerDecision,
  getFounderToday,
  type DecisionView,
} from "@/lib/startups.functions";
import { stageFor } from "@/lib/startup-stages";
import { hasSubscription, pushSupported, saveSubscription, subscribeThisBrowser, type PushState } from "@/lib/push-client";

// The company's numbers, shown to everyone on the startup page.
export type CompanyNumbers = {
  id: string;
  customers: number;
  cash: number;
  reputation: number;
  team: number;
  valuation: number;
  ceo_streak: number;
};

const fmt = (n: number) => n.toLocaleString("el-GR");

export function CompanyStats({ company }: { company: CompanyNumbers }) {
  const [history, setHistory] = useState<{ day: string; valuation: number }[]>([]);
  const { stage, next } = stageFor(company.valuation);

  useEffect(() => {
    supabase
      .from("jfb_startup_history" as never)
      .select("day, valuation")
      .eq("startup_id", company.id)
      .order("day", { ascending: true })
      .limit(30)
      .then(({ data }) => setHistory((data ?? []) as { day: string; valuation: number }[]));
  }, [company.id, company.valuation]);

  const progress = next ? Math.min(100, Math.round(((company.valuation - stage.min) / (next.min - stage.min)) * 100)) : 100;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Αξία εταιρείας</p>
          <p className="text-3xl font-black">🪙 {fmt(company.valuation)}</p>
        </div>
        <div className="rounded-full bg-[oklch(0.94_0.05_292)] px-4 py-2 text-sm font-black text-[oklch(0.4_0.18_292)]">
          {stage.emoji} {stage.name}
        </div>
      </div>

      {next && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[oklch(0.57_0.23_292)]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Επόμενο στάδιο: {next.emoji} {next.name} στα 🪙 {fmt(next.min)}
          </p>
        </div>
      )}

      {history.length > 1 && <ValueChart points={history.map((h) => h.valuation)} />}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat emoji="👥" label="Πελάτες" value={fmt(company.customers)} />
        <Stat emoji="💰" label="Ταμείο" value={`🪙 ${fmt(company.cash)}`} />
        <Stat emoji="⭐" label="Φήμη" value={`${company.reputation}/100`} />
        <Stat emoji="🧑‍🤝‍🧑" label="Ομάδα" value={fmt(company.team)} />
      </div>
    </div>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-xs font-bold text-muted-foreground">{emoji} {label}</p>
      <p className="mt-0.5 text-lg font-black">{value}</p>
    </div>
  );
}

// A small line of the company's value over the played days.
function ValueChart({ points }: { points: number[] }) {
  const w = 300;
  const h = 60;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * w).toFixed(1)},${(h - ((p - min) / span) * (h - 6) - 3).toFixed(1)}`)
    .join(" ");
  const up = points[points.length - 1]! >= points[0]!;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-16 w-full" preserveAspectRatio="none" aria-label="Η αξία της εταιρείας τις τελευταίες μέρες">
      <path d={d} fill="none" stroke={up ? "oklch(0.6 0.17 150)" : "oklch(0.6 0.2 25)"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const EFFECT_LABELS: [key: string, emoji: string, label: string][] = [
  ["customers", "👥", "Πελάτες"],
  ["cash", "💰", "Ταμείο"],
  ["reputation", "⭐", "Φήμη"],
  ["team", "🧑‍🤝‍🧑", "Ομάδα"],
];

// The founder's daily decision. Only shown to the startup's own founder.
export function FounderDecision({
  startupId,
  streak,
  onDone,
}: {
  startupId: string;
  streak: number;
  onDone: () => void;
}) {
  const [view, setView] = useState<DecisionView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = () =>
    getFounderToday({ data: { startupId } })
      .then((res) => (res.ok ? setView(res.today) : setError("Δε βρέθηκε η απόφαση της ημέρας.")))
      .catch(() => setError("Δε βρέθηκε η απόφαση της ημέρας. Δοκίμασε ξανά σε λίγο."));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupId]);

  const choose = async (choice: number) => {
    if (!view) return;
    setSending(true);
    setError(null);
    try {
      const res = await answerDecision({ data: { startupId, cardId: view.card.id, choice } });
      if (res.ok) {
        setView({ ...view, decided: { choice, result: res.result, lesson: res.lesson, effects: res.effects } });
        onDone();
      } else if (res.reason === "already" || res.reason === "stale") {
        await load();
      } else {
        setError("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
      }
    } catch {
      setError("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
    } finally {
      setSending(false);
    }
  };

  if (!view) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
        {error ?? "Φορτώνει η απόφαση της ημέρας…"}
      </div>
    );
  }

  const { card, decided } = view;
  const fx = decided?.effects ?? {};
  return (
    <div className="rounded-2xl border-2 border-[oklch(0.57_0.23_292)] bg-[oklch(0.97_0.02_292)] p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.45_0.2_292)]">🗓️ Απόφαση της ημέρας</p>
        {streak > 0 && (
          <span className="rounded-full bg-[oklch(0.95_0.08_70)] px-3 py-1 text-xs font-black text-[oklch(0.45_0.14_60)]">
            🔥 {streak} {streak === 1 ? "μέρα" : "μέρες"} CEO
          </span>
        )}
      </div>
      <h3 className="mt-3 text-xl font-black">{card.emoji} {card.title}</h3>
      <p className="mt-1 text-base">{card.text}</p>

      {!decided ? (
        <div className="mt-4 space-y-2">
          {card.choices.map((label, i) => (
            <button
              key={i}
              disabled={sending}
              onClick={() => choose(i)}
              className="w-full rounded-xl border-2 bg-white px-4 py-3 text-left text-sm font-bold transition-all hover:border-[oklch(0.57_0.23_292)] disabled:opacity-60"
            >
              {label}
            </button>
          ))}
          {error && <p className="text-sm font-bold text-destructive">{error}</p>}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="rounded-xl bg-white px-4 py-3 text-sm">
            <span className="font-black">Επέλεξες: </span>{card.choices[decided.choice]}
          </p>
          <p className="text-sm font-bold">{decided.result}</p>
          <div className="flex flex-wrap gap-2">
            {EFFECT_LABELS.filter(([k]) => fx[k]).map(([k, emoji, label]) => (
              <span key={k} className={`rounded-full px-3 py-1 text-xs font-black ${fx[k]! > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {emoji} {label} {fx[k]! > 0 ? "+" : ""}{fx[k]}
              </span>
            ))}
          </div>
          {(fx["revenue"] !== undefined || fx["costs"] !== undefined) && (
            <p className="text-xs text-muted-foreground">
              Σημερινά έσοδα από πελάτες: 🪙 {fx["revenue"] ?? 0} · Έξοδα ομάδας: 🪙 {fx["costs"] ?? 0}
            </p>
          )}
          {(fx["missed"] ?? 0) > 0 && (
            <p className="text-xs font-bold text-[oklch(0.5_0.18_40)]">
              Έλειψες {fx["missed"]} {fx["missed"] === 1 ? "μέρα" : "μέρες"} και η εταιρεία έχασε λίγη φήμη και πελάτες. Έλα κάθε μέρα.
            </p>
          )}
          <div className="rounded-xl bg-[oklch(0.95_0.05_170)] px-4 py-3 text-sm">
            <span className="font-black">💡 Τι μαθαίνουμε: </span>{decided.lesson}
          </div>
          <p className="text-center text-xs font-bold text-muted-foreground">Έλα αύριο για την επόμενη απόφαση. 👋</p>
        </div>
      )}
    </div>
  );
}

// "Remind me every morning" for founders. A browser that already gets
// notifications is linked to the founder quietly, so reminders reach it too.
export function FounderReminder() {
  const [state, setState] = useState<PushState | "idle" | "checking">("checking");

  useEffect(() => {
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }
    hasSubscription().then(async (has) => {
      if (!has) return setState("idle");
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) await saveSubscription(sub);
      } catch { /* the reminder still works for the stock note */ }
      setState("subscribed");
    });
  }, []);

  if (state === "checking" || state === "unsupported") return null;
  if (state === "subscribed") {
    return (
      <p className="rounded-xl bg-green-50 px-4 py-2 text-xs font-black text-green-700">
        🔔 Θα σου θυμίζουμε κάθε πρωί την απόφαση της ημέρας.
      </p>
    );
  }
  if (state === "denied") {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600">
        🔕 Οι ειδοποιήσεις είναι κλειστές στον browser σου.
      </p>
    );
  }
  return (
    <button
      onClick={async () => setState(await subscribeThisBrowser())}
      className="w-full rounded-xl bg-muted px-4 py-2 text-xs font-black hover:bg-muted/70"
    >
      {state === "error" ? "Κάτι πήγε στραβά. Δοκίμασε ξανά 🔔" : "🔔 Θύμιζέ μου κάθε πρωί την απόφαση της ημέρας"}
    </button>
  );
}
