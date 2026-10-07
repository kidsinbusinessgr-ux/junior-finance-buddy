import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createParentProfile, createChildProfile } from "@/hooks/useJFB";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

type Step = "role" | "parent-name" | "child-name" | "done";
type Role = "parent" | "child";

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/login" });
      } else {
        setUserId(data.user.id);
      }
    });
  }, [navigate]);

  async function handleRoleSelect(selectedRole: Role) {
    setRole(selectedRole);
    setStep(selectedRole === "parent" ? "parent-name" : "child-name");
  }

  async function handleParentSubmit() {
    if (!parentName.trim() || !userId) return;
    setLoading(true);
    setError("");
    const parent = await createParentProfile(userId, parentName.trim());
    if (!parent) {
      setError("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
      setLoading(false);
      return;
    }
    setParentId(parent.id);
    setStep("child-name");
    setLoading(false);
  }

  async function handleChildSubmit() {
    if (!childName.trim() || !userId) return;
    setLoading(true);
    setError("");

    if (role === "parent" && parentId) {
      // Parent flow: create child profile linked to parent
      // For now child shares parent's user_id (single-device family)
      // In production you'd create a separate child account
      await createChildProfile(userId, parentId, childName.trim());
      setStep("done");
      setLoading(false);
    } else {
      // Child flow: create child profile (parent linkage via invite later)
      const { data: parent } = await supabase
        .from("jfb_parents")
        .select("id")
        .limit(1)
        .single();

      if (parent) {
        await createChildProfile(userId, parent.id, childName.trim());
      } else {
        // Orphan child — no parent yet
        await supabase.from("jfb_children").insert({
          user_id: userId,
          name: childName.trim(),
        });
      }
      setStep("done");
      setLoading(false);
    }
  }

  function handleDone() {
    if (role === "parent") {
      navigate({ to: "/parent-dashboard" });
    } else {
      navigate({ to: "/child-dashboard" });
    }
  }

  const stepProgress = {
    role: 1,
    "parent-name": 2,
    "child-name": role === "parent" ? 3 : 2,
    done: role === "parent" ? 4 : 3,
  };
  const totalSteps = role === "parent" ? 4 : 3;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "oklch(0.98 0.01 292)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo + Progress */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
            style={{ background: "oklch(0.57 0.23 292)" }}
          >
            🪙
          </div>
          {step !== "done" && (
            <div className="flex gap-1.5 justify-center mt-3">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i < stepProgress[step] ? "24px" : "8px",
                    background:
                      i < stepProgress[step]
                        ? "oklch(0.57 0.23 292)"
                        : "oklch(0.85 0.02 292)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Step 1: Role ── */}
        {step === "role" && (
          <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
            <h2 className="font-black text-gray-800 text-2xl mb-2">Καλώς ήρθες! 👋</h2>
            <p className="text-gray-500 font-semibold text-sm mb-6">
              Πες μας ποιος είσαι για να στήσουμε τον λογαριασμό σου.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect("parent")}
                className="w-full p-4 rounded-2xl ring-1 text-left transition-all hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "oklch(0.35 0.18 268 / 0.05)",
                  ringColor: "oklch(0.35 0.18 268)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "oklch(0.35 0.18 268 / 0.15)" }}
                  >
                    👨‍👩‍👦
                  </div>
                  <div>
                    <p className="font-black text-gray-800">Είμαι γονέας</p>
                    <p className="text-sm text-gray-500 font-semibold">
                      Δημιουργώ οικογενειακό χώρο
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("child")}
                className="w-full p-4 rounded-2xl ring-1 text-left transition-all hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "oklch(0.57 0.23 292 / 0.05)",
                  ringColor: "oklch(0.57 0.23 292)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "oklch(0.57 0.23 292 / 0.15)" }}
                  >
                    🧒
                  </div>
                  <div>
                    <p className="font-black text-gray-800">Είμαι παιδί</p>
                    <p className="text-sm text-gray-500 font-semibold">
                      Μπαίνω στον χώρο μου
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Parent name ── */}
        {step === "parent-name" && (
          <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
            <h2 className="font-black text-gray-800 text-2xl mb-2">Πώς σε λένε; 👋</h2>
            <p className="text-gray-500 font-semibold text-sm mb-6">
              Το όνομά σου θα εμφανίζεται στον γονεϊκό πίνακα.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="π.χ. Σταυρούλα"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleParentSubmit()}
              className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none mb-5 text-lg"
            />

            <button
              onClick={handleParentSubmit}
              disabled={!parentName.trim() || loading}
              className="w-full py-3 rounded-xl font-black text-white disabled:opacity-40 transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              {loading ? "…" : "Συνέχεια →"}
            </button>
          </div>
        )}

        {/* ── Step 3: Child name ── */}
        {step === "child-name" && (
          <div className="bg-white rounded-3xl p-6 ring-1 ring-border shadow-sm">
            <h2 className="font-black text-gray-800 text-2xl mb-2">
              {role === "parent" ? "Πώς λέγεται το παιδί σου; 🧒" : "Πώς σε λένε; 🧒"}
            </h2>
            <p className="text-gray-500 font-semibold text-sm mb-6">
              {role === "parent"
                ? "Θα δημιουργηθεί ο λογαριασμός του παιδιού."
                : "Το όνομά σου θα εμφανίζεται στο dashboard σου."}
            </p>

            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="π.χ. Αχιλλέας"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleChildSubmit()}
              className="w-full rounded-xl px-4 py-3 border border-gray-200 font-semibold text-gray-800 focus:outline-none mb-5 text-lg"
            />

            <button
              onClick={handleChildSubmit}
              disabled={!childName.trim() || loading}
              className="w-full py-3 rounded-xl font-black text-white disabled:opacity-40 transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              {loading ? "Δημιουργία…" : "Δημιουργία λογαριασμού →"}
            </button>

            {role === "parent" && (
              <button
                onClick={() => setStep("parent-name")}
                className="w-full mt-2 py-2.5 rounded-xl font-bold bg-gray-50 text-gray-500 text-sm"
              >
                ← Πίσω
              </button>
            )}
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <div className="bg-white rounded-3xl p-8 ring-1 ring-border shadow-sm text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-black text-gray-800 text-2xl mb-2">
              {role === "parent" ? `Καλώς ήρθες, ${parentName}!` : `Καλώς ήρθες, ${childName}!`}
            </h2>
            <p className="text-gray-500 font-semibold text-sm mb-6">
              {role === "parent"
                ? `Ο οικογενειακός χώρος είναι έτοιμος! Ο λογαριασμός για τον/την ${childName} δημιουργήθηκε.`
                : "Ο λογαριασμός σου είναι έτοιμος! Ας ξεκινήσουμε!"}
            </p>

            {role === "parent" && (
              <div className="space-y-2 text-left mb-6">
                {[
                  "✅ Γονεϊκός πίνακας ελέγχου",
                  "✅ Λογαριασμός παιδιού",
                  "✅ 8 δουλειές προστέθηκαν αυτόματα",
                  "✅ KidsCoins wallet έτοιμο",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleDone}
              className="w-full py-3 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: "oklch(0.57 0.23 292)" }}
            >
              {role === "parent" ? "Πήγαινε στον πίνακα →" : "Πήγαινε στο dashboard →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
