import { create } from "zustand";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { initRevenueCat, loginRevenueCat, logoutRevenueCat } from "@/lib/revenuecat";

WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, loading: false });

    // Fire-and-forget — RevenueCat's first network call can take many seconds
    // and used to hang the splash screen on real devices. Don't block UI.
    initRevenueCat(data.session?.user?.id ?? null).catch(() => {});

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        loginRevenueCat(session.user.id).catch(() => {});
      } else {
        logoutRevenueCat().catch(() => {});
      }
    });
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithEmail: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  },

  signInWithMagicLink: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "mushroomid://auth/callback" },
    });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    if (Platform.OS === "web") {
      // Web: simple redirect-based OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      return;
    }

    // Native: use expo-auth-session + WebBrowser
    const redirectTo = makeRedirectUri({ scheme: "mushroomid", path: "auth/callback" });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("OAuth URL missing");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) {
      throw new Error("Sign-in cancelled");
    }

    // Parse the redirect URL — Supabase puts tokens in the hash fragment
    const url = new URL(result.url);
    const params = new URLSearchParams(url.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) throw new Error("Missing tokens in callback");

    const { error: setErr } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (setErr) throw setErr;
  },

  signOut: async () => {
    await logoutRevenueCat();
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "mushroomid://auth/reset",
    });
    if (error) throw error;
  },
}));
