import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRIVACY_VERSION } from "@/routes/privacy";
import { getSignupSource } from "@/lib/signup-source";
import { PASSWORD_HINT, authErrorMessage, passwordProblem } from "@/lib/password-rules";
import { joinClass, USERNAME_RE, type JoinClassResult } from "@/lib/classes.functions";
import { Button } from "@/components/ui/button";

// Sign-up for schools: the teacher with an email, and students with the class
// code, a username and a password (no email for students).

const field = "w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300";
const primary = "w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95";
const PURPLE = { background: "oklch(0.57 0.23 292)" };

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Τουλάχιστον 8 χαρακτήρες"}
        title={PASSWORD_HINT}
        required
        className={`${field} pr-12`}
      />
      <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label={show ? "Κρύψε τον κωδικό" : "Δείξε τον κωδικό"}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

/* ─── Teacher ─── */
export function TeacherSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Για να συνεχίσεις, επιβεβαίωσε τους όρους για τη χρήση στην τάξη.");
      return;
    }
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("Οι κωδικοί δεν ταιριάζουν.");
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: {
          role: "teacher",
          privacy_consent_at: new Date().toISOString(),
          privacy_version: PRIVACY_VERSION,
          signup_source: getSignupSource() ?? "direct",
        },
      },
    });
    setLoading(false);
    if (authError) return setError(authErrorMessage(authError));
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <section className="w-full rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-border">
        <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
        <h2 className="mt-6 text-2xl font-black">Έλεγξε το email σου!</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Στείλαμε email επιβεβαίωσης στο <span className="font-bold text-foreground">{sentTo}</span>. Μετά θα φτιάξεις την πρώτη σου τάξη.
        </p>
      </section>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border">
      <h2 className="mb-2 text-xl font-black text-gray-800">Λογαριασμός εκπαιδευτικού</h2>
      <p className="mb-5 text-sm text-gray-500">
        Φτιάχνεις τάξεις και παίρνεις έναν κωδικό για κάθε τάξη. Οι μαθητές μπαίνουν με τον κωδικό, χωρίς email, και εσύ βλέπεις την πρόοδό τους.
      </p>
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.gr" required className={field} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Κωδικός</label>
          <PasswordInput value={password} onChange={setPassword} />
          <p className="mt-1.5 text-xs font-semibold text-gray-400">{PASSWORD_HINT}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Επιβεβαίωση κωδικού</label>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="••••••••" />
        </div>
        <label htmlFor="teacher-consent" className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          <input id="teacher-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[oklch(0.57_0.23_292)]" />
          <span>
            Είμαι εκπαιδευτικός. Θα χρησιμοποιήσω την εφαρμογή με τους μαθητές μου με τη συγκατάθεση των γονέων τους, όπως ορίζει το σχολείο μου,
            και συμφωνώ με την{" "}
            <Link to="/privacy" target="_blank" className="font-bold underline">Πολιτική Απορρήτου</Link>.
          </span>
        </label>
        <button type="submit" disabled={loading || !consent} className={primary} style={PURPLE}>
          {loading ? "Δημιουργία…" : "Δημιούργησε λογαριασμό εκπαιδευτικού →"}
        </button>
      </form>
    </div>
  );
}

/* ─── Student with a class code ─── */
const AVATARS = ["🦁", "🐯", "🦊", "🐼", "🐸", "🐙", "🦄", "🐬", "🦅", "🐲", "⚡", "🎨", "🎮", "⚽", "🎸", "🚀"];

const JOIN_ERRORS: Record<Exclude<JoinClassResult, { ok: true }>["reason"], string> = {
  bad_code: "Ο κωδικός τάξης δε βρέθηκε. Ρώτα τον εκπαιδευτικό σου.",
  full: "Η τάξη είναι γεμάτη. Ρώτα τον εκπαιδευτικό σου.",
  taken: "Αυτό το όνομα χρήστη υπάρχει ήδη. Διάλεξε άλλο.",
  weak_password: "Ο κωδικός δεν είναι αρκετά δυνατός. " + PASSWORD_HINT,
  bad_words: "Ας κρατήσουμε τα ονόματα ευγενικά 😊",
  failed: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
};

