import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, LockKeyhole, PiggyBank, Target, TrendingUp } from "lucide-react";
import saveHero from "@/assets/save-hero-kid.jpg";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/save")({
  head: () => ({
    meta: [
      { title: "Save with Brightly — Turn small steps into big dreams" },
      { name: "description", content: "Brightly helps young people create saving goals, build helpful routines, and watch every small step count." },
      { property: "og:title", content: "Save with Brightly — Turn small steps into big dreams" },
      { property: "og:description", content: "Brightly helps young people create saving goals, build helpful routines, and watch every small step count." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavePage,
});

function SavePage() {
  const [weeklyAmount, setWeeklyAmount] = useState(3);
  const target = 48;
  const saved = 21;
  const remaining = Math.max(target - saved, 0);
  const weeks = Math.ceil(remaining / weeklyAmount);
  const progress = Math.round((saved / target) * 100);

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative overflow-hidden bg-[oklch(0.76_0.15_173)] text-[oklch(0.17_0.065_195)]">
        <div className="absolute -left-16 top-28 h-48 w-48 rounded-full border-[24px] border-[oklch(0.95_0.08_105)]" />
        <div className="absolute right-[7%] top-28 h-12 w-28 rotate-[-18deg] rounded-full bg-[oklch(0.73_0.2_28)]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-20 pt-5 lg:px-16">
          <BrightlyNav active="save" tone="light" />
          <div className="grid items-center gap-10 pb-4 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-24">
            <div className="relative z-10 max-w-[610px]">
              <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.35_0.12_175)]">Saving that feels possible</p>
              <h1 className="mt-5 text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">Big dreams. Small steps.</h1>
              <p className="mt-7 text-xl leading-relaxed lg:text-2xl">Give every pound a purpose. Brightly makes it easy for young people to choose a goal and enjoy the journey towards it.</p>
              <Button className="mt-9 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Get started</Button>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[610px]">
              <div className="absolute inset-[5%] rounded-full bg-[oklch(0.88_0.1_104)]" />
              <div className="absolute left-[1%] top-[15%] z-20 grid h-20 w-20 place-items-center rounded-full bg-[oklch(0.73_0.2_28)] text-primary-foreground shadow-lg"><Target /></div>
              <img src={saveHero} width={1200} height={1200} alt="Young person holding a savings jar and phone" className="relative z-10 h-full w-full rounded-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[oklch(0.985_0.018_91)] px-6 py-20 text-foreground lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="font-black uppercase tracking-[0.16em] text-[oklch(0.49_0.13_173)]">A goal they can see</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Set it, grow it, celebrate it.</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">A named goal gives saving a reason. Whether it’s a new bike, a special day out, or something they have imagined for ages, every little top-up brings it closer.</p>
            <ul className="mt-8 grid gap-4 text-lg">
              {["Create goals with a name and target", "Build a simple weekly saving routine", "Keep savings tucked away until the moment is right"].map((item) => (
                <li key={item} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-accent"><Check size={16} /></span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div><p className="text-sm font-bold text-muted-foreground">Maya’s goal</p><h3 className="mt-1 text-3xl font-black">Roller skates</h3></div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary"><PiggyBank /></span>
            </div>
            <div className="mt-7"><div className="flex justify-between text-sm font-bold"><span>£{saved}.00 saved</span><span>£{target}.00 goal</span></div><div className="mt-3 h-4 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-[oklch(0.69_0.17_173)] transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-sm font-bold text-muted-foreground">{progress}% of the way there</p></div>
            <div className="mt-7 border-t pt-6"><label htmlFor="weekly-save" className="flex items-center justify-between gap-4 text-sm font-black"><span>Weekly save</span><span className="rounded-full bg-secondary px-3 py-1 text-base">£{weeklyAmount}.00</span></label><input id="weekly-save" aria-label="Weekly save amount" type="range" min="1" max="8" step="1" value={weeklyAmount} onChange={(event) => setWeeklyAmount(Number(event.target.value))} className="mt-4 w-full accent-[oklch(0.5_0.15_173)]" /><p className="mt-3 text-sm text-muted-foreground">At this pace, Maya could reach the goal in <strong className="text-foreground">{weeks} weeks</strong>.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[oklch(0.57_0.23_292)] px-6 py-20 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-6xl"><p className="text-center text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">A habit that keeps growing</p><h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-black leading-tight sm:text-5xl">Saving isn’t about saying no. It’s about choosing what matters next.</h2><div className="mt-12 grid gap-4 md:grid-cols-3">{[[Target, "Choose a goal", "Give every saving pot a clear reason to exist."], [TrendingUp, "Make it routine", "Set aside a little regularly and watch momentum build."], [LockKeyhole, "Keep it safe", "Leave the goal untouched until it is ready to happen."]].map(([Icon, title, copy]) => { const StepIcon = Icon as typeof Target; return <article key={title as string} className="rounded-lg bg-[oklch(0.69_0.16_292)] p-7"><span className="grid h-12 w-12 place-items-center rounded-full bg-[oklch(0.8_0.16_173)] text-[oklch(0.22_0.07_193)]"><StepIcon /></span><h3 className="mt-8 text-2xl font-black">{title as string}</h3><p className="mt-3 leading-relaxed text-[oklch(0.95_0.02_292)]">{copy as string}</p></article>})}</div></div>
      </section>
      <section className="bg-accent px-6 py-14 text-accent-foreground"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-black uppercase tracking-[0.16em]">Ready when they are</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Make space for every dream.</h2></div><Button className="h-14 rounded-full bg-primary px-9 text-primary-foreground hover:bg-primary/90">Get started</Button></div></section>
    </main>
  );
}