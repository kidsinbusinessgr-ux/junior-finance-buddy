import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChild } from "@/hooks/useJFB";
import { useLessonWork } from "@/hooks/useLessonWork";
import { SaveNote } from "@/components/brainstorm-workshop";
import { saveStartupPlan } from "@/lib/startups.functions";
import { DAYS, readPlan } from "@/lib/startup-plan";

// Lesson 11 (Pitch) workshop, in the look of the Kids in Business slide "Τα
// βασικά στοιχεία ενός επιτυχημένου pitch": the five parts one under the
// other, the pitch put together, a 30-second practice, and the pitch saved on
// the child's startup (plan.action.pitch). Kept in the account.

type Pitch = { problem: string; solution: string; advantage: string; market: string; cta: string };
type Key = keyof Pitch;

const STEPS: { key: Key; title: string; ask: string; start: string; example: string }[] = [
  {
    key: "problem",
    title: "Πρόβλημα",
    ask: "Ποιο πρόβλημα έχουν οι πελάτες σου; Ξεκίνα με κάτι που τραβάει την προσοχή.",
    start: "Ξέρεις ότι ",
    example: "Ξέρεις ότι τα παιδιά πεινάνε στο διάλειμμα, αλλά η ουρά στο κυλικείο δεν τελειώνει ποτέ;",
  },
  {
    key: "solution",
    title: "Λύση",
    ask: "Τι φτιάχνεις και πώς λύνει το πρόβλημα;",
    start: "Γι' αυτό φτιάξαμε ",
    example: "Γι' αυτό φτιάξαμε τα Cupcake Club: σπιτικά cupcakes που τα παραγγέλνεις από πριν και τα παίρνεις χωρίς ουρά.",
  },
  {
    key: "advantage",
    title: "Ανταγωνιστικό πλεονέκτημα",
    ask: "Τι σε κάνει να ξεχωρίζεις από τους άλλους;",
    start: "Αυτό που μας κάνει να ξεχωρίζουμε είναι ",
    example: "Αυτό που μας κάνει να ξεχωρίζουμε είναι ότι τα φτιάχνουμε κάθε πρωί, με αληθινό βούτυρο και νέο θέμα κάθε εβδομάδα.",
  },
  {
    key: "market",
    title: "Αγορά-στόχος",
    ask: "Σε ποιους απευθύνεσαι; Πόσοι είναι;",
    start: "Απευθυνόμαστε σε ",
    example: "Απευθυνόμαστε στους 300 μαθητές του σχολείου μας και στους γονείς τους.",
  },
  {
    key: "cta",
    title: "Κλήση σε δράση (CTA)",
    ask: "Τι θέλεις να κάνει τώρα αυτός που σε ακούει: να αγοράσει, να επενδύσει, να σε ακολουθήσει;",
    start: "Έλα ",
    example: "Δοκίμασε το πρώτο σου cupcake την Παρασκευή, ή επένδυσε στη startup μας και μεγάλωσε μαζί μας!",
  },
];

const MAX_PART = 120;
const MAX_PITCH = 400; // what the startup page keeps
const SECONDS = 30;

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_PART) : "");
const parsePitch = (raw: unknown): Pitch => {
  const d = (raw ?? {}) as Partial<Pitch>;
  return { problem: str(d.problem), solution: str(d.solution), advantage: str(d.advantage), market: str(d.market), cta: str(d.cta) };
};
const EMPTY: Pitch = parsePitch({});

// Each part is a sentence: a full stop is added where it has none.
const join = (p: Pitch) =>
  STEPS.map((s) => p[s.key].trim())
    .filter(Boolean)
    .map((t) => (/[.!;…»]$/.test(t) ? t : `${t}.`))
    .join(" ");
const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;
// About two and a half words a second, when you speak calmly.
const secondsFor = (t: string) => Math.round(wordCount(t) / 2.5);

// The slide's look: blush page, grey, pink and cream shapes.
const C = { page: "#f4eeee", grey: "#939393", pink: "#ecc4c7", cream: "#e6e2cc", ink: "#6f6f6f" };