export function StudentJoin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"code" | "account">("code");
  const [code, setCode] = useState("");
  const [klass, setKlass] = useState<{ class_name: string; teacher_name: string; school: string | null } | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data } = await supabase.rpc("jfb_check_class_code" as never, { p_code: code.trim().toUpperCase() } as never);
    setLoading(false);
    const row = ((data ?? []) as { class_name: string; teacher_name: string; school: string | null }[])[0];
    if (!row) return setError(JOIN_ERRORS.bad_code);
    setKlass(row);
    setStep("account");
  }

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const u = username.trim().toLowerCase();
    if (name.trim().length < 2) return setError("Γράψε το όνομά σου.");
    if (!USERNAME_RE.test(u)) return setError("Το όνομα χρήστη θέλει 3–20 λατινικά γράμματα, αριθμούς, τελεία ή κάτω παύλα, π.χ. maria.k");
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("Οι κωδικοί δεν ταιριάζουν.");
    setLoading(true);
    try {
      const res = await joinClass({ data: { code, name: name.trim(), username: u, password, avatar } });
      if (!res.ok) {
        setError(res.detail ?? JOIN_ERRORS[res.reason]);
        setLoading(false);
        return;
      }
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: res.email, password });
      if (signErr) {
        navigate({ to: "/login" });
        return;
      }
      navigate({ to: "/child-dashboard" });
    } catch {
      setError(JOIN_ERRORS.failed);
      setLoading(false);
    }
  }

  if (step === "code") {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border">
        <h2 className="mb-2 text-xl font-black text-gray-800">Μπαίνεις με την τάξη σου;</h2>
        <p className="mb-5 text-sm text-gray-500">
          Γράψε τον <span className="font-bold text-purple-600">κωδικό τάξης</span> (6 γράμματα) που σου έδωσε ο εκπαιδευτικός σου.
        </p>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}
        <form onSubmit={checkCode} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="π.χ. 43JDC8"
            maxLength={6}
            required
            aria-label="Κωδικός τάξης"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center font-mono text-xl font-black uppercase tracking-widest text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button type="submit" disabled={loading || code.length < 6} className={primary} style={PURPLE}>
            {loading ? "Αναζήτηση…" : "Συνέχεια →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border">
      <div className="mb-5 rounded-2xl bg-purple-50 p-4 text-sm">
        <p className="font-black text-purple-700">🏫 {klass?.class_name}</p>
        <p className="text-purple-600">
          {klass?.teacher_name}
          {klass?.school ? ` · ${klass.school}` : ""}
        </p>
      </div>
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}
      <form onSubmit={createAccount} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Το όνομά σου</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="π.χ. Μαρία Κ." required className={field} />
          <p className="mt-1 text-xs text-gray-400">Μόνο το μικρό σου όνομα και το αρχικό του επωνύμου.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-600">Διάλεξε εικονίδιο</label>
          <div className="grid grid-cols-8 gap-1.5">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`rounded-xl p-1 text-2xl ${avatar === a ? "bg-purple-100 ring-2 ring-purple-400" : "hover:bg-gray-100"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Όνομα χρήστη</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
            maxLength={20}
            placeholder="π.χ. maria.k"
            autoCapitalize="none"
            required
            className={field}
          />
          <p className="mt-1 text-xs text-gray-400">Με λατινικά γράμματα. Σημείωσέ το κάπου: με αυτό θα συνδέεσαι.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Κωδικός</label>
          <PasswordInput value={password} onChange={setPassword} />
          <p className="mt-1.5 text-xs font-semibold text-gray-400">{PASSWORD_HINT}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-gray-600">Επιβεβαίωση</label>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className={primary} style={PURPLE}>
          {loading ? "Δημιουργία…" : "Μπες στην τάξη 🚀"}
        </button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("code"); setError(""); }}>
          ← Άλλος κωδικός
        </Button>
      </form>
    </div>
  );
}
