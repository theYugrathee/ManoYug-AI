import { describe, expect, it } from "vitest";
import { retrieveApprovedKnowledge } from "@/lib/ai/knowledge";
import { priceForCapacity, estimateGrossMargin } from "@/lib/commercial/pricing";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isFeatureEnabled } from "@/lib/platform/feature-flags";
import { bookAppointment, DEV_STUDENT_KEY, DEV_COUNSELLOR_KEY } from "@/lib/store/memory";

describe("knowledge retrieval", () => {
  it("returns exam-related approved snippets", () => {
    const hits = retrieveApprovedKnowledge("exam stress CGPA");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.source).toBeTruthy();
  });
});

describe("pricing", () => {
  it("prices 5k capacity at blueprint tier", () => {
    expect(priceForCapacity(5000).annualInr).toBe(900_000);
  });

  it("marks margin as estimate", () => {
    const m = estimateGrossMargin({
      annualRevenueInr: 900_000,
      estimatedAiCogsUsd: 100,
    });
    expect(m.note.toLowerCase()).toContain("estimate");
    expect(m.estimatedGrossMarginPct).not.toBeNull();
  });
});

describe("rate limit", () => {
  it("blocks after limit", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed).toBe(false);
  });
});

describe("feature flags", () => {
  it("keeps break-glass off by default", () => {
    expect(isFeatureEnabled("break_glass.enabled")).toBe(false);
  });
});

describe("appointments", () => {
  it("rejects overlapping counsellor slots", () => {
    const start = new Date(Date.now() + 86_400_000);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60_000);
    const first = bookAppointment({
      studentKey: DEV_STUDENT_KEY,
      counsellorKey: DEV_COUNSELLOR_KEY,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    });
    expect(first.ok).toBe(true);
    const second = bookAppointment({
      studentKey: "other-student",
      counsellorKey: DEV_COUNSELLOR_KEY,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    });
    expect(second.ok).toBe(false);
  });
});
