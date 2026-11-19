import { createServerFn } from "@tanstack/react-start";

export const KID_STOCKS = [
  { ticker: "AAPL", name: "Apple", emoji: "🍎", color: "#6E6E73", description: "Κατασκευάζει iPhone, iPad, Mac και AirPods. Μία από τις πιο πολύτιμες εταιρείες στον κόσμο — αν έχεις iPhone, έχεις ήδη χρησιμοποιήσει ένα Apple προϊόν!" },
  { ticker: "NVDA", name: "Nvidia", emoji: "🟢", color: "#76B900", description: "Φτιάχνει τις καλύτερες κάρτες γραφικών (GPU) για gaming και τεχνητή νοημοσύνη. Σχεδόν κάθε AI εφαρμογή (ChatGPT, Gemini) χρησιμοποιεί Nvidia chips!" },
  { ticker: "NFLX", name: "Netflix", emoji: "🎬", color: "#E50914", description: "Η μεγαλύτερη streaming πλατφόρμα στον κόσμο με 300+ εκατ. συνδρομητές. Παράγει δικές της σειρές και ταινίες — από Squid Game μέχρι Stranger Things." },
  { ticker: "RBLX", name: "Roblox", emoji: "🎮", color: "#E8202A", description: "Πλατφόρμα gaming που επιτρέπει σε χρήστες να δημιουργούν και να παίζουν games. Έχει 88 εκατ. ενεργούς χρήστες ημερησίως — οι περισσότεροι κάτω από 17 ετών!" },
  { ticker: "DIS", name: "Disney", emoji: "🐭", color: "#1B3F8B", description: "Η μαγική αυτοκρατορία: Marvel, Star Wars, Pixar, και τα Disney Parks. Αν έχεις δει Avengers ή Frozen, έχεις χρηματοδοτήσει τη Disney!" },
  { ticker: "NKE", name: "Nike", emoji: "👟", color: "#111111", description: "Η Νο1 εταιρεία αθλητικών ειδών στον κόσμο. Το διάσημο swoosh και το «Just Do It» αναγνωρίζονται παντού. Συνεργάζεται με LeBron, Ronaldo, Serena Williams." },
  { ticker: "SHOP", name: "Shopify", emoji: "🛍️", color: "#96BF48", description: "Η πλατφόρμα που επιτρέπει σε οποιονδήποτε να φτιάξει online eshop. Εκατομμύρια επιχειρήσεις χρησιμοποιούν Shopify — ίσως και το αγαπημένο σου brand!" },
  { ticker: "SBUX", name: "Starbucks", emoji: "☕", color: "#00704A", description: "Η αλυσίδα καφέ που άλλαξε τον τρόπο που πίνουμε καφέ. Με 36.000 καταστήματα παγκοσμίως, πουλά εμπειρία και lifestyle, όχι απλά καφέ." },
  { ticker: "SNAP", name: "Snapchat", emoji: "👻", color: "#FFFC00", description: "Η εφαρμογή με τα Stories, Streaks και AR filters. Δημοφιλής κυρίως σε ηλικίες 13-24 — το 90% των Αμερικανών teens χρησιμοποιεί Snapchat!" },
  { ticker: "TSLA", name: "Tesla", emoji: "⚡", color: "#CC0000", description: "Ο πρωτοπόρος ηλεκτρικών αυτοκινήτων του Elon Musk. Εκτός από αυτοκίνητα φτιάχνει ηλιακές στέγες, μπαταρίες και αναπτύσσει αυτόνομη οδήγηση!" },
  { ticker: "AMZN", name: "Amazon", emoji: "📦", color: "#FF9900", description: "Ξεκίνησε ως βιβλιοπωλείο το 1994 και τώρα κυριαρχεί στο e-commerce, cloud computing (AWS) και streaming. Κάθε 2ο πακέτο που παραγγέλνεις online έρχεται από Amazon!" },
  { ticker: "GOOGL", name: "Google", emoji: "🔍", color: "#4285F4", description: "Η εταιρεία που ελέγχει την αναζήτηση, YouTube, Android και Gmail. Χειρίζεται 8,5 δισεκατομμύρια αναζητήσεις κάθε μέρα — σχεδόν μία για κάθε άνθρωπο στη Γη!" },
  { ticker: "META", name: "Instagram / Meta", emoji: "📱", color: "#0866FF", description: "Η εταιρεία πίσω από Facebook, Instagram και WhatsApp. Συνδέει 3,2 δισεκατομμύρια ανθρώπους ημερησίως και επενδύει βαριά στο Metaverse και AI." },
  { ticker: "MSFT", name: "Microsoft / Xbox", emoji: "🎯", color: "#00A4EF", description: "Κατασκευάζει Windows, Office, Xbox και το cloud Azure. Αγόρασε Activision Blizzard για $69 δισ. — τώρα ελέγχει Call of Duty, Minecraft και World of Warcraft!" },
  { ticker: "V", name: "Visa", emoji: "💳", color: "#1A1F71", description: "Δεν είναι τράπεζα — είναι το δίκτυο που επεξεργάζεται πληρωμές. Κάθε φορά που χρησιμοποιείς κάρτα, η Visa παίρνει ένα μικρό ποσοστό. Επεξεργάζεται €15 τρισ. ετησίως!" },
  { ticker: "PYPL", name: "PayPal", emoji: "💸", color: "#003087", description: "Η πλατφόρμα που άλλαξε τις online πληρωμές. Με PayPal μπορείς να πληρώσεις online χωρίς να δώσεις τα στοιχεία της κάρτας σου. Ενεργοί χρήστες: 430 εκατ.!" },
  { ticker: "UBER", name: "Uber", emoji: "🚕", color: "#000000", description: "Η εφαρμογή που άλλαξε τις μεταφορές. Uber και Uber Eats λειτουργούν σε 70+ χώρες. Αν κάλεσες ποτέ ταξί μέσω app, πιθανώς ήταν Uber!" },
  { ticker: "WMT", name: "Walmart", emoji: "🛒", color: "#0071CE", description: "Η μεγαλύτερη εταιρεία λιανεμπορίου στον κόσμο με €650 δισ. ετήσια έσοδα. Ένας στους 150 εργαζόμενους παγκοσμίως δουλεύει στη Walmart!" },
  { ticker: "HOOD", name: "Robinhood", emoji: "📈", color: "#00C805", description: "Η εφαρμογή που έκανε το χρηματιστήριο προσβάσιμο σε όλους. Δωρεάν αγοραπωλησία μετοχών, χωρίς ελάχιστο ποσό. Χρησιμοποιείται κυρίως από νέους επενδυτές!" },
  { ticker: "KO", name: "Coca-Cola", emoji: "🥤", color: "#F40009", description: "Το πιο γνωστό αναψυκτικό στον κόσμο! Εκτός από Coca-Cola, η εταιρεία φτιάχνει Sprite, Fanta και πολλούς χυμούς και νερά. Πουλιέται σχεδόν σε κάθε χώρα του πλανήτη." },
  { ticker: "PEP", name: "Pepsi", emoji: "🍟", color: "#004B93", description: "Η PepsiCo δε φτιάχνει μόνο Pepsi! Της ανήκουν και τα πατατάκια Lay's και Doritos. Καλό παράδειγμα εταιρείας που κερδίζει από πολλά διαφορετικά προϊόντα." },
  { ticker: "SONY", name: "Sony / PlayStation", emoji: "🎮", color: "#003791", description: "Η ιαπωνική εταιρεία πίσω από το PlayStation! Φτιάχνει επίσης κάμερες, ακουστικά, ταινίες και μουσική. Αν έχεις παίξει σε PS5, έχεις χρησιμοποιήσει προϊόν Sony." },
  { ticker: "ADBE", name: "Adobe", emoji: "🎨", color: "#FA0F00", description: "Φτιάχνει προγράμματα για δημιουργικούς ανθρώπους: Photoshop για φωτογραφίες, Premiere για βίντεο, Acrobat για PDF. Πολλοί YouTubers και σχεδιαστές τα χρησιμοποιούν κάθε μέρα." },
  { ticker: "AMD", name: "AMD", emoji: "💻", color: "#ED1C24", description: "Φτιάχνει επεξεργαστές και κάρτες γραφικών για υπολογιστές και κονσόλες. Τα chips της AMD βρίσκονται μέσα στο PlayStation 5 και στο Xbox!" },
  { ticker: "COST", name: "Costco", emoji: "🏬", color: "#E31837", description: "Τεράστια καταστήματα όπου τα μέλη πληρώνουν ετήσια συνδρομή και αγοράζουν μεγάλες ποσότητες σε χαμηλές τιμές. Έξυπνο επιχειρηματικό μοντέλο: κερδίζει πολλά από τις συνδρομές!" },
] as const;

