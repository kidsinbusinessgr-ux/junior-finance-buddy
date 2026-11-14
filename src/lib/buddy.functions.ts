import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  BUDDY_RULES,
  GEMINI_SAFETY_SETTINGS,
  SAFE_REPLIES,
  containsBadWords,
  looksLikeDistress,
  hasForeignLetters,
  stripForeignLetters,
} from "./buddy-safety";

// Gemini models for every Buddy call (these names are NOT typos; as of Nov 2026
// Google returns 404 for gemini-2.x). Main model: 3.5 Flash-Lite, which Google
// recommends for new projects and which answered in ~2s while 3.8 Flash kept
// returning 503 "high demand". Backup: 3.8 Flash, used if the main one is busy
// or slow. Override either on Vercel with GEMINI_MODEL / GEMINI_FALLBACK_MODEL.
function geminiModel() {
  return process.env["GEMINI_MODEL"] || "gemini-3.5-flash-lite";
}

function geminiFallbackModel() {
  return process.env["GEMINI_FALLBACK_MODEL"] || "gemini-3.8-flash";
}

const ATTEMPT_TIMEOUT_MS = 12_000;

// fetch() for Gemini: tries the main model, then the backup model if the main
// one is busy or times out, then the main model once more after a short pause
// (Google's "high demand" spikes are usually brief). A child waits at most ~35s.
// Every attempt is logged (status + duration) in Vercel's runtime logs.
async function geminiFetch(url: string, init: RequestInit): Promise<Response> {
  const primary = geminiModel();
  const models = [primary, geminiFallbackModel()].filter((m, i, all) => all.indexOf(m) === i);
  models.push(primary);

  let last: Response | null = null;
  for (const [i, model] of models.entries()) {
    if (i === models.length - 1) await new Promise((r) => setTimeout(r, 2000));
    const started = Date.now();
    const modelUrl = url.replace(`/models/${primary}:`, `/models/${model}:`);
    try {
      const res = await fetch(modelUrl, { ...init, signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS) });
      console.log(`Gemini ${model} → ${res.status} in ${Date.now() - started}ms`);
      if (res.status !== 503 && res.status !== 429) return res;
      last = res;
    } catch (err) {
      console.error(`Gemini ${model} failed after ${Date.now() - started}ms:`, (err as Error).name, (err as Error).message);
    }
  }
  if (last) return last; // let the caller log Google's error body
  throw new Error("Buddy is unavailable right now");
}

// The reply text from a Gemini response. Gemini can split a reply into several
// parts (and 3.x models also return "thought" parts), so join every text part
// that isn't a thought. Logs when Google stopped early, e.g. MAX_TOKENS.
function geminiText(json: any): string | undefined {
  const candidate = json?.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    console.warn("Gemini finishReason:", candidate.finishReason, json?.usageMetadata);
  }
  const parts: any[] = candidate?.content?.parts ?? [];
  const text = parts.filter((p) => !p?.thought && typeof p?.text === "string").map((p) => p.text).join("");
  return text.trim() ? text : undefined;
}

// Every Gemini call requires a signed-in user and counts against a daily cap
// (see ai-guard.server.ts). Inputs are size-limited so one request stays cheap.
async function gate(kind: "chat" | "stock" | "tip") {
  const { checkAiAllowance, AI_BLOCKED_MESSAGES } = await import("./ai-guard.server");
  const result = await checkAiAllowance(kind);
  return result.ok ? null : AI_BLOCKED_MESSAGES[result.reason];
}

const finite = z.number().finite();
const buddyInputSchema = z.object({
  ticker: z.string().min(1).max(10),
  name: z.string().min(1).max(60),
  emoji: z.string().max(16),
  currentPrice: finite,
  changePercent: finite,
  history: z.array(z.object({ date: z.string().max(20), close: finite })).max(60),
});
const generalInputSchema = z.object({ page: z.string().max(100) });
const chatInputSchema = z.object({
  page: z.string().max(100),
  messages: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().min(1).max(500) }))
    .min(1)
    .max(40)
    // Only the recent conversation is sent to Gemini.
    .transform((m) => m.slice(-12)),
});

export interface BuddyInput {
  ticker: string;
  name: string;
  emoji: string;
  currentPrice: number;
  changePercent: number;
  history: { date: string; close: number }[];
}

export interface BuddyResponse {
  message: string;
  signal: "buy" | "wait" | "watch";
}

