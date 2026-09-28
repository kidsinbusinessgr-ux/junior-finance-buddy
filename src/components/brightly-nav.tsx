import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BrightlyNavProps = {
  active?: "pricing" | "earn" | "spend" | "save" | "invest" | "learn";
  tone?: "light" | "dark";
};

const navigation = [
  { label: "Plans & pricing", to: "/pricing" as const, key: "pricing" },
  { label: "Earn", to: "/earn" as const, key: "earn" },
  { label: "Spend", to: "/spend" as const, key: "spend" },
  { label: "Save", to: "/save" as const, key: "save" },
  { label: "Invest", to: "/invest" as const, key: "invest" },
  { label: "Learn", to: "/learn" as const, key: "learn" },
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
      <Link className="flex items-center gap-1 text-3xl font-black tracking-tight" to="/" aria-label="Brightly home">
        <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-lg leading-none text-primary-foreground">∞</span>
        brightly
      </Link>
      <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Primary navigation">
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
        <Link className="text-sm transition-opacity hover:opacity-70" to="/login">Login</Link>
        <Link to="/signup" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Get started</Link>
      </div>
      <Button onClick={() => setMenuOpen((open) => !open)} variant="ghost" size="icon" className={`lg:hidden ${menuButton}`} aria-label="Open menu">
        {menuOpen ? <X /> : <Menu />}
      </Button>
      {menuOpen ? (
        <nav className="absolute right-0 top-16 grid w-60 gap-1 rounded-lg bg-card p-4 text-card-foreground shadow-xl lg:hidden" aria-label="Mobile navigation">
          <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 font-bold hover:bg-secondary">Home</Link>
          {navigation.map((item) => (
            <Link key={item.key} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-secondary">
              {item.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-secondary">Login</Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-primary px-3 py-3 text-center font-bold text-primary-foreground">Get started</Link>
        </nav>
      ) : null}
    </header>
  );
}