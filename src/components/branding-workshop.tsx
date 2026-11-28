import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ImagePlus, Printer, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChild } from "@/hooks/useJFB";
import { useLessonWork } from "@/hooks/useLessonWork";
import { SaveNote, shrinkImage } from "@/components/brainstorm-workshop";
import { StartupDrawing } from "@/components/startup-drawing";
import { saveStartupArt } from "@/lib/startups.functions";

// Lesson 9 (Marketing και branding) workshop, from the Kids in Business
// workbook: the branding board (8 pinned notes), a logo and an ad drawn on two
// drawing boards (the logo can go on the ad, and both on the child's
// startup), the advertising plan, and notes on other businesses' ads.
// Everything is kept in the account (jfb_lesson_work) and prints in colour.

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const img = (v: unknown) => (typeof v === "string" && v.startsWith("data:image/") ? v : null);

// ── Branding board ──────────────────────────────────────────────────────────

type Note = { text: string; image: string | null };
type BrandBoard = { notes: Note[] };
const NOTES = 8;
const TILT = [-4, 3, -2, 4, 2, -3, 3, -2];
const parseBoard = (raw: unknown): BrandBoard => {
  const d = (raw ?? {}) as Partial<BrandBoard>;
  return {
    notes: Array.from({ length: NOTES }, (_, i) => {
      const n = Array.isArray(d.notes) ? d.notes[i] : null;
      return { text: str(n?.text, 160), image: img(n?.image) };
    }),
  };
};
const EMPTY_BOARD: BrandBoard = parseBoard({});

