// Remembers where a visitor came from (e.g. ?from=book on links from the book
// app) so the parent account records it at sign-up. Browser-only and best
// effort: storage can be blocked, which just means no source is recorded.

const KEY = "jfb-signup-source";
const VALID = /^[a-z0-9_-]{1,20}$/;

export function rememberSignupSource() {
  try {
    const from = new URLSearchParams(window.location.search).get("from")?.toLowerCase();
    if (from && VALID.test(from)) localStorage.setItem(KEY, from);
  } catch {
    /* storage unavailable */
  }
}

export function getSignupSource(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && VALID.test(v) ? v : null;
  } catch {
    return null;
  }
}
