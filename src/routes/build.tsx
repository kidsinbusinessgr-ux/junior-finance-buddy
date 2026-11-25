import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { createStartup, type CreateStartupResult } from "@/lib/startups.functions";
import { IDEA_SPARKS } from "@/lib/startup-plan";
import { useChild, useCurrentUser } from "@/hooks/useJFB";

const CREATE_ERRORS: Record<Exclude<CreateStartupResult, { ok: true }>["reason"], string> = {
  login: "Συνδέσου για να φτιάξεις το startup σου.",
  no_child: "Μόνο ο λογαριασμός παιδιού μπορεί να φτιάξει startup.",
  bad_words: "Ας κρατήσουμε τα κείμενα ευγενικά 😊 Άλλαξε τις λέξεις που δεν ταιριάζουν και δοκίμασε ξανά.",
  too_many: "Έχεις ήδη 3 startups. Εστίασε σε αυτά που έχεις 💪",
  failed: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
};

export const Route = createFileRoute("/build")({
  head: () => ({
    meta: [
      { title: "Φτιάξε το startup σου – Kids in Business" },
      { name: "description", content: "Βήμα βήμα, από την ιδέα στο business plan: πελάτες, ανταγωνισμός, κοστολόγηση με break-even και διαφήμιση." },
    ],
  }),
  component: BuildPage,
});

// Phase 1 of the business plan (the workbook's first chapters). Phases 2 and 3
// (design, costing and break-even, ad) continue on the startup's own page.
const STEPS = [
  { label: "Ιδέα", emoji: "✏️" },
  { label: "Πρόβλημα", emoji: "🔍" },
  { label: "Πελάτες", emoji: "🎯" },
  { label: "USP", emoji: "⭐" },
  { label: "Πωλήσεις", emoji: "💰" },
];

const EMOJIS = ["🚀","💡","🎯","🌱","⚡","🎮","📱","🍕","🧁","🎨","👕","🐾","🧼","🎁","🎵"];

const DRAFT_KEY = "kib-build-draft";

type Form = {
  name: string;
  emoji: string;
  problem: string;
  solution: string;
  customer: string;
  competitors: string;
  usp: string;
  model: string;
};

const EMPTY: Form = { name: "", emoji: "🚀", problem: "", solution: "", customer: "", competitors: "", usp: "", model: "" };