function Blobs() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-40 w-48 rounded-[55%_45%_60%_40%/50%_60%_40%_50%]" style={{ background: C.grey }} />
      <span aria-hidden className="pointer-events-none absolute -right-12 -top-6 h-48 w-40 rounded-[40%_60%_45%_55%/55%_45%_55%_45%]" style={{ background: C.pink }} />
      <span aria-hidden className="pointer-events-none absolute right-6 top-40 h-12 w-12 rounded-full" style={{ background: C.cream }} />
      <span aria-hidden className="pointer-events-none absolute right-3 top-56 h-10 w-10 rounded-full" style={{ background: C.grey }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-36 rounded-[60%_40%_55%_45%/45%_55%_45%_55%]" style={{ background: C.pink }} />
      <span aria-hidden className="pointer-events-none absolute bottom-8 left-20 h-12 w-12 rounded-full" style={{ background: C.grey }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-8 -right-6 h-24 w-56 rounded-[50%_50%_0_0/100%_100%_0_0]" style={{ background: C.grey }} />
      <span aria-hidden className="pointer-events-none absolute bottom-20 left-6 h-10 w-10 rounded-full border-2" style={{ borderColor: C.pink }} />
      <span aria-hidden className="pointer-events-none absolute right-16 top-16 h-14 w-14 rounded-full border-2" style={{ borderColor: C.cream }} />
    </>
  );
}

type MyStartup = { id: string; name: string; emoji: string; problem: string | null; solution: string | null; customer: string | null; plan: unknown };

