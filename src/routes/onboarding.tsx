import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createParentProfile, addFirstChild } from "@/hooks/useJFB";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const AVATARS = [
  "🦁","🐯","🐻","🐼","🦊","🐶","🐱","🐸",
  "🐙","🦋","🌸","🌺","🌻","🍀","🎯","⚡",
  "🌈","🦄","🐬","🦅","🐲","🌙","⭐","🎨",
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [parentName, setParentName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);

  const [childName, setChildName] = useState("");
  const [childAvatar, setChildAvatar] = useState("🦁");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStep1() {
    if (!parentName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Δεν βρέθηκε χρήστης");
      const profile = await createParentProfile(user.id, parentName.trim());
      setParentId(profile.id);
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Σφάλμα");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    if (!childName.trim() || !parentId) return;
    setLoading(true);
    setError("");
    try {
      await addFirstChild(parentId, childName.trim(), childAvatar);
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Σφάλμα");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[oklch(0.97_0.01_250)] px-6">
      <div className="mb-8 flex gap-3">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              step >= s
                ? "bg-[oklch(0.55_0.18_250)] scale-125"
                : "bg-[oklch(0.85_0.04_250)]"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-center text-3xl font-bold text-[oklch(0.3_0.08_250)]">
            Καλωσήρθες! 👋
          </h1>
          <p className="mb-8 text-center text-[oklch(0.5_0.04_250)]">
            Ας φτιάξουμε τον λογαριασμό σου.
          </p>
          <label className="mb-1 block text-sm font-medium text-[oklch(0.4_0.08_250)]">
            Το όνομά σου (γονιός)
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStep1()}
            placeholder="π.χ. Μαρία"
            className="mb-4 w-full rounded-2xl border border-[oklch(0.85_0.04_250)] p-4 text-lg text-[oklch(0.3_0.08_250)] outline-none focus:border-[oklch(0.55_0.18_250)]"
          />
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <button
            disabled={!parentName.trim() || loading}
            onClick={handleStep1}
            className="w-full rounded-2xl bg-[oklch(0.55_0.18_250)] py-4 text-lg font-bold text-white disabled:opacity-50"
          >
            {loading ? "…" : "Συνέχεια →"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-center text-3xl font-bold text-[oklch(0.3_0.08_250)]">
            Πρόσθεσε παιδί 🧒
          </h1>
          <p className="mb-6 text-center text-[oklch(0.5_0.04_250)]">
            Μπορείς να προσθέσεις κι άλλα αργότερα.
          </p>
          <label className="mb-1 block text-sm font-medium text-[oklch(0.4_0.08_250)]">
            Όνομα παιδιού
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="π.χ. Νίκος"
            className="mb-5 w-full rounded-2xl border border-[oklch(0.85_0.04_250)] p-4 text-lg text-[oklch(0.3_0.08_250)] outline-none focus:border-[oklch(0.55_0.18_250)]"
          />
          <label className="mb-2 block text-sm font-medium text-[oklch(0.4_0.08_250)]">
            Επίλεξε avatar
          </label>
          <div className="mb-6 grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setChildAvatar(a)}
                className={`rounded-xl p-1.5 text-2xl transition ${
                  childAvatar === a
                    ? "bg-[oklch(0.55_0.18_250)] ring-2 ring-[oklch(0.45_0.18_250)]"
                    : "bg-[oklch(0.94_0.03_250)] hover:bg-[oklch(0.88_0.06_250)]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="text-4xl">{childAvatar}</span>
            <div>
              <p className="font-semibold text-[oklch(0.3_0.08_250)]">
                {childName || "…"}
              </p>
              <p className="text-sm text-[oklch(0.5_0.04_250)]">
                🪙 0 · 🌱 Level 1
              </p>
            </div>
          </div>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <button
            disabled={!childName.trim() || loading}
            onClick={handleStep2}
            className="w-full rounded-2xl bg-[oklch(0.55_0.18_250)] py-4 text-lg font-bold text-white disabled:opacity-50"
          >
            {loading ? "…" : "Δημιουργία →"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 text-7xl">🎉</div>
          <h1 className="mb-3 text-3xl font-bold text-[oklch(0.3_0.08_250)]">
            Όλα έτοιμα!
          </h1>
          <p className="mb-8 text-[oklch(0.5_0.04_250)]">
            Ο λογαριασμός σου και το παιδί σου δημιουργήθηκαν επιτυχώς.
          </p>
          <button
            onClick={() => navigate({ to: "/parent-dashboard" })}
            className="w-full rounded-2xl bg-[oklch(0.55_0.18_250)] py-4 text-lg font-bold text-white"
          >
            Πάμε στο dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
