import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { askGeneralBuddy, type GeneralBuddyResponse } from "@/lib/buddy.functions";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup", "/forgot-password", "/reset-password", "/pricing", "/payment-success", "/payment-cancel"]);

export function BuddyFloat() {
  const router = useRouter();
  const path = router.state.location.pathname;

  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [buddy, setBuddy]     = useState<GeneralBuddyResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(path);

  // Hide on public / admin / parent pages
  const isHidden =
    PUBLIC_ROUTES.has(path) ||
    path.startsWith("/admin") ||
    path.startsWith("/parent") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding");

  // Refresh buddy message when page changes
  useEffect(() => {
    if (path !== currentPage) {
      setCurrentPage(path);
      setBuddy(null);
      if (open) setOpen(false);
    }
  }, [path, currentPage, open]);

  const fetchBuddy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await askGeneralBuddy({ data: { page: path } });
      setBuddy(res);
    } catch {
      setBuddy({ emoji: "💡", message: "Συνέχισε έτσι! Κάθε μέρα μαθαίνεις κάτι νέο για τα χρήματα!" });
    } finally {
      setLoading(false);
    }
  }, [path]);

  const handleOpen = () => {
    setOpen(true);
    if (!buddy) fetchBuddy();
  };

  if (isHidden) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="KidsInBusiness Buddy"
        style={{
          position: "fixed",
          bottom: "80px",   // above bottom nav
          right: "16px",
          zIndex: 9999,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          boxShadow: "0 4px 16px rgba(124,58,237,0.45)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Popup card */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "144px",
            right: "16px",
            zIndex: 9998,
            width: "min(300px, calc(100vw - 32px))",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            border: "1.5px solid #a78bfa",
            boxShadow: "0 8px 32px rgba(124,58,237,0.20)",
            padding: "16px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#5b21b6" }}>
              KidsInBusiness Buddy
            </span>
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ display: "flex", gap: "4px", alignItems: "center", color: "#7c3aed", fontSize: "13px" }}>
              <span style={{ animation: "pulse 1s infinite" }}>⏳</span>
              <span>Σκέφτομαι...</span>
            </div>
          ) : buddy ? (
            <div>
              <div style={{ fontSize: "28px", textAlign: "center", marginBottom: "8px" }}>
                {buddy.emoji}
              </div>
              <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#3b0764", margin: 0 }}>
                {buddy.message}
              </p>
            </div>
          ) : null}

          {/* Refresh */}
          {buddy && !loading && (
            <button
              onClick={() => { setBuddy(null); fetchBuddy(); }}
              style={{
                marginTop: "12px",
                fontSize: "11px",
                color: "#7c3aed",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              🔄 Νέα συμβουλή
            </button>
          )}
        </div>
      )}
    </>
  );
}
