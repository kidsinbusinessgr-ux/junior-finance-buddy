import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Award } from "lucide-react";

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
  const [investorName, setInvestorName] = useState("");
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

  const handleInvest = async () => {
    if (!investorName.trim() || !startup) return;
    setSubmitting(true);

    const { error } = await supabase.from("startup_investments").insert([{
      startup_id: startup.id,
      investor_name: investorName.trim(),
      coins: selectedCoins,
    }]);

    if (!error) {
      // Update coins_raised
      await supabase.from("startups").update({
        coins_raised: startup.coins_raised + selectedCoins,
      }).eq("id", startup.id);

      setSuccess(true);
      setInvesting(false);
      setInvestorName("");
      await fetchData();
    }
    setSubmitting(false);
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
        <p className="mt-4 text-xl font-black">Το startup δεν βρέθηκε</p>
        <Link to="/startups"><Button className="mt-6 rounded-full">← Πίσω στα Startups</Button></Link>
      </div>
    </main>
  );

  const totalInvestors = investments.length;

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

          {!investing ? (
            <Button
              className="mt-4 h-12 w-full rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white hover:bg-[oklch(0.48_0.17_173)]"
              onClick={() => { setInvesting(true); setSuccess(false); }}
            >
              🪙 Επένδυσε Coins
            </Button>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold">Το όνομά σου</label>
                <input
                  className="w-full rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.17_173)]"
                  placeholder="Όνομα ή ψευδώνυμο"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">Πόσα coins;</label>
                <div className="flex gap-2">
                  {COIN_OPTIONS.map((c) => (
                    <button key={c}
                      onClick={() => setSelectedCoins(c)}
                      className={`flex-1 rounded-xl py-3 text-sm font-black transition-all ${
                        selectedCoins === c
                          ? "bg-[oklch(0.55_0.17_173)] text-white"
                          : "border bg-background hover:bg-muted"
                      }`}>
                      🪙 {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setInvesting(false)}>Ακύρωση</Button>
                <Button
                  className="flex-1 rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white"
                  disabled={!investorName.trim() || submitting}
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
