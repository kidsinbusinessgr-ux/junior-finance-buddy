import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveStartupDrawing, type SaveDrawingResult } from "@/lib/startups.functions";

// Drawing board: the founder draws their product with the finger or the mouse,
// and the picture is saved with the startup (see saveStartupDrawing). Free,
// no outside service and no account needed.

const WIDTH = 800;
const HEIGHT = 600;
const COLORS = [
  "#111827", "#6b7280", "#d1d5db", "#ffffff",
  "#7f1d1d", "#ef4444", "#fca5a5",
  "#c2410c", "#f97316", "#fdba74",
  "#ca8a04", "#facc15", "#fef08a",
  "#15803d", "#22c55e", "#86efac",
  "#0e7490", "#06b6d4", "#a5f3fc",
  "#1d4ed8", "#3b82f6", "#93c5fd",
  "#6d28d9", "#8b5cf6", "#c4b5fd",
  "#be185d", "#ec4899", "#f9a8d4",
  "#78350f", "#92400e", "#d6a77a",
];
const SIZES = [4, 10, 22];
// Sticker size for each of the three sizes above.
const STICKER_SIZES = [48, 90, 150];

type Tool = "brush" | "eraser" | "bucket" | "line" | "rect" | "circle" | "triangle" | "star" | "heart" | "sticker";

const SHAPES: { tool: Tool; icon: string; label: string }[] = [
  { tool: "line", icon: "╱", label: "Γραμμή" },
  { tool: "rect", icon: "▭", label: "Ορθογώνιο" },
  { tool: "circle", icon: "◯", label: "Κύκλος" },
  { tool: "triangle", icon: "△", label: "Τρίγωνο" },
  { tool: "star", icon: "☆", label: "Αστέρι" },
  { tool: "heart", icon: "♡", label: "Καρδιά" },
];

