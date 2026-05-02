/** Web stub — AdMob is native-only. */
export function bannerUnitId(): string {
  return "";
}
export function interstitialUnitId(): string {
  return "";
}
export function rewardedUnitId(): string {
  return "";
}
export async function initAds(): Promise<void> {
  return;
}
export async function showInterstitial(_opts: { isPremium: boolean }): Promise<void> {
  return;
}
export async function showRewardedAd(): Promise<boolean> {
  return false;
}
