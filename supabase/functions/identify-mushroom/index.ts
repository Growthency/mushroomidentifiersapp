// Supabase Edge Function — server-side proxy for Anthropic identification calls.
// Deploy with:  supabase functions deploy identify-mushroom --no-verify-jwt=false
// Set secret:   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Why server-side? Keeps the Anthropic key off the mobile client and lets us
// rate-limit per user / debit credits atomically.

// @ts-expect-error — Deno-only import resolved in Supabase Edge runtime.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error — Deno-only import resolved in Supabase Edge runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";
// @ts-expect-error — Deno-only import resolved in Supabase Edge runtime.
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";

// @ts-expect-error — Deno global available at runtime
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
// @ts-expect-error — Deno global
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-expect-error — Deno global
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// @ts-expect-error — Deno global
const MODEL_FREE = Deno.env.get("ANTHROPIC_MODEL_FREE") ?? "claude-haiku-4-5-20251001";
// @ts-expect-error — Deno global
const MODEL_PAID = Deno.env.get("ANTHROPIC_MODEL_PAID") ?? "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert mycologist for the MushroomIdentifiers app.
Analyze multi-angle photos and return a structured JSON identification.
Critical: never tell a user a wild mushroom is safe to eat — always include the
"do not consume based on photo alone — confirm with a local expert" caveat.
Name dangerous lookalikes explicitly. Return ONLY JSON.`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("authorization");
    if (!auth) return json({ error: "missing auth" }, 401);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      global: { headers: { Authorization: auth } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    // Look up tier to choose model — paid users get the better Sonnet 4.6
    const adminClientForTier = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profile } = await adminClientForTier
      .from("profiles")
      .select("tier")
      .eq("id", userId)
      .single();
    const isPremium = profile?.tier && profile.tier !== "free";
    const model = isPremium ? MODEL_PAID : MODEL_FREE;

    const body = await req.json();
    const { images, notes, location, habitat } = body as {
      images: { angle: string; base64: string; mimeType?: string }[];
      notes?: string;
      location?: { lat: number; lon: number; placeName?: string };
      habitat?: string;
    };

    if (!images?.length) return json({ error: "no images" }, 400);

    // ---- debit credits atomically ----
    const adminClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: debit, error: debitErr } = await adminClient.rpc("consume_credits", {
      p_user_id: userId,
      p_amount: 10,
    });
    if (debitErr) return json({ error: debitErr.message }, 500);
    if (!debit?.success) return json({ error: "insufficient_credits" }, 402);

    // ---- call Anthropic ----
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY! });
    const userText = [
      notes ? `User notes: ${notes}` : null,
      habitat ? `Habitat: ${habitat}` : null,
      location
        ? `Location: lat ${location.lat}, lon ${location.lon}${location.placeName ? ` (${location.placeName})` : ""}`
        : null,
      `Images attached (in order): ${images.map((i) => i.angle).join(", ")}`,
      "Return JSON: { topMatch, candidates, lookalikes, safetyVerdict, emergencyAdvice, sporePrintGuidance, confidenceOverall }",
    ]
      .filter(Boolean)
      .join("\n");

    const resp = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...images.map((img) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: img.mimeType ?? "image/jpeg", data: img.base64 },
            })),
            { type: "text" as const, text: userText },
          ],
        },
      ],
    });

    const textBlock = resp.content.find((b: { type: string }) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    if (!textBlock) return json({ error: "no_response" }, 500);
    const m = textBlock.text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: "invalid_response" }, 500);
    const parsed = JSON.parse(m[0]);

    return json(parsed, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
