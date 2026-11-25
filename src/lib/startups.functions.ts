import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adSchema, costingSchema, ideaSchema } from "./startup-plan";

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
  competitors: z.string().trim().max(300).default(""),
  usp: z.string().trim().max(300).default(""),
});

export type CreateStartupInput = z.input<typeof startupSchema>;

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

    const texts = [data.name, data.problem, data.solution, data.customer, data.model, data.competitors, data.usp];
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
        plan: { competitors: data.competitors, usp: data.usp },
      } as never)
      .select("id")
      .single();
    if (error || !row) {
      console.error("create startup failed", error?.message);
      return { ok: false, reason: "failed" };
    }
    // First startup: founder badge (with a bell message).
    await admin.rpc("jfb_give_badge" as never, { p_child_id: child.id, p_key: "startup_founder" } as never);
    return { ok: true, id: (row as { id: string }).id };
  });

// ── Decision of the day (phase 2) ─────────────────────────────────────────────

type OwnedStartup = { id: string; name: string; customers: number; child_id: string | null };

// The startup if the signed-in child owns it, otherwise the reason it's refused.
async function ownStartup(startupId: string) {
  const { getRequest } = await import("@tanstack/react-start/server");
  const { getAdminClient, getUserFromRequest } = await import("./supabase-admin.server");
  const user = await getUserFromRequest(getRequest());
  if (!user) return { error: "login" as const };
  const admin = getAdminClient();
  const [{ data: child }, { data: startup }] = await Promise.all([
    admin.from("jfb_children").select("id").eq("user_id", user.id).maybeSingle(),
    admin.from("startups").select("id, name, customers, child_id").eq("id", startupId).maybeSingle(),
  ]);
  const s = startup as OwnedStartup | null;
  if (!child || !s || s.child_id !== child.id) return { error: "not_owner" as const };
  return { admin, startup: s };
}

const today = () => new Date().toISOString().slice(0, 10);

export type DecisionView = {
  card: { id: string; emoji: string; title: string; text: string; choices: string[] };
  decided: null | {
    choice: number;
    result: string;
    lesson: string;
    effects: Record<string, number>;
  };
};

export type FounderTodayResult = { ok: true; today: DecisionView } | { ok: false; reason: "login" | "not_owner" };

const idSchema = z.object({ startupId: z.string().uuid() });

export const getFounderToday = createServerFn({ method: "POST" })
  .inputValidator((data: { startupId: string }) => idSchema.parse(data))
  .handler(async ({ data }): Promise<FounderTodayResult> => {
    const owned = await ownStartup(data.startupId);
    if ("error" in owned) return { ok: false, reason: owned.error! };
    const { DECISION_CARDS, pickDailyCard } = await import("./startup-decisions");

    const { data: rows } = await owned.admin
      .from("jfb_startup_decisions" as never)
      .select("day, card_id, choice, effects")
      .eq("startup_id", data.startupId)
      .order("day", { ascending: false })
      .limit(20);
    const recent = (rows ?? []) as { day: string; card_id: string; choice: number; effects: Record<string, number> }[];
    const done = recent.find((r) => r.day === today());

    const card = done
      ? DECISION_CARDS.find((c) => c.id === done.card_id)
      : pickDailyCard(data.startupId, today(), owned.startup.customers, recent.map((r) => r.card_id));
    if (!card) return { ok: false, reason: "not_owner" };

    const chosen = done ? card.choices[done.choice] : undefined;
    return {
      ok: true,
      today: {
        card: { id: card.id, emoji: card.emoji, title: card.title, text: card.text, choices: card.choices.map((c) => c.label) },
        decided: done && chosen
          ? { choice: done.choice, result: chosen.result, lesson: chosen.lesson, effects: done.effects }
          : null,
      },
    };
  });

const answerSchema = z.object({
  startupId: z.string().uuid(),
  cardId: z.string().min(1).max(40),
  choice: z.number().int().min(0).max(5),
});

export type AnswerResult =
  | { ok: true; result: string; lesson: string; effects: Record<string, number> }
  | { ok: false; reason: "login" | "not_owner" | "stale" | "already" | "failed" };

