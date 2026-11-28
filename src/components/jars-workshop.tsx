import { useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import { useLessonWork } from "@/hooks/useLessonWork";
import { SaveNote } from "@/components/brainstorm-workshop";

// Lesson 3 (Πώς λειτουργεί η αποταμίευση) workshop: the Kids in Business
// "Το σύστημα των 3 βάζων". The child shares their weekly money into three
// jars (giving, spending, investing), then plays the weeks and months: at the
// end of each month the giving jar is given, the spending jar is spent on
// small wishes, and the investing jar stays, with 1 € from the parents as a
// reward when it has money in it. Kept in the account.

type JarId = "give" | "spend" | "invest";
type Event = { month: number; text: string };
type State = {
  weekly: number;
  split: Record<JarId, number>;
  cause: string;
  wish: string;
  big: string;
  week: number; // weeks played (4 a month, 48 a year)
  jars: Record<JarId, number>;
  totals: { given: number; spent: number; bonus: number };
  log: Event[];
};

const WEEKS_A_MONTH = 4;
const MONTHS = 12;
const BONUS = 1;

const JARS: { id: JarId; name: string; color: string; fill: string; text: string; power: string }[] = [
  {
    id: "give",
    name: "Το βάζο της δωρεάς",
    color: "#e76f8a",
    fill: "#f7b8c6",
    text: "Εδώ μπαίνουν χρήματα για να βοηθήσεις κάποιον που έχει ανάγκη. Κάθε τέλος του μήνα αποφασίζεις εσύ πού θα τα δωρίσεις: σε μια φιλανθρωπική ή φιλοζωική οργάνωση ή σε κάποιον συνάνθρωπο που τα έχει πραγματικά ανάγκη. Η προσφορά είναι η μεγαλύτερη δύναμη των ανθρώπων!",
    power: "💝 Δύναμη: η προσφορά",
  },
  {
    id: "spend",
    name: "Το βάζο για ξόδεμα",
    color: "#d4a843",
    fill: "#f3dc8e",
    text: "Αυτά τα χρήματα είναι για τις μικρές σου επιθυμίες, που μπορείς να τις αγοράζεις στο τέλος κάθε μήνα.",
    power: "🍦 Δύναμη: οι μικρές χαρές",
  },
  {
    id: "invest",
    name: "Το βάζο των επενδύσεων",
    color: "#3fa36b",
    fill: "#a8dcb9",
    text: "Εδώ αφήνεις τα χρήματα για κάτι μεγάλο που θέλεις να κάνεις στο τέλος του χρόνου, π.χ. ένα ταξίδι. Αν στο τέλος του μήνα έχει χρήματα μέσα, οι γονείς σου σού χαρίζουν 1 € επιπλέον ως επιβράβευση!",
    power: "🚀 Δύναμη: μεγαλώνει",
  },
];

const fresh = (weekly = 5, split = { give: 1, spend: 2, invest: 2 }): State => ({
  weekly,
  split,
  cause: "",
  wish: "",
  big: "",
  week: 0,
  jars: { give: 0, spend: 0, invest: 0 },
  totals: { given: 0, spent: 0, bonus: 0 },
  log: [],
});

const n = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : 0);
const s = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
function parse(raw: unknown): State {
  const d = (raw ?? {}) as Partial<State>;
  const base = fresh(n(d.weekly, 100) || 5);
  if (d.split) base.split = { give: n(d.split.give, 100), spend: n(d.split.spend, 100), invest: n(d.split.invest, 100) };
  base.cause = s(d.cause, 60);
  base.wish = s(d.wish, 60);
  base.big = s(d.big, 60);
  base.week = Math.floor(n(d.week, WEEKS_A_MONTH * MONTHS));
  if (d.jars) base.jars = { give: n(d.jars.give, 99999), spend: n(d.jars.spend, 99999), invest: n(d.jars.invest, 99999) };
  if (d.totals) base.totals = { given: n(d.totals.given, 99999), spent: n(d.totals.spent, 99999), bonus: n(d.totals.bonus, 99999) };
  if (Array.isArray(d.log)) base.log = d.log.slice(-MONTHS * 3).map((e) => ({ month: Math.floor(n(e?.month, MONTHS)), text: s(e?.text, 160) }));
  return base;
}

