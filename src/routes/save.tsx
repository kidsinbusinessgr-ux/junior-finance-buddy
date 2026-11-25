import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeroArt } from "@/components/hero-art";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { GoalCardBuilder, SmartLesson, eurosToCoins, planFor, type GoalDraft } from "@/components/smart-goals";
import { createSavingsGoal, useChild, useCurrentUser } from "@/hooks/useJFB";

export const Route = createFileRoute("/save")({
  head: () => ({
    meta: [
      { title: "Αποταμίευσε — Kids in Business" },
      { name: "description", content: "Μάθε να βάζεις στόχους S.M.A.R.T. και γράψε τη δική σου κάρτα στόχου." },
      { property: "og:title", content: "Αποταμίευσε — Kids in Business" },
      { property: "og:description", content: "Μάθε να βάζεις στόχους S.M.A.R.T. και γράψε τη δική σου κάρτα στόχου." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavePage,
});

function SavePage() {
  const navigate = useNavigate();
  const { userId } = useCurrentUser();
  const { child } = useChild();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function saveToGoals(d: GoalDraft) {
    if (!child) return;
    const p = planFor(d);
    setSaving(true);
    setSaveError("");
    try {
      await createSavingsGoal(child.id, d.what.trim(), "🎯", eurosToCoins(p.price), {
        why: d.why.trim(),
        weeklyCoins: eurosToCoins(p.weekly),
        deadline: d.deadline,
      });
      navigate({ to: "/goals" });
    } catch {
      setSaveError("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
    } finally {
      setSaving(false);
    }
  }

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
              <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">
                Μάθε να βάζεις στόχους που πετυχαίνουν: συγκεκριμένους, μετρήσιμους, με σχέδιο και ημερομηνία. Μετά γράψε τη δική σου
                κάρτα στόχου.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#karta">
                  <Button className="h-14 rounded-full bg-white px-8 text-base text-[oklch(0.4_0.2_292)] hover:bg-white/90">Γράψε την κάρτα σου ↓</Button>
                </a>
                {userId ? (
                  <Link to="/goals">
                    <Button className="h-14 rounded-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90">Οι στόχοι μου →</Button>
                  </Link>
                ) : (
                  <Link to="/signup">
                    <Button className="h-14 rounded-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
                  </Link>
                )}
              </div>
            </div>
            <HeroArt variant="save" />
          </div>
        </div>
      </section>

      {/* Lesson */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <SmartLesson />
      </section>

      {/* Goal card */}
      <section id="karta" className="scroll-mt-6 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Η σειρά σου</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Η κάρτα στόχου σου</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Γράψε έναν στόχο και δες τα γράμματα S.M.A.R.T. να συμπληρώνονται. Για τα χρήματα γράψε πραγματικές τιμές σε ευρώ,
              και η κάρτα υπολογίζει πότε θα τον φτάσεις.
              {child ? " Τους οικονομικούς στόχους μπορείς να τους στείλεις κατευθείαν στους στόχους σου." : " Μπορείς να την εκτυπώσεις και να την κολλήσεις κάπου που τη βλέπεις."}
            </p>
          </div>
          <GoalCardBuilder mode="lesson" onSave={child ? saveToGoals : undefined} saving={saving} />
          {saveError && <p className="mt-3 text-sm font-bold text-red-600">{saveError}</p>}
        </div>
      </section>

      {/* CTA, for visitors only */}
      {!userId && (
        <section className="bg-background px-6 pb-20 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-4xl font-black sm:text-5xl">Κράτα τους στόχους σου σε ένα μέρος.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Στην εφαρμογή βάζεις χρήματα στην άκρη για κάθε στόχο και βλέπεις κάθε εβδομάδα αν είσαι εντός πλάνου. Την εγγραφή την κάνει ο
              γονιός.
            </p>
            <Link to="/signup">
              <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
