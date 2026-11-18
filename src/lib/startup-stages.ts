// Company stages by valuation (phase 4 adds badges for reaching them).
export const STARTUP_STAGES = [
  { min: 0, name: "Ιδέα", emoji: "💡" },
  { min: 1000, name: "Πρωτότυπο", emoji: "🛠️" },
  { min: 2500, name: "Λανσάρισμα", emoji: "🚀" },
  { min: 6000, name: "Ανάπτυξη", emoji: "📈" },
  { min: 15000, name: "Μονόκερος", emoji: "🦄" },
] as const;

export function stageFor(valuation: number) {
  let stage: (typeof STARTUP_STAGES)[number] = STARTUP_STAGES[0];
  for (const s of STARTUP_STAGES) if (valuation >= s.min) stage = s;
  const next = STARTUP_STAGES.find((s) => s.min > valuation) ?? null;
  return { stage, next };
}
