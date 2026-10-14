import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import earnHero from "@/assets/earn-girl.png";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/earn")({
  head: () => ({
    meta: [
      { title: "Κέρδισε — Kids in Business" },
      { name: "description", content: "Μάθε πώς τα παιδιά κερδίζουν τα πρώτα τους χρήματα κάνοντας δουλειές στο σπίτι." },
      { property: "og:title", content: "Κέρδισε — Kids in Business" },
      { property: "og:description", content: "Μάθε πώς τα παιδιά κερδίζουν τα πρώτα τους χρήματα κάνοντας δουλειές στο σπίτι." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EarnPage,
});

const initialTasks = [
  { id: 1, label: "Τάισε τα ζώα", amount: "€2,00", done: false },
  { id: 2, label: "Τακτοποίησε το δωμάτιό σου", amount: "€1,50", done: true },
  { id: 3, label: "Βοήθησε στο μαγείρεμα", amount: "€2,50", done: false },
];

function EarnPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggle = (id: number) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const earned = tasks
    .filter((t) => t.done)
    .reduce((sum, t) => sum + parseFloat(t.amount.replace("€", "").replace(",", ".")), 0);

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative min-h-[560px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-16 pt-5 lg:px-16">
          <BrightlyNav active="earn" />
          <div className="grid items-center gap-8 pt-20 lg:grid-cols-2 lg:pt-28">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Κέρδισε</p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">Μετάτρεψε τη δουλειά σε αξία.</h1>
              <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">Τα παιδιά μαθαίνουν την αξία της εργασίας ολοκληρώνοντας δουλειές και κερδίζοντας τα πρώτα τους χρήματα.</p>
              <Link to="/signup">
                <Button className="mt-8 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
              </Link>
            </div>
            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="hero-orb absolute inset-[10%] rounded-full" />
              <img src={earnHero} width={1000} height={1000} alt="Παιδί κερδίζει χρήματα" className="relative z-10 h-full w-full rounded-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive task widget */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Δουλειές που αποδίδουν</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Σήμερα στη λίστα</h2>
            <p className="mt-4 text-lg text-muted-foreground">Κάνε κλικ για να επισημάνεις τις δουλειές που ολοκλήρωσες.</p>
          </div>
          <div className="mx-auto mt-10 max-w-md rounded-2xl bg-card p-6 shadow-lg">
            <ul className="grid gap-3">
              {tasks.map((task) => (
                <li key={task.id}>
                  <button
                    onClick={() => toggle(task.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors ${task.done ? "border-[oklch(0.7_0.17_173)] bg-[oklch(0.95_0.05_173)]" : "border-border bg-background hover:bg-muted"}`}
                  >
                    <span className="flex items-center gap-3 font-semibold">
                      {task.done ? (
                        <CheckCircle2 className="h-5 w-5 text-[oklch(0.55_0.17_173)]" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={task.done ? "line-through text-muted-foreground" : ""}>{task.label}</span>
                    </span>
                    <span className="font-black text-[oklch(0.55_0.17_173)]">{task.amount}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between rounded-xl bg-[oklch(0.57_0.23_292)] px-5 py-4 text-primary-foreground">
              <span className="font-bold">Σύνολο κερδών σήμερα</span>
              <span className="text-2xl font-black">€{earned.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Skills cards */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Δεξιότητες πραγματικής ζωής</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Πιο πολύ από χρήματα.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              ["Υπευθυνότητα", "Η ολοκλήρωση δουλειών χτίζει την αίσθηση της υπευθυνότητας από νωρίς."],
              ["Αυτοπεποίθηση", "Τα παιδιά νιώθουν υπερήφανα βλέποντας τους κόπους τους να αποδίδουν."],
              ["Αξία χρημάτων", "Όταν κερδίζεις κάτι μόνος σου, μαθαίνεις να το εκτιμάς αληθινά."],
            ].map(([title, copy]) => (
              <div key={title as string} className="rounded-xl bg-card p-6 shadow-sm">
                <h3 className="text-xl font-black">{title as string}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background px-6 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-4xl font-black sm:text-5xl">Έτοιμοι να αρχίσετε;</h2>
          <p className="mt-4 text-lg text-muted-foreground">Εγγράψου δωρεάν και ξεκίνα να κερδίζεις σήμερα.</p>
          <Link to="/signup">
            <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

