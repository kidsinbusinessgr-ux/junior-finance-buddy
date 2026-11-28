import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { errorText, reportClientError } from "../lib/report-client-error";
import { supabase } from "@/lib/supabaseClient";
import { BuddyFloat } from "@/components/BuddyFloat";
import { FeedbackButton } from "@/components/feedback-button";
import { rememberSignupSource } from "@/lib/signup-source";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Η σελίδα δε βρέθηκε</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Η σελίδα που ψάχνεις δεν υπάρχει ή έχει μετακινηθεί.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Αρχική σελίδα
          </Link>
        </div>
      </div>
    </div>
  );
}

// After a new version is published, an open or cached page may ask for
// files that no longer exist. Then one reload fixes it, so it is done once
// on its own instead of showing the error page.
const STALE_RE = /dynamically imported module|Importing a module script failed|error loading dynamically|ChunkLoadError|Loading chunk|Unable to preload/i;
function reloadOnceForNewVersion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem("kib-reloaded-at") || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem("kib-reloaded-at", String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    if (STALE_RE.test(errorText(error)) && reloadOnceForNewVersion()) return;
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    reportClientError(error, "root");
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Η σελίδα δε φορτώθηκε
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Κάτι πήγε στραβά. Δοκίμασε να ανανεώσεις ή επέστρεψε στην αρχική.
        </p>
        <p className="mt-3 break-words text-xs text-muted-foreground/70">Για την υποστήριξη: {errorText(error).slice(0, 200)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Δοκίμασε ξανά
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Αρχική σελίδα
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Pages anyone can see without an account. /earn, /save, /spend and /invest
// explain the app (and /save holds the goal-setting lesson); they show
// personal data only when someone is signed in.
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/privacy", "/pricing", "/earn", "/save", "/spend", "/invest"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // A part of the app that fails to load after a new version: reload once.
  useEffect(() => {
    const onPreloadError = (e: Event) => {
      if (reloadOnceForNewVersion()) e.preventDefault();
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  useEffect(() => {
    rememberSignupSource();
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const path = window.location.pathname;
      if (!session && !PUBLIC_ROUTES.includes(path)) {
        router.navigate({ to: "/login" });
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const path = window.location.pathname;
      if (!session && !PUBLIC_ROUTES.includes(path)) {
        router.navigate({ to: "/login" });
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <BuddyFloat />
      <FeedbackButton />
    </QueryClientProvider>
  );
}
