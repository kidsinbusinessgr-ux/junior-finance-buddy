import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Menu, Plus, Sparkles, X } from "lucide-react";
import earnHero from "@/assets/earn-hero-kid.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/earn")({
  head: () => ({
    meta: [
      { title: "Earn with Brightly — Build money confidence" },
      { name: "description", content: "Make pocket money, chores, and everyday learning feel rewarding with Brightly." },
      { property: "og:title", content: "Earn with Brightly — Build money confidence" },
      { property: "og:description", content: "Make pocket money, chores, and everyday learning feel rewarding with Brightly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EarnPage,
});

function EarnPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { label: "Feed the pets", value: "£2.00", done: true },
    { label: "Tidy your room", value: "£1.50", done: false },
    { label: "Help with dinner", value: "£2.50", done: false },
  ]);
  const completeTask = (index: number) => setTasks((items) => items.map((task, position) => position === index ? { ...task, done: !task.done } : task));
  const completed = tasks.filter((task) => task.done).length;

  return <main className="overflow-hidden bg-background">
    <section className="relative overflow-hidden bg-[oklch(0.74_0.17_51)] text-[oklch(0.24_0.08_293)]">
      <div className="absolute -left-20 top-28 h-48 w-48 rounded-full border-[24px] border-[oklch(0.95_0.1_90)]" />
      <div className="absolute right-[6%] top-24 h-12 w-28 rotate-[-18deg] rounded-full bg-[oklch(0.69_0.2_294)]" />
      <div className="relative mx-auto max-w-[1440px] px-6 pb-20 pt-5 lg:px-16">
        <header className="flex items-center justify-between gap-6">
          <Link className="flex items-center gap-1 text-3xl font-black tracking-tight" to="/" aria-label="Brightly home"><span className="inline-grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-lg leading-none text-primary-foreground">∞</span>brightly</Link>
          <nav className="hidden items-center gap-9 text-sm lg:flex"><a href="#plans">Plans & pricing</a><Link to="/earn" className="font-black underline decoration-2 underline-offset-8">Earn</Link><a href="#plans">Spend</a><a href="#plans">Save</a><a href="#plans">Invest</a><a href="#plans">Learn</a></nav>
          <div className="hidden items-center gap-7 lg:flex"><a className="text-sm" href="#login">Login</a><Button className="h-12 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">Get started</Button></div>
          <Button onClick={() => setMenuOpen(!menuOpen)} variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</Button>
        </header>
        {menuOpen && <nav className="absolute right-6 top-20 z-20 grid w-56 gap-3 rounded-lg bg-card p-5 text-card-foreground shadow-xl lg:hidden"><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link><Link to="/earn" onClick={() => setMenuOpen(false)}>Earn</Link><a href="#plans">Plans & pricing</a></nav>}
        <div className="grid items-center gap-10 pb-4 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-24">
          <div className="relative z-10 max-w-[610px]"><p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.43_0.14_37)]">Pocket money, made meaningful</p><h1 className="mt-5 text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">The feel-good way to earn.</h1><p className="mt-7 text-xl leading-relaxed lg:text-2xl">Turn everyday jobs into confidence-building wins — and help young people learn the value of money as they go.</p><Button className="mt-9 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Get started</Button></div>
          <div className="relative mx-auto aspect-square w-full max-w-[610px]"><div className="absolute inset-[5%] rounded-full bg-[oklch(0.9_0.12_88)]" /><div className="absolute right-[4%] top-[11%] z-20 grid h-20 w-20 place-items-center rounded-full bg-[oklch(0.76_0.19_173)] text-3xl shadow-lg"><Sparkles /></div><img src={earnHero} width={1200} height={1200} alt="Child pleased with earning progress" className="relative z-10 h-full w-full rounded-full object-cover" /></div>
        </div>
      </div>
    </section>

    <section className="bg-[oklch(0.98_0.02_92)] px-6 py-20 text-foreground lg:px-16"><div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_0.9fr]"><div><p className="font-black uppercase tracking-[0.16em] text-[oklch(0.58_0.15_37)]">Jobs that pay off</p><h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">From helping out to feeling proud.</h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Create a list together, choose what each task is worth and celebrate every finished job. It’s a simple routine that makes effort visible.</p><ul className="mt-8 grid gap-4 text-lg">{['Set one-off jobs or weekly routines', 'Choose rewards that feel fair', 'Mark jobs complete together'].map((item) => <li key={item} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.74_0.18_173)]"><Check size={16} /></span>{item}</li>)}</ul></div>
      <div className="rounded-lg bg-card p-6 shadow-xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-muted-foreground">This week’s jobs</p><h3 className="mt-1 text-3xl font-black">{completed} of {tasks.length} done</h3></div><span className="rounded-full bg-secondary px-3 py-2 text-sm font-black">£6.00</span></div><div className="mt-7 grid gap-3">{tasks.map((task, index) => <button key={task.label} onClick={() => completeTask(index)} className="flex items-center justify-between rounded-lg border bg-background px-4 py-4 text-left transition-transform hover:-translate-y-0.5"><span className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${task.done ? 'border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-accent-foreground' : 'border-border'}`}>{task.done && <Check size={16} />}</span><span className={task.done ? 'line-through text-muted-foreground' : 'font-bold'}>{task.label}</span></span><span className="font-black">{task.value}</span></button>)}</div><Button variant="outline" className="mt-5 w-full gap-2 rounded-full"><Plus size={18} />Add a job</Button></div></div></section>

    <section className="bg-[oklch(0.57_0.23_292)] px-6 py-20 text-primary-foreground lg:px-16"><div className="mx-auto max-w-6xl"><p className="text-center text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Real-world skills, little by little</p><h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-black leading-tight sm:text-5xl">Growing confidence comes naturally when earning feels earned.</h2><div className="mt-12 grid gap-4 md:grid-cols-3">{[["Make a plan", "Choose a goal and see the small steps that get you there."], ["Do the job", "Build the habit of following through on a promise."], ["Enjoy the win", "Watch effort turn into money they can save, spend or share."]].map(([title, copy], index) => <article key={title} className="rounded-lg bg-[oklch(0.69_0.16_292)] p-7"><span className="text-5xl font-black text-[oklch(0.81_0.18_173)]">0{index + 1}</span><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-relaxed text-[oklch(0.95_0.02_292)]">{copy}</p><button className="mt-6 flex items-center gap-2 font-black">Explore <ChevronRight size={18} /></button></article>)}</div></div></section>
    <section id="plans" className="bg-[oklch(0.75_0.18_173)] px-6 py-14 text-accent-foreground"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="font-black uppercase tracking-[0.16em] text-sm">Ready when they are</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Let good habits grow.</h2></div><Button className="h-14 rounded-full bg-primary px-9 text-primary-foreground hover:bg-primary/90">Get started</Button></div></section>
  </main>;
}