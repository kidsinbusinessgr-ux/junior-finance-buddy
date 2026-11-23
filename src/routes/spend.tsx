import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Coins, Lock, Palette, ShoppingBag, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HeroArt } from "@/components/hero-art";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { CARD_COLORS, CARD_PATTERNS, CARD_TIERS, KibCard, colorMinLevel, nextTier, tierFor } from "@/components/kib-card";
import { XP_LEVELS, useChild, useCurrentUser } from "@/hooks/useJFB";

// ── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/spend")({
  head: () => ({
    meta: [
      { title: "Η κάρτα μου — Kids in Business" },
      { name: "description", content: "Η εικονική κάρτα Kids in Business: σχεδίασέ τη και δες τα κέρματά σου." },
      { property: "og:title", content: "Η κάρτα μου — Kids in Business" },
      { property: "og:description", content: "Η εικονική κάρτα Kids in Business: σχεδίασέ τη και δες τα κέρματά σου." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpendPage,
});

// What the card does today. Only things the app really does.
const FACTS = [
  {
    Icon: Coins,
    title: "Κέρματα, όχι χρήματα",
    copy: "Η κάρτα είναι εικονική. Δείχνει τα κέρματα της εφαρμογής και δε συνδέεται με καμία τράπεζα.",
  },
  {
    Icon: Wallet,
    title: "Το χαρτζιλίκι μπαίνει στην κάρτα",
    copy: "Όταν ο γονιός σου στέλνει κέρματα ή κερδίζεις από μαθήματα και δουλειές, το υπόλοιπο της κάρτας αλλάζει αμέσως.",
  },
  {
    Icon: ShoppingBag,
    title: "Πληρώνεις στο Κατάστημα",
    copy: "Ο γονιός σου βάζει ανταμοιβές, π.χ. «1 ώρα παιχνίδι». Τις πληρώνεις με την κάρτα από το Πορτοφόλι.",
  },
  {
    Icon: Lock,
    title: "Κλείδωμα και όριο",
    copy: "Κλειδώνεις την κάρτα όποτε θέλεις. Ο γονιός σου μπορεί επίσης να την κλειδώσει ή να βάλει όριο ανά εβδομάδα.",
  },
  {
    Icon: TrendingUp,
    title: "Με αυτά επενδύεις",
    copy: "Τα ίδια κέρματα τα χρησιμοποιείς για μετοχές με αληθινές τιμές και για τα startups των συμμαθητών σου.",
  },
];

// Which card tier the child has, and how far the next one is.
function TierProgress({ level, xp }: { level: number; xp: number }) {
  const tier = tierFor(level);
  const next = nextTier(level);
  const needXp = next ? XP_LEVELS[next.minLevel - 1] : 0;
  const fromXp = XP_LEVELS[tier.minLevel - 1];
  const pct = next ? Math.min(100, Math.max(0, Math.round(((xp - fromXp) / (needXp - fromXp)) * 100))) : 100;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-black">Η κάρτα σου: {tier.label}</span>
        <span className="text-muted-foreground">{CARD_TIERS.map((t) => t.label).join(" → ")}</span>
      </div>
      {next ? (
        <>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-[oklch(0.57_0.23_292)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Σου λείπουν {Math.max(0, needXp - xp)} XP για την κάρτα {next.label} (επίπεδο {next.minLevel}). Κερδίζεις XP από τα μαθήματα.
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Έφτασες στην κορυφαία κάρτα.</p>
      )}
    </div>
  );
}

// ── SpendPage ────────────────────────────────────────────────────────────────
function SpendPage() {
  const { userId } = useCurrentUser();
  const { child, loading } = useChild();
  const [color, setColor] = useState<string>(CARD_COLORS[0].id);
  const [pattern, setPattern] = useState<string>(CARD_PATTERNS[0].id);
  const [tab, setTab] = useState<"color" | "pattern">("color");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start from the card the child saved before.
  useEffect(() => {
    if (!child) return;
    setColor(child.card_color);
    setPattern(child.card_pattern);
  }, [child?.id]);

  const changed = !!child && (child.card_color !== color || child.card_pattern !== pattern);

  const save = async () => {
    if (!child) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from("jfb_children")
      .update({ card_color: color, card_pattern: pattern })
      .eq("id", child.id);
    setSaving(false);
    if (err) {
      setError(err.message.includes("card_color_locked") ? "Αυτό το χρώμα ξεκλειδώνει σε μεγαλύτερο επίπεδο." : "Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
      return;
    }
    setSaved(true);
  };

  const pick = (fn: () => void) => {
    fn();
    setSaved(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-16 pt-5 lg:px-16">
          <BrightlyNav active="spend" />
          <div className="grid items-center gap-8 pt-16 lg:grid-cols-2 lg:pt-24">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Η κάρτα μου</p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">Μάθε να ξοδεύεις, πριν πάρεις αληθινή κάρτα.</h1>
              <p className="mt-6 text-xl leading-relaxed text-[oklch(0.96_0.02_292)]">
                Η κάρτα Kids in Business είναι εικονική. Δουλεύει με τα κέρματα της εφαρμογής, όχι με πραγματικά χρήματα.
              </p>
              {child ? (
                <a href="#card">
                  <Button className="mt-8 h-14 rounded-full bg-white px-10 text-base font-black text-[oklch(0.45_0.22_290)] hover:bg-white/90">
                    Σχεδίασε την κάρτα σου
                  </Button>
                </a>
              ) : (
                !userId && (
                  <Link to="/signup">
                    <Button className="mt-8 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">Ξεκίνα δωρεάν</Button>
                  </Link>
                )
              )}
            </div>
            <HeroArt variant="spend" />
          </div>
        </div>
      </section>

      {/* Card designer */}
      <section id="card" className="scroll-mt-6 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Σχεδίαση κάρτας</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Η δική σου κάρτα.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Διάλεξε χρώμα και σχέδιο. Η κάρτα σου εμφανίζεται στο Πορτοφόλι με το υπόλοιπό σου.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <KibCard color={color} pattern={pattern} name={child?.name ?? ""} coins={child ? child.coins : null} level={child?.level ?? 1} />
              {child && <TierProgress level={child.level} xp={child.xp} />}
              {child ? (
                <>
                  <Button
                    onClick={save}
                    disabled={saving || !changed}
                    className="h-12 rounded-full bg-[oklch(0.55_0.17_173)] font-black text-white hover:bg-[oklch(0.48_0.17_173)]"
                  >
                    {saving ? "Αποθήκευση…" : saved && !changed ? (
                      <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Αποθηκεύτηκε</span>
                    ) : "Αποθήκευση κάρτας"}
                  </Button>
                  {saved && !changed && (
                    <p className="text-center text-sm text-muted-foreground">
                      Θα τη βρεις στο <Link to="/wallet" className="font-bold text-[oklch(0.5_0.2_292)] underline">Πορτοφόλι</Link>.
                    </p>
                  )}
                  {error && <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive">{error}</p>}
                </>
              ) : (
                !loading && (
                  <p className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                    {userId
                      ? "Την κάρτα τη σχεδιάζει το παιδί από τον δικό του λογαριασμό."
                      : "Συνδέσου ως μαθητής για να κρατήσεις την κάρτα σου."}
                  </p>
                )
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
                <button
                  onClick={() => setTab("color")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${tab === "color" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
                >
                  <Palette className="h-4 w-4" /> Χρώμα
                </button>
                <button
                  onClick={() => setTab("pattern")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${tab === "pattern" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`}
                >
                  <Sparkles className="h-4 w-4" /> Σχέδιο
                </button>
              </div>

              {tab === "color" ? (
                <div className="grid grid-cols-4 gap-3">
                  {CARD_COLORS.map((c) => {
                    const need = colorMinLevel(c.id);
                    const locked = (child?.level ?? 1) < need;
                    return (
                      <button
                        key={c.id}
                        disabled={locked}
                        onClick={() => pick(() => setColor(c.id))}
                        title={locked ? `Ξεκλειδώνει στο επίπεδο ${need} (${tierFor(need).label})` : c.label}
                        className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                      >
                        <span
                          className={`relative flex aspect-[1.586] w-full items-center justify-center rounded-lg transition-all ${color === c.id ? "ring-4 ring-[oklch(0.57_0.23_292)] ring-offset-2" : locked ? "" : "hover:scale-105"}`}
                          style={{ background: c.bg }}
                        >
                          {locked && (
                            <span className="flex h-full w-full items-center justify-center rounded-lg bg-black/45 text-white">
                              <Lock className="h-4 w-4" />
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {locked ? `Επίπεδο ${need}` : c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {CARD_PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => pick(() => setPattern(p.id))}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className={`w-full rounded-lg transition-all ${pattern === p.id ? "ring-4 ring-[oklch(0.57_0.23_292)] ring-offset-2" : "hover:scale-105"}`}>
                        <KibCard color={color} pattern={p.id} name="" coins={null} compact />
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What the card does */}
      <section className="bg-[oklch(0.985_0.015_91)] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Πώς δουλεύει</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Τι κάνει η κάρτα σου.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-xl bg-card p-6 shadow-sm">
                <Icon className="h-6 w-6 text-[oklch(0.5_0.2_292)]" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for visitors */}
      {!userId && (
        <section className="bg-background px-6 py-20 text-center">
          <div className="mx-auto max-w-xl">
            <h2 className="text-4xl font-black sm:text-5xl">Ξεκίνα σήμερα.</h2>
            <p className="mt-4 text-lg text-muted-foreground">Εγγράψου δωρεάν και φτιάξε την κάρτα σου.</p>
            <Link to="/signup">
              <Button className="mt-8 h-14 rounded-full px-10 text-base">Εγγραφή δωρεάν</Button>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
