import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Printer, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChild } from "@/hooks/useJFB";
import { useLessonWork } from "@/hooks/useLessonWork";
import { SaveNote } from "@/components/brainstorm-workshop";
import { saveStartupPlan } from "@/lib/startups.functions";
import { readPlan, type Costing } from "@/lib/startup-plan";

// Lesson 10 (Τιμολόγηση και νεκρό σημείο) workshop: the workbook's "Κόστος"
// page, one sheet for each product. The child lists the materials and what
// they cost for one piece (a material that is enough for many pieces is
// divided), sets the selling price and sees the profit. A sheet can go into
// the startup's costing (price and cost per piece), where the break-even is.

type Row = { name: string; eur: string; pieces: string };
type Product = { name: string; rows: Row[]; price: string; qty: string };
type Sheet = { products: Product[] };

const MAX_PRODUCTS = 5;
const MAX_ROWS = 10;
const emptyRow = (): Row => ({ name: "", eur: "", pieces: "1" });
const emptyProduct = (): Product => ({ name: "", rows: [emptyRow(), emptyRow(), emptyRow()], price: "", qty: "10" });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
function parseSheet(raw: unknown): Sheet {
  const d = (raw ?? {}) as Partial<Sheet>;
  const products = Array.isArray(d.products)
    ? d.products.slice(0, MAX_PRODUCTS).map((p) => ({
        name: str(p?.name, 30),
        rows: Array.isArray(p?.rows)
          ? p.rows.slice(0, MAX_ROWS).map((r) => ({ name: str(r?.name, 40), eur: str(r?.eur, 10), pieces: str(r?.pieces, 5) || "1" }))
          : [emptyRow()],
        price: str(p?.price, 10),
        qty: str(p?.qty, 6) || "10",
      }))
    : [];
  return { products: products.length ? products : [emptyProduct()] };
}

// "2,50" → 2.5; anything else → 0.
const num = (t: string) => {
  const c = t.trim().replace(/\s|€/g, "").replace(",", ".");
  return /^\d+(\.\d*)?$/.test(c) ? parseFloat(c) : 0;
};
const round2 = (n: number) => Math.round(n * 100) / 100;
const eur = (n: number) => n.toLocaleString("el-GR", { style: "currency", currency: "EUR" });
const perPiece = (r: Row) => round2(num(r.eur) / Math.max(1, Math.floor(num(r.pieces)) || 1));

// Workbook colours.
const C = { page: "#d8d0fb", ink: "#1f3b6e", title: "#c4607e", line: "#1f3b6e" };

type MyStartup = { id: string; name: string; emoji: string; plan: unknown };

