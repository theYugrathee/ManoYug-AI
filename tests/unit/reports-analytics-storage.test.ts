import { describe, expect, it } from "vitest";
import { buildInstitutionReportCsv } from "@/lib/institution/resources";
import { demoInstitutionId } from "@/lib/store/memory";
import { trackEvent, getRecentAnalytics } from "@/lib/providers/analytics";
import { getStorageProvider } from "@/lib/providers/storage";

describe("institution report csv", () => {
  it("never claims private chats are exported", () => {
    const csv = buildInstitutionReportCsv(demoInstitutionId());
    expect(csv).toContain("export_contains_private_chats,false");
  });
});

describe("analytics provider", () => {
  it("records privacy-conscious events", async () => {
    await trackEvent({ name: "unit_test_event", properties: { ok: true } });
    const recent = getRecentAnalytics(10);
    expect(recent.some((e) => e.name === "unit_test_event")).toBe(true);
  });
});

describe("storage provider", () => {
  it("stores small blobs in memory provider", async () => {
    const storage = getStorageProvider();
    const result = await storage.upload({
      path: "dev/test.txt",
      bytes: Buffer.from("hello"),
      contentType: "text/plain",
    });
    expect(result.ok).toBe(true);
  });
});
