import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock,
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
import { supabase } from "@/integrations/supabase/client";
import {
  useChild,
  useChores,
  useChoreSubmissions,
  useTransactions,
  useRewards,
  useRewardRequests,
  submitChore,
  requestReward,
} from "@/hooks/useJFB";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Πορτοφόλι — Kids in Business" },
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

type Tab = "history" | "chores" | "shop";

function txIcon(type: string) {
  if (type === "lesson") return { Icon: BookOpen, color: "bg-[oklch(0.88_0.1_292)]" };
  if (type === "chore") return { Icon: Zap, color: "bg-[oklch(0.89_0.11_51)]" };
  if (type === "investment") return { Icon: TrendingUp, color: "bg-[oklch(0.76_0.15_173)]" };
  if (type === "reward") return { Icon: ShoppingBag, color: "bg-[oklch(0.86_0.09_214)]" };
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
  const [requestingReward, setRequestingReward] = useState<string | null>(null);

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

  const { child, loading: childLoading } = useChild(userId);
  const { chores } = useChores(child?.parent_id ?? null);
  const { submissions } = useChoreSubmissions(child?.id ?? null);
  const { transactions } = useTransactions(child?.id ?? null);
  const { rewards } = useRewards(child?.parent_id ?? null);
  const { requests: rewardRequests, refetch: refetchRequests } = useRewardRequests(child?.id ?? null);

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

  const freeChores = chores.filter((c) => !c.is_paid);
  const paidChores = chores.filter((c) => c.is_paid);

  // Map chore id → latest submission status
  const submissionMap: Record<string, "pending" | "approved" | "rejected"> = {};
  submissions.forEach((s) => {
    if (!submissionMap[s.chore_id] || s.created_at > (submissions.find(x => x.chore_id === s.chore_id && submissionMap[s.chore_id])?.created_at ?? "")) {
      submissionMap[s.chore_id] = s.status as "pending" | "approved" | "rejected";
    }
  });

  // Map reward id → pending request
  const pendingRewardIds = new Set(
    rewardRequests.filter((r) => r.status === "pending").map((r) => r.reward_id)
  );
  const approvedRewardIds = new Set(
    rewardRequests.filter((r) => r.status === "approved").map((r) => r.reward_id)
  );

  const toggleChore = (choreId: string) => {
    setSelectedChores((prev) =>
      prev.includes(choreId) ? prev.filter((x) => x !== choreId) : [...prev, choreId]
    );
  };

  async function handleSubmitChores() {
    if (!child || selectedChores.length === 0) return;
    setSubmitting(true);
    for (const choreId of selectedChores) {
      await submitChore(child.id, choreId);
    }
    setSelectedChores([]);
    setSubmitting(false);
  }

  async function handleRequestReward(rewardId: string) {
    if (!child) return;
    setRequestingReward(rewardId);
    await requestReward(child.id, rewardId);
    await refetchRequests();
    setRequestingReward(null);
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
          <h1 className="text-3xl font-black">Πορτοφόλι 💰</h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="rounded-2xl bg-[oklch(0.46_0.18_292)] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">Υπόλοιπο</p>
              <p className="mt-1 text-4xl font-black">🪙 {child.coins}</p>
            </div>
            <div className="text-sm font-bold text-[oklch(0.86_0.1_292)]">
              {weekEarned > 0 && <p>+{weekEarned} αυτή την εβδομάδα</p>}
              {weekSpent < 0 && <p className="mt-1 text-[oklch(0.76_0.15_292)]">{weekSpent} ξοδεύτηκαν</p>}
              {weekEarned === 0 && weekSpent === 0 && (
                <p className="text-[oklch(0.76_0.15_292)]">Καμία κίνηση αυτή την εβδομάδα</p>
              )}
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
          <>
            {transactions.length === 0 ? (
              <div className="rounded-2xl bg-card ring-1 ring-border p-8 text-center">
                <p className="text-4xl mb-3">🪙</p>
                <p className="font-black text-foreground">Καμία κίνηση ακόμα</p>
                <p className="text-sm text-muted-foreground mt-1">Ξεκίνα μαθήματα ή κάνε δουλειές!</p>
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
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-muted-foreground">ΥΠΟΧΡΕΩΤΙΚΕΣ · Δωρεάν</span>
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
              <p className="mt-2 px-1 text-xs text-muted-foreground">Αυτές είναι οι υποχρεώσεις σου — δεν πληρώνονται.</p>
            </div>

            {/* Paid extras */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[oklch(0.88_0.1_292)] px-3 py-1 text-xs font-black text-[oklch(0.36_0.18_292)]">ΕΞΤΡΑ · Πληρώνονται</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              {paidChores.length === 0 ? (
                <p className="text-sm text-muted-foreground px-1">Δεν υπάρχουν εξτρα δουλειές ακόμα.</p>
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
                          {subStatus && isAvailable === false && (
                            <div className="mt-1">
                              <StatusBadge status={subStatus} />
                            </div>
                          )}
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
            </div>
          </div>
        )}

        {/* SHOP TAB */}
        {tab === "shop" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground px-1">Ο γονέας σου έχει ορίσει αυτές τις ανταμοιβές. Εξαργύρωσε τα coins σου!</p>
            {rewards.length === 0 ? (
              <div className="rounded-2xl bg-card ring-1 ring-border p-8 text-center">
                <p className="text-4xl mb-3">🎁</p>
                <p className="font-black text-foreground">Κανένα βραβείο ακόμα</p>
                <p className="text-sm text-muted-foreground mt-1">Ο γονέας σου θα προσθέσει βραβεία σύντομα.</p>
              </div>
            ) : (
              rewards.map((reward) => {
                const canAfford = child.coins >= reward.coins;
                const isPending = pendingRewardIds.has(reward.id);
                const isApproved = approvedRewardIds.has(reward.id);
                const isRequesting = requestingReward === reward.id;
                return (
                  <div
                    key={reward.id}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 ring-1 ${
                      isApproved
                        ? "bg-[oklch(0.76_0.15_173)] ring-[oklch(0.6_0.15_173)]"
                        : "bg-card ring-border"
                    }`}
                  >
                    <span className="text-3xl">{reward.emoji ?? "🎁"}</span>
                    <div className="flex-1">
                      <p className="font-black">{reward.name}</p>
                      <p className="text-sm font-bold text-muted-foreground">{reward.coins} 🪙</p>
                    </div>
                    {isApproved ? (
                      <span className="flex items-center gap-1 text-xs font-black text-[oklch(0.2_0.08_175)]">
                        <Check size={14} /> Εγκρίθηκε
                      </span>
                    ) : isPending ? (
                      <span className="rounded-full bg-[oklch(0.89_0.11_51)] px-2 py-1 text-[10px] font-black text-[oklch(0.4_0.14_37)]">
                        ⏳ Αναμονή
                      </span>
                    ) : (
                      <Button
                        disabled={!canAfford || isRequesting}
                        onClick={() => handleRequestReward(reward.id)}
                        size="sm"
                        className="rounded-full"
                        variant={canAfford ? "default" : "outline"}
                      >
                        {isRequesting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : canAfford ? "Αγόρα" : "Λίγα 🪙"}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
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