export function CostingWorkshop() {
  const { data, setData, signedIn, saved } = useLessonWork<Sheet>("costing", { products: [emptyProduct()] }, parseSheet);
  const [active, setActive] = useState(0);
  const { child } = useChild();
  const [startups, setStartups] = useState<MyStartup[]>([]);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!child) return;
    supabase
      .from("startups")
      .select("id, name, emoji, plan")
      .eq("child_id" as never, child.id as never)
      .order("created_at")
      .then(({ data: rows }) => {
        const list = (rows ?? []) as unknown as MyStartup[];
        setStartups(list);
        setTarget((t) => t || list[0]?.id || "");
      });
  }, [child]);

  const i = Math.min(active, data.products.length - 1);
  const p = data.products[i];
  const setProduct = (fn: (x: Product) => Product) => {
    setData((d) => ({ products: d.products.map((x, k) => (k === i ? fn(x) : x)) }));
    setMsg(null);
  };
  const setRow = (j: number, patch: Partial<Row>) => setProduct((x) => ({ ...x, rows: x.rows.map((r, k) => (k === j ? { ...r, ...patch } : r)) }));

  const cost = round2(p.rows.reduce((s, r) => s + perPiece(r), 0));
  const price = num(p.price);
  const profit = round2(price - cost);
  const qty = Math.max(0, Math.floor(num(p.qty)));

  const addProduct = () => {
    if (data.products.length >= MAX_PRODUCTS) return;
    setData((d) => ({ products: [...d.products, emptyProduct()] }));
    setActive(data.products.length);
  };
  const removeProduct = () => {
    if (data.products.length <= 1) return setData({ products: [emptyProduct()] });
    setData((d) => ({ products: d.products.filter((_, k) => k !== i) }));
    setActive(Math.max(0, i - 1));
  };

  async function toStartup() {
    const s = startups.find((x) => x.id === target);
    if (!s) return;
    setBusy(true);
    setMsg(null);
    // Keep the startup's one-off costs and sales target; take the price and
    // the cost of each piece from this sheet.
    const current = readPlan(s.plan).costing;
    const value: Costing = {
      unit: (p.name.trim() || current?.unit || "τεμάχιο").slice(0, 30),
      price: Math.min(100000, round2(price)),
      fixed: current?.fixed ?? [],
      variable: p.rows
        .filter((r) => r.name.trim() && perPiece(r) > 0)
        .slice(0, 12)
        .map((r) => ({ name: r.name.trim().slice(0, 40), eur: perPiece(r) })),
      expected: current?.expected ?? Math.min(100000, qty),
    };
    try {
      const res = await saveStartupPlan({ data: { startupId: s.id, part: "costing", value } });
      setMsg(
        res.ok
          ? { ok: true, text: `Έτοιμο! Η τιμή και το κόστος μπήκαν στην κοστολόγηση της «${s.name}». Εκεί θα βρεις και το νεκρό σημείο.` }
          : { ok: false, text: res.reason === "bad_words" ? "Κάποια λέξη δεν επιτρέπεται. Άλλαξέ την και δοκίμασε ξανά." : "Δεν μπήκε στη startup. Δοκίμασε ξανά." },
      );
    } catch {
      setMsg({ ok: false, text: "Δεν μπήκε στη startup. Δοκίμασε ξανά." });
    } finally {
      setBusy(false);
    }
  }

  const cell = "w-full bg-transparent py-2 outline-none placeholder:opacity-40";

  return (
    <div id="costing-print" className="mx-auto max-w-3xl">
      <style>{`@media print {
  @page { size: A4; margin: 10mm; }
  body * { visibility: hidden !important; }
  #costing-print, #costing-print * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #costing-print { position: absolute; left: 0; top: 0; width: 100%; }
  #costing-print .no-print { display: none !important; }
}`}</style>

      {/* One sheet per product */}
      <div className="no-print mb-3 flex flex-wrap items-center gap-2">
        {data.products.map((x, k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-black ${k === i ? "border-[#6b5bb8] bg-[#6b5bb8] text-white" : "border-[#6b5bb8]/30"}`}
          >
            {x.name.trim() || `Προϊόν ${k + 1}`}
          </button>
        ))}
        {data.products.length < MAX_PRODUCTS && (
          <button onClick={addProduct} className="inline-flex items-center gap-1 rounded-full border-2 border-dashed border-[#6b5bb8]/50 px-3 py-1.5 text-sm font-bold text-[#6b5bb8]">
            <Plus size={14} /> Νέο προϊόν
          </button>
        )}
      </div>

      <div className="rounded-3xl p-5 sm:p-8" style={{ background: C.page, color: C.ink }}>
        <p className="text-center text-4xl font-black" style={{ color: C.title }}>
          Κόστος
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          Εδώ, κατέγραψε το κόστος παραγωγής του προϊόντος ή της υπηρεσίας σου, και καθόρισε τη στρατηγική τιμολόγησης για να εξασφαλίσεις
          κερδοφορία. Φτιάξε ένα φύλλο για κάθε προϊόν ή υπηρεσία που προσφέρεις.
        </p>

        <label className="mt-4 flex items-center gap-2 border-b-2 pb-1" style={{ borderColor: C.line }}>
          <span className="shrink-0 text-sm font-black">Προϊόν ή υπηρεσία:</span>
          <input
            value={p.name}
            onChange={(e) => setProduct((x) => ({ ...x, name: e.target.value.slice(0, 30) }))}
            placeholder="π.χ. cupcake"
            className="min-w-0 flex-1 bg-transparent font-black outline-none placeholder:font-normal placeholder:opacity-40"
          />
        </label>

        {/* The table: materials on the left, cost on the right, as on the page */}
        <div className="mt-5">
          <div className="grid grid-cols-[1fr_150px] border-b-[3px] sm:grid-cols-[1fr_190px]" style={{ borderColor: C.line }}>
            <span className="pb-2 font-bold">Υλικά / Πόροι</span>
            <span className="border-l-[3px] pb-2 pl-3 font-bold" style={{ borderColor: C.line }}>
              Κόστος
            </span>
          </div>
          {p.rows.map((r, j) => {
            const pieces = Math.max(1, Math.floor(num(r.pieces)) || 1);
            return (
              <div key={j} className="grid grid-cols-[1fr_150px] sm:grid-cols-[1fr_190px]">
                <div className="flex items-center gap-1 pr-2">
                  <input value={r.name} onChange={(e) => setRow(j, { name: e.target.value.slice(0, 40) })} placeholder={j === 0 ? "π.χ. αλεύρι" : "Υλικό ή πόρος"} className={cell} />
                  <button
                    onClick={() => setProduct((x) => ({ ...x, rows: x.rows.length > 1 ? x.rows.filter((_, k) => k !== j) : [emptyRow()] }))}
                    aria-label="Σβήσε τη γραμμή"
                    className="no-print shrink-0 rounded-full p-1 opacity-40 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="border-l-[3px] pl-3" style={{ borderColor: C.line }}>
                  <div className="flex items-center gap-1">
                    <input value={r.eur} onChange={(e) => setRow(j, { eur: e.target.value.slice(0, 10) })} inputMode="decimal" placeholder="0,00" className={`${cell} w-16 font-bold`} />
                    <span className="text-sm">€</span>
                    <span className="no-print ml-1 flex items-center gap-1 text-xs opacity-80">
                      για
                      <input
                        value={r.pieces}
                        onChange={(e) => setRow(j, { pieces: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                        inputMode="numeric"
                        aria-label="Για πόσα κομμάτια φτάνει"
                        className="w-9 rounded border border-[#1f3b6e]/30 bg-white/60 px-1 text-center"
                      />
                    </span>
                  </div>
                  {pieces > 1 && num(r.eur) > 0 && (
                    <p className="-mt-1 pb-1 text-[11px] opacity-80">
                      = {eur(perPiece(r))} το κομμάτι
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {p.rows.length < MAX_ROWS && (
            <div className="no-print grid grid-cols-[1fr_150px] sm:grid-cols-[1fr_190px]">
              <button onClick={() => setProduct((x) => ({ ...x, rows: [...x.rows, emptyRow()] }))} className="py-2 text-left text-sm font-bold opacity-70 hover:opacity-100">
                + Πρόσθεσε υλικό
              </button>
              <span className="border-l-[3px]" style={{ borderColor: C.line }} />
            </div>
          )}

          <div className="grid grid-cols-[1fr_150px] border-t-[3px] sm:grid-cols-[1fr_190px]" style={{ borderColor: C.line }}>
            <span className="py-3 font-bold">Συνολικό κόστος παραγωγής</span>
            <span className="border-l-[3px] py-3 pl-3 text-lg font-black" style={{ borderColor: C.line }}>
              {eur(cost)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_150px] border-t-[3px] sm:grid-cols-[1fr_190px]" style={{ borderColor: C.line }}>
            <span className="py-3 font-bold">Τιμή πώλησης</span>
            <span className="flex items-center gap-1 border-l-[3px] pl-3" style={{ borderColor: C.line }}>
              <input
                value={p.price}
                onChange={(e) => setProduct((x) => ({ ...x, price: e.target.value.slice(0, 10) }))}
                inputMode="decimal"
                placeholder="0,00"
                className="w-20 bg-transparent py-3 text-lg font-black outline-none placeholder:opacity-40"
              />
              €
            </span>
          </div>
          <div className="grid grid-cols-[1fr_150px] border-t-[3px] sm:grid-cols-[1fr_190px]" style={{ borderColor: C.line }}>
            <span className="py-3">
              <b>Συνολικό κέρδος</b>
              <span className="block text-sm">(αφαιρείς το κόστος παραγωγής από την τιμή πώλησης)</span>
            </span>
            <span
              className={`border-l-[3px] py-3 pl-3 text-lg font-black ${price > 0 && profit <= 0 ? "text-red-600" : price > 0 ? "text-[#1d7a4f]" : ""}`}
              style={{ borderColor: C.line }}
            >
              {price > 0 ? eur(profit) : "—"}
            </span>
          </div>
        </div>
        <p className="mt-6 text-right text-xs font-bold" style={{ color: C.title }}>
          Kids in Business · kidsinbusiness.gr
        </p>
      </div>

      {/* Pricing help */}
      <div className="no-print mt-4 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="font-black">💡 Πώς διαλέγεις την τιμή</p>
        {cost > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">Ξεκίνα από το κόστος και πρόσθεσε το κέρδος που θέλεις:</p>
            <div className="flex flex-wrap gap-2">
              {[
                [1.5, "κόστος + 50%"],
                [2, "κόστος × 2"],
                [3, "κόστος × 3"],
              ].map(([k, label]) => (
                <button
                  key={label as string}
                  onClick={() => setProduct((x) => ({ ...x, price: String(round2(cost * (k as number))).replace(".", ",") }))}
                  className="rounded-full border-2 border-[#6b5bb8]/40 px-3 py-1.5 text-sm hover:bg-[#f3f0ff]"
                >
                  {label as string}: <b>{eur(round2(cost * (k as number)))}</b>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Μετά κοίτα τι χρεώνουν οι άλλοι για κάτι παρόμοιο, και πόσο αξίζει για τον πελάτη σου.</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Γράψε πρώτα τα υλικά και το κόστος τους. Αν ένα υλικό φτάνει για πολλά κομμάτια, γράψε για πόσα, και το διαιρούμε εμείς.</p>
        )}
        {price > 0 && profit <= 0 && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">⚠️ Με αυτή την τιμή χάνεις χρήματα σε κάθε κομμάτι. Η τιμή πρέπει να είναι μεγαλύτερη από το κόστος.</p>
        )}
        {price > 0 && profit > 0 && (
          <p className="flex flex-wrap items-center gap-1 text-sm">
            Αν πουλήσεις
            <input
              value={p.qty}
              onChange={(e) => setProduct((x) => ({ ...x, qty: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
              inputMode="numeric"
              aria-label="Πόσα κομμάτια"
              className="w-14 rounded-lg border px-2 py-1 text-center font-bold"
            />
            κομμάτια, κερδίζεις <b className="text-[#1d7a4f]">{eur(round2(profit * qty))}</b>.
          </p>
        )}
      </div>

      {/* To the startup */}
      <div className="no-print mt-4 rounded-2xl bg-[oklch(0.96_0.03_173)] p-4">
        <p className="font-black">🚀 Βάλ' το στη startup σου</p>
        {!child ? (
          <p className="mt-1 text-sm text-muted-foreground">Η κοστολόγηση μπαίνει σε startup από τον λογαριασμό του παιδιού.</p>
        ) : startups.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Δεν έχεις ακόμα startup. Το φύλλο σου μένει εδώ.{" "}
            <Link to="/build" className="font-bold underline">
              Φτιάξε τη startup σου
            </Link>{" "}
            και μετά θα το βάλεις με ένα κουμπί.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Η τιμή και το κόστος κάθε κομματιού μπαίνουν στην κοστολόγηση της startup σου. Εκεί προσθέτεις τα έξοδα που πληρώνεις μία φορά (π.χ.
              εργαλεία), και βλέπεις το νεκρό σημείο: πόσα πρέπει να πουλήσεις για να μη χάνεις.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {startups.length > 1 && (
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-full border bg-background px-4 py-2 text-sm font-bold">
                  {startups.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={toStartup}
                disabled={busy || !target || price <= 0 || cost <= 0}
                className="rounded-full bg-[oklch(0.55_0.17_173)] px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"
              >
                {busy ? "…" : startups.length === 1 ? `Βάλ' το στη «${startups[0].name}»` : "Βάλ' το στη startup"}
              </button>
              {target && (
                <Link to="/startups/$id" params={{ id: target }} className="text-sm font-bold underline">
                  Δες τη startup →
                </Link>
              )}
            </div>
            {(price <= 0 || cost <= 0) && <p className="mt-2 text-xs text-muted-foreground">Πρώτα γράψε τα υλικά, το κόστος τους και την τιμή πώλησης.</p>}
            {msg && <p className={`mt-2 text-sm font-bold ${msg.ok ? "text-[oklch(0.45_0.14_160)]" : "text-red-600"}`}>{msg.text}</p>}
          </>
        )}
      </div>

      <div className="no-print mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#c4788a] px-5 py-2.5 text-sm font-black text-[#a85a6e] hover:bg-[#fce8ee]"
        >
          <Printer size={16} /> Εκτύπωση σε χρώμα
        </button>
        <button onClick={removeProduct} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-red-600">
          <Trash2 size={14} /> Σβήσε αυτό το φύλλο
        </button>
      </div>
      <div className="no-print">
        <SaveNote signedIn={signedIn} saved={saved} />
      </div>
    </div>
  );
}
