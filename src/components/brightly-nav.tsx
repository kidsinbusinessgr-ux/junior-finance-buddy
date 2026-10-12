import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-kidsinbusiness.png";

type BrightlyNavProps = {
  active?: "pricing" | "earn" | "spend" | "save" | "invest" | "learn" | "dashboard";
  tone?: "light" | "dark";
};

const navigation = [
  { label: "Τιμές", to: "/pricing" as const, key: "pricing" },
  { label: "Κέρδη", to: "/earn" as const, key: "earn" },
  { label: "Δαπάνες", to: "/spend" as const, key: "spend" },
  { label: "Αποταμίευση", to: "/save" as const, key: "save" },
  { label: "Επενδύσεις", to: "/invest" as const, key: "invest" },
  { label: "Μαθήματα", to: "/learn" as const, key: "learn" },
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
      <Link to="/" aria-label="Kids in Business αρχική">
        <img src={logoImg} alt="Kids in Business" className="h-10 w-auto" />
      </Link>
      <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Κύρια πλοήγηση">
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
        <Link className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70" to="/parent-dashboard"><LayoutDashboard size={16} /> Πίνακας</Link>
        <Link className="text-sm transition-opacity hover:opacity-70" to="/login">Σύνδεση</Link>
        <Link to="/signup" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Ξεκίνα τώρα</Link>
      </div>
      <Button onClick={() => setMenuOpen((open) => !open)} variant="ghost" size="icon" className={`lg:hidden ${menuButton}`} aria-label="Άνοιγμα μενού">
        {menuOpen ? <X /> : <Menu />}
      </Button>
      {menuOpen ? (
        <nav className="absolute right-0 top-16 grid w-60 gap-1 rounded-lg bg-card p-4 text-card-foreground shadow-xl lg:hidden" aria-label="Πλοήγηση κινητού">
          <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 font-bold hover:bg-secondary">Αρχική</Link>
          {navigation.map((item) => (
            <Link key={item.key} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-secondary">
              {item.label}
            </Link>
          ))}
          <Link to="/parent-dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-secondary"><LayoutDashboard size={16} /> Πίνακας γονέα</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 hover:bg-secondary">Σύνδεση</Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full bg-primary px-3 py-3 text-center font-bold text-primary-foreground">Ξεκίνα τώρα</Link>
        </nav>
      ) : null}
    </header>
  );
}

