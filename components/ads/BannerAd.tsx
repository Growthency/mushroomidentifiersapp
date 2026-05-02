/**
 * Banner ad — auto-hidden when user has premium.
 * Renders nothing on web (AdMob is native-only).
 */
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { bannerUnitId } from "@/lib/ads";

const isExpoGo = Constants.appOwnership === "expo";

let BannerAdComponent: React.ComponentType<{ unitId: string; size: string }> | null = null;
let BannerAdSize: Record<string, string> = {};

if (Platform.OS !== "web" && !isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sdk = require("react-native-google-mobile-ads");
    BannerAdComponent = sdk.BannerAd;
    BannerAdSize = sdk.BannerAdSize;
  } catch {
    // module not installed yet — silent fallback
  }
}

export function AdBanner({
  size = "ANCHORED_ADAPTIVE_BANNER",
  className,
}: {
  size?: "BANNER" | "LARGE_BANNER" | "MEDIUM_RECTANGLE" | "ANCHORED_ADAPTIVE_BANNER";
  className?: string;
}) {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  if (isPremium || Platform.OS === "web" || isExpoGo || !BannerAdComponent) return null;

  return (
    <View className={className} style={{ alignItems: "center" }}>
      <BannerAdComponent unitId={bannerUnitId()} size={BannerAdSize[size] ?? size} />
    </View>
  );
}
