import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ImagePlus, Plus, Printer, Star, Trash2, X } from "lucide-react";
import { useLessonWork } from "@/hooks/useLessonWork";

// Lesson 7 (Brainstorming) workshop: a mind map (a problem in the middle,
// solutions around it, details on each) and the "Idea board" of the Kids in
// Business workbook (six notes: three to write on, three for pictures).
// Both are kept in the account (jfb_lesson_work) and print in colour.

// ── Mind map ────────────────────────────────────────────────────────────────

type Branch = { id: string; text: string; subs: string[] };
type MindMap = { center: string; branches: Branch[]; best: string | null };

const MAX_BRANCHES = 8;
const MAX_SUBS = 3;
const COLORS = ["#e76f8a", "#4a9aa8", "#d4a843", "#7c5cd6", "#3fa36b", "#f08a4b", "#5b8def", "#c065b8"];

const EMPTY_MAP: MindMap = { center: "", branches: [], best: null };

const EXAMPLE_MAP: MindMap = {
  center: "Τα παιδιά πεινάνε στο διάλειμμα, αλλά η ουρά στο κυλικείο είναι τεράστια",
  branches: [
    { id: "e1", text: "Προπαραγγελία από το κινητό", subs: ["Πληρώνεις από πριν", "Παραλαβή χωρίς ουρά"] },
    { id: "e2", text: "Σπιτικά cupcakes", subs: ["Πουλάω στο διάλειμμα", "Νέο θέμα κάθε εβδομάδα"] },
    { id: "e3", text: "Κουτί με snacks για την τάξη", subs: ["Ένας υπεύθυνος", "Μηνιαία συνδρομή"] },
    { id: "e4", text: "Φρούτα σε κουπάκια", subs: ["Υγιεινό", "Συνεργασία με τον μανάβη"] },
    { id: "e5", text: "Δεύτερο ταμείο", subs: ["Το ζητάμε από το σχολείο"] },
  ],
  best: "e2",
};

const newId = () => Math.random().toString(36).slice(2, 9);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

function parseMap(raw: unknown): MindMap {
  const d = (raw ?? {}) as Partial<MindMap>;
  const branches = Array.isArray(d.branches)
    ? d.branches.slice(0, MAX_BRANCHES).map((b) => ({
        id: str(b?.id, 12) || newId(),
        text: str(b?.text, 40),
        subs: Array.isArray(b?.subs) ? b.subs.slice(0, MAX_SUBS).map((s) => str(s, 30)) : [],
      }))
    : [];
  const best = typeof d.best === "string" && branches.some((b) => b.id === d.best) ? d.best : null;
  return { center: str(d.center, 90), branches, best };
}

// Positions in % of the map: branches on an ellipse, details further out.
function layout(map: MindMap) {
  const n = Math.max(map.branches.length, 1);
  const clamp = (v: number) => Math.min(92, Math.max(8, v));
  return map.branches.map((b, i) => {
    const a = (-90 + (i * 360) / n) * (Math.PI / 180);
    const x = 50 + Math.cos(a) * 27;
    const y = 50 + Math.sin(a) * 30;
    // Details go further out along the branch, spread sideways.
    const subs = b.subs.map((_, j) => {
      const k = j - (b.subs.length - 1) / 2;
      return {
        x: clamp(x + Math.cos(a) * 15 - Math.sin(a) * k * 19),
        y: clamp(y + Math.sin(a) * 15 + Math.cos(a) * k * 11),
      };
    });
    return { x, y, subs, color: COLORS[i % COLORS.length] };
  });
}

