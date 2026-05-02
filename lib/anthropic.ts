/**
 * Anthropic Claude client — vision-based mushroom identification + chat assistant.
 *
 * SECURITY: in production, route requests through a Supabase Edge Function so
 * the API key never ships to the client. This file supports both modes via
 * `useDirect`. Default to direct calls only in dev.
 */
// Anthropic SDK is ~500KB minified — lazy load only when scan/chat actually happens.
import type Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";

let _Anthropic: typeof Anthropic | null = null;
async function loadAnthropic() {
  if (_Anthropic) return _Anthropic;
  const mod = await import("@anthropic-ai/sdk");
  _Anthropic = mod.default;
  return _Anthropic;
}

export type IdentificationAngle = "cap" | "underside" | "stem" | "base" | "habitat" | "spore_print";

export type ScanInput = {
  images: { angle: IdentificationAngle; base64: string; mimeType?: string }[];
  notes?: string;
  location?: { lat: number; lon: number; placeName?: string } | null;
  habitat?: string;
  isPremium?: boolean;
};

/** Pick model based on subscription tier — Haiku for free, Sonnet for paid. */
function pickModel(isPremium: boolean | undefined): string {
  return isPremium ? config.anthropic.modelPaid : config.anthropic.modelFree;
}

export type SpeciesCandidate = {
  rank: number;
  scientificName: string;
  commonNames: string[];
  family?: string;
  confidence: number; // 0–1
  edibility: "edible" | "edible_with_caution" | "inedible" | "poisonous" | "deadly" | "unknown";
  toxicityNotes?: string;
  keyFeatures: string[];
  distinguishingFromLookalikes?: string;
  habitatMatch?: string;
};

export type LookalikeWarning = {
  scientificName: string;
  commonName?: string;
  edibility: SpeciesCandidate["edibility"];
  whyConfusable: string;
};

export type IdentificationResult = {
  topMatch: SpeciesCandidate;
  candidates: SpeciesCandidate[];
  lookalikes: LookalikeWarning[];
  safetyVerdict: "safe_to_handle" | "caution" | "do_not_consume" | "do_not_touch";
  emergencyAdvice?: string;
  sporePrintGuidance?: string;
  confidenceOverall: number;
  rawNotes?: string;
};

const SYSTEM_PROMPT = `You are an expert mycologist assisting users of the MushroomIdentifiers app.
You analyze multi-angle photographs of fungi (cap, underside, stem, base, habitat, spore print) and produce a structured identification report.

Critical rules:
1. NEVER tell a user a wild mushroom is safe to eat. Always include a "do not consume based on photo alone — confirm with a local expert" caveat for any edible candidate.
2. If toxic or deadly lookalikes exist, name them explicitly and explain how to tell them apart.
3. If the photo is ambiguous or insufficient, say so and request a specific additional angle (e.g. "please photograph the underside showing the gills").
4. For each candidate provide: scientific name, common name(s), family, edibility class, key identifying features, and how it differs from common lookalikes.
5. Rank candidates by likelihood. Top match must include a confidence score 0–1.
6. Return ONLY a JSON object matching the schema given, no prose outside the JSON.

Edibility classes: edible, edible_with_caution, inedible, poisonous, deadly, unknown.
Safety verdicts: safe_to_handle, caution, do_not_consume, do_not_touch.`;

const RESPONSE_SCHEMA = `{
  "topMatch": {
    "rank": 1,
    "scientificName": "string",
    "commonNames": ["string"],
    "family": "string",
    "confidence": 0.0,
    "edibility": "edible|edible_with_caution|inedible|poisonous|deadly|unknown",
    "toxicityNotes": "string",
    "keyFeatures": ["string"],
    "distinguishingFromLookalikes": "string",
    "habitatMatch": "string"
  },
  "candidates": [ /* same shape, ranked 1..N */ ],
  "lookalikes": [
    {
      "scientificName": "string",
      "commonName": "string",
      "edibility": "...",
      "whyConfusable": "string"
    }
  ],
  "safetyVerdict": "safe_to_handle|caution|do_not_consume|do_not_touch",
  "emergencyAdvice": "string or null",
  "sporePrintGuidance": "string or null",
  "confidenceOverall": 0.0
}`;

async function getClient(): Promise<Anthropic> {
  if (!config.anthropic.apiKey) {
    throw new Error("Missing EXPO_PUBLIC_ANTHROPIC_API_KEY in .env");
  }
  const Cls = await loadAnthropic();
  return new Cls({
    apiKey: config.anthropic.apiKey,
    // Required for RN — disables Anthropic SDK's built-in browser warning
    dangerouslyAllowBrowser: true,
  });
}

/**
 * Server-routed call (recommended for production).
 * Hits a Supabase Edge Function that holds the Anthropic key server-side.
 */
async function identifyViaEdgeFunction(input: ScanInput): Promise<IdentificationResult> {
  const { supabase } = await import("./supabase");
  const { data, error } = await supabase.functions.invoke("identify-mushroom", {
    body: input,
  });
  if (error) throw error;
  return data as IdentificationResult;
}

/**
 * Direct client → Anthropic call (dev / quick prototyping only).
 */
async function identifyDirect(input: ScanInput): Promise<IdentificationResult> {
  const client = await getClient();

  const userContext = [
    input.notes ? `User notes: ${input.notes}` : null,
    input.habitat ? `Habitat: ${input.habitat}` : null,
    input.location
      ? `Location: lat ${input.location.lat.toFixed(4)}, lon ${input.location.lon.toFixed(4)}${
          input.location.placeName ? ` (${input.location.placeName})` : ""
        }`
      : null,
    `Images attached, in this order: ${input.images.map((i) => i.angle).join(", ")}.`,
    `Return JSON matching this schema exactly: ${RESPONSE_SCHEMA}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: pickModel(input.isPremium),
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...input.images.map((img) => ({
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: (img.mimeType ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: img.base64,
            },
          })),
          { type: "text" as const, text: userContext },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic returned no text block");
  }
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Anthropic response did not contain JSON");
  }
  return JSON.parse(jsonMatch[0]) as IdentificationResult;
}

export async function identifyMushroom(
  input: ScanInput,
  opts: { useDirect?: boolean } = {},
): Promise<IdentificationResult> {
  const useDirect = opts.useDirect ?? __DEV__;
  return useDirect ? identifyDirect(input) : identifyViaEdgeFunction(input);
}

/**
 * Streaming chat with the AI mycologist assistant.
 */
export async function chatWithMycologist(
  messages: { role: "user" | "assistant"; content: string }[],
  opts: { isPremium?: boolean; onDelta?: (text: string) => void } = {},
): Promise<string> {
  const client = await getClient();
  const onDelta = opts.onDelta;
  let final = "";
  const stream = client.messages.stream({
    model: pickModel(opts.isPremium),
    max_tokens: 1024,
    system:
      "You are a friendly expert mycologist for the MushroomIdentifiers app. Help users with foraging questions, mushroom biology, recipes, safety, and habitat tips. Always emphasize that no app should be the sole basis for consuming a wild mushroom — defer to local experts.",
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      final += event.delta.text;
      onDelta?.(event.delta.text);
    }
  }

  return final;
}
