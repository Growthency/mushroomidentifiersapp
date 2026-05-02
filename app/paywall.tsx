import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Check, X, Sparkles, ArrowLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";

import { Button, Badge } from "@/components/ui";
import { RewardedAdButton } from "@/components/ads/RewardedAdButton";
import { getOfferings, purchasePackage, restorePurchases } from "@/lib/revenuecat";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import type { PurchasesPackage } from "react-native-purchases";

const TIER_INCLUDES: Record<string, string[]> = {
  explorer: [
    "200 credits per month (20 IDs)",
    "Zero ads — clean experience",
    "AI species identification (Haiku)",
    "Toxicity & lookalike alerts",
    "Field journal",
    "Cancel anytime",
  ],
  pro: [
    "600 credits per month (60 IDs)",
    "Zero ads",
    "Everything in Explorer",
    "Priority Sonnet 4.6 AI",
    "PDF reports & foraging map",
    "Cancel anytime",
  ],
  yearly: [
    "600 credits per month (60 IDs)",
    "Zero ads",
    "Everything in Pro",
    "Save 33% vs monthly Pro",
    "Priority Sonnet 4.6 AI",
    "Annual billing",
  ],
  lifetime: [
    "1,000 credits per month — forever",
    "Zero ads — forever",
    "Everything in Yearly",
    "Sonnet 4.6 AI forever",
    "One-time payment, no renewal",
    "CSV export & priority support",
  ],
};

const TIER_BADGE: Record<string, string | null> = {
  explorer: null,
  pro: "Most popular",
  yearly: "Save 33%",
  lifetime: "Best value",
};

const TIER_ORDER: Record<string, number> = {
  explorer: 1,
  pro: 2,
  yearly: 3,
  lifetime: 4,
};

function detectTier(pkg: PurchasesPackage): "explorer" | "pro" | "yearly" | "lifetime" {
  // Prefer the product identifier (e.g. "pro_monthly") which is unambiguous,
  // fall back to package identifier ("$rc_monthly", "explorer_monthly", etc.).
  const productId = pkg.product?.identifier?.toLowerCase() ?? "";
  const packageId = pkg.identifier?.toLowerCase() ?? "";
  const id = productId || packageId;
  if (id.includes("lifetime")) return "lifetime";
  if (id.includes("year") || id.includes("annual")) return "yearly";
  if (id.includes("pro")) return "pro";
  return "explorer";
}

export default function Paywall() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refresh = useSubscriptionStore((s) => s.refresh);

  useEffect(() => {
    (async () => {
      const offering = await getOfferings();
      const pkgs = offering?.availablePackages ?? [];
      setPackages(pkgs);
      // Default to Pro (most popular) — falls back to first available package
      const pro =
        pkgs.find((p) => detectTier(p) === "pro") ??
        pkgs.find((p) => p.packageType === "ANNUAL") ??
        pkgs.find((p) => detectTier(p) === "yearly") ??
        pkgs[0];
      if (pro) setSelected(pro.identifier);
    })();
  }, []);

  const purchase = async () => {
    const pkg = packages.find((p) => p.identifier === selected);
    if (!pkg) return;
    setLoading(true);
    try {
      await purchasePackage(pkg);
      await refresh();
      Toast.show({ type: "success", text1: "Welcome to Premium 🍄" });
      router.back();
    } catch (e) {
      const msg = (e as { userCancelled?: boolean; message?: string });
      if (!msg.userCancelled) {
        Toast.show({ type: "error", text1: "Purchase failed", text2: msg.message ?? "Try again" });
      }
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
      await refresh();
      Toast.show({ type: "success", text1: "Purchases restored" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Restore failed", text2: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-forest-900">
      <LinearGradient colors={["#0F1B0A", "#1F3B0F", "#2D5016"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 50, paddingBottom: 40 }}>
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <X size={20} color="#fff" />
          </Pressable>

          <View className="mt-4 items-center">
            <View className="flex-row items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1.5">
              <Sparkles size={14} color="#F0B549" />
              <Text className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Mushroom Identifiers Premium
              </Text>
            </View>
            <Text className="mt-3 text-center font-display text-3xl font-bold text-white">
              Forage with confidence
            </Text>
            <Text className="mt-2 text-center text-forest-100">
              Multi-angle AI · 10,000+ species · zero ads.
            </Text>
          </View>

          <View className="mt-8 gap-3">
            {packages.length === 0 ? (
              <Text className="text-center text-forest-200">Loading offerings…</Text>
            ) : (
              [...packages]
                .sort(
                  (a, b) => TIER_ORDER[detectTier(a)] - TIER_ORDER[detectTier(b)],
                )
                .map((pkg) => {
                  const tier = detectTier(pkg);
                  const isSelected = selected === pkg.identifier;
                  const badge = TIER_BADGE[tier];
                  const tierLabel =
                    tier === "lifetime"
                      ? "Lifetime"
                      : tier === "yearly"
                        ? "Yearly"
                        : tier === "pro"
                          ? "Pro"
                          : "Explorer";
                  return (
                    <Pressable
                      key={pkg.identifier}
                      onPress={() => setSelected(pkg.identifier)}
                      className={`rounded-2xl border-2 p-4 ${
                        isSelected ? "border-amber-300 bg-white/15" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-display text-lg font-bold text-white">
                            {tierLabel}
                          </Text>
                          {badge && <Badge label={badge} tone="warn" />}
                        </View>
                        <Text className="text-lg font-bold text-amber-300">
                          {pkg.product.priceString}
                        </Text>
                      </View>
                      <View className="mt-3 gap-1">
                        {TIER_INCLUDES[tier]?.map((line) => (
                          <View key={line} className="flex-row items-center gap-2">
                            <Check size={14} color="#90B872" />
                            <Text className="text-sm text-forest-100">{line}</Text>
                          </View>
                        ))}
                      </View>
                    </Pressable>
                  );
                })
            )}
          </View>

          <Button onPress={purchase} loading={loading} size="lg" className="mt-6">
            Start free trial
          </Button>
          <Pressable onPress={restore} className="mt-3">
            <Text className="text-center text-sm text-forest-200 underline">Restore purchases</Text>
          </Pressable>

          {/* Free alternative — earn credits by watching an ad */}
          <View className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
            <Text className="text-center text-sm font-bold uppercase tracking-wider text-amber-300">
              Not ready to subscribe?
            </Text>
            <Text className="mt-2 text-center text-sm text-forest-100">
              Watch a short ad and earn free credits — no commitment.
            </Text>
            <View className="mt-3">
              <RewardedAdButton />
            </View>
          </View>

          <Text className="mt-4 text-center text-xs text-forest-300">
            7-day free trial · cancel anytime · 14-day money-back guarantee.{"\n"}
            Subscriptions auto-renew unless cancelled in your store account.{"\n"}
            Premium removes all ads.
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
