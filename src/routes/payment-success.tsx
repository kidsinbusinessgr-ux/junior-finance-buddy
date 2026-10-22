import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { verifyCheckoutSession } from "@/lib/stripe.functions";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [{ title: "Πληρωμή επιτυχής — Kids in Business" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) ?? "",
  }),
  component: PaymentSuccessPage,
});

type Status = "loading" | "success" | "error";

function PaymentSuccessPage() {
  const { session_id } = Route.useSearch();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!session_id) {
      setStatus("error");
      setErrorMsg("Δεν βρέθηκε ID συνεδρίας. Παρακαλώ επικοινωνήστε μαζί μας.");
      return;
    }

    (async () => {
      try {
        const result = await verifyCheckoutSession({ data: { sessionId: session_id } });

        if (!result.paid) {
          setStatus("error");
          setErrorMsg("Η πληρωμή δεν ολοκληρώθηκε. Παρακαλώ δοκιμάστε ξανά.");
          return;
        }

        const { error } = await supabase.auth.updateUser({
          data: { subscription_tier: "paid", subscription_plan: result.plan },
        });

        if (error) {
          console.error("Metadata update failed:", error.message);
        }

        setStatus("success");
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setErrorMsg("Παρουσιάστηκε σφάλμα κατά την επαλήθευση. Αν χρεωθήκατε, επικοινωνήστε μαζί μας.");
      }
    })();
  }, [session_id]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <Loader2 size={48} className="animate-spin text-[oklch(0.57_0.23_292)]" />
        <p className="text-lg font-black">Επαλήθευση πληρωμής…</p>
        <p className="text-muted-foreground">Παρακαλώ περιμένετε λίγα δευτερόλεπτα.</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-4xl">⚠️</span>
        </div>
        <div>
          <h1 className="text-3xl font-black">Κάτι πήγε στραβά</h1>
          <p className="mt-3 max-w-sm text-muted-foreground">{errorMsg}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/pricing">
            <Button variant="outline" className="rounded-full px-8 font-black">← Επιστροφή στις τιμές</Button>
          </Link>
          <a href="mailto:kidsinbusinessgr@gmail.com">
            <Button className="rounded-full px-8 font-black">Επικοινωνία</Button>
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[oklch(0.92_0.08_292)]">
        <CheckCircle size={48} className="text-[oklch(0.57_0.23_292)]" />
      </div>

      <div>
        <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.57_0.23_292)]">Πληρωμή επιτυχής</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Καλώς ήρθες στο Premium! 🎉</h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Η συνδρομή σου ενεργοποιήθηκε. Τώρα έχεις πρόσβαση σε όλα τα μαθήματα και εργαλεία.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/learn">
          <Button className="h-12 rounded-full px-10 font-black" style={{ background: "oklch(0.57 0.23 292)" }}>
            Ξεκίνα τα μαθήματα →
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" className="h-12 rounded-full px-10 font-black">Dashboard γονέα</Button>
        </Link>
      </div>

      <div className="mt-4 rounded-xl bg-muted px-6 py-4 text-sm text-muted-foreground">
        <p>
          Θα λάβεις επιβεβαίωση στο email σου από το Stripe.{" "}
          <a href="mailto:kidsinbusinessgr@gmail.com" className="font-semibold underline">
            Επικοινώνησε μαζί μας
          </a>{" "}
          αν χρειαστείς βοήθεια.
        </p>
      </div>
    </main>
  );
}
