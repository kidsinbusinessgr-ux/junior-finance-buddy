import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, Plus, Users } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { BusinessGuide } from "@/components/business-guide";
import { supabase } from "@/integrations/supabase/client";
import { PASSWORD_HINT, passwordProblem } from "@/lib/password-rules";
import { resetStudentPassword } from "@/lib/classes.functions";
import { readPlan } from "@/lib/startup-plan";

// The teacher's dashboard: their classes with the code for students, and how
// each student is doing (XP, lessons, startup business plan, goals).

export const Route = createFileRoute("/teacher")({
  head: () => ({ meta: [{ title: "Οι τάξεις μου – Kids in Business" }] }),
  component: TeacherPage,
});

const TOTAL_LESSONS = 11;

type Teacher = { id: string; name: string; role: string; school: string | null };
type Klass = { id: string; name: string; code: string; created_at: string };
type Student = {
  id: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  class_id: string | null;
  username: string | null;
};
type StartupRow = { id: string; name: string; emoji: string; child_id: string | null; image_url: string | null; plan: unknown };

function PlanChips({ s }: { s: StartupRow }) {
  const p = readPlan(s.plan);
  const steps: [string, boolean, string][] = [
    ["🎨", Boolean(s.image_url), "Σχέδιο"],
    ["🧮", Boolean(p.costing), "Κοστολόγηση"],
    ["📣", Boolean(p.ad), "Διαφήμιση"],
    ["🗓️", Boolean(p.action?.days.some((d) => d.text.trim())), "Σχέδιο δράσης"],
  ];
  return (
    <span className="ml-1 inline-flex gap-0.5">
      {steps.map(([e, ok, label]) => (
        <span key={label} title={`${label}: ${ok ? "έτοιμο" : "όχι ακόμα"}`} className={ok ? "" : "opacity-25 grayscale"}>
          {e}
        </span>
      ))}
    </span>
  );
}

