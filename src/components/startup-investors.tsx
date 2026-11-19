import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Startups phase 3: shares, the child's own stake, founder money tools and the
// list of a child's startup investments. All coin moves happen in database
// functions (jfb_invest_in_startup, jfb_sell_startup_stake,
// jfb_pay_startup_dividend, jfb_open_funding_round).

export type ShareNumbers = {
  id: string;
  name: string;
  valuation: number;
  cash: number;
  total_shares: number;
  round_goal: number | null;
  round_raised: number;
  round_ends_at: string | null;
  rounds_won: number;
  last_dividend_at: string | null;
};

export const sharePrice = (s: { valuation: number; total_shares: number }) =>
  Math.max(s.valuation, 1) / Number(s.total_shares);

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("el-GR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const roundOpen = (s: ShareNumbers) =>
  s.round_goal !== null && s.round_ends_at !== null && new Date(s.round_ends_at) > new Date();

const daysLeft = (iso: string) => Math.max(1, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

// Share price, founder's part and the funding round, for everyone.
export function SharesInfo({ startup }: { startup: ShareNumbers }) {
  const founderPct = (1000 / Number(startup.total_shares)) * 100;
  const open = roundOpen(startup);
  const goal = startup.round_goal ?? 0;
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-bold text-muted-foreground">📊 Τιμή μεριδίου</p>
          <p className="mt-0.5 text-lg font-black">🪙 {fmt(sharePrice(startup), 2)}</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-bold text-muted-foreground">👤 Ο ιδρυτής κατέχει</p>
          <p className="mt-0.5 text-lg font-black">{fmt(founderPct, 1)}%</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-bold text-muted-foreground">🏆 Επιτυχημένοι γύροι</p>
          <p className="mt-0.5 text-lg font-black">{startup.rounds_won}</p>
        </div>
      </div>
      {open && (
        <div className="mt-4 rounded-xl bg-[oklch(0.96_0.05_70)] p-4">
          <p className="text-sm font-black">
            🎯 Γύρος χρηματοδότησης: 🪙 {fmt(startup.round_raised)} / {fmt(goal)}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[oklch(0.7_0.17_70)]" style={{ width: `${Math.min(100, (startup.round_raised / goal) * 100)}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Λήγει σε {daysLeft(startup.round_ends_at!)} {daysLeft(startup.round_ends_at!) === 1 ? "μέρα" : "μέρες"}. «Όλα ή τίποτα»: αν πιάσει τον στόχο, τα coins γίνονται μερίδια και η εταιρεία κερδίζει φήμη· αν όχι, επιστρέφονται σε όσους επένδυσαν.
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        💡 Όταν κάποιος επενδύει, η εταιρεία βγάζει νέα μερίδια, οπότε το ποσοστό του ιδρυτή μικραίνει. Αυτό λέγεται «αραίωση».
      </p>
    </div>
  );
}

type Holding = { shares: number; invested: number };

// The signed-in child's stake in this startup, with sell.
export function MyStake({
  startup,
  childId,
  onChanged,
}: {
  startup: ShareNumbers;
  childId: string;
  onChanged: () => void;
}) {
  const [holding, setHolding] = useState<Holding | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () =>
    supabase
      .from("jfb_startup_holdings" as never)
      .select("shares, invested")
      .eq("child_id", childId)
      .eq("startup_id", startup.id)
      .maybeSingle()
      .then(({ data }) => setHolding(data as Holding | null));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, startup.id, startup.valuation, startup.total_shares]);

  if (!holding) return message ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{message}</p> : null;

  const value = Math.floor(Number(holding.shares) * sharePrice(startup));
  const pct = (Number(holding.shares) / Number(startup.total_shares)) * 100;
  const gain = value - holding.invested;
  const gainPct = holding.invested > 0 ? (gain / holding.invested) * 100 : 0;

  const sell = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("jfb_sell_startup_stake" as never, { p_startup_id: startup.id } as never);
    setBusy(false);
    setConfirming(false);
    if (error) {
      setMessage(
        error.message.includes("no cash")
          ? "Η εταιρεία δεν έχει αρκετά μετρητά για να αγοράσει το μερίδιό σου τώρα. Δοκίμασε αργότερα! (Αυτό λέγεται ρευστότητα.)"
          : "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
      );
      return;
    }
    const res = data as unknown as { payout: number; invested: number };
    const diff = res.payout - res.invested;
    setMessage(
      `💸 Πούλησες το μερίδιό σου για 🪙 ${res.payout}. ${diff >= 0 ? `Κέρδισες ${diff} coins!` : `Έχασες ${-diff} coins. Συμβαίνει και αυτό στις επενδύσεις.`}`,
    );
    setHolding(null);
    onChanged();
  };

  return (
    <div className="rounded-2xl border-2 border-[oklch(0.55_0.17_173)] bg-[oklch(0.97_0.03_173)] p-6">
      <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.4_0.12_173)]">💼 Το μερίδιό σου</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Κατέχεις</p>
          <p className="text-lg font-black">{fmt(pct, 1)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Επένδυσες</p>
          <p className="text-lg font-black">🪙 {fmt(holding.invested)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Αξίζει τώρα</p>
          <p className={`text-lg font-black ${gain >= 0 ? "text-green-700" : "text-red-600"}`}>
            🪙 {fmt(value)} ({gain >= 0 ? "+" : ""}{fmt(gainPct, 1)}%)
          </p>
        </div>
      </div>
      {message && <p className="mt-3 text-sm font-bold text-[oklch(0.5_0.18_40)]">{message}</p>}
      {!confirming ? (
        <button onClick={() => setConfirming(true)} className="mt-4 w-full rounded-full border-2 bg-white py-2 text-sm font-black hover:bg-muted">
          Πούλησε το μερίδιό σου
        </button>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-center text-sm font-bold">Θα πάρεις 🪙 {fmt(value)} και δε θα έχεις πια μερίδιο. Σίγουρα;</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 rounded-full border-2 bg-white py-2 text-sm font-black">Όχι</button>
            <button onClick={sell} disabled={busy} className="flex-1 rounded-full bg-[oklch(0.55_0.17_173)] py-2 text-sm font-black text-white disabled:opacity-60">
              {busy ? "…" : "Ναι, πούλησε"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const GOALS = [100, 200, 500, 1000];

// Founder: open a funding round, pay a dividend.
export function FounderMoneyTools({ startup, onChanged }: { startup: ShareNumbers; onChanged: () => void }) {
  const [investors, setInvestors] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("jfb_startup_investor_count" as never, { p_startup_id: startup.id } as never).then(({ data }) => setInvestors(Number(data ?? 0)));
  }, [startup.id, startup.total_shares]);

  const open = roundOpen(startup);
  const nextDividend = startup.last_dividend_at ? new Date(new Date(startup.last_dividend_at).getTime() + 7 * 86400000) : null;
  const dividendReady = !nextDividend || nextDividend <= new Date();

  const run = async (fn: string, args: Record<string, unknown>, ok: (data: unknown) => string) => {
    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.rpc(fn as never, args as never);
    setBusy(false);
    if (error) {
      setMessage(
        error.message.includes("No investors") ? "Δεν υπάρχουν ακόμα επενδυτές για να πάρουν μέρισμα."
          : error.message.includes("too soon") ? "Μέρισμα μπορείς να μοιράσεις μία φορά την εβδομάδα."
          : error.message.includes("already open") ? "Υπάρχει ήδη ανοιχτός γύρος."
          : "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
      );
      return;
    }
    setMessage(ok(data));
    onChanged();
  };

  return (
    <div className="rounded-2xl border bg-card p-6">
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">🧑‍💼 Εργαλεία ιδρυτή</p>

      <div className="mt-4">
        <p className="text-sm font-black">🎯 Γύρος χρηματοδότησης</p>
        {open ? (
          <p className="mt-1 text-sm text-muted-foreground">Ο γύρος σου είναι ανοιχτός. Δείξε το startup σου στους φίλους σου!</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted-foreground">Βάλε στόχο για 7 μέρες. «Όλα ή τίποτα»: αν τον πιάσεις, τα coins μπαίνουν στο ταμείο και η εταιρεία κερδίζει +10 φήμη και ένα 🏆· αν όχι, επιστρέφονται στους επενδυτές.</p>
            <div className="mt-2 flex gap-2">
              {GOALS.map((g) => (
                <button key={g} disabled={busy}
                  onClick={() => run("jfb_open_funding_round", { p_startup_id: startup.id, p_goal: g }, () => `🎯 Άνοιξες γύρο με στόχο 🪙 ${g}!`)}
                  className="flex-1 rounded-xl border bg-background py-2 text-sm font-black hover:bg-muted disabled:opacity-60">
                  🪙 {g}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-black">💰 Μέρισμα στους επενδυτές</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Μοιράζεις μέρος από το ταμείο στους {investors} επενδυτές σου, ανάλογα με το μερίδιο του καθενός. Η εταιρεία κερδίζει +3 φήμη. Μία φορά την εβδομάδα.
        </p>
        {dividendReady ? (
          <div className="mt-2 flex gap-2">
            {[5, 10].map((p) => (
              <button key={p} disabled={busy || investors === 0}
                onClick={() => run("jfb_pay_startup_dividend", { p_startup_id: startup.id, p_percent: p }, (d) => {
                  const r = d as { paid: number; investors: number };
                  return `💰 Μοίρασες 🪙 ${r.paid} σε ${r.investors} ${r.investors === 1 ? "επενδυτή" : "επενδυτές"}!`;
                })}
                className="flex-1 rounded-xl border bg-background py-2 text-sm font-black hover:bg-muted disabled:opacity-40">
                {p}% του ταμείου (🪙 {Math.min(Math.floor((startup.cash * p) / 100), 100)})
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs font-bold">Επόμενο μέρισμα από {nextDividend!.toLocaleDateString("el-GR", { weekday: "long", day: "numeric", month: "long" })}.</p>
        )}
      </div>

      {message && <p className="mt-4 rounded-xl bg-muted px-4 py-2 text-sm font-bold">{message}</p>}
    </div>
  );
}

type MyInvestment = {
  shares: number;
  invested: number;
  startups: { id: string; name: string; emoji: string; valuation: number; total_shares: number } | null;
};

// "My startup investments" with today's value, for the startups list.
export function MyStartupInvestments({ childId }: { childId: string }) {
  const [rows, setRows] = useState<MyInvestment[]>([]);

  useEffect(() => {
    supabase
      .from("jfb_startup_holdings" as never)
      .select("shares, invested, startups(id, name, emoji, valuation, total_shares)")
      .eq("child_id", childId)
      .then(({ data }) => setRows((data ?? []) as unknown as MyInvestment[]));
  }, [childId]);

  const list = rows.filter((r) => r.startups);
  if (!list.length) return null;
  const totalInvested = list.reduce((s, r) => s + r.invested, 0);
  const totalValue = list.reduce((s, r) => s + Math.floor(Number(r.shares) * sharePrice(r.startups!)), 0);
  const gain = totalValue - totalInvested;

  return (
    <div className="mb-10 rounded-2xl border-2 border-[oklch(0.55_0.17_173)] bg-[oklch(0.97_0.03_173)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-black">💼 Οι επενδύσεις μου</h2>
        <p className={`text-sm font-black ${gain >= 0 ? "text-green-700" : "text-red-600"}`}>
          Αξία 🪙 {fmt(totalValue)} ({gain >= 0 ? "+" : ""}{fmt(gain)})
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {list.map((r) => {
          const s = r.startups!;
          const value = Math.floor(Number(r.shares) * sharePrice(s));
          const g = value - r.invested;
          return (
            <Link key={s.id} to="/startups/$id" params={{ id: s.id }}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm hover:shadow">
              <span className="font-bold">{s.emoji} {s.name}</span>
              <span className="text-right">
                <span className="font-black">🪙 {fmt(value)}</span>{" "}
                <span className={`text-xs font-bold ${g >= 0 ? "text-green-700" : "text-red-600"}`}>
                  ({g >= 0 ? "+" : ""}{g})
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
