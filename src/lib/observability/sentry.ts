/**
 * Optional Sentry init — no-op until SENTRY_DSN is set and @sentry/nextjs installed.
 * Keeps the app runnable without the dependency.
 */

export function initObservability() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return { enabled: false as const };

  // Dynamic import path reserved for when package is added:
  // await import("@sentry/nextjs").then((Sentry) => Sentry.init({ dsn, tracesSampleRate: 0.1 }))
  console.info(
    "[observability] SENTRY_DSN is set. Install @sentry/nextjs and wire init in instrumentation.ts for production error monitoring.",
  );
  return { enabled: true as const, mode: "dsn-present-sdk-pending" as const };
}

export function captureException(error: unknown, context?: string) {
  if (!process.env.SENTRY_DSN) {
    console.error("[error]", context ?? "uncaught", error);
    return;
  }
  console.error("[error:sentry-pending]", context ?? "uncaught", error);
}
