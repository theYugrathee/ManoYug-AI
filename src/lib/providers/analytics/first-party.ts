import type { AnalyticsEvent } from "./event";
import type { AnalyticsProvider } from "./types";

/**
 * First-party analytics — console in dev; buffer for future warehouse.
 * Privacy-conscious: callers must not pass message bodies.
 */
export class FirstPartyAnalyticsProvider implements AnalyticsProvider {
  readonly name = "first-party";
  private buffer: AnalyticsEvent[] = [];

  async track(event: AnalyticsEvent): Promise<void> {
    this.buffer.push({ ...event, properties: { ...event.properties } });
    if (this.buffer.length > 2000) this.buffer.shift();
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[analytics]",
        event.name,
        event.institutionId ?? "-",
        event.userId ? "user:yes" : "user:anon",
      );
    }
  }

  recent(limit = 50): AnalyticsEvent[] {
    return this.buffer.slice(-limit).reverse();
  }
}
