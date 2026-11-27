import { useState } from "react";
import { Copy } from "lucide-react";

// Next to each child on the parent's page: what the child's code is for and
// what to do with it, until the child has their own login.

export function ChildAccessInfo({
  name,
  code,
  username,
  hasOwnLogin,
}: {
  name: string;
  code: string | null;
  username: string | null;
  hasOwnLogin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (username) {
    return <p className="mt-1 text-xs text-[oklch(0.5_0.04_250)]">🏫 Μαθητής τάξης · συνδέεται με το όνομα χρήστη @{username}</p>;
  }
  if (hasOwnLogin) {
    return <p className="mt-1 text-xs font-bold text-[oklch(0.45_0.14_160)]">✓ Έχει δικό του λογαριασμό και συνδέεται μόνο του.</p>;
  }
  if (!code) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the code is on screen anyway */
    }
  };

  return (
    <div className="mt-2 rounded-xl bg-purple-50 p-3 text-xs text-[oklch(0.35_0.08_290)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold">🔑 Κωδικός σύνδεσης:</span>
        <span className="rounded-lg bg-white px-2 py-0.5 font-mono text-sm font-black tracking-widest text-purple-600">{code}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 font-bold text-purple-600 hover:underline">
          <Copy size={12} /> {copied ? "Αντιγράφηκε!" : "Αντιγραφή"}
        </button>
      </div>
      <p className="mt-1.5">
        Με αυτόν τον κωδικό το παιδί φτιάχνει τον δικό του λογαριασμό και μπαίνει στην εφαρμογή.{" "}
        <button onClick={() => setOpen((v) => !v)} className="font-bold text-purple-600 underline">
          {open ? "Κλείσε" : "Πώς;"}
        </button>
      </p>
      {open && (
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Στη συσκευή του παιδιού, άνοιξε το <b>buddy.kidsinbusiness.gr</b> → <b>Εγγραφή</b> → <b>🎒 Παιδί</b>.
          </li>
          <li>
            Γράψτε τον κωδικό <b className="font-mono">{code}</b>.
          </li>
          <li>
            Βάλτε ένα email και έναν κωδικό πρόσβασης για το παιδί. Το email πρέπει να είναι <b>διαφορετικό</b> από το δικό σου. Αν το παιδί δεν έχει
            email και έχεις Gmail, γράψε το δικό σου με ένα «+»: π.χ. αν είσαι maria@gmail.com, γράψε maria+paidi@gmail.com. Τα μηνύματα θα
            έρχονται σε σένα.
          </li>
          <li>Επιβεβαιώστε το email από το μήνυμα που θα έρθει.</li>
          <li>Από εκεί και πέρα το παιδί συνδέεται μόνο του, με αυτό το email και τον κωδικό του.</li>
        </ol>
      )}
      <p className="mt-1.5 text-[11px] text-[oklch(0.5_0.04_250)]">Ο κωδικός χρησιμοποιείται μία φορά. Μην τον δίνεις σε άλλους.</p>
    </div>
  );
}
