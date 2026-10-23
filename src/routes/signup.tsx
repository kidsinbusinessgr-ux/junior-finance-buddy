import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-kidsinbusiness_1.png";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Εγγραφή — Kids in Business" },
      { name: "description", content: "Δημιούργησε λογαριασμό στο Kids in Business και ξεκίνα να χτίζεις οικονομικές δεξιότητες με το παιδί σου." },
      { property: "og:title", content: "Εγγραφή — Kids in Business" },
      { property: "og:description", content: "Δημιούργησε λογαριασμό στο Kids in Business και ξεκίνα να χτίζεις οικονομικές δεξιότητες με το παιδί σου." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [tab, setTab] = useState<"parent" | "child">("parent");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "oklch(0.98 0.01 292)" }}
    >
      <div className="w-full max-w-sm">
        {/* Back */}
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={15} /> Αρχική
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-6">
          <img src={logo} alt="Kids in Business" className="mx-auto mb-3 h-16 w-auto" />
          <h1 className="text-2xl font-black text-gray-800">Kids in Business</h1>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-gray-100 p-1 mb-5">
          <button
            onClick={() => setTab("parent")}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${
              tab === "parent"
                ? "bg-white shadow text-gray-800"
                : "text-gray-400"
            }`}
          >
            👨‍👩‍👧 Γονέας
          </button>
          <button
            onClick={() => setTab("child")}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${
              tab === "child"
                ? "bg-white shadow text-gray-800"
                : "text-gray-400"
            }`}
          >
            🎒 Παιδί
          </button>
        </div>

        {tab === "parent" ? <ParentSignup /> : <ChildSignup />}

        <p className="text-center text-sm text-gray-400 font-semibold mt-4">
          Έχεις ήδη λογαριασμό;{" "}
          <Link to="/login" className="font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
            Σύνδεση
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ─── Parent signup ─── */
function ParentSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες."); return; }
    if (password !== confirm) { setError("Οι κωδικοί δεν ταιριάζουν."); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    setConfirmationEmail(email);
    setLoading(false);
  }

  if (confirmationEmail) {
    return (
      <section className="w-full rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-border">
        <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
        <h1 className="mt-6 text-2xl font-black">Έλεγξε το email σου!</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground text-sm">
          Στείλαμε email επιβεβαίωσης στο{" "}
          <span className="font-bold text-foreground">{confirmationEmail}</span>.
        </p>
        <Button asChild className="mt-7 w-full"><Link to="/">Αρχική</Link></Button>
      </section>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[{ icon: "📚", label: "6+ μαθήματα" }, { icon: "🪙", label: "Virtual wallet" }, { icon: "📈", label: "Επενδύσεις" }].map((b) => (
          <div key={b.label} className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-xl">{b.icon}</p>
            <p className="text-xs font-black text-gray-600 mt-1">{b.label}</p>
          </div>
        ))}
      </div>
      <h2 className="font-black text-gray-800 text-xl mb-5">Λογαριασμός γονέα</h2>
      {error && <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-1">Κωδικός</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Τουλάχιστον 8 χαρακτήρες" required className="w-full rounded-xl px-4 py-3 pr-12 border border-gray-200 font-semibold text-gray-800 focus:outline-none" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-1">Επιβεβαίωση κωδικού</label>
          <div className="relative">
            <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className="w-full rounded-xl px-4 py-3 pr-12 border border-gray-200 font-semibold text-gray-800 focus:outline-none" />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: "oklch(0.57 0.23 292)" }}>
          {loading ? "Δημιουργία…" : "Ξεκίνα δωρεάν →"}
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 font-semibold mt-4">
        Με την εγγραφή αποδέχεσαι τους <span className="underline">Όρους Χρήσης</span>
      </p>
    </div>
  );
}

/* ─── Child signup via invite code ─── */
function ChildSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"code" | "password" | "done">("code");
  const [inviteCode, setInviteCode] = useState("");
  const [childName, setChildName] = useState("");
  const [childId, setChildId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const code = inviteCode.trim().toUpperCase();
    const { data, error: dbError } = await supabase
      .from("jfb_children")
      .select("id, name, user_id")
      .eq("invite_code", code)
      .maybeSingle();

    if (dbError || !data) {
      setError("Ο κωδικός δεν βρέθηκε. Ρώτα τον γονέα σου.");
      setLoading(false);
      return;
    }
    if (data.user_id) {
      setError("Αυτός ο κωδικός έχει ήδη χρησιμοποιηθεί.");
      setLoading(false);
      return;
    }
    setChildId(data.id);
    setChildName(data.name);
    setStep("password");
    setLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Κωδικός τουλάχιστον 8 χαρακτήρες."); return; }
    if (password !== confirm) { setError("Οι κωδικοί δεν ταιριάζουν."); return; }
    if (!email.includes("@")) { setError("Χρειάζεσαι ένα έγκυρο email."); return; }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/child-dashboard` },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Σφάλμα δημιουργίας λογαριασμού.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("jfb_children")
      .update({ user_id: authData.user.id })
      .eq("id", childId);

    if (updateError) {
      setError("Σφάλμα σύνδεσης λογαριασμού: " + updateError.message);
      setLoading(false);
      return;
    }

    setStep("done");
    setLoading(false);
  }

  if (step === "done") {
    return (
      <div className="bg-white rounded-3xl p-8 text-center ring-1 ring-border shadow-sm">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-2xl font-black text-gray-800">Καλώς ήρθες, {childName}!</h2>
        <p className="text-sm text-gray-500 mt-3 mb-6">
          Επιβεβαίωσε το email σου και μετά συνδέσου.
        </p>
        <Button className="w-full" onClick={() => navigate({ to: "/login" })}>
          Σύνδεση →
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
      {step === "code" ? (
        <>
          <h2 className="font-black text-gray-800 text-xl mb-2">Είσαι μαθητής;</h2>
          <p className="text-sm text-gray-400 mb-5">
            Ζήτα από τον γονέα σου τον <span className="font-bold text-purple-600">κωδικό πρόσβασης</span> (6 γράμματα) που βλέπει στο dashboard του.
          </p>
          {error && <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">{error}</div>}
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Κωδικός πρόσβασης</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="π.χ. KIB7X3"
                maxLength={6}
                required
                className="w-full rounded-xl px-4 py-3 border border-gray-200 font-mono font-black text-xl text-center tracking-widest text-purple-700 uppercase focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <button type="submit" disabled={loading || inviteCode.length < 6} className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: "oklch(0.57 0.23 292)" }}>
              {loading ? "Αναζήτηση…" : "Συνέχεια →"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="font-black text-gray-800 text-xl mb-1">Γεια σου, {childName}! 👋</h2>
          <p className="text-sm text-gray-400 mb-5">Διάλεξε email και κωδικό για να μπαίνεις μόνος σου.</p>
          {error && <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">{error}</div>}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Email σου</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Κωδικός</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Τουλάχιστον 8 χαρακτήρες" required className="w-full rounded-xl px-4 py-3 pr-12 border border-gray-200 font-semibold text-gray-800 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Επιβεβαίωση</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: "oklch(0.57 0.23 292)" }}>
              {loading ? "Δημιουργία…" : "Δημιούργησε λογαριασμό 🚀"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
