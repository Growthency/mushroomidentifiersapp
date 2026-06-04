import "../global.css";

// Defensive native-module init. JS top-level `import` statements can't be
// try-caught; converting them to `require()` inside a try/catch lets the
// bundle entry survive even if a native module's JS-side init throws.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-gesture-handler");
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("[gesture-handler init failed]", e);
}
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("react-native-reanimated");
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn("[reanimated init failed]", e);
}

import { Stack, SplashScreen } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    SplashScreen.hideAsync().catch(() => {});

    init().catch(() => {
      useAuthStore.setState((s) => (s.loading ? { loading: false } : {}));
    });

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

  // Removed in Build 16:
  //   - <GestureHandlerRootView> wrap → suspected of crashing on cold start
  //     on certain Android devices when paired with Reanimated v4 + new
  //     arch. Without it, basic touch/scroll still works; only complex
  //     gestures inside ScrollViews degrade. Worth the trade-off until we
  //     can prove it's NOT the culprit.
  //   - `animation: "fade"` on the (auth)/(tabs) screens → fade triggers a
  //     Reanimated worklet. Setting all screens to "none" ensures no
  //     animation worklet runs during the very first route transition.
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <View style={{ flex: 1, backgroundColor: "#F1F6ED" }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: { backgroundColor: "#F1F6ED" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
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
    </RootErrorBoundary>
  );
}
