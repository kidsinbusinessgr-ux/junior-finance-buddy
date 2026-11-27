import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  Unlock,
  Gift,
  Home,
  Loader2,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KibCard } from "@/components/kib-card";
import { MonthlyStatement } from "@/components/monthly-statement";
import { CardDetails, useMyCard } from "@/components/card-checkout";
import { supabase } from "@/integrations/supabase/client";
import {
  useChild,
  useChores,
  useChoreSubmissions,
  useTransactions,
  useRewards,
  submitChore,
} from "@/hooks/useJFB";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Πορτοφόλι – Kids in Business" },
      { name: "description", content: "Τα KidsCoins σου, οι δουλειές και το κατάστημα" },
    ],
  }),
  component: WalletPage,
});

const bottomNav = [
  { label: "Αρχική", to: "/child-dashboard" as const, icon: Home },
  { label: "Μάθε", to: "/learn" as const, icon: BookOpen },
  { label: "Πορτοφόλι", to: "/wallet" as const, icon: Wallet },
  { label: "Στόχοι", to: "/goals" as const, icon: Target },
  { label: "Επενδύσεις", to: "/investments" as const, icon: TrendingUp },
];

type Tab = "history" | "chores" | "shop" | "statement";

function txIcon(type: string) {
  if (type === "lesson") return { Icon: BookOpen, color: "bg-[oklch(0.88_0.1_292)]" };
  if (type === "chore") return { Icon: Zap, color: "bg-[oklch(0.89_0.11_51)]" };
  if (type === "investment") return { Icon: TrendingUp, color: "bg-[oklch(0.76_0.15_173)]" };
  if (type === "reward") return { Icon: ShoppingBag, color: "bg-[oklch(0.86_0.09_214)]" };
  if (type === "card") return { Icon: CreditCard, color: "bg-[oklch(0.86_0.09_214)]" };
  if (type === "parent_load") return { Icon: Gift, color: "bg-[oklch(0.88_0.1_292)]" };
  return { Icon: Star, color: "bg-secondary" };
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Σήμερα";
  if (diffDays === 1) return "Χθες";
  if (diffDays < 7) return `${diffDays} μέρες πριν`;
  return d.toLocaleDateString("el-GR", { day: "numeric", month: "short" });
}

function StatusBadge({ status }: { status: "approved" | "pending" | "rejected" }) {
  if (status === "approved") return <span className="rounded-full bg-[oklch(0.76_0.15_173)] px-2 py-0.5 text-[10px] font-black text-[oklch(0.2_0.08_175)]">✓ Εγκρίθηκε</span>;
  if (status === "pending") return <span className="rounded-full bg-[oklch(0.89_0.11_51)] px-2 py-0.5 text-[10px] font-black text-[oklch(0.4_0.14_37)]">⏳ Αναμονή</span>;
  if (status === "rejected") return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">✕ Απορρίφθηκε</span>;
  return null;
}

function WalletPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("history");
  const [selectedChores, setSelectedChores] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [choreMessage, setChoreMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [shopMsg, setShopMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cardWeekSpent, setCardWeekSpent] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/login" });
      } else {
        setUserId(data.user.id);
      }
      setAuthChecked(true);
    });
  }, [navigate]);

  const { child, loading: childLoading, refetch: refetchChild } = useChild(userId);
  const { chores } = useChores(child?.parent_id ?? null);
  const { submissions, refetch: refetchSubmissions } = useChoreSubmissions(child?.id ?? null);
  const { transactions, refetch: refetchTransactions } = useTransactions(child?.id ?? null);
  const { rewards } = useRewards(child?.parent_id ?? null);
  const [showDetails, setShowDetails] = useState(false);
  const myCard = useMyCard(showDetails);

  // Card payments this week, for the parent's weekly limit.
  const childId = child?.id ?? null;
  const loadWeekSpent = async () => {
    if (!childId) return;
    const { data } = await supabase.rpc("jfb_card_week_spent", { p_child_id: childId });
    setCardWeekSpent(typeof data === "number" ? data : 0);
  };
  useEffect(() => { loadWeekSpent(); }, [childId]);

  if (!authChecked || childLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!child) {
    navigate({ to: "/onboarding" });
    return null;
  }

  // jfb_chores marks unpaid duties with is_obligatory; the rest pay coins.
  const freeChores = chores.filter((c) => c.is_obligatory);
  const paidChores = chores.filter((c) => !c.is_obligatory);

  // Map chore id → latest submission status (submissions come newest first).
  const submissionMap: Record<string, "pending" | "approved" | "rejected"> = {};
  submissions.forEach((s) => {
    if (!submissionMap[s.chore_id]) {
      submissionMap[s.chore_id] = s.status as "pending" | "approved" | "rejected";
    }
  });

  const cardLocked = child.card_locked || child.card_parent_locked;
  const limitLeft = child.card_weekly_limit === null ? null : Math.max(0, child.card_weekly_limit - (cardWeekSpent ?? 0));

  const toggleChore = (choreId: string) => {
    setSelectedChores((prev) =>
      prev.includes(choreId) ? prev.filter((x) => x !== choreId) : [...prev, choreId]
    );
  };

  async function handleSubmitChores() {
    if (!child || selectedChores.length === 0) return;
    setSubmitting(true);
    setChoreMessage(null);
    const count = selectedChores.length;
    try {
      for (const choreId of selectedChores) {
        await submitChore(choreId, child.id);
      }
      setSelectedChores([]);
      setChoreMessage({ ok: true, text: `✅ Στάλθηκ${count === 1 ? "ε" : "αν"} στον γονιό σου για έγκριση.` });
    } catch {
      setChoreMessage({ ok: false, text: "Δε στάλθηκε. Δοκίμασε ξανά." });
    } finally {
      await refetchSubmissions();
      setSubmitting(false);
    }
  }

  async function payWithCard(rewardId: string, name: string) {
    setPaying(rewardId);
    setShopMsg(null);
    const { error } = await supabase.rpc("jfb_card_pay", { p_reward_id: rewardId });
    setPaying(null);
    if (error) {
      const m = error.message;
      setShopMsg({
        ok: false,
        text: m.includes("card_locked")
          ? "Η κάρτα σου είναι κλειδωμένη."
          : m.includes("over_limit")
          ? "Ξεπερνάς το όριο της εβδομάδας που έβαλε ο γονιός σου."
          : m.includes("Not enough")
          ? "Δεν έχεις αρκετά KidsCoins."
          : "Η πληρωμή δεν έγινε. Δοκίμασε ξανά.",
      });
      return;
    }
    setShopMsg({ ok: true, text: `Πλήρωσες με την κάρτα: ${name}. Ο γονιός σου το βλέπει στον πίνακά του.` });
    loadWeekSpent();
    refetchChild();
    refetchTransactions();
  }

  async function toggleOwnLock() {
    await supabase.from("jfb_children").update({ card_locked: !child!.card_locked }).eq("id", child!.id);
    await refetchChild();
  }


  // Weekly stats from transactions
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekTx = transactions.filter((t) => new Date(t.created_at) >= weekStart);
  const weekEarned = weekTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const weekSpent = weekTx.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <section className="bg-primary px-5 pb-8 pt-6 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <Link to="/child-dashboard" className="flex items-center gap-2 text-sm font-bold text-[oklch(0.86_0.1_292)] mb-6">
            ← Αρχική
          </Link>
          <h1 className="text-3xl font-black">Πορτοφόλι</h1>
          {/* The child's virtual card, with the balance */}
          <div className="mt-5 max-w-sm">
            <KibCard color={child.card_color} pattern={child.card_pattern} name={child.name} coins={child.coins} level={child.level} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold text-[oklch(0.86_0.1_292)]">
              {weekEarned > 0 && <p>+{weekEarned} αυτή την εβδομάδα</p>}
              {weekSpent < 0 && <p className="mt-1 text-[oklch(0.76_0.15_292)]">{weekSpent} ξοδεύτηκαν</p>}
              {weekEarned === 0 && weekSpent === 0 && (
                <p className="text-[oklch(0.76_0.15_292)]">Καμία κίνηση αυτή την εβδομάδα</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleOwnLock}
                disabled={child.card_parent_locked}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25 disabled:opacity-60"
              >
                {cardLocked ? <Lock size={14} /> : <Unlock size={14} />}
                {child.card_parent_locked ? "Κλείδωσε ο γονιός σου" : child.card_locked ? "Ξεκλείδωσε" : "Κλείδωσε"}
              </button>
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25"
              >
                {showDetails ? "Κλείσε τα στοιχεία" : "Στοιχεία κάρτας"}
              </button>
              <Link to="/spend" hash="card" className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25">
                Άλλαξε σχέδιο
              </Link>
            </div>
          </div>
          {showDetails && (
            <div className="mt-4 rounded-2xl bg-card p-4 text-foreground">
              <p className="mb-3 text-sm font-black">💳 Prepaid κάρτα: με αυτά τα στοιχεία πληρώνεις μετοχές και startups, όπως πληρώνουν οι μεγάλοι online.</p>
              <CardDetails card={myCard} name={child.name} />
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-background px-5 pt-4 sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="flex rounded-xl bg-secondary p-1">
            {(["history", "chores", "shop", "statement"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-black transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {t === "history" ? "Ιστορικό" : t === "chores" ? "Δουλειές" : t === "shop" ? "Κατάστημα" : "Μήνας"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5 pt-4 sm:px-8">
        {/* HISTORY TAB */}
        {tab === "history" && (
          <>
            {transactions.length === 0 ? (
              <div className="rounded-2xl bg-card ring-1 ring-border p-8 text-center">
                <p className="text-4xl mb-3">🪙</p>
                <p className="font-black text-foreground">Καμία κίνηση ακόμα</p>
                <p className="text-sm text-muted-foreground mt-1">Ξεκίνα με ένα μάθημα ή μια δουλειά.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-card ring-1 ring-border">
                {transactions.slice(0, 20).map((tx, i) => {
                  const { Icon, color } = txIcon(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-border">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${color}`}>
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-tight">{tx.description}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{relativeDate(tx.created_at)}</p>
                      </div>
                      <p className={`text-sm font-black ${tx.amount > 0 ? "text-[oklch(0.45_0.18_142)]" : "text-destructive"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CHORES TAB */}
        {tab === "chores" && (
          <div className="space-y-5">
            {/* Free / obligatory */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-muted-foreground">ΥΠΟΧΡΕΩΤΙΚΕΣ · Χωρίς αμοιβή</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {freeChores.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">Δεν υπάρχουν υποχρεωτικές δουλειές ακόμα.</p>
              ) : (
                <div className="rounded-2xl bg-card ring-1 ring-border">
                  {freeChores.map((chore) => (
                    <div key={chore.id} className="flex items-center gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-border">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-border">
                      </span>
                      <p className="flex-1 text-sm font-bold">{chore.name}</p>
                      <span className="text-xs text-muted-foreground">0 🪙</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 px-1 text-xs text-muted-foreground">Αυτές είναι οι υποχρεώσεις σου και δεν πληρώνονται.</p>
            </div>

            {/* Paid extras */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[oklch(0.88_0.1_292)] px-3 py-1 text-xs font-black text-[oklch(0.36_0.18_292)]">ΕΞΤΡΑ · Με αμοιβή</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {paidChores.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">Δεν υπάρχουν έξτρα δουλειές ακόμα.</p>
              ) : (
                <div className="rounded-2xl bg-card ring-1 ring-border">
                  {paidChores.map((chore) => {
                    const subStatus = submissionMap[chore.id];
                    const isAvailable = !subStatus || subStatus === "rejected";
                    const isSelected = selectedChores.includes(chore.id);
                    return (
                      <div key={chore.id} className="flex items-center gap-4 px-5 py-4 [&:not(:last-child)]:border-b border-border">
                        <button
                          disabled={!isAvailable}
                          onClick={() => isAvailable && toggleChore(chore.id)}
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                            isSelected
                              ? "border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-white"
                              : subStatus === "approved"
                              ? "border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-white"
                              : isAvailable
                              ? "border-primary hover:bg-primary/10"
                              : "border-border"
                          }`}
                        >
                          {(isSelected || subStatus === "approved") && <Check size={14} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{chore.name}</p>
                          {subStatus && (
                            <div className="mt-1">
                              <StatusBadge status={subStatus} />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-black text-[oklch(0.55_0.18_37)]">+{chore.coins} 🪙</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedChores.length > 0 && (
                <Button
                  className="mt-3 h-11 w-full rounded-full"
                  onClick={handleSubmitChores}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Αποστολή…</>
                  ) : (
                    `Στείλε για έγκριση (${selectedChores.length} δουλειές)`
                  )}
                </Button>
              )}
              {choreMessage && (
                <p className={`mt-3 px-1 text-center text-sm font-bold ${choreMessage.ok ? "text-[oklch(0.55_0.17_173)]" : "text-destructive"}`}>
                  {choreMessage.text}
                </p>
              )}
            </div>
          </div>
        )}

        {/* SHOP TAB */}
        {tab === "statement" && <MonthlyStatement childId={child.id} coins={child.coins} name={child.name} />}

        {tab === "shop" && (
          <div className="space-y-3">
            <p className="px-1 text-sm text-muted-foreground">
              Ανταμοιβές που έβαλε ο γονιός σου. Πληρώνεις με την κάρτα σου και τα KidsCoins φεύγουν αμέσως.
            </p>
            {(cardLocked || limitLeft !== null) && (
              <div className="rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-muted-foreground">
                {cardLocked
                  ? child.card_parent_locked
                    ? "🔒 Ο γονιός σου κλείδωσε την κάρτα. Δεν μπορείς να πληρώσεις τώρα."
                    : "🔒 Έχεις κλειδώσει την κάρτα σου. Ξεκλείδωσέ τη για να πληρώσεις."
                  : `Όριο εβδομάδας: σου μένουν ${limitLeft} από ${child.card_weekly_limit} KidsCoins.`}
              </div>
            )}
            {shopMsg && (
              <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${shopMsg.ok ? "bg-[oklch(0.94_0.06_173)] text-[oklch(0.35_0.1_173)]" : "bg-red-50 text-red-600"}`}>
                {shopMsg.text}
              </div>
            )}
            {rewards.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-border">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-black text-foreground">Δεν υπάρχουν ανταμοιβές ακόμα</p>
                <p className="mt-1 text-sm text-muted-foreground">Ζήτα από τον γονιό σου να βάλει μερικές από τον πίνακά του.</p>
              </div>
            ) : (
              rewards.map((reward) => {
                const canAfford = child.coins >= reward.cost;
                const fitsLimit = limitLeft === null || reward.cost <= limitLeft;
                const isPaying = paying === reward.id;
                return (
                  <div key={reward.id} className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4 ring-1 ring-border">
                    <div className="flex-1">
                      <p className="font-black">{reward.emoji ?? "🎁"} {reward.name}</p>
                      <p className="text-sm font-bold text-muted-foreground">{reward.cost} 🪙</p>
                    </div>
                    <Button
                      disabled={!canAfford || !fitsLimit || cardLocked || paying !== null}
                      onClick={() => payWithCard(reward.id, reward.name)}
                      size="sm"
                      className="rounded-full"
                      variant={canAfford && fitsLimit && !cardLocked ? "default" : "outline"}
                    >
                      {isPaying ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : !canAfford ? (
                        "Λίγα KidsCoins"
                      ) : !fitsLimit ? (
                        "Πάνω από το όριο"
                      ) : (
                        <span className="flex items-center gap-1.5"><CreditCard size={14} /> Πλήρωσε</span>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
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
