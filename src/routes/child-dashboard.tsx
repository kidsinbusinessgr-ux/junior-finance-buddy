import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Home,
  PiggyBank,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
  Check,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/child-dashboard")({
  head: () => ({
    meta: [
      { title: "Αρχική — Kids in Business" },
      { name: "description", content: "Το dashboard σου στο Kids in Business" },
    ],
  }),
  component: ChildDashboard,
});

const CHILD_NAME = "Αχιλλέα";
const COINS = 347;
const XP = 820;
const XP_NEXT = 1000;
const LEVEL = 3;
const LEVEL_LABEL = "Μικρός Επιχειρηματίας";

const recentActivity = [
  { label: "Ολοκλήρωσες «Τι είναι το χρήμα;»", coins: "+50", xp: "+30", color: "bg-[oklch(0.88_0.1_292)]", icon: BookOpen },
  { label: "Πλύσιμο αυτοκινήτου", coins: "+20", xp: "+10", color: "bg-[oklch(0.89_0.11_51)]", icon: Sparkles },
  { label: "Επένδυση σε Apple", coins: "+12", xp: "+5", color: "bg-[oklch(0.76_0.15_173)]", icon: TrendingUp },
];

const savingsGoal = { label: "Lego Technic", current: 180, target: 300 };
const goalPercent = Math.round((savingsGoal.current / savingsGoal.target) * 100);

const pendingChores = [
  { label: "Σκούπισμα σαλονιού", coins: 15, paid: true },
  { label: "Βγάλε σκουπίδια", coins: 10, paid: true },
];

const bottomNav = [
  { label: "Αρχική", to: "/child-dashboard" as const, icon: Home },
  { label: "Μάθε", to: "/learn" as const, icon: BookOpen },
  { label: "Πορτοφόλι", to: "/spend" as const, icon: Wallet },
  { label: "Στόχοι", to: "/save" as const, icon: Target },
  { label: "Επενδύσεις", to: "/invest" as const, icon: TrendingUp },
];

