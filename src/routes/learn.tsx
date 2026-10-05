import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpenCheck, CircleHelp, Lock, Star } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Μάθε — Kids in Business" },
      { name: "description", content: "Διαδραστικά μαθήματα οικονομικής παιδείας για παιδιά 8–14. Κουίζ, badges και gamification." },
      { property: "og:title", content: "Μάθε — Kids in Business" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LearnPage,
});

const lessons = [
  {
    id: 1,
    title: "Τι είναι τα χρήματα;",
    desc: "Από το αντιπραγματισμό στα νομίσματα — πώς ξεκίνησε όλο αυτό.",
    xp: 100,
    duration: "5 λεπτά",
    unlocked: true,
    completed: false,
    emoji: "💰",
  },
  {
    id: 2,
    title: "Ανάγκες vs Επιθυμίες",
    desc: "Μάθε να ξεχωρίζεις αυτό που χρειάζεσαι από αυτό που θέλεις.",
    xp: 150,
    duration: "6 λεπτά",
    unlocked: true,
    completed: false,
    emoji: "🛒",
  },
  {
    id: 3,
    title: "Πώς λειτουργεί η αποταμίευση",
    desc: "Μικρά ποσά, μεγάλα αποτελέσματα — η δύναμη της συνήθειας.",
    xp: 150,
    duration: "7 λεπτά",
    unlocked: true,
    completed: false,
    emoji: "🐷",
  },
  {
    id: 4,
    title: "Το πρώτο μου budget",
    desc: "Πώς να σχεδιάσεις τα έσοδα και τα έξοδά σου.",
    xp: 200,
    duration: "8 λεπτά",
    unlocked: false,
    completed: false,
    emoji: "📊",
  },
  {
    id: 5,
    title: "Τι είναι επιχείρηση;",
    desc: "Από ιδέα σε προϊόν — πώς γεννιέται μια επιχείρηση.",
    xp: 200,
    duration: "8 λεπτά",
    unlocked: false,
    completed: false,
    emoji: "🏪",
  },
  {
    id: 6,
    title: "Χρήματα και ευτυχία",
    desc: "Τα χρήματα αγοράζουν ευτυχία; Ποια η αληθινή αξία των πραγμάτων;",
    xp: 250,
    duration: "10 λεπτά",
    unlocked: false,
    completed: false,
    emoji: "😊",
  },
];

function LearnPage() {
  const totalXP = lessons.filter((l) => l.completed).reduce((s, l) => s + l.xp, 0);
  const unlockedCount = lessons.filter((l) => l.unlocked).length;

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="learn" />
          <div className="mx-auto max-w-3xl pt-20 text-center">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Οικονομική παιδεία</p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Μάθε. Παίξε. Κέρδισε XP.</h1>
            <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">Κάθε μάθημα ξεκλειδώνει νέες γνώσεις — και XP που μετράνε!</p>

            {/* Progress bar */}
            <div className="mx-auto mt-8 max-w-sm rounded-xl bg-[oklch(0.45_0.18_292)] p-5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-2"><Star size={16} className="text-[oklch(0.85_0.18_70)]" /> {totalXP} XP</span>
                <span>{unlockedCount}/{lessons.length} διαθέσιμα</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[oklch(0.36_0.13_292)]">
                <div className="h-full rounded-full bg-[oklch(0.85_0.18_70)] transition-all" style={{ width: `${(unlockedCount / lessons.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <article
                key={lesson.id}
                className={`rounded-xl border p-6 transition-all ${lesson.unlocked ? "bg-card shadow-sm hover:-translate-y-1 hover:shadow-md" : "bg-muted opacity-60"}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{lesson.emoji}</span>
                  {lesson.unlocked ? (
                    <span className="flex items-center gap-1 rounded-full bg-[oklch(0.88_0.1_55)] px-2 py-1 text-xs font-black text-[oklch(0.35_0.12_35)]">
                      <Star size={10} /> +{lesson.xp} XP
                    </span>
                  ) : (
                    <Lock size={16} className="text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 text-xl font-black">{lesson.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><BookOpenCheck size={12} /> {lesson.duration}</span>
                  {lesson.completed && <Award size={16} className="text-[oklch(0.55_0.17_173)]" />}
                </div>
                {lesson.unlocked && (
                  <Link to="/learn/$lessonId" params={{ lessonId: String(lesson.id) }}>
                    <Button className="mt-4 h-10 w-full rounded-full text-sm">
                      Άνοιξε μάθημα →
                    </Button>
                  </Link>
                )}
                {!lesson.unlocked && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
                    <CircleHelp size={12} /> Ολοκλήρωσε τα προηγούμενα για να ξεκλειδωθεί
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-xl bg-[oklch(0.57_0.23_292)] p-8 text-center text-primary-foreground">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Έρχεται σύντομα</p>
            <h2 className="mt-3 text-3xl font-black">+10 ακόμα μαθήματα</h2>
            <p className="mt-3 leading-relaxed text-[oklch(0.96_0.02_292)]">Επιχειρηματικότητα, επενδύσεις, φόροι, δάνεια και πολλά άλλα — εβδομαδιαίες ενημερώσεις!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
