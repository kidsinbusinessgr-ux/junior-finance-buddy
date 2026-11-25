import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Home, Target, TrendingUp, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChild, useCurrentUser } from "@/hooks/useJFB";
import { getStockQuotes, KID_STOCKS, type StockQuote } from "@/lib/stocks.functions";
import { MyStartupInvestments } from "@/components/startup-investors";
import { stageFor } from "@/lib/startup-stages";

// The child's investment hub: what they hold in real stocks (/stocks) and in
// other children's startups (/startups), their own startups, and the way in.
// (This page used to sell made-up stocks at fixed prices; those were refunded.)

export const Route = createFileRoute("/investments")({
  head: () => ({
    meta: [
      { title: "Επενδύσεις – Kids in Business" },
      { name: "description", content: "Οι μετοχές και τα startups σου σε ένα σημείο" },
    ],
  }),
  component: InvestmentsPage,
});

// Same rate as the stocks page: 1 coin = €0.10.
const COIN_TO_EUR = 0.1;

const bottomNav = [
  { label: "Αρχική", to: "/child-dashboard" as const, icon: Home },
  { label: "Μάθε", to: "/learn" as const, icon: BookOpen },
  { label: "Πορτοφόλι", to: "/wallet" as const, icon: Wallet },
  { label: "Στόχοι", to: "/goals" as const, icon: Target },
  { label: "Επενδύσεις", to: "/investments" as const, icon: TrendingUp },
];

type MarketHolding = { ticker: string; shares: number; coins_invested: number };
type OwnStartup = { id: string; name: string; emoji: string; valuation: number; last_decision_date: string | null; ceo_streak: number };

const fmt = (n: number) => n.toLocaleString("el-GR");

