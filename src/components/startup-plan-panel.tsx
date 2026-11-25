import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StartupDrawing } from "@/components/startup-drawing";
import { StartupCosting } from "@/components/startup-costing";
import { StartupAd } from "@/components/startup-ad";
import { StartupAction } from "@/components/startup-action";
import { readPlan, type StartupPlan } from "@/lib/startup-plan";

// Phases 2 and 3 of the business plan, for the founder on their startup's
// page: draw the product, cost it with break-even, make the ad. Each tab
// saves on its own, so the founder can stop and come back another day.

export type PlanStartup = {
  id: string;
  name: string;
  emoji: string;
  solution: string;
  customer: string;
  model: string;
  image_url: string | null;
  plan: unknown;
};

type PlanTab = "draw" | "costing" | "ad" | "action";

export function FounderPlan<S extends PlanStartup>({ startup, onChange }: { startup: S; onChange: (s: S) => void }) {
  const plan = readPlan(startup.plan);
  const done: Record<PlanTab, boolean> = {
    draw: Boolean(startup.image_url),
    costing: Boolean(plan.costing),
    ad: Boolean(plan.ad),
    action: Boolean(plan.action?.days.some((d) => d.text.trim())),
  };
  const [tab, setTab] = useState<PlanTab>(() => (!done.draw ? "draw" : !done.costing ? "costing" : !done.ad ? "ad" : "action"));
  const [drawingOpen, setDrawingOpen] = useState(false);
  const savePlan = (next: StartupPlan) => onChange({ ...startup, plan: next });
  const tabs: { key: PlanTab; label: string; phase: string }[] = [
    { key: "draw", label: "🎨 Σχεδίασε", phase: "Φάση 2" },
    { key: "costing", label: "🧮 Κοστολόγηση", phase: "Φάση 2" },
    { key: "ad", label: "📣 Διαφήμιση", phase: "Φάση 3" },
    { key: "action", label: "🗓️ Δράση", phase: "Φάση 3" },
  ];
  const count = Object.values(done).filter(Boolean).length;
  const info = { name: startup.name, emoji: startup.emoji, imageUrl: startup.image_url, costing: plan.costing, usp: plan.usp };

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Το business plan μου</p>
          <h2 className="text-2xl font-black">Συνέχισε το σχέδιό σου</h2>
        </div>
        <p className="text-sm font-bold text-muted-foreground">Η ιδέα ✓ · {count} από 4 βήματα έτοιμα</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-2xl border-2 px-2 py-3 text-center transition-colors ${tab === t.key ? "border-[oklch(0.57_0.23_292)] bg-[oklch(0.97_0.03_292)]" : "border-border hover:bg-muted/50"}`}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t.phase}</span>
            <span className="mt-0.5 block text-sm font-black sm:text-base">{t.label}</span>
            <span className={`mt-1 block text-xs font-bold ${done[t.key] ? "text-[oklch(0.5_0.15_160)]" : "text-muted-foreground"}`}>
              {done[t.key] ? "✓ Έτοιμο" : "Να γίνει"}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "draw" &&
          (drawingOpen || !startup.image_url ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Σχεδίασε το προϊόν σου ή το λογότυπο της εταιρείας σου. Θα το δουν όλοι και θα μπει και στη διαφήμιση.
              </p>
              <StartupDrawing
                startupId={startup.id}
                imageUrl={startup.image_url}
                onSaved={(url) => {
                  onChange({ ...startup, image_url: url });
                  setDrawingOpen(false);
                  setTab("costing");
                }}
                onClose={() => setDrawingOpen(false)}
              />
            </div>
          ) : (
            <div className="text-center">
              <img
                src={startup.image_url}
                alt={`Ζωγραφιά του προϊόντος ${startup.name}`}
                className="mx-auto aspect-[4/3] w-full max-w-sm rounded-2xl border bg-white object-contain"
              />
              <Button variant="outline" className="mt-4 rounded-full font-bold" onClick={() => setDrawingOpen(true)}>
                🎨 Άλλαξε τη ζωγραφιά
              </Button>
            </div>
          ))}
        {tab === "costing" && (
          <StartupCosting startupId={startup.id} initial={plan.costing} onSaved={(costing) => savePlan({ ...plan, costing })} />
        )}
        {tab === "ad" && <StartupAd startupId={startup.id} info={info} initial={plan.ad} onSaved={(ad) => savePlan({ ...plan, ad })} />}
        {tab === "action" && (
          <StartupAction
            startupId={startup.id}
            info={{ name: startup.name, solution: startup.solution, customer: startup.customer, model: startup.model, plan }}
            initial={plan.action}
            onSaved={(action) => savePlan({ ...plan, action })}
          />
        )}
      </div>
    </div>
  );
}
