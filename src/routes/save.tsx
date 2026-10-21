import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import saveHero from "@/assets/save-hero-cartoon.png";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/save")({
  head: () => ({
    meta: [
      { title: "Αποταμίευσε — Kids in Business" },
      { name: "description", content: "Βοήθησε το παιδί σου να χτίσει την αποταμιευτική συνήθεια με στόχους και πρόοδο." },
      { property: "og:title", content: "Αποταμίευσε — Kids in Business" },
      { property: "og:description", content: "Βοήθησε το παιδί σου να χτίσει την αποταμιευτική συνήθεια με στόχους και πρόοδο." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavePage,
});

const GOAL_TARGET = 48;
const GOAL_SAVED = 21;

function SavePage() {
  const [weeklyAmount, setWeeklyAmount] = useState(3);

  const weeksNeeded = Math.ceil((GOAL_TARGET - GOAL_SAVED) / weeklyAmount);
  const progressPct = Math.round((GOAL_SAVED / GOAL_TARGET) * 100);

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative min-h-[560px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-16 pt-5 lg:px-16">
          <BrightlyNav active="save" />
          <div className="grid items-center gap-8 pt-20 lg:grid-cols-2 lg:pt-28">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Αποταμίευση</p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">Φέρε τους στόχους πιο κοντά.</h1>
              <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">Τα παιδιά μαθαίνουν να αποταμιεύουν θέτοντας πραγματικούς στόχους και παρακολουθώντας την πρόοδό τους κάθε εβδομάδα.</p>
              <Link to="/signup">
                <Button className="mt-8 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
              </Link>
            </div>
            <div className="relative mx-auto w-full max-w-[500px]">
<div className="hero-orb absolute inset-[10%] rounded-full" />
              <img src={saveHero} width={1000} height={1000} alt="Παιδί αποταμιεύει" className="relative z-10 h-full w-full rounded-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Savings goal demo */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Ο στόχος της Σοφίας</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Πατίνια</h2>
            <p className="mt-4 text-lg text-muted-foreground">Χρησιμοποίησε το slider για να δεις πόσο γρήγορα φτάνεις τον στόχο.</p>
          </div>

          <div className="mx-auto mt-10 max-w-md rounded-2xl bg-card p-7 shadow-lg">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Εξοικονομήθηκαν: <strong>€{GOAL_SAVED}</strong></span>
                <span>Στόχος: <strong>€{GOAL_TARGET}</strong></span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[oklch(0.57_0.23_292)] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-sm text-muted-foreground">{progressPct}% ολοκληρώθηκε</p>
            </div>

            {/* Slider */}
            <label className="block">
              <span className="text-sm font-semibold text-muted-foreground">Εβδομαδιαία αποταμίευση: <strong className="text-foreground">€{weeklyAmount}</strong></span>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={weeklyAmount}
                onChange={(e) => setWeeklyAmount(parseFloat(e.target.value))}
                className="mt-3 w-full accent-[oklch(0.57_0.23_292)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>€1</span><span>€10</span>
              </div>
            </label>

            {/* Result */}
            <div className="mt-6 rounded-xl bg-[oklch(0.57_0.23_292)] px-5 py-4 text-center text-primary-foreground">
              <p className="text-sm opacity-80">Θα φτάσεις τον στόχο σου σε</p>
              <p className="mt-1 text-3xl font-black">{weeksNeeded} εβδομάδες</p>
              <p className="text-sm opacity-80">αποταμιεύοντας €{weeklyAmount}/εβδ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Habit cards */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Μια συνήθεια που μεγαλώνει</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Μικρά ποσά. Μεγάλα αποτελέσματα.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              ["Θέσε στόχο", "Από παιχνίδια μέχρι ταξίδια — κάθε όνειρο αρχίζει με έναν στόχο."],
              ["Παρακολούθησε την πρόοδο", "Μια οπτική γραμμή προόδου κρατά τα παιδιά κινητοποιημένα κάθε μέρα."],
              ["Γιόρτασε τη νίκη", "Όταν φτάνεις τον στόχο, αξίζει εορτασμός — και ένας νέος στόχος!"],
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
          <h2 className="text-4xl font-black sm:text-5xl">Θέσε τον πρώτο στόχο.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Εγγράψου δωρεάν και βοήθησε το παιδί σου να φτάσει τους στόχους του.</p>
          <Link to="/signup">
            <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

