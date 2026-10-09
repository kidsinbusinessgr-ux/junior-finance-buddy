import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase fires an AUTH_CHANGE event with type PASSWORD_RECOVERY
    // when the user arrives via the reset link. We wait for it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Ξ ΞΊΟ‰Ξ΄ΞΉΞΊΟΟ‚ Ο€ΟΞ­Ο€ΞµΞΉ Ξ½Ξ± Ξ­Ο‡ΞµΞΉ Ο„ΞΏΟ…Ξ»Ξ¬Ο‡ΞΉΟƒΟ„ΞΏΞ½ 6 Ο‡Ξ±ΟΞ±ΞΊΟ„Ξ®ΟΞµΟ‚.");
      return;
    }
    if (password !== confirm) {
      setError("ΞΞΉ ΞΊΟ‰Ξ΄ΞΉΞΊΞΏΞ― Ξ΄ΞµΞ½ Ο„Ξ±ΞΉΟΞΉΞ¬Ξ¶ΞΏΟ…Ξ½.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("ΞΞ¬Ο„ΞΉ Ο€Ξ®Ξ³Ξµ ΟƒΟ„ΟΞ±Ξ²Ξ¬. Ξ”ΞΏΞΊΞ―ΞΌΞ±ΟƒΞµ ΞΎΞ±Ξ½Ξ¬.");
      return;
    }

    // Sign out and send to login
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "oklch(0.98 0.01 292)" }}
    >
      <div className="w-full max-w-sm">
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
          <h2 className="font-black text-gray-800 text-xl mb-2">ΞΞ­ΞΏΟ‚ ΞΊΟ‰Ξ΄ΞΉΞΊΟΟ‚</h2>

          {!ready ? (
            <p className="text-gray-400 text-sm font-semibold py-4 text-center">
              Ξ•Ο€Ξ±Ξ»Ξ®ΞΈΞµΟ…ΟƒΞ· ΟƒΟ…Ξ½Ξ΄Ξ­ΟƒΞΌΞΏΟ…β€¦
            </p>
          ) : (
            <>
              <p className="text-gray-400 text-sm font-semibold mb-5">
                Ξ”ΞΉΞ¬Ξ»ΞµΞΎΞµ Ξ­Ξ½Ξ±Ξ½ Ξ½Ξ­ΞΏ ΞΊΟ‰Ξ΄ΞΉΞΊΟ Ξ³ΞΉΞ± Ο„ΞΏΞ½ Ξ»ΞΏΞ³Ξ±ΟΞΉΞ±ΟƒΞΌΟ ΟƒΞΏΟ….
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-1">ΞΞ­ΞΏΟ‚ ΞΊΟ‰Ξ΄ΞΉΞΊΟΟ‚</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="β€Άβ€Άβ€Άβ€Άβ€Άβ€Άβ€Άβ€Ά"
                    required
                    minLength={6}
                    className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-1">Ξ•Ο€Ξ±Ξ½Ξ¬Ξ»Ξ·ΟΞ· ΞΊΟ‰Ξ΄ΞΉΞΊΞΏΟ</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="β€Άβ€Άβ€Άβ€Άβ€Άβ€Άβ€Άβ€Ά"
                    required
                    className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-black text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: "oklch(0.57 0.23 292)" }}
                >
                  {loading ? "Ξ‘Ο€ΞΏΞΈΞ®ΞΊΞµΟ…ΟƒΞ·β€¦" : "Ξ‘Ο€ΞΏΞΈΞ®ΞΊΞµΟ…ΟƒΞ· Ξ½Ξ­ΞΏΟ… ΞΊΟ‰Ξ΄ΞΉΞΊΞΏΟ β†’"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

