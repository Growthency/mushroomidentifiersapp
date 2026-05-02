/**
 * Anthropic client — vision-based mushroom identification + AI mycologist chat.
 *
 * SECURITY: every call routes through a Supabase Edge Function so the
 * Anthropic API key NEVER ships to the mobile bundle. Per-message credit
 * accounting also happens server-side, atomically, via consume_credits RPC.
 */

export type IdentificationAngle =
  | "cap"
  | "underside"
  | "stem"
  | "base"
  | "habitat"
  | "spore_print";

export type ScanInput = {
  images: { angle: IdentificationAngle; base64: string; mimeType?: string }[];
  notes?: string;
  location?: { lat: number; lon: number; placeName?: string } | null;
  habitat?: string;
  isPremium?: boolean;
};

export type SpeciesCandidate = {
  rank: number;
  scientificName: string;
  commonNames: string[];
  family?: string;
  confidence: number; // 0–1
  edibility:
    | "edible"
    | "edible_with_caution"
    | "inedible"
    | "poisonous"
    | "deadly"
    | "unknown";
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

/** Vision-based mushroom identification — calls the identify-mushroom edge fn. */
export async function identifyMushroom(
  input: ScanInput,
  _opts: { useDirect?: boolean } = {},
): Promise<IdentificationResult> {
  const { supabase } = await import("./supabase");
  const { data, error } = await supabase.functions.invoke("identify-mushroom", {
    body: input,
  });
  if (error) throw error;
  return data as IdentificationResult;
}

/** AI mycologist chat — calls the chat-mycologist edge fn. */
export async function chatWithMycologist(
  messages: { role: "user" | "assistant"; content: string }[],
  opts: { isPremium?: boolean; onDelta?: (text: string) => void } = {},
): Promise<string> {
  const onDelta = opts.onDelta;

  const { supabase } = await import("./supabase");
  const { data, error } = await supabase.functions.invoke("chat-mycologist", {
    body: { messages },
  });
  if (error) throw error;

  const final = (data as { text?: string } | null)?.text ?? "";

  // Client-side typewriter for nice UX (server returns full text in one shot).
  if (onDelta && final.length > 0) {
    const chunks = final.match(/.{1,6}/g) ?? [final];
    for (const chunk of chunks) {
      onDelta(chunk);
      await new Promise((resolve) => setTimeout(resolve, 12));
    }
  }

  return final;
}
