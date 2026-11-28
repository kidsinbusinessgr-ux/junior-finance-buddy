import { Link } from "@tanstack/react-router";
import { useLessonProgress } from "@/hooks/useJFB";
import { readPlan } from "@/lib/startup-plan";

// On the founder's startup page: lessons 7–11 build the startup step by step.
// Each step is ticked when it is done (the lesson, or what it puts on the
// startup), and the rest link to their lesson.

type JourneyStartup = { plan: unknown; logo_url?: string | null; ad_url?: string | null };

export function StartupJourney({ startup, childId }: { startup: JourneyStartup; childId: string }) {
  const { progress } = useLessonProgress(childId);
  const plan = readPlan(startup.plan);
  const lessonDone = (id: number) => progress.some((p) => String(p.lesson_id) === String(id));

  const steps = [
    { lesson: 7, emoji: "💡", label: "Η ιδέα", done: lessonDone(7) },
    { lesson: 8, emoji: "🗺️", label: "Business Model Canvas", done: lessonDone(8) },
    { lesson: 9, emoji: "📣", label: "Λογότυπο και διαφήμιση", done: Boolean(startup.logo_url || startup.ad_url) },
    { lesson: 10, emoji: "💹", label: "Τιμή και νεκρό σημείο", done: Boolean(plan.costing) },
    { lesson: 11, emoji: "🎤", label: "Το pitch", done: Boolean(plan.action?.pitch?.trim()) },
  ];
  const count = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-3xl border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-black">🧭 Το ταξίδι της startup σου</p>
        <p className="text-sm font-bold text-muted-foreground">
          {count} από {steps.length} βήματα
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Κάθε μάθημα προσθέτει ένα κομμάτι στη startup σου.</p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {steps.map((s) => (
          <li key={s.lesson}>
            <Link
              to="/learn/$lessonId"
              params={{ lessonId: String(s.lesson) }}
              className={`flex h-full flex-col gap-1 rounded-2xl border-2 p-3 text-sm transition-colors ${
                s.done
                  ? "border-[oklch(0.55_0.17_173)] bg-[oklch(0.96_0.03_173)]"
                  : "border-dashed border-border hover:border-[oklch(0.57_0.23_292)] hover:bg-[oklch(0.97_0.02_292)]"
              }`}
            >
              <span className="text-xl">{s.done ? "✅" : s.emoji}</span>
              <span className="font-black">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.done ? `Μάθημα ${s.lesson} ✓` : `Μάθημα ${s.lesson} →`}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