export const answerDecision = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof answerSchema>) => answerSchema.parse(data))
  .handler(async ({ data }): Promise<AnswerResult> => {
    const owned = await ownStartup(data.startupId);
    if ("error" in owned) return { ok: false, reason: owned.error! };
    const { pickDailyCard } = await import("./startup-decisions");

    const { data: rows } = await owned.admin
      .from("jfb_startup_decisions" as never)
      .select("day, card_id")
      .eq("startup_id", data.startupId)
      .order("day", { ascending: false })
      .limit(20);
    const recent = (rows ?? []) as { day: string; card_id: string }[];
    if (recent.some((r) => r.day === today())) return { ok: false, reason: "already" };

    // The card must be today's card; its effects come from here, not the browser.
    const card = pickDailyCard(data.startupId, today(), owned.startup.customers, recent.map((r) => r.card_id));
    const choice = card.choices[data.choice];
    if (card.id !== data.cardId || !choice) return { ok: false, reason: "stale" };

    const { data: effects, error } = await owned.admin.rpc("jfb_apply_startup_decision" as never, {
      p_startup_id: data.startupId,
      p_day: today(),
      p_card_id: card.id,
      p_choice: data.choice,
      p_customers: choice.effects.customers,
      p_cash: choice.effects.cash,
      p_reputation: choice.effects.reputation,
      p_team: choice.effects.team,
    } as never);
    if (error) {
      if (error.message.includes("Already decided")) return { ok: false, reason: "already" };
      console.error("startup decision failed", error.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, result: choice.result, lesson: choice.lesson, effects: effects as unknown as Record<string, number> };
  });

// ── Product drawing ───────────────────────────────────────────────────────────
// The founder draws their product on the drawing board (startup-drawing.tsx)
// and the PNG is saved here, so only the owner can change it and only small
// PNG files are stored. Everyone sees it on the startup's page and in the list.

const MAX_DRAWING_BYTES = 1024 * 1024;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const drawingSchema = z.object({
  startupId: z.string().uuid(),
  // data:image/png;base64,… from canvas.toDataURL("image/png")
  png: z.string().startsWith("data:image/png;base64,").max(Math.ceil((MAX_DRAWING_BYTES * 4) / 3) + 100),
});

export type SaveDrawingResult =
  | { ok: true; imageUrl: string }
  | { ok: false; reason: "login" | "not_owner" | "bad_file" | "failed" };

export const saveStartupDrawing = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof drawingSchema>) => drawingSchema.parse(data))
  .handler(async ({ data }): Promise<SaveDrawingResult> => {
    const owned = await ownStartup(data.startupId);
    if ("error" in owned) return { ok: false, reason: owned.error! };

    const bytes = Buffer.from(data.png.slice("data:image/png;base64,".length), "base64");
    if (bytes.length < 100 || bytes.length > MAX_DRAWING_BYTES || PNG_SIGNATURE.some((b, i) => bytes[i] !== b)) {
      return { ok: false, reason: "bad_file" };
    }

    const path = `${data.startupId}.png`;
    const bucket = owned.admin.storage.from("startup-images");
    const { error: upErr } = await bucket.upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) {
      console.error("drawing upload failed", upErr.message);
      return { ok: false, reason: "failed" };
    }
    // ?v= makes browsers show the new drawing instead of a cached old one.
    const imageUrl = `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    const { error } = await owned.admin
      .from("startups")
      .update({ image_url: imageUrl } as never)
      .eq("id", data.startupId);
    if (error) {
      console.error("drawing save failed", error.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, imageUrl };
  });

// ── Business plan (idea, costing, ad) ─────────────────────────────────────────
// The founder fills the plan step by step on the startup's page. Each part is
// checked here (owner, sizes, polite words) and merged into startups.plan.

const planSchema = z.discriminatedUnion("part", [
  z.object({ startupId: z.string().uuid(), part: z.literal("idea"), value: ideaSchema }),
  z.object({ startupId: z.string().uuid(), part: z.literal("costing"), value: costingSchema }),
  z.object({ startupId: z.string().uuid(), part: z.literal("ad"), value: adSchema }),
]);

export type SavePlanInput = z.input<typeof planSchema>;
export type SavePlanResult = { ok: true } | { ok: false; reason: "login" | "not_owner" | "bad_words" | "failed" };

export const saveStartupPlan = createServerFn({ method: "POST" })
  .inputValidator((data: SavePlanInput) => planSchema.parse(data))
  .handler(async ({ data }): Promise<SavePlanResult> => {
    const owned = await ownStartup(data.startupId);
    if ("error" in owned) return { ok: false, reason: owned.error! };
    const { containsBadWords } = await import("./buddy-safety");

    const texts: string[] =
      data.part === "idea"
        ? [data.value.competitors, data.value.usp]
        : data.part === "costing"
          ? [data.value.unit, ...data.value.fixed.map((i) => i.name), ...data.value.variable.map((i) => i.name)]
          : [data.value.headline, data.value.text, data.value.cta, data.value.where];
    if (texts.some((t) => containsBadWords(t))) return { ok: false, reason: "bad_words" };

    const { data: row } = await owned.admin.from("startups").select("plan").eq("id", data.startupId).single();
    const current = ((row as { plan?: Record<string, unknown> } | null)?.plan ?? {}) as Record<string, unknown>;
    const next = data.part === "idea" ? { ...current, ...data.value } : { ...current, [data.part]: data.value };

    const { error } = await owned.admin
      .from("startups")
      .update({ plan: next } as never)
      .eq("id", data.startupId);
    if (error) {
      console.error("plan save failed", error.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true };
  });