function ChildDashboard() {
  const [choreDone, setChoreDone] = useState<number[]>([]);
  const xpPercent = Math.round((XP / XP_NEXT) * 100);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* Header */}
      <section className="bg-primary px-5 pb-10 pt-6 text-primary-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black tracking-tight">
              <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-base leading-none text-primary-foreground mr-1">∞</span>
              Kids in Business
            </span>
            <button className="relative grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.46_0.18_292)] text-primary-foreground">
              <Bell size={18} />
              {pendingChores.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.7_0.22_28)] text-[10px] font-black">
                  {pendingChores.length}
                </span>
              )}
            </button>
          </div>

          <div className="mt-8">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-[oklch(0.86_0.1_292)]">
              Καλημέρα 👋
            </p>
            <h1 className="mt-1 text-4xl font-black">{CHILD_NAME}!</h1>

            {/* Coins + Level */}
            <div className="mt-6 flex items-end gap-5">
              <div className="rounded-2xl bg-[oklch(0.46_0.18_292)] px-5 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">KidsCoins</p>
                <p className="mt-1 text-4xl font-black">🪙 {COINS}</p>
              </div>
              <div className="flex-1 rounded-2xl bg-[oklch(0.46_0.18_292)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.86_0.1_292)]">Επίπεδο {LEVEL}</p>
                  <span className="flex items-center gap-1 text-xs font-black text-[oklch(0.86_0.1_292)]">
                    <Zap size={12} /> {XP}/{XP_NEXT} XP
                  </span>
                </div>
                <p className="mt-1 text-sm font-black">{LEVEL_LABEL}</p>
                <Progress value={xpPercent} className="mt-2 h-2 bg-[oklch(0.36_0.13_292)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-xl px-5 sm:px-8">
        {/* Pending Chores notification */}
        {pendingChores.length > 0 && (
          <section className="mt-6 rounded-2xl bg-[oklch(0.95_0.08_51)] p-5 ring-1 ring-[oklch(0.85_0.14_51)]">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[oklch(0.55_0.18_37)]" />
              <p className="text-sm font-black text-[oklch(0.35_0.12_37)]">
                Ο γονέας σου έβαλε {pendingChores.length} νέες δουλειές!
              </p>
            </div>
            <div className="mt-3 grid gap-2">
              {pendingChores.map((chore, i) => (
                <button
                  key={i}
                  onClick={() => setChoreDone((d) => d.includes(i) ? d.filter((x) => x !== i) : [...d, i])}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${choreDone.includes(i) ? "border-[oklch(0.68_0.18_173)] bg-[oklch(0.68_0.18_173)] text-white" : "border-border"}`}>
                      {choreDone.includes(i) && <Check size={14} />}
                    </span>
                    <div>
                      <span className={`text-sm font-bold ${choreDone.includes(i) ? "line-through text-muted-foreground" : ""}`}>{chore.label}</span>
                      <span className="ml-2 rounded-full bg-[oklch(0.88_0.1_292)] px-2 py-0.5 text-[10px] font-black text-[oklch(0.36_0.18_292)]">
                        ΕΞΤΡΑ
                      </span>
                    </div>
                  </span>
                  <span className="text-sm font-black text-[oklch(0.55_0.18_37)]">+{chore.coins} 🪙</span>
                </button>
              ))}
            </div>
            {choreDone.length > 0 && (
              <Button className="mt-3 h-10 w-full rounded-full text-sm">
                Στείλε για έγκριση ({choreDone.length})
              </Button>
            )}
          </section>
        )}

        {/* Savings Goal */}
        <section className="mt-6 rounded-2xl bg-[oklch(0.76_0.15_173)] p-5 text-[oklch(0.17_0.065_195)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[oklch(0.35_0.12_175)]">Στόχος αποταμίευσης</p>
              <h2 className="mt-1 text-xl font-black">{savingsGoal.label}</h2>
            </div>
            <PiggyBank size={24} className="text-[oklch(0.35_0.12_175)]" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-3xl font-black">🪙 {savingsGoal.current}</p>
            <p className="pb-1 font-bold text-[oklch(0.35_0.12_175)]">από {savingsGoal.target}</p>
          </div>
          <Progress value={goalPercent} className="mt-2 h-3 bg-[oklch(0.95_0.08_105)]" />
          <p className="mt-2 text-sm font-bold">{goalPercent}% εκεί! Λείπουν {savingsGoal.target - savingsGoal.current} 🪙</p>
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/learn" className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.88_0.1_292)] p-5 transition-transform hover:-translate-y-0.5">
            <BookOpen size={22} className="text-primary" />
            <p className="font-black text-foreground">Μάθε</p>
            <p className="text-xs text-muted-foreground">6 μαθήματα · +XP</p>
          </Link>
          <Link to="/invest" className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.89_0.11_51)] p-5 transition-transform hover:-translate-y-0.5">
            <TrendingUp size={22} className="text-[oklch(0.55_0.18_37)]" />
            <p className="font-black text-foreground">Επένδυσε</p>
            <p className="text-xs text-muted-foreground">Μετοχές · Startups</p>
          </Link>
          <Link to="/spend" className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.86_0.09_214)] p-5 transition-transform hover:-translate-y-0.5">
            <Wallet size={22} className="text-[oklch(0.4_0.14_214)]" />
            <p className="font-black text-foreground">Πορτοφόλι</p>
            <p className="text-xs text-muted-foreground">Coins · Δουλειές</p>
          </Link>
          <Link to="/save" className="flex flex-col gap-2 rounded-2xl bg-[oklch(0.92_0.08_105)] p-5 transition-transform hover:-translate-y-0.5">
            <Target size={22} className="text-[oklch(0.45_0.15_142)]" />
            <p className="font-black text-foreground">Στόχοι</p>
            <p className="text-xs text-muted-foreground">Αποταμίευση</p>
          </Link>
        </section>

        {/* Achievements */}
        <section className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Επιτεύγματα</h2>
            <Trophy size={18} className="text-[oklch(0.7_0.2_60)]" />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {[
              { emoji: "🥇", label: "1ο Quiz", done: true },
              { emoji: "💰", label: "100 Coins", done: true },
              { emoji: "📈", label: "1η Επένδυση", done: false },
              { emoji: "🎯", label: "1ος Στόχος", done: false },
              { emoji: "🌟", label: "Lvl 5", done: false },
            ].map((badge) => (
              <div key={badge.label} className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3 ${badge.done ? "bg-[oklch(0.88_0.1_292)]" : "bg-secondary opacity-50"}`}>
                <span className="text-2xl">{badge.emoji}</span>
                <span className="text-[10px] font-black">{badge.label}</span>
                {badge.done && <Star size={10} className="text-[oklch(0.6_0.2_60)]" fill="oklch(0.6 0.2 60)" />}
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Πρόσφατη Δραστηριότητα</h2>
            <button className="flex items-center gap-1 text-xs font-bold text-muted-foreground">Όλα <ChevronRight size={14} /></button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.color}`}>
                    <Icon size={17} />
                  </span>
                  <p className="min-w-0 flex-1 text-sm font-bold leading-tight">{item.label}</p>
                  <div className="text-right">
                    <p className="text-sm font-black text-[oklch(0.55_0.18_37)]">{item.coins} 🪙</p>
                    <p className="text-xs font-bold text-[oklch(0.5_0.18_292)]">{item.xp} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-3 shadow-lg">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === "/child-dashboard";
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
