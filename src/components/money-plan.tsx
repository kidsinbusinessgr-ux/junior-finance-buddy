import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// "Το πλάνο των χρημάτων μου" (Junior CEO Financial Tracker): the Kids in
// Business worksheet, made interactive. The month's expenses and income come
// from the child's book (jfb_ledger); the rest is saved per month in
// jfb_money_plans. Prints in colour, like the paper worksheet.

export type PlanExpense = { id: string; amount_cents: number; category: string; note: string | null; is_need: boolean | null };

type Plan = {
  allowance: string;
  goal: string;
  goalFor: string;
  needs: string;
  wants: string;
  savings: string;
  notes: string;
};

const EMPTY: Plan = { allowance: "", goal: "", goalFor: "", needs: "", wants: "", savings: "", notes: "" };

// Worksheet colours.
const C = {
  page: "#f9f0ee",
  rose: "#c4788a",
  roseBg: "#fce8ee",
  roseText: "#a85a6e",
  teal: "#4a9aa8",
  tealBg: "#e0f2f6",
  tealText: "#3a7f8c",
  gold: "#d4a843",
  goldBg: "#fdf6e1",
  goldText: "#b88a25",
  green: "#1fa077",
  greenBg: "#e0f3ec",
  brown: "#4a3530",
  line: "#eedede",
};

const toCents = (t: string) => {
  const c = t.trim().replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(c)) return 0;
  return Math.round(parseFloat(c) * 100);
};
const toText = (cents: number | null | undefined) => (cents ? (cents / 100).toFixed(2).replace(".", ",") : "");
const eur = (cents: number) => (cents / 100).toLocaleString("el-GR", { style: "currency", currency: "EUR" });

