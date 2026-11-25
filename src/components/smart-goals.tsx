import { useEffect, useMemo, useState } from "react";
import { Check, Printer } from "lucide-react";

// Goal setting the S.M.A.R.T. way, from the Kids in Business worksheet
// «Η Περιπέτεια των Στόχων»: a short lesson and an interactive goal card.
// Prices are typed in euros; the app counts in coins (1 🪙 = €0,10).

export const COINS_PER_EURO = 10;
export const eurosToCoins = (eur: number) => Math.round(eur * COINS_PER_EURO);
export const coinsToEuros = (coins: number) => coins / COINS_PER_EURO;

export function euro(n: number) {
  return "€" + n.toLocaleString("el-GR", { maximumFractionDigits: 2 });
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d + (d.length === 10 ? "T12:00:00" : "")) : d;
  return date.toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" });
}

const DAY = 24 * 60 * 60 * 1000;

export function isoDate(d: Date) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export function addWeeks(weeks: number, from = new Date()) {
  return new Date(from.getTime() + weeks * 7 * DAY);
}

export function weeksUntil(dateIso: string, from = new Date()) {
  const end = new Date(dateIso + "T23:59:59").getTime();
  return (end - from.getTime()) / (7 * DAY);
}

// Where a goal in the app stands against its plan.
export function goalPlanStatus(goal: {
  saved_coins: number;
  target_coins: number;
  weekly_coins: number | null;
  deadline: string | null;
  created_at: string | null;
  completed: boolean;
}) {
  if (goal.completed) return null;
  const left = goal.target_coins - goal.saved_coins;
  if (goal.deadline && weeksUntil(goal.deadline) < 0) {
    return { tone: "late" as const, text: "Η ημερομηνία πέρασε. Σκέψου ξανά το πλάνο σου." };
  }
  if (!goal.weekly_coins || !goal.created_at) return null;
  const weeksGone = Math.max(0, (Date.now() - new Date(goal.created_at).getTime()) / (7 * DAY));
  const expected = Math.min(goal.target_coins, Math.floor(weeksGone) * goal.weekly_coins);
  if (goal.saved_coins >= expected) {
    const weeksLeft = Math.ceil(left / goal.weekly_coins);
    return { tone: "ok" as const, text: `Εντός πλάνου · περίπου ${weeksLeft} ${weeksLeft === 1 ? "εβδομάδα" : "εβδομάδες"} ακόμα` };
  }
  return { tone: "behind" as const, text: `Πίσω από το πλάνο κατά ${expected - goal.saved_coins} 🪙` };
}

// ─── The lesson ────────────────────────────────────────────────────────────

