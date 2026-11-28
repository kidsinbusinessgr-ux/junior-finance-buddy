import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useChild, useCurrentUser } from "@/hooks/useJFB";
import { MoneyLedger } from "@/components/money-ledger";
import { SignupCta } from "@/components/signup-gate";

// Lesson 4 (Ο πρώτος μου προϋπολογισμός) workshop: "Το πλάνο των χρημάτων
// μου", the same plan and book as on /money, so what the child writes here
// is there too, in their account.

export function LessonMoneyPlan() {
  const { userId, loading: authLoading } = useCurrentUser();
  const { child, loading: childLoading } = useChild();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-[#c4788a]">Εργαστήριο · Προϋπολογισμός</p>
        <h2 className="mt-1 text-3xl font-black">Το πλάνο των χρημάτων μου</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Γράψε το χαρτζιλίκι σου και τον στόχο σου. Μετά πρόσθεσε τα έσοδα και τα έξοδα του μήνα, και δες πόσα σου περισσεύουν για τους 3
          κουμπαράδες σου.
        </p>
      </div>

      {authLoading || childLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !userId ? (
        <SignupCta title="Φτιάξε το δικό σου πλάνο" text="Κάνε δωρεάν εγγραφή για να γράφεις τα χρήματά σου, να μοιράζεις όσα σου περισσεύουν στους 3 κουμπαράδες και να τυπώνεις το πλάνο σου." />
      ) : !child ? (
        <p className="rounded-2xl bg-muted/50 p-6 text-center text-muted-foreground">
          Το πλάνο το συμπληρώνει το παιδί, από τον δικό του λογαριασμό.
        </p>
      ) : (
        <>
          <MoneyLedger childId={child.id} name={child.name} variant="lesson" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Το πλάνο σου μένει στον λογαριασμό σου. Θα το βρίσκεις κάθε μήνα στο{" "}
            <Link to="/money" className="font-bold underline">
              📒 Τα χρήματά μου
            </Link>
            , μαζί με τα όρια για κάθε κατηγορία.
          </p>
        </>
      )}
    </div>
  );
}
