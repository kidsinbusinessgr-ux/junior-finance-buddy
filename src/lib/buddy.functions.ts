import { createServerFn } from "@tanstack/react-start";

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
  .validator((input: BuddyInput) => input)
  .handler(async ({ data }): Promise<BuddyResponse> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");

    const { ticker, name, emoji, currentPrice, changePercent, history } = data;

    // Calculate 30-day trend
    const first = history[0]?.close ?? currentPrice;
    const last = history[history.length - 1]?.close ?? currentPrice;
    const monthChange = ((last - first) / first) * 100;
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
- Τρέχουσα τιμή: $${currentPrice.toFixed(2)}
- Σήμερα: ${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%
- Τελευταίος μήνας: ${monthChange >= 0 ? "+" : ""}${monthChange.toFixed(1)}%

Γράψε μια σύντομη εξήγηση (3-4 προτάσεις MAX) για παιδιά που:
1. Εξηγεί τι συμβαίνει με την τιμή με απλά λόγια και μια αναλογία από καθημερινή ζωή
2. Λέει αν φαίνεται καλή στιγμή να σκεφτεί κανείς να "αγοράσει" (τιμή χαμηλά) ή να "περιμένει" (τιμή ψηλά)
3. ΠΑΝΤΑ υπενθυμίζει ότι αυτό είναι εκπαιδευτικό και οι τιμές αλλάζουν

Μην χρησιμοποιείς αστέρια ή markdown. Γράψε σαν να μιλάς σε παιδί, ζεστά και απλά.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error: ${res.status} ${err}`);
    }

    const json = await res.json();
    const message =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Συγγνώμη, δεν μπόρεσα να αναλύσω τη μετοχή αυτή τη στιγμή. Δοκίμασε ξανά!";

    return { message, signal };
  });
