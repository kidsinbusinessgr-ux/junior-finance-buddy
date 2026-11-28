import { Component, type ReactNode } from "react";
import { reportClientError } from "@/lib/report-client-error";

// Around a lesson's workshop: if something in it breaks, the lesson page
// stays up (slides and quiz still work) and shows what went wrong, so the
// child can go on and we can see the cause.

export class WorkshopBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("workshop failed", error);
    reportClientError(error, "workshop");
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-xl rounded-3xl border bg-card p-8 text-center">
        <p className="text-4xl">🛠️</p>
        <p className="mt-3 text-xl font-black">Το εργαστήριο δε φορτώθηκε</p>
        <p className="mt-2 text-muted-foreground">Μπορείς να συνεχίσεις στο quiz. Δοκίμασε ξανά αργότερα.</p>
        <button
          onClick={() => {
            try {
              // A broken draft on this device is the usual cause. These are
              // safe to drop: the goal card is unsent, the rest is in the account.
              for (const k of Object.keys(localStorage)) if (k === "kib-goal-card" || k.startsWith("kib-work-")) localStorage.removeItem(k);
            } catch {
              /* no storage */
            }
            this.setState({ error: null });
          }}
          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground"
        >
          Δοκίμασε ξανά
        </button>
        <p className="mt-4 break-words text-xs text-muted-foreground">Για την υποστήριξη: {this.state.error.message}</p>
      </div>
    );
  }
}