function InvestmentsPage() {
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useCurrentUser();
  const { child, loading: childLoading } = useChild();
  const [holdings, setHoldings] = useState<MarketHolding[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [ownStartups, setOwnStartups] = useState<OwnStartup[]>([]);
  const [pledged, setPledged] = useState(0);

  useEffect(() => {
    if (!authLoading && !userId) navigate({ to: "/login" });
    else if (userId && !childLoading && !child) navigate({ to: "/onboarding" });
  }, [authLoading, userId, childLoading, child, navigate]);

  useEffect(() => {
    if (!child) return;
    supabase
      .from("jfb_market_holdings" as never)
      .select("ticker, shares, coins_invested")
      .eq("child_id", child.id)
      .then(({ data }) => setHoldings((data ?? []) as unknown as MarketHolding[]));
    supabase
      .from("startups")
      .select("id, name, emoji, valuation, last_decision_date, ceo_streak")
      .eq("child_id" as never, child.id as never)
      .then(({ data }) => setOwnStartups((data ?? []) as unknown as OwnStartup[]));
    supabase
      .from("jfb_round_pledges" as never)
      .select("coins")
      .eq("child_id", child.id)
      .eq("status", "pending")
      .then(({ data }) => setPledged(((data ?? []) as { coins: number }[]).reduce((s, r) => s + r.coins, 0)));
    getStockQuotes().then((res) => setQuotes(res.quotes)).catch(() => {});
  }, [child?.id]);

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-black text-muted-foreground">Φόρτωση επενδύσεων…</p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const stockRows = holdings.map((h) => {
    const q = quotes.find((x) => x.ticker === h.ticker);
    const meta = KID_STOCKS.find((s) => s.ticker === h.ticker);
    const value = q ? Math.round((Number(h.shares) * q.price) / COIN_TO_EUR) : h.coins_invested;
    return { ...h, name: meta?.name ?? h.ticker, emoji: meta?.emoji ?? "📈", value, gain: value - h.coins_invested };
  });
  const stockValue = stockRows.reduce((s, r) => s + r.value, 0);
  const stockGain = stockRows.reduce((s, r) => s + r.gain, 0);

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      <header className="bg-[oklch(0.46_0.18_292)] px-5 pb-8 pt-6 text-primary-foreground">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-black">Επενδύσεις</h1>
          <p className="mt-1 text-sm font-bold opacity-90">
            🪙 {fmt(child.coins)} coins
            {child.invest_capital > 0 && <> · 🚀 {fmt(child.invest_capital)} επενδυτικά</>}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        {/* The two ways to invest */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/stocks" className="rounded-2xl border-2 border-[oklch(0.55_0.17_173)] bg-[oklch(0.96_0.04_173)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-2xl">📈</p>
            <p className="mt-2 text-lg font-black">Αληθινές μετοχές</p>
            <p className="mt-1 text-sm text-muted-foreground">25 γνωστές εταιρείες με πραγματικές τιμές αγοράς.</p>
            <p className="mt-3 text-sm font-black text-[oklch(0.4_0.12_173)]">Δες τις μετοχές →</p>
          </Link>
          <Link to="/startups" className="rounded-2xl border-2 border-[oklch(0.57_0.23_292)] bg-[oklch(0.96_0.03_292)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-2xl">🚀</p>
            <p className="mt-2 text-lg font-black">Startups φίλων</p>
            <p className="mt-1 text-sm text-muted-foreground">Επένδυσε στις ιδέες άλλων παιδιών και δες αν θα πετύχουν.</p>
            <p className="mt-3 text-sm font-black text-[oklch(0.45_0.2_292)]">Δες τα startups →</p>
          </Link>
        </div>

        {/* Own startups */}
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-black">Τα startups μου</h2>
            {ownStartups.length < 3 && (
              <Link to="/build" className="text-sm font-black text-[oklch(0.45_0.2_292)]">+ Φτιάξε νέο</Link>
            )}
          </div>
          {ownStartups.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Δεν έχεις ακόμα startup. Φτιάξε το δικό σου και πάρε μια απόφαση κάθε μέρα.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {ownStartups.map((s) => {
                const { stage } = stageFor(s.valuation);
                const waiting = s.last_decision_date !== today;
                return (
                  <Link key={s.id} to="/startups/$id" params={{ id: s.id }}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm hover:bg-muted">
                    <span className="font-bold">{s.emoji} {s.name} · {stage.emoji} {stage.name}</span>
                    <span className="text-right">
                      <span className="font-black">🪙 {fmt(s.valuation)}</span>
                      {waiting && <span className="ml-2 rounded-full bg-[oklch(0.95_0.08_70)] px-2 py-0.5 text-xs font-black text-[oklch(0.45_0.14_60)]">Απόφαση σε περιμένει</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Real stocks */}
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-black">Οι μετοχές μου</h2>
            {stockRows.length > 0 && (
              <p className={`text-sm font-black ${stockGain >= 0 ? "text-green-700" : "text-red-600"}`}>
                Αξία 🪙 {fmt(stockValue)} ({stockGain >= 0 ? "+" : ""}{fmt(stockGain)})
              </p>
            )}
          </div>
          {stockRows.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Δεν έχεις ακόμα μετοχές. <Link to="/stocks" className="font-black text-[oklch(0.4_0.12_173)]">Διάλεξε την πρώτη σου →</Link>
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {stockRows.map((r) => (
                <Link key={r.ticker} to="/stocks" className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm hover:bg-muted">
                  <span className="font-bold">{r.emoji} {r.name}</span>
                  <span>
                    <span className="font-black">🪙 {fmt(r.value)}</span>{" "}
                    <span className={`text-xs font-bold ${r.gain >= 0 ? "text-green-700" : "text-red-600"}`}>({r.gain >= 0 ? "+" : ""}{r.gain})</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Startup stakes */}
        {pledged > 0 && (
          <p className="rounded-2xl border-2 border-dashed border-[oklch(0.75_0.17_70)] bg-[oklch(0.98_0.03_80)] px-5 py-4 text-sm font-bold">
            ⏳ Έχεις δεσμεύσει 🪙 {fmt(pledged)} σε γύρους χρηματοδότησης. Αν πετύχουν, γίνονται μερίδια· αν όχι, σου επιστρέφονται.
          </p>
        )}
        <MyStartupInvestments childId={child.id} />

        <p className="text-center text-xs text-muted-foreground">
          💡 Μοίρασε τα κέρματά σου σε διαφορετικές επενδύσεις. Αν μία πάει άσχημα, οι άλλες σε προστατεύουν.
        </p>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-3 shadow-lg">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/investments";
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
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
