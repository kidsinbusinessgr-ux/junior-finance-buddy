import { createServerFn } from "@tanstack/react-start";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";

export const KID_STOCKS = [
  { ticker: "AAPL", name: "Apple", emoji: "🍎", color: "#6E6E73" },
  { ticker: "NFLX", name: "Netflix", emoji: "🎬", color: "#E50914" },
  { ticker: "RBLX", name: "Roblox", emoji: "🎮", color: "#E8202A" },
  { ticker: "DIS", name: "Disney", emoji: "🐭", color: "#1B3F8B" },
  { ticker: "NKE", name: "Nike", emoji: "👟", color: "#111111" },
  { ticker: "MCD", name: "McDonald's", emoji: "🍔", color: "#FFC72C" },
  { ticker: "SPOT", name: "Spotify", emoji: "🎵", color: "#1DB954" },
  { ticker: "SBUX", name: "Starbucks", emoji: "☕", color: "#00704A" },
  { ticker: "SNAP", name: "Snapchat", emoji: "👻", color: "#FFFC00" },
  { ticker: "TSLA", name: "Tesla", emoji: "⚡", color: "#CC0000" },
] as const;

export type KidTicker = (typeof KID_STOCKS)[number]["ticker"];

export interface StockQuote {
  ticker: string;
  name: string;
  emoji: string;
  color: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

export interface StockHistory {
  ticker: string;
  history: { date: string; close: number }[];
}

function getKey() {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set");
  return key;
}

export const getStockQuotes = createServerFn({ method: "GET" }).handler(
  async () => {
    const key = getKey();
    const tickers = KID_STOCKS.map((s) => s.ticker).join(",");
    const res = await fetch(
      `${FMP_BASE}/quote/${tickers}?apikey=${key}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`FMP quote error: ${res.status}`);
    const data = await res.json();

    // Merge FMP data with our kid-friendly metadata
    const quotes: StockQuote[] = KID_STOCKS.map((meta) => {
      const fmp = data.find((d: { symbol: string }) => d.symbol === meta.ticker);
      return {
        ticker: meta.ticker,
        name: meta.name,
        emoji: meta.emoji,
        color: meta.color,
        price: fmp?.price ?? 0,
        change: fmp?.change ?? 0,
        changePercent: fmp?.changesPercentage ?? 0,
        marketCap: fmp?.marketCap ?? 0,
      };
    });

    return { quotes, fetchedAt: new Date().toISOString() };
  }
);

export const getStockHistory = createServerFn({ method: "GET" })
  .validator((ticker: string) => ticker)
  .handler(async ({ data: ticker }) => {
    const key = getKey();
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const res = await fetch(
      `${FMP_BASE}/historical-price-full/${ticker}?from=${from}&to=${to}&apikey=${key}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`FMP history error: ${res.status}`);
    const data = await res.json();

    const history: { date: string; close: number }[] = (
      data.historical ?? []
    )
      .slice(0, 30)
      .reverse()
      .map((d: { date: string; close: number }) => ({
        date: d.date,
        close: d.close,
      }));

    return { ticker, history } as StockHistory;
  });
