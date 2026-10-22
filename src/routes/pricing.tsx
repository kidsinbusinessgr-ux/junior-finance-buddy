import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Zap } from "lucide-react";
import { useState } from "react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createCheckoutSession } from "@/lib/stripe.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Τιμές & πακέτα — Kids in Business" },
      { name: "description", content: "Ξεκλείδωσε όλα τα μαθήματα, το virtual wallet και το investment simulator. €4,99/μήνα ή €39/χρόνο." },
      { property: "og:title", content: "Τιμές & πακέτα — Kids in Business" },
      { property: "og:description", content: "Ξεκλείδωσε όλα τα μαθήματα, το virtual wallet και το investment simulator. €4,99/μήνα ή €39/χρόνο." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PricingPage,
});

const FEATURES = [
  "Όλα τα μαθήματα οικονομικής παιδείας (6+)",
  "Virtual wallet & κέρδη από tasks",
  "Αποταμιευτικοί στόχοι με progress tracker",
  "Investment simulation — χωρίς πραγματικά χρήματα",
  "Dashboard γονέα & εποπτεία",
  "Badges & XP gamification",
  "Πιστοποιητικό ολοκλήρωσης",
  "Νέα μαθήματα κάθε εβδομάδα",
];

function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCheckout() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        await navigate({ to: "/signup" });
        return;
      }

      const origin = window.location.origin;
      const result = await createCheckoutSession({
        data: {
          plan: selectedPlan,
          successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/pricing`,
          userId: user.id,
          userEmail: user.email ?? undefined,
        },
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  }

  const savingsPercent = Math.round((1 - 3900 / (499 * 12)) * 100);

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-24 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="pricing" />
          <div className="mx-auto max-w-2xl pb-3 pt-20 text-center">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Premium</p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Ξεκλείδωσε τα πάντα.</h1>
            <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">
              Μια συνδρομή. Όλα τα εργαλεία. Ακύρωση οποιαδήποτε στιγμή.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing card */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-lg">
          {/* Plan toggle */}
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-muted p-1.5">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`flex-1 rounded-xl py-3 text-sm font-black transition-all ${
                selectedPlan === "monthly"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Μηνιαία
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`relative flex-1 rounded-xl py-3 text-sm font-black transition-all ${
                selectedPlan === "yearly"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ετήσια
              <span className="absolute -right-1 -top-3 rounded-full bg-[oklch(0.57_0.23_292)] px-2 py-0.5 text-[10px] font-black text-white">
                -{savingsPercent}%
              </span>
            </button>
          </div>

          {/* Price display */}
          <div className="mt-8 rounded-2xl bg-[oklch(0.57_0.23_292)] p-8 text-primary-foreground ring-2 ring-[oklch(0.57_0.23_292)]">
            <div className="flex items-end gap-2">
              {selectedPlan === "monthly" ? (
                <>
                  <span className="text-6xl font-black">€4,99</span>
                  <span className="mb-2 text-lg font-semibold text-[oklch(0.86_0.1_292)]">/μήνα</span>
                </>
              ) : (
                <>
                  <span className="text-6xl font-black">€39</span>
                  <span className="mb-2 text-lg font-semibold text-[oklch(0.86_0.1_292)]">/χρόνο</span>
                </>
              )}
            </div>
            {selectedPlan === "yearly" && (
              <p className="mt-1 text-sm font-semibold text-[oklch(0.86_0.1_292)]">
                Ισοδυναμεί με €3,25/μήνα · Εξοικονομείς €20,88
              </p>
            )}

            <ul className="mt-6 flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm font-semibold">
                  <Check size={16} className="mt-0.5 shrink-0 text-white" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 h-14 w-full rounded-xl bg-white text-[oklch(0.57_0.23_292)] text-base font-black hover:bg-white/90 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Φόρτωση…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={18} />
                  {selectedPlan === "monthly" ? "Συνδρομή €4,99/μήνα →" : "Συνδρομή €39/χρόνο →"}
                </span>
              )}
            </Button>

            <p className="mt-3 text-center text-xs font-semibold text-[oklch(0.86_0.1_292)]">
              Ασφαλής πληρωμή μέσω Stripe · Ακύρωση οποιαδήποτε στιγμή
            </p>
          </div>

          {/* Free plan note */}
          <div className="mt-6 rounded-2xl bg-card p-6 ring-1 ring-border">
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Δωρεάν πλάνο</p>
            <ul className="mt-3 flex flex-col gap-2">
              {[
                "2 μαθήματα εισαγωγής",
                "Preview του virtual wallet",
                "Περιορισμένο dashboard γονέα",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="mt-0.5 shrink-0 text-muted-foreground/60" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-black">Τι περιλαμβάνει το Premium</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-black">Συχνές ερωτήσεις</h2>
          <div className="mt-10 flex flex-col gap-6">
            {[
              {
                q: "Πώς πληρώνω;",
                a: "Μέσω Stripe — αποδεχόμαστε Visa, Mastercard και όλες τις κύριες χρεωστικές κάρτες. Η σύνδεση είναι κρυπτογραφημένη και ασφαλής.",
              },
              {
                q: "Μπορώ να ακυρώσω;",
                a: "Ναι, οποιαδήποτε στιγμή. Δεν υπάρχει περίοδος δέσμευσης. Αφού ακυρώσεις, η πρόσβαση συνεχίζεται μέχρι το τέλος της χρεωμένης περιόδου.",
              },
              {
                q: "Ετήσιο vs Μηνιαίο — τι να επιλέξω;",
                a: `Το ετήσιο σε εξοικονομεί ~${savingsPercent}% σε σύγκριση με το μηνιαίο. Αν θέλεις να δοκιμάσεις πρώτα, ξεκίνα μηνιαία.`,
              },
              {
                q: "Υπάρχουν πραγματικά χρήματα στην εφαρμογή;",
                a: "Όχι. Το Kids in Business χρησιμοποιεί εικονικό νόμισμα. Δεν απαιτείται τραπεζικός λογαριασμός παιδιού.",
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
    </main>
  );
}
