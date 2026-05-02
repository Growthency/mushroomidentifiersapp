import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { config } from "./config";
import type { Database } from "@/types/supabase";

export const supabase = createClient<Database>(
  config.supabase.url || "https://placeholder.supabase.co",
  config.supabase.anonKey || "placeholder",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-client-info": "mushroomid-mobile",
      },
    },
  },
);

// Refresh token whenever app comes to foreground — Supabase recommended pattern.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