const STICKERS = [
  "⭐", "❤️", "✨", "💡", "🚀", "🌱", "🌍", "♻️", "💧", "☀️", "🌈", "⚡",
  "📱", "💻", "🎮", "🎧", "📚", "✏️", "🎒", "🎨", "⚽", "🚲", "🛹", "🎁",
  "🍎", "🍕", "🧁", "🍪", "🧃", "🥤", "🐶", "🐱", "🌸", "🏠", "🛒", "💰",
];
// How different a pixel may be from the clicked one and still get filled, so
// the soft edges of brush lines don't leave a pale outline.
const FILL_TOLERANCE = 60;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Paint bucket: fills the area around (x, y) that has the clicked colour.
function floodFill(img: ImageData, x: number, y: number, fill: [number, number, number]) {
  const { width, height, data } = img;
  const start = (y * width + x) * 4;
  const [r0, g0, b0] = [data[start], data[start + 1], data[start + 2]];
  if (Math.abs(r0 - fill[0]) + Math.abs(g0 - fill[1]) + Math.abs(b0 - fill[2]) === 0) return;

  const matches = (p: number) => {
    const i = p * 4;
    return Math.abs(data[i] - r0) + Math.abs(data[i + 1] - g0) + Math.abs(data[i + 2] - b0) <= FILL_TOLERANCE;
  };
  const seen = new Uint8Array(width * height);
  const stack = [y * width + x];
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p] || !matches(p)) continue;
    seen[p] = 1;
    const i = p * 4;
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = 255;
    const px = p % width;
    if (px > 0) stack.push(p - 1);
    if (px < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }
}
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
  const [tool, setTool] = useState<Tool>("brush");
  const [sticker, setSticker] = useState(STICKERS[0]);
  // Shapes and stickers: the page before the drag, redrawn on every move.
  const start = useRef<{ x: number; y: number } | null>(null);
  const before = useRef<ImageData | null>(null);
  const eraser = tool === "eraser";
  const bucket = tool === "bucket";
  // Picking a colour leaves the eraser (it has no colour), keeps other tools.
  const pickColor = (c: string) => { setColor(c); setTool((t) => (t === "eraser" ? "brush" : t)); };
  const toggle = (t: Tool) => setTool((cur) => (cur === t ? "brush" : t));
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
    remember();
    const p = point(e);
    if (bucket) {
      const c = ctx();
      if (!c) return;
      const img = c.getImageData(0, 0, WIDTH, HEIGHT);
      floodFill(img, Math.min(WIDTH - 1, Math.floor(p.x)), Math.min(HEIGHT - 1, Math.floor(p.y)), hexToRgb(color));
      c.putImageData(img, 0, 0);
      setDirty(true);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setDirty(true);
    if (tool === "brush" || tool === "eraser") {
      last.current = p;
      line(p, p);
      return;
    }
    start.current = p;
    before.current = ctx()?.getImageData(0, 0, WIDTH, HEIGHT) ?? null;
    preview(p);
  };

  // Shapes go from where the finger went down to where it is now; a sticker
  // follows the finger until it is let go.
  const preview = (p: { x: number; y: number }) => {
    const c = ctx();
    const s = start.current;
    if (!c || !s || !before.current) return;
    c.putImageData(before.current, 0, 0);
    if (tool === "sticker") {
      c.font = `${STICKER_SIZES[SIZES.indexOf(size)]}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(sticker, p.x, p.y);
      return;
    }
    c.strokeStyle = color;
    c.lineWidth = size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    if (tool === "line") {
      c.moveTo(s.x, s.y);
      c.lineTo(p.x, p.y);
    } else if (tool === "rect") {
      c.rect(s.x, s.y, p.x - s.x, p.y - s.y);
    } else if (tool === "circle") {
      c.ellipse((s.x + p.x) / 2, (s.y + p.y) / 2, Math.abs(p.x - s.x) / 2, Math.abs(p.y - s.y) / 2, 0, 0, Math.PI * 2);
    } else if (tool === "triangle") {
      c.moveTo((s.x + p.x) / 2, s.y);
      c.lineTo(p.x, p.y);
      c.lineTo(s.x, p.y);
      c.closePath();
    } else if (tool === "star") {
      const cx = (s.x + p.x) / 2, cy = (s.y + p.y) / 2;
      const rx = Math.abs(p.x - s.x) / 2, ry = Math.abs(p.y - s.y) / 2;
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const k = i % 2 ? 0.45 : 1;
        const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath();
    } else if (tool === "heart") {
      const w = p.x - s.x, h = p.y - s.y;
      c.moveTo(s.x + w / 2, s.y + h * 0.3);
      c.bezierCurveTo(s.x + w / 2, s.y, s.x, s.y, s.x, s.y + h * 0.3);
      c.bezierCurveTo(s.x, s.y + h * 0.6, s.x + w / 2, s.y + h * 0.8, s.x + w / 2, p.y);
      c.bezierCurveTo(s.x + w / 2, s.y + h * 0.8, p.x, s.y + h * 0.6, p.x, s.y + h * 0.3);
      c.bezierCurveTo(p.x, s.y, s.x + w / 2, s.y, s.x + w / 2, s.y + h * 0.3);
      c.closePath();
    }
    c.stroke();
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = point(e);
    if (start.current) {
      preview(p);
      return;
    }
    if (!last.current) return;
    line(last.current, p);
    last.current = p;
  };

  const up = () => {
    drawing.current = false;
    last.current = null;
    start.current = null;
    before.current = null;
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
            onClick={() => pickColor(c)}
            className={`h-8 w-8 rounded-full border-2 transition-transform ${!eraser && color === c ? "scale-110 border-foreground" : "border-white shadow ring-1 ring-black/10"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        {/* Any colour: the device's own colour palette */}
        <label
          className={`relative flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-bold ${!eraser && !COLORS.includes(color) ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
          title="Διάλεξε όποιο χρώμα θέλεις"
        >
          <span
            className="h-5 w-5 rounded-full border-2 border-white shadow"
            style={{ background: COLORS.includes(color) ? "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" : color }}
          />
          🌈 Παλέτα
          <input
            type="color"
            value={color}
            onChange={(e) => pickColor(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
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
          onClick={() => toggle("bucket")}
          className={`h-9 rounded-xl px-3 text-sm font-bold ${bucket ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
        >
          🪣 Γέμισμα
        </button>
        <button
          type="button"
          onClick={() => toggle("eraser")}
          className={`h-9 rounded-xl px-3 text-sm font-bold ${eraser ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
        >
          🧽 Γόμα
        </button>
        <button type="button" onClick={handleUndo} className="h-9 rounded-xl bg-muted px-3 text-sm font-bold">↩️ Αναίρεση</button>
        <button type="button" onClick={handleClear} className="h-9 rounded-xl bg-muted px-3 text-sm font-bold">🗑️ Καθάρισμα</button>
      </div>

      {/* Shapes: drag on the page to draw one */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">Σχήματα:</span>
        {SHAPES.map((s) => (
          <button
            key={s.tool}
            type="button"
            title={s.label}
            aria-label={s.label}
            onClick={() => toggle(s.tool)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl font-black ${tool === s.tool ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
          >
            {s.icon}
          </button>
        ))}
      </div>

      {/* Stickers: tap one, then tap (or drag) on the page to place it */}
      <div className="mt-3">
        <span className="text-sm font-bold text-muted-foreground">Αυτοκόλλητα:</span>
        <div className="mt-1 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
          {STICKERS.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Αυτοκόλλητο ${s}`}
              onClick={() => { setSticker(s); setTool("sticker"); }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${tool === "sticker" && sticker === s ? "bg-[oklch(0.57_0.23_292)]" : "bg-muted"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {tool !== "brush" && tool !== "eraser" && tool !== "bucket" && (
        <p className="mt-2 text-xs font-bold text-muted-foreground">
          {tool === "sticker"
            ? "👆 Πάτα πάνω στη ζωγραφιά για να κολλήσεις το αυτοκόλλητο. Το μέγεθος αλλάζει με τις τελίτσες πάχους."
            : "👆 Σύρε το δάχτυλο ή το ποντίκι πάνω στη ζωγραφιά για να φτιάξεις το σχήμα. Γέμισέ το με το 🪣."}
        </p>
      )}

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
