import { useEffect, useState } from "react";
import { CreditCard, Eye, EyeOff, Lock, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// The prepaid card "like adults": the child types the card number, expiry and
// CVV at a checkout, the server checks them (jfb_card_check), and then the
// "bank" sends a confirmation code inside the app, as real banks do. The
// details are made up (the number starts with 9, which no real card uses).

export type MyCard = { number: string; expiry: string; cvv: string };

export const groupNumber = (n: string) => n.replace(/(\d{4})(?=\d)/g, "$1 ");

export function useMyCard(enabled = true) {
  const [card, setCard] = useState<MyCard | null>(null);
  useEffect(() => {
    if (!enabled) return;
    supabase.rpc("jfb_my_card" as never).then(({ data }) => {
      const row = (Array.isArray(data) ? data[0] : data) as MyCard | undefined;
      if (row?.number) setCard(row);
    });
  }, [enabled]);
  return card;
}

// Front and back of the card with the details, for the Wallet and the checkout.
export function CardDetails({ card, name }: { card: MyCard | null; name?: string }) {
  const [show, setShow] = useState(false);
  if (!card) return <p className="text-sm text-muted-foreground">Φορτώνουν τα στοιχεία της κάρτας…</p>;
  const hidden = (s: string) => s.replace(/\d/g, "•");
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.4_0.18_290)] to-[oklch(0.55_0.2_300)] p-4 text-white shadow">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Μπροστά · Prepaid</p>
          <p className="mt-3 font-mono text-lg font-bold tracking-wider">
            {show ? groupNumber(card.number) : `${hidden(groupNumber(card.number.slice(0, 12)))} ${card.number.slice(12)}`}
          </p>
          <div className="mt-2 flex justify-between text-xs">
            <span className="truncate opacity-90">{name ?? ""}</span>
            <span>
              <span className="opacity-70">Λήξη </span>
              <span className="font-bold">{card.expiry}</span>
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.3_0.05_290)] to-[oklch(0.42_0.08_290)] p-4 text-white shadow">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Πίσω</p>
          <div className="mt-3 h-6 bg-black/60" />
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="text-xs opacity-70">CVV</span>
            <span className="rounded bg-white px-2 py-0.5 font-mono font-bold text-black">{show ? card.cvv : "•••"}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => setShow((v) => !v)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[oklch(0.45_0.15_290)] hover:underline"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Κρύψε τα στοιχεία" : "Δείξε τα στοιχεία"}
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        Εικονική κάρτα για εξάσκηση: δεν είναι αληθινή και δεν έχει αληθινά χρήματα. Τα στοιχεία μιας αληθινής κάρτας δεν τα δείχνεις σε κανέναν.
      </p>
    </div>
  );
}

const CHECK_ERRORS: Record<string, string> = {
  locked: "Η κάρτα σου είναι κλειδωμένη. Ξεκλείδωσέ την από το Πορτοφόλι, ή ζήτα από τον γονιό σου να την ξεκλειδώσει.",
  blocked: "Έγιναν πολλές λάθος προσπάθειες, και η τράπεζα μπλόκαρε την κάρτα για 15 λεπτά, για ασφάλεια. Το ίδιο κάνουν και οι αληθινές τράπεζες.",
  wrong_number: "Ο αριθμός της κάρτας δεν είναι σωστός. Κοίτα ξανά την κάρτα σου.",
  wrong_expiry: "Η ημερομηνία λήξης δεν είναι σωστή. Τη βρίσκεις μπροστά στην κάρτα (ΜΜ/ΕΕ).",
  wrong_cvv: "Ο CVV δεν είναι σωστός. Είναι τα 3 ψηφία στο πίσω μέρος της κάρτας.",
  expired: "Η κάρτα σου έχει λήξει.",
};

const input =
  "w-full rounded-xl border border-border bg-background p-3 font-mono text-lg tracking-wider outline-none focus:border-[oklch(0.55_0.2_290)]";

