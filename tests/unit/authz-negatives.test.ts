import { describe, expect, it } from "vitest";
import { roleHasPermission } from "@/lib/auth/permissions";
import { findEligibilityMatch } from "@/lib/auth/eligibility";

/**
 * Authorization negative cases — unit-level. Full RLS SQL tests run against a live DB.
 */
describe("authorization negatives", () => {
  it("denies student break-glass", () => {
    expect(roleHasPermission("STUDENT", "platform.break_glass")).toBe(false);
  });

  it("denies institution admin counsellor notes capability by default matrix", () => {
    expect(roleHasPermission("INSTITUTION_ADMIN", "counsellor.notes.write")).toBe(
      false,
    );
  });

  it("denies cross-tenant eligibility when institution suspended", () => {
    const match = findEligibilityMatch(
      [
        {
          id: "r1",
          institution_id: "inst-b",
          email: "a@x.com",
          university_roll_no: "1",
          graduation_year: 2027,
          status: "ACTIVE",
          linked_user_id: null,
          institution_status: "SUSPENDED",
        },
      ],
      { email: "a@x.com", universityRollNo: "1", graduationYear: 2027 },
      "user-1",
    );
    expect(match.matched).toBe(false);
  });

  it("denies counsellor case update for finance role", () => {
    expect(roleHasPermission("FINANCE", "counsellor.case.update")).toBe(false);
  });
});
