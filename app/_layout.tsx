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
import { AppSplash } from "@/components/AppSplash";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";

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

  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    // Native splash → our AppSplash overlay handoff. Hide the native splash
    // immediately so we control timing from here.
    SplashScreen.hideAsync().catch(() => {});

    // Auth init (already has a 4-sec internal timeout in authStore).
    init().catch(() => {
      useAuthStore.setState((s) => (s.loading ? { loading: false } : {}));
    });

    // Side-effect SDK inits are deferred and lazy-required. If any of them
    // throw at IMPORT time, that crash now happens INSIDE this effect (where
    // RootErrorBoundary can't catch it but we can swallow it). Previously
    // they were imported at the top of this file — a synchronous import-time
    // crash there would kill the bundle entry before any error boundary
    // could mount, producing the silent blank-white screen.
    (async () => {
      try {
        const ads = await import("@/lib/ads");
        await ads.initAds();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[ads init failed]", e);
      }
    })();
    (async () => {
      try {
        const ph = await import("@/lib/posthog");
        await ph.initPostHog();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[posthog init failed]", e);
      }
    })();

    const minDelay = setTimeout(() => setMinDelayDone(true), 400);
    // Absolute safety net — never leave the in-app splash up past 5s.
    const safety = setTimeout(() => {
      useAuthStore.setState((s) => (s.loading ? { loading: false } : {}));
      setMinDelayDone(true);
    }, 5000);

    return () => {
      clearTimeout(minDelay);
      clearTimeout(safety);
    };
  }, [init]);

  const splashVisible = loading || !minDelayDone;

  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F1F6ED" }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <View style={{ flex: 1, backgroundColor: "#F1F6ED" }}>
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
    </RootErrorBoundary>
  );
}
