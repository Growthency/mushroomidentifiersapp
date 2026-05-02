/**
 * Credit accounting — mirrors the website's credit system.
 * 10 credits = 1 identification (configurable via env).
 */
import { supabase } from "./supabase";
import { config } from "./config";

export type CreditBalance = {
  total: number;
  monthly: number; // current cycle remaining
  lifetime: number; // free lifetime credits remaining
  canIdentify: boolean;
  cycleRefreshAt: string | null;
};

export async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const { data, error } = await supabase
    .from("user_credits")
    .select("monthly_remaining, lifetime_remaining, cycle_refresh_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return {
      total: config.credits.freeLifetime,
      monthly: 0,
      lifetime: config.credits.freeLifetime,
      canIdentify: true,
      cycleRefreshAt: null,
    };
  }

  const monthly = data.monthly_remaining ?? 0;
  const lifetime = data.lifetime_remaining ?? 0;
  const total = monthly + lifetime;

  return {
    total,
    monthly,
    lifetime,
    canIdentify: total >= config.credits.perIdentification,
    cycleRefreshAt: data.cycle_refresh_at,
  };
}

export async function consumeCredits(userId: string, amount = config.credits.perIdentification) {
  const { data, error } = await supabase.rpc("consume_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) throw error;
  return data as { success: boolean; remaining: number };
}

export async function grantSubscriptionCredits(
  userId: string,
  tier: "starter" | "explorer" | "pro",
) {
  const credits =
    tier === "pro"
      ? config.credits.proMonthly
      : tier === "explorer"
        ? config.credits.explorerMonthly
        : config.credits.starterMonthly;
  const { error } = await supabase.rpc("grant_monthly_credits", {
    p_user_id: userId,
    p_amount: credits,
  });
  if (error) throw error;
}
