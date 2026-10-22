import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-cancel")({
  head: () => ({
    meta: [{ title: "Ακύρωση πληρωμής — Kids in Business" }],
  }),
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <XCircle size={40} className="text-muted-foreground" />
      </div>

      <div>
        <h1 className="text-4xl font-black sm:text-5xl">Η πληρωμή ακυρώθηκε</h1>
        <p className="mt-4 max-w-sm text-lg text-muted-foreground">
          Δεν χρεώθηκες τίποτα. Μπορείς να επιστρέψεις στις τιμές οποιαδήποτε στιγμή.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/pricing">
          <Button className="h-12 rounded-full px-10 font-black" style={{ background: "oklch(0.57 0.23 292)" }}>
            ← Επιστροφή στις τιμές
          </Button>
        </Link>
        <Link to="/learn">
          <Button variant="outline" className="h-12 rounded-full px-10 font-black">
            Συνέχισε δωρεάν
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Έχεις ερώτηση;{" "}
        <a href="mailto:kidsinbusinessgr@gmail.com" className="font-semibold underline">
          Επικοινώνησε μαζί μας
        </a>
      </p>
    </main>
  );
}
