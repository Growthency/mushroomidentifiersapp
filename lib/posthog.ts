/**
 * PostHog — product analytics.
 *
 * Tracks: signup, scan_started, scan_completed, paywall_view, purchase, etc.
 * Auto-disabled in dev (don't pollute prod data).
 */
import PostHog from "posthog-react-native";
import { config } from "./config";

let client: PostHog | null = null;

export async function initPostHog(): Promise<PostHog | null> {
  if (client) return client;
  if (!config.posthog.apiKey) return null;
  if (config.appEnv === "development") return null;

  client = new PostHog(config.posthog.apiKey, {
    host: config.posthog.host,
    flushAt: 20,
    flushInterval: 30_000,
    captureAppLifecycleEvents: true,
  });

  return client;
}

export function track(event: string, props?: Record<string, unknown>) {
  client?.capture(event, props);
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  client?.identify(userId, traits);
}

export function resetPostHog() {
  client?.reset();
}

export function screen(name: string, props?: Record<string, unknown>) {
  client?.screen(name, props);
}

export const ANALYTICS_EVENTS = {
  SIGNUP: "signup",
  LOGIN: "login",
  SCAN_STARTED: "scan_started",
  SCAN_COMPLETED: "scan_completed",
  SCAN_FAILED: "scan_failed",
  JOURNAL_ENTRY_SAVED: "journal_entry_saved",
  PAYWALL_VIEWED: "paywall_viewed",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_FAILED: "purchase_failed",
  AD_REWARD_EARNED: "ad_reward_earned",
  CHAT_MESSAGE_SENT: "chat_message_sent",
} as const;
