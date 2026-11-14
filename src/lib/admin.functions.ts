import { createServerFn } from "@tanstack/react-start";

// Founder dashboard numbers (/admin). Only signed-in accounts whose email is
// in the ADMIN_EMAILS environment variable (comma-separated) get them. The
// counts are read with the service role on the server, so they cover every
// family, and nothing about the check lives in the browser.

export type AdminStats = {
  totalParents: number;
  totalChildren: number;
  activeChildren7d: number;
  activeChildren30d: number;
  totalChoresApproved: number;
  totalCoinsGiven: number;
  waitlistCount: number;
  bookRegistrations: number;
  parentsWithChildren: number;
  newParentsThisMonth: number;
  newChildrenThisMonth: number;
};

export type AdminStatsResult =
  | { ok: true; stats: AdminStats }
  | { ok: false; reason: "login" | "forbidden" | "failed" };

function adminEmails(): string[] {
  return (process.env["ADMIN_EMAILS"] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const getAdminStats = createServerFn({ method: "POST" }).handler(
  async (): Promise<AdminStatsResult> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getAdminClient, getUserFromRequest } = await import("./supabase-admin.server");
    const user = await getUserFromRequest(getRequest());
    if (!user) return { ok: false, reason: "login" };
    const email = (user.email ?? "").toLowerCase();
    if (!email || !adminEmails().includes(email)) return { ok: false, reason: "forbidden" };

    const db = getAdminClient();
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const sevenDaysAgo = new Date(now.getTime() - 7 * day).toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * day).toISOString().slice(0, 10);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const count = { count: "exact" as const, head: true };

    try {
      const [
        parents, children, active7, active30, chores, coins,
        waitlist, book, childParents, newParents, newChildren,
      ] = await Promise.all([
        db.from("jfb_parents").select("*", count),
        db.from("jfb_children").select("*", count),
        db.from("jfb_children").select("*", count).gte("last_login_date", sevenDaysAgo),
        db.from("jfb_children").select("*", count).gte("last_login_date", thirtyDaysAgo),
        db.from("jfb_chore_submissions").select("*", count).eq("status", "approved"),
        db.from("jfb_transactions").select("amount").gt("amount", 0),
        db.from("waitlist").select("*", count),
        db.from("book_registrations").select("*", count),
        db.from("jfb_children").select("parent_id"),
        db.from("jfb_parents").select("*", count).gte("created_at", startOfMonth),
        db.from("jfb_children").select("*", count).gte("created_at", startOfMonth),
      ]);

      const failed = [parents, children, active7, active30, chores, coins, waitlist, book, childParents, newParents, newChildren]
        .find((r) => r.error);
      if (failed?.error) {
        console.error("admin stats failed", failed.error.message);
        return { ok: false, reason: "failed" };
      }

      const totalCoinsGiven = ((coins.data ?? []) as { amount: number }[]).reduce((s, t) => s + t.amount, 0);
      const parentsWithChildren = new Set(
        ((childParents.data ?? []) as { parent_id: string | null }[]).map((c) => c.parent_id).filter(Boolean),
      ).size;

      return {
        ok: true,
        stats: {
          totalParents: parents.count ?? 0,
          totalChildren: children.count ?? 0,
          activeChildren7d: active7.count ?? 0,
          activeChildren30d: active30.count ?? 0,
          totalChoresApproved: chores.count ?? 0,
          totalCoinsGiven,
          waitlistCount: waitlist.count ?? 0,
          bookRegistrations: book.count ?? 0,
          parentsWithChildren,
          newParentsThisMonth: newParents.count ?? 0,
          newChildrenThisMonth: newChildren.count ?? 0,
        },
      };
    } catch (e) {
      console.error("admin stats failed", e);
      return { ok: false, reason: "failed" };
    }
  },
);