const SMART = [
  {
    letter: "S",
    en: "Specific",
    el: "Συγκεκριμένος",
    question: "Τι ακριβώς θέλεις να πετύχεις;",
    explain: "Όχι «θέλω κάτι καινούριο», αλλά ποιο πράγμα, ποιο μοντέλο, ποιο αποτέλεσμα. Όσο πιο καθαρά το βλέπεις, τόσο πιο εύκολα το κυνηγάς.",
    bad: "Θέλω να μαζέψω λεφτά.",
    good: "Θέλω ασύρματα ακουστικά για το τρέξιμο.",
  },
  {
    letter: "M",
    en: "Measurable",
    el: "Μετρήσιμος",
    question: "Πώς θα παρακολουθείς την πρόοδό σου;",
    explain: "Βάλε έναν αριθμό: πόσο κοστίζει, πόσα χιλιόμετρα, ποιος βαθμός. Έτσι ξέρεις κάθε εβδομάδα πόσο κοντά είσαι.",
    bad: "Θα μαζέψω αρκετά.",
    good: "Κοστίζουν €80 και έχω ήδη €20.",
  },
  {
    letter: "A",
    en: "Attainable",
    el: "Εφικτός",
    question: "Πώς μπορείς να τον πετύχεις;",
    explain: "Γράψε το σχέδιο: πόσα βάζεις στην άκρη κάθε εβδομάδα και από πού έρχονται (χαρτζιλίκι, δουλειές, μια μικρή επιχείρηση). Αν δε βγαίνει, άλλαξε το ποσό ή την ημερομηνία.",
    bad: "Θα δούμε.",
    good: "Βάζω €6 την εβδομάδα: €4 από το χαρτζιλίκι και €2 από το πλύσιμο του αυτοκινήτου.",
  },
  {
    letter: "R",
    en: "Relevant",
    el: "Σχετικός",
    question: "Γιατί είναι σημαντικός αυτός ο στόχος για σένα;",
    explain: "Όταν ένας στόχος σε ενδιαφέρει πραγματικά, συνεχίζεις να αποταμιεύεις ακόμα κι όταν βαριέσαι ή όταν θέλεις να ξοδέψεις τα χρήματα σε κάτι άλλο.",
    bad: "Επειδή τα έχουν όλοι.",
    good: "Τρέχω τρεις φορές την εβδομάδα και τα καλώδια των ενσύρματων ακουστικών μπερδεύονται.",
  },
  {
    letter: "T",
    en: "Timely",
    el: "Με ημερομηνία",
    question: "Πότε θα εκπληρωθεί αυτός ο στόχος;",
    explain: "Μια προθεσμία μετατρέπει το «κάποια στιγμή» σε σχέδιο. Διάλεξε ημερομηνία που να ταιριάζει με όσα βάζεις κάθε εβδομάδα.",
    bad: "Κάποια στιγμή.",
    good: "Μέχρι τις 20 Μαρτίου, σε 10 εβδομάδες.",
  },
];

const QUIZ = [
  {
    q: "Ποιος από τους δύο στόχους είναι SMART;",
    options: ["Θέλω να γίνω καλύτερος στα οικονομικά.", "Θα βάζω €5 κάθε Παρασκευή για να μαζέψω €100 μέχρι το Πάσχα."],
    correct: 1,
    explain: "Ο δεύτερος έχει ποσό, σχέδιο και ημερομηνία. Ο πρώτος είναι μια καλή πρόθεση, αλλά δεν ξέρεις πότε τον πέτυχες.",
  },
  {
    q: "Θέλεις laptop €600 σε 4 εβδομάδες και μπορείς να βάζεις €10 την εβδομάδα. Τι λείπει;",
    options: ["Το «Εφικτός»: με αυτό το πλάνο θα μαζέψεις μόνο €40.", "Τίποτα, είναι τέλειος."],
    correct: 0,
    explain: "€10 × 4 = €40. Ή μεγαλώνεις την προθεσμία (60 εβδομάδες), ή βρίσκεις κι άλλα έσοδα, ή διαλέγεις φθηνότερο μοντέλο.",
  },
];

