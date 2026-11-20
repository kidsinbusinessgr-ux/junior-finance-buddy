import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// "Πες μας τη γνώμη σου" for signed-in parents and children during the Beta.
// Messages go to jfb_feedback through jfb_send_feedback (max 5 a day) and are
// read on /admin.

const HIDDEN = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/pricing",
  "/payment-success", "/payment-cancel", "/privacy", "/onboarding"];

export function FeedbackButton() {
  const router = useRouter();
  const path = router.state.location.pathname;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "limit">("idle");

  if (HIDDEN.includes(path) || path.startsWith("/admin")) return null;

  async function send() {
    const message = text.trim();
    if (!message || state === "sending") return;
    setState("sending");
    const { error } = await supabase.rpc(
      "jfb_send_feedback" as never,
      { p_message: message.slice(0, 1000), p_page: path } as never,
    );
    if (error) {
      setState(error.message.includes("Too many") ? "limit" : "error");
      return;
    }
    setText("");
    setState("sent");
  }

  function close() {
    setOpen(false);
    if (state !== "sending") setState("idle");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="fixed bottom-[86px] left-4 z-[9998] rounded-full bg-white px-3 py-2 text-xs font-black text-[oklch(0.45_0.2_292)] shadow-lg ring-1 ring-[oklch(0.85_0.06_292)] transition hover:scale-105"
      >
        💬 Η γνώμη σου
      </button>

      {open && (
        <div className="fixed bottom-[132px] left-4 z-[9998] w-[min(320px,calc(100vw-32px))] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-gray-200">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-black text-gray-800">Πες μας τη γνώμη σου</p>
            <button type="button" onClick={close} aria-label="Κλείσιμο" className="text-gray-400 hover:text-gray-700">✕</button>
          </div>

          {state === "sent" ? (
            <p className="py-4 text-center text-sm font-semibold text-gray-700">
              🙏 Ευχαριστούμε! Το διαβάζουμε σίγουρα.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-gray-500">
                Τι σου άρεσε; Τι σε μπέρδεψε; Τι θα ήθελες να έχει; Μη γράφεις προσωπικά στοιχεία.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 p-2 text-sm outline-none focus:border-[oklch(0.57_0.23_292)]"
                placeholder="Γράψε εδώ…"
              />
              {state === "error" && <p className="mt-1 text-xs font-semibold text-red-600">Δε στάλθηκε. Δοκίμασε ξανά σε λίγο.</p>}
              {state === "limit" && <p className="mt-1 text-xs font-semibold text-red-600">Έστειλες ήδη 5 μηνύματα σήμερα. Ευχαριστούμε! Ξαναγράψε αύριο.</p>}
              <button
                type="button"
                onClick={send}
                disabled={!text.trim() || state === "sending"}
                className="mt-2 w-full rounded-xl py-2 text-sm font-black text-white disabled:opacity-50"
                style={{ background: "oklch(0.57 0.23 292)" }}
              >
                {state === "sending" ? "Αποστολή…" : "Στείλε"}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