const eur = (v: number) => v.toLocaleString("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const MONTH_NAMES = ["1ος", "2ος", "3ος", "4ος", "5ος", "6ος", "7ος", "8ος", "9ος", "10ος", "11ος", "12ος"];

// A happy jar, like the ones on the workbook page; the money fills it.
function Jar({ id, fill, level, amount }: { id: string; fill: string; level: number; amount: number }) {
  const h = Math.max(0, Math.min(1, level)) * 92;
  return (
    <svg viewBox="0 0 120 150" className="mx-auto h-40 w-32" aria-hidden>
      <defs>
        <clipPath id={`jar-${id}`}>
          <path d="M22 40 Q14 44 14 60 L14 128 Q14 142 30 142 L90 142 Q106 142 106 128 L106 60 Q106 44 98 40 Z" />
        </clipPath>
      </defs>
      <text x="8" y="22" fontSize="14">💗</text>
      <text x="96" y="26" fontSize="12">✨</text>
      <rect x="0" y={142 - h} width="120" height={h} fill={fill} clipPath={`url(#jar-${id})`} style={{ transition: "y .5s, height .5s" }} />
      {amount > 0 &&
        Array.from({ length: Math.min(6, Math.ceil(level * 6)) }, (_, i) => (
          <circle key={i} cx={30 + (i % 3) * 30} cy={134 - Math.floor(i / 3) * 16} r="8" fill="#f6c945" stroke="#c9952a" strokeWidth="1.5" />
        ))}
      <path d="M22 40 Q14 44 14 60 L14 128 Q14 142 30 142 L90 142 Q106 142 106 128 L106 60 Q106 44 98 40 Z" fill="rgba(220,240,245,.35)" stroke="#2f4d5c" strokeWidth="3" />
      <rect x="24" y="24" width="72" height="16" rx="5" fill="#eef7f8" stroke="#2f4d5c" strokeWidth="3" />
      <path d="M45 74 q5 -6 10 0 M65 74 q5 -6 10 0" fill="none" stroke="#2f4d5c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 84 q10 10 20 0 Z" fill="#e76f8a" stroke="#2f4d5c" strokeWidth="2" />
      <circle cx="40" cy="84" r="4" fill="#f7b8c6" />
      <circle cx="80" cy="84" r="4" fill="#f7b8c6" />
    </svg>
  );
}

export function JarsWorkshop() {
  const { data: st, setData, signedIn, saved } = useLessonWork<State>("jars", fresh(), parse);
  const [flash, setFlash] = useState<string | null>(null);

  const sum = st.split.give + st.split.spend + st.split.invest;
  const balanced = Math.abs(sum - st.weekly) < 0.001;
  const month = Math.floor(st.week / WEEKS_A_MONTH);
  const done = st.week >= WEEKS_A_MONTH * MONTHS;
  const started = st.week > 0;

  const setSplit = (id: JarId, delta: number) =>
    setData((d) => {
      const v = Math.max(0, Math.min(d.weekly, d.split[id] + delta));
      return { ...d, split: { ...d.split, [id]: v } };
    });

  // One week: the weekly money goes into the jars. At the end of a month, the
  // giving jar is given, the spending jar spent, and the investing jar earns
  // the parents' reward if it has money in it.
  const playWeek = (d: State): State => {
    if (d.week >= WEEKS_A_MONTH * MONTHS) return d;
    const jars = { give: d.jars.give + d.split.give, spend: d.jars.spend + d.split.spend, invest: d.jars.invest + d.split.invest };
    const week = d.week + 1;
    if (week % WEEKS_A_MONTH !== 0) return { ...d, jars, week };
    const m = week / WEEKS_A_MONTH;
    const log = [...d.log];
    const totals = { ...d.totals };
    if (jars.give > 0) {
      log.push({ month: m, text: `💝 Δώρισες ${eur(jars.give)}${d.cause.trim() ? ` σε «${d.cause.trim()}»` : ""}.` });
      totals.given += jars.give;
      jars.give = 0;
    }
    if (jars.spend > 0) {
      log.push({ month: m, text: `🍦 Ξόδεψες ${eur(jars.spend)}${d.wish.trim() ? ` για «${d.wish.trim()}»` : " σε μικρές επιθυμίες"}.` });
      totals.spent += jars.spend;
      jars.spend = 0;
    }
    if (jars.invest > 0) {
      jars.invest += BONUS;
      totals.bonus += BONUS;
      log.push({ month: m, text: `🎁 Το βάζο των επενδύσεων είχε χρήματα: οι γονείς σου σού χάρισαν ${eur(BONUS)}!` });
    }
    return { ...d, jars, week, log, totals };
  };

  const play = (weeks: number) => {
    if (!balanced) return;
    setData((d) => {
      let x = d;
      for (let i = 0; i < weeks; i++) x = playWeek(x);
      return x;
    });
    setFlash(weeks === 1 ? "+1 εβδομάδα" : "+1 μήνας");
    setTimeout(() => setFlash(null), 900);
  };

  const restart = () => setData((d) => ({ ...fresh(d.weekly, d.split), cause: d.cause, wish: d.wish, big: d.big }));

  // How full each jar looks: against a month for giving and spending, and
  // against the whole year for investing.
  const yearInvest = st.weekly > 0 ? st.split.invest * WEEKS_A_MONTH * MONTHS + BONUS * MONTHS : 1;
  const level = (id: JarId) =>
    id === "invest" ? st.jars.invest / Math.max(1, yearInvest) : st.jars[id] / Math.max(1, st.split[id] * WEEKS_A_MONTH);

  return (
    <div id="jars-print" className="mx-auto max-w-4xl">
      <style>{`@media print {
  @page { size: A4; margin: 10mm; }
  body * { visibility: hidden !important; }
  #jars-print, #jars-print * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #jars-print { position: absolute; left: 0; top: 0; width: 100%; }
  #jars-print .no-print { display: none !important; }
}`}</style>

      <div className="relative overflow-hidden rounded-3xl bg-[#bfeaea] p-5 text-[#1f3b6e] sm:p-8">
        <p className="text-center text-3xl font-black text-[#c4607e] sm:text-4xl">Το σύστημα των 3 βάζων</p>
        <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed">
          Τώρα που έγινες έμπειρος εξερευνητής, τα βάζα σου αναβαθμίζονται! Μόλις πάρεις τα χρήματα της εβδομάδας, τα μοιράζεις σε 3 «μαγικά» βάζα
          με νέες δυνάμεις.
        </p>

        {/* Weekly money and the split */}
        <div className="no-print mx-auto mt-5 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-white/70 p-3">
          <span className="font-bold">Κάθε εβδομάδα παίρνω</span>
          <input
            type="number"
            min={1}
            max={100}
            value={st.weekly}
            disabled={started}
            onChange={(e) => {
              const w = Math.max(1, Math.min(100, Math.round(Number(e.target.value) || 1)));
              setData((d) => ({ ...d, weekly: w }));
            }}
            className="w-16 rounded-lg border bg-white px-2 py-1 text-center text-lg font-black disabled:opacity-60"
          />
          <span className="font-bold">€</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {JARS.map((j) => (
            <div key={j.id} className="rounded-3xl bg-white/80 p-4 text-center shadow-sm">
              <Jar id={j.id} fill={j.fill} level={level(j.id)} amount={st.jars[j.id]} />
              <p className="text-lg font-black" style={{ color: j.color }}>
                {j.name}
              </p>
              <p className="text-2xl font-black">{eur(st.jars[j.id])}</p>
              <div className="no-print mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setSplit(j.id, -1)}
                  disabled={started || st.split[j.id] <= 0}
                  aria-label={`Λιγότερα στο ${j.name}`}
                  className="h-8 w-8 rounded-full border-2 font-black disabled:opacity-30"
                  style={{ borderColor: j.color }}
                >
                  −
                </button>
                <span className="min-w-[90px] text-sm font-bold">{eur(st.split[j.id])} / εβδομάδα</span>
                <button
                  onClick={() => setSplit(j.id, 1)}
                  disabled={started || sum >= st.weekly}
                  aria-label={`Περισσότερα στο ${j.name}`}
                  className="h-8 w-8 rounded-full border-2 font-black disabled:opacity-30"
                  style={{ borderColor: j.color }}
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-xs font-bold opacity-80">{j.power}</p>
              <p className="mt-1 text-left text-xs leading-relaxed">{j.text}</p>
              {j.id === "give" && (
                <input
                  value={st.cause}
                  onChange={(e) => setData((d) => ({ ...d, cause: e.target.value.slice(0, 60) }))}
                  placeholder="Πού θα τα δωρίσω; π.χ. φιλοζωική οργάνωση"
                  className="mt-2 w-full rounded-lg border bg-white px-2 py-1.5 text-xs outline-none placeholder:opacity-50"
                />
              )}
              {j.id === "spend" && (
                <input
                  value={st.wish}
                  onChange={(e) => setData((d) => ({ ...d, wish: e.target.value.slice(0, 60) }))}
                  placeholder="Μια μικρή επιθυμία, π.χ. παγωτό με φίλους"
                  className="mt-2 w-full rounded-lg border bg-white px-2 py-1.5 text-xs outline-none placeholder:opacity-50"
                />
              )}
              {j.id === "invest" && (
                <input
                  value={st.big}
                  onChange={(e) => setData((d) => ({ ...d, big: e.target.value.slice(0, 60) }))}
                  placeholder="Το μεγάλο μου σχέδιο, π.χ. ένα ταξίδι"
                  className="mt-2 w-full rounded-lg border bg-white px-2 py-1.5 text-xs outline-none placeholder:opacity-50"
                />
              )}
            </div>
          ))}
        </div>

        {!balanced && (
          <p className="no-print mt-4 rounded-xl bg-white/80 p-3 text-center text-sm font-bold text-[#c4607e]">
            {sum < st.weekly
              ? `Μοίρασε όλα τα χρήματα της εβδομάδας: σου μένουν ακόμα ${eur(st.weekly - sum)} για τα βάζα.`
              : `Έβαλες ${eur(sum - st.weekly)} περισσότερα απ' όσα παίρνεις.`}
          </p>
        )}

        {/* Play the weeks */}
        <div className="no-print mt-5 rounded-2xl bg-white/80 p-4 text-center">
          <p className="font-black">
            {done
              ? "🎉 Πέρασε ένας ολόκληρος χρόνος!"
              : `${MONTH_NAMES[Math.min(month, MONTHS - 1)]} μήνας · εβδομάδα ${(st.week % WEEKS_A_MONTH) + 1} από ${WEEKS_A_MONTH}`}
          </p>
          {!done && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => play(1)}
                disabled={!balanced}
                className="rounded-full bg-[#1f3b6e] px-5 py-2.5 text-sm font-black text-white disabled:opacity-40"
              >
                💶 Πήρα τα χρήματα της εβδομάδας
              </button>
              <button
                onClick={() => play(WEEKS_A_MONTH - (st.week % WEEKS_A_MONTH))}
                disabled={!balanced}
                className="rounded-full border-2 border-[#1f3b6e] px-5 py-2.5 text-sm font-black disabled:opacity-40"
              >
                ⏩ Πήγαινε στο τέλος του μήνα
              </button>
              {flash && <span className="animate-pulse text-sm font-black text-[#3fa36b]">{flash}</span>}
            </div>
          )}
          {!started && <p className="mt-2 text-xs opacity-80">Μοίρασε πρώτα τα χρήματα στα βάζα, και μετά πάτα για να δεις πώς γεμίζουν.</p>}
        </div>

        {/* The year so far */}
        {started && (
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="font-black">📒 Τι έγινε κάθε μήνα</p>
              {st.log.length === 0 ? (
                <p className="mt-2 text-sm opacity-80">Στο τέλος του πρώτου μήνα θα δεις τι κάνει κάθε βάζο.</p>
              ) : (
                <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-sm">
                  {[...st.log].reverse().map((e, i) => (
                    <li key={i}>
                      <b>{MONTH_NAMES[e.month - 1]} μήνας:</b> {e.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="font-black">{done ? "🏆 Ο χρόνος σου με τα 3 βάζα" : "📊 Μέχρι τώρα"}</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                <li>💝 Δώρισες συνολικά <b>{eur(st.totals.given)}</b>.</li>
                <li>🍦 Ξόδεψες σε μικρές επιθυμίες <b>{eur(st.totals.spent)}</b>.</li>
                <li>
                  🚀 Στο βάζο των επενδύσεων έχεις <b>{eur(st.jars.invest)}</b>, μαζί με <b>{eur(st.totals.bonus)}</b> δώρο από τους γονείς σου.
                </li>
              </ul>
              {done && (
                <p className="mt-3 rounded-xl bg-[#a8dcb9]/50 p-3 text-sm font-bold">
                  {st.big.trim()
                    ? `Με ${eur(st.jars.invest)} το μεγάλο σου σχέδιο, «${st.big.trim()}», γίνεται πραγματικότητα!`
                    : `Με ${eur(st.jars.invest)} μπορείς να κάνεις κάτι μεγάλο: ποιο θα είναι;`}{" "}
                  Και στην πορεία βοήθησες κάποιον με {eur(st.totals.given)}.
                </p>
              )}
              <button onClick={restart} className="no-print mt-3 inline-flex items-center gap-1 text-sm font-bold opacity-70 hover:opacity-100">
                <RotateCcw size={14} /> Ξεκίνα τον χρόνο από την αρχή
              </button>
            </div>
          </div>
        )}
        <p className="mt-6 text-right text-xs font-bold text-[#c4607e]">Kids in Business · kidsinbusiness.gr</p>
      </div>

      <div className="no-print mt-4 flex justify-center">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#c4788a] px-5 py-2.5 text-sm font-black text-[#a85a6e] hover:bg-[#fce8ee]"
        >
          <Printer size={16} /> Εκτύπωση σε χρώμα
        </button>
      </div>
      <div className="no-print">
        <SaveNote signedIn={signedIn} saved={saved} />
      </div>
    </div>
  );
}
