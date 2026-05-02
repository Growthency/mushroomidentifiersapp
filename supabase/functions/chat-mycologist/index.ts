// Supabase Edge Function — server-side proxy for the AI Mycologist chat.
// Keeps the Anthropic API key off every mobile client and atomically debits
// 5 credits per question for free-tier users.
//
// Deploy:  supabase functions deploy chat-mycologist
// Secrets:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase secrets set ANTHROPIC_MODEL_FREE=claude-haiku-4-5-20251001
//   supabase secrets set ANTHROPIC_MODEL_PAID=claude-sonnet-4-6

// @ts-expect-error — Deno-only import resolved at runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error — Deno-only
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";
// @ts-expect-error — Deno-only
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";

// @ts-expect-error — Deno globals
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
// @ts-expect-error
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-expect-error
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// @ts-expect-error
const MODEL_FREE = Deno.env.get("ANTHROPIC_MODEL_FREE") ?? "claude-haiku-4-5-20251001";
// @ts-expect-error
const MODEL_PAID = Deno.env.get("ANTHROPIC_MODEL_PAID") ?? "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a friendly expert mycologist for the Mushroom Identifiers app.
Help users with foraging questions, mushroom biology, recipes, safety, and habitat tips.
Always emphasise that no app should be the sole basis for consuming a wild mushroom — defer to local experts.`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  try {
    const auth = req.headers.get("authorization");
    if (!auth) return json({ error: "missing auth" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    const body = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
    };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: "no messages" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await admin
      .from("profiles")
      .select("tier")
      .eq("id", userId)
      .single();
    const isPremium = !!(profile?.tier && profile.tier !== "free");

    if (!isPremium) {
      const { data: debit, error: debitErr } = await admin.rpc("consume_credits", {
        p_user_id: userId,
        p_amount: 5,
      });
      if (debitErr) return json({ error: debitErr.message }, 500);
      if (!debit?.success) return json({ error: "insufficient_credits" }, 402);
    }

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY! });
    const resp = await anthropic.messages.create({
      model: isPremium ? MODEL_PAID : MODEL_FREE,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: body.messages,
    });

    const textBlock = resp.content.find((b: { type: string }) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    return json({ text: textBlock?.text ?? "" }, 200);
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
