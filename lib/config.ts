/**
 * Centralized env loader. Throws fast if a required var is missing,
 * so we never deploy a broken build.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

function read(key: string): string | undefined {
  // Expo inlines EXPO_PUBLIC_* into process.env at build time
  return process.env[key] ?? (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[key];
}

function required(key: string): string {
  const value = read(key);
  if (!value || value.startsWith("YOUR_") || value.includes("your_")) {
    if (__DEV__) {
      console.warn(`[config] missing env: ${key} — using empty string in dev`);
      return "";
    }
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function bool(key: string, fallback = false): boolean {
  const v = read(key);
  if (v == null) return fallback;
  return v === "true" || v === "1";
}

function int(key: string, fallback: number): number {
  const v = read(key);
  if (v == null) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  appEnv: read("EXPO_PUBLIC_APP_ENV") ?? "development",
  isDev: __DEV__,

  supabase: {
    url: required("EXPO_PUBLIC_SUPABASE_URL"),
    anonKey: required("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  },

  // Anthropic key is SERVER-ONLY now. The client never holds it; calls route
  // through Supabase Edge Functions. These fields stay for legacy reads.
  anthropic: {
    apiKey: "",
    modelFree: "claude-haiku-4-5-20251001",
    modelPaid: "claude-sonnet-4-6",
  },

  revenuecat: {
    apiKey:
      Platform.OS === "ios"
        ? read("EXPO_PUBLIC_REVENUECAT_API_KEY_IOS") ?? ""
        : read("EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID") ?? "",
    entitlementId: read("EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID") ?? "premium",
    offeringId: read("EXPO_PUBLIC_REVENUECAT_OFFERING_ID") ?? "default",
  },

  googleMaps: {
    apiKey:
      Platform.OS === "ios"
        ? read("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS") ?? ""
        : read("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID") ?? "",
  },

  iNaturalist: {
    base: read("EXPO_PUBLIC_INATURALIST_API_BASE") ?? "https://api.inaturalist.org/v1",
  },

  openWeather: {
    apiKey: read("EXPO_PUBLIC_OPENWEATHER_API_KEY") ?? "",
  },

  posthog: {
    apiKey: read("EXPO_PUBLIC_POSTHOG_API_KEY") ?? "",
    host: read("EXPO_PUBLIC_POSTHOG_HOST") ?? "https://us.i.posthog.com",
  },

  ads: {
    useTestIds: bool("EXPO_PUBLIC_ADS_USE_TEST_IDS", __DEV__),
    rewardedCredits: int("EXPO_PUBLIC_REWARDED_AD_CREDITS", 10),
    appId:
      Platform.OS === "ios"
        ? read("EXPO_PUBLIC_ADMOB_APP_ID_IOS") ?? ""
        : read("EXPO_PUBLIC_ADMOB_APP_ID_ANDROID") ?? "",
    banner:
      Platform.OS === "ios"
        ? read("EXPO_PUBLIC_ADMOB_BANNER_IOS") ?? ""
        : read("EXPO_PUBLIC_ADMOB_BANNER_ANDROID") ?? "",
    interstitial:
      Platform.OS === "ios"
        ? read("EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS") ?? ""
        : read("EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID") ?? "",
    rewarded:
      Platform.OS === "ios"
        ? read("EXPO_PUBLIC_ADMOB_REWARDED_IOS") ?? ""
        : read("EXPO_PUBLIC_ADMOB_REWARDED_ANDROID") ?? "",
  },

  website: {
    url: read("EXPO_PUBLIC_WEBSITE_URL") ?? "https://mushroomidentifiers.com",
    apiBase: read("EXPO_PUBLIC_WEBSITE_API_BASE") ?? "https://mushroomidentifiers.com/api",
    deepLinkDomain: read("EXPO_PUBLIC_DEEP_LINK_DOMAIN") ?? "mushroomidentifiers.com",
  },

  features: {
    aiChat: bool("EXPO_PUBLIC_ENABLE_AI_CHAT", true),
    arView: bool("EXPO_PUBLIC_ENABLE_AR_VIEW", false),
    offlineMode: bool("EXPO_PUBLIC_ENABLE_OFFLINE_MODE", true),
    community: bool("EXPO_PUBLIC_ENABLE_COMMUNITY", true),
    recipes: bool("EXPO_PUBLIC_ENABLE_RECIPES", true),
    voiceGuide: bool("EXPO_PUBLIC_ENABLE_VOICE_GUIDE", true),
    sporePrintTool: bool("EXPO_PUBLIC_ENABLE_SPORE_PRINT_TOOL", true),
    liveCameraDetection: bool("EXPO_PUBLIC_ENABLE_LIVE_CAMERA_DETECTION", true),
    gamification: bool("EXPO_PUBLIC_ENABLE_GAMIFICATION", true),
  },

  credits: {
    perIdentification: int("EXPO_PUBLIC_CREDITS_PER_IDENTIFICATION", 10),
    perChatMessage: int("EXPO_PUBLIC_CREDITS_PER_CHAT_MESSAGE", 5),
    freeLifetime: int("EXPO_PUBLIC_FREE_LIFETIME_CREDITS", 30),
    starterMonthly: int("EXPO_PUBLIC_STARTER_MONTHLY_CREDITS", 120),
    explorerMonthly: int("EXPO_PUBLIC_EXPLORER_MONTHLY_CREDITS", 550),
    proMonthly: int("EXPO_PUBLIC_PRO_MONTHLY_CREDITS", 1200),
  },
} as const;

export type Config = typeof config;
