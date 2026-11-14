// Market data from FMP, stored in jfb_market_cache and shared by everyone.
// The free FMP plan allows about 250 calls a day, so each entry is refreshed
// at most every few hours (only one server request refreshes at a time), and
// when a refresh fails the last known values are kept instead of showing 0.

import { getAdminClient } from "./supabase-admin.server";
import { KID_STOCKS } from "./stocks.functions";

const FMP_BASE = "https://financialmodelingprep.com/stable";
const HOUR = 60 * 60 * 1000;

export type StoredQuote = {
  price: number; // USD
  change: number; // USD
  changePercent: number;
  marketCap: number;
  at: string; // when FMP gave this price
};

type QuotesData = {
  quotes: Record<string, StoredQuote>;
  // Tickers the plan doesn't include (HTTP 402), with when we last asked.
  blocked: Record<string, string>;
};

// Extra tickers asked once, to learn which ones the free plan includes.
// They're stored but not shown on the page.
export const PROBE_TICKERS = ["KO", "PEP", "SONY", "MAT", "HAS", "ADBE", "AMD", "COST", "MDLZ", "HSY"] as const;

function fmpKey(): string | null {
  return process.env["FMP_API_KEY"] ?? null;
}

// US market hours are roughly 13:30–20:00 UTC on weekdays; prices only move then.
function quotesMaxAgeMs(now = new Date()): number {
  const day = now.getUTCDay();
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  const open = day >= 1 && day <= 5 && mins >= 13 * 60 && mins <= 21 * 60;
  return open ? 2 * HOUR : 8 * HOUR;
}

async function readEntry<T>(key: string): Promise<{ data: T | null; updatedAt: number }> {
  const { data } = await getAdminClient()
    .from("jfb_market_cache" as never)
    .select("data, updated_at")
    .eq("key", key)
    .maybeSingle();
  const row = data as { data: T | null; updated_at: string | null } | null;
  return {
    data: row?.updated_at ? (row.data as T) : null,
    updatedAt: row?.updated_at ? new Date(row.updated_at).getTime() : 0,
  };
}

async function writeEntry(key: string, data: unknown) {
  const { error } = await getAdminClient()
    .from("jfb_market_cache" as never)
    .upsert({ key, data, updated_at: new Date().toISOString() } as never, { onConflict: "key" });
  if (error) console.error("market cache write failed", key, error.message);
}

async function claim(key: string, seconds: number): Promise<boolean> {
  const { data, error } = await getAdminClient().rpc("jfb_claim_market_refresh" as never, {
    p_key: key,
    p_seconds: seconds,
  } as never);
  if (error) {
    console.error("market cache claim failed", key, error.message);
    return false;
  }
  return data === true;
}

// Returns the stored value, refreshing it first when it is older than maxAgeMs.
// `load` gets the previous value and returns the new one, or null to keep the old.
async function cached<T>(
  key: string,
  maxAgeMs: number,
  load: (prev: T | null) => Promise<T | null>,
): Promise<{ data: T | null; updatedAt: number }> {
  const entry = await readEntry<T>(key);
  if (entry.data && Date.now() - entry.updatedAt < maxAgeMs) return entry;
  // A failed refresh isn't retried for 10 minutes, so errors can't use up the quota.
  if (!(await claim(key, 600))) return entry;
  try {
    const fresh = await load(entry.data);
    if (fresh) {
      await writeEntry(key, fresh);
      return { data: fresh, updatedAt: Date.now() };
    }
  } catch (e) {
    console.error("market cache refresh failed", key, e);
  }
  return entry;
}

// USD → EUR (how many euros one dollar buys).
export async function getEurPerUsd(): Promise<number> {
  const { data } = await cached<{ eurPerUsd: number }>("fx:EURUSD", 8 * HOUR, async () => {
    const key = fmpKey();
    if (!key) return null;
    const res = await fetch(`${FMP_BASE}/quote?symbol=EURUSD&apikey=${key}`);
    if (!res.ok) {
      console.warn("FMP fx failed", res.status);
      return null;
    }
    const eurUsd = Number((await res.json())?.[0]?.price);
    return Number.isFinite(eurUsd) && eurUsd > 0 ? { eurPerUsd: 1 / eurUsd } : null;
  });
  return data?.eurPerUsd ?? 0.92;
}

