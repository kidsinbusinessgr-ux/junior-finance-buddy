// Free launch period: everything is open to everyone and payment is hidden.
// The Stripe payment code stays in place (src/lib/stripe.functions.ts, /pricing,
// /payment-success) and comes back by itself when the period ends.
//
// To set the end date, write it as "YYYY-MM-DD" in `endsOn` (e.g. "2027-02-19");
// the last free day is that date. To end the free period now, set `active: false`.
export const FREE_LAUNCH = {
  active: true,
  endsOn: null as string | null,
};

export function freeLaunchActive(now: Date = new Date()): boolean {
  if (!FREE_LAUNCH.active) return false;
  if (!FREE_LAUNCH.endsOn) return true;
  return now <= new Date(`${FREE_LAUNCH.endsOn}T23:59:59`);
}

// "μέχρι 19 Φεβρουαρίου 2027" or "για τους πρώτους χρήστες".
export function freeLaunchUntil(): string {
  if (!FREE_LAUNCH.endsOn) return "για τους πρώτους χρήστες";
  const date = new Date(`${FREE_LAUNCH.endsOn}T12:00:00`);
  return `μέχρι ${date.toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" })}`;
}