function BrandingBoardPart() {
  const { data, setData, signedIn, saved } = useLessonWork<BrandBoard>("brandingboard", EMPTY_BOARD, parseBoard);
  const [err, setErr] = useState<string | null>(null);
  const setNote = (i: number, fn: (n: Note) => Note) => setData((d) => ({ notes: d.notes.map((n, k) => (k === i ? fn(n) : n)) }));

  async function addImage(i: number, file: File | undefined) {
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith("image/")) return setErr("Διάλεξε ένα αρχείο εικόνας.");
    try {
      const image = await shrinkImage(file);
      setNote(i, (n) => ({ ...n, image }));
    } catch {
      setErr("Δεν μπήκε η εικόνα. Δοκίμασε άλλη.");
    }
  }

  return (
    <div className="rounded-3xl bg-[#bfeaea] p-4 sm:p-6">
      <p className="text-center text-3xl font-black text-[#c4607e] sm:text-4xl">Δημιούργησε ένα Branding Board</p>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {data.notes.map((n, i) => (
          <div key={i} className="relative bg-white p-2 pt-5 shadow-md" style={{ transform: `rotate(${TILT[i]}deg)` }}>
            <span className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#5b5b5b] bg-[#e5e5e5] shadow" />
            {n.image ? (
              <div className="relative">
                <img src={n.image} alt={`Εικόνα ${i + 1} του branding board`} className="aspect-square w-full object-cover" />
                <button
                  onClick={() => setNote(i, (x) => ({ ...x, image: null }))}
                  aria-label="Βγάλε την εικόνα"
                  className="no-print absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="no-print flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-[#e2e2e2] text-xs text-muted-foreground hover:bg-[#f6fbfb]">
                <ImagePlus size={22} />
                Εικόνα
                <input type="file" accept="image/*" className="hidden" onChange={(e) => addImage(i, e.target.files?.[0])} />
              </label>
            )}
            <input
              value={n.text}
              onChange={(e) => setNote(i, (x) => ({ ...x, text: e.target.value.slice(0, 160) }))}
              placeholder="Χρώματα, θέμα, συσκευασία…"
              className="mt-2 w-full border-b border-[#e2e2e2] bg-transparent pb-0.5 text-xs text-[#1f3b6e] outline-none placeholder:opacity-50"
            />
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-[#1f3b6e]">
        Ένα άλλο κλειδί για την πώληση ενός προϊόντος είναι ένα ωραίο λογότυπο. Ένα ισχυρό εμπορικό σήμα κάνει το προϊόν σου εύκολα αναγνωρίσιμο και
        βοηθά να χτίσεις εμπιστοσύνη με τους πελάτες. Κοίταξε παρόμοια προϊόντα στην αγορά και σημείωσε την επωνυμία (branding) και τη συσκευασία τους.
        Γέμισε τον πίνακα με φωτογραφίες αυτών των προϊόντων, μαζί με θέματα και χρώματα που σου αρέσουν, και εμπνεύσου από αυτόν για το δικό σου
        branding και τα δικά σου σχέδια συσκευασίας. Για παράδειγμα, θα μπορούσες να σχεδιάσεις ένα αυτοκόλλητο για ένα κουτί cupcake ή μια ετικέτα
        για ένα χάρτινο χωνάκι για καραμέλες.
      </p>
      {err && <p className="mt-2 text-sm font-bold text-red-600">{err}</p>}
      <p className="no-print mt-2 text-xs text-[#1f3b6e]/80">Μην ανεβάζεις φωτογραφίες με πρόσωπα. Οι εικόνες μένουν στον λογαριασμό σου.</p>
      <div className="no-print">
        <SaveNote signedIn={signedIn} saved={saved} />
      </div>
    </div>
  );
}

// ── Logo and ad: two drawing boards ─────────────────────────────────────────

type Pic = { png: string | null };
const parsePic = (raw: unknown): Pic => ({ png: img((raw as Pic | null)?.png) });
const EMPTY_PIC: Pic = { png: null };
// One row in the account holds up to about 900 kB.
const TOO_BIG = "Η ζωγραφιά είναι πολύ μεγάλη για να αποθηκευτεί. Δοκίμασε με λιγότερο γέμισμα.";

type MyStartup = { id: string; name: string; emoji: string; logo_url: string | null; ad_url: string | null };

function LogoAdPart() {
  const logo = useLessonWork<Pic>("logo", EMPTY_PIC, parsePic);
  const ad = useLessonWork<Pic>("ad", EMPTY_PIC, parsePic);
  const { child } = useChild();
  const [startups, setStartups] = useState<MyStartup[]>([]);
  const [target, setTarget] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!child) return;
    supabase
      .from("startups")
      .select("id, name, emoji, logo_url, ad_url")
      .eq("child_id" as never, child.id as never)
      .order("created_at")
      .then(({ data }) => {
        const list = (data ?? []) as unknown as MyStartup[];
        setStartups(list);
        setTarget((t) => t || list[0]?.id || "");
      });
  }, [child]);

  const save = (which: typeof logo) => async (png: string) => {
    if (png.length > 880000) return TOO_BIG;
    which.setData({ png });
    return null;
  };

  async function putOnStartup() {
    if (!target) return;
    setBusy(true);
    setMsg(null);
    try {
      const parts: ("logo" | "ad")[] = [];
      if (logo.data.png) parts.push("logo");
      if (ad.data.png) parts.push("ad");
      for (const kind of parts) {
        const png = (kind === "logo" ? logo : ad).data.png!;
        const res = await saveStartupArt({ data: { startupId: target, kind, png } });
        if (!res.ok) throw new Error(res.reason === "bad_file" ? TOO_BIG : "Δεν μπήκαν στη startup. Δοκίμασε ξανά.");
      }
      const name = startups.find((s) => s.id === target)?.name ?? "";
      const what = parts.length === 2 ? "Το λογότυπο και η διαφήμιση μπήκαν" : parts[0] === "logo" ? "Το λογότυπο μπήκε" : "Η διαφήμιση μπήκε";
      setMsg({ ok: true, text: `Έτοιμο! ${what} στη startup «${name}».` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Δεν μπήκαν στη startup. Δοκίμασε ξανά." });
    } finally {
      setBusy(false);
    }
  }

  const hasArt = Boolean(logo.data.png || ad.data.png);
  // Each board starts from the saved drawing once, and is not redrawn after
  // each save (its texts are still movable on top).
  const [start, setStart] = useState<{ logo: string | null; ad: string | null } | null>(null);
  useEffect(() => {
    if (!start && logo.ready && ad.ready) setStart({ logo: logo.data.png, ad: ad.data.png });
  }, [start, logo.ready, ad.ready, logo.data.png, ad.data.png]);

  return (
    <div>
      {!start ? (
        <p className="py-10 text-center text-muted-foreground">Φορτώνει…</p>
      ) : (
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <StartupDrawing
          imageUrl={start.logo}
          width={600}
          height={600}
          title="🎨 Το λογότυπό μου"
          intro="Σχεδίασε το σήμα της επιχείρησής σου: λίγα χρώματα, ένα σχήμα ή ένα γράμμα, και το όνομα αν χωράει. Ένα καλό λογότυπο το θυμάσαι με μια ματιά."
          onSavePng={save(logo)}
          onSaved={() => undefined}
          onClose={() => undefined}
          showClose={false}
        />
        <StartupDrawing
          imageUrl={start.ad}
          width={600}
          height={800}
          title="📣 Η διαφήμισή μου"
          intro="Φτιάξε μια αφίσα για το προϊόν σου: τι είναι, γιατί να το πάρει κάποιος, πόσο κοστίζει και πού θα το βρει. Χωρίς τηλέφωνα και διευθύνσεις."
          onSavePng={save(ad)}
          onSaved={() => undefined}
          onClose={() => undefined}
          showClose={false}
          stamp={logo.data.png ? { src: logo.data.png, label: "Βάλε το λογότυπό μου στη διαφήμιση" } : null}
        />
      </div>
      )}
      <SaveNote signedIn={logo.signedIn} saved={logo.saved === "saving" || ad.saved === "saving" ? "saving" : logo.saved === "error" || ad.saved === "error" ? "error" : "saved"} />
      <p className="mt-1 text-center text-xs text-muted-foreground">Πάτα «💾 Αποθήκευση» κάτω από κάθε πίνακα για να κρατήσεις τη ζωγραφιά σου.</p>

      <div className="no-print mt-5 rounded-2xl bg-[oklch(0.96_0.03_173)] p-4">
        <p className="font-black">🚀 Βάλ' τα στη startup σου</p>
        {!child ? (
          <p className="mt-1 text-sm text-muted-foreground">Το λογότυπο και η διαφήμιση μπαίνουν σε startup από τον λογαριασμό του παιδιού.</p>
        ) : startups.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Δεν έχεις ακόμα startup. Τα σχέδιά σου μένουν εδώ.{" "}
            <Link to="/build" className="font-bold underline">
              Φτιάξε τη startup σου
            </Link>{" "}
            και μετά θα τα βάλεις με ένα κουμπί.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Το λογότυπο θα φαίνεται στη θέση του emoji της startup σου, και η διαφήμιση στη σελίδα της, για όλους.
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
                onClick={putOnStartup}
                disabled={busy || !hasArt || !target}
                className="rounded-full bg-[oklch(0.55_0.17_173)] px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"
              >
                {busy ? "…" : startups.length === 1 ? `Βάλ' τα στη «${startups[0].name}»` : "Βάλ' τα στη startup"}
              </button>
              {target && (
                <Link to="/startups/$id" params={{ id: target }} className="text-sm font-bold underline">
                  Δες τη startup →
                </Link>
              )}
            </div>
            {!hasArt && <p className="mt-2 text-xs text-muted-foreground">Πρώτα σχεδίασε και αποθήκευσε το λογότυπο ή τη διαφήμιση.</p>}
            {msg && <p className={`mt-2 text-sm font-bold ${msg.ok ? "text-[oklch(0.45_0.14_160)]" : "text-red-600"}`}>{msg.text}</p>}
          </>
        )}
      </div>
    </div>
  );
}

// ── Advertising plan ────────────────────────────────────────────────────────

type AdPlan = { where: string[]; message: string; buy: string[]; ideas: string };
const WHERE = ["Instagram ή TikTok", "Αφίσα στο σχολείο", "Φυλλάδια", "Από στόμα σε στόμα", "Πάγκος σε bazaar", "Φίλοι και οικογένεια", "Ιστοσελίδα"];
const BUY = ["Από κοντά, στο χέρι", "Με παραγγελία από το κινητό", "Σε πάγκο ή εκδήλωση", "Online"];
const pick = (v: unknown, from: string[]) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && from.includes(x)) : []);
const parseAdPlan = (raw: unknown): AdPlan => {
  const d = (raw ?? {}) as Partial<AdPlan>;
  return { where: pick(d.where, WHERE), message: str(d.message, 200), buy: pick(d.buy, BUY), ideas: str(d.ideas, 1500) };
};
const EMPTY_ADPLAN = parseAdPlan({});

