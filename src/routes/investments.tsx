import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Home,
  Minus,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/investments")({
  head: () => ({
    meta: [
      { title: "Επενδύσεις — Kids in Business" },
      { name: "description", content: "Εικονικές μετοχές και startups για παιδιά" },
    ],
  }),
  component: InvestmentsPage,
});

const COINS = 347;

const stocks = [
  { name: "Apple", ticker: "AAPL", emoji: "🍎", price: 85, change: +4.2, owned: 2 },
  { name: "Nike", ticker: "NKE", emoji: "👟", price: 42, change: +1.8, owned: 1 },
  { name: "Spotify", ticker: "SPOT", emoji: "🎵", price: 38, change: -2.1, owned: 0 },
  { name: "Lego", ticker: "LEGO", emoji: "🧱", price: 55, change: +3.5, owned: 1 },
  { name: "Netflix", ticker: "NFLX", emoji: "🎬", price: 72, change: -0.9, owned: 0 },
  { name: "Roblox", ticker: "RBLX", emoji: "🎮", price: 29, change: +6.1, owned: 3 },
];

const startups = [
  {
    name: "GreenBot",
    tagline: "Ρομπότ ανακύκλωσης για σχολεία 🤖",
    emoji: "♻️",
    raised: 680,
    goal: 1000,
    myShares: 5,
    pricePerShare: 10,
    color: "bg-[oklch(0.88_0.12_142)]",
    accent: "oklch(0.45_0.18_142)",
  },
  {
    name: "SnackBox",
    tagline: "Υγιεινά σνακ παράδοσης σε σχολεία 🥗",
    emoji: "🥗",
    raised: 420,
    goal: 800,
    myShares: 0,
    pricePerShare: 15,
    color: "bg-[oklch(0.89_0.11_51)]",
    accent: "oklch(0.55_0.18_37)",
  },
  {
    name: "PetHelper",
    tagline: "App φροντίδας κατοικιδίων για παιδιά 🐾",
    emoji: "🐾",
    raised: 290,
    goal: 600,
    myShares: 2,
    pricePerShare: 20,
    color: "bg-[oklch(0.88_0.1_292)]",
    accent: "oklch(0.5_0.2_292)",
  },
];

type Tab = "stocks" | "startups";

const bottomNav = [
  { label: "Αρχική", to: "/child-dashboard" as const, icon: Home },
  { label: "Μάθε", to: "/learn" as const, icon: BookOpen },
  { label: "Πορτοφόλι", to: "/wallet" as const, icon: Wallet },
  { label: "Στόχοι", to: "/save" as const, icon: Target },
  { label: "Επενδύσεις", to: "/investments" as const, icon: TrendingUp },
];

