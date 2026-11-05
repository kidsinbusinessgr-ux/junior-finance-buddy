import { createServerFn } from "@tanstack/react-start";

const FMP_BASE = "https://financialmodelingprep.com/stable";

export const KID_STOCKS = [
  { ticker: "AAPL", name: "Apple", emoji: "🍎", color: "#6E6E73", description: "Κατασκευάζει iPhone, iPad, Mac και AirPods. Μία από τις πιο πολύτιμες εταιρίες στον κόσμο — αν έχεις iPhone, έχεις ήδη χρησιμοποιήσει ένα Apple προϊόν!" },
  { ticker: "NVDA", name: "Nvidia", emoji: "🟢", color: "#76B900", description: "Φτιάχνει τις καλύτερες κάρτες γραφικών (GPU) για gaming και τεχνητή νοημοσύνη. Σχεδόν κάθε AI εφαρμογή (ChatGPT, Gemini) χρησιμοποιεί Nvidia chips!" },
  { ticker: "NFLX", name: "Netflix", emoji: "🎬", color: "#E50914", description: "Η μεγαλύτερη streaming πλατφόρμα στον κόσμο με 300+ εκατ. συνδρομητές. Παράγει δικές της σειρές και ταινίες — από Squid Game μέχρι Stranger Things." },
  { ticker: "RBLX", name: "Roblox", emoji: "🎮", color: "#E8202A", description: "Πλατφόρμα gaming που επιτρέπει σε χρήστες να δημιουργούν και να παίζουν games. Έχει 88 εκατ. ενεργούς χρήστες ημερησίως — οι περισσότεροι κάτω από 17 ετών!" },
  { ticker: "TTWO", name: "Take-Two / GTA", emoji: "🕹️", color: "#B4172A", description: "Εκδίδει τα πιο διάσημα video games: GTA, Red Dead Redemption, NBA 2K. Το GTA VI αναμένεται να είναι η μεγαλύτερη κυκλοφορία στην ιστορία των games!" },
  { ticker: "NTDOY", name: "Nintendo", emoji: "🍄", color: "#E4000F", description: "Ο θρύλος των video games! Δημιουργός Mario, Zelda, Pokemon και Nintendo Switch. Υπάρχει από το 1889 — ξεκίνησε φτιάχνοντας χαρτιά τράπουλας!" },
  { ticker: "DIS", name: "Disney", emoji: "🐭", color: "#1B3F8B", description: "Η μαγική αυτοκρατορία: Marvel, Star Wars, Pixar, και τα Disney Parks. Αν έχεις δει Avengers ή Frozen, έχεις χρηματοδοτήσει τη Disney!" },
  { ticker: "NKE", name: "Nike", emoji: "👟", color: "#111111", description: "Η Νο1 εταιρία αθλητικών ειδών στον κόσμο. Το διάσημο swoosh και το «Just Do It» αναγνωρίζονται παντού. Συνεργάζεται με LeBron, Ronaldo, Serena Williams." },
  { ticker: "MCD", name: "McDonald's", emoji: "🍔", color: "#FFC72C", description: "Η μεγαλύτερη αλυσίδα fast food στον κόσμο με 40.000+ εστιατόρια. Κάθε μέρα εξυπηρετεί 70 εκατ. πελάτες — σχεδόν ένα στα δέκα άτομα στη Γη!" },
  { ticker: "SHOP", name: "Shopify", emoji: "🛍️", color: "#96BF48", description: "Η πλατφόρμα που επιτρέπει σε οποιονδήποτε να φτιάξει online eshop. Εκατομμύρια επιχειρήσεις χρησιμοποιούν Shopify — ίσως και το αγαπημένο σου brand!" },
  { ticker: "SPOT", name: "Spotify", emoji: "🎵", color: "#1DB954", description: "Η No1 μουσική streaming πλατφόρμα με 640+ εκατ. χρήστες. Με μόνο €5/μήνα έχεις πρόσβαση σε 100 εκατ. τραγούδια — αντί να αγοράζεις CD!" },
  { ticker: "SBUX", name: "Starbucks", emoji: "☕", color: "#00704A", description: "Η αλυσίδα καφέ που άλλαξε τον τρόπο που πίνουμε καφέ. Με 36.000 καταστήματα παγκοσμίως, πουλά εμπειρία και lifestyle, όχι απλά καφέ." },
  { ticker: "SNAP", name: "Snapchat", emoji: "👻", color: "#FFFC00", description: "Η εφαρμογή με τα Stories, Streaks και AR filters. Δημοφιλής κυρίως σε ηλικίες 13-24 — το 90% των Αμερικανών teens χρησιμοποιεί Snapchat!" },
  { ticker: "TSLA", name: "Tesla", emoji: "⚡", color: "#CC0000", description: "Ο πρωτοπόρος ηλεκτρικών αυτοκινήτων του Elon Musk. Εκτός από αυτοκίνητα φτιάχνει ηλιακές στέγες, μπαταρίες και αναπτύσσει αυτόνομη οδήγηση!" },
  { ticker: "AMZN", name: "Amazon", emoji: "📦", color: "#FF9900", description: "Ξεκίνησε ως βιβλιοπωλείο το 1994 και τώρα κυριαρχεί στο e-commerce, cloud computing (AWS) και streaming. Κάθε 2ο πακέτο που παραγγέλνεις online έρχεται από Amazon!" },
  { ticker: "GOOGL", name: "Google", emoji: "🔍", color: "#4285F4", description: "Η εταιρία που ελέγχει την αναζήτηση, YouTube, Android και Gmail. Χειρίζεται 8,5 δισεκατομμύρια αναζητήσεις κάθε μέρα — σχεδόν μία για κάθε άνθρωπο στη Γη!" },
  { ticker: "META", name: "Instagram / Meta", emoji: "📱", color: "#0866FF", description: "Η εταιρία πίσω από Facebook, Instagram και WhatsApp. Συνδέει 3,2 δισεκατομμύρια ανθρώπους ημερησίως και επενδύει βαριά στο Metaverse και AI." },
  { ticker: "MSFT", name: "Microsoft / Xbox", emoji: "🎯", color: "#00A4EF", description: "Κατασκευάζει Windows, Office, Xbox και το cloud Azure. Αγόρασε Activision Blizzard για $69 δισ. — τώρα ελέγχει Call of Duty, Minecraft και World of Warcraft!" },
  { ticker: "V", name: "Visa", emoji: "💳", color: "#1A1F71", description: "Δεν είναι τράπεζα — είναι το δίκτυο που επεξεργάζεται πληρωμές. Κάθε φορά που χρησιμοποιείς κάρτα, η Visa παίρνει ένα μικρό ποσοστό. Επεξεργάζεται €15 τρισ. ετησίως!" },
  { ticker: "PYPL", name: "PayPal", emoji: "💸", color: "#003087", description: "Η πλατφόρμα που άλλαξε τις online πληρωμές. Με PayPal μπορείς να πληρώσεις online χωρίς να δώσεις τα στοιχεία της κάρτας σου. Ενεργοί χρήστες: 430 εκατ.!" },
  { ticker: "EA", name: "EA Games", emoji: "🕹️", color: "#FF4747", description: "Εκδότης FIFA (τώρα EA Sports FC), Sims, Battlefield. Μία από τις μεγαλύτερες gaming εταιρίες — αν έχεις παίξει FIFA, έχεις αγοράσει EA!" },
  { ticker: "YUM", name: "Pizza Hut / KFC", emoji: "🍕", color: "#EE3224", description: "Η Yum! Brands ελέγχει Pizza Hut, KFC και Taco Bell — τρεις από τις μεγαλύτερες αλυσίδες fast food. Συνολικά 55.000 εστιατόρια σε 155 χώρες!" },
  { ticker: "CMG", name: "Chipotle", emoji: "🌯", color: "#491F15", description: "Η αλυσίδα Mexican food που έχει γίνει φαινόμενο — κυρίως στις ΗΠΑ. Γνωστή για φρέσκα υλικά και μεγάλες μερίδες. Αγαπημένη επιλογή Gen Z!" },
  { ticker: "UBER", name: "Uber", emoji: "🚕", color: "#000000", description: "Η εφαρμογή που άλλαξε τις μεταφορές. Uber και Uber Eats λειτουργούν σε 70+ χώρες. Αν κάλεσες ποτέ ταξί μέσω app, πιθανώς ήταν Uber!" },
  { ticker: "ABNB", name: "Airbnb", emoji: "🏠", color: "#FF5A5F", description: "Η πλατφόρμα που μετέτρεψε κάθε σπίτι σε ξενοδοχείο. Έχει 7+ εκατ. καταλύματα σε 220 χώρες. Ξεκίνησε το 2008 όταν 2 φίλοι νοίκιαζαν αερόστρωμα στο δωμάτιό τους!" },
  { ticker: "LULU", name: "Lululemon", emoji: "🧘", color: "#9B4A97", description: "Αθλητικά ρούχα premium ποιότητας — ειδικά yoga pants που κοστίζουν €100+. Δημοφιλής σε Gen Z και millennials που θέλουν style και άνεση." },
  { ticker: "WMT", name: "Walmart", emoji: "🛒", color: "#0071CE", description: "Η μεγαλύτερη εταιρία λιανεμπορίου στον κόσμο με €650 δισ. ετήσια έσοδα. Ένας στους 150 εργαζόμενους παγκοσμίως δουλεύει στη Walmart!" },
  { ticker: "LUV", name: "Southwest Airlines", emoji: "✈️", color: "#304CB2", description: "Η μεγαλύτερη low-cost αεροπορική εταιρία των ΗΠΑ. Δεν χρεώνει επιπλέον για αποσκευές — γι' αυτό είναι τόσο δημοφιλής!" },
  { ticker: "HOOD", name: "Robinhood", emoji: "📈", color: "#00C805", description: "Η εφαρμογή που έκανε το χρηματιστήριο προσβάσιμο σε όλους. Δωρεάν αγοραπωλησία μετοχών, χωρίς ελάχιστο ποσό. Χρησιμοποιείται κυρίως από νέους επενδυτές!" },
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

export interface StockNewsItem {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text: string;
  image?: string;
}

function getKey() {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set");
  return key;
}

export const getStockQuotes = createServerFn({ method: "GET" }).handler(
  async () => {
    const key = getKey();

    // Fetch each ticker individually to avoid batch endpoint issues
    const results = await Promise.allSettled(
      KID_STOCKS.map(async (meta) => {
        const res = await fetch(
          `${FMP_BASE}/quote?symbol=${meta.ticker}&apikey=${key}`,
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const fmp = Array.isArray(data) ? data[0] : null;
        if (!fmp || !fmp.price) return null;
        return {
          ticker: meta.ticker,
          name: meta.name,
          emoji: meta.emoji,
          color: meta.color,
          description: meta.description,
          price: fmp.price ?? 0,
          change: fmp.change ?? 0,
          changePercent: fmp.changePercentage ?? 0,
          marketCap: fmp.marketCap ?? 0,
        };
      })
    );

    const quotes: StockQuote[] = results.map((r, i) => {
      const meta = KID_STOCKS[i];
      if (r.status === "fulfilled" && r.value) return r.value;
      return {
        ticker: meta.ticker,
        name: meta.name,
        emoji: meta.emoji,
        color: meta.color,
        description: meta.description,
        price: 0,
        change: 0,
        changePercent: 0,
        marketCap: 0,
      };
    });

    return { quotes, fetchedAt: new Date().toISOString() };
  }
);

export const getStockHistory = createServerFn({ method: "GET" })
  .validator((ticker: string) => ticker)
  .handler(async ({ data: ticker }) => {
    const key = getKey();
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const res = await fetch(
      `${FMP_BASE}/historical-price-eod/full?symbol=${ticker}&from=${from}&to=${to}&apikey=${key}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`FMP history error: ${res.status}`);
    const data = await res.json();

    const history: { date: string; close: number }[] = (
      Array.isArray(data) ? data : []
    )
      .slice(0, 30)
      .reverse()
      .map((d: { date: string; close: number }) => ({
        date: d.date,
        close: d.close,
      }));

    return { ticker, history } as StockHistory;
  });

export const getStockNews = createServerFn({ method: "GET" })
  .validator((ticker: string) => ticker)
  .handler(async ({ data: ticker }) => {
    const key = getKey();
    const res = await fetch(
      `${FMP_BASE}/news/stock?symbols=${ticker}&limit=5&apikey=${key}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`FMP news error: ${res.status}`);
    const data = await res.json();

    const news: StockNewsItem[] = (Array.isArray(data) ? data : []).map(
      (item: {
        title?: string;
        url?: string;
        publishedDate?: string;
        site?: string;
        text?: string;
        image?: string;
      }) => ({
        title: item.title ?? "",
        url: item.url ?? "#",
        publishedDate: item.publishedDate ?? "",
        site: item.site ?? "",
        text: item.text ? item.text.slice(0, 200) + "..." : "",
        image: item.image,
      })
    );

    return { ticker, news };
  });
