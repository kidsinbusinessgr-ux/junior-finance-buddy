import { useEffect, useState } from "react";
import { ArrowRight, Check, Lightbulb, Lock, Plus, Printer, RotateCcw, X } from "lucide-react";
import { SignupCta } from "@/components/signup-gate";
import { supabase } from "@/integrations/supabase/client";

// The Business Model Canvas from the Kids in Business worksheet: the nine
// boxes keep their places, teens add short post-its to each one, and the
// guide panel asks the questions from the workshop slides, with Airbnb as
// the worked example. Saved in this browser only.

type BoxId =
  | "segments"
  | "value"
  | "channels"
  | "relationships"
  | "revenue"
  | "resources"
  | "activities"
  | "partners"
  | "cost";

type Box = {
  id: BoxId;
  step: number; // the order in which we fill the boxes
  el: string;
  en: string;
  ask: string;
  questions: string[];
  example: string[];
  trap: string;
  airbnb: string[];
  color: string;
  place: string; // grid position on wide screens
};

const BOXES: Box[] = [
  {
    id: "partners",
    step: 8,
    el: "Βασικοί συνεργάτες",
    en: "Key Partners",
    ask: "Ποιος σε βοηθάει;",
    questions: [
      "Ποιος σου δίνει υλικά ή πρόσβαση;",
      "Ποιος έχει γνώσεις που εσύ δεν έχεις;",
      "Ποιος θα σε στήριζε: χορηγός, δήμος, σύλλογος;",
    ],
    example: ["Οι ιδιοκτήτες των σπιτιών", "Εταιρείες πληρωμών (κάρτες)", "Ασφαλιστικές εταιρείες, φωτογράφοι"],
    trap: "Συνεργάτης είναι κάποιος που κερδίζει κι αυτός, όχι απλώς ένας φίλος.",
    airbnb: ["Ιδιοκτήτες σπιτιών", "Εταιρείες πληρωμών", "Ασφαλιστικές, φωτογράφοι"],
    color: "#f2a516",
    place: "lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2",
  },
  {
    id: "activities",
    step: 7,
    el: "Βασικές δραστηριότητες",
    en: "Key Activities",
    ask: "Τι κάνεις κάθε μέρα;",
    questions: ["Τι φτιάχνεις;", "Τι συντηρείς ή ενημερώνεις;", "Τι κάνεις για να σε μάθει ο κόσμος;"],
    example: ["Βελτιώνει συνεχώς την εφαρμογή", "Ελέγχει την ασφάλεια σπιτιών και χρηστών", "Κάνει διαφήμιση, εξυπηρετεί πελάτες"],
    trap: "Πόροι = τι έχεις (ουσιαστικά). Δραστηριότητες = τι κάνεις (ρήματα).",
    airbnb: ["Βελτιώνει την εφαρμογή", "Ελέγχει την ασφάλεια", "Διαφημίζει, εξυπηρετεί πελάτες"],
    color: "#f59b6c",
    place: "lg:col-start-3 lg:col-span-2 lg:row-start-1",
  },
  {
    id: "resources",
    step: 6,
    el: "Βασικοί πόροι",
    en: "Key Resources",
    ask: "Τι χρειάζεσαι;",
    questions: [
      "Υλικά: εξοπλισμός, χώρος, πρώτες ύλες.",
      "Ψηφιακά: εφαρμογή, ιστοσελίδα, δεδομένα.",
      "Ανθρώπινα: ποιες γνώσεις χρειάζεσαι;",
    ],
    example: ["Η εφαρμογή και η ιστοσελίδα", "Το όνομα και η εμπιστοσύνη (brand)", "Οι κριτικές και τα δεδομένα των χρηστών"],
    trap: "Όχι λίστα με τα πάντα. Μόνο ό,τι είναι απαραίτητο.",
    airbnb: ["Εφαρμογή και ιστοσελίδα", "Όνομα και εμπιστοσύνη", "Κριτικές των χρηστών"],
    color: "#ef6f9a",
    place: "lg:col-start-3 lg:col-span-2 lg:row-start-2",
  },
  {
    id: "value",
    step: 2,
    el: "Πρόταση αξίας",
    en: "Value Propositions",
    ask: "Γιατί να διαλέξουν εσένα;",
    questions: [
      "Ποιο πρόβλημα λύνεις;",
      "Τι κερδίζει ο πελάτης: χρόνο, χρήματα, γνώση, διασκέδαση;",
      "Τι κάνεις διαφορετικά από ό,τι υπάρχει ήδη;",
    ],
    example: [
      "Για τον ταξιδιώτη: «Ζήσε σαν ντόπιος, φθηνότερα από ξενοδοχείο»",
      "Για τον ιδιοκτήτη: «Βγάλε χρήματα από το άδειο δωμάτιο»",
    ],
    trap: "Γράψε τι κερδίζει ο πελάτης, όχι απλώς τι κάνει το προϊόν.",
    airbnb: ["Ζήσε σαν ντόπιος", "Φθηνότερα από ξενοδοχείο", "Έσοδα από άδειο δωμάτιο"],
    color: "#f38a6d",
    place: "lg:col-start-5 lg:col-span-2 lg:row-start-1 lg:row-span-2",
  },
  {
    id: "relationships",
    step: 4,
    el: "Σχέσεις με πελάτες",
    en: "Customer Relationships",
    ask: "Πώς τους κρατάς κοντά;",
    questions: [
      "Προσωπική βοήθεια ή τα κάνει μόνος του (self-service);",
      "Γιατί να ξαναέρθει ή να σε προτείνει σε φίλους;",
      "Πώς ακούς τη γνώμη του;",
    ],
    example: ["Κριτικές και αστέρια μετά από κάθε διαμονή", "Εξυπηρέτηση πελατών όλο το 24ωρο", "Τίτλος «Superhost» για τους καλύτερους"],
    trap: "Ξεχνάς τι γίνεται μετά την πρώτη αγορά.",
    airbnb: ["Κριτικές και αστέρια", "Εξυπηρέτηση όλο το 24ωρο", "Τίτλος «Superhost»"],
    color: "#f5822c",
    place: "lg:col-start-7 lg:col-span-2 lg:row-start-1",
  },
  {
    id: "channels",
    step: 3,
    el: "Κανάλια",
    en: "Channels",
    ask: "Πώς σε βρίσκουν;",
    questions: [
      "Πού περνάει χρόνο ο πελάτης σου;",
      "Πώς θα μάθει ότι υπάρχεις;",
      "Πώς θα αγοράσει ή θα χρησιμοποιήσει τη λύση σου;",
    ],
    example: ["Εφαρμογή και ιστοσελίδα", "Αναζήτηση στο Google, social media", "Ένας φίλος που το πρότεινε"],
    trap: "Όχι σκέτο «social media». Ποιο; Instagram, TikTok, YouTube;",
    airbnb: ["Εφαρμογή και ιστοσελίδα", "Αναζήτηση στο Google", "Σύσταση από φίλο"],
    color: "#cf72c2",
    place: "lg:col-start-7 lg:col-span-2 lg:row-start-2",
  },
  {
    id: "segments",
    step: 1,
    el: "Τμήματα πελατών",
    en: "Customer Segments",
    ask: "Για ποιον το φτιάχνεις;",
    questions: [
      "Ποιος έχει το πρόβλημα;",
      "Ποιος πληρώνει; Είναι ο ίδιος με αυτόν που το χρησιμοποιεί;",
      "Περίγραψε έναν πελάτη: ηλικία, από πού είναι, τι θέλει.",
    ],
    example: ["Ταξιδιώτες που θέλουν φθηνή και αυθεντική διαμονή", "Ιδιοκτήτες που θέλουν έξτρα εισόδημα από ένα άδειο δωμάτιο"],
    trap: "«Όλοι» δεν είναι πελάτης. Όσο πιο συγκεκριμένος είσαι, τόσο καλύτερα.",
    airbnb: ["Ταξιδιώτες που θέλουν φθηνή διαμονή", "Ιδιοκτήτες με άδειο δωμάτιο"],
    color: "#9b85c9",
    place: "lg:col-start-9 lg:col-span-2 lg:row-start-1 lg:row-span-2",
  },
  {
    id: "cost",
    step: 9,
    el: "Δομή κόστους",
    en: "Cost Structure",
    ask: "Πού ξοδεύεις χρήματα;",
    questions: [
      "Τι πληρώνεις μία φορά (π.χ. εξοπλισμό);",
      "Τι πληρώνεις κάθε μήνα (π.χ. συνδρομές, συντήρηση);",
      "Ποιο είναι το μεγαλύτερο κόστος;",
    ],
    example: ["Μισθοί προγραμματιστών", "Servers και τεχνολογία", "Διαφήμιση και εξυπηρέτηση πελατών"],
    trap: "Κόστη χωρίς αριθμούς. Γράψε μια εκτίμηση σε € δίπλα σε κάθε κόστος.",
    airbnb: ["Μισθοί προγραμματιστών", "Servers και τεχνολογία", "Διαφήμιση και εξυπηρέτηση"],
    color: "#4fb1c7",
    place: "lg:col-start-1 lg:col-span-5 lg:row-start-3",
  },
  {
    id: "revenue",
    step: 5,
    el: "Ροές εσόδων",
    en: "Revenue Streams",
    ask: "Ποιος πληρώνει και πόσο;",
    questions: [
      "Για τι ακριβώς πληρώνει ο πελάτης;",
      "Πώς: μία φορά, συνδρομή, προμήθεια, χορηγία, διαφήμιση;",
      "Πόσα θα πλήρωνε; Το ρώτησες κάποιον;",
    ],
    example: ["Προμήθεια από κάθε κράτηση", "Πληρώνουν και ο ταξιδιώτης και ο ιδιοκτήτης"],
    trap: "«Θα το αγοράσουν όλοι», χωρίς να έχεις ρωτήσει κανέναν.",
    airbnb: ["Προμήθεια από κάθε κράτηση", "Πληρώνουν ταξιδιώτης και ιδιοκτήτης"],
    color: "#76a3e0",
    place: "lg:col-start-6 lg:col-span-5 lg:row-start-3",
  },
];

