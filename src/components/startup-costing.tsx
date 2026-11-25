import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveStartupPlan } from "@/lib/startups.functions";
import { EXAMPLE_COSTING, costingResult, euro, type CostItem, type Costing } from "@/lib/startup-plan";

// Costing and break-even, from the workbook's «Κόστος» page: what you pay once,
// what every piece costs, the selling price, and how many pieces you must sell
// to get your money back. The chart shows where the two lines meet.

const EMPTY: Costing = {
  unit: "",
  price: 0,
  fixed: [{ name: "", eur: 0 }],
  variable: [{ name: "", eur: 0 }],
  expected: 0,
};

// «0,45» or «0.45» → 0.45
function parseEuro(s: string) {
  const n = Number(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 100000) : 0;
}
const show = (n: number) => (n ? String(n).replace(".", ",") : "");

function MoneyInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const [text, setText] = useState(show(value));
  const ref = useRef<HTMLInputElement>(null);
  // Follow changes from outside (the price slider), but not while typing.
  useEffect(() => {
    if (document.activeElement !== ref.current) setText(show(value));
  }, [value]);
  return (
    <div className="relative w-28 shrink-0">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
      <input
        ref={ref}
        inputMode="decimal"
        aria-label={label}
        value={text}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d.,]/g, "");
          setText(t);
          onChange(parseEuro(t));
        }}
        onBlur={() => setText(show(value))}
        placeholder="0"
        className="w-full rounded-lg border bg-background py-2 pl-7 pr-2 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
      />
    </div>
  );
}

function CostList({
  title,
  hint,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  hint: string;
  items: CostItem[];
  onChange: (items: CostItem[]) => void;
  placeholder: string;
}) {
  const total = items.reduce((s, i) => s + i.eur, 0);
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="font-black">{title}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it.name}
              maxLength={40}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
            />
            <MoneyInput
              key={`${i}-${items.length}`}
              value={it.eur}
              label={`Κόστος για ${it.name || "αυτή τη γραμμή"}`}
              onChange={(eur) => onChange(items.map((x, j) => (j === i ? { ...x, eur } : x)))}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Σβήσε τη γραμμή"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        {items.length < 12 ? (
          <button
            type="button"
            onClick={() => onChange([...items, { name: "", eur: 0 }])}
            className="inline-flex items-center gap-1 text-sm font-bold text-[oklch(0.5_0.2_292)]"
          >
            <Plus size={16} /> Πρόσθεσε
          </button>
        ) : (
          <span />
        )}
        <p className="text-sm font-black">Σύνολο: {euro(Math.round(total * 100) / 100)}</p>
      </div>
    </div>
  );
}

// Cost line and revenue line, and the point where they meet.
export function BreakEvenChart({ costing }: { costing: Costing }) {
  const r = costingResult(costing);
  const xMax = Math.max(10, r.breakEven ? Math.ceil(r.breakEven * 2) : 0, Math.ceil(costing.expected * 1.2));
  const cost = (x: number) => r.fixedTotal + r.unitCost * x;
  const rev = (x: number) => costing.price * x;
  const yMax = Math.max(cost(xMax), rev(xMax), 1) * 1.08;

  const W = 600, H = 280, L = 54, R = 16, T = 16, B = 40;
  const px = (x: number) => L + (x / xMax) * (W - L - R);
  const py = (y: number) => H - B - (y / yMax) * (H - T - B);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const be = r.breakEven;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Γράφημα break-even: κόστος και έσοδα ανάλογα με τα κομμάτια που πουλάς">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={py(yMax * t)} y2={py(yMax * t)} stroke="currentColor" strokeOpacity={0.1} />
          <text x={L - 6} y={py(yMax * t) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity={0.6}>
            €{Math.round(yMax * t)}
          </text>
          <text x={px(xMax * t)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.6}>
            {Math.round(xMax * t)}
          </text>
        </g>
      ))}
      <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="currentColor" opacity={0.7}>
        {costing.unit ? `πόσα ${costing.unit} πουλάς` : "πόσα κομμάτια πουλάς"}
      </text>
      {/* loss area before break-even, profit area after */}
      {be !== null && be <= xMax && (
        <>
          <rect x={L} y={T} width={px(be) - L} height={H - T - B} fill="#ef4444" opacity={0.05} />
          <rect x={px(be)} y={T} width={W - R - px(be)} height={H - T - B} fill="#16a34a" opacity={0.06} />
          <text x={L + 8} y={T + 16} fontSize="12" fill="#dc2626" fontWeight="700">Ζημιά</text>
          <text x={W - R - 8} y={T + 16} fontSize="12" fill="#15803d" fontWeight="700" textAnchor="end">Κέρδος</text>
        </>
      )}
      <line x1={px(0)} y1={py(cost(0))} x2={px(xMax)} y2={py(cost(xMax))} stroke="#f2709c" strokeWidth={3} strokeLinecap="round" />
      <line x1={px(0)} y1={py(rev(0))} x2={px(xMax)} y2={py(rev(xMax))} stroke="#16a34a" strokeWidth={3} strokeLinecap="round" />
      {be !== null && be <= xMax && (
        <g>
          <line x1={px(be)} x2={px(be)} y1={py(rev(be))} y2={H - B} stroke="#7c4dff" strokeDasharray="4 4" />
          <circle cx={px(be)} cy={py(rev(be))} r={7} fill="#7c4dff" stroke="#fff" strokeWidth={2} />
          <text
            x={px(be)}
            y={py(rev(be)) - 14}
            textAnchor={px(be) > W - 140 ? "end" : "middle"}
            fontSize="13"
            fontWeight="800"
            fill="#7c4dff"
          >
            Break-even: {be}
          </text>
        </g>
      )}
      <g fontSize="12" fontWeight="700">
        <rect x={L + 8} y={H - B - 44} width={12} height={4} fill="#f2709c" />
        <text x={L + 26} y={H - B - 39} fill="currentColor">Κόστος</text>
        <rect x={L + 8} y={H - B - 26} width={12} height={4} fill="#16a34a" />
        <text x={L + 26} y={H - B - 21} fill="currentColor">Έσοδα</text>
      </g>
    </svg>
  );
}

