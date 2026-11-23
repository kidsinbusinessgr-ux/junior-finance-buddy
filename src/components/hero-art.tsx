import { Check, TrendingUp } from "lucide-react";
import { KibCard } from "@/components/kib-card";

// Simple graphics for the big page headers, instead of cartoon children:
// the app's own things (the card, tasks, a savings goal, a chart), drawn
// with HTML and SVG. They sit on the purple header backgrounds.

type Variant = "home" | "spend" | "earn" | "save";

const panel = "rounded-2xl bg-white/95 p-4 text-[oklch(0.25_0.05_290)] shadow-2xl ring-1 ring-black/5";
const pill = "rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[oklch(0.3_0.08_290)] shadow-lg";

function Chart() {
  // A rising line with a soft area under it.
  const pts = [8, 22, 18, 30, 27, 40, 36, 52, 48, 62];
  const w = 220, h = 80;
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h - (v / 70) * h] as const);
  const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-20 w-full" aria-hidden>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill="oklch(0.62 0.17 160 / 0.15)" />
      <polyline points={line} fill="none" stroke="oklch(0.58 0.17 160)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0.92 0.02 290)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="oklch(0.55 0.22 292)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="900" fill="oklch(0.3 0.08 290)">{pct}%</text>
    </svg>
  );
}

export function HeroArt({ variant }: { variant: Variant }) {
  if (variant === "spend") {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden>
        <div className="hero-orb absolute inset-[10%] rounded-full" />
        <div className="absolute left-[18%] top-[20%] w-[62%] rotate-[8deg] opacity-90">
          <KibCard color="purple" pattern="glow" name="" coins={null} compact />
        </div>
        <div className="absolute left-[10%] top-[34%] w-[68%] -rotate-[7deg]">
          <KibCard color="midnight" pattern="lines" name="Μαρία Κ." coins={120} level={2} />
        </div>
        <div className={`${pill} absolute right-[4%] top-[18%]`}>Πληρωμή · −30 🪙</div>
        <div className={`${pill} absolute bottom-[14%] left-[8%]`}>Όριο εβδομάδας · 50 🪙</div>
      </div>
    );
  }

  if (variant === "earn") {
    const rows = [["Πλύσιμο πιάτων", 20], ["Πότισμα φυτών", 10], ["Μάθημα: Προϋπολογισμός", 60]] as const;
    return (
      <div className="relative mx-auto aspect-square w-full max-w-[500px]" aria-hidden>
        <div className="hero-orb absolute inset-[10%] rounded-full" />
        <div className={`${panel} absolute left-[12%] top-[22%] w-[70%]`}>
          <p className="text-xs font-bold uppercase tracking-widest text-[oklch(0.5_0.05_290)]">Αυτή την εβδομάδα</p>
          <ul className="mt-3 space-y-2.5">
            {rows.map(([label, n]) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[oklch(0.62_0.17_160)] text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 font-semibold">{label}</span>
                <span className="font-black text-[oklch(0.5_0.15_160)]">+{n}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
            <span className="font-semibold text-[oklch(0.5_0.05_290)]">Σύνολο</span>
            <span className="text-lg font-black">+90 🪙</span>
          </div>
        </div>
        <div className={`${pill} absolute bottom-[16%] right-[6%]`}>Εγκρίθηκε από τον γονιό</div>
      </div>
    );
  }

  if (variant === "save") {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-[500px]" aria-hidden>
        <div className="hero-orb absolute inset-[10%] rounded-full" />
        <div className={`${panel} absolute left-[16%] top-[20%] flex w-[64%] flex-col items-center`}>
          <p className="self-start text-xs font-bold uppercase tracking-widest text-[oklch(0.5_0.05_290)]">Στόχος</p>
          <p className="self-start text-lg font-black">Ποδήλατο</p>
          <Ring pct={68} />
          <p className="text-sm font-bold text-[oklch(0.45_0.05_290)]">340 από 500 🪙</p>
          <div className="mt-3 flex h-12 w-full items-end gap-1.5">
            {[30, 45, 25, 60, 50, 70, 65].map((v, i) => (
              <div key={i} className="flex-1 rounded-t bg-[oklch(0.55_0.22_292/0.75)]" style={{ height: `${v}%` }} />
            ))}
          </div>
          <p className="mt-1 self-start text-[11px] text-[oklch(0.55_0.04_290)]">Καταθέσεις ανά εβδομάδα</p>
        </div>
        <div className={`${pill} absolute bottom-[12%] right-[8%]`}>Λείπουν 160 🪙</div>
      </div>
    );
  }

  // home
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[610px]" aria-hidden>
      <div className="hero-orb absolute inset-[8%] rounded-full" />
      <div className={`${panel} absolute right-[6%] top-[14%] w-[56%]`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[oklch(0.5_0.05_290)]">Χαρτοφυλάκιο</p>
          <span className="flex items-center gap-1 text-sm font-black text-[oklch(0.5_0.15_160)]">
            <TrendingUp className="h-4 w-4" /> +4,2%
          </span>
        </div>
        <p className="mt-1 text-2xl font-black">1.240 🪙</p>
        <Chart />
      </div>
      <div className="absolute bottom-[16%] left-[6%] w-[58%] -rotate-[6deg]">
        <KibCard color="midnight" pattern="lines" name="Νίκος Π." coins={185} level={4} />
      </div>
      <div className={`${pill} absolute bottom-[10%] right-[10%]`}>Στόχος · 68%</div>
    </div>
  );
}
