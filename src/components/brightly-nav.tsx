import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BrightlyNavProps = {
  active?: "pricing" | "earn" | "spend" | "save" | "invest" | "learn" | "dashboard";
  tone?: "light" | "dark";
};

const navigation = [
  { label: "Ξ¤ΞΉΞΌΞ­Ο‚", to: "/pricing" as const, key: "pricing" },
  { label: "ΞΞ­ΟΞ΄Ξ·", to: "/earn" as const, key: "earn" },
  { label: "Ξ”Ξ±Ο€Ξ¬Ξ½ΞµΟ‚", to: "/spend" as const, key: "spend" },
  { label: "Ξ‘Ο€ΞΏΟ„Ξ±ΞΌΞ―ΞµΟ…ΟƒΞ·", to: "/save" as const, key: "save" },
  { label: "Ξ•Ο€ΞµΞ½Ξ΄ΟΟƒΞµΞΉΟ‚", to: "/invest" as const, key: "invest" },
  { label: "ΞΞ±ΞΈΞ®ΞΌΞ±Ο„Ξ±", to: "/learn" as const, key: "learn" },
];

export function BrightlyNav({ active, tone = "dark" }: BrightlyNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = tone === "dark";
  const navText = dark ? "text-primary-foreground" : "text-foreground";
  const menuButton = dark
    ? "text-primary-foreground hover:bg-primary/20"
    : "text-foreground hover:bg-secondary";

  return (
    <header className={`relative z-30 flex items-center justify-between gap-6 ${navText}`}>
      <Link className="flex items-center gap-2 text-2xl font-black tracking-tight" to="/" aria-label="Kids in Business Ξ±ΟΟ‡ΞΉΞΊΞ®">
        <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-xl leading-none text-primary-foreground">π™</span>
        <span>Kids in Business</span>
      </Link>
      <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="ΞΟΟΞΉΞ± Ο€Ξ»ΞΏΞ®Ξ³Ξ·ΟƒΞ·">
        {navigation.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={active === item.key ? "font-black underline decoration-2 underline-offset-8" : "transition-opacity hover:opacity-70"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="hidden items-center gap-7 lg:flex">
        <Link className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70" to="/parent-dashboard"><LayoutDashboard size={16} /> Ξ Ξ―Ξ½Ξ±ΞΊΞ±Ο‚</Link>
        <Link className="text-sm transition-opacity hover:opacity-70" to="/login">Ξ£ΟΞ½Ξ΄ΞµΟƒΞ·</Link>
        <Link to="/signup" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">ΞΞµΞΊΞ―Ξ½Ξ± Ο„ΟΟΞ±</Link>
      </div>
      <Button onClick={() => setMenuOpen((open) => !open)} variant="ghost" size="icon" className={`lg:hidden ${menuButton}`} aria-label="Ξ†Ξ½ΞΏΞΉΞ³ΞΌΞ± ΞΌΞµΞ½ΞΏΟ">
        {menuOpen ? <X /> : <Menu />}
      </Button>
      {menuOpen ? (
        <nav className="absolute right-0 top-16 grid w-60 gap-1 rounded-lg bg-card p-4 text-card-foreground shadow-xl lg:hidden" aria-label="Ξ Ξ»ΞΏΞ®Ξ³Ξ·ΟƒΞ· ΞΊΞΉΞ½Ξ·Ο„ΞΏΟ">
          <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 font-bold hover:bg-secondary">Ξ‘ΟΟ‡ΞΉΞΊΞ®</Link>
          {navigation.map((item) => (
            <Link key={item.key} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-secondary">
              {item.label}
            </Link>
          ))}
          <Link to="/parent-dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-secondary"><LayoutDashboard size={16} /> Ξ Ξ―Ξ½Ξ±ΞΊΞ±Ο‚ Ξ³ΞΏΞ½Ξ­Ξ±</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-secondary">Ξ£ΟΞ½Ξ΄ΞµΟƒΞ·</Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-primary px-3 py-3 text-center font-bold text-primary-foreground">ΞΞµΞΊΞ―Ξ½Ξ± Ο„ΟΟΞ±</Link>
        </nav>
      ) : null}
    </header>
  );
}

