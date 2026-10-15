import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
      return;
    }

    setSent(true);
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
            🏦
          </div>
          <h1 className="text-2xl font-black text-gray-800">Kids in Business</h1>
          <p className="text-gray-400 text-sm font-semibold">Χρηματοοικονομική παιδεία για παιδιά</p>
        </div>

        <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="font-black text-gray-800 text-xl mb-2">Έλεγξε το email σου</h2>
              <p className="text-gray-500 text-sm font-semibold mb-6">
                Στείλαμε οδηγίες επαναφοράς κωδικού στο{" "}
                <span className="text-gray-700">{email}</span>.
              </p>
              <a
                href="/login"
                className="text-sm font-black"
                style={{ color: "oklch(0.57 0.23 292)" }}
              >
                ← Πίσω στη σύνδεση
              </a>
            </div>
          ) : (
            <>
              <h2 className="font-black text-gray-800 text-xl mb-2">Επαναφορά κωδικού</h2>
              <p className="text-gray-400 text-sm font-semibold mb-5">
                Γράψε το email σου και θα σου στείλουμε σύνδεσμο για νέο κωδικό.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: "oklch(0.57 0.23 292)" }}
                >
                  {loading ? "Αποστολή…" : "Αποστολή συνδέσμου →"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 font-semibold mt-5">
                <a href="/login" className="font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
                  ← Πίσω στη σύνδεση
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