function Chips({ all, chosen, onToggle }: { all: string[]; chosen: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {all.map((v) => (
        <button
          key={v}
          onClick={() => onToggle(v)}
          className={`rounded-full border-2 px-3 py-1.5 text-sm ${chosen.includes(v) ? "border-[#c4607e] bg-[#c4607e] font-bold text-white" : "border-[#c4607e]/40 bg-white text-[#1f3b6e]"}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function AdPlanPart() {
  const { data, setData, signedIn, saved } = useLessonWork<AdPlan>("adplan", EMPTY_ADPLAN, parseAdPlan);
  const toggle = (k: "where" | "buy") => (v: string) =>
    setData((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));
  return (
    <div className="rounded-3xl bg-[#bfeaea] p-4 sm:p-6">
      <p className="text-center text-3xl font-black text-[#c4607e] sm:text-4xl">Διαφήμιση</p>
      <p className="mt-3 text-sm leading-relaxed text-[#1f3b6e]">
        Δεν έχει νόημα να προσφέρεις ένα καταπληκτικό προϊόν ή μια υπηρεσία, αν οι άνθρωποι δεν το γνωρίζουν! Πώς μπορείς να ενημερώσεις το κοινό σου
        για την επιχείρησή σου, και πώς μπορούν να αγοράσουν από εσένα; Κατέγραψε τις ιδέες σου εδώ:
      </p>
      <div className="mt-4 space-y-4 rounded-2xl bg-[#f0fafa] p-4">
        <div>
          <p className="font-black text-[#1f3b6e]">📍 Πού θα σε δουν οι πελάτες σου;</p>
          <Chips all={WHERE} chosen={data.where} onToggle={toggle("where")} />
        </div>
        <label className="block">
          <span className="font-black text-[#1f3b6e]">💬 Τι θα τους πεις; Το μήνυμά σου σε μία πρόταση</span>
          <input
            value={data.message}
            onChange={(e) => setData((d) => ({ ...d, message: e.target.value.slice(0, 200) }))}
            placeholder="π.χ. Σπιτικά cupcakes με αληθινό βούτυρο, φρέσκα κάθε Παρασκευή!"
            className="mt-2 w-full rounded-xl border bg-white p-3 outline-none placeholder:opacity-50"
          />
        </label>
        <div>
          <p className="font-black text-[#1f3b6e]">🛍️ Πώς θα αγοράσουν από εσένα;</p>
          <Chips all={BUY} chosen={data.buy} onToggle={toggle("buy")} />
        </div>
        <label className="block">
          <span className="font-black text-[#1f3b6e]">📝 Οι ιδέες μου</span>
          <textarea
            value={data.ideas}
            onChange={(e) => setData((d) => ({ ...d, ideas: e.target.value.slice(0, 1500) }))}
            rows={8}
            placeholder="Γράψε ό,τι σκέφτεσαι: ένα σλόγκαν, μια προσφορά για τους πρώτους πελάτες, ένα βίντεο που θα έκανες…"
            className="mt-2 w-full resize-y rounded-xl border bg-white p-3 outline-none placeholder:opacity-50"
          />
        </label>
      </div>
      <div className="no-print">
        <SaveNote signedIn={signedIn} saved={saved} />
      </div>
    </div>
  );
}

// ── Advertising examples ────────────────────────────────────────────────────

type Example = { business: string; where: string; liked: string; idea: string };
type Examples = { items: Example[]; notes: string };
const EX = 4;
const parseExamples = (raw: unknown): Examples => {
  const d = (raw ?? {}) as Partial<Examples>;
  return {
    items: Array.from({ length: EX }, (_, i) => {
      const e = Array.isArray(d.items) ? d.items[i] : null;
      return { business: str(e?.business, 60), where: str(e?.where, 60), liked: str(e?.liked, 160), idea: str(e?.idea, 160) };
    }),
    notes: str(d.notes, 1500),
  };
};
const EMPTY_EXAMPLES = parseExamples({});

function ExamplesPart() {
  const { data, setData, signedIn, saved } = useLessonWork<Examples>("adexamples", EMPTY_EXAMPLES, parseExamples);
  const setItem = (i: number, k: keyof Example, v: string) =>
    setData((d) => ({ ...d, items: d.items.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }));
  const field = "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none placeholder:opacity-50";
  return (
    <div className="rounded-3xl bg-[#dcd6fb] p-4 sm:p-6">
      <p className="text-center text-3xl font-black text-[#c4607e] sm:text-4xl">Παραδείγματα διαφήμισης</p>
      <p className="mt-3 text-sm leading-relaxed text-[#1f3b6e]">
        Ερεύνησε πώς άλλες επιχειρήσεις διαφημίζουν παρόμοια προϊόντα ή υπηρεσίες. Κράτησε σημειώσεις και ανάπτυξε κάποιες ιδέες εδώ.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.items.map((e, i) => (
          <div key={i} className="space-y-2 rounded-2xl bg-[#f7f5ff] p-4">
            <p className="text-sm font-black text-[#6b5bb8]">Παράδειγμα {i + 1}</p>
            <input value={e.business} onChange={(v) => setItem(i, "business", v.target.value.slice(0, 60))} placeholder="Ποια επιχείρηση;" className={field} />
            <input value={e.where} onChange={(v) => setItem(i, "where", v.target.value.slice(0, 60))} placeholder="Πού διαφημίζεται; (π.χ. Instagram, αφίσα)" className={field} />
            <input value={e.liked} onChange={(v) => setItem(i, "liked", v.target.value.slice(0, 160))} placeholder="Τι μου άρεσε;" className={field} />
            <input value={e.idea} onChange={(v) => setItem(i, "idea", v.target.value.slice(0, 160))} placeholder="Τι ιδέα παίρνω για τη δική μου διαφήμιση;" className={field} />
          </div>
        ))}
      </div>
      <label className="mt-3 block rounded-2xl bg-[#f7f5ff] p-4">
        <span className="text-sm font-black text-[#6b5bb8]">Σημειώσεις</span>
        <textarea
          value={data.notes}
          onChange={(v) => setData((d) => ({ ...d, notes: v.target.value.slice(0, 1500) }))}
          rows={5}
          className="mt-2 w-full resize-y rounded-lg border bg-white p-3 text-sm outline-none"
        />
      </label>
      <div className="no-print">
        <SaveNote signedIn={signedIn} saved={saved} />
      </div>
    </div>
  );
}

// ── The workshop ────────────────────────────────────────────────────────────

const TABS = [
  ["board", "📌 Branding Board"],
  ["draw", "✏️ Λογότυπο και διαφήμιση"],
  ["plan", "📣 Διαφήμιση"],
  ["examples", "🔍 Παραδείγματα"],
] as const;
type Tab = (typeof TABS)[number][0];

export function BrandingWorkshop() {
  const [tab, setTab] = useState<Tab>("board");
  return (
    <div id="branding-print" className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-6">
      <style>{`@media print {
  @page { size: A4; margin: 10mm; }
  body * { visibility: hidden !important; }
  #branding-print, #branding-print * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #branding-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
  #branding-print .no-print { display: none !important; }
}`}</style>
      <p className="text-center text-sm font-black uppercase tracking-widest text-[#c4607e]">Εργαστήριο · Marketing και branding</p>
      <div className="no-print mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-1 rounded-2xl bg-muted p-1 sm:grid-cols-4">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl px-2 py-2.5 text-sm font-black ${tab === id ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === "board" && <BrandingBoardPart />}
        {tab === "draw" && <LogoAdPart />}
        {tab === "plan" && <AdPlanPart />}
        {tab === "examples" && <ExamplesPart />}
      </div>
      <div className="no-print mt-5 flex justify-center">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#c4788a] px-5 py-2.5 text-sm font-black text-[#a85a6e] hover:bg-[#fce8ee]"
        >
          <Printer size={16} /> Εκτύπωση σε χρώμα
        </button>
      </div>
      <p className="mt-4 text-right text-xs font-bold text-[#c4788a]">Kids in Business · kidsinbusiness.gr</p>
    </div>
  );
}