// On a phone the map keeps a readable size and scrolls sideways.
function MapView({ map, selected, onSelect }: { map: MindMap; selected?: string | null; onSelect?: (id: string) => void }) {
  const pos = useMemo(() => layout(map), [map]);
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
    <div className="relative mx-auto aspect-[16/11] w-full min-w-[620px] max-w-3xl rounded-3xl bg-[#fffaf2]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {map.branches.map((b, i) => (
          <g key={b.id}>
            <line x1="50" y1="50" x2={pos[i].x} y2={pos[i].y} stroke={pos[i].color} strokeWidth="0.8" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
            {pos[i].subs.map((s, j) => (
              <line key={j} x1={pos[i].x} y1={pos[i].y} x2={s.x} y2={s.y} stroke={pos[i].color} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1.5 }} />
            ))}
          </g>
        ))}
      </svg>

      <div
        className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-4 border-[#4a3530] bg-white p-2 text-center text-[11px] font-black leading-tight text-[#4a3530] shadow-md sm:p-3 sm:text-sm"
      >
        {map.center || <span className="font-normal opacity-50">Το πρόβλημα στη μέση</span>}
      </div>

      {map.branches.map((b, i) => (
        <div key={b.id}>
          <button
            type="button"
            onClick={() => onSelect?.(b.id)}
            className={`absolute w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-xl px-1.5 py-1 text-center text-[10px] font-black leading-tight text-white shadow sm:px-2 sm:py-1.5 sm:text-xs ${selected === b.id ? "ring-4 ring-black/20" : ""}`}
            style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%`, background: pos[i].color }}
          >
            {map.best === b.id && <span className="mr-0.5">⭐</span>}
            {b.text || "…"}
          </button>
          {b.subs.map((s, j) => (
            <span
              key={j}
              className="absolute max-w-[17%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 bg-white px-1 py-0.5 text-center text-[9px] leading-tight text-[#4a3530] sm:px-1.5 sm:text-[11px]"
              style={{ left: `${pos[i].subs[j].x}%`, top: `${pos[i].subs[j].y}%`, borderColor: pos[i].color }}
            >
              {s || "…"}
            </span>
          ))}
        </div>
      ))}
    </div>
    </div>
  );
}

function MindMapPart() {
  const { data: map, setData: setMap, signedIn, saved } = useLessonWork<MindMap>("mindmap", EMPTY_MAP, parseMap);
  const [view, setView] = useState<"mine" | "example">("mine");
  const [selected, setSelected] = useState<string | null>(null);

  const update = (fn: (m: MindMap) => MindMap) => setMap((m) => fn(m));
  const setBranch = (id: string, fn: (b: Branch) => Branch) =>
    update((m) => ({ ...m, branches: m.branches.map((b) => (b.id === id ? fn(b) : b)) }));
  const addBranch = () => {
    const id = newId();
    update((m) => (m.branches.length >= MAX_BRANCHES ? m : { ...m, branches: [...m.branches, { id, text: "", subs: [] }] }));
    setSelected(id);
  };
  const removeBranch = (id: string) =>
    update((m) => ({ ...m, branches: m.branches.filter((b) => b.id !== id), best: m.best === id ? null : m.best }));

  const best = map.branches.find((b) => b.id === map.best);
  const shown = view === "example" ? EXAMPLE_MAP : map;

  return (
    <div>
      <ol className="grid gap-2 text-sm text-[#4a3530] sm:grid-cols-4">
        {[
          ["1", "Γράψε στη μέση ένα πρόβλημα που βλέπεις γύρω σου."],
          ["2", "Γύρω του, όσες λύσεις σκεφτείς. Καμία δεν είναι λάθος."],
          ["3", "Σε κάθε λύση, 1 έως 3 λεπτομέρειες: πώς, για ποιον, με τι."],
          ["4", "Βάλε ⭐ στην καλύτερη: έχουν άνθρωποι το πρόβλημα, θα πλήρωναν, μπορείς να τη φτιάξεις;"],
        ].map(([n, t]) => (
          <li key={n} className="flex gap-2 rounded-2xl bg-[#fff3e0] p-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f08a4b] text-xs font-black text-white">{n}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>

      <div className="no-print mt-4 flex justify-center gap-1 rounded-full bg-muted p-1 sm:mx-auto sm:w-fit">
        {(
          [
            ["mine", "Το δικό μου"],
            ["example", "Παράδειγμα"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 rounded-full px-5 py-1.5 text-sm font-black sm:flex-none ${view === id ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <MapView map={shown} selected={view === "mine" ? selected : null} onSelect={view === "mine" ? setSelected : undefined} />
      </div>

      {view === "example" ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Στη μέση ένα πρόβλημα, γύρω του πέντε λύσεις, και σε κάθε λύση λίγες λεπτομέρειες. Η ⭐ μπήκε στα cupcakes: πολλοί έχουν το πρόβλημα, θα
          πλήρωναν 2 €, και τα φτιάχνεις στην κουζίνα σου.
        </p>
      ) : (
        <div className="no-print mt-5 space-y-3">
          <label className="block rounded-2xl border-2 border-[#4a3530] bg-white p-4">
            <span className="block text-sm font-black text-[#4a3530]">Το πρόβλημα στη μέση</span>
            <input
              value={map.center}
              onChange={(e) => update((m) => ({ ...m, center: e.target.value.slice(0, 90) }))}
              placeholder="π.χ. Τα παιδιά πεινάνε στο διάλειμμα, αλλά η ουρά στο κυλικείο είναι τεράστια"
              className="mt-1 w-full bg-transparent text-base outline-none placeholder:opacity-50"
            />
          </label>

          {map.branches.map((b, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={`rounded-2xl border-2 bg-white p-3 ${selected === b.id ? "shadow-md" : ""}`}
                style={{ borderColor: color }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: color }} />
                  <input
                    value={b.text}
                    onChange={(e) => setBranch(b.id, (x) => ({ ...x, text: e.target.value.slice(0, 40) }))}
                    placeholder={`Λύση ${i + 1}`}
                    autoFocus={b.text === "" && selected === b.id}
                    className="min-w-0 flex-1 bg-transparent font-black outline-none placeholder:font-normal placeholder:opacity-50"
                  />
                  <button
                    onClick={() => update((m) => ({ ...m, best: m.best === b.id ? null : b.id }))}
                    title="Η καλύτερη ιδέα μου"
                    aria-label="Η καλύτερη ιδέα μου"
                    className={`rounded-full p-1.5 ${map.best === b.id ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
                  >
                    <Star size={18} fill={map.best === b.id ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => removeBranch(b.id)} aria-label={`Σβήσε τη λύση ${i + 1}`} className="rounded-full p-1.5 text-muted-foreground hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 pl-6">
                  {b.subs.map((s, j) => (
                    <span key={j} className="flex items-center gap-1 rounded-lg border px-2 py-1" style={{ borderColor: color }}>
                      <input
                        value={s}
                        onChange={(e) =>
                          setBranch(b.id, (x) => ({ ...x, subs: x.subs.map((v, k) => (k === j ? e.target.value.slice(0, 30) : v)) }))
                        }
                        placeholder="Λεπτομέρεια"
                        autoFocus={s === "" && j === b.subs.length - 1}
                        className="w-32 bg-transparent text-sm outline-none placeholder:opacity-50"
                      />
                      <button
                        onClick={() => setBranch(b.id, (x) => ({ ...x, subs: x.subs.filter((_, k) => k !== j) }))}
                        aria-label="Σβήσε τη λεπτομέρεια"
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {b.subs.length < MAX_SUBS && (
                    <button
                      onClick={() => setBranch(b.id, (x) => ({ ...x, subs: [...x.subs, ""] }))}
                      className="rounded-lg border border-dashed px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
                    >
                      + λεπτομέρεια
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {map.branches.length < MAX_BRANCHES && (
            <button
              onClick={addBranch}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#f08a4b] py-3 font-black text-[#c4631f] hover:bg-[#fff3e0]"
            >
              <Plus size={18} /> Πρόσθεσε μια λύση
            </button>
          )}

          {best && (
            <div className="rounded-2xl bg-[#fff3e0] p-4 text-center">
              <p className="font-black text-[#4a3530]">⭐ Η καλύτερη ιδέα σου: {best.text || "…"}</p>
              <Link
                to="/build"
                className="mt-3 inline-flex rounded-full bg-[oklch(0.55_0.17_173)] px-5 py-2.5 text-sm font-black text-white"
              >
                Φτιάξε τη startup σου με αυτή την ιδέα →
              </Link>
            </div>
          )}
          <SaveNote signedIn={signedIn} saved={saved} />
        </div>
      )}
    </div>
  );
}

// ── Idea board ──────────────────────────────────────────────────────────────

type Card = { text: string; image: string | null };
type Board = { topic: string; cards: Card[] };

// The workbook's six notes, with the colour of their tape; the lined ones
// are for writing, the plain ones for pictures.
const CARDS = [
  { tape: "#9fb5bb", lined: true, line: "#b9c9d0" },
  { tape: "#efe38c", lined: false, line: "" },
  { tape: "#bfe0b0", lined: true, line: "#bfe0b0" },
  { tape: "#e0a96d", lined: false, line: "" },
  { tape: "#f59089", lined: true, line: "#b9c9d0" },
  { tape: "#f7c6dc", lined: false, line: "" },
];

const EMPTY_BOARD: Board = { topic: "", cards: CARDS.map(() => ({ text: "", image: null })) };

function parseBoard(raw: unknown): Board {
  const d = (raw ?? {}) as Partial<Board>;
  return {
    topic: str(d.topic, 60),
    cards: CARDS.map((_, i) => {
      const c = Array.isArray(d.cards) ? d.cards[i] : null;
      const image = typeof c?.image === "string" && c.image.startsWith("data:image/") ? c.image : null;
      return { text: str(c?.text, 300), image };
    }),
  };
}

// Shrinks a picture in the browser, so a few fit in the account.
async function shrinkImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 480 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    let q = 0.75;
    let out = c.toDataURL("image/jpeg", q);
    while (out.length > 140000 && q > 0.35) {
      q -= 0.1;
      out = c.toDataURL("image/jpeg", q);
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function IdeaBoardPart() {
  const { data: board, setData: setBoard, signedIn, saved } = useLessonWork<Board>("ideaboard", EMPTY_BOARD, parseBoard);
  const [err, setErr] = useState<string | null>(null);

  const setCard = (i: number, fn: (c: Card) => Card) => setBoard((b) => ({ ...b, cards: b.cards.map((c, k) => (k === i ? fn(c) : c)) }));

  async function addImage(i: number, file: File | undefined) {
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith("image/")) return setErr("Διάλεξε ένα αρχείο εικόνας.");
    try {
      const image = await shrinkImage(file);
      setCard(i, (c) => ({ ...c, image }));
    } catch {
      setErr("Δεν μπήκε η εικόνα. Δοκίμασε άλλη.");
    }
  }

  return (
    <div>
      <p className="rounded-2xl bg-[#c9ecef] p-4 text-sm leading-relaxed text-[#1f3b6e]">
        Όταν σχεδιάζεις ένα προϊόν, είναι χρήσιμο να έχεις οπτική εικόνα. Ένας τρόπος για να το κάνεις αυτό είναι να δημιουργήσεις έναν πίνακα ιδεών.
        Συγκέντρωσε εικόνες και ιδέες που σχετίζονται με το θέμα που έχεις επιλέξει. Για παράδειγμα, αν θέλεις να σχεδιάσεις μπλουζάκια με θέμα το
        αυτοκίνητο, συγκέντρωσε εικόνες από αυτοκίνητα, τροχούς και διάφορα λογότυπα. Αν πουλάς cupcakes, συγκέντρωσε εικόνες από cupcakes και ιδέες
        διακόσμησης.
      </p>

      <div className="mt-4 overflow-hidden rounded-3xl border-x-[14px] border-[#f9c9a8] bg-[#fdf6ea] p-4 sm:p-6">
        <div className="mx-auto max-w-md -rotate-1 rounded-md bg-[#f7d9cc] px-6 py-3 text-center shadow-sm">
          <p className="text-4xl text-black" style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}>
            Idea board
          </p>
        </div>
        <label className="mx-auto mt-4 flex max-w-md items-center gap-2 border-b-2 border-[#e0a96d] pb-1">
          <span className="shrink-0 text-sm font-black text-[#4a3530]">Το θέμα μου:</span>
          <input
            value={board.topic}
            onChange={(e) => setBoard((b) => ({ ...b, topic: e.target.value.slice(0, 60) }))}
            placeholder="π.χ. σπιτικά cupcakes"
            className="min-w-0 flex-1 bg-transparent font-black text-[#4a3530] outline-none placeholder:font-normal placeholder:opacity-50"
          />
        </label>

        <div className="mt-6 grid grid-cols-1 gap-x-3 gap-y-7 sm:grid-cols-3">
          {CARDS.map((spec, i) => {
            const card = board.cards[i];
            return (
              <div key={i} className="relative bg-white pt-5 shadow-md" style={{ transform: `rotate(${[-1, 0.6, -0.4, 0.8, -0.8, 0.5][i]}deg)` }}>
                <span className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 -rotate-2 opacity-90" style={{ background: spec.tape }} />
                {spec.lined ? (
                  <textarea
                    value={card.text}
                    onChange={(e) => setCard(i, (c) => ({ ...c, text: e.target.value.slice(0, 300) }))}
                    placeholder="Λέξεις, χρώματα, ιδέες…"
                    rows={8}
                    className="block w-full resize-none bg-transparent px-4 pb-3 text-sm text-[#1f3b6e] outline-none placeholder:opacity-50"
                    style={{
                      lineHeight: "24px",
                      backgroundImage: `repeating-linear-gradient(transparent 0 23px, ${spec.line} 23px 24px)`,
                      backgroundAttachment: "local",
                    }}
                  />
                ) : card.image ? (
                  <div className="relative px-3 pb-3">
                    <img src={card.image} alt={`Εικόνα ${i + 1} του πίνακα ιδεών`} className="h-48 w-full object-cover" />
                    <button
                      onClick={() => setCard(i, (c) => ({ ...c, image: null }))}
                      aria-label="Βγάλε την εικόνα"
                      className="no-print absolute right-4 top-1 rounded-full bg-white/90 p-1 text-red-600 shadow"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="no-print mx-3 mb-3 flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-[#e7dccb] text-sm text-muted-foreground hover:bg-[#fdf6ea]">
                    <ImagePlus size={28} />
                    Πρόσθεσε εικόνα
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => addImage(i, e.target.files?.[0])} />
                  </label>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-right text-xs font-bold text-[#c4788a]">Kids in Business · kidsinbusiness.gr</p>
      </div>

      {err && <p className="mt-2 text-sm font-bold text-red-600">{err}</p>}
      <p className="no-print mt-2 text-xs text-muted-foreground">
        Βάλε εικόνες από προϊόντα, χρώματα και σχέδια που σου αρέσουν. Μην ανεβάζεις φωτογραφίες με πρόσωπα. Οι εικόνες μένουν στον λογαριασμό σου και
        δεν τις βλέπει κανείς άλλος.
      </p>
      <div className="no-print">
        <SaveNote signedIn={signedIn} saved={saved} />
      </div>
    </div>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────

function SaveNote({ signedIn, saved }: { signedIn: boolean; saved: string }) {
  return (
    <p className="mt-2 text-center text-xs text-muted-foreground">
      {!signedIn
        ? "Αποθηκεύεται μόνο σε αυτή τη συσκευή. Συνδέσου για να το κρατήσεις στον λογαριασμό σου."
        : saved === "saving"
          ? "Αποθήκευση…"
          : saved === "error"
            ? "Δεν αποθηκεύτηκε. Έλεγξε τη σύνδεσή σου."
            : "✓ Αποθηκεύεται στον λογαριασμό σου."}
    </p>
  );
}

export function BrainstormWorkshop() {
  const [tab, setTab] = useState<"map" | "board">("map");
  return (
    <div id="brainstorm-print" className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-6">
      <style>{`@media print {
  @page { size: A4; margin: 10mm; }
  body * { visibility: hidden !important; }
  #brainstorm-print, #brainstorm-print * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #brainstorm-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
  #brainstorm-print .no-print { display: none !important; }
}`}</style>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-widest text-[#f08a4b]">Εργαστήριο · Brainstorming</p>
        <h2 className="mt-1 text-3xl font-black">{tab === "map" ? "Ο χάρτης ιδεών μου" : "Το Idea board μου"}</h2>
      </div>
      <div className="no-print mx-auto mt-4 grid max-w-md grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {(
          [
            ["map", "🧠 Mind map"],
            ["board", "📌 Idea board"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl py-2.5 text-sm font-black ${tab === id ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">{tab === "map" ? <MindMapPart /> : <IdeaBoardPart />}</div>
      <div className="no-print mt-5 flex justify-center">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#c4788a] px-5 py-2.5 text-sm font-black text-[#a85a6e] hover:bg-[#fce8ee]"
        >
          <Printer size={16} /> Εκτύπωση σε χρώμα
        </button>
      </div>
    </div>
  );
}