export type KidTicker = (typeof KID_STOCKS)[number]["ticker"];

export interface StockQuote {
  ticker: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

export interface StockHistory {
  ticker: string;
  history: { date: string; close: number }[];
}

// Prices come from the shared store in market-data.server.ts (refreshed every
// few hours to stay inside the free FMP plan). Stocks with no known price yet
// are left out instead of showing €0.
export const getStockQuotes = createServerFn({ method: "GET" }).handler(async () => {
  const { getStoredQuotes, getEurPerUsd } = await import("./market-data.server");
  const [{ quotes: stored, updatedAt }, eurRate] = await Promise.all([
    getStoredQuotes(KID_STOCKS.map((s) => s.ticker)),
    getEurPerUsd(),
  ]);

  const quotes: StockQuote[] = KID_STOCKS.flatMap((meta) => {
    const q = stored[meta.ticker];
    if (!q) return [];
    return [{
      ticker: meta.ticker,
      name: meta.name,
      emoji: meta.emoji,
      color: meta.color,
      description: meta.description,
      price: q.price * eurRate,
      change: q.change * eurRate,
      changePercent: q.changePercent,
      marketCap: q.marketCap,
    }];
  });

  return {
    quotes,
    fetchedAt: new Date().toISOString(),
    pricesAt: updatedAt ? new Date(updatedAt).toISOString() : null,
  };
});

const tickerSchema = (ticker: unknown) => {
  if (typeof ticker !== "string" || !KID_STOCKS.some((s) => s.ticker === ticker)) {
    throw new Error("Unknown ticker");
  }
  return ticker;
};

export const getStockHistory = createServerFn({ method: "GET" })
  .inputValidator(tickerSchema)
  .handler(async ({ data: ticker }): Promise<StockHistory> => {
    const { getStoredHistory, getEurPerUsd } = await import("./market-data.server");
    const [history, eurRate] = await Promise.all([getStoredHistory(ticker), getEurPerUsd()]);
    return { ticker, history: history.map((d) => ({ date: d.date, close: d.close * eurRate })) };
  });