export function CardCheckout({
  amount,
  merchant,
  name,
  onPay,
  onClose,
}: {
  amount: number;
  merchant: string;
  name?: string;
  // Makes the actual payment; returns an error text, or null when it went through.
  onPay: () => Promise<string | null>;
  onClose: (paid: boolean) => void;
}) {
  const card = useMyCard();
  const [step, setStep] = useState<"details" | "code">("details");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [help, setHelp] = useState(false);
  const [code, setCode] = useState("");
  const [typed, setTyped] = useState("");
  const [codeTries, setCodeTries] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onNumber = (v: string) => setNumber(groupNumber(v.replace(/\D/g, "").slice(0, 16)));
  const onExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };
  const ready = number.replace(/\D/g, "").length === 16 && /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3}$/.test(cvv);

  async function checkDetails() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("jfb_card_check" as never, { p_number: number, p_expiry: expiry, p_cvv: cvv } as never);
    setBusy(false);
    const res = err ? "failed" : String(data);
    if (res !== "ok") {
      setError(CHECK_ERRORS[res] ?? "Η πληρωμή δεν έγινε. Δοκίμασε ξανά.");
      return;
    }
    setCode(String(Math.floor(100000 + Math.random() * 900000)));
    setTyped("");
    setCodeTries(0);
    setStep("code");
  }

  async function confirmCode() {
    if (busy) return;
    if (typed !== code) {
      const n = codeTries + 1;
      setCodeTries(n);
      if (n >= 3) {
        setStep("details");
        setCvv("");
        setError("Έγραψες 3 φορές λάθος κωδικό, και η πληρωμή ακυρώθηκε. Ξεκίνα ξανά.");
      } else {
        setError("Ο κωδικός δεν είναι σωστός. Κοίτα το μήνυμα της τράπεζας.");
      }
      return;
    }
    setBusy(true);
    setError(null);
    const fail = await onPay().catch(() => "Η πληρωμή δεν έγινε. Δοκίμασε ξανά.");
    setBusy(false);
    if (fail) {
      setError(fail);
      setStep("details");
      return;
    }
    onClose(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={() => !busy && onClose(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Πληρωμή με κάρτα"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
      >
        {/* Address bar: real checkouts start with checking the address. */}
        <div className="flex items-center gap-2 rounded-t-3xl border-b bg-muted/60 px-4 py-2.5">
          <Lock size={14} className="text-[oklch(0.55_0.17_150)]" />
          <span className="flex-1 truncate font-mono text-xs text-muted-foreground">https://pay.kidsinbusiness.gr</span>
          <button onClick={() => !busy && onClose(false)} aria-label="Κλείσιμο" className="rounded-full p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Πληρωμή σε</p>
              <p className="truncate font-black">{merchant}</p>
            </div>
            <p className="shrink-0 text-2xl font-black">🪙 {amount}</p>
          </div>

          {step === "details" ? (
            <>
              <label className="mt-5 block text-sm font-bold">Αριθμός κάρτας</label>
              <input
                value={number}
                onChange={(e) => onNumber(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                placeholder="9XXX XXXX XXXX XXXX"
                className={`${input} mt-1`}
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold">Λήξη</label>
                  <input value={expiry} onChange={(e) => onExpiry(e.target.value)} inputMode="numeric" autoComplete="off" placeholder="ΜΜ/ΕΕ" className={`${input} mt-1`} />
                </div>
                <div>
                  <label className="block text-sm font-bold">CVV</label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    inputMode="numeric"
                    autoComplete="off"
                    type="password"
                    placeholder="•••"
                    className={`${input} mt-1`}
                  />
                </div>
              </div>

              <button onClick={() => setHelp((v) => !v)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[oklch(0.45_0.15_290)] hover:underline">
                <CreditCard size={15} /> {help ? "Κρύψε την κάρτα μου" : "Πού βρίσκω τα στοιχεία; Δες την κάρτα σου"}
              </button>
              {help && (
                <div className="mt-3">
                  <CardDetails card={card} name={name} />
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-[oklch(0.96_0.04_150)] p-3 text-xs text-[oklch(0.32_0.08_150)]">
                <p className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck size={14} /> Πριν πληρώσεις, έλεγξε:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  <li>η διεύθυνση της σελίδας αρχίζει με https και έχει λουκέτο;</li>
                  <li>ξέρεις σε ποιον πληρώνεις και πόσα;</li>
                  <li>τον CVV τον γράφεις μόνο εδώ. Δεν τον λες ποτέ σε κανέναν, ούτε σε όποιον λέει ότι είναι από την τράπεζα.</li>
                </ul>
              </div>

              {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
              <button
                disabled={!ready || busy}
                onClick={checkDetails}
                className="mt-4 w-full rounded-full bg-[oklch(0.55_0.2_290)] py-3.5 font-black text-white disabled:opacity-50"
              >
                {busy ? "Έλεγχος…" : `Πλήρωσε 🪙 ${amount}`}
              </button>
            </>
          ) : (
            <>
              <div className="mt-5 rounded-2xl border bg-background p-4 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground">📲 Μήνυμα από KidsBank · τώρα</p>
                <p className="mt-1 text-sm">
                  Κωδικός για πληρωμή 🪙 {amount} σε «{merchant}»: <span className="font-mono text-lg font-black tracking-widest">{code}</span>.
                  Μην τον δώσεις σε κανέναν.
                </p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Οι τράπεζες στέλνουν έναν κωδικό στο κινητό σου, για να είναι σίγουρες ότι πληρώνεις εσύ. Γράψε τον εδώ.
              </p>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Κωδικός 6 ψηφίων"
                className={`${input} mt-2 text-center`}
              />
              {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
              <button
                disabled={typed.length !== 6 || busy}
                onClick={confirmCode}
                className="mt-4 w-full rounded-full bg-[oklch(0.55_0.2_290)] py-3.5 font-black text-white disabled:opacity-50"
              >
                {busy ? "Πληρωμή…" : "Επιβεβαίωση"}
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  setStep("details");
                  setError(null);
                }}
                className="mt-2 w-full py-2 text-sm font-bold text-muted-foreground hover:underline"
              >
                ← Πίσω
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
