import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useChild, useCurrentUser } from "@/hooks/useJFB";
import { MoneyLedger } from "@/components/money-ledger";

// The child's real money: income and expenses in euros, budgets per category.

export const Route = createFileRoute("/money")({
  head: () => ({
    meta: [
      { title: "Τα χρήματά μου – Kids in Business" },
      { name: "description", content: "Το βιβλίο εσόδων και εξόδων σου, με αληθινά ευρώ" },
    ],
  }),
  component: MoneyPage,
});

function MoneyPage() {
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useCurrentUser();
  const { child, loading: childLoading } = useChild();

  if (!authLoading && !childLoading) {
    if (!userId) {
      navigate({ to: "/login" });
      return null;
    }
    if (!child) {
      navigate({ to: "/onboarding" });
      return null;
    }
  }

  if (authLoading || childLoading || !child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <section className="bg-primary px-5 pb-8 pt-6 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/child-dashboard" className="mb-6 flex items-center gap-2 text-sm font-bold text-[oklch(0.86_0.1_292)]">
            ← Αρχική
          </Link>
          <h1 className="text-3xl font-black">📒 Τα χρήματά μου</h1>
          <p className="mt-2 text-sm text-[oklch(0.9_0.06_292)]">
            Το βιβλίο εσόδων και εξόδων σου. Γράφε κάθε φορά που σου μπαίνουν ή που ξοδεύεις χρήματα, και στο τέλος του μήνα δες πού πήγαν.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-5 pt-5 sm:px-8">
        <MoneyLedger childId={child.id} name={child.name} />
      </div>
    </main>
  );
}
