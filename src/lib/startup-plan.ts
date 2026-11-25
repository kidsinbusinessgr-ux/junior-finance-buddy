import { z } from "zod";

// The startup's business plan, from the Kids in Business workbook: competitors
// and USP, the costing with break-even, and the founder's ad. Stored as JSON
// in startups.plan and written only by the server (saveStartupPlan).

const text = (max: number) => z.string().trim().max(max);
const euros = z.number().finite().min(0).max(100000);

export const costItemSchema = z.object({ name: text(40), eur: euros });
export type CostItem = z.infer<typeof costItemSchema>;

export const costingSchema = z.object({
  unit: text(30), // what one sale is: «cupcake», «βόλτα», «μπλουζάκι»
  price: euros,
  fixed: z.array(costItemSchema).max(12), // paid once: equipment, tools
  variable: z.array(costItemSchema).max(12), // paid for every piece: materials
  expected: z.number().int().min(0).max(100000), // how many the founder hopes to sell
});
export type Costing = z.infer<typeof costingSchema>;

export const AD_FORMATS = ["poster", "post", "story"] as const;
export const adSchema = z.object({
  format: z.enum(AD_FORMATS),
  headline: text(50),
  text: text(140),
  cta: text(30),
  where: text(60),
  showPrice: z.boolean(),
  showImage: z.boolean(),
  theme: z.number().int().min(0).max(5),
});
export type AdDesign = z.infer<typeof adSchema>;

export const ideaSchema = z.object({ competitors: text(300), usp: text(300) });

export type StartupPlan = {
  competitors?: string;
  usp?: string;
  costing?: Costing;
  ad?: AdDesign;
};

// What the page reads from the database, cleaned: unknown or broken parts are dropped.
export function readPlan(raw: unknown): StartupPlan {
  const p = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: StartupPlan = {};
  if (typeof p.competitors === "string") out.competitors = p.competitors;
  if (typeof p.usp === "string") out.usp = p.usp;
  const c = costingSchema.safeParse(p.costing);
  if (c.success) out.costing = c.data;
  const a = adSchema.safeParse(p.ad);
  if (a.success) out.ad = a.data;
  return out;
}

// ── Money maths ──────────────────────────────────────────────────────────────

const sum = (items: CostItem[]) => items.reduce((s, i) => s + (Number.isFinite(i.eur) ? i.eur : 0), 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

export type CostingResult = {
  fixedTotal: number; // € paid once
  unitCost: number; // € for every piece
  profitPerUnit: number; // price − unit cost
  breakEven: number | null; // pieces to sell to get the money back; null if every sale loses money
  expectedProfit: number; // profit if the founder sells `expected` pieces
};

export function costingResult(c: Costing): CostingResult {
  const fixedTotal = round2(sum(c.fixed));
  const unitCost = round2(sum(c.variable));
  const profitPerUnit = round2(c.price - unitCost);
  const breakEven = profitPerUnit > 0 ? Math.ceil(fixedTotal / profitPerUnit - 1e-9) : null;
  const expectedProfit = round2(c.expected * profitPerUnit - fixedTotal);
  return { fixedTotal, unitCost, profitPerUnit, breakEven, expectedProfit };
}

export function euro(n: number) {
  return "€" + n.toLocaleString("el-GR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

// ── Examples and inspiration (from the workbook) ─────────────────────────────

export const EXAMPLE_COSTING: Costing = {
  unit: "cupcake",
  price: 2,
  fixed: [
    { name: "Φόρμα για cupcakes", eur: 12 },
    { name: "Κορνέ ζαχαροπλαστικής", eur: 6 },
    { name: "Αυτοκόλλητα με το λογότυπο", eur: 8 },
  ],
  variable: [
    { name: "Υλικά (αλεύρι, αυγά, βούτυρο)", eur: 0.45 },
    { name: "Χάρτινη θήκη", eur: 0.1 },
    { name: "Κουτάκι", eur: 0.25 },
  ],
  expected: 40,
};

export const IDEA_SPARKS = [
  { emoji: "🧁", title: "Γλυκά και cupcakes", text: "Ψήνεις και πουλάς σε γείτονες, φίλους ή σε μια σχολική εκδήλωση." },
  { emoji: "🎨", title: "Τέχνη και χειροτεχνία", text: "Βραχιόλια, πίνακες, διακοσμημένες κορνίζες, σε εκθέσεις ή online." },
  { emoji: "🖌️", title: "Ψηφιακά σχέδια", text: "Σχεδιάζεις στο τάμπλετ και πουλάς clip art ή αυτοκόλλητα." },
  { emoji: "♻️", title: "Μεταπώληση", text: "Βρίσκεις πράγματα που δε χρειάζεστε και τα πουλάς στο Vinted, με τη βοήθεια ενός ενήλικα." },
  { emoji: "🧼", title: "Φυσικά καλλυντικά", text: "Βάλσαμα χειλιών, σαπούνια, άλατα μπάνιου για δώρα." },
  { emoji: "👕", title: "T-shirt design", text: "Τυπώνεις τα δικά σου σχέδια σε απλά μπλουζάκια." },
  { emoji: "🎁", title: "Χειροποίητα δώρα", text: "Μπρελόκ, σημειωματάρια και ό,τι άλλο αρέσει στους φίλους σου." },
  { emoji: "🚗", title: "Πλύσιμο αυτοκινήτων", text: "Μια υπηρεσία για τους γείτονες, με νερό, σαπούνι και σφουγγάρι." },
  { emoji: "🐕", title: "Βόλτα σκύλων", text: "Αν αγαπάς τα ζώα, προσέχεις κατοικίδια όταν λείπουν οι ιδιοκτήτες τους." },
];

export const AD_THEMES = [
  { name: "Ροζ", bg: "#fff1f5", accent: "#f2709c", ink: "#3a2f2a", band: ["#f7a35c", "#f2709c"] },
  { name: "Μωβ", bg: "#f4f0ff", accent: "#7c4dff", ink: "#251d40", band: ["#9b85c9", "#7c4dff"] },
  { name: "Πράσινο", bg: "#effaf4", accent: "#1f9d6b", ink: "#17332a", band: ["#4fb1c7", "#1f9d6b"] },
  { name: "Ήλιος", bg: "#fff8e6", accent: "#f08a1c", ink: "#3d2a10", band: ["#f2c516", "#f08a1c"] },
  { name: "Θάλασσα", bg: "#eef6ff", accent: "#2f6fd6", ink: "#14284a", band: ["#76a3e0", "#2f6fd6"] },
  { name: "Νύχτα", bg: "#1d1b2e", accent: "#f2c516", ink: "#ffffff", band: ["#3a3560", "#1d1b2e"] },
];
