import { createServerFn } from "@tanstack/react-start";

export const KID_STOCKS = [
  { ticker: "AAPL", name: "Apple", emoji: "🍎", color: "#6E6E73", description: "Κατασκευάζει iPhone, iPad, Mac και AirPods. Μία από τις πιο πολύτιμες εταιρείες στον κόσμο. Αν έχεις iPhone, χρησιμοποιείς ήδη ένα προϊόν της Apple." },
  { ticker: "NVDA", name: "Nvidia", emoji: "🟢", color: "#76B900", description: "Φτιάχνει κάρτες γραφικών (GPU) για gaming και τεχνητή νοημοσύνη. Πολλές εφαρμογές τεχνητής νοημοσύνης, όπως το ChatGPT, εκπαιδεύονται σε chips της Nvidia." },
  { ticker: "NFLX", name: "Netflix", emoji: "🎬", color: "#E50914", description: "Η μεγαλύτερη πλατφόρμα streaming στον κόσμο, με πάνω από 300 εκατ. συνδρομητές. Παράγει δικές της σειρές και ταινίες, από το Squid Game μέχρι το Stranger Things." },
  { ticker: "RBLX", name: "Roblox", emoji: "🎮", color: "#E8202A", description: "Πλατφόρμα όπου οι χρήστες φτιάχνουν και παίζουν δικά τους παιχνίδια. Δεκάδες εκατομμύρια άνθρωποι παίζουν κάθε μέρα, πολλοί από αυτούς έφηβοι." },
  { ticker: "DIS", name: "Disney", emoji: "🐭", color: "#1B3F8B", description: "Της ανήκουν η Marvel, το Star Wars, η Pixar και τα πάρκα Disney. Αν πλήρωσες εισιτήριο για τους Avengers ή το Frozen, ένα μέρος του πήγε στη Disney." },
  { ticker: "NKE", name: "Nike", emoji: "👟", color: "#111111", description: "Η μεγαλύτερη εταιρεία αθλητικών ειδών στον κόσμο. Το διάσημο swoosh και το «Just Do It» αναγνωρίζονται παντού. Συνεργάζεται με LeBron, Ronaldo, Serena Williams." },
  { ticker: "SHOP", name: "Shopify", emoji: "🛍️", color: "#96BF48", description: "Η πλατφόρμα με την οποία ο καθένας μπορεί να φτιάξει ηλεκτρονικό κατάστημα. Τη χρησιμοποιούν εκατομμύρια επιχειρήσεις, ίσως και το αγαπημένο σου brand." },
  { ticker: "SBUX", name: "Starbucks", emoji: "☕", color: "#00704A", description: "Η αλυσίδα καφέ που άλλαξε τον τρόπο που πίνουμε καφέ. Με 36.000 καταστήματα παγκοσμίως, πουλάει εμπειρία και τρόπο ζωής, όχι απλώς καφέ." },
  { ticker: "SNAP", name: "Snapchat", emoji: "👻", color: "#FFFC00", description: "Η εφαρμογή με τα Stories, τα Streaks και τα φίλτρα επαυξημένης πραγματικότητας (AR). Είναι δημοφιλής κυρίως σε ηλικίες 13–24." },
  { ticker: "TSLA", name: "Tesla", emoji: "⚡", color: "#CC0000", description: "Η εταιρεία ηλεκτρικών αυτοκινήτων του Elon Musk. Εκτός από αυτοκίνητα, φτιάχνει ηλιακές στέγες και μπαταρίες και αναπτύσσει την αυτόνομη οδήγηση." },
  { ticker: "AMZN", name: "Amazon", emoji: "📦", color: "#FF9900", description: "Ξεκίνησε ως online βιβλιοπωλείο το 1994 και σήμερα είναι το μεγαλύτερο ηλεκτρονικό κατάστημα στον κόσμο. Έχει επίσης υπηρεσίες cloud (AWS) και streaming (Prime Video)." },
  { ticker: "GOOGL", name: "Google", emoji: "🔍", color: "#4285F4", description: "Η εταιρεία πίσω από την αναζήτηση Google, το YouTube, το Android και το Gmail. Δέχεται δισεκατομμύρια αναζητήσεις κάθε μέρα." },
  { ticker: "META", name: "Instagram / Meta", emoji: "📱", color: "#0866FF", description: "Η εταιρεία πίσω από το Facebook, το Instagram και το WhatsApp. Τις εφαρμογές της τις χρησιμοποιούν πάνω από 3 δισεκατομμύρια άνθρωποι κάθε μέρα, και επενδύει πολλά στην τεχνητή νοημοσύνη." },
  { ticker: "MSFT", name: "Microsoft / Xbox", emoji: "🎯", color: "#00A4EF", description: "Φτιάχνει τα Windows, το Office, το Xbox και το cloud Azure. Της ανήκει το Minecraft, και το 2023 αγόρασε την Activision Blizzard (Call of Duty, World of Warcraft) για 69 δισ. δολάρια." },
  { ticker: "V", name: "Visa", emoji: "💳", color: "#1A1F71", description: "Δεν είναι τράπεζα· είναι το δίκτυο μέσα από το οποίο περνούν οι πληρωμές με κάρτα. Κάθε φορά που πληρώνεις με κάρτα Visa, η εταιρεία κερδίζει ένα μικρό ποσό." },
  { ticker: "PYPL", name: "PayPal", emoji: "💸", color: "#003087", description: "Η πλατφόρμα που άλλαξε τις online πληρωμές. Με το PayPal πληρώνεις online χωρίς να δίνεις τα στοιχεία της κάρτας σου σε κάθε κατάστημα." },
  { ticker: "UBER", name: "Uber", emoji: "🚕", color: "#000000", description: "Η εφαρμογή που άλλαξε τις μετακινήσεις. Το Uber και το Uber Eats λειτουργούν σε περισσότερες από 70 χώρες." },
  { ticker: "WMT", name: "Walmart", emoji: "🛒", color: "#0071CE", description: "Η μεγαλύτερη εταιρεία λιανεμπορίου στον κόσμο, με πάνω από 600 δισ. ευρώ έσοδα τον χρόνο και περίπου 2 εκατομμύρια εργαζομένους." },
  { ticker: "HOOD", name: "Robinhood", emoji: "📈", color: "#00C805", description: "Η εφαρμογή που έκανε το χρηματιστήριο πιο εύκολο για όλους: αγοραπωλησίες μετοχών χωρίς προμήθεια και χωρίς ελάχιστο ποσό. Τη χρησιμοποιούν κυρίως νέοι επενδυτές." },
  { ticker: "KO", name: "Coca-Cola", emoji: "🥤", color: "#F40009", description: "Το πιο γνωστό αναψυκτικό στον κόσμο. Εκτός από την Coca-Cola, η εταιρεία φτιάχνει Sprite, Fanta και πολλούς χυμούς και νερά. Πουλιέται σχεδόν σε κάθε χώρα του πλανήτη." },
  { ticker: "PEP", name: "Pepsi", emoji: "🍟", color: "#004B93", description: "Η PepsiCo δε φτιάχνει μόνο Pepsi. Της ανήκουν και τα πατατάκια Lay's και Doritos. Καλό παράδειγμα εταιρείας που κερδίζει από πολλά διαφορετικά προϊόντα." },
  { ticker: "SONY", name: "Sony / PlayStation", emoji: "🎮", color: "#003791", description: "Η ιαπωνική εταιρεία πίσω από το PlayStation. Φτιάχνει επίσης κάμερες, ακουστικά, ταινίες και μουσική. Αν έχεις παίξει σε PS5, έχεις χρησιμοποιήσει προϊόν Sony." },
  { ticker: "ADBE", name: "Adobe", emoji: "🎨", color: "#FA0F00", description: "Φτιάχνει προγράμματα για δημιουργικούς ανθρώπους: Photoshop για φωτογραφίες, Premiere για βίντεο, Acrobat για PDF. Πολλοί YouTubers και σχεδιαστές τα χρησιμοποιούν κάθε μέρα." },
  { ticker: "AMD", name: "AMD", emoji: "💻", color: "#ED1C24", description: "Φτιάχνει επεξεργαστές και κάρτες γραφικών για υπολογιστές και κονσόλες. Τα chips της AMD βρίσκονται μέσα στο PlayStation 5 και στο Xbox." },
  { ticker: "COST", name: "Costco", emoji: "🏬", color: "#E31837", description: "Τεράστια καταστήματα όπου τα μέλη πληρώνουν ετήσια συνδρομή και αγοράζουν μεγάλες ποσότητες σε χαμηλές τιμές. Έξυπνο επιχειρηματικό μοντέλο: ένα μεγάλο μέρος του κέρδους της έρχεται από τις συνδρομές." },
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
