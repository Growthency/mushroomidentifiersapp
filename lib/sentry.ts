/**
 * Sentry — error & performance tracking.
 *
 * Behavior:
 *   - Production: full error + performance reporting
 *   - Preview / staging: errors only, no performance
 *   - Dev: disabled (no DSN noise in your Sentry dashboard)
 *
 * Works in Expo Go via JS-only fallback. Native crash reporting kicks in
 * when the app is built with EAS dev client / production.
 */
import * as Sentry from "@sentry/react-native";
import { config } from "./config";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  if (!config.sentry.dsn) return;
  if (config.appEnv === "development") return;

  Sentry.init({
    dsn: config.sentry.dsn,
    debug: false,
    environment: config.appEnv,
    enabled: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30_000,
    tracesSampleRate: config.appEnv === "production" ? 0.2 : 1.0,
    attachStacktrace: true,
  });

  initialized = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!initialized) return;
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!initialized) return;
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string } | null) {
  if (!initialized) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

export { Sentry };