export const askBuddy = createServerFn({ method: "GET" })
  .validator((input: BuddyInput) => buddyInputSchema.parse(input))
  .handler(async ({ data }): Promise<BuddyResponse> => {
    const blocked = await gate("stock");
    if (blocked) return { message: blocked, signal: "watch" };

    const key = process.env["GEMINI_API_KEY"];
    if (!key) throw new Error("GEMINI_API_KEY is not set");

    const { ticker, name, emoji, currentPrice, changePercent, history } = data;

    // Calculate 30-day trend
    const first = history[0]?.close ?? currentPrice;
    const last = history[history.length - 1]?.close ?? currentPrice;
    const monthChange = first ? ((last - first) / first) * 100 : 0;
    const isDownFromMonth = monthChange < -3;
    const isUpFromMonth = monthChange > 5;

    // Determine signal
    const signal: "buy" | "wait" | "watch" =
      isDownFromMonth && changePercent < 0
        ? "buy"
        : isUpFromMonth && changePercent > 2
        ? "wait"
        : "watch";

    const prompt = `Είσαι ο KidsInBusiness Buddy, ένας φιλικός εκπαιδευτικός βοηθός που εξηγεί μετοχές σε παιδιά 10-15 χρονών στα ελληνικά.

Δεδομένα για τη μετοχή ${emoji} ${name} (${ticker}):
- Τρέχουσα τιμή: €${currentPrice.toFixed(2)}
- Σήμερα: ${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%
- Τελευταίος μήνας: ${monthChange >= 0 ? "+" : ""}${monthChange.toFixed(1)}%

Γράψε μια σύντομη εξήγηση (3-4 προτάσεις MAX) για παιδιά που:
1. Εξηγεί τι συμβαίνει με την τιμή με απλά λόγια και μια αναλογία από καθημερινή ζωή
2. Λέει αν φαίνεται καλή στιγμή να σκεφτεί κανείς να "αγοράσει" (τιμή χαμηλά) ή να "περιμένει" (τιμή ψηλά)
3. ΠΑΝΤΑ υπενθυμίζει ότι αυτό είναι εκπαιδευτικό και οι τιμές αλλάζουν

Μην χρησιμοποιείς αστέρια ή markdown. Γράψε σαν να μιλάς σε παιδί, ζεστά και απλά.`;

    const res = await geminiFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: GEMINI_SAFETY_SETTINGS,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      // Log details server-side only; don't send Gemini's error body to the browser.
      console.error("Gemini error", res.status, await res.text());
      throw new Error("Buddy is unavailable right now");
    }

    const json = await res.json();
    const message =
      (geminiText(json) && stripForeignLetters(geminiText(json)!)) ||
      "Συγγνώμη, δεν μπόρεσα να αναλύσω τη μετοχή αυτή τη στιγμή. Δοκίμασε ξανά!";

    return { message, signal };
  });

// ── General Buddy (for non-stock pages) ──────────────────────────────────────

export interface GeneralBuddyInput {
  page: string;
}

export interface GeneralBuddyResponse {
  message: string;
  emoji: string;
}

const PAGE_CONTEXT: Record<string, string> = {
  "/child-dashboard": "Το παιδί κοιτάει την αρχική του σελίδα με τα coins, το level και τα badges του.",
  "/wallet": "Το παιδί κοιτάει το ιστορικό συναλλαγών του — τι αγόρασε, τι κέρδισε, τι ξόδεψε.",
  "/earn":  "Το παιδί βλέπει τα tasks/δουλειές που μπορεί να κάνει για να κερδίσει coins.",
  "/goals": "Το παιδί βλέπει τους αποταμιευτικούς του στόχους.",
  "/save":  "Το παιδί αποταμιεύει για κάτι που θέλει.",
  "/learn": "Το παιδί μαθαίνει για την επιχειρηματικότητα.",
  "/stocks": "Το παιδί κοιτάει μετοχές εταιρειών όπως Apple, Roblox, Nike.",
  "/investments": "Το παιδί βλέπει τις επενδύσεις/μετοχές που έχει αγοράσει.",
  "/spend": "Το παιδί σκέφτεται πού να ξοδέψει τα coins του.",
};

