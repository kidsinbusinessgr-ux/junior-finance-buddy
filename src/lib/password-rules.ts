// Supabase Auth is set to require a lowercase letter, an uppercase letter,
// a digit and a symbol, and at least 8 characters. We check the same rules
// here so people see a clear Greek message instead of a generic error.

export const PASSWORD_HINT =
  "Τουλάχιστον 8 χαρακτήρες, με μικρό και κεφαλαίο λατινικό γράμμα, αριθμό και σύμβολο (π.χ. ! @ # ?).";

export function passwordProblem(pw: string): string | null {
  const missing: string[] = [];
  if (!/[a-z]/.test(pw)) missing.push("ένα μικρό λατινικό γράμμα (a–z)");
  if (!/[A-Z]/.test(pw)) missing.push("ένα κεφαλαίο λατινικό γράμμα (A–Z)");
  if (!/[0-9]/.test(pw)) missing.push("έναν αριθμό");
  if (!/[^A-Za-z0-9]/.test(pw)) missing.push("ένα σύμβολο (π.χ. ! @ # ?)");
  if (pw.length < 8) return "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.";
  if (missing.length) return "Ο κωδικός χρειάζεται ακόμα: " + missing.join(", ") + ".";
  return null;
}

// Turns a Supabase Auth error into a message people can act on.
export function authErrorMessage(err: { message?: string; code?: string } | null | undefined): string {
  const msg = err?.message ?? "";
  if (err?.code === "weak_password" || /password should/i.test(msg)) return "Ο κωδικός δεν είναι αρκετά δυνατός. " + PASSWORD_HINT;
  if (err?.code === "same_password" || /different from the old/i.test(msg)) return "Ο νέος κωδικός πρέπει να είναι διαφορετικός από τον παλιό.";
  if (/already registered/i.test(msg)) return "Υπάρχει ήδη λογαριασμός με αυτό το email.";
  return "Κάτι πήγε στραβά. Δοκίμασε ξανά.";
}
