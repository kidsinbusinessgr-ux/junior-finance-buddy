import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Monthly statement of the child's coins, like the one a bank sends: balance
// at the start and end of the month, what came in and went out by category,
// and every movement. Balances are worked out from the transactions: every
// coin change goes through jfb_apply_coins, which writes one.

type Tx = { id: string; type: string; amount: number; description: string; created_at: string | null };

const CATEGORY: Record<string, string> = {
  deposit: "Χαρτζιλίκι",
  chore: "Δουλειές",
  lesson: "Μαθήματα",
  dividend: "Μερίσματα",
  investment: "Επενδύσεις",
  withdrawal: "Αποταμίευση σε στόχους",
  card: "Πληρωμές με κάρτα",
  reward: "Ανταμοιβές",
};

const MONTHS = [
  "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
  "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

const fmt = (n: number) => n.toLocaleString("el-GR");
const signed = (n: number) => (n > 0 ? `+${fmt(n)}` : fmt(n));

function groupBy(list: Tx[]) {
  const m = new Map<string, number>();
  for (const t of list) m.set(t.type, (m.get(t.type) ?? 0) + t.amount);
  return [...m.entries()].map(([type, sum]) => ({ type, label: CATEGORY[type] ?? "Άλλα", sum })).sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum));
}

// forParent: the notes speak about the child ("Κράτησε") instead of to them.
export function MonthlyStatement({
  childId,
  coins,
  name,
  forParent = false,
}: {
  childId: string;
  coins: number;
  name: string;
  forParent?: boolean;
}) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [after, setAfter] = useState<Tx[] | null>(null);

  const start = new Date(ym.y, ym.m, 1);
  const end = new Date(ym.y, ym.m + 1, 1);
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth();

  // Everything from the start of the month until today: the month's own
  // movements, and the later ones to work back from today's balance.
  useEffect(() => {
    let off = false;
    setAfter(null);
    supabase
      .from("jfb_transactions")
      .select("id, type, amount, description, created_at")
      .eq("child_id", childId)
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: true })
      .limit(2000)
      .then(({ data }) => { if (!off) setAfter((data as Tx[]) ?? []); });
    return () => { off = true; };
  }, [childId, ym.y, ym.m]);

  const s = useMemo(() => {
    if (!after) return null;
    const month = after.filter((t) => t.created_at && new Date(t.created_at) < end);
    const later = after.filter((t) => t.created_at && new Date(t.created_at) >= end);
    const closing = coins - later.reduce((a, t) => a + t.amount, 0);
    const net = month.reduce((a, t) => a + t.amount, 0);
    const inList = month.filter((t) => t.amount > 0);
    const outList = month.filter((t) => t.amount < 0);
    const totalIn = inList.reduce((a, t) => a + t.amount, 0);
    const totalOut = outList.reduce((a, t) => a + t.amount, 0);
    return { month, opening: closing - net, closing, totalIn, totalOut, ins: groupBy(inList), outs: groupBy(outList) };
  }, [after, coins, ym.y, ym.m]);

  const step = (d: number) => {
    const m = ym.m + d;
    setYm({ y: ym.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  let insight = "";
  if (s && (s.totalIn > 0 || s.totalOut < 0)) {
    if (s.totalIn === 0) insight = "Αυτόν τον μήνα δεν μπήκαν κέρματα, μόνο βγήκαν.";
    else {
      const kept = Math.round(((s.totalIn + s.totalOut) / s.totalIn) * 100);
      insight = kept >= 0
        ? `${forParent ? "Κράτησε" : "Κράτησες"} το ${kept}% από όσα μπήκαν αυτόν τον μήνα.`
        : `Αυτόν τον μήνα ${forParent ? "έβγαλε" : "έβγαλες"} περισσότερα απ' όσα μπήκαν.`;
    }
  }

  return (
    <div className="statement rounded-2xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Kids in Business · Μηνιαία κίνηση</p>
          <h3 className="mt-1 text-xl font-black">{MONTHS[ym.m]} {ym.y}</h3>
          <p className="text-sm text-muted-foreground">Κάτοχος: {name}</p>
        </div>
        <div className="flex items-center gap-1 print:hidden">
          <button onClick={() => step(-1)} aria-label="Προηγούμενος μήνας" className="rounded-lg p-2 hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => step(1)} disabled={isCurrent} aria-label="Επόμενος μήνας" className="rounded-lg p-2 hover:bg-muted disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => window.print()} aria-label="Εκτύπωση" className="rounded-lg p-2 hover:bg-muted">
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!s ? (
        <p className="mt-6 text-sm text-muted-foreground">Φόρτωση…</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Αρχικό υπόλοιπο", fmt(s.opening), ""],
              ["Μπήκαν", signed(s.totalIn), "text-[oklch(0.5_0.15_160)]"],
              ["Βγήκαν", fmt(s.totalOut), "text-[oklch(0.55_0.18_25)]"],
              [isCurrent ? "Υπόλοιπο σήμερα" : "Τελικό υπόλοιπο", fmt(s.closing), ""],
            ].map(([label, value, cls]) => (
              <div key={label} className="rounded-xl bg-muted/60 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={`mt-1 text-lg font-black ${cls}`}>{value} 🪙</p>
              </div>
            ))}
          </div>

          {insight && <p className="mt-4 rounded-xl bg-[oklch(0.95_0.04_292)] px-4 py-2.5 text-sm font-semibold text-[oklch(0.4_0.15_292)]">{insight}</p>}

          {(s.ins.length > 0 || s.outs.length > 0) && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {[
                ["Από πού μπήκαν", s.ins, s.totalIn, "bg-[oklch(0.7_0.14_160)]"],
                ["Πού πήγαν", s.outs, s.totalOut, "bg-[oklch(0.68_0.17_25)]"],
              ].map(([title, rows, total, bar]) => (
                <div key={title as string}>
                  <p className="text-sm font-black">{title as string}</p>
                  {(rows as ReturnType<typeof groupBy>).length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">Τίποτα.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {(rows as ReturnType<typeof groupBy>).map((r) => (
                        <li key={r.type}>
                          <div className="flex justify-between text-sm">
                            <span>{r.label}</span>
                            <span className="font-bold">{signed(r.sum)}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-muted">
                            <div className={`h-1.5 rounded-full ${bar as string}`} style={{ width: `${Math.round((r.sum / (total as number)) * 100)}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm font-black">Κινήσεις</p>
            {s.month.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Καμία κίνηση αυτόν τον μήνα.</p>
            ) : (
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {s.month.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString("el-GR", { day: "2-digit", month: "2-digit" }) : ""}
                      </td>
                      <td className="py-2 pr-3">{t.description}</td>
                      <td className={`whitespace-nowrap py-2 text-right font-bold ${t.amount > 0 ? "text-[oklch(0.5_0.15_160)]" : "text-[oklch(0.55_0.18_25)]"}`}>
                        {signed(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <details className="mt-5 text-sm text-muted-foreground print:hidden">
            <summary className="cursor-pointer font-bold text-foreground">Τι είναι η μηνιαία κίνηση;</summary>
            <p className="mt-2 leading-relaxed">
              Κάθε μήνα η τράπεζα στέλνει μια τέτοια κατάσταση για κάθε λογαριασμό και κάρτα. Δείχνει με τι ποσό ξεκίνησες τον μήνα,
              τι μπήκε, τι βγήκε και με τι ποσό τελείωσες. Αν τη διαβάζεις κάθε μήνα, βλέπεις πού πηγαίνουν τα χρήματά σου και
              εντοπίζεις αμέσως μια κίνηση που δεν αναγνωρίζεις.
            </p>
          </details>
        </>
      )}
    </div>
  );
}
