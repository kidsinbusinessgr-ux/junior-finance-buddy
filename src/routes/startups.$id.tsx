import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Award } from "lucide-react";
import { useChild, useCurrentUser } from "@/hooks/useJFB";
import { CompanyStats, FounderDecision, FounderReminder } from "@/components/startup-company";
import { FounderMoneyTools, MyStake, SharesInfo, sharePrice } from "@/components/startup-investors";
import { StartupReactions } from "@/components/startup-community";

// Most a child can put into one startup in total (same as jfb_startup_invest_limit()).
const INVEST_LIMIT = 200;

// Database error messages from jfb_invest_in_startup → what the child sees.
function investErrorText(message: string): string {
  if (message.includes("Not enough coins")) return "Δεν έχεις αρκετά coins!";
  if (message.includes("Own startup")) return "Δεν μπορείς να επενδύσεις στο δικό σου startup.";
  if (message.includes("Startup limit")) return `Έχεις φτάσει το όριο των ${INVEST_LIMIT} coins σε αυτό το startup. Μοίρασε τα coins σου και σε άλλα!`;
  if (message.includes("child account")) return "Μόνο ο λογαριασμός παιδιού μπορεί να επενδύσει.";
  return "Κάτι πήγε στραβά. Δοκίμασε ξανά.";
}

export const Route = createFileRoute("/startups/$id")({
  head: () => ({
    meta: [
      { title: "Startup Pitch — Kids in Business" },
    ],
  }),
  component: StartupPage,
});

type Startup = {
  id: string;
  name: string;
  emoji: string;
  problem: string;
  solution: string;
  customer: string;
  model: string;
  creator_name: string;
  coins_raised: number;
  created_at: string;
  child_id: string | null;
  customers: number;
  cash: number;
  reputation: number;
  team: number;
  valuation: number;
  ceo_streak: number;
  total_shares: number;
  round_goal: number | null;
  round_raised: number;
  round_ends_at: string | null;
  rounds_won: number;
  last_dividend_at: string | null;
};

type Investment = {
  id: string;
  investor_name: string;
  coins: number;
  created_at: string;
};

const COIN_OPTIONS = [10, 25, 50, 100];