function ResetPassword({ student, onDone }: { student: Student; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const problem = passwordProblem(pw);
    if (problem) return setMsg({ ok: false, text: problem });
    setBusy(true);
    try {
      const res = await resetStudentPassword({ data: { childId: student.id, password: pw } });
      setMsg(res.ok ? { ok: true, text: `Έτοιμο. Δώσε στον μαθητή τον νέο κωδικό.` } : { ok: false, text: res.detail ?? "Δεν άλλαξε ο κωδικός. Δοκίμασε ξανά." });
      if (res.ok) setPw("");
    } catch {
      setMsg({ ok: false, text: "Δεν άλλαξε ο κωδικός. Δοκίμασε ξανά." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-2 rounded-xl bg-muted/50 p-3 text-sm">
      <p className="font-bold">Νέος κωδικός για {student.name} (@{student.username})</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Νέος κωδικός"
          className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2"
        />
        <Button size="sm" className="rounded-full" disabled={busy || !pw} onClick={save}>
          Αποθήκευση
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={onDone}>
          Κλείσιμο
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{PASSWORD_HINT}</p>
      {msg && <p className={`mt-2 font-bold ${msg.ok ? "text-[oklch(0.45_0.14_160)]" : "text-destructive"}`}>{msg.text}</p>}
    </div>
  );
}

function TeacherPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [notTeacher, setNotTeacher] = useState(false);
  const [classes, setClasses] = useState<Klass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Record<string, number>>({});
  const [startups, setStartups] = useState<Record<string, StartupRow>>({});
  const [goals, setGoals] = useState<Record<string, { active: number; done: number }>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [newClass, setNewClass] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: t } = await supabase.from("jfb_parents").select("id, name, role, school").eq("user_id", user.id).maybeSingle();
    if (!t || t.role !== "teacher") {
      setNotTeacher(true);
      setLoading(false);
      return;
    }
    setTeacher(t);
    const [{ data: cls }, { data: kids }] = await Promise.all([
      supabase.from("jfb_classes").select("id, name, code, created_at").eq("teacher_id", t.id).order("created_at"),
      supabase.from("jfb_children").select("id, name, avatar, xp, level, class_id, username").eq("parent_id", t.id).order("name"),
    ]);
    setClasses(cls ?? []);
    setSelected((s) => s ?? cls?.[0]?.id ?? null);
    const list = (kids ?? []) as Student[];
    setStudents(list);
    const ids = list.map((k) => k.id);
    if (ids.length) {
      const [{ data: lp }, { data: st }, { data: gl }] = await Promise.all([
        supabase.from("jfb_lesson_progress").select("child_id, lesson_id").in("child_id", ids),
        supabase.from("startups").select("id, name, emoji, child_id, image_url, plan").in("child_id" as never, ids as never),
        supabase.from("jfb_savings_goals").select("child_id, completed").in("child_id", ids),
      ]);
      const lessonCount: Record<string, Set<string>> = {};
      for (const r of (lp ?? []) as { child_id: string; lesson_id: string }[]) (lessonCount[r.child_id] ??= new Set()).add(r.lesson_id);
      setLessons(Object.fromEntries(Object.entries(lessonCount).map(([k, v]) => [k, v.size])));
      const byChild: Record<string, StartupRow> = {};
      for (const s of (st ?? []) as StartupRow[]) if (s.child_id && !byChild[s.child_id]) byChild[s.child_id] = s;
      setStartups(byChild);
      const g: Record<string, { active: number; done: number }> = {};
      for (const r of (gl ?? []) as { child_id: string; completed: boolean | null }[]) {
        g[r.child_id] ??= { active: 0, done: 0 };
        if (r.completed) g[r.child_id].done++;
        else g[r.child_id].active++;
      }
      setGoals(g);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const klass = classes.find((c) => c.id === selected) ?? null;
  const inClass = useMemo(() => students.filter((s) => s.class_id === selected), [students, selected]);
  const stats = useMemo(() => {
    const n = inClass.length;
    const lessonsDone = inClass.reduce((s, k) => s + (lessons[k.id] ?? 0), 0);
    return {
      n,
      avgXp: n ? Math.round(inClass.reduce((s, k) => s + k.xp, 0) / n) : 0,
      lessonsPct: n ? Math.round((lessonsDone / (n * TOTAL_LESSONS)) * 100) : 0,
      startups: inClass.filter((k) => startups[k.id]).length,
      costed: inClass.filter((k) => startups[k.id] && readPlan(startups[k.id].plan).costing).length,
    };
  }, [inClass, lessons, startups]);

  const addClass = async () => {
    if (!teacher || !newClass.trim()) return;
    setAdding(true);
    const { data } = await supabase.from("jfb_classes").insert({ teacher_id: teacher.id, name: newClass.trim() }).select("id, name, code, created_at").single();
    setAdding(false);
    if (data) {
      setClasses((c) => [...c, data]);
      setSelected(data.id);
      setNewClass("");
    }
  };

  const copyCode = async () => {
    if (!klass) return;
    try {
      await navigator.clipboard.writeText(klass.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the code is on screen anyway */
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-[oklch(0.55_0.17_173)] px-6 pb-14 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav />
          <div className="mx-auto max-w-5xl pt-12">
            <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.86_0.1_173)]">Πίνακας εκπαιδευτικού</p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">Οι τάξεις μου</h1>
            {teacher && (
              <p className="mt-2 text-lg text-[oklch(0.96_0.02_173)]">
                {teacher.name}
                {teacher.school ? ` · ${teacher.school}` : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {loading && <p className="py-16 text-center text-muted-foreground">Φορτώνει…</p>}

        {notTeacher && (
          <div className="py-16 text-center">
            <p className="text-xl font-black">Αυτή η σελίδα είναι για εκπαιδευτικούς.</p>
            <Link to="/parent-dashboard">
              <Button className="mt-6 rounded-full">Πίνακας γονιού →</Button>
            </Link>
          </div>
        )}

        {teacher && !loading && (
          <>
            {/* Class tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelected(c.id);
                    setResetFor(null);
                  }}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-black ${selected === c.id ? "border-[oklch(0.55_0.17_173)] bg-[oklch(0.95_0.05_173)]" : "border-border"}`}
                >
                  {c.name}
                </button>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  maxLength={60}
                  placeholder="Νέα τάξη…"
                  className="w-40 rounded-full border bg-background px-4 py-2 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addClass()}
                />
                <Button size="sm" variant="outline" className="rounded-full" disabled={adding || !newClass.trim()} onClick={addClass}>
                  <Plus size={16} /> Προσθήκη
                </Button>
              </div>
            </div>

            {!klass && <p className="mt-10 text-center text-muted-foreground">Φτιάξε την πρώτη σου τάξη για να πάρεις κωδικό για τους μαθητές.</p>}

            {klass && (
              <>
                {/* Code for students */}
                <div className="mt-6 grid gap-4 rounded-3xl border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Κωδικός τάξης</p>
                    <p className="mt-1 font-mono text-4xl font-black tracking-[0.25em] text-[oklch(0.5_0.2_292)]">{klass.code}</p>
                    <Button size="sm" variant="ghost" className="mt-1 rounded-full" onClick={copyCode}>
                      <Copy size={14} /> {copied ? "Αντιγράφηκε!" : "Αντιγραφή"}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-black text-foreground">Πώς μπαίνουν οι μαθητές</p>
                    <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                      <li>buddy.kidsinbusiness.gr → Εγγραφή → 🏫 Σχολείο → «Είμαι μαθητής».</li>
                      <li>Γράφουν τον κωδικό τάξης {klass.code}.</li>
                      <li>Διαλέγουν όνομα, όνομα χρήστη και κωδικό. Δε χρειάζονται email.</li>
                      <li>Την επόμενη φορά συνδέονται με το όνομα χρήστη τους.</li>
                    </ol>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Μαθητές", String(stats.n)],
                    ["Μέσο XP", String(stats.avgXp)],
                    ["Μαθήματα", `${stats.lessonsPct}%`],
                    ["Startups", `${stats.startups} · ${stats.costed} με κοστολόγηση`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-muted/50 p-4 text-center">
                      <p className="text-xs font-bold text-muted-foreground">{k}</p>
                      <p className="mt-1 text-xl font-black">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Students */}
                <div className="mt-6 rounded-3xl border bg-card p-4 sm:p-6">
                  <h2 className="flex items-center gap-2 text-lg font-black">
                    <Users size={18} /> Μαθητές
                  </h2>
                  {inClass.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Δεν έχει μπει ακόμα κανείς. Δώσε στους μαθητές τον κωδικό {klass.code}.
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y">
                      {inClass.map((k) => {
                        const st = startups[k.id];
                        const g = goals[k.id];
                        return (
                          <li key={k.id} className="py-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span className="flex min-w-[180px] flex-1 items-center gap-2">
                                <span className="text-2xl">{k.avatar ?? "🧒"}</span>
                                <span>
                                  <span className="block font-black">{k.name}</span>
                                  {k.username && <span className="block text-xs text-muted-foreground">@{k.username}</span>}
                                </span>
                              </span>
                              <span className="text-sm">
                                <b>{k.xp}</b> XP · επίπεδο {k.level}
                              </span>
                              <span className="text-sm">
                                📚 {lessons[k.id] ?? 0}/{TOTAL_LESSONS}
                              </span>
                              <span className="text-sm">🎯 {g ? `${g.done} ✓ · ${g.active} ενεργοί` : "—"}</span>
                              <span className="min-w-[160px] text-sm">
                                {st ? (
                                  <Link to="/startups/$id" params={{ id: st.id }} className="font-bold underline">
                                    {st.emoji} {st.name}
                                  </Link>
                                ) : (
                                  <span className="text-muted-foreground">Χωρίς startup</span>
                                )}
                                {st && <PlanChips s={st} />}
                              </span>
                              {k.username && (
                                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setResetFor(resetFor === k.id ? null : k.id)}>
                                  <KeyRound size={14} /> Κωδικός
                                </Button>
                              )}
                            </div>
                            {resetFor === k.id && <ResetPassword student={k} onDone={() => setResetFor(null)} />}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}

            <p className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm">
              Θέλεις να δώσεις αποστολές με KidsCoins, να εγκρίνεις δουλειές ή να δώσεις επενδυτικό κεφάλαιο στους μαθητές σου; Όλα αυτά είναι στον{" "}
              <Link to="/parent-dashboard" className="font-bold underline">
                πίνακα δουλειών και KidsCoins
              </Link>
              .
            </p>

            <BusinessGuide />
          </>
        )}
      </section>
    </main>
  );
}
