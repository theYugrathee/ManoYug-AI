import type { AnalyticsEvent } from "./event";

export interface AnalyticsProvider {
  readonly name: string;
  track(event: AnalyticsEvent): Promise<void>;
}

export type { AnalyticsEvent };
