import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Startups are created here on the server: the founder is the signed-in child
// (their name is used, not typed in), the texts are checked for bad words, and
// each child can have a limited number of startups.

const MAX_STARTUPS_PER_CHILD = 3;

const startupSchema = z.object({
  name: z.string().trim().min(2).max(40),
  emoji: z.string().trim().min(1).max(8),
  problem: z.string().trim().min(10).max(500),
  solution: z.string().trim().min(10).max(500),
  customer: z.string().trim().min(10).max(500),
  model: z.string().trim().min(10).max(500),
});

export type CreateStartupInput = z.infer<typeof startupSchema>;

export type CreateStartupResult =
  | { ok: true; id: string }
  | { ok: false; reason: "login" | "no_child" | "bad_words" | "too_many" | "failed" };

export const createStartup = createServerFn({ method: "POST" })
  .inputValidator((data: CreateStartupInput) => startupSchema.parse(data))
  .handler(async ({ data }): Promise<CreateStartupResult> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { getAdminClient, getUserFromRequest } = await import("./supabase-admin.server");
    const { containsBadWords } = await import("./buddy-safety");

    const user = await getUserFromRequest(getRequest());
    if (!user) return { ok: false, reason: "login" };

    const admin = getAdminClient();
    const { data: child } = await admin
      .from("jfb_children")
      .select("id, name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!child) return { ok: false, reason: "no_child" };

    const texts = [data.name, data.problem, data.solution, data.customer, data.model];
    if (texts.some((t) => containsBadWords(t))) return { ok: false, reason: "bad_words" };

    const { count } = await admin
      .from("startups")
      .select("id", { count: "exact", head: true })
      .eq("child_id" as never, child.id as never);
    if ((count ?? 0) >= MAX_STARTUPS_PER_CHILD) return { ok: false, reason: "too_many" };

    const { data: row, error } = await admin
      .from("startups")
      .insert({
        name: data.name,
        emoji: data.emoji,
        creator_name: child.name,
        problem: data.problem,
        solution: data.solution,
        customer: data.customer,
        model: data.model,
        coins_raised: 0,
        child_id: child.id,
      } as never)
      .select("id")
      .single();
    if (error || !row) {
      console.error("create startup failed", error?.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, id: (row as { id: string }).id };
  });
