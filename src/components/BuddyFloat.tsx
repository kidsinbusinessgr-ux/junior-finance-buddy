import { useState, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { chatWithBuddy, type ChatMessage } from "@/lib/buddy.functions";

const PUBLIC_ROUTES = new Set([
  "/", "/login", "/signup", "/forgot-password",
  "/reset-password", "/pricing", "/payment-success", "/payment-cancel",
]);

export function BuddyFloat() {
  const router = useRouter();
  const path   = router.state.location.pathname;

  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const isHidden =
    PUBLIC_ROUTES.has(path) ||
    path.startsWith("/admin") ||
    path.startsWith("/parent") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding");

  const send = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { reply } = await chatWithBuddy({ data: { messages: newMessages, page: path } });
      setMessages([...newMessages, { role: "model", text: reply }]);
    } catch (e) {
      console.error("Buddy error:", e);
      setMessages([...newMessages, { role: "model", text: "Ουπς! Κάτι πήγε στραβά. Δοκίμασε ξανά 😊" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, path]);

  if (isHidden) return null;

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => {
          if (!open && messages.length === 0) {
            setOpen(true);
          } else {
            setOpen((v) => !v);
          }
        }}
        aria-label="KidsInBusiness Buddy"
        style={{
          position: "fixed", bottom: "80px", right: "16px", zIndex: 9999,
          width: "52px", height: "52px", borderRadius: "50%",
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          boxShadow: "0 4px 16px rgba(124,58,237,.45)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", transition: "transform .15s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: "144px", right: "16px", zIndex: 9998,
          width: "min(320px, calc(100vw - 32px))",
          height: "420px",
          borderRadius: "16px",
          background: "#f5f3ff",
          border: "1.5px solid #a78bfa",
          boxShadow: "0 8px 32px rgba(124,58,237,.20)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ fontSize: "18px" }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "#fff" }}>KidsInBusiness Buddy</div>
              <div style={{ fontSize: "11px", color: "#e9d5ff" }}>Ρώτα με οτιδήποτε!</div>
            </div>
            <button
              onClick={() => { setMessages([]); setOpen(false); }}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "#e9d5ff", cursor: "pointer", fontSize: "11px" }}
            >
              🗑 Καθαρισμός
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            {messages.length === 0 && !loading && (
              <div style={{ textAlign: "center", color: "#7c3aed", fontSize: "13px", marginTop: "20px" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤖</div>
                Γεια! Ρώτα με οτιδήποτε για χρήματα και επιχειρηματικότητα!
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                background: m.role === "user" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#fff",
                color: m.role === "user" ? "#fff" : "#3b0764",
                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                padding: "8px 12px",
                fontSize: "13px",
                lineHeight: "1.45",
                boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start",
                background: "#fff", borderRadius: "12px 12px 12px 2px",
                padding: "8px 14px", fontSize: "20px",
                boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              }}>
                ···
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length === 0 && !loading && (
            <div style={{ padding: "0 10px 8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Τι είναι μετοχή;", "Πώς αποταμιεύω;", "Τι είναι επένδυση;"].map((q) => (
                <button key={q} onClick={() => send(q)} style={{
                  fontSize: "11px", padding: "4px 10px", borderRadius: "20px",
                  background: "#ede9fe", border: "1px solid #a78bfa",
                  color: "#5b21b6", cursor: "pointer",
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px", borderTop: "1px solid #ddd6fe",
            display: "flex", gap: "6px", background: "#fff",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Γράψε εδώ..."
              disabled={loading}
              style={{
                flex: 1, borderRadius: "20px", border: "1.5px solid #a78bfa",
                padding: "7px 12px", fontSize: "13px", outline: "none",
                background: "#f5f3ff", color: "#3b0764",
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                border: "none", borderRadius: "50%",
                width: "34px", height: "34px",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                opacity: input.trim() && !loading ? 1 : 0.5,
                fontSize: "14px", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
