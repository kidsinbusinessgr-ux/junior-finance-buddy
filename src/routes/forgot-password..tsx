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
      setError("ΞΞ¬Ο„ΞΉ Ο€Ξ®Ξ³Ξµ ΟƒΟ„ΟΞ±Ξ²Ξ¬. Ξ”ΞΏΞΊΞ―ΞΌΞ±ΟƒΞµ ΞΎΞ±Ξ½Ξ¬.");
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
            π™
          </div>
          <h1 className="text-2xl font-black text-gray-800">Kids in Business</h1>
          <p className="text-gray-400 text-sm font-semibold">Ξ§ΟΞ·ΞΌΞ±Ο„ΞΏΞΏΞΉΞΊΞΏΞ½ΞΏΞΌΞΉΞΊΞ® Ο€Ξ±ΞΉΞ΄ΞµΞ―Ξ± Ξ³ΞΉΞ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬</p>
        </div>

        <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">π“§</div>
              <h2 className="font-black text-gray-800 text-xl mb-2">Ξ•Ξ»Ξ­Ξ³ΞΎΞµ Ο„ΞΏ email ΟƒΞΏΟ…</h2>
              <p className="text-gray-500 text-sm font-semibold mb-6">
                Ξ£Ο„ΞµΞ―Ξ»Ξ±ΞΌΞµ ΞΏΞ΄Ξ·Ξ³Ξ―ΞµΟ‚ ΞµΟ€Ξ±Ξ½Ξ±Ο†ΞΏΟΞ¬Ο‚ ΞΊΟ‰Ξ΄ΞΉΞΊΞΏΟ ΟƒΟ„ΞΏ <span className="text-gray-700">{email}</span>.
              </p>
              <a
                href="/login"
                className="text-sm font-black"
                style={{ color: "oklch(0.57 0.23 292)" }}
              >
                β† Ξ Ξ―ΟƒΟ‰ ΟƒΟ„Ξ· ΟƒΟΞ½Ξ΄ΞµΟƒΞ·
              </a>
            </div>
          ) : (
            <>
              <h2 className="font-black text-gray-800 text-xl mb-2">Ξ•Ο€Ξ±Ξ½Ξ±Ο†ΞΏΟΞ¬ ΞΊΟ‰Ξ΄ΞΉΞΊΞΏΟ</h2>
              <p className="text-gray-400 text-sm font-semibold mb-5">
                Ξ“ΟΞ¬ΟΞµ Ο„ΞΏ email ΟƒΞΏΟ… ΞΊΞ±ΞΉ ΞΈΞ± ΟƒΞΏΟ… ΟƒΟ„ΞµΞ―Ξ»ΞΏΟ…ΞΌΞµ ΟƒΟΞ½Ξ΄ΞµΟƒΞΌΞΏ Ξ³ΞΉΞ± Ξ½Ξ­ΞΏ ΞΊΟ‰Ξ΄ΞΉΞΊΟ.
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
                  {loading ? "Ξ‘Ο€ΞΏΟƒΟ„ΞΏΞ»Ξ®β€¦" : "Ξ‘Ο€ΞΏΟƒΟ„ΞΏΞ»Ξ® ΟƒΟ…Ξ½Ξ΄Ξ­ΟƒΞΌΞΏΟ… β†’"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 font-semibold mt-5">
                <a href="/login" className="font-black" style={{ color: "oklch(0.57 0.23 292)" }}>
                  β† Ξ Ξ―ΟƒΟ‰ ΟƒΟ„Ξ· ΟƒΟΞ½Ξ΄ΞµΟƒΞ·
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