export function SmartLesson() {
  const [open, setOpen] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const s = SMART[open];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Μάθημα · 5 λεπτά</p>
        <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Πώς θέτω στόχους που πετυχαίνουν</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Ένας στόχος είναι κάτι που θέλεις να πετύχεις: κάτι να αγοράσεις, ένα ταξίδι, μια επίδοση στο σχολείο ή στον
          αθλητισμό. Οι στόχοι που πετυχαίνουν έχουν πέντε χαρακτηριστικά, που μαζί λέγονται <strong>S.M.A.R.T.</strong>
        </p>
      </div>

      {/* SMART letters */}
      <div className="mt-10 grid grid-cols-5 gap-2 sm:gap-3">
        {SMART.map((item, i) => (
          <button
            key={item.letter}
            onClick={() => setOpen(i)}
            className={`rounded-2xl px-1 py-4 text-center transition-all sm:py-5 ${
              open === i ? "bg-[oklch(0.57_0.23_292)] text-white shadow-lg" : "bg-card text-foreground shadow-sm hover:-translate-y-0.5"
            }`}
            aria-pressed={open === i}
          >
            <span className="block text-3xl font-black sm:text-4xl">{item.letter}</span>
            <span className={`mt-1 block text-[10px] font-bold sm:text-xs ${open === i ? "text-white/80" : "text-muted-foreground"}`}>{item.el}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-[oklch(0.57_0.23_292)]">
          {s.letter} · {s.en} · {s.el}
        </p>
        <h3 className="mt-2 text-2xl font-black">{s.question}</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{s.explain}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[oklch(0.96_0.03_25)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[oklch(0.5_0.15_25)]">Αόριστο</p>
            <p className="mt-1 font-semibold">«{s.bad.replace(/.$/, "")}».</p>
          </div>
          <div className="rounded-xl bg-[oklch(0.96_0.04_160)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[oklch(0.45_0.13_160)]">SMART</p>
            <p className="mt-1 font-semibold">«{s.good.replace(/.$/, "")}».</p>
          </div>
        </div>
        <div className="mt-5 flex justify-between text-sm font-bold">
          <button onClick={() => setOpen((open + 4) % 5)} className="text-muted-foreground hover:text-foreground">← Προηγούμενο</button>
          <button onClick={() => setOpen((open + 1) % 5)} className="text-[oklch(0.57_0.23_292)]">Επόμενο →</button>
        </div>
      </div>

      {/* Quick check */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {QUIZ.map((item, qi) => {
          const picked = answers[qi];
          return (
            <div key={qi} className="rounded-2xl bg-card p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Έλεγξε τον εαυτό σου</p>
              <p className="mt-2 font-black">{item.q}</p>
              <div className="mt-4 space-y-2">
                {item.options.map((opt, oi) => {
                  const chosen = picked === oi;
                  const right = picked !== null && oi === item.correct;
                  return (
                    <button
                      key={oi}
                      onClick={() => setAnswers((a) => a.map((v, k) => (k === qi ? oi : v)))}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ring-1 transition-all ${
                        right
                          ? "bg-[oklch(0.96_0.04_160)] ring-[oklch(0.6_0.13_160)]"
                          : chosen
                            ? "bg-[oklch(0.96_0.03_25)] ring-[oklch(0.65_0.15_25)]"
                            : "bg-background ring-border hover:ring-[oklch(0.57_0.23_292)]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">{picked === item.correct ? "Σωστά. " : "Όχι ακριβώς. "}</strong>
                  {item.explain}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* The rest of the worksheet */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Διάλεξε 3–5 στόχους", "Λίγοι και σημαντικοί στόχοι πετυχαίνουν· δέκα στόχοι μαζί σκορπίζουν τα χρήματα και τη διάθεσή σου. Βάλε οικονομικούς και προσωπικούς."],
          ["Σπάσε τον μεγάλο στόχο", "Laptop €600; Είναι €15 την εβδομάδα για 40 εβδομάδες. Είτε πρόκειται για €10 είτε για €100, κάθε βήμα χτίζει δυναμική."],
          ["Αν θέλει χρήματα, κέρδισέ τα", "Κάποιοι στόχοι θέλουν περισσότερα από αποταμίευση. Εκεί μπαίνουν οι δουλειές και η δική σου μικρή επιχείρηση."],
          ["Γιόρτασε και σκέψου", "Όταν τον πετύχεις, γιόρτασέ το και γράψε τι έμαθες. Αυτό χτίζει αυτοπεποίθηση για τον επόμενο, πιο μεγάλο στόχο."],
        ].map(([title, copy], i) => (
          <div key={title} className="rounded-2xl bg-card p-6 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(0.57_0.23_292)] text-sm font-black text-white">{i + 1}</span>
            <h3 className="mt-3 text-lg font-black">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── The goal card ─────────────────────────────────────────────────────────

export type GoalDraft = {
  kind: "money" | "personal";
  name: string;
  what: string;
  price: string; // € (money)
  saved: string; // € already saved (money, lesson only)
  weekly: string; // € per week (money)
  measure: string; // how progress is measured (personal)
  how: string; // the plan (personal)
  why: string;
  deadline: string; // yyyy-mm-dd
};

const EMPTY: GoalDraft = { kind: "money", name: "", what: "", price: "", saved: "", weekly: "", measure: "", how: "", why: "", deadline: "" };
const DRAFT_KEY = "kib-goal-card";

const EXAMPLES: Partial<GoalDraft>[] = [
  { kind: "money", what: "Ασύρματα ακουστικά", price: "80", weekly: "6", why: "Τρέχω τρεις φορές την εβδομάδα και θέλω ακουστικά χωρίς καλώδια." },
  { kind: "money", what: "Εισιτήριο για τη συναυλία του καλοκαιριού", price: "45", weekly: "5", why: "Πηγαίνει όλη η παρέα και θέλω να το πληρώσω με δικά μου χρήματα." },
  { kind: "money", what: "Ταξίδι με τους φίλους μου μετά τις εξετάσεις", price: "250", weekly: "10", why: "Το πρώτο ταξίδι χωρίς γονείς, που θα το έχω οργανώσει εγώ." },
  { kind: "personal", what: "Να τρέξω 5 χιλιόμετρα χωρίς στάση", measure: "Χιλιόμετρα κάθε Κυριακή, σε εφαρμογή στο κινητό", how: "3 προπονήσεις την εβδομάδα, +500 μέτρα κάθε εβδομάδα", why: "Θέλω να μπω στην ομάδα στίβου του σχολείου." },
];

function num(s: string) {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Works out the plan from what has been typed.
export function planFor(d: GoalDraft) {
  const price = num(d.price);
  const saved = Math.min(num(d.saved), price);
  const weekly = num(d.weekly);
  const left = Math.max(0, price - saved);
  const weeksNeeded = weekly > 0 ? Math.ceil(left / weekly) : null;
  const reachBy = weeksNeeded !== null ? addWeeks(weeksNeeded) : null;
  const weeksToDeadline = d.deadline ? Math.floor(weeksUntil(d.deadline)) : null;
  const deadlinePast = weeksToDeadline !== null && weeksUntil(d.deadline) < 0;
  const needWeekly = weeksToDeadline && weeksToDeadline > 0 ? Math.ceil((left / weeksToDeadline) * 100) / 100 : null;
  const fits = weeksNeeded !== null && weeksToDeadline !== null && !deadlinePast ? weeksNeeded <= Math.max(weeksToDeadline, 0) : null;
  return { price, saved, weekly, left, weeksNeeded, reachBy, weeksToDeadline, deadlinePast, needWeekly, fits };
}

export function smartChecks(d: GoalDraft) {
  const p = planFor(d);
  if (d.kind === "personal") {
    return {
      S: d.what.trim().length >= 4,
      M: d.measure.trim().length >= 3,
      A: d.how.trim().length >= 3,
      R: d.why.trim().length >= 5,
      T: !!d.deadline && !p.deadlinePast,
    };
  }
  return {
    S: d.what.trim().length >= 4,
    M: p.price > 0,
    A: p.weekly > 0 && p.fits !== false && (p.weeksNeeded ?? 999) <= 104,
    R: d.why.trim().length >= 5,
    T: !!d.deadline && !p.deadlinePast,
  };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function printCard(d: GoalDraft) {
  const p = planFor(d);
  const rows: [string, string][] = [
    ["Όνομα", d.name],
    ["Στόχος (Συγκεκριμένος)", d.what],
    d.kind === "money"
      ? ["Πόσο κοστίζει (Μετρήσιμος)", p.price ? `${euro(p.price)}${p.saved ? ` · έχω ήδη ${euro(p.saved)}` : ""}` : ""]
      : ["Πώς θα μετρώ την πρόοδο (Μετρήσιμος)", d.measure],
    d.kind === "money"
      ? ["Το σχέδιό μου (Εφικτός)", p.weekly ? `${euro(p.weekly)} κάθε εβδομάδα${p.weeksNeeded ? `, σε ${p.weeksNeeded} εβδομάδες` : ""}` : ""]
      : ["Το σχέδιό μου (Εφικτός)", d.how],
    ["Γιατί είναι σημαντικός (Σχετικός)", d.why],
    ["Θα τον έχω πετύχει στις (Με ημερομηνία)", d.deadline ? formatDate(d.deadline) : ""],
  ];
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Κάρτα στόχου</title>
<style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:40px;color:#2b2540}
.card{border:3px solid #7c4dff;border-radius:24px;padding:32px;max-width:560px;margin:auto}
h1{margin:0 0 4px;font-size:28px;color:#5b2fd6}.sub{margin:0 0 24px;color:#777;font-size:14px}
.row{border-bottom:1px dashed #c9bdf5;padding:12px 0}.k{font-size:12px;font-weight:700;letter-spacing:.06em;color:#7c4dff;text-transform:uppercase}
.v{font-size:18px;font-weight:600;min-height:24px;margin-top:4px}.sign{margin-top:40px;display:flex;justify-content:space-between;font-size:13px;color:#777}
.sign span{border-top:1px solid #999;padding-top:6px;width:45%}.foot{text-align:center;margin-top:24px;font-size:12px;color:#999}
</style></head><body><div class="card"><h1>Κάρτα στόχου</h1><p class="sub">Η Περιπέτεια των Στόχων · S.M.A.R.T.</p>
${rows.map(([k, v]) => `<div class="row"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div></div>`).join("")}
<div class="sign"><span>Υπογραφή</span><span>Ημερομηνία</span></div></div><p class="foot">kidsinbusiness.gr</p>
<script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

export function GoalCardBuilder({
  mode,
  onSave,
  saving,
  emojiPicker,
}: {
  mode: "lesson" | "app";
  // Lesson: offered only when a child is signed in. App: required.
  onSave?: (d: GoalDraft) => void | Promise<void>;
  saving?: boolean;
  emojiPicker?: React.ReactNode;
}) {
  const [d, setD] = useState<GoalDraft>(EMPTY);

  // The lesson keeps an unsent card in this browser only.
  useEffect(() => {
    if (mode !== "lesson") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setD({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* no storage */
    }
  }, [mode]);
  useEffect(() => {
    if (mode !== "lesson") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {
      /* no storage */
    }
  }, [d, mode]);

  const set = (k: keyof GoalDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setD((x) => ({ ...x, [k]: e.target.value }));
  const p = useMemo(() => planFor(d), [d]);
  const checks = smartChecks(d);
  const allDone = Object.values(checks).every(Boolean);
  const isMoney = d.kind === "money";
  const minDate = isoDate(addWeeks(1 / 7));

  const field = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-800 focus:border-[oklch(0.57_0.23_292)] focus:outline-none";
  const label = "mb-1 flex items-center gap-2 text-sm font-bold text-gray-600";
  const tag = (l: string) => (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-black ${
        checks[l as keyof typeof checks] ? "bg-[oklch(0.62_0.17_160)] text-white" : "bg-gray-100 text-gray-400"
      }`}
    >
      {checks[l as keyof typeof checks] ? <Check className="h-3 w-3" /> : l}
    </span>
  );

  return (
    <div className={mode === "lesson" ? "grid gap-6 lg:grid-cols-[1fr_320px]" : ""}>
      <div className={mode === "lesson" ? "rounded-2xl bg-card p-6 shadow-lg sm:p-8" : ""}>
        {mode === "lesson" && (
          <>
            <div className="mb-5 inline-flex rounded-xl bg-muted p-1 text-sm font-bold">
              {(["money", "personal"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setD((x) => ({ ...x, kind: k }))}
                  className={`rounded-lg px-4 py-2 ${d.kind === k ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {k === "money" ? "Οικονομικός στόχος" : "Προσωπικός στόχος"}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <p className={label}>Όνομα</p>
              <input className={field} value={d.name} onChange={set("name")} placeholder="Το όνομά σου" maxLength={40} />
            </div>
          </>
        )}

        {emojiPicker}

        <div className="space-y-4">
          <div>
            <p className={label}>{tag("S")} Τι ακριβώς θέλεις να πετύχεις;</p>
            <input
              className={field}
              value={d.what}
              onChange={set("what")}
              maxLength={60}
              placeholder={isMoney ? "π.χ. Ασύρματα ακουστικά για το τρέξιμο" : "π.χ. Να τρέξω 5 χλμ χωρίς στάση"}
            />
          </div>

          {isMoney ? (
            <>
              <div className={mode === "lesson" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div>
                  <p className={label}>{tag("M")} Πόσο κοστίζει; (€)</p>
                  <input className={field} type="number" inputMode="decimal" min={1} value={d.price} onChange={set("price")} placeholder="80" />
                  {mode === "app" && p.price > 0 && (
                    <p className="mt-1 text-xs font-semibold text-gray-400">= {eurosToCoins(p.price)} 🪙 στην εφαρμογή (1 🪙 = €0,10)</p>
                  )}
                </div>
                {mode === "lesson" && (
                  <div>
                    <p className={label}>Πόσα έχεις ήδη μαζέψει; (€)</p>
                    <input className={field} type="number" inputMode="decimal" min={0} value={d.saved} onChange={set("saved")} placeholder="0" />
                  </div>
                )}
              </div>
              <div>
                <p className={label}>{tag("A")} Πόσα μπορείς να βάζεις στην άκρη κάθε εβδομάδα; (€)</p>
                <input className={field} type="number" inputMode="decimal" min={0.5} step={0.5} value={d.weekly} onChange={set("weekly")} placeholder="6" />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className={label}>{tag("M")} Πώς θα μετράς την πρόοδό σου;</p>
                <input className={field} value={d.measure} onChange={set("measure")} maxLength={80} placeholder="π.χ. Χιλιόμετρα κάθε Κυριακή" />
              </div>
              <div>
                <p className={label}>{tag("A")} Πώς θα τον πετύχεις; Ποια βήματα θα κάνεις;</p>
                <input className={field} value={d.how} onChange={set("how")} maxLength={100} placeholder="π.χ. 3 προπονήσεις την εβδομάδα" />
              </div>
            </>
          )}

          <div>
            <p className={label}>{tag("R")} Γιατί είναι σημαντικός για σένα;</p>
            <textarea className={`${field} min-h-[72px] resize-none`} value={d.why} onChange={set("why")} maxLength={200} placeholder="Γράψε τον πραγματικό σου λόγο" />
          </div>

          <div>
            <p className={label}>{tag("T")} Μέχρι πότε θα τον έχεις πετύχει;</p>
            <div className="flex flex-wrap items-center gap-2">
              <input className={`${field} sm:max-w-[220px]`} type="date" min={minDate} value={d.deadline} onChange={set("deadline")} />
              {isMoney && p.reachBy && (
                <button
                  type="button"
                  onClick={() => setD((x) => ({ ...x, deadline: isoDate(p.reachBy as Date) }))}
                  className="rounded-xl bg-[oklch(0.57_0.23_292/0.1)] px-3 py-2 text-xs font-bold text-[oklch(0.45_0.2_292)]"
                >
                  Βάλε {formatDate(p.reachBy)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* The plan, worked out */}
        {isMoney && p.price > 0 && (
          <div className="mt-5 rounded-xl bg-[oklch(0.57_0.23_292)] p-4 text-sm text-white">
            {p.left === 0 ? (
              <p className="font-bold">Έχεις ήδη όλο το ποσό. Βάλε έναν πιο φιλόδοξο στόχο.</p>
            ) : p.weeksNeeded === null ? (
              <p className="font-bold">Γράψε πόσα βάζεις κάθε εβδομάδα για να δεις πότε φτάνεις τον στόχο.</p>
            ) : (
              <>
                <p className="font-bold">
                  Με {euro(p.weekly)} την εβδομάδα φτάνεις τα {euro(p.price)} σε {p.weeksNeeded}{" "}
                  {p.weeksNeeded === 1 ? "εβδομάδα" : "εβδομάδες"}, γύρω στις {formatDate(p.reachBy as Date)}.
                </p>
                {p.weeksNeeded > 104 && <p className="mt-1 text-white/85">Αυτό είναι πάνω από δύο χρόνια. Χώρισέ τον σε μικρότερους στόχους ή βρες κι άλλα έσοδα.</p>}
                {p.deadlinePast && <p className="mt-1 text-white/85">Η ημερομηνία που διάλεξες έχει περάσει.</p>}
                {p.fits === false && p.needWeekly !== null && (
                  <p className="mt-1 text-white/85">
                    Για να προλάβεις τις {formatDate(d.deadline)} χρειάζεσαι {euro(p.needWeekly)} την εβδομάδα. Αύξησε το ποσό, βρες έξτρα
                    έσοδα ή διάλεξε πιο μακρινή ημερομηνία.
                  </p>
                )}
                {p.fits === true && <p className="mt-1 text-white/85">Προλαβαίνεις την ημερομηνία σου.</p>}
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {mode === "lesson" && (
            <button
              type="button"
              onClick={() => printCard(d)}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-3 text-sm font-bold text-foreground"
            >
              <Printer className="h-4 w-4" /> Εκτύπωσε την κάρτα
            </button>
          )}
          {onSave && (isMoney || mode === "app") && (
            <button
              type="button"
              disabled={!allDone || saving}
              onClick={async () => {
                await onSave(d);
                if (mode === "lesson") {
                  try {
                    localStorage.removeItem(DRAFT_KEY);
                  } catch {
                    /* no storage */
                  }
                }
              }}
              className="rounded-full bg-[oklch(0.57_0.23_292)] px-6 py-3 text-sm font-black text-white disabled:opacity-40"
            >
              {saving ? "Αποθήκευση…" : mode === "app" ? "Δημιουργία στόχου" : "Πρόσθεσέ τον στους στόχους μου →"}
            </button>
          )}
          {mode === "lesson" && (
            <button type="button" onClick={() => setD({ ...EMPTY, kind: d.kind })} className="px-2 text-sm font-bold text-muted-foreground">
              Καθάρισμα
            </button>
          )}
        </div>
        {onSave && !allDone && (
          <p className="mt-2 text-xs font-semibold text-gray-400">Συμπλήρωσε και τα πέντε γράμματα S.M.A.R.T. για να τον αποθηκεύσεις.</p>
        )}
      </div>

      {mode === "lesson" && (
        <aside className="space-y-4">
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Πόσο SMART είναι ο στόχος σου;</p>
            <ul className="mt-3 space-y-2">
              {SMART.map((s) => (
                <li key={s.letter} className="flex items-center gap-3 text-sm font-semibold">
                  {tag(s.letter)}
                  <span className={checks[s.letter as keyof typeof checks] ? "text-foreground" : "text-muted-foreground"}>{s.el}</span>
                </li>
              ))}
            </ul>
            {allDone && <p className="mt-3 rounded-lg bg-[oklch(0.96_0.04_160)] p-3 text-sm font-bold text-[oklch(0.4_0.12_160)]">Ο στόχος σου είναι SMART.</p>}
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Δεν ξέρεις από πού να ξεκινήσεις;</p>
            <div className="mt-3 space-y-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.what}
                  onClick={() => setD({ ...EMPTY, name: d.name, ...ex, deadline: "" })}
                  className="block w-full rounded-xl bg-background px-3 py-2 text-left text-sm font-semibold ring-1 ring-border hover:ring-[oklch(0.57_0.23_292)]"
                >
                  {ex.what}
                  {ex.price ? <span className="text-muted-foreground"> · €{ex.price}</span> : null}
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
