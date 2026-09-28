import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Menu, Pause, X } from "lucide-react";
import heroKid from "@/assets/bright-card-kid.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brightly — Money skills for growing minds" },
      { name: "description", content: "A playful money-learning experience for kids and the people who guide them." },
      { property: "og:title", content: "Brightly — Money skills for growing minds" },
      { property: "og:description", content: "A playful money-learning experience for kids and the people who guide them." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = [
    ["Where kids grow money confidence", "Build everyday skills in saving, giving, earning and spending."],
    ["A money app they’ll actually enjoy", "Small choices today can grow into smart habits tomorrow."],
    ["Learning made brilliantly simple", "Set goals, earn rewards and see progress together."],
  ];
  const currentTitle = slides[slide]?.[0] ?? "";
  const currentCopy = slides[slide]?.[1] ?? "";
  const advance = (direction: number) => setSlide((slide + direction + slides.length) % slides.length);

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative min-h-[770px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground lg:min-h-[850px]">
        <div className="absolute inset-0 bg-[linear-gradient(122deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-14 pt-5 lg:px-16">
          <header className="flex items-center justify-between gap-6">
            <a className="flex items-center gap-1 text-3xl font-black tracking-tight" href="#top" aria-label="Brightly home">
              <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-lg leading-none">∞</span>brightly
            </a>
            <nav className="hidden items-center gap-9 text-sm lg:flex">
              {['Plans & pricing', 'Earn', 'Spend', 'Save', 'Invest', 'Learn'].map((item) => item === 'Earn' ? <Link key={item} to="/earn" className="transition-opacity hover:opacity-70">{item}</Link> : <a key={item} className="transition-opacity hover:opacity-70" href="#discover">{item}</a>)}
            </nav>
            <div className="hidden items-center gap-7 lg:flex"><a className="text-sm" href="#login">Login</a><Button className="h-12 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">Get started</Button></div>
            <Button onClick={() => setMenuOpen(!menuOpen)} variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/20 lg:hidden" aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</Button>
          </header>
          {menuOpen && <nav className="absolute right-6 top-20 z-20 grid w-56 gap-3 rounded-lg bg-card p-5 text-card-foreground shadow-xl lg:hidden">{['Plans & pricing', 'Earn', 'Spend', 'Save', 'Invest', 'Learn'].map((item) => item === 'Earn' ? <Link key={item} to="/earn" onClick={() => setMenuOpen(false)}>{item}</Link> : <a key={item} href="#discover" onClick={() => setMenuOpen(false)}>{item}</a>)}</nav>}

          <div id="top" className="grid items-center gap-4 pb-12 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-28">
            <div className="relative z-10 max-w-[620px]">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">For ages 6–18</p>
              <h1 className="text-5xl font-black leading-[0.99] tracking-tight sm:text-6xl lg:text-7xl">{currentTitle}</h1>
              <p className="mt-7 max-w-xl text-xl leading-relaxed text-[oklch(0.96_0.02_292)] lg:text-2xl">{currentCopy}</p>
              <Button className="mt-9 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Get started</Button>
            </div>
            <div className="relative mx-auto mt-7 aspect-square w-full max-w-[610px] lg:mt-0">
              <div className="hero-orb absolute inset-[8%] rounded-full" />
              <div className="hero-ring absolute bottom-[3%] right-[5%] h-[39%] w-[39%] rounded-full" />
              <div className="drift absolute left-[2%] top-[40%] h-12 w-28 rotate-[-18deg] rounded-full border-[12px] border-[oklch(0.76_0.21_182)] border-r-transparent" />
              <div className="float-slow absolute right-[11%] top-[6%] h-7 w-18 rotate-[-12deg] rounded-full bg-[oklch(0.74_0.21_318)]" />
              <img src={heroKid} width={1200} height={1200} alt="Child holding a card and phone" className="relative z-10 h-full w-full rounded-full object-cover mix-blend-normal" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4"><Button onClick={() => setPaused(!paused)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label={paused ? "Play slideshow" : "Pause slideshow"}>{paused ? <ArrowRight size={20} /> : <Pause size={18} />}</Button><div className="flex gap-2 rounded-full bg-[oklch(0.79_0.11_292)] px-5 py-3">{slides.map((_, index) => <button key={index} aria-label={`Go to slide ${index + 1}`} onClick={() => setSlide(index)} className={`h-2.5 rounded-full transition-all ${slide === index ? 'w-7 bg-primary' : 'w-2.5 bg-[oklch(0.55_0.1_292)]'}`} />)}</div></div>
            <div className="flex gap-2"><Button onClick={() => advance(-1)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label="Previous slide"><ArrowLeft /></Button><Button onClick={() => advance(1)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label="Next slide"><ArrowRight /></Button></div>
          </div>
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pb-8 pt-8 text-center"><p className="text-3xl font-black leading-tight sm:text-4xl">Join more than 2 million young people building better money habits</p><p className="mt-3 text-xs text-[oklch(0.89_0.06_292)]">Based on active Brightly members since 2015</p></div>
      </section>

      <section id="discover" className="bg-[oklch(0.985_0.015_91)] px-6 py-20 text-foreground lg:px-16"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]"><div><p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Made for real life</p><h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Little steps. Huge possibilities.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[["Earn", "Turn completed chores into proud moments."], ["Save", "Bring goals into view, one pound at a time."], ["Spend", "Practice making choices with a safety net."]].map(([title, copy], index) => <article key={title} className="rounded-lg bg-card p-6 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-lg font-black">{index + 1}</span><h3 className="mt-6 text-2xl font-black">{title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p></article>)}</div></div></section>
      <section className="bg-[oklch(0.75_0.18_173)] px-6 py-16 text-accent-foreground"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.16em]">Built alongside parents</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">More confidence, every day.</h2></div><ul className="grid gap-3 text-lg">{['See activity at a glance', 'Set flexible spending rules', 'Celebrate healthy habits'].map((item) => <li key={item} className="flex items-center gap-3"><Check className="h-5 w-5" />{item}</li>)}</ul></div></section>
    </main>
  );
}