const BY_STEP = [...BOXES].sort((a, b) => a.step - b.step);

// On narrow screens the boxes stack in the order we fill them.
const ORDER_CLASS: Record<number, string> = {
  1: "order-1",
  2: "order-2",
  3: "order-3",
  4: "order-4",
  5: "order-5",
  6: "order-6",
  7: "order-7",
  8: "order-8",
  9: "order-9",
};

const RULES = [
  { title: "1 ιδέα = 1 post-it", body: "Έτσι τα μετακινείς και τα σβήνεις εύκολα." },
  { title: "Λίγες λέξεις", body: "Μέχρι 7 λέξεις. Όχι ολόκληρες προτάσεις." },
  { title: "Συγκεκριμένα, όχι γενικά", body: "«Τουρίστες 30–50 με παιδιά», όχι «όλος ο κόσμος»." },
  { title: "Δεν ξέρεις; Γράψε «;»", body: "Είναι υπόθεση που θα ελέγξεις, ρωτώντας πραγματικούς πελάτες." },
];

const CHECKS = [
  { pair: "Πελάτες ↔ Αξία", q: "Κάθε τμήμα πελατών έχει τη δική του πρόταση αξίας;" },
  { pair: "Κανάλια ↔ Πελάτες", q: "Κάθε κανάλι φτάνει σε πελάτη που έγραψες;" },
  { pair: "Έσοδα ↔ Πελάτες", q: "Κάθε έσοδο έρχεται από πελάτη που έγραψες;" },
  { pair: "Πόροι ↔ Κόστος", q: "Κάθε πόρος και δραστηριότητα έχει κόστος σε €;" },
  { pair: "Συνεργάτες ↔ Δραστηριότητες", q: "Κάθε συνεργάτης κερδίζει κάτι από σένα;" },
];

