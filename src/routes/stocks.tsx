import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrightlyNav } from "@/components/brightly-nav";
import {
  getStockQuotes,
  getStockHistory,
  KID_STOCKS,
  type StockQuote,
  type StockHistory,
} from "@/lib/stocks.functions";

export const Route = createFileRoute("/stocks")({
  head: () => ({
    meta: [
      { title: "Επενδύσεις — Kids in Business" },
      {
        name: "description",
        content:
          "Μάθε τι είναι οι μετοχές και επένδυσε τα εικονικά νομίσματά σου σε εταιρίες που αγαπάς.",
      },
    ],
  }),
  component: StocksPage,
});

// ─── Lesson content ───────────────────────────────────────────────────────────
const LESSON_CARDS = [
  {
    icon: "🏢",
    title: "Τι είναι μετοχή;",
    body: "Φαντάσου ότι η Apple είναι μια τεράστια πίτσα. Η μετοχή είναι ένα κομμάτι αυτής της πίτσας. Αν αγοράσεις ένα κομμάτι, γίνεσαι μέτοχος — δηλαδή συν-ιδιοκτήτης της εταιρίας!",
  },
  {
    icon: "📈",
    title: "Πώς κερδίζεις;",
    body: "Αν η εταιρία πάει καλά (πουλάει περισσότερα προϊόντα, κάνει περισσότερα κέρδη), η αξία της μετοχής ανεβαίνει. Αγόρασες στα €10 → ανέβηκε στα €15 → κέρδισες €5!",
  },
  {
    icon: "📉",
    title: "Πώς χάνεις;",
    body: "Αν η εταιρία αντιμετωπίσει προβλήματα, η τιμή πέφτει. Γι' αυτό μην βάζεις ποτέ ΟΛΑ σου τα χρήματα σε μία μόνο εταιρία — μοίρασε τον κίνδυνο!",
  },
  {
    icon: "🛡️",
    title: "Τι είναι διαφοροποίηση;",
    body: "Αντί να βάλεις 100€ σε Apple, βάλε 20€ σε 5 διαφορετικές εταιρίες. Αν μία πάει άσχημα, οι άλλες σε σώζουν. Αυτό λέγεται διαφοροποίηση!",
  },
  {
    icon: "⏳",
    title: "Η δύναμη του χρόνου",
    body: "Οι μακροπρόθεσμοι επενδυτές κερδίζουν περισσότερο. Αν ο Warren Buffett (ο πιο διάσημος επενδυτής) είχε βγάλει τα χρήματά του στα 30, δεν θα ήταν σχεδόν πλούσιος σήμερα.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 2) {
  return n.toLocaleString("el-GR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("el-GR", { day: "numeric", month: "short" });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = ["📚 Μάθε", "📊 Αγορά", "💼 Χαρτοφυλάκιο"] as const;
type Tab = (typeof TABS)[number];

interface Holding {
  ticker: string;
  coinsInvested: number;
  buyPrice: number;
  shares: number;
}

const COIN_TO_EUR = 0.1;

function StocksPage() {
  const [tab, setTab] = useState<Tab>("📚 Μάθε");
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [history, setHistory] = useState<StockHistory | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string>("AAPL");
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [coins, setCoins] = useState(500);
  const [investInput, setInvestInput] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    fetchHistory(selectedTicker);
  }, [selectedTicker]);

  async function fetchQuotes() {
    setLoadingQuotes(true);
    try {
      const res = await getStockQuotes();
      setQuotes(res.quotes);
    } catch {
      // silently handle
    } finally {
      setLoadingQuotes(false);
    }
  }

  async function fetchHistory(ticker: string) {
    setLoadingHistory(true);
    try {
      const res = await getStockHistory({ data: ticker });
      setHistory(res);
    } catch {
      // silently handle
    } finally {
      setLoadingHistory(false);
    }
  }

  function handleInvest(ticker: string) {
    const amount = investInput[ticker] ?? 0;
    if (amount <= 0) return;
    if (amount > coins) {
      showToast("Δεν έχεις αρκετά νομίσματα!");
      return;
    }
    const quote = quotes.find((q) => q.ticker === ticker);
    if (!quote || quote.price <= 0) return;

    const eurAmount = amount * COIN_TO_EUR;
    const shares = eurAmount / quote.price;

    setPortfolio((prev) => {
      const existing = prev.find((h) => h.ticker === ticker);
      if (existing) {
        return prev.map((h) =>
          h.ticker === ticker
            ? {
                ...h,
                coinsInvested: h.coinsInvested + amount,
                shares: h.shares + shares,
                buyPrice: (h.buyPrice * h.shares + quote.price * shares) / (h.shares + shares),
              }
            : h
        );
      }
      return [...prev, { ticker, coinsInvested: amount, buyPrice: quote.price, shares }];
    });
    setCoins((c) => c - amount);
    setInvestInput((prev) => ({ ...prev, [ticker]: 0 }));
    showToast(`✅ Επένδυσες ${amount} 🪙 στην ${quote.name}!`);
  }

  function handleSell(ticker: string) {
    const holding = portfolio.find((h) => h.ticker === ticker);
    if (!holding) return;
    const quote = quotes.find((q) => q.ticker === ticker);
    const currentValue = quote
      ? (holding.shares * quote.price) / COIN_TO_EUR
      : holding.coinsInvested;
    setCoins((c) => c + Math.round(currentValue));
    setPortfolio((prev) => prev.filter((h) => h.ticker !== ticker));
    showToast(`💰 Πούλησες τις μετοχές σου!`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const portfolioValue = portfolio.reduce((sum, h) => {
    const q = quotes.find((q) => q.ticker === h.ticker);
    return sum + (q ? (h.shares * q.price) / COIN_TO_EUR : h.coinsInvested);
  }, 0);

  const totalInvested = portfolio.reduce((s, h) => s + h.coinsInvested, 0);
  const totalPnL = portfolioValue - totalInvested;

  return (
    <main className="min-h-screen bg-background">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-6 py-3 text-sm font-black text-background shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero */}
      <section className="bg-[oklch(0.22_0.05_260)] px-6 pb-16 pt-5 text-white lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="invest" />
          <div className="mx-auto max-w-2xl pb-2 pt-16 text-center">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.75_0.12_260)]">
              Επενδύσεις
            </p>
            <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">
              Μάθε. Επένδυσε.<br />Δες πώς μεγαλώνουν.
            </h1>
            <p className="mt-5 text-lg text-[oklch(0.85_0.04_260)]">
              Αληθινές τιμές αγοράς · Εικονικά νομίσματα · 100% εκπαιδευτικό
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-black">
              <span className="text-xl">🪙</span>
              <span>{coins} νομίσματα διαθέσιμα</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-black transition-colors ${
                tab === t
                  ? "border-b-2 border-[oklch(0.57_0.23_292)] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">

        {/* ── TAB 1: Μάθε ── */}
        {tab === "📚 Μάθε" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-black">Τι είναι οι μετοχές;</h2>
              <p className="mt-2 text-muted-foreground">
                5 βασικές έννοιες που κάθε νέος επενδυτής πρέπει να ξέρει
              </p>
            </div>

            {LESSON_CARDS.map((card, i) => (
              <div key={i} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{card.icon}</span>
                  <div>
                    <h3 className="text-lg font-black">{card.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{card.body}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-[oklch(0.22_0.05_260)] p-6 text-white">
              <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.75_0.12_260)]">
                Ήξερες ότι…
              </p>
              <p className="mt-3 text-lg font-semibold leading-relaxed">
                Αν είχες αγοράσει μετοχές Apple αξίας €1.000 το 2010, σήμερα θα άξιζαν πάνω από{" "}
                <span className="font-black text-[oklch(0.8_0.15_150)]">€15.000</span>. 📱
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setTab("📊 Αγορά")}
                className="h-12 rounded-full px-10 font-black"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                Δες τις μετοχές →
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 2: Αγορά ── */}
        {tab === "📊 Αγορά" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Εταιρίες που ξέρεις</h2>
              <button
                onClick={fetchQuotes}
                disabled={loadingQuotes}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-black text-muted-foreground hover:text-foreground"
              >
                <RefreshCw size={12} className={loadingQuotes ? "animate-spin" : ""} />
                Ανανέωση
              </button>
            </div>

            {loadingQuotes && (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[oklch(0.57_0.23_292)] border-t-transparent" />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {quotes.map((q) => {
                const isUp = q.changePercent >= 0;
                const isSelected = selectedTicker === q.ticker;
                return (
                  <div
                    key={q.ticker}
                    onClick={() => setSelectedTicker(q.ticker)}
                    className={`cursor-pointer rounded-2xl p-4 ring-1 transition-all ${
                      isSelected
                        ? "bg-[oklch(0.96_0.02_260)] ring-[oklch(0.57_0.23_292)]"
                        : "bg-card ring-border hover:ring-[oklch(0.57_0.23_292)/50]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                          style={{ background: q.color + "22" }}
                        >
                          {q.emoji}
                        </span>
                        <div>
                          <p className="font-black">{q.name}</p>
                          <p className="text-xs text-muted-foreground">{q.ticker}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black">${fmt(q.price)}</p>
                        <p
                          className={`flex items-center gap-0.5 text-xs font-black ${
                            isUp ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {isUp ? "+" : ""}
                          {fmt(q.changePercent, 2)}%
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="mt-4 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          min={0}
                          max={coins}
                          value={investInput[q.ticker] ?? ""}
                          onChange={(e) =>
                            setInvestInput((prev) => ({
                              ...prev,
                              [q.ticker]: Number(e.target.value),
                            }))
                          }
                          placeholder="Νομίσματα 🪙"
                          className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                        />
                        <Button
                          onClick={() => handleInvest(q.ticker)}
                          className="h-9 rounded-xl px-4 text-xs font-black"
                          style={{ background: "oklch(0.57 0.23 292)" }}
                        >
                          Επένδυσε
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedTicker && (
              <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-black">
                      {KID_STOCKS.find((s) => s.ticker === selectedTicker)?.emoji}{" "}
                      {KID_STOCKS.find((s) => s.ticker === selectedTicker)?.name} — 30 ημέρες
                    </p>
                    <p className="text-xs text-muted-foreground">Πραγματικές τιμές κλεισίματος</p>
                  </div>
                  {loadingHistory && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[oklch(0.57_0.23_292)] border-t-transparent" />
                  )}
                </div>

                {history && history.history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history.history}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={fmtDate}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                        width={55}
                      />
                      <Tooltip
                        formatter={(v: number) => [`$${fmt(v)}`, "Τιμή"]}
                        labelFormatter={fmtDate}
                      />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke={
                          KID_STOCKS.find((s) => s.ticker === selectedTicker)?.color ??
                          "oklch(0.57 0.23 292)"
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  !loadingHistory && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Δεν βρέθηκαν δεδομένα γραφήματος.
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Χαρτοφυλάκιο ── */}
        {tab === "💼 Χαρτοφυλάκιο" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Αξία χαρτοφυλακίου
                </p>
                <p className="mt-2 text-3xl font-black">{Math.round(portfolioValue)} 🪙</p>
              </div>
              <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Κέρδος / Ζημιά
                </p>
                <p
                  className={`mt-2 text-3xl font-black ${
                    totalPnL >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}
                  {Math.round(totalPnL)} 🪙
                </p>
              </div>
              <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Διαθέσιμα νομίσματα
                </p>
                <p className="mt-2 text-3xl font-black">{coins} 🪙</p>
              </div>
            </div>

            {portfolio.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-5xl">📭</p>
                <p className="mt-4 text-lg font-black">Δεν έχεις μετοχές ακόμα</p>
                <p className="mt-2 text-muted-foreground">
                  Πήγαινε στην καρτέλα Αγορά και επένδυσε τα νομίσματά σου!
                </p>
                <Button
                  onClick={() => setTab("📊 Αγορά")}
                  className="mt-6 rounded-full px-8 font-black"
                  style={{ background: "oklch(0.57 0.23 292)" }}
                >
                  Αγορά μετοχών →
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-black">Οι μετοχές μου</h2>
                {portfolio.map((h) => {
                  const q = quotes.find((q) => q.ticker === h.ticker);
                  const meta = KID_STOCKS.find((s) => s.ticker === h.ticker);
                  const currentCoins = q
                    ? Math.round((h.shares * q.price) / COIN_TO_EUR)
                    : h.coinsInvested;
                  const pnl = currentCoins - h.coinsInvested;
                  const pnlPct =
                    h.coinsInvested > 0
                      ? ((currentCoins - h.coinsInvested) / h.coinsInvested) * 100
                      : 0;

                  return (
                    <div key={h.ticker} className="rounded-2xl bg-card p-5 ring-1 ring-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                            style={{ background: (meta?.color ?? "#888") + "22" }}
                          >
                            {meta?.emoji}
                          </span>
                          <div>
                            <p className="font-black">{meta?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {h.shares.toFixed(4)} μετοχές · Αγορά ${fmt(h.buyPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black">{currentCoins} 🪙</p>
                          <p
                            className={`text-xs font-black ${
                              pnl >= 0 ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {Math.round(pnl)} 🪙 ({pnl >= 0 ? "+" : ""}
                            {fmt(pnlPct, 1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => handleSell(h.ticker)}
                          variant="outline"
                          className="h-8 rounded-xl px-4 text-xs font-black"
                        >
                          Πώλησε
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
              <p className="font-black text-foreground">📌 Υπενθύμιση</p>
              <p className="mt-1.5 leading-relaxed">
                Αυτό είναι <strong>εκπαιδευτική προσομοίωση</strong> με εικονικά νομίσματα. Οι τιμές
                είναι πραγματικές, αλλά δεν γίνεται καμία πραγματική αγοραπωλησία. Για να επενδύσεις
                πραγματικά χρήματα χρειάζεσαι ηλικία 18+ και λογαριασμό χρηματιστηρίου.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
