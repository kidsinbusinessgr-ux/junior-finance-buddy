// The child's virtual Kids in Business card. It shows the app's coins and is
// only a picture: it is not a real bank card and holds no real money. The
// chosen colour and pattern are saved on jfb_children (card_color,
// card_pattern) and the card shows in the Wallet.

export const CARD_COLORS = [
  { id: "purple", label: "Μωβ", bg: "linear-gradient(135deg,oklch(0.45 0.22 290),oklch(0.62 0.2 300))" },
  { id: "midnight", label: "Μεσάνυχτα", bg: "linear-gradient(135deg,#0f172a,#1e3a8a)" },
  { id: "graphite", label: "Γραφίτης", bg: "linear-gradient(135deg,#18181b,#52525b)" },
  { id: "ocean", label: "Ωκεανός", bg: "linear-gradient(135deg,#0e7490,#2563eb)" },
  { id: "emerald", label: "Σμαράγδι", bg: "linear-gradient(135deg,#065f46,#10b981)" },
  { id: "sunset", label: "Ηλιοβασίλεμα", bg: "linear-gradient(135deg,#c2410c,#f59e0b)" },
  { id: "rose", label: "Τριανταφυλλί", bg: "linear-gradient(135deg,#9f1239,#f43f5e)" },
  { id: "sand", label: "Άμμος", bg: "linear-gradient(135deg,#78716c,#d6c5a8)" },
] as const;

export const CARD_PATTERNS = [
  { id: "none", label: "Λιτό", css: "none" },
  {
    id: "lines",
    label: "Γραμμές",
    css: "repeating-linear-gradient(45deg,rgba(255,255,255,.09) 0 2px,transparent 2px 14px)",
  },
  {
    id: "dots",
    label: "Κουκκίδες",
    css: "radial-gradient(rgba(255,255,255,.16) 1.5px,transparent 1.5px) 0 0/14px 14px",
  },
  {
    id: "waves",
    label: "Κύματα",
    css: "radial-gradient(circle at 100% 50%,transparent 20%,rgba(255,255,255,.1) 21%,rgba(255,255,255,.1) 34%,transparent 35%,transparent) 0 0/36px 36px",
  },
  {
    id: "grid",
    label: "Πλέγμα",
    css: "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px) 0 0/22px 22px,linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px) 0 0/22px 22px",
  },
  {
    id: "glow",
    label: "Λάμψη",
    css: "radial-gradient(circle at 85% 15%,rgba(255,255,255,.35),transparent 45%),radial-gradient(circle at 10% 100%,rgba(255,255,255,.18),transparent 40%)",
  },
] as const;

export type CardColor = (typeof CARD_COLORS)[number]["id"];
export type CardPattern = (typeof CARD_PATTERNS)[number]["id"];

const colorBg = (id: string) => (CARD_COLORS.find((c) => c.id === id) ?? CARD_COLORS[0]).bg;
const patternCss = (id: string) => (CARD_PATTERNS.find((p) => p.id === id) ?? CARD_PATTERNS[0]).css;

export function KibCard({
  color,
  pattern,
  name,
  coins,
  compact = false,
}: {
  color: string;
  pattern: string;
  name: string;
  coins: number | null;
  compact?: boolean;
}) {
  const bg = patternCss(pattern) === "none" ? colorBg(color) : `${patternCss(pattern)},${colorBg(color)}`;
  return (
    <div
      className={`relative aspect-[1.586] w-full select-none overflow-hidden rounded-2xl text-white shadow-xl ${compact ? "p-4" : "p-5 sm:p-6"}`}
      style={{ background: bg }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-90">Kids in Business</span>
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Εικονική</span>
        </div>
        {/* Chip */}
        <div className="h-7 w-10 rounded-md bg-gradient-to-br from-[#f5d77a] to-[#b8902e] opacity-90 shadow-inner" />
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider opacity-70">Κάτοχος</p>
            <p className="truncate font-bold">{name || "Το όνομά σου"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider opacity-70">Υπόλοιπο</p>
            <p className={`font-black ${compact ? "text-xl" : "text-2xl"}`}>{coins === null ? "—" : `🪙 ${coins}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
