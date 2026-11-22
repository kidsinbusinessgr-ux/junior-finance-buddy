import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveStartupDrawing, type SaveDrawingResult } from "@/lib/startups.functions";

// Drawing board: the founder draws their product with the finger or the mouse,
// and the picture is saved with the startup (see saveStartupDrawing). Free,
// no outside service and no account needed.

const WIDTH = 800;
const HEIGHT = 600;
const COLORS = [
  "#111827", "#ef4444", "#f97316", "#facc15", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#92400e",
];
const SIZES = [4, 10, 22];
const MAX_UNDO = 20;

const SAVE_ERRORS: Record<Exclude<SaveDrawingResult, { ok: true }>["reason"], string> = {
  login: "Συνδέσου για να αποθηκεύσεις τη ζωγραφιά σου.",
  not_owner: "Μόνο ο ιδρυτής μπορεί να αλλάξει τη ζωγραφιά.",
  bad_file: "Η ζωγραφιά είναι πολύ μεγάλη. Δοκίμασε με λιγότερο γέμισμα.",
  failed: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
};

export function StartupDrawing({
  startupId,
  imageUrl,
  onSaved,
  onClose,
}: {
  startupId: string;
  imageUrl: string | null;
  onSaved: (url: string) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undo = useRef<ImageData[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;

  const fillWhite = () => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, WIDTH, HEIGHT);
  };

  // Start from a white page, or from the saved drawing so it can be changed.
  useEffect(() => {
    fillWhite();
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => ctx()?.drawImage(img, 0, 0, WIDTH, HEIGHT);
    img.src = imageUrl;
  }, [imageUrl]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const remember = () => {
    const c = ctx();
    if (!c) return;
    undo.current.push(c.getImageData(0, 0, WIDTH, HEIGHT));
    if (undo.current.length > MAX_UNDO) undo.current.shift();
  };

  const line = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const c = ctx();
    if (!c) return;
    c.strokeStyle = eraser ? "#ffffff" : color;
    c.lineWidth = eraser ? size * 2 : size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y);
    c.stroke();
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    remember();
    drawing.current = true;
    const p = point(e);
    last.current = p;
    line(p, p);
    setDirty(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    line(last.current, p);
    last.current = p;
  };

  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const handleUndo = () => {
    const prev = undo.current.pop();
    if (prev) ctx()?.putImageData(prev, 0, 0);
  };

  const handleClear = () => {
    remember();
    fillWhite();
    setDirty(true);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    setError(null);
    try {
      const res = await saveStartupDrawing({ data: { startupId, png: canvas.toDataURL("image/png") } });
      if (res.ok) {
        onSaved(res.imageUrl);
        return;
      }
      setError(SAVE_ERRORS[res.reason]);
    } catch {
      setError(SAVE_ERRORS.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-[oklch(0.57_0.23_292)] bg-card p-4 sm:p-5">
      <h3 className="text-lg font-black">🎨 Ζωγράφισε το προϊόν σου</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Δείξε σε όλους πώς μοιάζει! Ζωγράφισε μόνο το προϊόν, χωρίς ονόματα, τηλέφωνα ή πρόσωπα.
      </p>

      {/* Colours */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Χρώμα ${c}`}
            onClick={() => { setColor(c); setEraser(false); }}
            className={`h-8 w-8 rounded-full border-2 transition-transform ${!eraser && color === c ? "scale-110 border-foreground" : "border-white shadow"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Brush size and tools */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Πάχος ${s}`}
            onClick={() => setSize(s)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${size === s ? "bg-[oklch(0.57_0.23_292)]" : "bg-muted"}`}
          >
            <span className="rounded-full bg-foreground" style={{ width: s / 1.5 + 3, height: s / 1.5 + 3, backgroundColor: size === s ? "#fff" : undefined }} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setEraser((v) => !v)}
          className={`h-9 rounded-xl px-3 text-sm font-bold ${eraser ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
        >
          🧽 Γόμα
        </button>
        <button type="button" onClick={handleUndo} className="h-9 rounded-xl bg-muted px-3 text-sm font-bold">↩️ Αναίρεση</button>
        <button type="button" onClick={handleClear} className="h-9 rounded-xl bg-muted px-3 text-sm font-bold">🗑️ Καθάρισμα</button>
      </div>

      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        className="mt-4 aspect-[4/3] w-full cursor-crosshair touch-none rounded-xl border bg-white"
      />

      {error && <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive">{error}</p>}

      <div className="mt-4 flex gap-3">
        <Button variant="outline" className="h-11 flex-1 rounded-full" onClick={onClose} disabled={saving}>
          Κλείσιμο
        </Button>
        <Button
          className="h-11 flex-1 rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white hover:bg-[oklch(0.48_0.17_173)]"
          onClick={handleSave}
          disabled={saving || !dirty}
        >
          {saving ? "Αποθήκευση…" : "💾 Αποθήκευση"}
        </Button>
      </div>
    </div>
  );
}
