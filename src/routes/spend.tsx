import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, Lock, Unlock, Palette, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import spendHero from "@/assets/spend-hero-cartoon.png";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

// ── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/spend")({
  head: () => ({
    meta: [
      { title: "Ξόδεψε — Kids in Business" },
      { name: "description", content: "Μάθε πώς τα παιδιά κάνουν έξυπνες επιλογές με τα χρήματά τους." },
      { property: "og:title", content: "Ξόδεψε — Kids in Business" },
      { property: "og:description", content: "Μάθε πώς τα παιδιά κάνουν έξυπνες επιλογές με τα χρήματά τους." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpendPage,
});

// ── Card customization data ──────────────────────────────────────────────────
const CARD_GRADIENTS = [
  { id: "purple", label: "Μωβ", gradient: "linear-gradient(135deg,oklch(0.52 0.24 290),oklch(0.65 0.19 295))" },
  { id: "pink", label: "Ροζ", gradient: "linear-gradient(135deg,#f472b6,#ec4899)" },
  { id: "ocean", label: "Θάλασσα", gradient: "linear-gradient(135deg,#06b6d4,#0ea5e9)" },
  { id: "sunset", label: "Ηλιοβασίλεμα", gradient: "linear-gradient(135deg,#f97316,#f59e0b)" },
  { id: "forest", label: "Πράσινο", gradient: "linear-gradient(135deg,#22c55e,#16a34a)" },
  { id: "galaxy", label: "Γαλαξίας", gradient: "linear-gradient(135deg,#1e1b4b,#7c3aed)" },
  { id: "coral", label: "Κοράλι", gradient: "linear-gradient(135deg,#fb7185,#f43f5e)" },
  { id: "mint", label: "Μέντα", gradient: "linear-gradient(135deg,#34d399,#059669)" },
];

const CARD_DESIGNS = [
  { id: "none", label: "Καθαρό", emoji: "✨" },
  { id: "stars", label: "Αστέρια", emoji: "⭐" },
  { id: "rainbow", label: "Ουράνιο τόξο", emoji: "🌈" },
  { id: "rockets", label: "Πύραυλοι", emoji: "🚀" },
  { id: "cats", label: "Γατάκια", emoji: "🐱" },
  { id: "coins", label: "Νομίσματα", emoji: "💰" },
  { id: "hearts", label: "Καρδιές", emoji: "💜" },
  { id: "soccer", label: "Ποδόσφαιρο", emoji: "⚽" },
];

const DESIGN_PATTERNS: Record<string, string[]> = {
  none: [],
  stars: ["⭐", "✨", "🌟", "⭐", "✨", "🌟"],
  rainbow: ["🌈", "🌈", "🌈", "🌈", "🌈", "🌈"],
  rockets: ["🚀", "⭐", "🚀", "✨", "🚀", "⭐"],
  cats: ["🐱", "🐾", "🐱", "🐾", "🐱", "🐾"],
  coins: ["💰", "💎", "💰", "💎", "💰", "💎"],
  hearts: ["💜", "💗", "💜", "💗", "💜", "💗"],
  soccer: ["⚽", "🏆", "⚽", "🏆", "⚽", "🏆"],
};

// ── CardPreview ──────────────────────────────────────────────────────────────
function CardPreview({
  gradient,
  design,
  name,
  locked,
  coins,
  loading,
}: {
  gradient: string;
  design: string;
  name: string;
  locked: boolean;
  coins: number | null;
  loading: boolean;
}) {
  const emojis = DESIGN_PATTERNS[design] ?? [];

  // Format balance: real coins if available, demo fallback for unauthenticated
  const balanceLabel = loading
    ? "..."
    : coins !== null
    ? `🪙 ${coins}`
    : "🪙 —";

  return (
    <div
      className="relative rounded-2xl p-6 text-white shadow-2xl transition-all duration-500 select-none"
      style={{ background: locked ? "oklch(0.45 0.05 292)" : gradient, minHeight: 200 }}
    >
      {/* Background pattern emojis */}
      {emojis.length > 0 && !locked && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-20">
          <div className="grid grid-cols-3 gap-6 p-4 text-3xl">
            {emojis.map((e, i) => (
              <span key={i} className="text-center">{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Card content */}
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-widest opacity-80">Kids in Business</span>
          {locked && <Lock className="h-5 w-5 opacity-60" />}
        </div>
        <p className="font-mono text-xl tracking-[0.2em] opacity-90">•••• •••• •••• 4821</p>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase opacity-60">Κάτοχος</p>
            <p className="font-bold">{name || "Το όνομά σου"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase opacity-60">Κέρματα</p>
            <p className={`text-2xl font-black transition-opacity duration-300 ${loading ? "opacity-40" : "opacity-100"}`}>
              {balanceLabel}
            </p>
          </div>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
          <div className="text-center">
            <Lock className="mx-auto h-10 w-10" />
            <p className="mt-2 font-bold">Κάρτα κλειδωμένη</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SpendPage ────────────────────────────────────────────────────────────────
function SpendPage() {
  const [cardLocked, setCardLocked] = useState(false);
  const [alertsOn, setAlertsOn] = useState(true);

  // Card customizer state
  const [selectedGradient, setSelectedGradient] = useState(CARD_GRADIENTS[0]);
  const [selectedDesign, setSelectedDesign] = useState(CARD_DESIGNS[0]);
  const [cardName, setCardName] = useState("Σοφία Παπαδάκη");
  const [customizerTab, setCustomizerTab] = useState<"color" | "design">("color");

  // Live balance from Supabase
  const [coins, setCoins] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalance() {
      try {
        // Get the currently logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) {
          setBalanceLoading(false);
          return;
        }

        // Fetch this child's record
        const { data, error } = await supabase
          .from("jfb_children")
          .select("name, coins")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (!error && data) {
          setCoins((data as { coins: number; name: string }).coins ?? 0);
          // Pre-fill name from DB if present
          if ((data as { name: string }).name) setCardName((data as { name: string }).name);
        }
      } catch {
        // Non-fatal — show demo state (🪙 —)
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    }

    fetchBalance();

    // Subscribe to real-time coin changes
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      channel = supabase
        .channel("jfb_children_coins")
        .on(
          "postgres_changes" as any,
          {
            event: "UPDATE",
            schema: "public",
            table: "jfb_children",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            const updated = payload.new as { coins?: number };
            if (typeof updated.coins === "number") {
              setCoins(updated.coins);
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative min-h-[560px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-16 pt-5 lg:px-16">
          <BrightlyNav active="spend" />
          <div className="grid items-center gap-8 pt-20 lg:grid-cols-2 lg:pt-28">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Δαπάνες</p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">Εξάσκησε επιλογές με ασφάλεια.</h1>
              <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">Η κάρτα Kids in Business δίνει στα παιδιά πραγματικές επιλογές δαπανών με προστατευτικά όρια που ορίζουν οι γονείς.</p>
              <Link to="/signup">
                <Button className="mt-8 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
              </Link>
            </div>
            <div className="relative mx-auto w-full max-w-[500px]">
              <img src={spendHero} width={1000} height={1000} alt="Παιδί με κάρτα" className="relative z-10 h-full w-full object-contain drop-shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Card Customizer */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Προσωποποίηση κάρτας</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Φτιάξε τη δική σου κάρτα!</h2>
            <p className="mt-4 text-lg text-muted-foreground">Διάλεξε χρώμα, σχέδιο και βάλε το όνομά σου. Η κάρτα σου, ο δικός σου τρόπος.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-8 lg:grid-cols-2">
            {/* Live card preview */}
            <div className="flex flex-col gap-4">
              <CardPreview
                gradient={selectedGradient.gradient}
                design={selectedDesign.id}
                name={cardName}
                locked={cardLocked}
                coins={coins}
                loading={balanceLoading}
              />

              {/* Name input */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-muted-foreground">Όνομα κατόχου</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  maxLength={22}
                  placeholder="Το όνομά σου..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 font-semibold outline-none ring-0 transition-all focus:border-[oklch(0.57_0.23_292)] focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]/20"
                />
              </div>

              {/* Card controls */}
              <div className="grid gap-3">
                <button
                  onClick={() => setCardLocked(!cardLocked)}
                  className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${cardLocked ? "border-red-300 bg-red-50 text-red-700" : "border-border bg-card hover:bg-muted"}`}
                >
                  <span className="flex items-center gap-3 font-semibold">
                    {cardLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5 text-[oklch(0.55_0.17_173)]" />}
                    {cardLocked ? "Κάρτα κλειδωμένη" : "Κάρτα ενεργή"}
                  </span>
                  <span className={`text-sm font-bold ${cardLocked ? "text-red-600" : "text-[oklch(0.55_0.17_173)]"}`}>
                    {cardLocked ? "Ξεκλείδωσε" : "Κλείδωσε"}
                  </span>
                </button>

                <button
                  onClick={() => setAlertsOn(!alertsOn)}
                  className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${alertsOn ? "border-[oklch(0.7_0.17_173)] bg-[oklch(0.95_0.05_173)]" : "border-border bg-card hover:bg-muted"}`}
                >
                  <span className="flex items-center gap-3 font-semibold">
                    {alertsOn ? <Bell className="h-5 w-5 text-[oklch(0.55_0.17_173)]" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                    Ειδοποιήσεις δαπανών
                  </span>
                  <span className={`text-sm font-bold ${alertsOn ? "text-[oklch(0.55_0.17_173)]" : "text-muted-foreground"}`}>
                    {alertsOn ? "Ενεργές" : "Ανενεργές"}
                  </span>
                </button>
              </div>
            </div>

            {/* Customizer panel */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Tabs */}
              <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
                <button
                  onClick={() => setCustomizerTab("color")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${customizerTab === "color" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
                >
                  <Palette className="h-4 w-4" /> Χρώμα
                </button>
                <button
                  onClick={() => setCustomizerTab("design")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${customizerTab === "design" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
                >
                  <Sparkles className="h-4 w-4" /> Σχέδιο
                </button>
              </div>

              {customizerTab === "color" ? (
                <div>
                  <p className="mb-4 text-sm font-semibold text-muted-foreground">Διάλεξε χρώμα</p>
                  <div className="grid grid-cols-4 gap-3">
                    {CARD_GRADIENTS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGradient(g)}
                        title={g.label}
                        className={`aspect-square rounded-xl transition-all ${selectedGradient.id === g.id ? "ring-4 ring-[oklch(0.57_0.23_292)] ring-offset-2 scale-110" : "hover:scale-105"}`}
                        style={{ background: g.gradient }}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-center text-sm font-bold text-muted-foreground">{selectedGradient.label}</p>
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-sm font-semibold text-muted-foreground">Διάλεξε σχέδιο</p>
                  <div className="grid grid-cols-4 gap-3">
                    {CARD_DESIGNS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDesign(d)}
                        title={d.label}
                        className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 text-2xl transition-all ${selectedDesign.id === d.id ? "border-[oklch(0.57_0.23_292)] bg-[oklch(0.57_0.23_292)]/10 scale-110" : "border-border hover:border-[oklch(0.57_0.23_292)]/40 hover:scale-105"}`}
                      >
                        {d.emoji}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-center text-sm font-bold text-muted-foreground">{selectedDesign.label}</p>
                </div>
              )}

              <div className="mt-8 rounded-xl bg-[oklch(0.57_0.23_292)]/10 p-4 text-sm text-[oklch(0.45_0.15_292)]">
                <p className="font-bold">💡 Τι μπορείς να κάνεις;</p>
                <p className="mt-1 leading-relaxed">Φτιάξε μια μοναδική κάρτα που μοιάζει στον χαρακτήρα σου και διαχειρίσου τα χρήματά σου με έξυπνο τρόπο!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Allowance teaser */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Εβδομαδιαίο χαρτζιλίκι</p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Οι γονείς ορίζουν, τα παιδιά διαχειρίζονται.</h2>
              <p className="mt-4 text-lg text-muted-foreground">Κάθε εβδομάδα, αυτόματα, το χαρτζιλίκι μπαίνει στην κάρτα. Το παιδί αποφασίζει πώς θα το χρησιμοποιήσει — και μαθαίνει να κάνει έξυπνες επιλογές.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["🗓️", "Αυτόματη κατάθεση", "Κάθε Δευτέρα (ή όποια μέρα θέλεις)"],
                  ["💳", "Ποσό στην κάρτα", "Εσύ ορίζεις πόσο — π.χ. 50 κέρματα/εβδ."],
                  ["📊", "Παρακολούθηση", "Δες πού πηγαίνουν τα χρήματα"],
                  ["🏆", "Smart rewards", "Κέρδισε κέρματα με έξυπνες επιλογές"],
                ].map(([icon, title, desc]) => (
                  <div key={title as string} className="rounded-xl bg-card p-4 shadow-sm">
                    <div className="text-2xl">{icon as string}</div>
                    <p className="mt-2 font-bold">{title as string}</p>
                    <p className="text-sm text-muted-foreground">{desc as string}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-[oklch(0.57_0.23_292)]/30 bg-card p-8 text-center">
              <div className="text-5xl">🪙</div>
              <h3 className="mt-4 text-2xl font-black">Έρχεται σύντομα!</h3>
              <p className="mt-3 text-muted-foreground">Το σύστημα αυτόματου χαρτζιλικιού και smart rewards θα είναι διαθέσιμο στους συνδρομητές μας.</p>
              <Link to="/signup">
                <Button className="mt-6 h-12 rounded-full px-8">Εγγράψου για πρόσβαση</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-background px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Ασφαλέστερος τρόπος μάθησης</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Προστασία σε κάθε βήμα.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              ["Όρια δαπανών", "Οι γονείς ορίζουν ημερήσια ή εβδομαδιαία όρια ώστε οι αγορές να μένουν στα μέτρα."],
              ["Στιγμιαίες ειδοποιήσεις", "Λάβε ειδοποίηση για κάθε αγορά — ώστε πάντα να ξέρεις τι συμβαίνει."],
              ["Κλείδωμα με ένα πάτημα", "Κλείδωσε ή ξεκλείδωσε την κάρτα οποιαδήποτε στιγμή από οπουδήποτε."],
            ].map(([title, copy]) => (
              <div key={title as string} className="rounded-xl bg-card p-6 shadow-sm">
                <h3 className="text-xl font-black">{title as string}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background px-6 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-4xl font-black sm:text-5xl">Ξεκίνα σήμερα.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Εγγράψου δωρεάν και δώσε στο παιδί σου μια ασφαλή κάρτα για να μαθαίνει.</p>
          <Link to="/signup">
            <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
