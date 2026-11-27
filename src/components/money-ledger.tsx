import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// The child's own book of real income and expenses, in euros. It is not the
// KidsCoins of the game: the child writes down what really came in and what
// they really spent, sets a monthly budget per category, and marks each
// expense as a need or a want. Only the child sees it (RLS on jfb_ledger).

type Kind = "income" | "expense";
type Entry = {
  id: string;
  kind: Kind;
  amount_cents: number;
  category: string;
  note: string | null;
  is_need: boolean | null;
  occurred_on: string;
};
type Budget = { category: string; amount_cents: number };

export const INCOME_CATEGORIES = [
  { name: "Χαρτζιλίκι", emoji: "💶" },
  { name: "Δώρο", emoji: "🎁" },
  { name: "Δουλειά", emoji: "🧰" },
  { name: "Πούλησα κάτι", emoji: "🏷️" },
  { name: "Άλλο έσοδο", emoji: "➕" },
];

export const EXPENSE_CATEGORIES = [
  { name: "Φαγητό και σνακ", emoji: "🍔" },
  { name: "Έξοδοι με φίλους", emoji: "🎉" },
  { name: "Κινητό και apps", emoji: "📱" },
  { name: "Παιχνίδια", emoji: "🎮" },
  { name: "Ρούχα", emoji: "👕" },
  { name: "Σχολείο", emoji: "📚" },
  { name: "Μεταφορές", emoji: "🚌" },
  { name: "Δώρα για άλλους", emoji: "💝" },
  { name: "Άλλο έξοδο", emoji: "🧾" },
];

const emojiFor = (category: string) =>
  [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].find((c) => c.name === category)?.emoji ?? "•";

export const euroCents = (cents: number) =>
  (cents / 100).toLocaleString("el-GR", { style: "currency", currency: "EUR" });

// "2,50" or "2.50" → 250 cents; null when it isn't a positive amount.
export function parseEuro(text: string): number | null {
  const clean = text.trim().replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(clean)) return null;
  const cents = Math.round(parseFloat(clean) * 100);
  return cents > 0 && cents <= 10000000 ? cents : null;
}