const AIRBNB_PROBLEM = "Οι ταξιδιώτες δε βρίσκουν φθηνή διαμονή, ενώ πολλά δωμάτια μένουν άδεια.";

type Draft = { problem: string; notes: Record<BoxId, string[]>; checks: boolean[] };

const DRAFT_KEY = "kib-bmc";
const MAX_WORDS = 7;

function emptyDraft(): Draft {
  const notes = {} as Record<BoxId, string[]>;
  for (const b of BOXES) notes[b.id] = [];
  return { problem: "", notes, checks: CHECKS.map(() => false) };
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? parseDraft(JSON.parse(raw)) : emptyDraft();
  } catch {
    return emptyDraft();
  }
}

const draftIsEmpty = (d: Draft) => !d.problem.trim() && BOXES.every((b) => d.notes[b.id].length === 0);

// The canvas saved in the account (jfb_canvases), or null when there is none
// or nobody is signed in.
export async function fetchAccountCanvas(): Promise<{ userId: string; draft: Draft | null } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("jfb_canvases" as never).select("data").eq("user_id", user.id).maybeSingle();
  const row = data as { data: unknown } | null;
  return { userId: user.id, draft: row ? parseDraft(row.data) : null };
}

export const countNotes = (d: Draft) => BOXES.reduce((s, b) => s + d.notes[b.id].length, 0);

