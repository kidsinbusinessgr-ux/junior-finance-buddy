import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-kidsinbusiness_1.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Σύνδεση — Kids in Business" },
      { name: "description", content: "Συνδέσου στον λογαριασμό σου στο Kids in Business." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Λάθος email ή κωδικός. Δοκίμασε ξανά.");
      setLoading(false);
      return;
    }

    // Check which profile type this user has
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: child } = await supabase
      .from("jfb_children")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (child) {
      navigate({ to: "/child-dashboard" });
      return;
    }

    const { data: parent } = await supabase
      .from("jfb_parents")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (parent) {
      navigate({ to: "/parent-dashboard" });
      return;
    }

    // No profile yet → onboarding
    navigate({ to: "/onboarding" });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "oklch(0.98 0.01 292)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Kids in Business"
            className="mx-auto mb-3 h-16 w-auto"
          />
          <h1 className="text-2xl font-black text-gray-800">Kids in Business</h1>
          <p className="text-gray-400 text-sm font-semibold">Χρηματοοικονομική παιδεία για παιδιά</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
          <h2 className="font-black text-gray-800 text-xl mb-5">Σύνδεση</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Κωδικός</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95 mt-2"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              {loading ? "Σύνδεση…" : "Σύνδεση →"}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            <Link to="/forgot-password" className="text-gray-400 font-semibold hover:underline">
              Ξέχασες τον κωδικό;
            </Link>
          </p>

          <p className="text-center text-sm text-gray-400 font-semibold mt-3">
            Δεν έχεις λογαριασμό;{" "}
            <Link to="/signup" className="font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
              Εγγραφή
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

