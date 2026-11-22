import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveStartupDrawing, type SaveDrawingResult } from "@/lib/startups.functions";
import { DrawingMusic, type Tune } from "@/lib/drawing-music";

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
// Text size for each of the three sizes above.
const TEXT_SIZES = [28, 48, 80];
const MAX_TEXT = 40;
// Letter styles. They use fonts every device already has (with a generic
// fallback), so Greek letters always show and nothing has to be downloaded.
const FONTS: { label: string; css: string }[] = [
  { label: "Χοντρά", css: `900 {size}px system-ui,"Segoe UI",Roboto,Arial,sans-serif` },
  { label: "Πλάγια", css: `italic 700 {size}px system-ui,"Segoe UI",Roboto,Arial,sans-serif` },
  { label: "Χειρόγραφα", css: `700 {size}px "Comic Sans MS","Chalkboard SE","Comic Neue","Segoe Print",cursive` },
  { label: "Κομψά", css: `700 {size}px Georgia,"Times New Roman","Noto Serif",serif` },
  { label: "Γραφομηχανή", css: `700 {size}px "Courier New",Courier,"Noto Sans Mono",monospace` },
];
const fontCss = (i: number, size: number) => FONTS[i].css.replace("{size}", String(size));

// Texts, stickers and shapes stay movable: they are kept as a list and drawn
// on a layer above the drawing, and only join the picture when it is saved.
type ShapeTool = "line" | "rect" | "circle" | "triangle" | "star" | "heart";
type TextItem = {
  text: string;
  x: number;
  y: number;
  font: number;
  px: number;
  color: string;
  sticker?: boolean;
  // Shapes: drawn from (x, y) to (x2, y2), with this line width and fill.
  shape?: ShapeTool;
  x2?: number;
  y2?: number;
  width?: number;
  fill?: string;
};

const EMOJI_FONT = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
const itemFont = (t: TextItem) => (t.sticker ? `${t.px}px ${EMOJI_FONT}` : fontCss(t.font, t.px));
// Smallest and biggest size when resizing with two fingers.
const MIN_PX = 14;
const MAX_PX = 280;

function shapePath(c: CanvasRenderingContext2D, t: TextItem) {
  const s = { x: t.x, y: t.y };
  const p = { x: t.x2 ?? t.x, y: t.y2 ?? t.y };
  c.beginPath();
  if (t.shape === "line") {
    c.moveTo(s.x, s.y);
    c.lineTo(p.x, p.y);
  } else if (t.shape === "rect") {
    c.rect(s.x, s.y, p.x - s.x, p.y - s.y);
  } else if (t.shape === "circle") {
    c.ellipse((s.x + p.x) / 2, (s.y + p.y) / 2, Math.abs(p.x - s.x) / 2, Math.abs(p.y - s.y) / 2, 0, 0, Math.PI * 2);
  } else if (t.shape === "triangle") {
    c.moveTo((s.x + p.x) / 2, s.y);
    c.lineTo(p.x, p.y);
    c.lineTo(s.x, p.y);
    c.closePath();
  } else if (t.shape === "star") {
    const cx = (s.x + p.x) / 2, cy = (s.y + p.y) / 2;
    const rx = Math.abs(p.x - s.x) / 2, ry = Math.abs(p.y - s.y) / 2;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const k = i % 2 ? 0.45 : 1;
      const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath();
  } else if (t.shape === "heart") {
    const w = p.x - s.x, h = p.y - s.y;
    c.moveTo(s.x + w / 2, s.y + h * 0.3);
    c.bezierCurveTo(s.x + w / 2, s.y, s.x, s.y, s.x, s.y + h * 0.3);
    c.bezierCurveTo(s.x, s.y + h * 0.6, s.x + w / 2, s.y + h * 0.8, s.x + w / 2, p.y);
    c.bezierCurveTo(s.x + w / 2, s.y + h * 0.8, p.x, s.y + h * 0.6, p.x, s.y + h * 0.3);
    c.bezierCurveTo(p.x, s.y, s.x + w / 2, s.y, s.x + w / 2, s.y + h * 0.3);
    c.closePath();
  }
}

