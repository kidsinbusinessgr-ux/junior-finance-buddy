import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveStartupPlan } from "@/lib/startups.functions";
import { DAYS, WORKBOOK_URL, costingResult, euro, type ActionPlan, type StartupPlan } from "@/lib/startup-plan";

// «Το σχέδιο της δράσης μου» and «Εβδομαδιαίο πλάνο» from the workbook: a
// summary that fills itself from the earlier steps, a 30-second pitch, and
// what the founder will do each day of the week to get started.

export type ActionInfo = {
  name: string;
  solution: string;
  customer: string;
  model: string;
  plan: StartupPlan;
};

const EMPTY: ActionPlan = { days: DAYS.map(() => ({ text: "", done: false })), pitch: "" };

const DAY_IDEAS = [
  "Κάνω λίστα με τα υλικά",
  "Ρωτάω 5 φίλους αν θα το αγόραζαν",
  "Φτιάχνω το πρώτο δείγμα",
  "Τυπώνω τη διαφήμιση",
  "Ζητάω άδεια να κρεμάσω την αφίσα",
  "Πουλάω τα πρώτα κομμάτια",
  "Γράφω τι πήγε καλά και τι όχι",
];

export function summaryRows(info: ActionInfo): [string, string][] {
  const c = info.plan.costing;
  const r = c ? costingResult(c) : null;
  return [
    ["Η εταιρεία μου θα ασχολείται με", info.solution],
    ["Το όνομα της εταιρείας μου", info.name],
    ["Πώς διαφέρει από τις άλλες", info.plan.usp ?? ""],
    ["Ο πελάτης μου", info.customer],
    ["Πώς θα διαφημίσω το προϊόν μου", info.plan.ad ? [info.plan.ad.headline, info.plan.ad.where].filter(Boolean).join(" · ") : ""],
    ["Πού θα το πουλάω", info.model],
    ["Πόσο θα το πουλάω", c?.price ? euro(c.price) + (c.unit ? ` / ${c.unit}` : "") : ""],
    ["Τα έξοδά μου", r ? `${euro(r.fixedTotal)} στην αρχή και ${euro(r.unitCost)} για κάθε κομμάτι` : ""],
    [
      "Το κέρδος μου",
      r && c ? `${euro(r.profitPerUnit)} για κάθε κομμάτι · break-even στα ${r.breakEven ?? "—"}${c.expected ? ` · αν πουλήσω ${c.expected}: ${euro(r.expectedProfit)}` : ""}` : "",
    ],
  ];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string);
}

function printPlan(info: ActionInfo, a: ActionPlan) {
  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) return;
  const rows = summaryRows(info)
    .map(([k, v]) => `<div class="row"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v) || "&nbsp;"}</div></div>`)
    .join("");
  const days = a.days
    .map((d, i) => `<div class="day"><span class="dn">${DAYS[i]}</span><span class="box">${d.done ? "✓" : ""}</span><span>${escapeHtml(d.text)}</span></div>`)
    .join("");
  w.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Το σχέδιο της δράσης μου</title>
