import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpenCheck, CircleHelp, Lock, Star } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { PaidGate } from "@/components/paid-gate";
import { useSubscription } from "@/hooks/useJFB";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "ÎÎ¬Î¸Îµ â Kids in Business" },
      { name: "description", content: "ÎÏÎ¹ÏÎµÎ¹ÏÎ·Î¼Î±ÏÎ¹ÎºÏÏÎ·ÏÎ± Î³Î¹Î± Î½Î­Î¿ÏÏ 12â17. Founder mindset, Business Model Canvas, Validation, Customer Persona, MVP." },
      { property: "og:title", content: "ÎÎ¬Î¸Îµ â Kids in Business" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LearnPage,
});

const lessons = [
  {
    id: 1,
    title: "Î ÏÏ ÏÎºÎ­ÏÏÎµÏÎ±Î¹ Î­Î½Î±Ï founder",
    desc: "Î¤Î¹ ÎºÎ¬Î½ÎµÎ¹ Î­Î½Î±Î½ Î´Î¹Î±ÏÎ¿ÏÎµÏÎ¹ÎºÏ; Î Î½Î¿Î¿ÏÏÎ¿ÏÎ¯Î± ÏÎ¿Ï Î±Î»Î»Î¬Î¶ÎµÎ¹ ÏÎ± ÏÎ¬Î½ÏÎ±.",
    xp: 200,
    duration: "7 Î»ÎµÏÏÎ¬",
    unlocked: true,
    completed: false,
    emoji: "ð¡",
  },
  {
    id: 2,
    title: "Î¤Î¿ Business Model ÏÎµ 1 ÏÎµÎ»Î¯Î´Î±",
    desc: "Î¤Î¿ Business Model Canvas â ÏÏÏ ÎºÎ¬Î¸Îµ ÎµÏÎ¹ÏÎµÎ¯ÏÎ·ÏÎ· ÏÏÏÎ¬ÎµÎ¹ ÏÎµ 9 ÎºÎ¿ÏÏÎ¹Î¬.",
    xp: 250,
    duration: "8 Î»ÎµÏÏÎ¬",
    unlocked: true,
    completed: false,
    emoji: "ð§©",
  },
  {
    id: 3,
    title: "Validation Î¼Îµ 0 ÎµÏÏÏ",
    desc: "ÎÎ·Î½ ÏÏÎ¯ÏÎµÎ¹Ï Ï,ÏÎ¹ ÎºÎ±Î½ÎµÎ¯Ï Î´ÎµÎ½ Î¸Î­Î»ÎµÎ¹. Î ÏÏ Î½Î± Î±ÏÎ¿Î´ÎµÎ¯Î¾ÎµÎ¹Ï ÏÏÎ¹ Î· Î¹Î´Î­Î± ÏÎ¿Ï Î­ÏÎµÎ¹ Î±Î³Î¿ÏÎ¬.",
    xp: 300,
    duration: "8 Î»ÎµÏÏÎ¬",
    unlocked: true,
    completed: false,
    emoji: "ð¥",
  },
  {
    id: 4,
    title: "Î Î¿Î¹Î¿Ï ÎµÎ¯Î½Î±Î¹ Î¿ ÏÎµÎ»Î¬ÏÎ·Ï ÏÎ¿Ï;",
    desc: "Customer Persona & Jobs-To-Be-Done â Î³Î½ÏÏÎ¹ÏÎµ ÏÎ¿Î½ ÏÎµÎ»Î¬ÏÎ· ÏÎ¿Ï ÎºÎ±Î»ÏÏÎµÏÎ± Î±ÏÏ ÏÎ¿Î½ ÎµÎ±ÏÏÏ ÏÎ¿Ï.",
    xp: 300,
    duration: "9 Î»ÎµÏÏÎ¬",
    unlocked: false,
    completed: false,
    emoji: "ð¯",
  },
  {
    id: 5,
    title: "MVP: Î Î¿ÏÎ»Î± ÏÏÏÏÎ±, ÏÏÎ¹Î¬Î¾Îµ Î¼ÎµÏÎ¬",
    desc: "Minimum Viable Product â ÏÏÏ Î¿Î¹ ÎºÎ±Î»ÏÏÎµÏÎ¿Î¹ founders Î´Î¿ÎºÎ¹Î¼Î¬Î¶Î¿ÏÎ½ Î¹Î´Î­ÎµÏ ÏÏÎ¹Î½ ÎµÏÎµÎ½Î´ÏÏÎ¿ÏÎ½.",
    xp: 350,
    duration: "9 Î»ÎµÏÏÎ¬",
    unlocked: false,
    completed: false,
    emoji: "ð¦",
  },
];

