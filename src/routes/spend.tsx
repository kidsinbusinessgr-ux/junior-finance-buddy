import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, Lock, Unlock } from "lucide-react";
import spendHero from "@/assets/spend-hero-kid.jpg";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/spend")({
  head: () => ({
    meta: [
      { title: "Ξόδεψε — Kids in Business" },
      { name: "description", content: "Μάθε πώς τα παιδιά κάνουν έξυπνες επιλογές με τα χρήματά τους." },
      { property: "og:title", content: "Ξόδεψε — Kids in Business" },
      { property: "og:description", content: "Μάθε πώς τα παιδιά κάνουν έξυπνες επιλογές με τα χρήματά τους." },
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
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative min-h-[560px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-16 pt-5 lg:px-16">
          <BrightlyNav active="spend" />
          <div className="grid items-center gap-8 pt-20 lg:grid-cols-2 lg:pt-28">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Δαπάνες</p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">Εξάσκησε επιλογές με ασφάλεια.</h1>
              <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">Η κάρτα Kids in Business δίνει στα παιδιά πραγματικές επιλογές δαπανών με προστατευτικά όρια που ορίζουν οι γονείς.</p>
              <Link to="/signup">
                <Button className="mt-8 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
              </Link>
            </div>
            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="hero-orb absolute inset-[10%] rounded-full" />
              <img src={spendHero} width={1000} height={1000} alt="Παιδί με κάρτα" className="relative z-10 h-full w-full rounded-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Card controls demo */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Έλεγχος κάρτας</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Η κάρτα της Σοφίας</h2>
            <p className="mt-4 text-lg text-muted-foreground">Οι γονείς ελέγχουν τις ρυθμίσεις — τα παιδιά μαθαίνουν υπεύθυνες δαπάνες.</p>
          </div>
          <div className="mx-auto mt-10 max-w-sm">
            {/* Card visual */}
            <div className={`relative rounded-2xl p-6 text-white shadow-2xl transition-all ${cardLocked ? "bg-[oklch(0.45_0.05_292)]" : "bg-[linear-gradient(135deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]"}`}>
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-widest opacity-80">Kids in Business</span>
                {cardLocked && <Lock className="h-5 w-5 opacity-60" />}
              </div>
              <p className="font-mono text-xl tracking-[0.2em] opacity-90">•••• •••• •••• 4821</p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase opacity-60">Κάτοχος</p>
                  <p className="font-bold">Σοφία Παπαδάκη</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase opacity-60">Υπόλοιπο</p>
                  <p className="text-2xl font-black">€14,50</p>
                </div>
              </div>
              {cardLocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                  <div className="text-center">
                    <Lock className="mx-auto h-10 w-10" />
                    <p className="mt-2 font-bold">Κάρτα κλειδωμένη</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setCardLocked(!cardLocked)}
                className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${cardLocked ? "border-red-300 bg-red-50 text-red-700" : "border-border bg-card hover:bg-muted"}`}
              >
                <span className="flex items-center gap-3 font-semibold">
                  {cardLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5 text-[oklch(0.55_0.17_173)]" />}
                  {cardLocked ? "Κάρτα κλειδωμένη" : "Κάρτα ενεργή"}
                </span>
                <span className={`text-sm font-bold ${cardLocked ? "text-red-600" : "text-[oklch(0.55_0.17_173)]"}`}>
                  {cardLocked ? "Ξεκλείδωσε" : "Κλείδωσε"}
                </span>
              </button>

              <button
                onClick={() => setAlertsOn(!alertsOn)}
                className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${alertsOn ? "border-[oklch(0.7_0.17_173)] bg-[oklch(0.95_0.05_173)]" : "border-border bg-card hover:bg-muted"}`}
              >
                <span className="flex items-center gap-3 font-semibold">
                  {alertsOn ? <Bell className="h-5 w-5 text-[oklch(0.55_0.17_173)]" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                  Ειδοποιήσεις δαπανών
                </span>
                <span className={`text-sm font-bold ${alertsOn ? "text-[oklch(0.55_0.17_173)]" : "text-muted-foreground"}`}>
                  {alertsOn ? "Ενεργές" : "Ανενεργές"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Ασφαλέστερος τρόπος μάθησης</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Προστασία σε κάθε βήμα.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              ["Όρια δαπανών", "Οι γονείς ορίζουν ημερήσια ή εβδομαδιαία όρια ώστε οι αγορές να μένουν στα μέτρα."],
              ["Στιγμιαίες ειδοποιήσεις", "Λάβε ειδοποίηση για κάθε αγορά — ώστε πάντα να ξέρεις τι συμβαίνει."],
              ["Κλείδωμα με ένα πάτημα", "Κλείδωσε ή ξεκλείδωσε την κάρτα οποιαδήποτε στιγμή από οπουδήποτε."],
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
          <h2 className="text-4xl font-black sm:text-5xl">Ξεκίνα σήμερα.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Εγγράψου δωρεάν και δώσε στο παιδί σου μια ασφαλή κάρτα για να μαθαίνει.</p>
          <Link to="/signup">
            <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

