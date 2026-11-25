import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// First visit of a teacher after confirming their email: their name, the
// school, and the first class, which gets its code for the students.

const input =
  "mb-4 w-full rounded-2xl border border-[oklch(0.85_0.04_250)] p-4 text-lg text-[oklch(0.3_0.08_250)] outline-none focus:border-[oklch(0.55_0.18_250)]";

export function TeacherOnboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!name.trim() || !className.trim()) return;
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Συνδέσου ξανά.");
      let { data: teacher } = await supabase.from("jfb_parents").select("id, role").eq("user_id", user.id).maybeSingle();
      if (!teacher) {
        const { data, error } = await supabase
          .from("jfb_parents")
          .insert({ user_id: user.id, name: name.trim(), role: "teacher", school: school.trim() || null })
          .select("id, role")
          .single();
        if (error || !data) throw new Error("Δεν αποθηκεύτηκε ο λογαριασμός. Δοκίμασε ξανά.");
        teacher = data;
      }
      if (teacher.role !== "teacher") throw new Error("Αυτός ο λογαριασμός είναι λογαριασμός γονιού.");
      const { data: cls, error: clsErr } = await supabase
        .from("jfb_classes")
        .insert({ teacher_id: teacher.id, name: className.trim() })
        .select("code")
        .single();
      if (clsErr || !cls) throw new Error("Δε δημιουργήθηκε η τάξη. Δοκίμασε ξανά.");
      setCode(cls.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Κάτι πήγε στραβά.");
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-5xl">🏫</p>
        <h1 className="mt-4 text-3xl font-bold text-[oklch(0.3_0.08_250)]">Η τάξη σου είναι έτοιμη!</h1>
        <p className="mt-3 text-[oklch(0.5_0.04_250)]">Δώσε αυτόν τον κωδικό στους μαθητές σου:</p>
        <p className="mx-auto mt-4 w-fit rounded-2xl bg-white px-8 py-4 font-mono text-4xl font-black tracking-[0.3em] text-[oklch(0.5_0.2_292)] shadow-sm">
          {code}
        </p>
        <p className="mt-4 text-sm text-[oklch(0.5_0.04_250)]">
          Οι μαθητές πάνε στο buddy.kidsinbusiness.gr → Εγγραφή → Σχολείο → «Είμαι μαθητής», γράφουν τον κωδικό και διαλέγουν όνομα χρήστη και
          κωδικό. Δε χρειάζονται email.
        </p>
        <button
          onClick={() => navigate({ to: "/teacher" })}
          className="mt-8 w-full rounded-2xl bg-[oklch(0.55_0.18_250)] py-4 text-lg font-bold text-white"
        >
          Πίνακας τάξεων →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-center text-3xl font-bold text-[oklch(0.3_0.08_250)]">Καλώς ήρθες! 👩‍🏫</h1>
      <p className="mb-8 text-center text-[oklch(0.5_0.04_250)]">Ας φτιάξουμε την πρώτη σου τάξη.</p>
      <label className="mb-1 block text-sm font-medium text-[oklch(0.4_0.08_250)]">Το όνομά σου (όπως θα το βλέπουν οι μαθητές)</label>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="π.χ. κ. Παπαδοπούλου" className={input} />
      <label className="mb-1 block text-sm font-medium text-[oklch(0.4_0.08_250)]">Σχολείο (προαιρετικό)</label>
      <input value={school} onChange={(e) => setSchool(e.target.value)} maxLength={80} placeholder="π.χ. 3ο Γυμνάσιο Ρόδου" className={input} />
      <label className="mb-1 block text-sm font-medium text-[oklch(0.4_0.08_250)]">Όνομα τάξης</label>
      <input value={className} onChange={(e) => setClassName(e.target.value)} maxLength={60} placeholder="π.χ. Β2 · Όμιλος Επιχειρηματικότητας" className={input} />
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      <button
        disabled={!name.trim() || !className.trim() || loading}
        onClick={create}
        className="w-full rounded-2xl bg-[oklch(0.55_0.18_250)] py-4 text-lg font-bold text-white disabled:opacity-50"
      >
        {loading ? "…" : "Φτιάξε την τάξη →"}
      </button>
    </div>
  );
}

// On the parent dashboard: a way back to the classes, for teachers.
export function TeacherLink() {
  const navigate = useNavigate();
  const [isTeacher, setIsTeacher] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("jfb_parents")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setIsTeacher(data?.role === "teacher"));
    });
  }, []);
  if (!isTeacher) return null;
  return (
    <button
      onClick={() => navigate({ to: "/teacher" })}
      className="mb-4 w-full rounded-2xl bg-[oklch(0.95_0.05_173)] p-4 text-left font-bold text-[oklch(0.3_0.1_173)]"
    >
      🏫 Οι τάξεις μου: κωδικοί, μαθητές και πρόοδος →
    </button>
  );
}
