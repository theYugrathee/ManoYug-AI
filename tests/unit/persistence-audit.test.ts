import { describe, expect, it } from "vitest";
import { getPersistenceMode } from "@/lib/data/conversations";
import { writeAuditLog } from "@/lib/audit/log";

describe("persistence mode", () => {
  it("uses dev-memory without Supabase env", () => {
    expect(getPersistenceMode()).toBe("dev-memory");
  });
});

describe("audit log", () => {
  it("does not throw when Supabase admin is absent", async () => {
    await expect(
      writeAuditLog({
        action: "test.action",
        result: "success",
        metadata: { unit: true },
      }),
    ).resolves.toBeUndefined();
  });
});
