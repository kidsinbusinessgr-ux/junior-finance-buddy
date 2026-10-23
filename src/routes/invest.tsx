import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, TrendingUp, Compass } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Επένδυσε — Kids in Business" },
      { name: "description", content: "Μάθε στα παιδιά τα βασικά της επένδυσης και της ανάπτυξης χρημάτων με χρόνο." },
      { property: "og:title", content: "Επένδυσε — Kids in Business" },
      { property: "og:description", content: "Μάθε στα παιδιά τα βασικά της επένδυσης και της ανάπτυξης χρημάτων με χρόνο." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestPage,
});

function InvestPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-24 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="invest" />
          <div className="mx-auto max-w-3xl pb-3 pt-20 text-center">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Επενδύσεις για νέους</p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Τα χρήματα που δουλεύουν για σένα.</h1>
            <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">Μάθε πώς οι έξυπνοι επενδυτές αφήνουν τον χρόνο να κάνει τη δουλειά τους — ακόμα και από τα 12.</p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                Icon: Sprout,
                title: "Ανατοκισμός",
                copy: "Μάθε πώς τα χρήματα αυξάνονται με τον χρόνο χάρη στον ανατοκισμό — το μεγαλύτερο μυστικό της επένδυσης.",
              },
              {
                Icon: TrendingUp,
                title: "Αγορές & μετοχές",
                copy: "Κατανόησε τι σημαίνει να κατέχεις ένα κομμάτι μιας εταιρείας και πώς λειτουργούν οι αγορές.",
              },
              {
                Icon: Compass,
                title: "Διαφοροποίηση",
                copy: "Μάθε γιατί οι έξυπνοι επενδυτές δεν βάζουν ποτέ όλα τα αυγά στο ίδιο καλάθι.",
              },
            ].map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-xl border bg-card p-8 shadow-sm">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[oklch(0.57_0.23_292)]">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-black">{title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black sm:text-5xl">Η μάθηση ξεκινά εδώ.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Το Kids in Business δεν παρέχει επενδυτικές υπηρεσίες ή συμβουλές. Το περιεχόμενο αυτό είναι εκπαιδευτικό και αποσκοπεί στο να βοηθήσει τα παιδιά να κατανοήσουν βασικές έννοιες επένδυσης. Για πραγματικές επενδύσεις απαιτείται η καθοδήγηση ενήλικα.</p>
          <Link to="/signup">
            <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

