import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BusinessModelCanvas, countNotes, fetchAccountCanvas } from "@/components/bmc-canvas";

// On /build: the child's Business Model Canvas from the lesson, to look at
// (and change) while making their startup. It is the same canvas as in the
// lesson, kept in the account (jfb_canvases) and on this device.

function canvasNoteCount(): number {
  try {
    const raw = localStorage.getItem("kib-bmc");
    if (!raw) return 0;
    const d = JSON.parse(raw) as { notes?: Record<string, string[]> };
    return Object.values(d.notes ?? {}).reduce((s, list) => s + (Array.isArray(list) ? list.length : 0), 0);
  } catch {
    return 0;
  }
}

export function MyCanvasPanel() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(0);
  useEffect(() => {
    const local = canvasNoteCount();
    setNotes(local);
    fetchAccountCanvas().then((res) => {
      if (res?.draft) setNotes(Math.max(local, countNotes(res.draft)));
    });
  }, [open]);

  return (
    <section className="border-b bg-[oklch(0.97_0.02_173)] px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-black">📋 Το Business Model Canvas σου</p>
            <p className="text-sm text-muted-foreground">
              {notes > 0
                ? `Έχεις ${notes} post-it από το μάθημα. Άνοιξέ το για να το έχεις μπροστά σου όσο φτιάχνεις τη startup σου.`
                : "Δεν το έχεις συμπληρώσει ακόμα. Μπορείς να το φτιάξεις εδώ ή στο μάθημα."}
            </p>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-full bg-[oklch(0.55_0.17_173)] px-5 py-2.5 text-sm font-black text-white"
          >
            {open ? "Κλείσε το canvas" : "Δες το canvas σου"}
          </button>
        </div>
        {open && (
          <div className="mt-5">
            <BusinessModelCanvas />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Θέλεις να θυμηθείς τι μπαίνει σε κάθε κουτί; Δες το{" "}
              <Link to="/learn/$lessonId" params={{ lessonId: "8" }} className="font-bold underline">
                μάθημα για το Business Model Canvas
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
