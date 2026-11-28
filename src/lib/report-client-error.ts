import { supabase } from "@/integrations/supabase/client";

// Sends a page-breaking error to jfb_client_errors (write-only from the
// browser), so it can be fixed without asking for screenshots. Short text
// only, and never more than a few times per page load.

let sent = 0;

export function errorText(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (error instanceof Response) return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

export function reportClientError(error: unknown, where: string) {
  if (typeof window === "undefined" || sent >= 5) return;
  sent++;
  const stack = error instanceof Error && error.stack ? error.stack.split("\n").slice(0, 12).join("\n") : "";
  supabase
    .from("jfb_client_errors" as never)
    .insert({
      path: `${window.location.pathname} · ${where}`.slice(0, 200),
      message: errorText(error).slice(0, 500),
      stack: stack.slice(0, 2000),
      browser: navigator.userAgent.slice(0, 300),
    } as never)
    .then(() => undefined);
}
