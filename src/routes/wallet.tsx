import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Gift,
  Home,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Πορτοφόλι — Kids in Business" },
      { name: "description", content: "Τα KidsCoins σου, οι δουλειές και το κατάστημα" },
    ],
  }),
  component: WalletPage,
});

const COINS = 347;

const coinHistory = [
  { label: "Ολοκλήρωσες «Τι είναι το χρήμα;»", amount: +50, date: "Σήμερα", icon: BookOpen, color: "bg-[oklch(0.88_0.1_292)]" },
  { label: "Πλύσιμο αυτοκινήτου", amount: +20, date: "Χθες", icon: Zap, color: "bg-[oklch(0.89_0.11_51)]" },
  { label: "Αγόρασες «1 ώρα gaming»", amount: -60, date: "Χθες", icon: ShoppingBag, color: "bg-[oklch(0.86_0.09_214)]" },
  { label: "Επένδυση Apple +5%", amount: +12, date: "Δευτέρα", icon: TrendingUp, color: "bg-[oklch(0.76_0.15_173)]" },
  { label: "Ολοκλήρωσες «Αποταμίευση»", amount: +60, date: "Κυριακή", icon: BookOpen, color: "bg-[oklch(0.88_0.1_292)]" },
];

const freeChores = [
  { label: "Στρώσιμο κρεβατιού", done: true },
  { label: "Βούρτσισμα δοντιών", done: true },
  { label: "Μάζεμα τσάντας σχολείου", done: false },
];

const paidChores = [
  { label: "Πλύσιμο αυτοκινήτου", coins: 20, status: "approved" as const },
  { label: "Σκούπισμα σαλονιού", coins: 15, status: "pending" as const },
  { label: "Πότισμα φυτών", coins: 10, status: "available" as const },
  { label: "Καθάρισμα παραθύρων", coins: 25, status: "available" as const },
];

const rewards = [
  { label: "1 ώρα gaming", coins: 60, emoji: "🎮" },
  { label: "Επιλέγω ταινία", coins: 80, emoji: "🎬" },
  { label: "Γλυκό της επιλογής μου", coins: 40, emoji: "🍦" },
  { label: "Φίλος για ύπνο", coins: 120, emoji: "🏕️" },
  { label: "Έξοδος για παγωτό", coins: 100, emoji: "🍦" },
];

const bottomNav = [
  { label: "Αρχική", to: "/child-dashboard" as const, icon: Home },
  { label: "Μάθε", to: "/learn" as const, icon: BookOpen },
  { label: "Πορτοφόλι", to: "/wallet" as const, icon: Wallet },
  { label: "Στόχοι", to: "/save" as const, icon: Target },
  { label: "Επενδύσεις", to: "/invest" as const, icon: TrendingUp },
];

type Tab = "history" | "chores" | "shop";

function StatusBadge({ status }: { status: "approved" | "pending" | "available" }) {
  if (status === "approved") return <span className="rounded-full bg-[oklch(0.76_0.15_173)] px-2 py-0.5 text-[10px] font-black text-[oklch(0.2_0.08_175)]">✓ Εγκρίθηκε</span>;
  if (status === "pending") return <span className="rounded-full bg-[oklch(0.89_0.11_51)] px-2 py-0.5 text-[10px] font-black text-[oklch(0.4_0.14_37)]">⏳ Αναμονή</span>;
  return null;
}