function LearnPage() {
  const { isPaid, loading: subLoading } = useSubscription();
  const totalXP = lessons.filter((l) => l.completed).reduce((s, l) => s + l.xp, 0);
  const unlockedCount = lessons.filter((l) => l.unlocked).length;

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-[oklch(0.57_0.23_292)] px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="learn" />
          <div className="mx-auto max-w-3xl pt-20 text-center">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">Module 1 â Mindset ÎÏÎ¹ÏÎµÎ¹ÏÎ·Î¼Î±ÏÎ¯Î±</p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Î£ÎºÎ­ÏÏÎ¿Ï ÏÏN founder.</h1>
            <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">5 Î¼Î±Î¸Î®Î¼Î±ÏÎ± ÏÏÏ Î´ÎµÎ½ Î´Î¹Î´Î¬ÏÎºÎ¿Ï ÏÏÎ¿ ÏÏÎ¿Î»ÎµÎ¯Î¿ â real case studies, mental models, XP.</p>

            {/* Progress bar */}
            <div className="mx-auto mt-8 max-w-sm rounded-xl bg-[oklch(0.45_0.18_292)] p-5">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-2"><Star size={16} className="text-[oklch(0.85_0.18_70)]" /> {totalXP} XP</span>
                <span>{unlockedCount}/{lessons.length} Î´Î¹Î±Î¸Î­ÏÎ¹Î¼Î±</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[oklch(0.36_0.13_292)]">
                <div className="h-full rounded-full bg-[oklch(0.85_0.18_70)] transition-all" style={{ width: `${((unlockedCount / lessons.length) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <PaidGate key={lesson.id} isPaid={lesson.id <= 2 || isPaid} loading={subLoading}>
              <article
                className={`rounded-xl border p-6 transition-all ${lesson.unlocked ? "bg-card shadow-sm hover:-translate-y-1 hover:shadow-md" : "bg-muted opacity-60"}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{lesson.emoje}</span>
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
                      ÎÎ½Î¿Î¹Î¾ÎµÏ Î¼Î¬Î¸Î·Î¼Î± â
                    </Button>
                  </Link>
                )}
                {!lesson.unlocked && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
                    <CircleHelp size={12} /> ÎÎ»Î¿ÎºÎ»Î®ÏÏÏÎµ ÏÎ± ÏÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î± Î³Î¹Î± Î½Î± Î¾ÎµÎºÎ»ÎµÎ¹Î´ÏÎ¸ÎµÎ¯
                  </div>
                )}
              </article>
              </PaidGate>
            ))}
          </div>

          {/* Investment Simulator Feature Card */}
          <Link to="/stocks" className="mt-12 block">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.05_240)] to-[oklch(0.15_0.08_260)] p-8 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.4_0.2_280/0.3)] to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">ð</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.17em] text-[oklch(0.75_0.15_280)]">ÎÎ­Î¿ â ÎÎ¹Î±Î´ÏÎ±ÏÏÎ¹ÎºÏ</p>
                    <h2 className="text-2xl font-black sm:text-3xl">ÎÏÎµÎ½Î´ÏÏÎµÎ¹Ï Î¼Îµ ÎÎ»Î·Î¸Î¹Î½Î­Ï Î¤Î¹Î¼Î­Ï</h2>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-[oklch(0.9_0.03_260)] leading-relaxed">
                  ÎÎ¬Î¸Îµ ÏÎ¹ ÎµÎ¯Î½Î±Î¹ Î¼ÎµÏÎ¿ÏÎ­Ï, Î´ÎµÏ <strong>ÏÏÎ±Î³Î¼Î±ÏÎ¹ÎºÎ­Ï ÏÎ¹Î¼Î­Ï</strong> Î±ÏÏ Apple, Netflix, Roblox ÎºÎ±Î¹ Î¬Î»Î»ÎµÏ ÎµÏÎ±Î¹ÏÎ¯ÎµÏ ÏÎ³Ï â ÎºÎ±Î¹ ÏÏÎ·ÏÎ¹Î¼Î¿ÏÎ¿Î¹Î¯Î·ÏÎµÎ¹ ÏÎ± ÎµÎ¹ÎºÎ¿Î½Î¹ÎºÎ¬ Î½Î¿Î¼Î¯ÏÎ¼Î±ÏÎ¬ ÏÎ¿Ï Î³Î¹Î± Î½Î± ÎµÎ¾Î±ÏÎºÎ·Î¸ÎµÎ¯Ï ÏÏÎ¿ Î½Î± ÎµÏÎµÎ½Î´ÏÏÏÏ ÏÎñN)
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-[oklch(1_0_0/0.1)] px-4 py-1.5 text-sm font-bold">ð ÎÏÎ±ÏÎ®Î¼Î±ÏÎ± 30 Î·Î¼ÎµÏÏÎ½</span>
                  <span className="rounded-full bg-[oklch(1_0_0/0.1)] px-4 py-1.5 text-sm font-bold">ð® ÎÎ¹ÎºÎ¿Î½Î¹ÎºÏ Portfolio</span>
                  <span className="rounded-full bg-[oklch(1_0_0/0.1)] px-4 py-1.5 text-sm font-bold">ð¡ ÎÎ±Î¸Î®Î¼Î±ÏÎ± ÎÏÎµÎ½Î´ÏÏÏ1</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[oklch(0.6_0.22_280)] px-6 py-3 font-black text-white transition-all group-hover:bg-[oklch(0.65_0.22_280)]">
                  ÎÎµÎºÎ¯Î½Î± ÏÏÏÎ± â
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-6 rounded-xl bg-[oklch(0.57_0.23_292)] p-8 text-center text-primary-foreground">
            <p className="text-sm font-black uppercase tracking-[0.17em] text-[oklch(0.86_0.1_292)]">ÎÏÏÎµÏÎ±Î¹ ÏÏÎ½ÏÎ¿Î¼Î±</p>
            <h2 className="mt-3 text-3xl font-black">Module 2 â Ç¦Î¿Ï ÎÎ´Î­ÎÎµ ÏÏ Î ÏÎ¿ÏÏÎ½</h2>
            <p className="mt-3 leading-relaxed text-[oklch(0.96_0.02_292)]">Pricing, Marketing, Î§ÏÎ·Î¼Î±ÏÎ¿Î´ÏÏÎ·ÏÎ·, Pitching â ÎµÎ²Î´Î¿Î¼Î±Î´Î¹Î±Î¯ÎµÏ ÎµÎ½Î·Î¼ÎµÏÏÏÎµÎ¹Ï!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
