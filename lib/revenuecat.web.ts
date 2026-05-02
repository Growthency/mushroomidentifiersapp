/** Web stub — RevenueCat is native-only. */
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";

export async function initRevenueCat(_userId?: string | null): Promise<void> {
  return;
}
export async function loginRevenueCat(_userId: string): Promise<void> {
  return;
}
export async function logoutRevenueCat(): Promise<void> {
  return;
}
export async function getOfferings(): Promise<PurchasesOffering | null> {
  return null;
}
export async function purchasePackage(_pkg: PurchasesPackage): Promise<CustomerInfo> {
  throw new Error("In-app purchases are not available on web. Please use the mobile app.");
}
export async function restorePurchases(): Promise<CustomerInfo> {
  throw new Error("In-app purchases are not available on web. Please use the mobile app.");
}
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  return null;
}
export function hasPremium(_info: CustomerInfo | null): boolean {
  return false;
}
export function getActiveTier(
  _info: CustomerInfo | null,
): "free" | "explorer" | "pro" | "yearly" | "lifetime" {
  return "free";
}
