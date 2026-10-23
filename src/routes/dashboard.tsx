import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, CalendarClock, ChevronRight, CircleDollarSign, Gift, LoaderCircle, MessageCircleHeart, Plus, ReceiptText, ShieldCheck, Target, TrendingUp, WalletCards } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMoneyCoaching } from "@/lib/money-coach.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Parent dashboard — Brightly" },
      { name: "description", content: "A clear view of your child’s allowance, recent spending, and saving goals in Brightly." },
      { property: "og:title", content: "Parent dashboard — Brightly" },
      { property: "og:description", content: "A clear view of your child’s allowance, recent spending, and saving goals in Brightly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParentDashboard,
});

const spending = [
  { name: "Corner Shop", detail: "Today · Snacks", amount: "−£2.35", tone: "bg-secondary", icon: ReceiptText },
  { name: "Game Planet", detail: "Yesterday · Games", amount: "−£4.99", tone: "bg-[oklch(0.89_0.11_51)]", icon: Gift },
  { name: "Bus fare", detail: "Mon · Travel", amount: "−£1.80", tone: "bg-[oklch(0.86_0.09_214)]", icon: WalletCards },
];

function ParentDashboard() {
  const [allowance, setAllowance] = useState(8);
  const [addedAllowance, setAddedAllowance] = useState(0);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleFrequency, setScheduleFrequency] = useState<"weekly" | "monthly">("weekly");
  const [weeklyDay, setWeeklyDay] = useState("Friday");
  const [monthlyDay, setMonthlyDay] = useState("1");
  const [goalBoost, setGoalBoost] = useState(0);
  const balance = 16.42 + addedAllowance;
  const saved = 21 + goalBoost;
  const goal = 48;
  const goalProgress = Math.min(Math.round((saved / goal) * 100), 100);
  const remaining = Math.max(goal - saved, 0);
  const allowanceSummary = useMemo(() => {
    if (!scheduleEnabled) return "Schedule paused";
    if (scheduleFrequency === "monthly") return `£${allowance}.00 on the ${monthlyDay}${monthlyDay === "1" ? "st" : "th"} of each month`;
    return `£${allowance}.00 every ${weeklyDay}`;
  }, [allowance, monthlyDay, scheduleEnabled, scheduleFrequency, weeklyDay]);
  const getCoaching = useServerFn(getMoneyCoaching);
  const [spendingActivity, setSpendingActivity] = useState("Corner Shop £2.35 for snacks; Game Planet £4.99 for a game; Bus fare £1.80.");
  const [savingsGoals, setSavingsGoals] = useState("Roller skates: £21 saved of a £48 goal. Maya hopes to buy them in the next two months.");
  const [coaching, setCoaching] = useState("");
  const [coachingError, setCoachingError] = useState("");
  const [isCoaching, setIsCoaching] = useState(false);

  async function handleGetCoaching() {
    setIsCoaching(true);
    setCoachingError("");
    try {
      const response = await getCoaching({
        data: { childName: "Maya", spendingActivity, savingsGoals },
      });
      setCoaching(response.suggestion);
    } catch (error) {
      setCoachingError(error instanceof Error ? error.message : "We could not create coaching suggestions right now. Please try again later.");
    } finally {
      setIsCoaching(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-primary px-5 pb-14 pt-5 text-primary-foreground sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav />
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[oklch(0.86_0.1_292)]">Parent dashboard</p>
              <h1 className="mt-3 text-4xl font-black sm:text-5xl">Good morning, Sam.</h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[oklch(0.95_0.02_292)]">Maya’s money picture, at a glance.</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[oklch(0.65_0.17_292)] bg-[oklch(0.36_0.13_292)] px-4 py-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground font-black">M</span>
              <div><p className="font-black">Maya</p><p className="text-sm text-[oklch(0.9_0.05_292)]">Child account</p></div>
              <ChevronRight className="ml-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-muted-foreground">Available to spend</p><p className="mt-2 text-3xl font-black">£{balance.toFixed(2)}</p></div><span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-secondary-foreground"><WalletCards /></span></div>
              <p className="mt-5 text-sm text-muted-foreground">Card is ready to use</p>
            </article>
            <article className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-muted-foreground">Saved this month</p><p className="mt-2 text-3xl font-black">£{saved.toFixed(2)}</p></div><span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground"><TrendingUp /></span></div>
              <p className="mt-5 text-sm text-muted-foreground">{goalProgress}% towards Roller skates</p>
            </article>
            <article className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-muted-foreground">Spent this week</p><p className="mt-2 text-3xl font-black">£9.14</p></div><span className="grid h-11 w-11 place-items-center rounded-full bg-[oklch(0.89_0.11_51)] text-foreground"><CircleDollarSign /></span></div>
              <p className="mt-5 text-sm text-muted-foreground">3 purchases so far</p>
            </article>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <section aria-labelledby="allowance-heading" className="rounded-lg bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.13em] text-muted-foreground">Allowance</p><h2 id="allowance-heading" className="mt-2 text-2xl font-black">A little independence, every week.</h2></div><span className="grid h-11 w-11 place-items-center rounded-full bg-secondary"><Gift /></span></div>
                <div className="mt-7 rounded-lg bg-secondary p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-muted-foreground">Allowance amount</p><p className="mt-1 text-3xl font-black">£{allowance}.00</p><p className="mt-1 text-sm text-muted-foreground">{allowanceSummary}</p></div><Button onClick={() => setAddedAllowance((amount) => amount + allowance)} className="h-11 rounded-full px-5"><Plus /> Send now</Button></div>
                  <label htmlFor="allowance" className="mt-6 flex justify-between text-sm font-bold"><span>Allowance amount</span><span>£{allowance}.00</span></label><input id="allowance" aria-label="Allowance amount" type="range" min="2" max="15" step="1" value={allowance} onChange={(event) => setAllowance(Number(event.target.value))} className="mt-3 w-full accent-primary" />
                  <div className="mt-6 border-t border-border pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-background"><CalendarClock size={19} /></span><div><p className="font-black">Automatic allowance</p><p className="text-sm text-muted-foreground">{scheduleEnabled ? "Scheduled payments are on" : "No payment will be sent automatically"}</p></div></div><Button type="button" variant={scheduleEnabled ? "default" : "outline"} size="sm" aria-pressed={scheduleEnabled} onClick={() => setScheduleEnabled((enabled) => !enabled)}>{scheduleEnabled ? "On" : "Off"}</Button></div>
                    {scheduleEnabled ? <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-sm font-bold">How often</p><div className="mt-2 grid grid-cols-2 gap-2"><Button type="button" variant={scheduleFrequency === "weekly" ? "default" : "outline"} aria-pressed={scheduleFrequency === "weekly"} onClick={() => setScheduleFrequency("weekly")}>Weekly</Button><Button type="button" variant={scheduleFrequency === "monthly" ? "default" : "outline"} aria-pressed={scheduleFrequency === "monthly"} onClick={() => setScheduleFrequency("monthly")}>Monthly</Button></div></div><label className="grid gap-2 text-sm font-bold" htmlFor="schedule-day"><span>{scheduleFrequency === "weekly" ? "Payment day" : "Payment date"}</span><select id="schedule-day" value={scheduleFrequency === "weekly" ? weeklyDay : monthlyDay} onChange={(event) => scheduleFrequency === "weekly" ? setWeeklyDay(event.target.value) : setMonthlyDay(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">{scheduleFrequency === "weekly" ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <option key={day} value={day}>{day}</option>) : ["1", "5", "10", "15", "20", "25"].map((day) => <option key={day} value={day}>{day}{day === "1" ? "st" : "th"}</option>)}</select></label></div> : null}
                  </div>
                </div>
              </section>

              <section aria-labelledby="spending-heading" className="rounded-lg bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.13em] text-muted-foreground">Recent activity</p><h2 id="spending-heading" className="mt-2 text-2xl font-black">Spending, clearly seen.</h2></div><Button variant="ghost" size="sm" className="font-bold">See all <ArrowUpRight /></Button></div>
                <div className="mt-5 divide-y divide-border">{spending.map((item) => { const Icon = item.icon; return <div key={item.name} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"><span className={`grid h-11 w-11 place-items-center rounded-full ${item.tone}`}><Icon size={19} /></span><div className="min-w-0 flex-1"><p className="font-black">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></div><p className="font-black">{item.amount}</p></div>})}</div>
              </section>
            </div>

            <aside className="space-y-8">
              <section aria-labelledby="goal-heading" className="rounded-lg bg-[oklch(0.76_0.15_173)] p-6 text-[oklch(0.17_0.065_195)] shadow-sm sm:p-7">
                <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.13em] text-[oklch(0.35_0.12_175)]">Savings goal</p><h2 id="goal-heading" className="mt-2 text-2xl font-black">Roller skates</h2></div><span className="grid h-11 w-11 place-items-center rounded-full bg-[oklch(0.95_0.08_105)]"><Target /></span></div>
                <div className="mt-8 flex items-end justify-between"><p className="text-4xl font-black">£{saved.toFixed(2)}</p><p className="pb-1 font-bold">of £{goal}.00</p></div><div className="mt-3 h-4 overflow-hidden rounded-full bg-[oklch(0.95_0.08_105)]"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goalProgress}%` }} /></div><p className="mt-3 text-sm font-bold">£{remaining.toFixed(2)} to go</p><Button onClick={() => setGoalBoost((amount) => Math.min(amount + 5, goal - 21))} variant="secondary" className="mt-7 h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"><Plus /> Add £5 to goal</Button></section>

              <section className="rounded-lg bg-card p-6 shadow-sm ring-1 ring-border sm:p-7"><div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary"><ShieldCheck /></span><div><p className="font-black">Everything looks good</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Maya’s card is active and there are no unusual spending alerts.</p></div></div><Button variant="ghost" className="mt-5 w-full justify-between border border-border">Card settings <ChevronRight /></Button></section>
              <section aria-labelledby="coach-heading" className="rounded-lg bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary"><MessageCircleHeart /></span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.13em] text-muted-foreground">Brightly Coach</p>
                    <h2 id="coach-heading" className="mt-1 text-2xl font-black">A helpful next conversation.</h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-bold" htmlFor="coaching-spending">Recent spending activity
                    <Textarea id="coaching-spending" value={spendingActivity} onChange={(event) => setSpendingActivity(event.target.value)} className="min-h-24 resize-y bg-background text-sm font-medium" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold" htmlFor="coaching-goals">Savings goals
                    <Textarea id="coaching-goals" value={savingsGoals} onChange={(event) => setSavingsGoals(event.target.value)} className="min-h-24 resize-y bg-background text-sm font-medium" />
                  </label>
                </div>
                <Button onClick={handleGetCoaching} disabled={isCoaching || spendingActivity.trim().length < 10 || savingsGoals.trim().length < 5} className="mt-5 h-11 w-full rounded-full">
                  {isCoaching ? <LoaderCircle className="animate-spin" /> : <MessageCircleHeart />}
                  {isCoaching ? "Creating suggestions" : "Get coaching suggestions"}
                </Button>
                {coachingError ? <p role="alert" className="mt-4 text-sm font-bold text-destructive">{coachingError}</p> : null}
                {coaching ? <div aria-live="polite" className="mt-5 whitespace-pre-line rounded-lg bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">{coaching}</div> : null}
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}