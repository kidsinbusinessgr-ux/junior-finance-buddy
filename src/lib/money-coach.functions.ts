import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateMoneyCoaching } from "./money-coach.server";

const coachingInputSchema = z.object({
  childName: z.string().trim().min(1).max(60),
  spendingActivity: z.string().trim().min(10).max(2_000),
  savingsGoals: z.string().trim().min(5).max(1_000),
});

export const getMoneyCoaching = createServerFn({ method: "POST" })
  .inputValidator((data) => coachingInputSchema.parse(data))
  .handler(async ({ data }) => generateMoneyCoaching(data));