function MiniSparkline({ positive }: { positive: boolean }) {
  const path = positive
    ? "M0,20 C10,18 20,14 30,10 C40,6 50,8 60,4"
    : "M0,4 C10,6 20,10 30,12 C40,16 50,14 60,20";
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
      <path d={path} stroke={positive ? "oklch(0.55 0.18 142)" : "oklch(0.6 0.2 20)"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InvestmentsPage() {
  const [tab, setTab] = useState<Tab>("stocks");
  const [ownedStocks, setOwnedStocks] = useState<Record<number, number>>(
    Object.fromEntries(stocks.map((s, i) => [i, s.owned]))
  );
  const [startupShares, setStartupShares] = useState<Record<number, number>>(
    Object.fromEntries(startups.map((s, i) => [i, s.myShares]))
  );
  const [sliders, setSliders] = useState<Record<number, number>>({});

  const portfolioValue = stocks.reduce((sum, s, i) => sum + s.price * (ownedStocks[i] ?? 0), 0);
  const portfolioGain = stocks.reduce((sum, s, i) => {
    const owned = ownedStocks[i] ?? 0;
    return sum + s.price * owned * (s.change / 100);
  }, 0);

  const buyStock = (i: number) => {
    const price = stocks[i].price;
    if (COINS >= price) setOwnedStocks((o) => ({ ...o, [i]: (o[i] ?? 0) + 1 }));
  };
  const sellStock = (i: number) => {
    if ((ownedStocks[i] ?? 0) > 0) setOwnedStocks((o) => ({ ...o, [i]: (o[i] ?? 0) - 1 }));
  };

  const investStartup = (i: number) => {
    const shares = sliders[i] ?? 1;
    const cost = shares * startups[i].pricePerShare;
    if (COINS >= cost) setStartupShares((s) => ({ ...s, [i]: (s[i] ?? 0) + shares }));
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <section className="bg-primary px-5 pb-8 pt-6 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <Link to="/child-dashboard" className="flex items-center gap-2 text-sm font-bold text-[oklch(0.86_0.1_292)] mb-6">
            ← Αρχική
          </Link>
          <h1 className="text-3xl font-black">Επενδύσεις 📈</h1>

          {/* Portfolio summary */}
          <div className="mt-5 flex gap-3">
            <div className="flex-1 rounded-2xl bg-[oklch(0.46_0.18_292)] px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">Αξία Portfolio</p>
              <p className="mt-1 text-2xl font-black">🪙 {portfolioValue}</p>
            </div>
            <div className={`flex-1 rounded-2xl px-4 py-3 ${portfolioGain >= 0 ? "bg-[oklch(0.76_0.15_173)]" : "bg-[oklch(0.85_0.08_20)]"}`}>
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.35_0.12_175)]">Κέρδος σήμερα</p>
              <p className={`mt-1 text-2xl font-black ${portfolioGain >= 0 ? "text-[oklch(0.25_0.1_175)]" : "text-destructive"}`}>
                {portfolioGain >= 0 ? "+" : ""}{portfolioGain.toFixed(0)} 🪙
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-4 sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="flex rounded-xl bg-secondary p-1">
            {(["stocks", "startups"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-black transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {t === "stocks" ? "📊 Μετοχές" : "🚀 Startups"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-3 px-5 pt-4 sm:px-8">
        {/* STOCKS TAB */}
        {tab === "stocks" && (
          <>
            <p className="text-xs text-muted-foreground px-1">Εικονικές τιμές · Ανανεώνονται κάθε μέρα</p>
            {stocks.map((stock, i) => {
              const owned = ownedStocks[i] ?? 0;
              const positive = stock.change >= 0;
              return (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4 ring-1 ring-border">
                  <span className="text-3xl">{stock.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black">{stock.name}</p>
                      <span className="text-xs text-muted-foreground">{stock.ticker}</span>
                    </div>
                    <p className={`mt-0.5 text-sm font-bold flex items-center gap-1 ${positive ? "text-[oklch(0.45_0.18_142)]" : "text-destructive"}`}>
                      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {positive ? "+" : ""}{stock.change}% σήμερα
                    </p>
                  </div>
                  <MiniSparkline positive={positive} />
                  <div className="text-right">
                    <p className="text-sm font-black">{stock.price} 🪙</p>
                    {owned > 0 && <p className="text-xs text-muted-foreground">Έχεις: {owned}</p>}
                    <div className="mt-1 flex items-center gap-1">
                      <button onClick={() => sellStock(i)} disabled={owned === 0} className="grid h-7 w-7 place-items-center rounded-full border border-border disabled:opacity-30 hover:bg-secondary">
                        <Minus size={12} />
                      </button>
                      <button onClick={() => buyStock(i)} className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* STARTUPS TAB */}
        {tab === "startups" && (
          <>
            <p className="text-xs text-muted-foreground px-1">Γίνε μέτοχος σε ελληνικές παιδικές startups!</p>
            {startups.map((startup, i) => {
              const fundingPercent = Math.round((startup.raised / startup.goal) * 100);
              const myShares = startupShares[i] ?? 0;
              const sliderVal = sliders[i] ?? 1;
              const cost = sliderVal * startup.pricePerShare;
              return (
                <div key={i} className={`rounded-2xl ${startup.color} p-5 ring-1 ring-border`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{startup.emoji}</span>
                        <p className="text-lg font-black">{startup.name}</p>
                      </div>
                      <p className="mt-1 text-sm font-bold text-muted-foreground">{startup.tagline}</p>
                    </div>
                    {myShares > 0 && (
                      <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-black" style={{ color: startup.accent }}>
                        {myShares} μετοχές σου
                      </span>
                    )}
                  </div>

                  {/* Funding bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Χρηματοδότηση</span>
                      <span>{fundingPercent}% · {startup.raised}/{startup.goal} 🪙</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/50">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fundingPercent}%` }} />
                    </div>
                  </div>

                  {/* Buy shares */}
                  <div className="mt-4 rounded-xl bg-white/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black">Αγόρα μετοχών</p>
                      <p className="text-sm font-black" style={{ color: startup.accent }}>{startup.pricePerShare} 🪙 / μετοχή</p>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => setSliders((s) => ({ ...s, [i]: Math.max(1, (s[i] ?? 1) - 1) }))} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-white hover:bg-secondary">
                        <Minus size={14} />
                      </button>
                      <div className="flex-1 text-center">
                        <p className="text-xl font-black">{sliderVal}</p>
                        <p className="text-xs text-muted-foreground">μετοχές · {cost} 🪙</p>
                      </div>
                      <button onClick={() => setSliders((s) => ({ ...s, [i]: (s[i] ?? 1) + 1 }))} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus size={14} />
                      </button>
                    </div>
                    <Button
                      onClick={() => investStartup(i)}
                      disabled={COINS < cost}
                      className="mt-3 h-10 w-full rounded-full"
                    >
                      {COINS >= cost ? `Γίνε μέτοχος · ${cost} 🪙` : "Δεν φτάνουν τα coins"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-3 shadow-lg">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/investments";
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-black ${isActive ? "text-primary" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
