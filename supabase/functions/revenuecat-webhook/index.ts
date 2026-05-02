// RevenueCat → Supabase webhook.
// Grants monthly credits when a subscription renews / starts.
//
// Deploy:   supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secret:   supabase secrets set REVENUECAT_WEBHOOK_AUTH=<your-shared-secret>
//
// In RevenueCat dashboard:
//   Project Settings → Integrations → Webhooks → Add new
//   URL: https://<your-supabase-ref>.supabase.co/functions/v1/revenuecat-webhook
//   Authorization header: Bearer <REVENUECAT_WEBHOOK_AUTH>
//   Events: INITIAL_PURCHASE, RENEWAL, PRODUCT_CHANGE, NON_RENEWING_PURCHASE

// @ts-expect-error — Deno-only import resolved at runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error — Deno-only import resolved at runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

// @ts-expect-error — Deno global
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-expect-error — Deno global
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// @ts-expect-error — Deno global
const SHARED_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_AUTH")!;

// 4-tier structure:
// Explorer: $4.99/mo — 200 credits, Haiku 4.5
// Pro:      $9.99/mo — 600 credits, Sonnet 4.6
// Yearly:   $39.99/yr — 600 credits/cycle, Sonnet 4.6
// Lifetime: $99 once  — 1000 credits/cycle forever, Sonnet 4.6
const TIER_CREDITS: Record<string, number> = {
  explorer: 200,
  explorer_monthly: 200,
  pro: 600,
  pro_monthly: 600,
  yearly: 600,
  pro_yearly: 600,
  lifetime: 1000,
  pro_lifetime: 1000,
};

const TIER_NAME: Record<string, "explorer" | "pro" | "yearly" | "lifetime"> = {
  explorer: "explorer",
  explorer_monthly: "explorer",
  pro: "pro",
  pro_monthly: "pro",
  yearly: "yearly",
  pro_yearly: "yearly",
  lifetime: "lifetime",
  pro_lifetime: "lifetime",
};

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${SHARED_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as {
    event: {
      type: string;
      app_user_id: string;
      product_id: string;
      original_app_user_id?: string;
      period_type?: string;
    };
  };
  const evt = payload.event;

  const eligible = ["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"];
  if (!eligible.includes(evt.type)) {
    return new Response(JSON.stringify({ ignored: evt.type }), { status: 200 });
  }

  const credits = TIER_CREDITS[evt.product_id];
  const tier = TIER_NAME[evt.product_id];
  if (!credits || !tier) {
    return new Response(JSON.stringify({ unknown_product: evt.product_id }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error: rpcErr } = await supabase.rpc("grant_monthly_credits", {
    p_user_id: evt.app_user_id,
    p_amount: credits,
  });
  if (rpcErr) {
    return new Response(JSON.stringify({ error: rpcErr.message }), { status: 500 });
  }

  await supabase.from("profiles").update({ tier }).eq("id", evt.app_user_id);

  return new Response(JSON.stringify({ ok: true, granted: credits, tier }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
