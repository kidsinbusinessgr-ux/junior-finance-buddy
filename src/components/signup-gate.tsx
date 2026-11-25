import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useCurrentUser } from "@/hooks/useJFB";

// Interactive tools are for signed-in users. Visitors still see what the tool
// looks like (faded, not clickable) with a free sign-up button on top, so they
// know what they get before they register.

export function SignupCta({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border bg-card p-6 text-center shadow-xl">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[oklch(0.95_0.05_292)] text-[oklch(0.5_0.2_292)]">
        <Lock size={22} />
      </div>
      <p className="mt-3 text-xl font-black">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {text ?? "Η εγγραφή είναι δωρεάν. Την κάνει ένας γονιός ή μπαίνεις με τον κωδικό της τάξης σου από τον εκπαιδευτικό σου."}
      </p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link
          to="/signup"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-black text-primary-foreground hover:bg-primary/90"
        >
          Δωρεάν εγγραφή
        </Link>
        <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-bold hover:bg-muted">
          Έχω λογαριασμό
        </Link>
      </div>
    </div>
  );
}

export function SignupGate({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  const { userId, loading } = useCurrentUser();
  if (userId) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden="true" inert className="pointer-events-none max-h-[720px] select-none overflow-hidden opacity-50 blur-[1.5px]">
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      {!loading && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <SignupCta title={title} text={text} />
        </div>
      )}
    </div>
  );
}
