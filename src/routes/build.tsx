import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { createStartup, type CreateStartupResult } from "@/lib/startups.functions";
import { useChild, useCurrentUser } from "@/hooks/useJFB";

const CREATE_ERRORS: Record<Exclude<CreateStartupResult, { ok: true }>["reason"], string> = {
  login: "Συνδέσου για να φτιάξεις το startup σου!",
  no_child: "Μόνο ο λογαριασμός παιδιού μπορεί να φτιάξει startup.",
  bad_words: "Ας κρατήσουμε τα κείμενα ευγενικά 😊 Άλλαξε τις λέξεις που δεν ταιριάζουν και δοκίμασε ξανά.",
  too_many: "Έχεις ήδη 3 startups! Εστίασε σε αυτά που έχεις 💪",
  failed: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
};

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Φτιάξε το Startup σου — Kids in Business" },
      { name: "description", content: "Δημιούργησε το δικό σου startup και παρουσίασέ το στην κοινότητα!" },
    ],
  }),
  component: BuildPage,
});

const STEPS = [
  { label: "Όνομα", emoji: "✏️" },
  { label: "Πρόβλημα", emoji: "🔍" },
  { label: "Λύση", emoji: "💡" },
  { label: "Πελάτης", emoji: "🎯" },
  { label: "Έσοδα", emoji: "💰" },
];

const EMOJIS = ["🚀","💡","🎯","🌱","⚡","🎮","📱","🍕","🎨","🤝","🌍","🔥","💎","🐾","🎵"];