function textBox(c: CanvasRenderingContext2D, t: TextItem) {
  if (t.shape) {
    const pad = (t.width ?? 4) / 2 + 6;
    const x1 = Math.min(t.x, t.x2 ?? t.x), x2 = Math.max(t.x, t.x2 ?? t.x);
    const y1 = Math.min(t.y, t.y2 ?? t.y), y2 = Math.max(t.y, t.y2 ?? t.y);
    return { x: x1 - pad, y: y1 - pad, w: x2 - x1 + pad * 2, h: y2 - y1 + pad * 2 };
  }
  c.font = itemFont(t);
  const w = Math.min(c.measureText(t.text).width, WIDTH - 20);
  return { x: t.x - w / 2 - 10, y: t.y - t.px * 0.6 - 6, w: w + 20, h: t.px * 1.2 + 12 };
}

// Is the point on this item? Shapes count only near their outline, so a new
// shape can still be drawn inside an old one.
function isOnItem(c: CanvasRenderingContext2D, t: TextItem, p: { x: number; y: number }) {
  if (t.shape) {
    shapePath(c, t);
    c.lineWidth = (t.width ?? 4) + 22;
    return c.isPointInStroke(p.x, p.y);
  }
  const b = textBox(c, t);
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

// The red × at the top right corner of each item, kept inside the page.
const X_RADIUS = 17;
function xButton(c: CanvasRenderingContext2D, t: TextItem) {
  const b = textBox(c, t);
  return {
    x: Math.max(X_RADIUS, Math.min(WIDTH - X_RADIUS, b.x + b.w)),
    y: Math.max(X_RADIUS, Math.min(HEIGHT - X_RADIUS, b.y)),
  };
}

// controls: the selection box and the × buttons, shown on the board but
// never saved with the picture.
function drawTexts(c: CanvasRenderingContext2D, items: TextItem[], selected: number | null, controls = true) {
  items.forEach((t, i) => {
    if (t.shape) {
      shapePath(c, t);
      if (t.fill && t.shape !== "line") {
        c.fillStyle = t.fill;
        c.fill();
      }
      c.strokeStyle = t.color;
      c.lineWidth = t.width ?? 4;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.stroke();
    } else {
      c.font = itemFont(t);
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = t.color;
      c.fillText(t.text, t.x, t.y, WIDTH - 20);
    }
    if (controls && i === selected) {
      const b = textBox(c, t);
      c.save();
      c.setLineDash([10, 6]);
      c.strokeStyle = "#7c3aed";
      c.lineWidth = 3;
      c.strokeRect(b.x, b.y, b.w, b.h);
      c.restore();
    }
  });
  if (!controls) return;
  for (const t of items) {
    const p = xButton(c, t);
    c.save();
    c.beginPath();
    c.arc(p.x, p.y, X_RADIUS, 0, Math.PI * 2);
    c.fillStyle = "#ef4444";
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = "#ffffff";
    c.stroke();
    c.beginPath();
    c.moveTo(p.x - 6, p.y - 6);
    c.lineTo(p.x + 6, p.y + 6);
    c.moveTo(p.x + 6, p.y - 6);
    c.lineTo(p.x - 6, p.y + 6);
    c.lineCap = "round";
    c.stroke();
    c.restore();
  }
}

// Makes an item bigger or smaller by factor k, around its middle.
function scaled(t: TextItem, k: number): TextItem {
  if (!t.shape) return { ...t, px: Math.round(Math.max(MIN_PX, Math.min(MAX_PX, t.px * k))) };
  const cx = (t.x + (t.x2 ?? t.x)) / 2, cy = (t.y + (t.y2 ?? t.y)) / 2;
  const span = Math.max(Math.abs((t.x2 ?? t.x) - t.x), Math.abs((t.y2 ?? t.y) - t.y), 1);
  k = Math.max(20 / span, Math.min(WIDTH * 1.5 / span, k));
  return { ...t, x: cx + (t.x - cx) * k, y: cy + (t.y - cy) * k, x2: cx + ((t.x2 ?? t.x) - cx) * k, y2: cy + ((t.y2 ?? t.y) - cy) * k };
}

type Tool = "brush" | "eraser" | "bucket" | "line" | "rect" | "circle" | "triangle" | "star" | "heart" | "sticker" | "text";

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
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const undo = useRef<{ img: ImageData; texts: TextItem[] }[]>([]);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  // The text being dragged, and where the finger holds it.
  const drag = useRef<{ i: number; dx: number; dy: number } | null>(null);
  // Fingers on the board, and a two-finger resize in progress.
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ i: number; dist: number; orig: TextItem } | null>(null);
  // A shape being drawn: its place in the list.
  const newShape = useRef<number | null>(null);
  const gap = () => {
    const [a, b] = [...fingers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  };
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [tool, setTool] = useState<Tool>("brush");
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [text, setText] = useState("");
  const [font, setFont] = useState(0);
  // Music is off until the child turns it on, and stops when the board closes.
  const music = useRef<DrawingMusic | null>(null);
  const [tune, setTune] = useState<Tune | null>(null);
  const playTune = (t: Tune | null) => {
    if (!music.current) music.current = new DrawingMusic();
    if (t) music.current.start(t);
    else music.current.stop();
    setTune(t);
  };
  useEffect(() => () => music.current?.stop(), []);
  const eraser = tool === "eraser";
  const bucket = tool === "bucket";
  // Picking a colour leaves the eraser (it has no colour), keeps other tools.
  const pickColor = (c: string) => {
    setColor(c);
    setTool((t) => (t === "eraser" ? "brush" : t));
    changeSelected({ color: c });
  };
  // A tapped item can get another colour, letter style, size or line width.
  const changeSelected = (patch: Partial<TextItem> | ((t: TextItem) => Partial<TextItem>)) => {
    if (selected === null) return;
    remember();
    setTexts((all) => all.map((t, i) => (i === selected ? { ...t, ...(typeof patch === "function" ? patch(t) : patch) } : t)));
    setDirty(true);
  };
  const pickSize = (s: number) => {
    setSize(s);
    changeSelected((t) => (t.shape ? { width: s } : { px: (t.sticker ? STICKER_SIZES : TEXT_SIZES)[SIZES.indexOf(s)] }));
  };
  const pickFont = (f: number) => {
    setFont(f);
    if (selected === null) setTool("text");
    else changeSelected({ font: f });
  };
  const deleteSelected = () => {
    if (selected === null) return;
    remember();
    setTexts((all) => all.filter((_, i) => i !== selected));
    setSelected(null);
    setDirty(true);
  };

  useEffect(() => {
    const c = overlayRef.current?.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, WIDTH, HEIGHT);
    drawTexts(c, texts, selected);
  }, [texts, selected]);
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
    undo.current.push({ img: c.getImageData(0, 0, WIDTH, HEIGHT), texts });
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

  // Which item is under the finger (the top one first), or -1.
  const textAt = (p: { x: number; y: number }) => {
    const c = overlayRef.current?.getContext("2d");
    if (!c) return -1;
    for (let i = texts.length - 1; i >= 0; i--) {
      if (isOnItem(c, texts[i], p)) return i;
    }
    return -1;
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = point(e);
    fingers.current.set(e.pointerId, p);
    // A second finger while holding a text or sticker: resize it.
    const held = drag.current?.i ?? selected;
    if (fingers.current.size === 2 && held !== null && texts[held]) {
      pinch.current = { i: held, dist: gap(), orig: texts[held] };
      drag.current = null;
      newShape.current = null;
      setSelected(held);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (fingers.current.size > 1) return;
    // Tapping the × removes that text or sticker straight away.
    const oc = overlayRef.current?.getContext("2d");
    if (oc && fingers.current.size === 1) {
      for (let i = texts.length - 1; i >= 0; i--) {
        const xb = xButton(oc, texts[i]);
        if (Math.hypot(p.x - xb.x, p.y - xb.y) <= X_RADIUS + 6) {
          remember();
          setTexts((all) => all.filter((_, j) => j !== i));
          setSelected(null);
          setDirty(true);
          fingers.current.delete(e.pointerId);
          return;
        }
      }
    }
    // In bucket mode, tapping inside a shape fills the shape.
    if (bucket && oc) {
      for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        if (!t.shape || t.shape === "line") continue;
        shapePath(oc, t);
        if (oc.isPointInPath(p.x, p.y)) {
          remember();
          setTexts((all) => all.map((it, j) => (j === i ? { ...it, fill: color } : it)));
          setDirty(true);
          return;
        }
      }
    }
    // Tapping an item picks it up, whatever tool is chosen.
    const hit = bucket ? -1 : textAt(p);
    if (hit >= 0) {
      remember();
      setSelected(hit);
      drag.current = { i: hit, dx: p.x - texts[hit].x, dy: p.y - texts[hit].y };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    setSelected(null);
    if (tool === "text" || tool === "sticker") {
      if (tool === "text" && !text.trim()) return;
      remember();
      const item: TextItem =
        tool === "text"
          ? { text: text.trim(), x: p.x, y: p.y, font, px: TEXT_SIZES[SIZES.indexOf(size)], color }
          : { text: sticker, x: p.x, y: p.y, font: 0, px: STICKER_SIZES[SIZES.indexOf(size)], color, sticker: true };
      setTexts((all) => [...all, item]);
      drag.current = { i: texts.length, dx: 0, dy: 0 };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDirty(true);
      return;
    }
    if (tool !== "brush" && tool !== "eraser" && tool !== "bucket") {
      remember();
      const item: TextItem = { text: "", x: p.x, y: p.y, x2: p.x, y2: p.y, font: 0, px: 0, color, shape: tool, width: size };
      setTexts((all) => [...all, item]);
      newShape.current = texts.length;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDirty(true);
      return;
    }
    remember();
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
    last.current = p;
    line(p, p);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (fingers.current.has(e.pointerId)) fingers.current.set(e.pointerId, point(e));
    const pz = pinch.current;
    if (pz) {
      if (fingers.current.size < 2) return;
      const next = scaled(pz.orig, gap() / pz.dist);
      setTexts((all) => all.map((t, i) => (i === pz.i ? next : t)));
      setDirty(true);
      return;
    }
    const d = drag.current;
    if (d) {
      const p = point(e);
      const x = Math.max(0, Math.min(WIDTH, p.x - d.dx));
      const y = Math.max(0, Math.min(HEIGHT, p.y - d.dy));
      setTexts((all) =>
        all.map((t, i) =>
          i !== d.i ? t : t.shape ? { ...t, x, y, x2: x + (t.x2 ?? t.x) - t.x, y2: y + (t.y2 ?? t.y) - t.y } : { ...t, x, y },
        ),
      );
      setDirty(true);
      return;
    }
    const ns = newShape.current;
    if (ns !== null) {
      const p = point(e);
      setTexts((all) => all.map((t, i) => (i === ns ? { ...t, x2: p.x, y2: p.y } : t)));
      return;
    }
    if (!drawing.current) return;
    const p = point(e);
    if (!last.current) return;
    line(last.current, p);
    last.current = p;
  };

  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    fingers.current.delete(e.pointerId);
    if (fingers.current.size < 2) pinch.current = null;
    drag.current = null;
    // A tap with a shape tool (no drag) leaves no tiny shape behind.
    const ns = newShape.current;
    newShape.current = null;
    if (ns !== null) {
      setTexts((all) =>
        all.filter((t, i) => i !== ns || Math.abs((t.x2 ?? t.x) - t.x) > 4 || Math.abs((t.y2 ?? t.y) - t.y) > 4),
      );
    }
    drawing.current = false;
    last.current = null;
  };

  const handleUndo = () => {
    const prev = undo.current.pop();
    if (!prev) return;
    ctx()?.putImageData(prev.img, 0, 0);
    setTexts(prev.texts);
    setSelected(null);
  };

  const handleClear = () => {
    remember();
    fillWhite();
    setTexts([]);
    setSelected(null);
    setDirty(true);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    setError(null);
    try {
      // The picture with the texts on top, without the selection box.
      const out = document.createElement("canvas");
      out.width = WIDTH;
      out.height = HEIGHT;
      const oc = out.getContext("2d");
      if (!oc) throw new Error("no canvas");
      oc.drawImage(canvas, 0, 0);
      drawTexts(oc, texts, null, false);
      const res = await saveStartupDrawing({ data: { startupId, png: out.toDataURL("image/png") } });
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

      {/* Music while drawing */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">🎵 Μουσική:</span>
        {([
          [null, "🔇 Χωρίς"],
          ["happy", "😊 Χαρούμενη"],
          ["calm", "😌 Ήρεμη"],
          ["jazz", "🎷 Jazz"],
        ] as [Tune | null, string][]).map(([t, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => playTune(t)}
            className={`h-8 rounded-full px-3 text-sm font-bold ${tune === t ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

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
            onClick={() => pickSize(s)}
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

      {/* Text: type a word, then tap (or drag) on the page to place it */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">Κείμενο:</span>
        <input
          type="text"
          value={text}
          maxLength={MAX_TEXT}
          placeholder="Γράψε μια λέξη, π.χ. το όνομα του προϊόντος"
          onFocus={() => setTool("text")}
          onChange={(e) => { setText(e.target.value); setTool("text"); }}
          className={`h-9 min-w-0 flex-1 rounded-xl border-2 bg-background px-3 text-sm ${tool === "text" ? "border-[oklch(0.57_0.23_292)]" : "border-muted"}`}
        />
        <button
          type="button"
          onClick={() => toggle("text")}
          className={`h-9 rounded-xl px-3 text-sm font-bold ${tool === "text" ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
        >
          🔤 Κείμενο
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">Γράμματα:</span>
        {FONTS.map((f, i) => (
          <button
            key={f.label}
            type="button"
            onClick={() => pickFont(i)}
            className={`h-9 rounded-xl px-3 ${font === i ? "bg-[oklch(0.57_0.23_292)] text-white" : "bg-muted"}`}
            style={{ font: fontCss(i, 15) }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tool !== "brush" && tool !== "eraser" && tool !== "bucket" && (
        <p className="mt-2 text-xs font-bold text-muted-foreground">
          {tool === "text"
            ? text.trim()
              ? "👆 Πάτα πάνω στη ζωγραφιά για να βάλεις το κείμενο. Μετά σύρε το όπου θέλεις και άνοιξε ή κλείσε δύο δάχτυλα πάνω του για να το μεγαλώσεις ή να το μικρύνεις."
              : "✏️ Γράψε πρώτα το κείμενο στο κουτάκι."
            : tool === "sticker"
            ? "👆 Πάτα πάνω στη ζωγραφιά για να κολλήσεις το αυτοκόλλητο. Μετά σύρε το όπου θέλεις και άνοιξε ή κλείσε δύο δάχτυλα πάνω του για να το μεγαλώσεις ή να το μικρύνεις."
            : "👆 Σύρε το δάχτυλο ή το ποντίκι πάνω στη ζωγραφιά για να φτιάξεις το σχήμα. Γέμισέ το με το 🪣."}
        </p>
      )}

      <div className="relative mt-4">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
          className="block aspect-[4/3] w-full cursor-crosshair touch-none rounded-xl border bg-white"
        />
        {/* The texts, above the drawing; taps go through to the drawing. */}
        <canvas
          ref={overlayRef}
          width={WIDTH}
          height={HEIGHT}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full rounded-xl"
        />
      </div>

      {selected !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[oklch(0.96_0.03_292)] px-3 py-2">
          <span className="flex-1 text-xs font-bold text-[oklch(0.45_0.2_292)]">
            ✋ Σύρε το όπου θέλεις. Με δύο δάχτυλα το μεγαλώνεις ή το μικραίνεις{selected !== null && !texts[selected]?.shape && " (στον υπολογιστή, με τις τελίτσες πάχους)"}.{selected !== null && texts[selected]?.shape
              ? " Μπορείς να του αλλάξεις και χρώμα ή πάχος, και να το γεμίσεις με το 🪣."
              : selected !== null && !texts[selected]?.sticker && " Μπορείς να του αλλάξεις και χρώμα ή γράμματα."}
          </span>
          <button type="button" onClick={deleteSelected} className="h-8 rounded-full bg-white px-3 text-sm font-bold">
            🗑️ Σβήσε το
          </button>
          <button type="button" onClick={() => setSelected(null)} className="h-8 rounded-full bg-[oklch(0.57_0.23_292)] px-3 text-sm font-bold text-white">
            ✔️ Έτοιμο
          </button>
        </div>
      )}

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
