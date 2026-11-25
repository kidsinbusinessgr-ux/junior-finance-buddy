import { useState } from "react";
import { WORKBOOK_URL } from "@/lib/startup-plan";

// For the adult next to the child (parent today, teacher later): how to go
// along with the business plan without taking it over. From the Kids in
// Business workbook's guide for parents.

const SECTIONS = [
  {
    title: "Πώς να το συνοδεύσεις, χωρίς να το καθοδηγήσεις",
    items: [
      "Μην του πεις τι να κάνει. Κάνε ανοιχτές ερωτήσεις και άφησέ το να σκεφτεί μόνο του.",
      "Μη διορθώνεις. Αν κάτι δε σου βγάζει νόημα, άκου πρώτα και μετά πρότεινε.",
      "Σεβάσου την παιδική λογική. Εκεί κρύβεται η φαντασία.",
    ],
  },
  {
    title: "Ερωτήσεις-κλειδιά",
    items: [
      "Πώς σκέφτηκες αυτή την ιδέα;",
      "Σε ποιον θα άρεσε; Γιατί;",
      "Αν είχες απεριόριστα υλικά, τι θα έκανες;",
      "Τι σου ήταν εύκολο; Τι σου φάνηκε δύσκολο;",
      "Τι έμαθες από αυτή τη δραστηριότητα;",
    ],
  },
  {
    title: "Πώς να ενισχύσεις την αυτοπεποίθησή του",
    items: [
      "Πες «Μου άρεσε πώς το σκέφτηκες», όχι απλώς «μπράβο».",
      "Δώσε αξία στην προσπάθεια, όχι στο αποτέλεσμα.",
      "Δες τα λάθη σαν ευκαιρίες να μάθει.",
      "Ζήτα του να σου εξηγήσει την ιδέα του και άκου με προσοχή.",
    ],
  },
  {
    title: "Η παρουσίαση (pitch)",
    items: [
      "Να παρουσιάσει την ιδέα του στην οικογένεια ή στην τάξη.",
      "Να κάνει πρόβα στον καθρέφτη ή με ένα αρκουδάκι για πελάτη.",
      "Να κρεμάσει τη διαφήμισή του στο δωμάτιό του.",
      "Η παρουσίαση είναι ευκαιρία να μιλήσει με σιγουριά, όχι να τα πει όλα σωστά.",
    ],
  },
];

export function BusinessGuide() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span>
          <span className="block text-lg font-semibold text-[oklch(0.35_0.08_250)]">🧭 Οδηγός για το business plan του παιδιού</span>
          <span className="mt-1 block text-sm text-[oklch(0.5_0.04_250)]">Πώς να σταθείς δίπλα του όταν φτιάχνει το startup του.</span>
        </span>
        <span className="ml-3 text-2xl text-[oklch(0.5_0.04_250)]">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-4 text-sm text-[oklch(0.3_0.06_250)]">
          <p>Η δημιουργικότητα δε χρειάζεται τέλεια σχέδια ή σωστές απαντήσεις. Χρειάζεται χώρο, εμπιστοσύνη και υποστήριξη.</p>
          {SECTIONS.map((s) => (
            <div key={s.title} className="rounded-xl bg-[oklch(0.97_0.02_250)] p-4">
              <p className="font-bold">{s.title}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="font-semibold">Τα παιδιά δε χρειάζονται γονείς-προπονητές. Χρειάζονται γονείς-συνοδοιπόρους.</p>
          <a
            href={WORKBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border-2 border-dashed border-[oklch(0.75_0.12_350)] p-3 font-semibold text-[oklch(0.45_0.15_350)] hover:bg-[oklch(0.98_0.02_350)]"
          >
            📘 Ολόκληρος ο οδηγός και όλες οι σελίδες για εκτύπωση υπάρχουν στο Kids in Business Workbook →
          </a>
        </div>
      )}
    </section>
  );
}
