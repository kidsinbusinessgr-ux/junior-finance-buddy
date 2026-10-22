import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Τιμές & πακέτα — Kids in Business" },
      { name: "description", content: "Επέλεξε το πακέτο που ταιριάζει στην οικογένειά σου και ξεκίνα με 14 μέρες δωρεάν δοκιμή." },
      { property: "og:title", content: "Τιμές & πακέτα — Kids in Business" },
      { property: "og:description", content: "Επέλεξε το πακέτο που ταιριάζει στην οικογένειά σου και ξεκίνα με 14 μέρες δωρεάν δοκιμή." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    key: "individual",
    badge: null,
    name: "Ατομικό",
    price: "3,99",
    description: "Για ένα παιδί που θέλει να ξεκινήσει τη χρηματοοικονομική του παιδεία.",
    features: [
      "1 παιδί",
      "Όλα τα μαθήματα (6+)",
      "Virtual wallet & κέρδη από tasks",
      "Αποταμιευτικοί στόχοι",
      "Investment simulation",
      "Εποπτεία & dashboard γονέα",
      "Πιστοποιητικό ολοκλήρωσης",
    ],
    cta: "Ξεκίνα δωρεάν",
    href: "https://buy.stripe.com/5kQ9ATeVI0yKfTog9x8AE00",
    highlight: false,
  },
  {
    key: "family",
    badge: "Πιο δημοφιλές",
    name: "Οικογένεια",
    price: "5,99",
    description: "Για οικογένειες με περισσότερα παιδιά — ένα πακέτο για όλους.",
    features: [
      "Μέχρι 4 παιδιά",
      "Όλα του Ατομικού",
      "Αναφορές προόδου ανά παιδί",
      "Σύγκριση επιδόσεων μεταξύ παιδιών",
      "Προτεραιότητα στην υποστήριξη",
    ],
    cta: "Ξεκίνα δωρεάν",
    href: "https://buy.stripe.com/3cI7sL6pc5T422yaPd8AE01",
    highlight: true,
  },
];

function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-24 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="pricing" />
          <div className="mx-auto max-w-2xl pb-3 pt-20 text-center">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Πακέτα & τιμές</p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Μια πιο έξυπνη αρχή.</h1>
            <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">
              14 μέρες δωρεάν δοκιμή — χωρίς χρεωστική κάρτα. Ακύρωση οποιαδήποτε στιγμή.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <article
                key={plan.key}
                className={`relative flex flex-col rounded-2xl p-8 shadow-sm ${
                  plan.highlight
                    ? "bg-[oklch(0.57_0.23_292)] text-primary-foreground ring-2 ring-[oklch(0.57_0.23_292)]"
                    : "bg-card ring-1 ring-border"
                }`}
              >
                {plan.badge && (
                  <span className="mb-4 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide">
                    {plan.badge}
                  </span>
                )}

                <p className={`text-sm font-black uppercase tracking-widest ${plan.highlight ? "text-[oklch(0.86_0.1_292)]" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>

                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-black">€{plan.price}</span>
                  <span className={`mb-1.5 text-sm font-semibold ${plan.highlight ? "text-[oklch(0.86_0.1_292)]" : "text-muted-foreground"}`}>/μήνα</span>
                </div>

                <p className={`mt-3 text-sm leading-relaxed ${plan.highlight ? "text-[oklch(0.93_0.04_292)]" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>

                <ul className="mt-6 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-semibold">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${plan.highlight ? "text-white" : "text-[oklch(0.57_0.23_292)]"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-black transition-all hover:-translate-y-0.5 active:scale-95 ${
                    plan.highlight
                      ? "bg-white text-[oklch(0.57_0.23_292)]"
                      : "bg-[oklch(0.57_0.23_292)] text-white"
                  }`}
                >
                  {plan.cta} →
                </a>

                <p className={`mt-3 text-center text-xs font-semibold ${plan.highlight ? "text-[oklch(0.86_0.1_292)]" : "text-muted-foreground"}`}>
                  14 μέρες δωρεάν · Ακύρωση οποιαδήποτε στιγμή
                </p>
              </article>
            ))}
          </div>

          {/* What's included in both */}
          <div className="mt-16 rounded-2xl bg-card p-8 ring-1 ring-border">
            <h2 className="text-center text-2xl font-black">Συμπεριλαμβάνεται σε κάθε πακέτο</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: "📚", title: "6+ Μαθήματα", desc: "Βίντεο, quiz και δραστηριότητες για κάθε επίπεδο." },
                { icon: "🪙", title: "Virtual Wallet", desc: "Τα παιδιά κερδίζουν, ξοδεύουν και αποταμιεύουν σε ασφαλές περιβάλλον." },
                { icon: "📈", title: "Investment Sim", desc: "Προσομοίωση επενδύσεων χωρίς πραγματικά χρήματα." },
                { icon: "👨‍👩‍👧", title: "Dashboard Γονέα", desc: "Παρακολούθηση προόδου και εποπτεία δραστηριοτήτων." },
                { icon: "🏆", title: "Πιστοποιητικό", desc: "Ψηφιακό πιστοποιητικό ολοκλήρωσης κάθε μαθήματος." },
                { icon: "🔒", title: "Ασφαλές", desc: "Χωρίς πραγματικές συναλλαγές ή τραπεζικά δεδομένα." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-black text-sm">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-black">Συχνές ερωτήσεις</h2>
          <div className="mt-10 flex flex-col gap-6">
            {[
              {
                q: "Χρειάζομαι πιστωτική κάρτα για τη δωρεάν δοκιμή;",
                a: "Ναι, χρειάζεται κάρτα για να ξεκινήσεις — αλλά δεν χρεωνόμαστε τίποτα τις πρώτες 14 μέρες. Μπορείς να ακυρώσεις πριν τη λήξη χωρίς κόστος.",
              },
              {
                q: "Μπορώ να αλλάξω πακέτο μετά την εγγραφή;",
                a: "Φυσικά. Μπορείς να αναβαθμίσεις ή υποβαθμίσεις πακέτο οποιαδήποτε στιγμή από τις ρυθμίσεις του λογαριασμού σου.",
              },
              {
                q: "Πόσα παιδιά μπορώ να προσθέσω;",
                a: "Με το Ατομικό, 1 παιδί. Με το Οικογένεια, μέχρι 4 παιδιά με ξεχωριστό προφίλ και dashboard για καθένα.",
              },
              {
                q: "Υπάρχουν πραγματικά χρήματα στην εφαρμογή;",
                a: "Όχι. Το Kids in Business χρησιμοποιεί εικονικό νόμισμα για εκπαιδευτικούς σκοπούς. Δεν απαιτείται τραπεζικός λογαριασμός παιδιού.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl bg-card p-6 ring-1 ring-border">
                <p className="font-black">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-4xl font-black sm:text-5xl">Έτοιμος να ξεκινήσεις;</h2>
          <p className="mt-4 text-lg text-muted-foreground">14 μέρες δωρεάν, χωρίς δέσμευση.</p>
          <Link
            to="/signup"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full px-10 text-base font-black text-white transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            Δημιούργησε λογαριασμό →
          </Link>
        </div>
      </section>
    </main>
  );
}

