import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./ai-run-id.server";

type CoachingInput = {
  childName: string;
  spendingActivity: string;
  savingsGoals: string;
};

export async function generateMoneyCoaching(input: CoachingInput) {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  if (!lovableApiKey) {
    throw new Error("Lovable AI is not configured yet. Please try again shortly.");
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: lovableApiKey,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: [
      "You are Brightly Coach, a supportive youth money-coaching assistant for parents.",
      "Give practical, positive, age-appropriate suggestions based only on the details provided.",
      "Never shame the child, diagnose behaviour, recommend financial products, or give regulated financial advice.",
      "Do not make assumptions or invent transactions. Keep the response under 150 words.",
      "Use three concise bullets headed: Notice, Try next, Talk about.",
    ].join(" "),
    prompt: `Child: ${input.childName}\n\nRecent spending activity:\n${input.spendingActivity}\n\nSavings goals:\n${input.savingsGoals}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const suggestion = (await result.text).trim();
  if (!suggestion) {
    throw new Error("Lovable AI did not return coaching suggestions. Please try again with a little more detail.");
  }

  return { suggestion };
}