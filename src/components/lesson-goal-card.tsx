import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GoalCardBuilder, eurosToCoins, planFor, type GoalDraft } from "@/components/smart-goals";
import { SignupGate } from "@/components/signup-gate";
import { createSavingsGoal, useChild } from "@/hooks/useJFB";

// Lesson 3 (Πώς λειτουργεί η αποταμίευση) workshop: the S.M.A.R.T. goal card
// of /save. A money goal goes straight into the child's goals, in their
// account, and the child stays in the lesson to do the quiz.

export function LessonGoalCard() {
  const { child } = useChild();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function saveToGoals(d: GoalDraft) {
    if (!child) return;
    const p = planFor(d);
    setSaving(true);
    setError("");
    try {
      await createSavingsGoal(child.id, d.what.trim(), "🎯", eurosToCoins(p.price), {
        why: d.why.trim(),
        weeklyCoins: eurosToCoins(p.weekly),
        deadline: d.deadline,
      });
      setDone(d.what.trim());
    } catch {
      setError("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.56_0.15_35)]">Εργαστήριο · Αποταμίευση</p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">Η κάρτα στόχου σου</h2>
        <p className="mt-3 text-muted-foreground">
          Γράψε κάτι για το οποίο θέλεις να μαζέψεις χρήματα, και δες τα γράμματα S.M.A.R.T. να συμπληρώνονται. Η κάρτα υπολογίζει πόσα να βάζεις
          στην άκρη κάθε εβδομάδα και πότε θα τον φτάσεις.
          {child ? " Μετά στείλ' τον στους στόχους σου, για να τον παρακολουθείς." : " Μπορείς να την εκτυπώσεις και να την κολλήσεις κάπου όπου θα τη βλέπεις."}
        </p>
      </div>

      {done ? (
        <div className="mx-auto max-w-xl rounded-3xl bg-[oklch(0.95_0.06_150)] p-8 text-center">
          <p className="text-5xl">🎯</p>
          <p className="mt-3 text-2xl font-black">Ο στόχος σου «{done}» μπήκε στους στόχους σου!</p>
          <p className="mt-2 text-muted-foreground">Εκεί βάζεις χρήματα στην άκρη και βλέπεις κάθε εβδομάδα αν είσαι εντός πλάνου.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/goals" className="rounded-full bg-[oklch(0.57_0.23_292)] px-6 py-3 text-sm font-black text-white">
              Οι στόχοι μου →
            </Link>
            <button onClick={() => setDone(null)} className="rounded-full border px-6 py-3 text-sm font-bold">
              Φτιάξε κι άλλη κάρτα
            </button>
          </div>
        </div>
      ) : (
        <SignupGate
          title="Φτιάξε την κάρτα του στόχου σου"
          text="Κάνε δωρεάν εγγραφή για να γράψεις τον δικό σου στόχο, να δεις πότε θα τον φτάσεις και να εκτυπώσεις την κάρτα σου."
        >
          <GoalCardBuilder mode="lesson" onSave={child ? saveToGoals : undefined} saving={saving} />
        </SignupGate>
      )}
      {error && <p className="mt-3 text-center text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