// What visitors see: the numbers in short.
export function CostingSummary({ costing }: { costing: Costing }) {
  const r = costingResult(costing);
  const unit = costing.unit || "κομμάτι";
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">🧮 Κοστολόγηση</h3>
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {[
          ["Τιμή", euro(costing.price)],
          ["Κόστος / " + unit, euro(r.unitCost)],
          ["Κέρδος / " + unit, euro(r.profitPerUnit)],
          ["Break-even", r.breakEven === null ? "—" : `${r.breakEven}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs font-bold text-muted-foreground">{k}</p>
            <p className="mt-1 text-xl font-black">{v}</p>
          </div>
        ))}
      </div>
      {r.breakEven !== null && (
        <p className="mt-3 text-sm text-muted-foreground">
          Πρέπει να πουλήσει {r.breakEven} {unit} για να πάρει πίσω τα {euro(r.fixedTotal)} που θα ξοδέψει στην αρχή.
        </p>
      )}
    </div>
  );
}

export function StartupCosting({
  startupId,
  initial,
  onSaved,
}: {
  startupId: string;
  initial?: Costing;
  onSaved: (c: Costing) => void;
}) {
  const [c, setC] = useState<Costing>(initial ?? EMPTY);
  const [formKey, setFormKey] = useState(0); // remounts the money inputs after «Δες παράδειγμα»
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const r = useMemo(() => costingResult(c), [c]);
  const unit = c.unit.trim() || "κομμάτι";

  const priceMax = Math.max(10, Math.ceil(Math.max(r.unitCost * 4, c.price * 1.5)));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const clean: Costing = {
      ...c,
      unit: c.unit.trim(),
      fixed: c.fixed.filter((i) => i.name.trim() || i.eur).map((i) => ({ name: i.name.trim(), eur: i.eur })),
      variable: c.variable.filter((i) => i.name.trim() || i.eur).map((i) => ({ name: i.name.trim(), eur: i.eur })),
    };
    try {
      const res = await saveStartupPlan({ data: { startupId, part: "costing", value: clean } });
      if (res.ok) {
        onSaved(clean);
        setMsg({ ok: true, text: "Αποθηκεύτηκε! Οι επενδυτές βλέπουν τώρα τα νούμερά σου." });
      } else {
        setMsg({ ok: false, text: res.reason === "bad_words" ? "Ας κρατήσουμε τα κείμενα ευγενικά 😊" : "Δεν αποθηκεύτηκε. Δοκίμασε ξανά." });
      }
    } catch {
      setMsg({ ok: false, text: "Δεν αποθηκεύτηκε. Δοκίμασε ξανά." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5" key={formKey}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">🧮 Κοστολόγηση και break-even</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Γράψε τι θα πληρώσεις και σε ποια τιμή θα πουλάς. Θα δεις πόσα πρέπει να πουλήσεις για να πάρεις πίσω τα χρήματά σου.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setC(EXAMPLE_COSTING);
            setFormKey((k) => k + 1);
          }}
        >
          Δες παράδειγμα 🧁
        </Button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold">Τι πουλάς; (ένα κομμάτι)</label>
        <input
          value={c.unit}
          maxLength={30}
          onChange={(e) => setC({ ...c, unit: e.target.value })}
          placeholder="π.χ. cupcake, βόλτα σκύλου, μπλουζάκι"
          className="w-full rounded-xl border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
        />
      </div>

      <CostList
        title="1. Κόστη που πληρώνεις μία φορά"
        hint="Εξοπλισμός και εργαλεία, που αγοράζεις στην αρχή και σου φτάνουν για πολλά κομμάτια."
        items={c.fixed}
        onChange={(fixed) => setC({ ...c, fixed })}
        placeholder="π.χ. φόρμα, μίξερ, εκτυπωτής"
      />
      <CostList
        title={`2. Κόστος για κάθε ${unit}`}
        hint="Υλικά και συσκευασία που χρειάζεσαι ξανά για κάθε κομμάτι που φτιάχνεις."
        items={c.variable}
        onChange={(variable) => setC({ ...c, variable })}
        placeholder="π.χ. υλικά, κουτάκι, ετικέτα"
      />

      <div className="rounded-2xl border bg-card p-4">
        <p className="font-black">3. Η τιμή πώλησης</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <MoneyInput value={c.price} label="Τιμή πώλησης" onChange={(price) => setC({ ...c, price })} />
          <input
            type="range"
            min={0}
            max={priceMax}
            step={0.1}
            value={c.price}
            onChange={(e) => setC({ ...c, price: Number(e.target.value) })}
            className="min-w-[160px] flex-1 accent-[oklch(0.57_0.23_292)]"
            aria-label="Άλλαξε την τιμή"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Κούνησε την μπάρα και δες πώς αλλάζει το break-even.</p>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Κόστη μία φορά", euro(r.fixedTotal)],
          [`Κόστος / ${unit}`, euro(r.unitCost)],
          [`Κέρδος / ${unit}`, euro(r.profitPerUnit)],
          ["Break-even", r.breakEven === null ? "—" : `${r.breakEven} ${unit}`],
        ].map(([k, v], i) => (
          <div key={k} className={`rounded-2xl p-3 text-center ${i === 3 ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted/50"}`}>
            <p className={`text-xs font-bold ${i === 3 ? "text-white/80" : "text-muted-foreground"}`}>{k}</p>
            <p className="mt-1 text-lg font-black">{v}</p>
          </div>
        ))}
      </div>

      {r.profitPerUnit <= 0 && (c.price > 0 || r.unitCost > 0) ? (
        <p className="rounded-xl bg-[oklch(0.95_0.04_25)] p-4 text-sm font-bold text-destructive">
          ⚠️ Με αυτή την τιμή χάνεις χρήματα σε κάθε {unit}. Η τιμή πρέπει να είναι μεγαλύτερη από το κόστος του ({euro(r.unitCost)}).
        </p>
      ) : r.breakEven !== null && r.fixedTotal > 0 ? (
        <p className="rounded-xl bg-[oklch(0.95_0.05_173)] p-4 text-sm text-[oklch(0.3_0.1_173)]">
          Κάθε {unit} σου αφήνει <b>{euro(r.profitPerUnit)}</b>. Για να πάρεις πίσω τα <b>{euro(r.fixedTotal)}</b> που θα ξοδέψεις στην αρχή,
          πρέπει να πουλήσεις <b>{r.breakEven}</b>. Από εκεί και πέρα, κάθε πώληση είναι κέρδος.
        </p>
      ) : null}

      <div className="rounded-2xl border bg-card p-4 text-foreground">
        <BreakEvenChart costing={c} />
        <p className="mt-2 text-xs text-muted-foreground">
          Break-even (νεκρό σημείο) = κόστη μία φορά ÷ κέρδος ανά κομμάτι. Εκεί που η πράσινη γραμμή περνάει πάνω από τη ροζ, αρχίζει το κέρδος.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <p className="font-black">4. Πόσα πιστεύεις ότι θα πουλήσεις;</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0}
            max={100000}
            value={c.expected || ""}
            onChange={(e) => setC({ ...c, expected: Math.max(0, Math.min(100000, Math.floor(Number(e.target.value) || 0))) })}
            className="w-28 rounded-lg border bg-background px-3 py-2 text-right font-bold"
            aria-label="Πόσα θα πουλήσεις"
          />
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {c.expected > 0 && (
          <p className={`mt-3 text-sm font-bold ${r.expectedProfit >= 0 ? "text-[oklch(0.45_0.14_160)]" : "text-destructive"}`}>
            {r.expectedProfit >= 0
              ? `Αν πουλήσεις ${c.expected}, θα έχεις κέρδος ${euro(r.expectedProfit)}. 🎉`
              : `Αν πουλήσεις ${c.expected}, θα έχεις ζημιά ${euro(-r.expectedProfit)}. Χρειάζεσαι περισσότερες πωλήσεις ή άλλη τιμή.`}
          </p>
        )}
      </div>

      {msg && (
        <p className={`rounded-xl p-3 text-sm font-bold ${msg.ok ? "bg-[oklch(0.93_0.06_173)] text-[oklch(0.3_0.1_173)]" : "bg-destructive/10 text-destructive"}`}>
          {msg.text}
        </p>
      )}
      <Button onClick={save} disabled={saving || c.price <= 0} className="h-12 w-full rounded-full font-black">
        {saving ? "Αποθήκευση…" : "💾 Αποθήκευσε την κοστολόγηση"}
      </Button>
    </div>
  );
}
