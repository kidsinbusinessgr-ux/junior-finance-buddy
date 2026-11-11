// Server-only helpers. Import with `await import(...)` inside server handlers so
// the service role key never reaches the browser bundle.
import { createClient, type User } from "@supabase/supabase-js";

function isNewSupabaseApiKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export function getAdminClient() {
  // Vercel only has the VITE_ copy of the URL, which Vite inlines at build time.
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    global: {
      // New-style secret keys are not JWTs: send them only as `apikey`.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewSupabaseApiKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns the signed-in user for a request's `Authorization: Bearer <jwt>`, or null. */
export async function getUserFromRequest(request: Request | undefined): Promise<User | null> {
  const header = request?.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (token.split(".").length !== 3) return null;
  const { data, error } = await getAdminClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