// Latest known USD quotes for the given tickers (missing ones are left out).
export async function getStoredQuotes(
  tickers: readonly string[],
): Promise<{ quotes: Record<string, StoredQuote>; updatedAt: number }> {
  const { data, updatedAt } = await cached<QuotesData>("quotes", quotesMaxAgeMs(), async (prev) => {
    const key = fmpKey();
    if (!key) return null;
    const next: QuotesData = {
      quotes: { ...(prev?.quotes ?? {}) },
      blocked: { ...(prev?.blocked ?? {}) },
    };
    const weekAgo = Date.now() - 7 * 24 * HOUR;
    // Always refresh every stock on the page, whoever triggered the refresh.
    const wanted = [
      ...KID_STOCKS.map((s) => s.ticker),
      // Probe each extra ticker once.
      ...PROBE_TICKERS.filter((t) => !next.quotes[t] && !next.blocked[t]),
    ].filter((t) => !next.blocked[t] || new Date(next.blocked[t]!).getTime() < weekAgo);

    let ok = 0;
    let limited = false;
    // A few at a time; stop once FMP says the daily limit is reached.
    for (let i = 0; i < wanted.length && !limited; i += 5) {
      await Promise.all(
        wanted.slice(i, i + 5).map(async (t) => {
          const res = await fetch(`${FMP_BASE}/quote?symbol=${encodeURIComponent(t)}&apikey=${key}`);
          if (res.status === 429) {
            limited = true;
            return;
          }
          if (res.status === 402) {
            next.blocked[t] = new Date().toISOString();
            return;
          }
          if (!res.ok) return;
          const q = (await res.json())?.[0];
          const price = Number(q?.price);
          if (!Number.isFinite(price) || price <= 0) return;
          delete next.blocked[t];
          next.quotes[t] = {
            price,
            change: Number(q.change) || 0,
            changePercent: Number(q.changePercentage ?? q.changesPercentage) || 0,
            marketCap: Number(q.marketCap) || 0,
            at: new Date().toISOString(),
          };
          ok++;
        }),
      );
    }
    console.log("market quotes refresh", JSON.stringify({
      asked: wanted.length,
      ok,
      limited,
      blocked: Object.keys(next.blocked),
    }));
    return ok > 0 || Object.keys(next.blocked).length !== Object.keys(prev?.blocked ?? {}).length ? next : null;
  });

  const quotes: Record<string, StoredQuote> = {};
  for (const t of tickers) {
    const q = data?.quotes[t];
    if (q) quotes[t] = q;
  }
  return { quotes, updatedAt };
}

// Current price in EUR for one ticker, from the stored quotes (null if unknown).
export async function getStoredPriceEur(ticker: string): Promise<number | null> {
  const [{ quotes }, eurPerUsd] = await Promise.all([getStoredQuotes([ticker]), getEurPerUsd()]);
  const usd = quotes[ticker]?.price;
  return usd ? usd * eurPerUsd : null;
}

// Last 30 daily closes in USD (oldest first). Refreshed twice a day.
export async function getStoredHistory(ticker: string): Promise<{ date: string; close: number }[]> {
  const { data } = await cached<{ history: { date: string; close: number }[] }>(
    `history:${ticker}`,
    12 * HOUR,
    async () => {
      const key = fmpKey();
      if (!key) return null;
      const to = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - 45 * 24 * HOUR).toISOString().slice(0, 10);
      const res = await fetch(
        `${FMP_BASE}/historical-price-eod/full?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&apikey=${key}`,
      );
      if (!res.ok) {
        console.warn("FMP history failed", ticker, res.status);
        return null;
      }
      const rows = await res.json();
      const history = (Array.isArray(rows) ? rows : [])
        .slice(0, 30)
        .reverse()
        .map((d: { date: string; close: number }) => ({ date: d.date, close: Number(d.close) }));
      return history.length ? { history } : null;
    },
  );
  return data?.history ?? [];
}

export type StoredNewsItem = {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text: string;
  image?: string;
};

// Latest 5 news items for a ticker. Refreshed every 6 hours.
export async function getStoredNews(ticker: string): Promise<StoredNewsItem[]> {
  const { data } = await cached<{ news: StoredNewsItem[] }>(`news:${ticker}`, 6 * HOUR, async () => {
    const key = fmpKey();
    if (!key) return null;
    const res = await fetch(`${FMP_BASE}/news/stock?symbols=${encodeURIComponent(ticker)}&limit=5&apikey=${key}`);
    if (!res.ok) {
      console.warn("FMP news failed", ticker, res.status);
      return null;
    }
    const rows = await res.json();
    const news: StoredNewsItem[] = (Array.isArray(rows) ? rows : []).map(
      (item: { title?: string; url?: string; publishedDate?: string; site?: string; text?: string; image?: string }) => ({
        title: item.title ?? "",
        url: item.url ?? "#",
        publishedDate: item.publishedDate ?? "",
        site: item.site ?? "",
        text: item.text ? item.text.slice(0, 200) + "..." : "",
        ...(item.image ? { image: item.image } : {}),
      }),
    );
    return { news };
  });
  return data?.news ?? [];
}