export function PitchWorkshop() {
  const { data, setData, signedIn, saved } = useLessonWork<Pitch>("pitch", EMPTY, parsePitch);
  const { child } = useChild();
  const [startups, setStartups] = useState<MyStartup[]>([]);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!child) return;
    supabase
      .from("startups")
      .select("id, name, emoji, problem, solution, customer, plan")
      .eq("child_id" as never, child.id as never)
      .order("created_at")
      .then(({ data: rows }) => {
        const list = (rows ?? []) as unknown as MyStartup[];
        setStartups(list);
        setTarget((t) => t || list[0]?.id || "");
      });
  }, [child]);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const pitch = join(data);
  const secs = secondsFor(pitch);
  const setPart = (k: Key, v: string) => {
    setData((d) => ({ ...d, [k]: v.slice(0, MAX_PART) }));
    setMsg(null);
  };

  const practice = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
      setLeft(null);
      return;
    }
    setLeft(SECONDS);
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s === null || s <= 1) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // Fills the empty parts from what the startup already says.
  const fromStartup = () => {
    const s = startups.find((x) => x.id === target);
    if (!s) return;
    const plan = readPlan(s.plan);
    setData((d) => ({
      problem: d.problem || (s.problem ?? "").slice(0, MAX_PART),
      solution: d.solution || (s.solution ?? "").slice(0, MAX_PART),
      advantage: d.advantage || (plan.usp ?? "").slice(0, MAX_PART),
      market: d.market || (s.customer ?? "").slice(0, MAX_PART),
      cta: d.cta,
    }));
  };

  async function toStartup() {
    const s = startups.find((x) => x.id === target);
    if (!s || !pitch) return;
    if (pitch.length > MAX_PITCH) {
      setMsg({ ok: false, text: `Το pitch είναι ${pitch.length} χαρακτήρες. Μίκρυνέ το μέχρι ${MAX_PITCH} για να χωρέσει στη startup.` });
      return;
    }
    setBusy(true);
    setMsg(null);
    const current = readPlan(s.plan).action;
    const days = current?.days ?? DAYS.map(() => ({ text: "", done: false }));
    try {
      const res = await saveStartupPlan({ data: { startupId: s.id, part: "action", value: { days, pitch } } });
      setMsg(
        res.ok
          ? { ok: true, text: `Έτοιμο! Το pitch μπήκε στη σελίδα της «${s.name}», ως «🎤 Το pitch μας».` }
          : { ok: false, text: res.reason === "bad_words" ? "Κάποια λέξη δεν επιτρέπεται. Άλλαξέ την και δοκίμασε ξανά." : "Δεν μπήκε στη startup. Δοκίμασε ξανά." },
      );
    } catch {
      setMsg({ ok: false, text: "Δεν μπήκε στη startup. Δοκίμασε ξανά." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="pitch-print" className="mx-auto max-w-3xl">
      <style>{`@media print {
  @page { size: A4; margin: 10mm; }
  body * { visibility: hidden !important; }
  #pitch-print, #pitch-print * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #pitch-print { position: absolute; left: 0; top: 0; width: 100%; }
  #pitch-print .no-print { display: none !important; }
}`}</style>

      <div className="relative overflow-hidden rounded-3xl px-5 py-10 sm:px-12" style={{ background: C.page, color: C.ink }}>
        <Blobs />
        <div className="relative">
          <p className="text-center text-3xl font-black uppercase leading-tight sm:text-4xl" style={{ textShadow: `2px 2px 0 ${C.cream}` }}>
            Τα βασικα στοιχεια ενος επιτυχημενου pitch
          </p>
          <p className="mt-4 text-center sm:text-lg">Τα βασικά στοιχεία ενός επιτυχημένου pitch περιλαμβάνουν:</p>

          <ol className="mt-6 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.key} className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-lg font-black">
                  {i + 1}. {s.title}
                </p>
                <p className="mt-0.5 text-sm">{s.ask}</p>
                <textarea
                  value={data[s.key]}
                  onChange={(e) => setPart(s.key, e.target.value)}
                  onFocus={() => {
                    if (!data[s.key]) setPart(s.key, s.start);
                  }}
                  rows={2}
                  placeholder={s.example}
                  className="mt-2 w-full resize-none rounded-xl border-2 bg-white p-3 text-[15px] text-[#4a4a4a] outline-none placeholder:text-[#b5b5b5]"
                  style={{ borderColor: C.pink }}
                />
                <p className="no-print text-right text-[11px] opacity-70">
                  {data[s.key].length}/{MAX_PART}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {startups.length > 0 && (
        <div className="no-print mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Έχεις ήδη γράψει πρόβλημα, λύση και πελάτες στη startup σου;</span>
          <button onClick={fromStartup} className="rounded-full border-2 px-3 py-1.5 font-bold hover:bg-muted" style={{ borderColor: C.pink }}>
            Πάρ' τα από τη startup μου
          </button>
        </div>
      )}

      {/* The pitch, put together */}
      <div className="mt-5 rounded-3xl border-2 bg-card p-5" style={{ borderColor: C.pink }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-lg font-black">🎤 Το pitch μου</p>
          {pitch && (
            <p className={`text-sm font-bold ${secs > SECONDS ? "text-red-600" : "text-[#1d7a4f]"}`}>
              περίπου {secs}″ {secs > SECONDS ? "· πολύ μεγάλο, κόψε λίγο" : "· ✓ χωράει σε 30″"}
            </p>
          )}
        </div>
        {pitch ? (
          <p className={`mt-3 leading-relaxed ${left !== null ? "text-2xl font-bold" : "text-lg"}`}>{pitch}</p>
        ) : (
          <p className="mt-3 text-muted-foreground">Γράψε τα 5 στοιχεία, και εδώ θα δεις όλο το pitch σου μαζί.</p>
        )}
        {pitch && (
          <div className="no-print mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={practice}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black text-white"
              style={{ background: C.grey }}
            >
              {left !== null && left > 0 ? <Pause size={16} /> : <Play size={16} />}
              {left !== null && left > 0 ? "Σταμάτα" : "Εξάσκηση 30″"}
            </button>
            {left !== null && (
              <span className={`text-3xl font-black tabular-nums ${left === 0 ? "text-red-600" : ""}`}>{left === 0 ? "Τέλος χρόνου!" : `${left}″`}</span>
            )}
            {left === null && <span className="text-sm text-muted-foreground">Πες το δυνατά, σαν να είσαι μπροστά σε επενδυτές. Χωράει στα 30 δευτερόλεπτα;</span>}
          </div>
        )}
      </div>

      {/* To the startup */}
      <div className="no-print mt-4 rounded-2xl bg-[oklch(0.96_0.03_173)] p-4">
        <p className="font-black">🚀 Βάλ' το στη startup σου</p>
        {!child ? (
          <p className="mt-1 text-sm text-muted-foreground">Το pitch μπαίνει σε startup από τον λογαριασμό του παιδιού.</p>
        ) : startups.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Δεν έχεις ακόμα startup. Το pitch σου μένει εδώ.{" "}
            <Link to="/build" className="font-bold underline">
              Φτιάξε τη startup σου
            </Link>{" "}
            και μετά θα το βάλεις με ένα κουμπί.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">Θα φαίνεται στη σελίδα της startup σου, για όσους σκέφτονται να επενδύσουν.</p>
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
                disabled={busy || !target || !pitch}
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
            {msg && <p className={`mt-2 text-sm font-bold ${msg.ok ? "text-[oklch(0.45_0.14_160)]" : "text-red-600"}`}>{msg.text}</p>}
          </>
        )}
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
