import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Check, ChevronRight, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import spendHero from "@/assets/spend-hero-kid.jpg";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/spend")({
  head: () => ({
    meta: [
      { title: "Spend with Brightly — Everyday money confidence" },
      { name: "description", content: "Give young people room to make everyday spending choices, with practical controls for parents." },
      { property: "og:title", content: "Spend with Brightly — Everyday money confidence" },
      { property: "og:description", content: "Give young people room to make everyday spending choices, with practical controls for parents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpendPage,
});

function SpendPage() {
  const [cardLocked, setCardLocked] = useState(false);
  const [alertsOn, setAlertsOn] = useState(true);

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative overflow-hidden bg-[oklch(0.71_0.15_214)] text-[oklch(0.18_0.06_235)]">
        <div className="absolute -left-12 top-28 h-48 w-48 rounded-full border-[22px] border-[oklch(0.86_0.12_102)]" />
        <div className="absolute right-[7%] top-24 h-12 w-28 rotate-[18deg] rounded-full bg-[oklch(0.72_0.2_28)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-20 pt-5 lg:px-16">
          <BrightlyNav active="spend" tone="light" />

          <div className="grid items-center gap-10 pb-4 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-24">
            <div className="relative z-10 max-w-[610px]"><p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.35_0.1_217)]">Spend with confidence</p><h1 className="mt-5 text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">Big little choices start here.</h1><p className="mt-7 text-xl leading-relaxed lg:text-2xl">A card and app that helps young people practise spending wisely — while you stay close to every step.</p><Button className="mt-9 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Get started</Button></div>
            <div className="relative mx-auto aspect-square w-full max-w-[610px]"><div className="absolute inset-[5%] rounded-full bg-[oklch(0.88_0.12_103)]" /><div className="absolute left-[3%] top-[16%] z-20 grid h-20 w-20 place-items-center rounded-full bg-[oklch(0.72_0.2_28)] text-3xl shadow-lg"><Sparkles /></div><img src={spendHero} width={1200} height={1200} alt="Young person holding a Brightly card and shopping bag" className="relative z-10 h-full w-full rounded-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="bg-[oklch(0.985_0.018_91)] px-6 py-20 text-foreground lg:px-16"><div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_0.9fr]"><div><p className="font-black uppercase tracking-[0.16em] text-[oklch(0.54_0.14_214)]">Their money, your peace of mind</p><h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Every tap can teach something.</h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Help them explore the difference between what they want and what they really value. You can see the moments that matter, without taking the decision away.</p><ul className="mt-8 grid gap-4 text-lg">{["Instant spending updates", "Useful controls when you need them", "One place to see what’s going on"].map((item) => <li key={item} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.74_0.18_173)]"><Check size={16} /></span>{item}</li>)}</ul></div>
        <div className="rounded-lg bg-card p-6 shadow-xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-muted-foreground">Maya’s card</p><h3 className="mt-1 text-3xl font-black">Card controls</h3></div><WalletCards className="h-8 w-8 text-[oklch(0.62_0.17_214)]" /></div><div className="mt-7 grid gap-3"><button onClick={() => setCardLocked(!cardLocked)} className="flex items-center justify-between rounded-lg border bg-background px-4 py-4 text-left transition-transform hover:-translate-y-0.5"><span className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-full ${cardLocked ? "bg-[oklch(0.73_0.2_28)]" : "bg-secondary"}`}><ShieldCheck size={20} /></span><span><span className="block font-black">{cardLocked ? "Card paused" : "Card ready to use"}</span><span className="text-sm text-muted-foreground">Tap to {cardLocked ? "unpause" : "pause"} it</span></span></span><span className={`h-6 w-11 rounded-full p-1 transition-colors ${cardLocked ? "bg-[oklch(0.73_0.2_28)]" : "bg-[oklch(0.7_0.17_214)]"}`}><span className={`block h-4 w-4 rounded-full bg-card transition-transform ${cardLocked ? "translate-x-5" : ""}`} /></span></button><button onClick={() => setAlertsOn(!alertsOn)} className="flex items-center justify-between rounded-lg border bg-background px-4 py-4 text-left transition-transform hover:-translate-y-0.5"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.88_0.12_103)]"><BellRing size={20} /></span><span><span className="block font-black">Spending alerts</span><span className="text-sm text-muted-foreground">{alertsOn ? "Updates are on" : "Updates are paused"}</span></span></span><span className={`h-6 w-11 rounded-full p-1 transition-colors ${alertsOn ? "bg-[oklch(0.7_0.17_214)]" : "bg-muted"}`}><span className={`block h-4 w-4 rounded-full bg-card transition-transform ${alertsOn ? "translate-x-5" : ""}`} /></span></button></div></div></div></section>

      <section className="bg-[oklch(0.57_0.23_292)] px-6 py-20 text-primary-foreground lg:px-16"><div className="mx-auto max-w-6xl"><p className="text-center text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">A safer way to learn</p><h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-black leading-tight sm:text-5xl">Real-life spending practice, with room to grow.</h2><div className="mt-12 grid gap-4 md:grid-cols-3">{[["Choose", "Let them decide what feels worth it before they spend."], ["Check in", "See activity and talk about the choices behind it."], ["Build habits", "Give every purchase a little more purpose over time."]].map(([title, copy], index) => <article key={title} className="rounded-lg bg-[oklch(0.69_0.16_292)] p-7"><span className="text-5xl font-black text-[oklch(0.81_0.18_173)]">0{index + 1}</span><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-relaxed text-[oklch(0.95_0.02_292)]">{copy}</p><button className="mt-6 flex items-center gap-2 font-black">Discover <ChevronRight size={18} /></button></article>)}</div></div></section>
      <section id="plans" className="bg-[oklch(0.75_0.18_173)] px-6 py-14 text-accent-foreground"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-black uppercase tracking-[0.16em]">Ready for the next step</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Make every choice count.</h2></div><Button className="h-14 rounded-full bg-primary px-9 text-primary-foreground hover:bg-primary/90">Get started</Button></div></section>
    </main>
  );
}