export default function BuildPage() {
  const navigate = useNavigate();
  const { userId, loading: userLoading } = useCurrentUser();
  const { child, loading: childLoading } = useChild();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    emoji: "🚀",
    problem: "",
    solution: "",
    customer: "",
    model: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2;
    if (step === 1) return form.problem.trim().length >= 10;
    if (step === 2) return form.solution.trim().length >= 10;
    if (step === 3) return form.customer.trim().length >= 10;
    if (step === 4) return form.model.trim().length >= 10;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await createStartup({
        data: {
          name: form.name.trim(),
          emoji: form.emoji,
          problem: form.problem.trim(),
          solution: form.solution.trim(),
          customer: form.customer.trim(),
          model: form.model.trim(),
        },
      });
      if (res.ok) {
        navigate({ to: "/startups/$id", params: { id: res.id } });
        return;
      }
      setError(CREATE_ERRORS[res.reason]);
    } catch {
      setError(CREATE_ERRORS.failed);
    } finally {
      setSubmitting(false);
    }
  };

  // Only signed-in children can create a startup.
  const blocked =
    !userLoading && !userId
      ? "login"
      : userId && !childLoading && !child
        ? "no_child"
        : null;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-[oklch(0.55_0.17_173)] px-6 pb-16 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="build" />
          <div className="mx-auto max-w-xl pt-16 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.86_0.1_173)]">Startup Builder</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Φτιάξε το Startup σου 🚀</h1>
            <p className="mt-4 text-lg text-[oklch(0.96_0.02_173)]">5 βήματα και η ιδέα σου γίνεται pitch page!</p>
          </div>
        </div>
      </section>

      {blocked && (
        <section className="mx-auto max-w-xl px-6 py-16 text-center">
          <div className="text-6xl">🔐</div>
          <p className="mt-4 text-xl font-black">{CREATE_ERRORS[blocked]}</p>
          {blocked === "login" && (
            <Link to="/login">
              <Button className="mt-6 h-12 rounded-full px-8 font-black">Σύνδεση →</Button>
            </Link>
          )}
        </section>
      )}

      {!blocked && (<>
      {/* Progress */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-1 px-6 py-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black transition-all ${
                i < step ? "bg-[oklch(0.55_0.17_173)] text-white" :
                i === step ? "bg-[oklch(0.57_0.23_292)] text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? "✓" : s.emoji}
              </div>
              <span className={`hidden text-xs font-bold sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <section className="mx-auto max-w-xl px-6 py-10">
        {/* Step 0 — Όνομα */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Δώσε όνομα στο startup σου!</h2>
              <p className="mt-1 text-muted-foreground">Κάτι που να μένει στο μυαλό. Μπορείς να το αλλάξεις αργότερα.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Διάλεξε emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => set("emoji", e)}
                    className={`rounded-xl p-2 text-2xl transition-all ${form.emoji === e ? "bg-[oklch(0.57_0.23_292)] ring-2 ring-[oklch(0.57_0.23_292)]" : "bg-muted hover:bg-muted/70"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">Όνομα startup <span className="text-destructive">*</span></label>
              <input
                className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                placeholder="π.χ. EcoRide, FoodShare, StudyBuddy…"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={40}
              />
            </div>

            {child && (
              <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-bold">
                👤 Ιδρυτής: <span className="font-black">{child.name}</span>
              </p>
            )}
          </div>
        )}

        {/* Step 1 — Πρόβλημα */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Ποιο πρόβλημα λύνεις; 🔍</h2>
              <p className="mt-1 text-muted-foreground">Περίγραψε το πρόβλημα που βλέπεις. Όσο πιο συγκεκριμένο, τόσο καλύτερο.</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-bold">💡 Παράδειγμα:</p>
              <p className="mt-1 text-muted-foreground">«Οι μαθητές ξεχνούν να φέρουν φαγητό στο σχολείο και αναγκάζονται να αγοράζουν ακριβά και ανθυγιεινά τρόφιμα.»</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Περίγραψε το πρόβλημα <span className="text-destructive">*</span></label>
              <textarea
                className="min-h-[120px] w-full resize-none rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                placeholder="Τι πρόβλημα βλέπεις γύρω σου που κανείς δεν έχει λύσει σωστά;"
                value={form.problem}
                onChange={(e) => set("problem", e.target.value)}
                maxLength={300}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.problem.length}/300</p>
            </div>
          </div>
        )}

        {/* Step 2 — Λύση */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Ποια είναι η λύση σου; 💡</h2>
              <p className="mt-1 text-muted-foreground">Τι φτιάχνεις ή τι προσφέρεις; App, υπηρεσία, προϊόν;</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-bold">💡 Παράδειγμα:</p>
              <p className="mt-1 text-muted-foreground">«App που οι γονείς φτιάχνουν το μενού της εβδομάδας και εμείς παραδίνουμε το φαγητό στο σχολείο το πρωί.»</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Η λύση σου <span className="text-destructive">*</span></label>
              <textarea
                className="min-h-[120px] w-full resize-none rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                placeholder="Πώς λύνεις το πρόβλημα; Τι φτιάχνεις;"
                value={form.solution}
                onChange={(e) => set("solution", e.target.value)}
                maxLength={300}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.solution.length}/300</p>
            </div>
          </div>
        )}

        {/* Step 3 — Πελάτης */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Ποιος είναι ο πελάτης σου; 🎯</h2>
              <p className="mt-1 text-muted-foreground">Μην πεις «όλοι» — είσαι συγκεκριμένος/η!</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-bold">💡 Παράδειγμα:</p>
              <p className="mt-1 text-muted-foreground">«Γονείς 30-45 που δουλεύουν πλήρη ωράριο, έχουν παιδιά σε δημοτικό/γυμνάσιο στην πόλη και δεν έχουν χρόνο να φτιάχνουν φαγητό κάθε μέρα.»</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Target customer <span className="text-destructive">*</span></label>
              <textarea
                className="min-h-[120px] w-full resize-none rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                placeholder="Ποιος είναι ο ιδανικός πελάτης σου; Ηλικία, lifestyle, πρόβλημα…"
                value={form.customer}
                onChange={(e) => set("customer", e.target.value)}
                maxLength={300}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.customer.length}/300</p>
            </div>
          </div>
        )}

        {/* Step 4 — Business Model */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Πώς βγάζεις χρήματα; 💰</h2>
              <p className="mt-1 text-muted-foreground">Ποιο είναι το business model σου; Πώς χρεώνεις;</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-bold">💡 Παραδείγματα:</p>
              <p className="mt-1 text-muted-foreground">Subscription €8/μήνα · Χρέωση ανά παραγγελία €3 · Freemium + premium πλάνο · Commission 10% σε κάθε πώληση</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Business model <span className="text-destructive">*</span></label>
              <textarea
                className="min-h-[120px] w-full resize-none rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                placeholder="Πώς χρεώνεις; Πόσο; Ποιος πληρώνει;"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                maxLength={300}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.model.length}/300</p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="h-12 flex-1 rounded-full" onClick={() => setStep((s) => s - 1)}>
              ← Πίσω
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="h-12 flex-1 rounded-full font-black"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Συνέχεια →
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white hover:bg-[oklch(0.48_0.17_173)]"
              disabled={!canNext() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Δημοσίευση…" : "🚀 Δημοσίευσε το Startup σου!"}
            </Button>
          )}
        </div>
      </section>
      </>)}
    </main>
  );
}