function WalletPage() {
  const [tab, setTab] = useState<Tab>("history");
  const [doneChores, setDoneChores] = useState<number[]>([]);
  const [bought, setBought] = useState<number[]>([]);

  const toggleChore = (i: number) =>
    setDoneChores((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <section className="bg-primary px-5 pb-8 pt-6 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <Link to="/child-dashboard" className="flex items-center gap-2 text-sm font-bold text-[oklch(0.86_0.1_292)] mb-6">
            ← Αρχική
          </Link>
          <h1 className="text-3xl font-black">Πορτοφόλι 💰</h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="rounded-2xl bg-[oklch(0.46_0.18_292)] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">Υπόλοιπο</p>
              <p className="mt-1 text-4xl font-black">🪙 {COINS}</p>
            </div>
            <div className="text-sm font-bold text-[oklch(0.86_0.1_292)]">
              <p>+{coinHistory.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0)} αυτή την εβδομάδα</p>
              <p className="mt-1 text-[oklch(0.76_0.15_292)]">{coinHistory.filter(c => c.amount < 0).reduce((s, c) => s + c.amount, 0)} ξοδεύτηκαν</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-4 sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="flex rounded-xl bg-secondary p-1">
            {(["history", "chores", "shop"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-black transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {t === "history" ? "Ιστορικό" : t === "chores" ? "Δουλειές" : "Κατάστημα"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5 pt-4 sm:px-8">
        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="rounded-2xl bg-card ring-1 ring-border">
            {coinHistory.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-border">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.color}`}>
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-tight">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <p className={`text-sm font-black ${item.amount > 0 ? "text-[oklch(0.45_0.18_142)]" : "text-destructive"}`}>
                    {item.amount > 0 ? "+" : ""}{item.amount} 🪙
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* CHORES TAB */}
        {tab === "chores" && (
          <div className="space-y-5">
            {/* Free / obligatory */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-muted-foreground">ΥΠΟΧΡΕΩΤΙΚΕΣ · Δωρεάν</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="rounded-2xl bg-card ring-1 ring-border">
                {freeChores.map((chore, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-border">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${chore.done ? "border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-white" : "border-border"}`}>
                      {chore.done && <Check size={14} />}
                    </span>
                    <p className={`flex-1 text-sm font-bold ${chore.done ? "line-through text-muted-foreground" : ""}`}>{chore.label}</p>
                    <span className="text-xs text-muted-foreground">0 🪙</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 px-1 text-xs text-muted-foreground">Αυτές είναι οι υποχρεώσεις σου — δεν πληρώνονται.</p>
            </div>

            {/* Paid extras */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[oklch(0.88_0.1_292)] px-3 py-1 text-xs font-black text-[oklch(0.36_0.18_292)]">ΕΞΤΡΑ · Πληρώνονται</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="rounded-2xl bg-card ring-1 ring-border">
                {paidChores.map((chore, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-border">
                    <button
                      disabled={chore.status !== "available"}
                      onClick={() => toggleChore(i)}
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                        doneChores.includes(i)
                          ? "border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-white"
                          : chore.status === "available"
                          ? "border-primary hover:bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      {(doneChores.includes(i) || chore.status === "approved") && <Check size={14} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{chore.label}</p>
                      {chore.status !== "available" && (
                        <div className="mt-1">
                          <StatusBadge status={chore.status} />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-black text-[oklch(0.55_0.18_37)]">+{chore.coins} 🪙</span>
                  </div>
                ))}
              </div>
              {doneChores.length > 0 && (
                <Button className="mt-3 h-11 w-full rounded-full">
                  Στείλε για έγκριση ({doneChores.length} δουλειές)
                </Button>
              )}
            </div>
          </div>
        )}

        {/* SHOP TAB */}
        {tab === "shop" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground px-1">Ο γονέας σου έχει ορίσει αυτές τις ανταμοιβές. Εξαργύρωσε τα coins σου!</p>
            {rewards.map((reward, i) => {
              const canAfford = COINS >= reward.coins;
              const isBought = bought.includes(i);
              return (
                <div key={i} className={`flex items-center gap-4 rounded-2xl px-5 py-4 ring-1 ${isBought ? "bg-[oklch(0.76_0.15_173)] ring-[oklch(0.6_0.15_173)]" : "bg-card ring-border"}`}>
                  <span className="text-3xl">{reward.emoji}</span>
                  <div className="flex-1">
                    <p className="font-black">{reward.label}</p>
                    <p className="text-sm font-bold text-muted-foreground">{reward.coins} 🪙</p>
                  </div>
                  {isBought ? (
                    <span className="flex items-center gap-1 text-xs font-black text-[oklch(0.2_0.08_175)]">
                      <Check size={14} /> Εξαργυρώθηκε
                    </span>
                  ) : (
                    <Button
                      disabled={!canAfford}
                      onClick={() => setBought((b) => [...b, i])}
                      size="sm"
                      className="rounded-full"
                      variant={canAfford ? "default" : "outline"}
                    >
                      {canAfford ? "Αγόρα" : "Λίγα 🪙"}
                    </Button>
                  )}
                </div>
              );
            })}
            <div className="mt-4 rounded-2xl bg-secondary p-4 text-center">
              <p className="text-sm font-bold text-muted-foreground">
                <Clock size={14} className="inline mr-1" />
                Μετά την εξαργύρωση, ο γονέας σου θα ειδοποιηθεί για έγκριση.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-3 shadow-lg">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/wallet";
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-black ${isActive ? "text-primary" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
