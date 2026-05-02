/**
 * AdMob wrapper — banner / interstitial / rewarded.
 * - Auto-disabled for premium users (caller passes isPremium flag)
 * - Falls back to Google's universal TEST IDs in dev / when EXPO_PUBLIC_ADS_USE_TEST_IDS=true
 * - Web build is a no-op (AdMob is native-only)
 */
import { Platform } from "react-native";
import Constants from "expo-constants";
import { config } from "./config";

const isExpoGo = Constants.appOwnership === "expo";

// Google's universal test IDs — safe for development.
// https://developers.google.com/admob/android/test-ads
const TEST_BANNER =
  Platform.OS === "ios"
    ? "ca-app-pub-3940256099942544/2934735716"
    : "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL =
  Platform.OS === "ios"
    ? "ca-app-pub-3940256099942544/4411468910"
    : "ca-app-pub-3940256099942544/1033173712";
const TEST_REWARDED =
  Platform.OS === "ios"
    ? "ca-app-pub-3940256099942544/1712485313"
    : "ca-app-pub-3940256099942544/5224354917";

export function bannerUnitId(): string {
  if (config.ads.useTestIds) return TEST_BANNER;
  return config.ads.banner || TEST_BANNER;
}

export function interstitialUnitId(): string {
  if (config.ads.useTestIds) return TEST_INTERSTITIAL;
  return config.ads.interstitial || TEST_INTERSTITIAL;
}

export function rewardedUnitId(): string {
  if (config.ads.useTestIds) return TEST_REWARDED;
  return config.ads.rewarded || TEST_REWARDED;
}

/** Lazy-loaded SDK — react-native-google-mobile-ads is native-only, web build skips. */
let mobileAds: typeof import("react-native-google-mobile-ads") | null = null;

async function getSdk() {
  if (Platform.OS === "web" || isExpoGo) return null;
  if (!mobileAds) {
    try {
      mobileAds = await import("react-native-google-mobile-ads");
    } catch {
      return null;
    }
  }
  return mobileAds;
}

let adsInitialized = false;

export async function initAds(): Promise<void> {
  if (adsInitialized || Platform.OS === "web") return;
  const sdk = await getSdk();
  if (!sdk) return;
  await sdk.default().initialize();
  adsInitialized = true;
}

/** Show an interstitial. Returns when the ad is closed (or immediately if premium / web). */
export async function showInterstitial(opts: { isPremium: boolean }): Promise<void> {
  if (opts.isPremium || Platform.OS === "web") return;
  const sdk = await getSdk();
  if (!sdk) return;
  const { InterstitialAd, AdEventType } = sdk;
  const ad = InterstitialAd.createForAdRequest(interstitialUnitId(), {
    requestNonPersonalizedAdsOnly: true,
  });
  return new Promise<void>((resolve) => {
    const closeUnsub = ad.addAdEventListener(AdEventType.CLOSED, () => {
      closeUnsub();
      errorUnsub();
      resolve();
    });
    const errorUnsub = ad.addAdEventListener(AdEventType.ERROR, () => {
      closeUnsub();
      errorUnsub();
      resolve();
    });
    ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
    ad.load();
    setTimeout(resolve, 5000); // safety timeout
  });
}

/**
 * Show a rewarded ad. Resolves with `true` if user earned the reward.
 * Caller is responsible for granting credits on `true`.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const sdk = await getSdk();
  if (!sdk) return false;
  const { RewardedAd, RewardedAdEventType, AdEventType } = sdk;
  const ad = RewardedAd.createForAdRequest(rewardedUnitId(), {
    requestNonPersonalizedAdsOnly: true,
  });

  return new Promise<boolean>((resolve) => {
    let earned = false;

    const earnUnsub = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const closeUnsub = ad.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      resolve(earned);
    });
    const errorUnsub = ad.addAdEventListener(AdEventType.ERROR, () => {
      cleanup();
      resolve(false);
    });
    const loadedUnsub = ad.addAdEventListener(RewardedAdEventType.LOADED, () => ad.show());

    function cleanup() {
      earnUnsub();
      closeUnsub();
      errorUnsub();
      loadedUnsub();
    }

    ad.load();
    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 30000);
  });
}
