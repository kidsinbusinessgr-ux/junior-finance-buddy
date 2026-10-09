import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Brightly" },
      { name: "description", content: "Create a Brightly account and begin building confident money habits together." },
      { property: "og:title", content: "Create your account — Brightly" },
      { property: "og:description", content: "Create a Brightly account and begin building confident money habits together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
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

    if (password.length < 8) {
      setError("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.");
      return;
    }
    if (password !== confirm) {
      setError("Οι κωδικοί δεν ταιριάζουν.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setConfirmationEmail(email);
    setLoading(false);
  }

  if (confirmationEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <section className="w-full max-w-sm rounded-lg bg-card p-8 text-center shadow-sm ring-1 ring-border">
          <CheckCircle2 className="mx-auto h-16 w-16 text-accent" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-black">Check your email!</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">We’ve sent a confirmation email to <span className="font-bold text-foreground">{confirmationEmail}</span>. Please check your inbox and confirm your email address.</p>
          <Button asChild className="mt-7 w-full">
            <Link to="/">Back to home</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "oklch(0.98 0.01 292)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            🪙
          </div>
          <h1 className="text-2xl font-black text-gray-800">Kids in Business</h1>
          <p className="text-gray-400 text-sm font-semibold">Ξεκίνα δωρεάν — 14 μέρες trial</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: "📚", label: "6+ μαθήματα" },
            { icon: "🪙", label: "Virtual wallet" },
            { icon: "📈", label: "Επενδύσεις" },
          ].map((b) => (
            <div key={b.label} className="bg-white rounded-2xl p-3 text-center ring-1 ring-border">
              <p className="text-xl">{b.icon}</p>
              <p className="text-xs font-black text-gray-600 mt-1">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
          <h2 className="font-black text-gray-800 text-xl mb-5">Δημιουργία λογαριασμού</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Κωδικός</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Τουλάχιστον 8 χαρακτήρες"
                  required
                  className="w-full rounded-xl px-4 py-3 pr-12 border border-gray-200 font-semibold text-gray-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Επιβεβαίωση κωδικού</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-3 pr-12 border border-gray-200 font-semibold text-gray-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95 mt-2"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              {loading ? "Δημιουργία…" : "Ξεκίνα δωρεάν →"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 font-semibold mt-4">
            Με την εγγραφή αποδέχεσαι τους{" "}
            <span className="underline">Όρους Χρήσης</span>
          </p>

          <p className="text-center text-sm text-gray-400 font-semibold mt-3">
            Έχεις ήδη λογαριασμό;{" "}
            <a href="/login" className="font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
              Σύνδεση
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
