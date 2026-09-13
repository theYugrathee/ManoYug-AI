import { describe, expect, it } from "vitest";
import { roleHasPermission } from "@/lib/auth/permissions";
import { runSafetyPrecheck, isCrisisUxRequired } from "@/lib/safety/precheck";

describe("permissions", () => {
  it("grants students own conversation access", () => {
    expect(
      roleHasPermission("STUDENT", "student.conversation.read_own"),
    ).toBe(true);
  });

  it("denies students roster management", () => {
    expect(roleHasPermission("STUDENT", "institution.roster.manage")).toBe(
      false,
    );
  });

  it("denies institution admins break-glass by default", () => {
    expect(
      roleHasPermission("INSTITUTION_ADMIN", "platform.break_glass"),
    ).toBe(false);
  });
});

describe("safety precheck", () => {
  it("keeps ordinary stress green", () => {
    const result = runSafetyPrecheck({
      text: "I am stressed about my midterm exams and CGPA.",
    });
    expect(result.state).toBe("GREEN");
    expect(result.recommended_action).toBe("continue_support");
  });

  it("escalates clear suicidal ideation", () => {
    const result = runSafetyPrecheck({
      text: "I want to kill myself tonight.",
    });
    expect(["RED", "IMMINENT"]).toContain(result.state);
    expect(isCrisisUxRequired(result.state)).toBe(true);
    expect(result.policy_version).toBeTruthy();
  });

  it.each([
    "im going to sucide",
    "I am gonna kill myself",
    "mann kar raha hai ki mar jau",
    "I won't be here tomorrow; this is my last message",
    "मुझे जीने का मन नहीं है",
    "he is going to hurt himself tonight",
  ])("opens crisis handling for colloquial or misspelled crisis language: %s", (text) => {
    const result = runSafetyPrecheck({ text });
    expect(["RED", "IMMINENT"]).toContain(result.state);
    expect(isCrisisUxRequired(result.state)).toBe(true);
  });
});
