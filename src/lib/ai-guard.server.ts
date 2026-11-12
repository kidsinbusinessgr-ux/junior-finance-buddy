// Server-only. Gate for every Gemini call: signed-in users only, with a daily cap.
import { getRequest } from "@tanstack/react-start/server";
import { getAdminClient, getUserFromRequest } from "./supabase-admin.server";

export const AI_DAILY_LIMITS = { chat: 30, stock: 60, tip: 30 } as const;
export type AiKind = keyof typeof AI_DAILY_LIMITS;

export type AiGate = { ok: true } | { ok: false; reason: "login" | "limit" };

export async function checkAiAllowance(kind: AiKind): Promise<AiGate> {
  const user = await getUserFromRequest(getRequest());
  if (!user) return { ok: false, reason: "login" };

  const { data, error } = await getAdminClient().rpc("jfb_ai_take" as never, {
    p_user: user.id,
    p_kind: kind,
    p_limit: AI_DAILY_LIMITS[kind],
  } as never);
  if (error) {
    // Fail closed: if we can't count, don't spend.
    console.error("ai usage check failed", error.message);
    return { ok: false, reason: "limit" };
  }
  return data === true ? { ok: true } : { ok: false, reason: "limit" };
}

export const AI_BLOCKED_MESSAGES = {
  login: "Συνδέσου στον λογαριασμό σου για να μιλήσεις με τον Buddy! 🔐",
  limit: "Μιλήσαμε πολύ σήμερα! 😊 Ο Buddy ξεκουράζεται και θα είναι ξανά εδώ αύριο.",
} as const;
