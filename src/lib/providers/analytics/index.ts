import { FirstPartyAnalyticsProvider } from "./first-party";
import type { AnalyticsProvider } from "./types";
import type { AnalyticsEvent } from "./event";

export type { AnalyticsEvent, AnalyticsProvider };

let cached: FirstPartyAnalyticsProvider | null = null;

export function getAnalyticsProvider(): AnalyticsProvider {
  if (!cached) cached = new FirstPartyAnalyticsProvider();
  return cached;
}

export async function trackEvent(event: AnalyticsEvent) {
  await getAnalyticsProvider().track(event);
}

export function getRecentAnalytics(limit = 50) {
  if (!cached) cached = new FirstPartyAnalyticsProvider();
  return cached.recent(limit);
}