function parseDraft(raw: unknown): Draft {
  const base = emptyDraft();
  try {
    const d = (raw ?? {}) as Partial<Draft>;
    for (const b of BOXES) {
      const list = d.notes?.[b.id];
      if (Array.isArray(list)) base.notes[b.id] = list.filter((x) => typeof x === "string").slice(0, 30);
    }
    if (typeof d.problem === "string") base.problem = d.problem;
    if (Array.isArray(d.checks)) base.checks = CHECKS.map((_, i) => d.checks?.[i] === true);
    return base;
  } catch {
    return base;
  }
}

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const isGuess = (s: string) => /[;?]/.test(s);

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function printCanvas(problem: string, notes: Record<BoxId, string[]>) {
  const w = window.open("", "_blank", "width=1200,height=800");
  if (!w) return;
  const area: Record<BoxId, string> = {
    partners: "1 / 1 / 3 / 3",
    activities: "1 / 3 / 2 / 5",
    resources: "2 / 3 / 3 / 5",
    value: "1 / 5 / 3 / 7",
    relationships: "1 / 7 / 2 / 9",
    channels: "2 / 7 / 3 / 9",
    segments: "1 / 9 / 3 / 11",
    cost: "3 / 1 / 4 / 6",
    revenue: "3 / 6 / 4 / 11",
  };
  const cells = BOXES.map(
    (b) => `<div class="box" style="grid-area:${area[b.id]};border-color:${b.color}">
<div class="tab" style="background:${b.color}">${b.step}. ${escapeHtml(b.el)}</div>
${notes[b.id].map((n) => `<div class="note">${escapeHtml(n)}</div>`).join("")}</div>`,
  ).join("");
  w.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Business Model Canvas</title>
<style>
@page{size:A4 landscape;margin:10mm}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;color:#3a2f2a;background:#fffaf3}
h1{margin:0 0 4px;font-size:24px;color:#f08a5d}.p{margin:0 0 10px;font-size:13px}
.grid{display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:1fr 1fr .8fr;gap:8px;height:165mm}
.box{border:2px solid;border-radius:10px;padding:0 6px 6px;overflow:hidden;background:#fff}
.tab{color:#fff;font-weight:700;font-size:11px;padding:3px 8px;border-radius:0 0 8px 8px;display:inline-block;margin-bottom:6px}
.note{display:inline-block;background:#fff3b0;border-radius:4px;padding:3px 6px;margin:2px;font-size:11px}
.foot{text-align:right;font-size:10px;color:#999;margin-top:4px}
</style></head><body><h1>Business Model Canvas</h1>
<p class="p"><b>Πρόβλημα και πελάτης:</b> ${escapeHtml(problem)}</p>
<div class="grid">${cells}</div><p class="foot">kidsinbusiness.gr</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

function Guide({ box, onNext }: { box: Box; onNext?: () => void }) {
  return (
    <div className="rounded-2xl border-2 bg-white p-5 text-[#3a2f2a]" style={{ borderColor: box.color }}>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: box.color }}>
        Κουτάκι {box.step} από 9 · {box.en}
      </p>
      <h3 className="mt-1 text-xl font-black">
        {box.el}: {box.ask}
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-black">Ρώτα τον εαυτό σου ή την ομάδα σου</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {box.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl bg-[#fff6ea] p-3">
          <p className="text-sm font-black">Παράδειγμα: Airbnb</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {box.example.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 rounded-xl bg-[#ffe9e9] px-3 py-2 text-sm">
        <b>⚠️ Παγίδα:</b> {box.trap}
      </p>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-black text-white"
          style={{ background: box.color }}
        >
          Επόμενο κουτάκι <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

function Cell({
  box,
  notes,
  active,
  readOnly,
  onFocus,
  onAdd,
  onRemove,
}: {
  box: Box;
  notes: string[];
  active: boolean;
  readOnly: boolean;
  onFocus: () => void;
  onAdd: (text: string) => void;
  onRemove: (i: number) => void;
}) {
  const [text, setText] = useState("");
  const words = wordCount(text);
  const add = () => {
    const t = text.trim().slice(0, 80);
    if (!t) return;
    onAdd(t);
    setText("");
  };
  return (
    <div className={`flex flex-col ${box.place} ${ORDER_CLASS[box.step]} lg:order-none`}>
      <button
        type="button"
        onClick={onFocus}
        className="flex w-fit max-w-full items-center gap-2 rounded-t-xl px-3 py-1.5 text-left text-sm font-black text-white"
        style={{ background: box.color }}
        title="Δες τις ερωτήσεις για αυτό το κουτάκι"
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-xs" style={{ color: box.color }}>
          {box.step}
        </span>
        <span className="truncate">{box.el}</span>
      </button>
      <div
        onClick={onFocus}
        className={`flex min-h-[150px] flex-1 flex-col rounded-b-xl rounded-tr-xl border-2 bg-white p-2 transition-shadow ${active ? "shadow-lg ring-4" : ""}`}
        style={{ borderColor: box.color, ["--tw-ring-color" as string]: box.color + "40" }}
      >
        <p className="px-1 text-xs font-bold text-[#8a7d75]">{box.ask}</p>
        <div className="mt-2 flex flex-wrap content-start gap-1.5">
          {notes.map((n, i) => (
            <span
              key={i}
              className={`group relative max-w-full break-words rounded-md px-2 py-1 text-sm shadow-sm ${isGuess(n) ? "border-2 border-dashed border-[#e0a800] bg-[#fffbe0]" : "bg-[#fff3b0]"}`}
              title={isGuess(n) ? "Υπόθεση: έλεγξέ τη ρωτώντας πελάτες" : undefined}
            >
              {n}
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(i);
                  }}
                  className="ml-1 inline-grid h-4 w-4 place-items-center rounded-full align-middle text-[#8a7d75] hover:bg-black/10"
                  aria-label={`Σβήσε το post-it «${n}»`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
          {readOnly && notes.length === 0 && <span className="px-1 text-sm text-[#b8aca4]">—</span>}
        </div>
        {!readOnly && (
          <div className="mt-auto pt-2">
            <div className="flex gap-1">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={onFocus}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add();
                  }
                }}
                maxLength={80}
                placeholder="Γράψε μια ιδέα…"
                className="min-w-0 flex-1 rounded-lg border border-[#e8ddd4] bg-[#fffdf9] px-2 py-1.5 text-sm outline-none focus:border-[#c9b8ac]"
              />
              <button
                type="button"
                onClick={add}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: box.color }}
                aria-label="Πρόσθεσε post-it"
              >
                <Plus size={16} />
              </button>
            </div>
            {words > MAX_WORDS && <p className="mt-1 text-xs font-bold text-[#c2410c]">Πολλές λέξεις ({words}). Προσπάθησε με 7 ή λιγότερες.</p>}
          </div>
        )}
        {active && (
          <div className="mt-3 lg:hidden">
            <Guide box={box} />
          </div>
        )}
      </div>
    </div>
  );
}

// locked: visitors see the Airbnb example only, and a free sign-up to fill their own.
export function BusinessModelCanvas({ locked = false }: { locked?: boolean } = {}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"mine" | "airbnb">("mine");
  const [active, setActive] = useState<BoxId>("segments");

  // Signed in: the canvas lives in the account, so it follows the child from
  // the school computer to home. The copy on this device is the fallback, and
  // the first time it moves into the account.
  const [accountUser, setAccountUser] = useState<string | null>(null);

  useEffect(() => {
    const local = loadDraft();
    setDraft(local);
    setLoaded(true);
    if (locked) return;
    let cancelled = false;
    fetchAccountCanvas().then((res) => {
      if (cancelled || !res) return;
      if (res.draft && !draftIsEmpty(res.draft)) setDraft(res.draft);
      setAccountUser(res.userId);
    });
    return () => {
      cancelled = true;
    };
  }, [locked]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* private mode: the canvas still works, it just isn't kept */
    }
    if (!accountUser) return;
    const t = setTimeout(() => {
      supabase
        .from("jfb_canvases" as never)
        .upsert({ user_id: accountUser, data: draft, updated_at: new Date().toISOString() } as never, { onConflict: "user_id" })
        .then(() => undefined);
    }, 800);
    return () => clearTimeout(t);
  }, [draft, loaded, accountUser]);

  const showAirbnb = locked || view === "airbnb";
  const activeBox = BOXES.find((b) => b.id === active) ?? BY_STEP[0];
  const nextBox = BY_STEP.find((b) => b.step === activeBox.step + 1);
  const filled = BOXES.filter((b) => draft.notes[b.id].length > 0).length;

  const notesFor = (id: BoxId) => (showAirbnb ? (BOXES.find((b) => b.id === id)?.airbnb ?? []) : draft.notes[id]);
  const airbnbNotes = Object.fromEntries(BOXES.map((b) => [b.id, b.airbnb])) as Record<BoxId, string[]>;

  const addNote = (id: BoxId, t: string) =>
    setDraft((d) => ({ ...d, notes: { ...d.notes, [id]: [...d.notes[id], t].slice(0, 30) } }));
  const removeNote = (id: BoxId, i: number) =>
    setDraft((d) => ({ ...d, notes: { ...d.notes, [id]: d.notes[id].filter((_, j) => j !== i) } }));

  return (
    <div className="rounded-3xl bg-[#fffaf3] p-4 text-[#3a2f2a] shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="bg-gradient-to-r from-[#f7a35c] to-[#f2709c] bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
            Business Model Canvas
          </h2>
          <p className="mt-1 text-sm text-[#8a7d75]">
            Συμπλήρωσε τα κουτάκια με τη σειρά των αριθμών. Πάτα τον τίτλο ενός κουτιού για να δεις τις ερωτήσεις του.
          </p>
        </div>
        <div className="flex rounded-full bg-white p-1 text-sm font-black shadow-sm">
          <button
            type="button"
            onClick={() => setView("mine")}
            disabled={locked}
            className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 ${!showAirbnb ? "bg-[#f2709c] text-white" : "text-[#8a7d75]"} disabled:opacity-60`}
          >
            {locked && <Lock size={13} />} Το δικό μου
          </button>
          <button
            type="button"
            onClick={() => setView("airbnb")}
            className={`rounded-full px-4 py-1.5 ${showAirbnb ? "bg-[#f2709c] text-white" : "text-[#8a7d75]"}`}
          >
            Παράδειγμα: Airbnb
          </button>
        </div>
      </div>

      {/* Rules for the post-its */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((r) => (
          <div key={r.title} className="rounded-xl bg-[#fff3b0] p-3 text-sm shadow-sm">
            <p className="font-black">{r.title}</p>
            <p className="mt-0.5 text-[#6b5f57]">{r.body}</p>
          </div>
        ))}
      </div>

      {/* Step 0: the problem and the customer in one sentence */}
      <div className="mt-5 rounded-2xl border-2 border-dashed border-[#f2a516] bg-white p-4">
        <label htmlFor="bmc-problem" className="text-sm font-black">
          Πριν από τα κουτάκια: γράψε σε μία πρόταση το πρόβλημα και τον πελάτη.
        </label>
        {showAirbnb ? (
          <p className="mt-2 text-sm">{AIRBNB_PROBLEM}</p>
        ) : (
          <input
            id="bmc-problem"
            value={draft.problem}
            onChange={(e) => setDraft((d) => ({ ...d, problem: e.target.value.slice(0, 200) }))}
            placeholder="π.χ. Οι έφηβοι της γειτονιάς μου δεν έχουν πού να παίξουν μπάσκετ το βράδυ."
            className="mt-2 w-full rounded-lg border border-[#e8ddd4] bg-[#fffdf9] px-3 py-2 text-sm outline-none focus:border-[#c9b8ac]"
          />
        )}
        <p className="mt-2 text-xs text-[#8a7d75]">
          Ξεκινάμε από τους πελάτες (κουτάκι 1), γιατί όλα τα άλλα κουτάκια εξαρτώνται από το ποιος είναι ο πελάτης και τι του προσφέρουμε.
        </p>
      </div>

      {/* Guide for the selected box (wide screens) */}
      <div className="mt-5 hidden lg:block">
        <Guide box={activeBox} onNext={nextBox ? () => setActive(nextBox.id) : undefined} />
      </div>

      {/* The canvas: boxes keep the places of the worksheet */}
      <div className="mt-5 flex flex-col gap-4 lg:grid lg:grid-cols-10 lg:grid-rows-[minmax(190px,auto)_minmax(190px,auto)_minmax(150px,auto)] lg:gap-3">
        {BOXES.map((b) => (
          <Cell
            key={b.id}
            box={b}
            notes={notesFor(b.id)}
            active={active === b.id}
            readOnly={showAirbnb}
            onFocus={() => setActive(b.id)}
            onAdd={(t) => addNote(b.id, t)}
            onRemove={(i) => removeNote(b.id, i)}
          />
        ))}
      </div>

      {showAirbnb ? (
        <p className="mt-5 rounded-xl bg-white p-4 text-sm">
          Έτσι φαίνεται ένα συμπληρωμένο canvas. Η Airbnb ξεκίνησε το 2007 με 3 στρώματα αέρα σε ένα σαλόνι.
          {locked ? "" : " Πάτα «Το δικό μου» για να γράψεις το δικό σου."}
        </p>
      ) : (
        <>
          {/* Does the canvas hold together? */}
          <div className="mt-6 rounded-2xl bg-white p-5">
            <h3 className="text-xl font-black">Δένει το canvas σου;</h3>
            <p className="mt-1 text-sm text-[#8a7d75]">
              Συμπλήρωσες {filled} από τα 9 κουτάκια. Έλεγξε αν τα κουτάκια ταιριάζουν μεταξύ τους.
            </p>
            <div className="mt-4 grid gap-2">
              {CHECKS.map((c, i) => (
                <label key={c.pair} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#f0e6dd] p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.checks[i]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, checks: d.checks.map((v, j) => (j === i ? e.target.checked : v)) }))
                    }
                    className="mt-0.5 h-4 w-4 accent-[#f2709c]"
                  />
                  <span>
                    <b>{c.pair}:</b> {c.q}
                  </span>
                </label>
              ))}
            </div>
            {draft.checks.every(Boolean) && filled === 9 && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#e3f6ec] p-3 text-sm font-black text-[#1f6b45]">
                <Check size={18} /> Μπράβο! Το canvas σου δένει. Τώρα ρώτα πραγματικούς πελάτες αν ισχύουν οι υποθέσεις σου.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => printCanvas(draft.problem, draft.notes)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f2709c] px-5 py-2.5 text-sm font-black text-white"
            >
              <Printer size={16} /> Εκτύπωση
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Να σβηστούν όλα τα post-it του canvas σου;")) setDraft(emptyDraft());
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8ddd4] bg-white px-5 py-2.5 text-sm font-black text-[#8a7d75]"
            >
              <RotateCcw size={16} /> Καθαρισμός
            </button>
            <p className="flex items-center gap-1 text-xs text-[#8a7d75]">
              <Lightbulb size={14} /> Το canvas σου μένει αποθηκευμένο σε αυτή τη συσκευή.
            </p>
          </div>
        </>
      )}
      {locked && (
        <div className="mt-6">
          <SignupCta title="Φτιάξε το δικό σου canvas" text="Κάνε δωρεάν εγγραφή για να γράψεις τα δικά σου post-it, να ελέγξεις αν δένει το canvas σου και να το εκτυπώσεις." />
        </div>
      )}
      {showAirbnb && !locked && (
        <button
          type="button"
          onClick={() => printCanvas(AIRBNB_PROBLEM, airbnbNotes)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e8ddd4] bg-white px-5 py-2.5 text-sm font-black text-[#8a7d75]"
        >
          <Printer size={16} /> Εκτύπωση παραδείγματος
        </button>
      )}
    </div>
  );
}
