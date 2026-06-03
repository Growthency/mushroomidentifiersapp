import "../global.css";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { Stack, SplashScreen } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import { useAuthStore } from "@/stores/authStore";
import { initAds } from "@/lib/ads";
import { initPostHog } from "@/lib/posthog";

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

  useEffect(() => {
    init().finally(() => SplashScreen.hideAsync().catch(() => {}));
    initAds().catch(() => {});
    initPostHog().catch(() => {});
  }, [init]);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F1F6ED" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="scan" options={{ presentation: "modal" }} />
          <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
          <Stack.Screen name="mushroom/[id]" />
          <Stack.Screen name="chat" options={{ presentation: "modal" }} />
        </Stack>
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
