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
  .validator((input: GeneralBuddyInput) => input)
  .handler(async ({ data }): Promise<GeneralBuddyResponse> => {
    const key = process.env.GEMINI_API_KEY;
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

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.8 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

    const json = await res.json();
    const raw: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const emojiMatch = raw.match(/EMOJI:\s*(.+)/);
    const msgMatch   = raw.match(/MESSAGE:\s*([\s\S]+)/);

    return {
      emoji:   emojiMatch?.[1]?.trim() ?? "💡",
      message: msgMatch?.[1]?.trim()   ?? "Συνέχισε έτσι! Κάθε μέρα μαθαίνεις κάτι νέο για τα χρήματα!",
    };
  });