export const askGeneralBuddy = createServerFn({ method: "GET" })
  .validator((input: GeneralBuddyInput) => generalInputSchema.parse(input))
  .handler(async ({ data }): Promise<GeneralBuddyResponse> => {
    const blocked = await gate("tip");
    if (blocked) return { message: blocked, emoji: "🤖" };

    const key = process.env["GEMINI_API_KEY"];
    if (!key) throw new Error("GEMINI_API_KEY is not set");

    const context = PAGE_CONTEXT[data.page] ?? "Το παιδί χρησιμοποιεί την εφαρμογή Kids in Business.";

    const prompt = `Είσαι ο KidsInBusiness Buddy 🤖, ένας φιλικός βοηθός που βοηθάει παιδιά 10-15 χρονών να μάθουν για χρήματα και επιχειρηματικότητα.

Κατάσταση: ${context}

Γράψε ΜΙΑ σύντομη, ζεστή συμβουλή ή ενθάρρυνση (2-3 προτάσεις MAX) στα ελληνικά που:
- Είναι σχετική με αυτό που βλέπει το παιδί τώρα
- Χρησιμοποιεί απλή, παιδική γλώσσα
- Δίνει μια πρακτική ιδέα ή ερώτηση για σκέψη
- ΔΕΝ χρησιμοποιεί markdown ή αστέρια

Επίσης διάλεξε ένα emoji που ταιριάζει με τη συμβουλή σου (π.χ. 💡🎯💰🚀⭐).
Απάντησε ΜΟΝΟ σε αυτή τη μορφή (δύο γραμμές):
EMOJI: <ένα emoji>
MESSAGE: <η συμβουλή σου>`;

    const res = await geminiFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: GEMINI_SAFETY_SETTINGS,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

    const json = await res.json();
    const raw: string = stripForeignLetters(geminiText(json) ?? "");

    const emojiMatch = raw.match(/EMOJI:\s*(.+)/);
    const msgMatch   = raw.match(/MESSAGE:\s*([\s\S]+)/);

    return {
      emoji:   emojiMatch?.[1]?.trim() ?? "💡",
      message: msgMatch?.[1]?.trim()   ?? "Συνέχισε έτσι! Κάθε μέρα μαθαίνεις κάτι νέο για τα χρήματα!",
    };
  });

// ── Chatbot: multi-turn conversation ─────────────────────────────────────────

export interface ChatMessage { role: "user" | "model"; text: string; }

export interface ChatInput {
  messages: ChatMessage[];
  page: string;
}

export interface ChatOutput {
  reply: string;
  // True when Google was too busy to answer; the chat offers to send again.
  busy?: boolean;
}

const CHAT_PAGE_CONTEXT: Record<string, string> = {
  "/child-dashboard": "dashboard με coins, level, badges",
  "/wallet":          "ιστορικό συναλλαγών",
  "/earn":            "tasks για να κερδίσει coins",
  "/goals":           "αποταμιευτικοί στόχοι",
  "/save":            "αποταμίευση",
  "/learn":           "μαθήματα επιχειρηματικότητας",
  "/stocks":          "μετοχές εταιρειών",
  "/investments":     "επενδύσεις",
  "/spend":           "αγορές με coins",
};

export const chatWithBuddy = createServerFn({ method: "POST" })
  .validator((input: ChatInput) => chatInputSchema.parse(input))
  .handler(async ({ data }): Promise<ChatOutput> => {
    // Safety checks run on the server before Gemini is called (see buddy-safety.ts).
    const latest = data.messages[data.messages.length - 1];
    if (latest.role === "user") {
      if (looksLikeDistress(latest.text)) return { reply: SAFE_REPLIES.distress };
      if (containsBadWords(latest.text)) return { reply: SAFE_REPLIES.badWords };
    }

    const blocked = await gate("chat");
    if (blocked) return { reply: blocked };

    const key = process.env["GEMINI_API_KEY"];
    if (!key) throw new Error("GEMINI_API_KEY not set");

    const ctx = CHAT_PAGE_CONTEXT[data.page] ?? "εφαρμογή Kids in Business";

    // Earlier messages with swear words are left out of what Gemini sees, and
    // the conversation must start with a user message.
    const history = data.messages.filter((m) => !containsBadWords(m.text));
    while (history.length && history[0].role !== "user") history.shift();
    const contents = history.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));

    const askGemini = async () => {
      const res = await geminiFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${BUDDY_RULES}\n\nΤο παιδί βλέπει τώρα: ${ctx}.` }] },
            contents,
            safetySettings: GEMINI_SAFETY_SETTINGS,
            generationConfig: { maxOutputTokens: 2048, temperature: 0.5 },
          }),
        }
      );
      if (!res.ok) {
        console.error("Gemini error", res.status, await res.text());
        throw new Error("Buddy is unavailable right now");
      }
      const json = await res.json();
      const text = geminiText(json)?.trim();
      // No text means Google's safety filter blocked the question or the answer.
      if (!text) console.warn("Gemini gave no text", json?.promptFeedback, json?.candidates?.[0]?.finishReason);
      return text;
    };

    let reply: string | undefined;
    try {
      reply = await askGemini();
    } catch {
      return { reply: SAFE_REPLIES.busy, busy: true };
    }
    if (!reply) return { reply: SAFE_REPLIES.offTopic };

    // Letters from another alphabet in the reply: ask once more, and if it
    // happens again, remove those letters so the child never sees them.
    if (hasForeignLetters(reply)) {
      console.warn("Buddy reply had foreign letters; asking again");
      reply = (await askGemini().catch(() => undefined)) ?? reply;
      if (hasForeignLetters(reply)) reply = stripForeignLetters(reply);
    }
    // Last check on what Buddy says, whatever the model did.
    if (containsBadWords(reply)) {
      console.warn("Buddy reply blocked by word filter");
      return { reply: SAFE_REPLIES.badWords };
    }

    return { reply };
  });
