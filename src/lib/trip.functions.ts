import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGateway } from "./ai-gateway.server";
import type { TripInput, TripPlan } from "./types";

const PlanSchema = z.object({
  name: z.string(),
  theme: z.string(),
  totalBudget: z.number(),
  costPerPerson: z.number(),
  distanceKm: z.number(),
  travelTime: z.string(),
  bestTimeToLeave: z.string(),
  difficulty: z.string(),
  funScore: z.number(),
  itinerary: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  costs: z.object({
    travel: z.number(),
    food: z.number(),
    tickets: z.number(),
    shopping: z.number(),
    misc: z.number(),
  }),
  transportReason: z.string(),
  packingList: z.array(z.string()),
  tips: z.array(z.string()),
  alternatives: z.array(
    z.object({
      tier: z.string(),
      title: z.string(),
      costPerPerson: z.number(),
      description: z.string(),
      activities: z.array(z.string()),
      transport: z.string(),
      duration: z.string(),
    }),
  ),
});

const InputSchema = z.object({
  budget: z.number(),
  people: z.number(),
  location: z.string(),
  destination: z.string().optional(),
  date: z.string(),
  duration: z.string(),
  motives: z.array(z.string()),
  transport: z.string(),
  personality: z.string().optional(),
  preferences: z.string().optional(),
  surprise: z.boolean().optional(),
});

function buildPrompt(input: TripInput & { surprise?: boolean }) {
  if (input.surprise) {
    return `Generate a fun surprise outing near ${input.location || "the user"} for ${input.people} people today. Pick any vibe, budget around ₹1500/person. Be creative.`;
  }
  return `Plan a group outing in India.

Group: ${input.people} people from ${input.location}
Destination: ${input.destination || "AI's choice — pick something great nearby"}
Date: ${input.date}
Duration: ${input.duration}
Budget per person: ₹${input.budget}
Vibes wanted: ${input.motives.join(", ") || "any"}
Transport preference: ${input.transport}
Group personality: ${input.personality || "mixed"}
Extra preferences: ${input.preferences || "none"}

Be specific: real place names in India, realistic ₹ pricing, accurate travel times. Use Indian ₹ throughout. Time format like "08:00 AM". funScore is 1-10. tier in alternatives is exactly one of: "budget", "value", "premium" (one of each). 6-8 itinerary stops. 6-10 packing items. 3-5 tips.`;
}

export const generateTrip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<TripPlan> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGateway(key);
    const { object } = await generateObject({
      model: gateway("google/gemini-3-flash-preview"),
      schema: PlanSchema,
      
      prompt: buildPrompt(data),
      system:
        "You are TripBuddy AI, an expert at planning group outings in India. Output realistic, exciting, budget-aware plans with specific real-world venues. Always return valid JSON matching the requested schema exactly.",
    });

    return object as TripPlan;
  });