<style>
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:24px;color:#3a2f2a}
.head{background:linear-gradient(90deg,#f7a35c,#f2709c);color:#fff;border-radius:18px;padding:18px 24px}
h1{margin:0;font-size:26px}h2{font-size:18px;color:#f2709c;margin:22px 0 8px}
.row{border-bottom:1px dashed #f4c7d6;padding:7px 0}.k{font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#f2709c}
.v{font-size:15px;font-weight:600;margin-top:2px}.pitch{background:#fff3b0;border-radius:12px;padding:12px 16px;font-size:15px}
.day{display:flex;gap:12px;align-items:center;border:2px solid #9b85c9;border-radius:12px;padding:8px 12px;margin-bottom:6px;font-size:14px}
.dn{font-weight:800;color:#7c4dff;width:90px}.box{width:20px;height:20px;border:2px solid #7c4dff;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#7c4dff}
.foot{text-align:center;margin-top:16px;font-size:11px;color:#999}
</style></head><body><div class="head"><h1>Το σχέδιο της δράσης μου</h1><div>${escapeHtml(info.name)}</div></div>
${rows}${a.pitch ? `<h2>Το pitch μου (30 δευτερόλεπτα)</h2><div class="pitch">${escapeHtml(a.pitch)}</div>` : ""}
<h2>Εβδομαδιαίο πλάνο</h2>${days}<p class="foot">kidsinbusiness.gr</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

export function StartupAction({
  startupId,
  info,
  initial,
  onSaved,
}: {
  startupId: string;
  info: ActionInfo;
  initial?: ActionPlan;
  onSaved: (a: ActionPlan) => void;
}) {
  const [a, setA] = useState<ActionPlan>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const rows = summaryRows(info);
  const missing = rows.filter(([, v]) => !v.trim()).length;
  const doneDays = a.days.filter((d) => d.done && d.text.trim()).length;

  const setDay = (i: number, patch: Partial<ActionPlan["days"][number]>) =>
    setA((x) => ({ ...x, days: x.days.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));

  const save = async (next = a) => {
    setSaving(true);
    setMsg(null);
    const clean: ActionPlan = { pitch: next.pitch.trim(), days: next.days.map((d) => ({ text: d.text.trim(), done: d.done })) };
    try {
      const res = await saveStartupPlan({ data: { startupId, part: "action", value: clean } });
      if (res.ok) {
        onSaved(clean);
        setMsg({ ok: true, text: "Αποθηκεύτηκε!" });
      } else {
        setMsg({ ok: false, text: res.reason === "bad_words" ? "Ας κρατήσουμε τα κείμενα ευγενικά 😊" : "Δεν αποθηκεύτηκε. Δοκίμασε ξανά." });
      }
    } catch {
      setMsg({ ok: false, text: "Δεν αποθηκεύτηκε. Δοκίμασε ξανά." });
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">🗓️ Το σχέδιο της δράσης μου</h3>
          <p className="mt-1 text-sm text-muted-foreground">Όλο το business plan σου σε μία σελίδα, το pitch σου και τι θα κάνεις κάθε μέρα αυτή την εβδομάδα.</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => printPlan(info, a)}>
          <Printer size={16} /> Εκτύπωση
        </Button>
      </div>

      {/* Summary from the earlier steps */}
      <div className="rounded-2xl border bg-card p-5">
        <p className="font-black">Η περίληψη</p>
        <p className="text-xs text-muted-foreground">Συμπληρώνεται μόνη της από τα προηγούμενα βήματα.</p>
        <dl className="mt-3 divide-y">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-2 sm:grid-cols-[220px_1fr]">
              <dt className="text-xs font-black uppercase tracking-wide text-[oklch(0.55_0.17_350)]">{k}</dt>
              <dd className={`text-sm ${v ? "" : "italic text-muted-foreground"}`}>{v || "Δεν το έχεις συμπληρώσει ακόμα"}</dd>
            </div>
          ))}
        </dl>
        {missing > 0 && (
          <p className="mt-3 rounded-xl bg-[oklch(0.97_0.03_80)] p-3 text-xs font-bold">
            Λείπουν {missing} {missing === 1 ? "απάντηση" : "απαντήσεις"}. Κάνε την κοστολόγηση και τη διαφήμιση, για να γεμίσει όλη η σελίδα.
          </p>
        )}
      </div>

      {/* Pitch */}
      <div className="rounded-2xl border bg-card p-5">
        <p className="font-black">🎤 Το pitch σου σε 30 δευτερόλεπτα</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Μια σύντομη και πειστική παρουσίαση της ιδέας σου: ποιο πρόβλημα λύνεις, για ποιον, γιατί εσύ και τι ζητάς. Κάνε πρόβα στον καθρέφτη
          και μετά παρουσίασέ τη στην οικογένεια ή στην τάξη σου.
        </p>
        <textarea
          className={`${input} mt-3 min-h-[110px] resize-none`}
          maxLength={400}
          value={a.pitch}
          onChange={(e) => setA({ ...a, pitch: e.target.value })}
          placeholder="Γεια σας! Είμαι… και έφτιαξα το… γιατί… Είναι για… Μας ξεχωρίζει ότι… Ελάτε να…"
        />
        <p className="text-right text-xs text-muted-foreground">{a.pitch.length}/400</p>
      </div>

      {/* Weekly plan */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-black">📅 Εβδομαδιαίο πλάνο</p>
            <p className="text-xs text-muted-foreground">Γράψε ένα μικρό βήμα για κάθε μέρα. Τσέκαρέ το όταν το κάνεις.</p>
          </div>
          <p className="text-sm font-black text-[oklch(0.5_0.15_160)]">{doneDays} / 7 έγιναν</p>
        </div>
        <div className="mt-4 space-y-2">
          {a.days.map((d, i) => (
            <div key={DAYS[i]} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={d.done}
                onChange={(e) => {
                  const next = { ...a, days: a.days.map((x, j) => (j === i ? { ...x, done: e.target.checked } : x)) };
                  setA(next);
                  if (d.text.trim()) void save(next);
                }}
                className="h-5 w-5 shrink-0 accent-[oklch(0.57_0.23_292)]"
                aria-label={`${DAYS[i]}: έγινε`}
              />
              <span className="w-24 shrink-0 text-sm font-black text-[oklch(0.5_0.2_292)]">{DAYS[i]}</span>
              <input
                className={`${input} ${d.done ? "line-through opacity-60" : ""}`}
                maxLength={120}
                value={d.text}
                onChange={(e) => setDay(i, { text: e.target.value })}
                placeholder={DAY_IDEAS[i]}
              />
            </div>
          ))}
        </div>
      </div>

      {msg && (
        <p className={`rounded-xl p-3 text-sm font-bold ${msg.ok ? "bg-[oklch(0.93_0.06_173)] text-[oklch(0.3_0.1_173)]" : "bg-destructive/10 text-destructive"}`}>
          {msg.text}
        </p>
      )}
      <Button onClick={() => save()} disabled={saving} className="h-12 w-full rounded-full font-black">
        {saving ? "Αποθήκευση…" : "💾 Αποθήκευσε το σχέδιο δράσης"}
      </Button>

      <a
        href={WORKBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-[oklch(0.75_0.12_350)] bg-[oklch(0.98_0.02_350)] p-4 hover:bg-[oklch(0.96_0.03_350)]"
      >
        <span className="text-4xl">📘</span>
        <span className="text-sm">
          <b className="block">Θέλεις όλο το business plan σε χαρτί;</b>
          Το Kids in Business Workbook έχει idea board, branding board, όλες τις σελίδες για εκτύπωση και οδηγό για τους γονείς. →
        </span>
      </a>
    </div>
  );
}
