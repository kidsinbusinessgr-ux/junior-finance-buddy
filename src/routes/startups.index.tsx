import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useChild } from "@/hooks/useJFB";
import { MyStartupInvestments } from "@/components/startup-investors";
import { SeasonBoard, StartupLeaderboard } from "@/components/startup-community";
import { stageFor } from "@/lib/startup-stages";

export const Route = createFileRoute("/startups/")({
  head: () => ({
    meta: [
      { title: "Startups – Kids in Business" },
      { name: "description", content: "Δες τις startups που έφτιαξαν οι μαθητές μας. Επένδυσε εικονικά KidsCoins στις ιδέες που πιστεύεις." },
    ],
  }),
  component: StartupsPage,
});

type Startup = {
  id: string;
  name: string;
  emoji: string;
  problem: string;
  solution: string;
  creator_name: string;
  coins_raised: number;
  created_at: string;
  valuation: number;
  image_url: string | null;
};

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const { child } = useChild();

  useEffect(() => {
    supabase
      .from("startups")
      .select("id, name, emoji, problem, solution, creator_name, coins_raised, created_at, valuation, image_url")
      .order("valuation", { ascending: false })
      .then(({ data }) => {
        setStartups(data ?? []);
        setLoading(false);
      });
  }, []);

  const top3 = startups.slice(0, 3);
  const rest = startups.slice(3);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="startups" />
          <div className="mx-auto max-w-3xl pt-20 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">Student Startups</p>
            <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">Οι ιδέες μας</h1>
            <p className="mt-5 text-xl text-[oklch(0.96_0.02_292)]">Startups που έφτιαξαν μαθητές. Επένδυσε εικονικά KidsCoins στις ιδέες που πιστεύεις.</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/build">
                <Button className="h-12 rounded-full bg-white px-8 font-black text-[oklch(0.57_0.23_292)] hover:bg-white/90">
                  + Φτιάξε τη δική σου
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {child && <MyStartupInvestments childId={child.id} />}
        <SeasonBoard />
        <StartupLeaderboard />
        {loading && (
          <div className="py-20 text-center text-muted-foreground">Φορτώνει…</div>
        )}

        {!loading && startups.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-6xl">🌱</div>
            <p className="mt-4 text-xl font-black">Δεν υπάρχουν startups ακόμα.</p>
            <p className="mt-2 text-muted-foreground">Γίνε ο/η πρώτος/η που θα φτιάξει ένα.</p>
            <Link to="/build">
              <Button className="mt-6 h-12 rounded-full px-8 font-black">🚀 Φτιάξε την πρώτη startup</Button>
            </Link>
          </div>
        )}

        {/* Top 3 — featured */}
        {top3.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-black">Top startups</h2>
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              {top3.map((s, i) => (
                <Link key={s.id} to="/startups/$id" params={{ id: s.id }}>
                  <div className={`group relative overflow-hidden rounded-2xl border-2 p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                    i === 0 ? "border-[oklch(0.75_0.18_70)] bg-[oklch(0.97_0.04_70)]" :
                    i === 1 ? "border-[oklch(0.8_0.05_0)] bg-[oklch(0.97_0.01_0)]" :
                    "border-[oklch(0.78_0.12_55)] bg-[oklch(0.97_0.03_55)]"
                  }`}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-3xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                      <span className="text-2xl">{s.emoji}</span>
                    </div>
                    {s.image_url && (
                      <img src={s.image_url} alt="" loading="lazy" className="mb-3 aspect-[4/3] w-full rounded-xl border bg-white object-contain" />
                    )}
                    <h3 className="text-lg font-black">{s.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.solution}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg">🪙</span>
                      <span className="text-sm font-black">{s.valuation.toLocaleString("el-GR")} αξία · {stageFor(s.valuation).stage.emoji} {stageFor(s.valuation).stage.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">by {s.creator_name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Rest */}
        {rest.length > 0 && (
          <>
            <h2 className="mb-6 text-2xl font-black">Όλες οι startups</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {rest.map((s) => (
                <Link key={s.id} to="/startups/$id" params={{ id: s.id }}>
                  <div className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      {s.image_url ? (
                        <img src={s.image_url} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl border bg-white object-contain" />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl">{s.emoji}</div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-black">{s.name}</h3>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{s.solution}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="font-bold text-[oklch(0.55_0.17_173)]">🪙 {s.valuation.toLocaleString("el-GR")} · {stageFor(s.valuation).stage.emoji} {stageFor(s.valuation).stage.name}</span>
                          <span className="text-muted-foreground">by {s.creator_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
