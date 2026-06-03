/**
 * DIAGNOSTIC BUILD 13 — minimal layout to isolate blank-screen cause.
 *
 * If the user sees the green "App is alive" screen, RN + Expo + the
 * bundle pipeline all work, and the blank screen is caused by something
 * the FULL layout pulls in (auth, supabase, NativeWind, splash, etc.).
 *
 * If the user STILL sees blank white, the issue is deeper — Reanimated
 * + new architecture incompatibility, or Expo Router itself failing.
 *
 * Restore the full layout from `_layout.tsx.bak` once we have a verdict.
 */
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#1F4A1F" },
      }}
    />
  );
}
