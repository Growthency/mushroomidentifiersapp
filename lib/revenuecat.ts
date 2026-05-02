/**
 * RevenueCat wrapper — subscriptions, paywall, entitlements.
 *
 * Expo Go does NOT include react-native-purchases native binary, so we
 * gracefully no-op when running there. Full IAP works in dev clients
 * built via EAS Build, and in production builds.
 */
import { Platform } from "react-native";
import Constants from "expo-constants";
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { config } from "./config";

const isExpoGo = Constants.appOwnership === "expo";

let initialized = false;
let Purchases: typeof import("react-native-purchases").default | null = null;
let LOG_LEVEL: typeof import("react-native-purchases").LOG_LEVEL | null = null;

function loadNativeSdk() {
  if (isExpoGo || Platform.OS === "web") return false;
  if (Purchases) return true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-purchases");
    Purchases = mod.default ?? mod;
    LOG_LEVEL = mod.LOG_LEVEL;
    return true;
  } catch {
    return false;
  }
}

export async function initRevenueCat(userId?: string | null) {
  if (!loadNativeSdk() || !Purchases) {
    if (__DEV__ && isExpoGo) {
      console.log("[revenuecat] Expo Go detected — IAP disabled. Use EAS dev client for full testing.");
    }
    return;
  }
  if (initialized) {
    if (userId) await Purchases.logIn(userId);
    return;
  }
  if (!config.revenuecat.apiKey) {
    if (__DEV__) console.warn("[revenuecat] no API key — skipping init");
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL!.DEBUG : LOG_LEVEL!.WARN);
  await Purchases.configure({
    apiKey: config.revenuecat.apiKey,
    appUserID: userId ?? undefined,
  });

  initialized = true;
}

export async function loginRevenueCat(userId: string) {
  if (!loadNativeSdk() || !Purchases) return;
  if (!initialized) await initRevenueCat(userId);
  else await Purchases.logIn(userId);
}

export async function logoutRevenueCat() {
  if (!initialized || !Purchases) return;
  try {
    await Purchases.logOut();
  } catch {
    // anonymous user — ignore
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!initialized || !Purchases) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.all[config.revenuecat.offeringId] ?? offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  if (!Purchases) throw new Error("In-app purchases not available in this build.");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!Purchases) throw new Error("In-app purchases not available in this build.");
  return await Purchases.restorePurchases();
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!initialized || !Purchases) return null;
  return await Purchases.getCustomerInfo();
}

export function hasPremium(info: CustomerInfo | null): boolean {
  if (!info) return false;
  return info.entitlements.active[config.revenuecat.entitlementId] != null;
}

export function getActiveTier(
  info: CustomerInfo | null,
): "free" | "explorer" | "pro" | "yearly" | "lifetime" {
  if (!info) return "free";
  const active = info.entitlements.active[config.revenuecat.entitlementId];
  if (!active) return "free";
  const product = active.productIdentifier.toLowerCase();
  if (product.includes("lifetime")) return "lifetime";
  if (product.includes("year") || product.includes("annual")) return "yearly";
  if (product.includes("pro")) return "pro";
  return "explorer";
}

export { Platform };