function Field({
  label,
  value,
  onChange,
  placeholder,
  max = 300,
  required = true,
  rows = "min-h-[110px]",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max?: number;
  required?: boolean;
  rows?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">
        {label} {required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(προαιρετικό)</span>}
      </label>
      <textarea
        className={`${rows} w-full resize-none rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">{value.length}/{max}</p>
    </div>
  );
}

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-sm">
      <p className="font-bold">💡 Παράδειγμα</p>
      <div className="mt-1 text-muted-foreground">{children}</div>
    </div>
  );
}

function Questions({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-[oklch(0.97_0.03_292)] p-4 text-sm">
      <p className="font-black">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((q) => (
          <li key={q}>✅ {q}</li>
        ))}
      </ul>
    </div>
  );
}

export default function BuildPage() {
  const navigate = useNavigate();
  const { userId, loading: userLoading } = useCurrentUser();
  const { child, loading: childLoading } = useChild();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [sparksOpen, setSparksOpen] = useState(false);

  // Keep the answers in this browser, so the founder can finish another day.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setForm({ ...EMPTY, ...(JSON.parse(raw) as Partial<Form>) });
    } catch {
      /* no saved draft */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* private mode */
    }
  }, [form, loaded]);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2;
    if (step === 1) return form.problem.trim().length >= 10 && form.solution.trim().length >= 10;
    if (step === 2) return form.customer.trim().length >= 10;
    if (step === 3) return form.usp.trim().length >= 10;
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
          competitors: form.competitors.trim(),
          usp: form.usp.trim(),
        },
      });
      if (res.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
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
            <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.86_0.1_173)]">Business plan</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Φτιάξε το startup σου</h1>
            <p className="mt-4 text-lg text-[oklch(0.96_0.02_173)]">Από την ιδέα στο πραγματικό σχέδιο, σε τρεις φάσεις.</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-2xl gap-2 text-left text-sm sm:grid-cols-3">
            {[
              ["1", "Η ιδέα", "Πρόβλημα, πελάτες, τι σε κάνει να ξεχωρίζεις", true],
              ["2", "Το σχέδιο", "Σχεδίασε το προϊόν, κοστολόγησέ το, βρες το break-even", false],
              ["3", "Η διαφήμιση", "Φτιάξε την αφίσα ή το post του προϊόντος σου", false],
            ].map(([n, t, d, now]) => (
              <div key={n as string} className={`rounded-2xl px-4 py-3 ${now ? "bg-white text-foreground" : "bg-white/15"}`}>
                <p className="font-black">Φάση {n as string} · {t as string}</p>
                <p className={`mt-0.5 text-xs ${now ? "text-muted-foreground" : "text-[oklch(0.93_0.03_173)]"}`}>{d as string}</p>
              </div>
            ))}
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
        <div className="mx-auto max-w-xl px-6 py-3">
          <p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Φάση 1 · Η ιδέα</p>
          <div className="flex items-center gap-1">
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
      </div>

      {/* Form */}
      <section className="mx-auto max-w-xl px-6 py-10">
        {/* Step 0 – Idea and name */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Η ιδέα σου και το όνομά της</h2>
              <p className="mt-1 text-muted-foreground">Ξεκίνα από κάτι που σου αρέσει και ξέρεις να κάνεις. Το όνομα μπορεί να αλλάξει αργότερα.</p>
            </div>

            <div className="rounded-2xl border bg-card p-4">
              <button type="button" onClick={() => setSparksOpen((o) => !o)} className="flex w-full items-center justify-between text-left font-black">
                <span>💭 Δεν έχεις ιδέα ακόμα; Δες μερικές</span>
                <span className="text-muted-foreground">{sparksOpen ? "−" : "+"}</span>
              </button>
              {sparksOpen && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {IDEA_SPARKS.map((s) => (
                    <div key={s.title} className="rounded-xl bg-muted/40 p-3 text-sm">
                      <p className="font-black">{s.emoji} {s.title}</p>
                      <p className="mt-0.5 text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Γράψε όλες τις ιδέες σου σε ένα χαρτί, μεγάλες και μικρές. Μετά κράτα αυτή που σε ενθουσιάζει και μπορείς πραγματικά να κάνεις.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Διάλεξε emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" onClick={() => set("emoji", e)}
                    className={`rounded-xl p-2 text-2xl transition-all ${form.emoji === e ? "bg-[oklch(0.57_0.23_292)] ring-2 ring-[oklch(0.57_0.23_292)]" : "bg-muted hover:bg-muted/70"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">Όνομα της εταιρείας σου <span className="text-destructive">*</span></label>
              <input
                className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]"
                placeholder="π.χ. Sweet Corner, Paw Walkers, EcoTees…"
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

        {/* Step 1 – Problem and solution */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Ποιο πρόβλημα λύνεις και πώς;</h2>
              <p className="mt-1 text-muted-foreground">Κάθε επιχείρηση λύνει ένα πρόβλημα ή κάνει τη ζωή κάποιου πιο εύκολη ή πιο ωραία.</p>
            </div>
            <Example>
              <p>Πρόβλημα: «Στις σχολικές εκδηλώσεις δεν υπάρχουν σπιτικά γλυκά σε μικρές μερίδες».</p>
              <p className="mt-1">Η επιχείρησή μου: «Ψήνω cupcakes με θέματα για κάθε γιορτή και τα πουλάω σε κουτάκια των τεσσάρων».</p>
            </Example>
            <Field label="Το πρόβλημα" value={form.problem} onChange={(v) => set("problem", v)} placeholder="Τι πρόβλημα βλέπεις γύρω σου;" />
            <Field
              label="Η επιχείρησή μου: τι θα προσφέρει και πώς θα λειτουργεί"
              value={form.solution}
              onChange={(v) => set("solution", v)}
              placeholder="Τι φτιάχνεις ή τι υπηρεσία προσφέρεις;"
            />
          </div>
        )}

        {/* Step 2 – Customers */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Ποιοι είναι οι πελάτες σου;</h2>
              <p className="mt-1 text-muted-foreground">Όταν ξέρεις ποιος θα αγοράσει, ξέρεις και τι θα του αρέσει. Μη γράψεις «όλοι».</p>
            </div>
            <Questions
              title="Σκέψου:"
              items={[
                "Ποιος θα αγοράσει το προϊόν ή την υπηρεσία μου;",
                "Ποια ανάγκη του ικανοποιώ;",
                "Αγοράζει ήδη κάτι παρόμοιο;",
                "Πώς θα τον βρω και πώς θα μιλήσω μαζί του;",
              ]}
            />
            <Example>«Γονείς και δάσκαλοι που οργανώνουν σχολικές γιορτές, και συμμαθητές μου που θέλουν ένα γλυκό δώρο για γενέθλια».</Example>
            <Field label="Οι πελάτες μου" value={form.customer} onChange={(v) => set("customer", v)} placeholder="Ποιοι είναι; Ηλικία, πού βρίσκονται, τι χρειάζονται…" />
          </div>
        )}

        {/* Step 3 – Competitors and USP */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Τι σε κάνει να ξεχωρίζεις;</h2>
              <p className="mt-1 text-muted-foreground">
                Ψάξε ποιος άλλος πουλάει το ίδιο. Αν είναι πολλοί, χρειάζεσαι κάτι που μόνο εσύ προσφέρεις: το USP σου (Unique Selling Point).
                Αν δεν το πουλάει κανείς, αναρωτήσου γιατί.
              </p>
            </div>
            <Field
              label="Ποιοι άλλοι κάνουν το ίδιο;"
              value={form.competitors}
              onChange={(v) => set("competitors", v)}
              placeholder="π.χ. ο φούρνος της γειτονιάς, τα σουπερμάρκετ…"
              required={false}
              rows="min-h-[80px]"
            />
            <Questions
              title="Το USP σου:"
              items={[
                "Ποιο είναι το μοναδικό πλεονέκτημα του προϊόντος σου;",
                "Ποιο ιδιαίτερο χαρακτηριστικό το κάνει να πουλάει;",
                "Τι σε κάνει να ξεχωρίζεις από τους άλλους;",
              ]}
            />
            <Example>«Κάθε κουτάκι έχει cupcakes με το θέμα της γιορτής και κάρτα με το όνομα του παιδιού».</Example>
            <Field label="Το USP μου" value={form.usp} onChange={(v) => set("usp", v)} placeholder="Γιατί να διαλέξουν εσένα;" max={300} />
          </div>
        )}

        {/* Step 4 – Selling */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">Πού θα το πουλάς και πώς θα πληρώνεσαι;</h2>
              <p className="mt-1 text-muted-foreground">Την ακριβή τιμή θα τη βρεις στη Φάση 2, με την κοστολόγηση.</p>
            </div>
            <Example>Σε σχολικές εκδηλώσεις και με παραγγελίες από γονείς · €2 το cupcake ή €7 το κουτάκι των τεσσάρων</Example>
            <Field label="Πωλήσεις" value={form.model} onChange={(v) => set("model", v)} placeholder="Πού πουλάς; Πώς πληρώνει ο πελάτης; Μία φορά, συνδρομή, ανά παραγγελία;" />

            <div className="rounded-2xl bg-[oklch(0.95_0.05_173)] p-4 text-sm text-[oklch(0.3_0.1_173)]">
              <p className="font-black">Μετά τη δημοσίευση συνεχίζεις στη σελίδα του startup σου:</p>
              <p className="mt-1">🎨 Σχεδίασε το προϊόν · 🧮 Κοστολόγηση και break-even · 📣 Η διαφήμισή σου</p>
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
          {step < STEPS.length - 1 ? (
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
              {submitting ? "Δημοσίευση…" : "🚀 Δημοσίευσε και πάμε στη Φάση 2"}
            </Button>
          )}
        </div>
      </section>
      </>)}
    </main>
  );
}