function MoneyBox({
  label,
  value,
  onChange,
  color,
  bg,
  text,
  placeholder = "0,00",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  bg: string;
  text: string;
  placeholder?: string;
}) {
  return (
    <label className="block rounded-2xl border-2 p-4" style={{ borderColor: color, background: bg }}>
      <span className="block text-sm font-bold" style={{ color: text }}>
        {label}
      </span>
      <span className="mt-2 flex items-center gap-1 border-b-2 pb-1" style={{ borderColor: color }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          placeholder={placeholder}
          className="w-full bg-transparent text-xl font-black outline-none placeholder:font-normal placeholder:opacity-40"
          style={{ color: C.brown }}
        />
        <span className="font-black" style={{ color: text }}>
          €
        </span>
      </span>
    </label>
  );
}

export function MoneyPlan({
  childId,
  name,
  month,
  monthLabel,
  income,
  expenses,
}: {
  childId: string;
  name: string;
  month: string;
  monthLabel: string;
  income: number;
  expenses: PlanExpense[];
}) {
  const [plan, setPlan] = useState<Plan>(EMPTY);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setState("idle");
    supabase
      .from("jfb_money_plans" as never)
      .select("allowance_cents, goal_cents, goal_for, needs_cents, wants_cents, savings_cents, notes")
      .eq("child_id", childId)
      .eq("month", month)
      .maybeSingle()
      .then(({ data }) => {
        const d = data as Record<string, number | string | null> | null;
        setPlan(
          d
            ? {
                allowance: toText(d.allowance_cents as number),
                goal: toText(d.goal_cents as number),
                goalFor: (d.goal_for as string) ?? "",
                needs: toText(d.needs_cents as number),
                wants: toText(d.wants_cents as number),
                savings: toText(d.savings_cents as number),
                notes: (d.notes as string) ?? "",
              }
            : EMPTY,
        );
      });
  }, [childId, month]);

  const set = (k: keyof Plan) => (v: string) => {
    setPlan((p) => ({ ...p, [k]: v }));
    setState("idle");
  };

  const spent = expenses.reduce((s, e) => s + e.amount_cents, 0);
  const allowance = toCents(plan.allowance);
  // What came in: the book's income, or the planned pocket money if none is written yet.
  const cameIn = income > 0 ? income : allowance;
  const left = cameIn - spent;
  const shared = toCents(plan.needs) + toCents(plan.wants) + toCents(plan.savings);
  const toShare = Math.max(0, left) - shared;
  const goal = toCents(plan.goal);
  const savings = toCents(plan.savings);

  // Quick split of what is left: 50% needs, 30% wants, 20% savings.
  const split = () => {
    if (left <= 0) return;
    const n = Math.round(left * 0.5);
    const w = Math.round(left * 0.3);
    setPlan((p) => ({ ...p, needs: toText(n), wants: toText(w), savings: toText(left - n - w) }));
    setState("idle");
  };

  async function save() {
    setState("saving");
    const { error } = await supabase.from("jfb_money_plans" as never).upsert(
      {
        child_id: childId,
        month,
        allowance_cents: allowance || null,
        goal_cents: goal || null,
        goal_for: plan.goalFor.trim().slice(0, 60) || null,
        needs_cents: toCents(plan.needs),
        wants_cents: toCents(plan.wants),
        savings_cents: savings,
        notes: plan.notes.trim().slice(0, 300) || null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "child_id,month" },
    );
    setState(error ? "error" : "saved");
  }

  return (
    <div id="money-plan" className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-border" style={{ background: C.page }}>
      <style>{`@media print {
  @page { size: A4; margin: 10mm; }
  body * { visibility: hidden !important; }
  #money-plan, #money-plan * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #money-plan { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
  #money-plan .no-print { display: none !important; }
  #money-plan input, #money-plan textarea { border: none; }
}`}</style>
      <div className="h-2" style={{ background: `linear-gradient(90deg, ${C.rose}, ${C.teal}, ${C.gold})` }} />
      <div className="p-4 sm:p-6">
        <div className="text-center">
          <p className="text-3xl sm:text-4xl" style={{ color: C.roseText }}>
            Το πλάνο των χρημάτων μου
          </p>
          <p className="mt-1 text-lg font-black sm:text-xl" style={{ color: "#8a6f6f" }}>
            Junior CEO Financial Tracker
          </p>
        </div>

        {/* Pocket money and goal */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MoneyBox label="Το χαρτζιλίκι μου είναι:" value={plan.allowance} onChange={set("allowance")} color={C.rose} bg={C.roseBg} text={C.roseText} />
          <MoneyBox label="Στόχος αποταμίευσης:" value={plan.goal} onChange={set("goal")} color={C.teal} bg={C.tealBg} text={C.tealText} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
          <div className="rounded-2xl border-2 bg-white p-4" style={{ borderColor: C.line }}>
            <p className="text-sm font-bold" style={{ color: C.brown }}>
              Όνομα:
            </p>
            <p className="mt-2 truncate border-b-2 pb-1 font-black" style={{ borderColor: C.brown, color: C.brown }}>
              {name}
            </p>
          </div>
          <div className="rounded-2xl border-2 bg-white p-4" style={{ borderColor: C.line }}>
            <p className="text-sm font-bold" style={{ color: C.brown }}>
              Μήνας:
            </p>
            <p className="mt-2 truncate border-b-2 pb-1 font-black" style={{ borderColor: C.brown, color: C.brown }}>
              {monthLabel}
            </p>
          </div>
          <label className="block rounded-2xl border-2 p-4" style={{ borderColor: C.gold, background: C.goldBg }}>
            <span className="block text-sm font-bold" style={{ color: C.brown }}>
              Θέλω να αποταμιεύσω για:
            </span>
            <input
              value={plan.goalFor}
              onChange={(e) => set("goalFor")(e.target.value)}
              maxLength={60}
              placeholder="π.χ. ακουστικά"
              className="mt-2 w-full border-b-2 bg-transparent pb-1 font-black outline-none placeholder:font-normal placeholder:opacity-40"
              style={{ borderColor: C.brown, color: C.brown }}
            />
          </label>
        </div>

        {/* Monthly expenses */}
        <div className="mt-6">
          <p className="rounded-t-xl py-2 text-center text-lg font-black text-white" style={{ background: C.teal }}>
            Μηνιαία έξοδα
          </p>
          <div className="overflow-hidden rounded-b-xl border" style={{ borderColor: C.line }}>
            <div className="grid grid-cols-[1fr_90px_110px] text-xs font-black text-white sm:grid-cols-[1fr_120px_140px] sm:text-sm">
              <span className="p-2" style={{ background: C.rose }}>
                Πού ξοδεύω τα χρήματά μου:
              </span>
              <span className="p-2" style={{ background: C.teal }}>
                Ποσό:
              </span>
              <span className="p-2" style={{ background: C.gold }}>
                Ανάγκη ή επιθυμία
              </span>
            </div>
            {expenses.length === 0 ? (
              <p className="bg-white p-4 text-center text-sm" style={{ color: "#8a6f6f" }}>
                Δεν υπάρχουν έξοδα αυτόν τον μήνα. Γράψε ένα έξοδο από τη φόρμα «Έξοδο», και θα εμφανιστεί εδώ.
              </p>
            ) : (
              expenses.map((e, i) => (
                <div
                  key={e.id}
                  className="grid grid-cols-[1fr_90px_110px] border-t text-sm sm:grid-cols-[1fr_120px_140px]"
                  style={{ borderColor: C.line, background: i % 2 ? C.page : "#fff", color: C.brown }}
                >
                  <span className="truncate p-2">
                    {e.category}
                    {e.note ? ` · ${e.note}` : ""}
                  </span>
                  <span className="border-l p-2 font-bold" style={{ borderColor: C.line }}>
                    {eur(e.amount_cents)}
                  </span>
                  <span className="border-l p-2" style={{ borderColor: C.line }}>
                    {e.is_need === true ? "✅ Ανάγκη" : e.is_need === false ? "✨ Επιθυμία" : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6">
          <p className="rounded-xl px-4 py-2 font-black text-white" style={{ background: C.brown }}>
            Σύνοψη μήνα:
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              [income > 0 ? "Μου μπήκαν:" : "Το χαρτζιλίκι μου ήταν:", cameIn, C.teal, C.tealBg, C.tealText],
              ["Τα έξοδά μου ήταν:", spent, C.rose, C.roseBg, C.roseText],
              ["Μου περίσσεψε:", left, C.green, C.greenBg, C.green],
            ].map(([label, v, color, bg, text]) => (
              <div key={label as string} className="rounded-2xl border-2 p-3" style={{ borderColor: color as string, background: bg as string }}>
                <p className="text-xs font-bold sm:text-sm" style={{ color: text as string }}>
                  {label as string}
                </p>
                <p className={`mt-2 text-lg font-black sm:text-xl ${(v as number) < 0 ? "text-red-600" : ""}`} style={(v as number) < 0 ? undefined : { color: C.brown }}>
                  {eur(v as number)}
                </p>
              </div>
            ))}
          </div>
          {income === 0 && allowance > 0 && (
            <p className="mt-2 text-xs" style={{ color: "#8a6f6f" }}>
              Δεν έχεις γράψει έσοδα αυτόν τον μήνα, γι' αυτό υπολογίζουμε με το χαρτζιλίκι που έβαλες πάνω.
            </p>
          )}
        </div>

        {/* Three piggy banks */}
        <div className="mt-6">
          <p className="rounded-xl px-4 py-2 text-center font-black text-white" style={{ background: C.teal }}>
            Οι 3 κουμπαράδες μου: πώς μοίρασα τα χρήματα που μου περίσσεψαν
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MoneyBox label="🧺 Ανάγκες · τα απαραίτητα" value={plan.needs} onChange={set("needs")} color={C.teal} bg={C.tealBg} text={C.tealText} />
            <MoneyBox label="🎈 Επιθυμίες · τα θέλω μου" value={plan.wants} onChange={set("wants")} color={C.rose} bg={C.roseBg} text={C.roseText} />
            <MoneyBox label="🐷 Αποταμίευση · για κάτι μεγαλύτερο" value={plan.savings} onChange={set("savings")} color={C.gold} bg={C.goldBg} text={C.goldText} />
          </div>
          <div className="no-print mt-2 flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: C.brown }}>
            {left <= 0 ? (
              <span>Δε σου περίσσεψαν χρήματα για να τα μοιράσεις αυτόν τον μήνα.</span>
            ) : toShare === 0 ? (
              <span className="font-bold" style={{ color: C.green }}>
                ✓ Μοίρασες όλα όσα σου περίσσεψαν.
              </span>
            ) : toShare > 0 ? (
              <span>
                Μένουν να μοιράσεις <b>{eur(toShare)}</b>.
              </span>
            ) : (
              <span className="font-bold text-red-600">Μοίρασες {eur(-toShare)} περισσότερα απ' όσα σου περίσσεψαν.</span>
            )}
            {left > 0 && (
              <button onClick={split} className="rounded-full border-2 px-3 py-1 text-xs font-black" style={{ borderColor: C.teal, color: C.tealText }}>
                Μοίρασέ τα 50 / 30 / 20
              </button>
            )}
          </div>
          {goal > 0 && (
            <div className="mt-3">
              <p className="text-sm" style={{ color: C.brown }}>
                🎯 Στόχος{plan.goalFor.trim() ? ` «${plan.goalFor.trim()}»` : ""}: {eur(savings)} από {eur(goal)} αυτόν τον μήνα
              </p>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((savings / goal) * 100))}%`, background: C.gold }} />
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <label className="mt-6 block rounded-2xl border-2 bg-white p-4" style={{ borderColor: C.line }}>
          <span className="block text-sm font-black" style={{ color: C.brown }}>
            Σημειώσεις / Στόχος επόμενου μήνα:
          </span>
          <textarea
            value={plan.notes}
            onChange={(e) => set("notes")(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="π.χ. τον επόμενο μήνα θα ξοδέψω λιγότερα σε σνακ και θα βάλω 5 € παραπάνω στον κουμπαρά."
            className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:opacity-50"
            style={{ color: C.brown }}
          />
        </label>

        <div className="no-print mt-4 grid gap-2 sm:grid-cols-2">
          <button
            onClick={save}
            disabled={state === "saving"}
            className="rounded-full py-3 font-black text-white disabled:opacity-60"
            style={{ background: C.teal }}
          >
            {state === "saving" ? "Αποθήκευση…" : state === "saved" ? "✓ Αποθηκεύτηκε" : "Αποθήκευσε το πλάνο"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-full border-2 bg-white py-3 font-black"
            style={{ borderColor: C.rose, color: C.roseText }}
          >
            <Printer size={18} /> Εκτύπωση σε χρώμα
          </button>
        </div>
        {state === "error" && <p className="no-print mt-2 text-center text-sm font-bold text-red-600">Δεν αποθηκεύτηκε. Δοκίμασε ξανά.</p>}
      </div>
      <p className="py-3 text-center text-sm text-white" style={{ background: C.brown }}>
        KidsInBusiness.gr | Σταυρούλα Αρνιθενού | Ρόδος 2026
      </p>
    </div>
  );
}