export default function StartupPage() {
  const { id } = Route.useParams();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [investing, setInvesting] = useState(false);
  const [investError, setInvestError] = useState<string | null>(null);
  const [myInvested, setMyInvested] = useState(0);
  const [myPledged, setMyPledged] = useState(0);
  const { userId, loading: userLoading } = useCurrentUser();
  const { child, loading: childLoading, refetch: refetchChild } = useChild();
  const [selectedCoins, setSelectedCoins] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchData = async () => {
    const [{ data: s }, { data: inv }] = await Promise.all([
      supabase.from("startups").select("*").eq("id", id).single(),
      supabase.from("startup_investments").select("id, investor_name, coins, created_at")
        .eq("startup_id", id).order("created_at", { ascending: false }).limit(20),
    ]);
    if (!s) { setNotFound(true); setLoading(false); return; }
    setStartup(s);
    setInvestments(inv ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  // How much this child has already put into this startup (for the limit).
  // What this child has in this startup now: shares bought plus coins held in an open round.
  const fetchMine = async () => {
    if (!child) return;
    const [{ data: holding }, { data: pledges }] = await Promise.all([
      supabase.from("jfb_startup_holdings" as never).select("invested").eq("child_id", child.id).eq("startup_id", id).maybeSingle(),
      supabase.from("jfb_round_pledges" as never).select("coins").eq("child_id", child.id).eq("startup_id", id).eq("status", "pending"),
    ]);
    const pledged = ((pledges ?? []) as { coins: number }[]).reduce((sum, r) => sum + r.coins, 0);
    setMyPledged(pledged);
    setMyInvested(((holding as { invested: number } | null)?.invested ?? 0) + pledged);
  };
  useEffect(() => { fetchMine(); }, [id, child?.id]);

  const handleInvest = async () => {
    if (!startup) return;
    setSubmitting(true);
    setInvestError(null);
    const { error } = await supabase.rpc("jfb_invest_in_startup" as never, {
      p_startup_id: startup.id,
      p_coins: selectedCoins,
    } as never);
    setSubmitting(false);
    if (error) {
      setInvestError(investErrorText(error.message));
      return;
    }
    setSuccess(true);
    setInvesting(false);
    await Promise.all([fetchData(), fetchMine(), refetchChild()]);
  };

  if (loading) return (
    <main className="min-h-screen bg-background">
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-12 pt-5">
        <div className="mx-auto max-w-[1440px]"><BrightlyNav active="startups" /></div>
      </section>
      <div className="py-24 text-center text-muted-foreground">Φορτώνει…</div>
    </main>
  );

  if (notFound || !startup) return (
    <main className="min-h-screen bg-background">
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-12 pt-5">
        <div className="mx-auto max-w-[1440px]"><BrightlyNav active="startups" /></div>
      </section>
      <div className="py-24 text-center">
        <div className="text-6xl">😕</div>
        <p className="mt-4 text-xl font-black">Το startup δε βρέθηκε</p>
        <Link to="/startups"><Button className="mt-6 rounded-full">← Πίσω στα Startups</Button></Link>
      </div>
    </main>
  );

  const totalInvestors = investments.length;
  const roundIsOpen = startup.round_goal !== null && startup.round_ends_at !== null && new Date(startup.round_ends_at) > new Date();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="startups" />
          <div className="mx-auto max-w-2xl pt-16 text-center">
            <div className="text-7xl">{startup.emoji}</div>
            <h1 className="mt-4 text-5xl font-black sm:text-6xl">{startup.name}</h1>
            <p className="mt-3 text-lg text-[oklch(0.9_0.04_292)]">by {startup.creator_name}</p>

            {/* Coins */}
            <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl bg-[oklch(0.45_0.18_292)] px-8 py-4">
              <span className="text-3xl">🪙</span>
              <div className="text-left">
                <p className="text-3xl font-black">{startup.coins_raised.toLocaleString()}</p>
                <p className="text-xs text-[oklch(0.82_0.08_292)]">virtual coins · {totalInvestors} επενδυτές</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-12">
        {/* Success banner */}
        {success && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-[oklch(0.93_0.08_173)] px-5 py-4 text-[oklch(0.35_0.12_173)]">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black">Επένδυσες επιτυχώς!</p>
              <p className="text-sm">Σε ευχαριστούμε για την υποστήριξη!</p>
            </div>
          </div>
        )}

        {/* The company: founder's daily decision, then its numbers */}
        <div className="mb-8 space-y-4">
          {child && startup.child_id === child.id && (
            <>
              <FounderDecision startupId={startup.id} streak={startup.ceo_streak} onDone={fetchData} />
              <FounderReminder />
            </>
          )}
          <CompanyStats company={startup} />
          <SharesInfo startup={startup} />
          {child && startup.child_id === child.id && (
            <FounderMoneyTools startup={startup} onChanged={fetchData} />
          )}
          {child && startup.child_id !== child.id && myPledged > 0 && (
            <p className="rounded-2xl border-2 border-dashed border-[oklch(0.75_0.17_70)] bg-[oklch(0.98_0.03_80)] px-5 py-4 text-sm font-bold">
              ⏳ Έχεις δεσμεύσει 🪙 {myPledged} στον γύρο χρηματοδότησης. Αν πιάσει τον στόχο, θα γίνουν μερίδια· αν όχι, θα σου επιστραφούν.
            </p>
          )}
          {child && startup.child_id !== child.id && (
            <MyStake startup={startup} childId={child.id} onChanged={() => { fetchData(); fetchMine(); refetchChild(); }} />
          )}
        </div>

        <div className="mb-8">
          <StartupReactions
            startupId={startup.id}
            canReact={Boolean(child) && startup.child_id !== child?.id}
            isFounder={Boolean(child) && startup.child_id === child?.id}
          />
        </div>

        {/* Pitch content */}
        <div className="space-y-6">
          {[
            { label: "🔍 Το Πρόβλημα", content: startup.problem },
            { label: "💡 Η Λύση μας", content: startup.solution },
            { label: "🎯 Ο Πελάτης μας", content: startup.customer },
            { label: "💰 Πώς κερδίζουμε χρήματα", content: startup.model },
          ].map((block) => (
            <div key={block.label} className="rounded-2xl border bg-card p-6">
              <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-muted-foreground">{block.label}</h3>
              <p className="text-base leading-relaxed">{block.content}</p>
            </div>
          ))}
        </div>

        {/* Invest CTA */}
        <div className="mt-10 rounded-2xl border-2 border-[oklch(0.55_0.17_173)] bg-[oklch(0.96_0.03_173)] p-6">
          <h3 className="text-xl font-black">Πιστεύεις σε αυτή την ιδέα;</h3>
          <p className="mt-1 text-muted-foreground">Επένδυσε virtual coins και δείξε την υποστήριξή σου!</p>

          {!userLoading && !userId ? (
            <Link to="/login">
              <Button className="mt-4 h-12 w-full rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white hover:bg-[oklch(0.48_0.17_173)]">
                Συνδέσου για να επενδύσεις →
              </Button>
            </Link>
          ) : userId && !childLoading && !child ? (
            <p className="mt-4 text-sm font-bold text-muted-foreground">Μόνο ο λογαριασμός παιδιού μπορεί να επενδύσει.</p>
          ) : child && startup.child_id === child.id ? (
            <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm font-bold">
              🌟 Αυτό είναι το δικό σου startup! Δείξ' το στους φίλους σου για να επενδύσουν.
            </p>
          ) : !investing ? (
            <>
              {child && (
                <p className="mt-3 text-sm font-bold text-muted-foreground">
                  Έχεις 🪙 {child.coins}{child.invest_capital > 0 && <> + 🚀 {child.invest_capital} επενδυτικά</>} · Έχεις επενδύσει εδώ {myInvested}/{INVEST_LIMIT}
                </p>
              )}
              <Button
                className="mt-4 h-12 w-full rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white hover:bg-[oklch(0.48_0.17_173)]"
                disabled={!child || myInvested >= INVEST_LIMIT}
                onClick={() => { setInvesting(true); setSuccess(false); setInvestError(null); }}
              >
                {myInvested >= INVEST_LIMIT ? "Έφτασες το όριο για αυτό το startup" : "🪙 Επένδυσε Coins"}
              </Button>
            </>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">Πόσα coins;</label>
                <div className="flex gap-2">
                  {COIN_OPTIONS.map((c) => {
                    const tooMuch = c > (child?.coins ?? 0) + (child?.invest_capital ?? 0) || myInvested + c > INVEST_LIMIT;
                    return (
                      <button key={c}
                        disabled={tooMuch}
                        onClick={() => setSelectedCoins(c)}
                        className={`flex-1 rounded-xl py-3 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          selectedCoins === c
                            ? "bg-[oklch(0.55_0.17_173)] text-white"
                            : "border bg-background hover:bg-muted"
                        }`}>
                        🪙 {c}
                      </button>
                    );
                  })}
                </div>
                {roundIsOpen && (
                  <p className="mt-2 rounded-xl bg-[oklch(0.96_0.05_70)] px-3 py-2 text-xs font-bold">
                    🎯 Τώρα τρέχει γύρος χρηματοδότησης («όλα ή τίποτα»). Τα coins σου φυλάγονται μέχρι να κλείσει:
                    αν ο γύρος πιάσει τον στόχο, γίνονται μερίδια· αν όχι, σου επιστρέφονται όλα.
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Με 🪙 {selectedCoins} παίρνεις περίπου {((selectedCoins / sharePrice(startup)) / (Number(startup.total_shares) + selectedCoins / sharePrice(startup)) * 100).toLocaleString("el-GR", { maximumFractionDigits: 1 })}% της εταιρείας.
                  Η αξία του μεριδίου σου θα ανεβαίνει ή θα πέφτει ανάλογα με το πώς πάει η εταιρεία.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(child?.invest_capital ?? 0) > 0
                    ? "Πρώτα χρησιμοποιούνται τα 🚀 επενδυτικά coins, μετά τα δικά σου. Μην τα βάλεις όλα σε ένα startup!"
                    : "Τα coins φεύγουν από το πορτοφόλι σου. Μην τα βάλεις όλα σε ένα startup!"}
                </p>
              </div>
              {investError && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive">{investError}</p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setInvesting(false)}>Ακύρωση</Button>
                <Button
                  className="flex-1 rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white"
                  disabled={submitting || selectedCoins > (child?.coins ?? 0) + (child?.invest_capital ?? 0) || myInvested + selectedCoins > INVEST_LIMIT}
                  onClick={handleInvest}
                >
                  {submitting ? "…" : `Επένδυσε 🪙 ${selectedCoins}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Investors list */}
        {investments.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 flex items-center gap-2 font-black">
              <Award size={18} className="text-[oklch(0.75_0.18_70)]" /> Επενδυτές
            </h3>
            <div className="space-y-2">
              {investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm">
                  <span className="font-bold">{inv.investor_name}</span>
                  <span className="font-black text-[oklch(0.55_0.17_173)]">🪙 {inv.coins}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-10">
          <Link to="/startups">
            <Button variant="outline" className="rounded-full">← Όλα τα Startups</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
