import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { KID_STOCKS } from "./stocks.functions";

// Trades on the real-market stock page (/stocks). The server finds the child
// from the login and looks up the stored price itself, so the browser can't
// choose either. Coins move only inside jfb_market_trade (service role only).

export type MarketTradeResult =
  | { ok: true; coins: number; priceEur: number }
  | { ok: false; reason: "login" | "no_child" | "no_price" | "not_enough" | "failed" };

const tradeSchema = z.discriminatedUnion("side", [
  z.object({ side: z.literal("buy"), ticker: z.string().min(1).max(10), coins: z.number().int().min(1).max(10000) }),
  z.object({ side: z.literal("sell"), ticker: z.string().min(1).max(10) }),
]);

export const tradeMarketStock = createServerFn({ method: "POST" })
  .inputValidator((data) => tradeSchema.parse(data))
  .handler(async ({ data }): Promise<MarketTradeResult> => {
    const meta = KID_STOCKS.find((s) => s.ticker === data.ticker);
    if (!meta) return { ok: false, reason: "failed" };

    const { getRequest } = await import("@tanstack/react-start/server");
    const { getAdminClient, getUserFromRequest } = await import("./supabase-admin.server");
    const user = await getUserFromRequest(getRequest());
    if (!user) return { ok: false, reason: "login" };

    const admin = getAdminClient();
    const { data: child } = await admin
      .from("jfb_children")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!child) return { ok: false, reason: "no_child" };

    // Same stored price the child sees on the page (refreshed every few hours).
    const { getStoredPriceEur } = await import("./market-data.server");
    const priceEur = await getStoredPriceEur(meta.ticker);
    if (!priceEur) return { ok: false, reason: "no_price" };

    const { data: coins, error } = await admin.rpc("jfb_market_trade" as never, {
      p_child_id: (child as { id: string }).id,
      p_ticker: meta.ticker,
      p_company: meta.name,
      p_emoji: meta.emoji,
      p_side: data.side,
      p_coins: data.side === "buy" ? data.coins : 0,
      p_price_eur: priceEur,
    } as never);
    if (error) {
      if (error.message.includes("Not enough coins")) return { ok: false, reason: "not_enough" };
      console.error("market trade failed", error.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, coins: coins as unknown as number, priceEur };
  });