const today = () => new Date().toLocaleDateString("sv-SE");
const thisMonth = () => today().slice(0, 7);
function shiftMonth(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString("el-GR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const dayLabel = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("el-GR", { day: "numeric", month: "short" });

const field = "w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary";

export function MoneyLedger({ childId }: { childId: string }) {
  const [month, setMonth] = useState(thisMonth());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const [kind, setKind] = useState<Kind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [isNeed, setIsNeed] = useState<boolean | null>(null);
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [editBudget, setEditBudget] = useState<string | null>(null);
  const [budgetText, setBudgetText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: rows }, { data: b }] = await Promise.all([
      supabase
        .from("jfb_ledger" as never)
        .select("id, kind, amount_cents, category, note, is_need, occurred_on")
        .eq("child_id", childId)
        .gte("occurred_on", `${month}-01`)
        .lt("occurred_on", `${shiftMonth(month, 1)}-01`)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("jfb_ledger_budgets" as never).select("category, amount_cents").eq("child_id", childId),
    ]);
    setEntries((rows ?? []) as unknown as Entry[]);
    setBudgets((b ?? []) as unknown as Budget[]);
    setLoading(false);
  }, [childId, month]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount_cents, 0);
    const expenses = entries.filter((e) => e.kind === "expense");
    const spent = expenses.reduce((s, e) => s + e.amount_cents, 0);
    const needs = expenses.filter((e) => e.is_need === true).reduce((s, e) => s + e.amount_cents, 0);
    const wants = expenses.filter((e) => e.is_need === false).reduce((s, e) => s + e.amount_cents, 0);
    const byCategory = new Map<string, number>();
    for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount_cents);
    return { income, spent, needs, wants, left: income - spent, byCategory };
  }, [entries]);

  const budgetOf = (c: string) => budgets.find((b) => b.category === c)?.amount_cents ?? null;

  async function add() {
    const cents = parseEuro(amount);
    if (!cents) return setError("Γράψε ένα ποσό σε ευρώ, π.χ. 2,50.");
    if (!category) return setError(kind === "income" ? "Διάλεξε από πού ήρθαν τα χρήματα." : "Διάλεξε σε τι τα ξόδεψες.");
    if (kind === "expense" && isNeed === null) return setError("Ήταν ανάγκη ή επιθυμία;");
    if (date > today()) return setError("Η ημερομηνία δεν μπορεί να είναι στο μέλλον.");
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("jfb_ledger" as never).insert({
      child_id: childId,
      kind,
      amount_cents: cents,
      category,
      note: note.trim().slice(0, 80) || null,
      is_need: kind === "expense" ? isNeed : null,
      occurred_on: date,
    } as never);
    setBusy(false);
    if (err) return setError("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
    setSaved(kind === "income" ? `Γράφτηκε έσοδο ${euroCents(cents)}.` : `Γράφτηκε έξοδο ${euroCents(cents)}.`);
    setAmount("");
    setNote("");
    setIsNeed(null);
    if (date.slice(0, 7) !== month) setMonth(date.slice(0, 7));
    else load();
  }

  async function remove(id: string) {
    await supabase.from("jfb_ledger" as never).delete().eq("id", id);
    load();
  }

  async function saveBudget(c: string) {
    const text = budgetText.trim();
    if (!text) {
      await supabase.from("jfb_ledger_budgets" as never).delete().eq("child_id", childId).eq("category", c);
    } else {
      const cents = parseEuro(text);
      if (!cents) return;
      await supabase
        .from("jfb_ledger_budgets" as never)
        .upsert({ child_id: childId, category: c, amount_cents: cents } as never, { onConflict: "child_id,category" });
    }
    setEditBudget(null);
    load();
  }

  const categories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isCurrent = month === thisMonth();
  const topCategory = [...stats.byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  const overBudget = EXPENSE_CATEGORIES.filter((c) => {
    const b = budgetOf(c.name);
    return b !== null && (stats.byCategory.get(c.name) ?? 0) > b;
  });

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-2xl bg-[oklch(0.96_0.03_150)] p-4 text-sm text-[oklch(0.32_0.08_150)]">
        <Lock size={16} className="mt-0.5 shrink-0" />
        <span>
          Εδώ γράφεις τα <b>αληθινά</b> σου χρήματα, σε ευρώ: ό,τι σου μπαίνει και ό,τι ξοδεύεις. Δεν είναι τα KidsCoins του παιχνιδιού. Το
          βιβλίο σου το βλέπεις μόνο εσύ.
        </span>
      </p>

      {/* Month */}
      <div className="flex items-center justify-between rounded-2xl bg-card p-2 ring-1 ring-border">
        <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Προηγούμενος μήνας" className="rounded-xl p-2 hover:bg-muted">
          <ChevronLeft size={20} />
        </button>
        <p className="font-black">{monthLabel(month)}</p>
        <button
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={isCurrent}
          aria-label="Επόμενος μήνας"
          className="rounded-xl p-2 hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-[oklch(0.95_0.05_150)] p-3 text-center">
          <p className="text-xs font-bold text-[oklch(0.4_0.1_150)]">Έσοδα</p>
          <p className="mt-1 font-black text-[oklch(0.35_0.12_150)]">{euroCents(stats.income)}</p>
        </div>
        <div className="rounded-2xl bg-[oklch(0.95_0.04_25)] p-3 text-center">
          <p className="text-xs font-bold text-[oklch(0.45_0.12_25)]">Έξοδα</p>
          <p className="mt-1 font-black text-[oklch(0.45_0.16_25)]">{euroCents(stats.spent)}</p>
        </div>
        <div className="rounded-2xl bg-[oklch(0.94_0.05_292)] p-3 text-center">
          <p className="text-xs font-bold text-[oklch(0.45_0.12_292)]">Έμειναν</p>
          <p className={`mt-1 font-black ${stats.left < 0 ? "text-red-600" : "text-[oklch(0.4_0.18_292)]"}`}>{euroCents(stats.left)}</p>
        </div>
      </div>

      {/* What the month says */}
      {!loading && entries.length > 0 && (
        <div className="space-y-1.5 rounded-2xl bg-card p-4 text-sm ring-1 ring-border">
          {stats.income > 0 && stats.left >= 0 && (
            <p>
              🐷 Κράτησες το <b>{Math.round((stats.left / stats.income) * 100)}%</b> από όσα σου μπήκαν.
              {stats.left / stats.income >= 0.2 ? " Πολύ καλά!" : " Δοκίμασε να κρατάς τουλάχιστον το 20%."}
            </p>
          )}
          {stats.left < 0 && <p>⚠️ Ξόδεψες περισσότερα απ' όσα σου μπήκαν αυτόν τον μήνα. Πού θα μπορούσες να κόψεις;</p>}
          {topCategory && (
            <p>
              {emojiFor(topCategory[0])} Τα περισσότερα έξοδα πήγαν σε «{topCategory[0]}»: {euroCents(topCategory[1])}.
            </p>
          )}
          {stats.needs + stats.wants > 0 && (
            <p>
              🤔 Από τα έξοδά σου, το <b>{Math.round((stats.wants / (stats.needs + stats.wants)) * 100)}%</b> ήταν επιθυμίες.
            </p>
          )}
          {overBudget.length > 0 && <p>🚦 Ξεπέρασες το όριο σε: {overBudget.map((c) => c.name).join(", ")}.</p>}
        </div>
      )}

      {/* Add */}
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
          {(["expense", "income"] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                setKind(k);
                setCategory("");
                setError(null);
              }}
              className={`rounded-lg py-2 text-sm font-black ${kind === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              {k === "expense" ? "➖ Έξοδο" : "➕ Έσοδο"}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="Ποσό σε €, π.χ. 2,50"
            aria-label="Ποσό σε ευρώ"
            className={`${field} text-lg font-bold`}
          />
          <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} aria-label="Ημερομηνία" className={field} />
        </div>

        <p className="mt-3 text-sm font-bold">{kind === "income" ? "Από πού ήρθαν;" : "Σε τι τα ξόδεψες;"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setCategory(c.name)}
              className={`rounded-full border px-3 py-1.5 text-sm ${category === c.name ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {kind === "expense" && (
          <>
            <p className="mt-3 text-sm font-bold">Ήταν ανάγκη ή επιθυμία;</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { v: true, label: "✅ Ανάγκη", hint: "το χρειαζόμουν" },
                { v: false, label: "✨ Επιθυμία", hint: "το ήθελα" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  onClick={() => setIsNeed(o.v)}
                  className={`rounded-xl border p-2 text-sm ${isNeed === o.v ? "border-primary bg-primary/10 font-black" : "border-border hover:bg-muted"}`}
                >
                  {o.label}
                  <span className="block text-xs font-normal text-muted-foreground">{o.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={80}
          placeholder="Σημείωση (προαιρετική), π.χ. σουβλάκι με τον Νίκο"
          className={`${field} mt-3 text-sm`}
        />
        {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
        {saved && !error && <p className="mt-2 text-sm font-bold text-[oklch(0.45_0.14_150)]">✓ {saved}</p>}
        <button
          disabled={busy}
          onClick={add}
          className="mt-3 w-full rounded-full bg-primary py-3 font-black text-primary-foreground disabled:opacity-50"
        >
          {busy ? "…" : kind === "income" ? "Γράψε το έσοδο" : "Γράψε το έξοδο"}
        </button>
      </div>

      {/* Budgets */}
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="font-black">Όρια ανά μήνα</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Βάλε πόσα θέλεις να ξοδεύεις το πολύ σε κάθε κατηγορία. Έτσι φτιάχνεις τον δικό σου προϋπολογισμό.
        </p>
        <ul className="mt-3 space-y-3">
          {EXPENSE_CATEGORIES.map((c) => {
            const spent = stats.byCategory.get(c.name) ?? 0;
            const budget = budgetOf(c.name);
            if (!budget && !spent && editBudget !== c.name) {
              return (
                <li key={c.name} className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {c.emoji} {c.name}
                  </span>
                  <button
                    onClick={() => {
                      setEditBudget(c.name);
                      setBudgetText("");
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + όριο
                  </button>
                </li>
              );
            }
            const pct = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const over = budget !== null && spent > budget;
            return (
              <li key={c.name} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">
                    {c.emoji} {c.name}
                  </span>
                  {editBudget === c.name ? (
                    <span className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={budgetText}
                        onChange={(e) => setBudgetText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveBudget(c.name)}
                        inputMode="decimal"
                        placeholder="€"
                        aria-label={`Όριο για ${c.name}`}
                        className="w-20 rounded-lg border border-border p-1 text-right"
                      />
                      <button onClick={() => saveBudget(c.name)} className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                        OK
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setEditBudget(c.name);
                        setBudgetText(budget ? String(budget / 100).replace(".", ",") : "");
                      }}
                      className={`text-xs font-bold ${over ? "text-red-600" : "text-muted-foreground"} hover:underline`}
                    >
                      {euroCents(spent)}
                      {budget ? ` από ${euroCents(budget)}` : " · + όριο"}
                    </button>
                  )}
                </div>
                {budget !== null && (
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${over ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-[oklch(0.6_0.17_150)]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Για να σβήσεις ένα όριο, άφησε το ποσό κενό και πάτα OK.</p>
      </div>

      {/* Entries */}
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="font-black">Κινήσεις του μήνα</p>
        {loading ? (
          <p className="mt-2 text-sm text-muted-foreground">Φορτώνει…</p>
        ) : entries.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Δεν έχεις γράψει τίποτα αυτόν τον μήνα. Ξεκίνα με το χαρτζιλίκι σου και με ό,τι ξόδεψες σήμερα.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl">{emojiFor(e.category)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {e.category}
                    {e.is_need === false && <span className="ml-1.5 text-xs font-normal text-muted-foreground">· επιθυμία</span>}
                    {e.is_need === true && <span className="ml-1.5 text-xs font-normal text-muted-foreground">· ανάγκη</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dayLabel(e.occurred_on)}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 font-black ${e.kind === "income" ? "text-[oklch(0.45_0.14_150)]" : "text-[oklch(0.5_0.16_25)]"}`}>
                  {e.kind === "income" ? "+" : "−"}
                  {euroCents(e.amount_cents)}
                </span>
                <button onClick={() => remove(e.id)} aria-label={`Σβήσε: ${e.category}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
