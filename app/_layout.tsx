import "../global.css";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack, SplashScreen } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/stores/authStore";
import { initAds } from "@/lib/ads";
import { initPostHog } from "@/lib/posthog";
import { AppSplash } from "@/components/AppSplash";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const loading = useAuthStore((s) => s.loading);

  // Keep the in-app gradient splash up for a brief minimum even after auth
  // resolves, so it doesn't flash on fast loads. Hides as soon as both
  // (1) auth init finished AND (2) at least 600ms have elapsed.
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    // Hand off as soon as React mounts — the native splash hides and our
    // own gradient AppSplash takes over immediately, so the user never sees
    // a colour jump.
    SplashScreen.hideAsync().catch(() => {});

    init().catch(() => {
      // Even if init throws, never leave the UI blocked.
      useAuthStore.setState((s) => (s.loading ? { loading: false } : {}));
    });
    initAds().catch(() => {});
    initPostHog().catch(() => {});

    const minDelay = setTimeout(() => setMinDelayDone(true), 600);

    // Absolute safety net — if every other guard somehow fails, never let
    // the splash linger past 6s.
    const safety = setTimeout(() => {
      useAuthStore.setState((s) => (s.loading ? { loading: false } : {}));
      setMinDelayDone(true);
    }, 6000);

    return () => {
      clearTimeout(minDelay);
      clearTimeout(safety);
    };
  }, [init]);

  const splashVisible = loading || !minDelayDone;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        {/* Always render the navigator behind the splash so React can
            warm up routes/hooks while the splash is visible. */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F1F6ED" } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
            <Stack.Screen name="scan" options={{ presentation: "modal" }} />
            <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
            <Stack.Screen name="mushroom/[id]" />
            <Stack.Screen name="blog/index" />
            <Stack.Screen name="blog/[slug]" />
            <Stack.Screen name="chat" options={{ presentation: "modal" }} />
          </Stack>
          <AppSplash visible={splashVisible} />
        </View>
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
