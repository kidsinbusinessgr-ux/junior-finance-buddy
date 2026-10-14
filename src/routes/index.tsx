import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Pause } from "lucide-react";
import heroKid from "@/assets/hero-kids.png";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kids in Business — Χρηματοοικονομική παιδεία για παιδιά" },
      { name: "description", content: "Η εφαρμογή που διδάσκει στα παιδιά ηλικίας 12—17 χρόνων πώς να κερδίζουν, αποταμιεύουν και επενδύουν με έξυπνο τρόπο." },
      { property: "og:title", content: "Kids in Business — Χρηματοοικονομική παιδεία για παιδιά" },
      { property: "og:description", content: "Η εφαρμογή που διδάσκει στα παιδιά ηλικίας 12—17 χρόνων πώς να κερδίζουν, αποταμιεύουν και επενδύουν με έξυπνο τρόπο." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = [
    ["Χτίζουμε αυτοπεποίθηση γύρω από τα χρήματα", "Τα παιδιά μαθαίνουν να κερδίζουν, να αποταμιεύουν και να ξοδεύουν με σύνεση."],
    ["Η εφαρμογή που τα παιδιά θα αγαπήσουν", "Μικρές επιλογές σήμερα γίνονται έξυπνες συνήθειες αύριο."],
    ["Μάθηση απλή και διασκεδαστική", "Βάλε στόχους, κέρδισε ανταμοιβές και πρόοδος μαζί."],
  ];
  const currentTitle = slides[slide]?.[0] ?? "";
  const currentCopy = slides[slide]?.[1] ?? "";
  const advance = (direction: number) => setSlide((slide + direction + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => advance(1), 4000);
    return () => clearInterval(timer);
  }, [slide, paused]);

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative min-h-[770px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground lg:min-h-[850px]">
        <div className="absolute inset-0 bg-[linear-gradient(122deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-14 pt-5 lg:px-16">
          <BrightlyNav />

          <div id="top" className="grid items-center gap-4 pb-12 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-28">
            <div className="relative z-10 max-w-[620px]">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Για ηλικίες 12—17</p>
              <h1 className="text-5xl font-black leading-[0.99] tracking-tight sm:text-6xl lg:text-7xl">{currentTitle}</h1>
              <p className="mt-7 max-w-xl text-xl leading-relaxed text-[oklch(0.96_0.02_292)] lg:text-2xl">{currentCopy}</p>
              <Link to="/signup">
                <Button className="mt-9 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
              </Link>
            </div>
            <div className="relative mx-auto mt-7 aspect-square w-full max-w-[610px] lg:mt-0">
              <div className="hero-orb absolute inset-[8%] rounded-full" />
              <div className="hero-ring absolute bottom-[3%] right-[5%] h-[39%] w-[39%] rounded-full" />
              <div className="drift absolute left-[2%] top-[40%] h-12 w-28 rotate-[-18deg] rounded-full border-[12px] border-[oklch(0.76_0.21_182)] border-r-transparent" />
              <div className="float-slow absolute right-[11%] top-[6%] h-7 w-18 rotate-[-12deg] rounded-full bg-[oklch(0.74_0.21_318)]" />
              <img src={heroKid} width={1200} height={1200} alt="Παιδί με κάρτα και κινητό" className="relative z-10 h-full w-full rounded-full object-cover mix-blend-normal" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setPaused(!paused)}
                variant="ghost"
                size="icon"
                className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]"
                aria-label={paused ? "Αναπαραγωγή" : "Παύση"}
              >
                {paused ? <ArrowRight size={20} /> : <Pause size={18} />}
              </Button>
              <div className="flex gap-2 rounded-full bg-[oklch(0.79_0.11_292)] px-5 py-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Διαφάνεια ${index + 1}`}
                    onClick={() => setSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${slide === index ? 'w-7 bg-primary' : 'w-2.5 bg-[oklch(0.55_0.1_292)]'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => advance(-1)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label="Προηγούμενη διαφάνεια"><ArrowLeft /></Button>
              <Button onClick={() => advance(1)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label="Επόμενη διαφάνεια"><ArrowRight /></Button>
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pb-8 pt-8 text-center">
          <p className="text-3xl font-black leading-tight sm:text-4xl">Επιχειρηματικότητα και χρηματοοικονομική παιδεία για νέους ηλικία 12—17</p>
          <p className="mt-3 text-xs text-[oklch(0.89_0.06_292)]">Διδάσκουμε τα παιδιά να σκέφτονται σαν επιχειρηματίες</p>
        </div>
      </section>

      {/* Feature cards */}
      <section id="discover" className="bg-[oklch(0.985_0.015_91)] px-6 py-20 text-foreground lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Φτιαγμένο για την καθημερινή ζωή</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Μικρά βήματα. Μεγάλες δυνατότητες.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Κέρδισε", "Μετάτρεψε τις δουλειές σε αξία και υπερηφάνεια.", "/earn"],
              ["Αποταμίευσε", "Φέρε τους στόχους σου πιο κοντά, ένα βήμα τη φορά.", "/save"],
              ["Ξόδεψε", "Εξάσκησε τις επιλογές σου με ασφάλεια.", "/spend"],
            ].map(([title, copy, to], index) => (
              <Link
                key={title}
                to={to as "/earn" | "/save" | "/spend"}
                className="rounded-lg bg-card p-6 shadow-sm transition-transform hover:-translate-y-1"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-lg font-black">{index + 1}</span>
                <h3 className="mt-6 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Parents section */}
      <section className="bg-[oklch(0.75_0.18_173)] px-6 py-16 text-accent-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em]">Φτιαγμένο με γονείς</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Περισσότερη αυτοπεποίθηση, κάθε μέρα.</h2>
          </div>
          <ul className="grid gap-3 text-lg">
            {[
              'Δες τη δραστηριότητα με μια ματιά',
              'Όρισε ευέλικτους κανόνες δαπανών',
              'Χτίσε υγιείς συνήθειες μαζί',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="h-5 w-5" />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-background px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-black leading-tight sm:text-5xl">Έτοιμος να ξεκινήσεις;</h2>
          <p className="mt-4 text-lg text-muted-foreground">Εγγράψου δωρεάν και ξεκίνα να χτίζεις οικονομικές δεξιότητες με το παιδί σου σήμερα.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button className="h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="h-14 rounded-full px-10 text-base">Έχω ήδη λογαριασμό</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

