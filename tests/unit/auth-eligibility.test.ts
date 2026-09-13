import { describe, expect, it } from "vitest";
import {
  findEligibilityMatch,
  type RosterCandidate,
} from "@/lib/auth/eligibility";
import {
  loginSchema,
  registerStudentSchema,
  verifyOtpSchema,
} from "@/lib/validation/auth";
import { AUTH_SAFE_MESSAGES } from "@/lib/auth/messages";

const baseRow = (overrides: Partial<RosterCandidate> = {}): RosterCandidate => ({
  id: "roster-1",
  institution_id: "inst-1",
  email: "student@college.edu",
  university_roll_no: "CS2024/001",
  graduation_year: 2027,
  status: "ACTIVE",
  linked_user_id: null,
  institution_status: "ACTIVE",
  ...overrides,
});

describe("registerStudentSchema", () => {
  it("accepts a valid Indian student payload", () => {
    const result = registerStudentSchema.safeParse({
      fullName: "Asha Verma",
      email: "Asha.Verma@College.EDU",
      phone: "+91 98765 43210",
      graduationYear: 2027,
      universityRollNo: "CS2024/001",
      instituteCode: "DU-001",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("asha.verma@college.edu");
      expect(result.data.phone).toBe("+919876543210");
      expect(result.data.instituteCode).toBe("DU-001");
    }
  });

  it("rejects weak passwords", () => {
    const result = registerStudentSchema.safeParse({
      fullName: "Asha Verma",
      email: "asha@college.edu",
      phone: "9876543210",
      graduationYear: 2027,
      universityRollNo: "CS2024/001",
      instituteCode: "DU-001",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts registration without a roll number", () => {
    const result = registerStudentSchema.safeParse({
      fullName: "Asha Verma",
      email: "asha@college.edu",
      phone: "9876543210",
      graduationYear: 2027,
      universityRollNo: "",
      instituteCode: "DU-001",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
  });
});

describe("login + otp schemas", () => {
  it("validates login email", () => {
    expect(
      loginSchema.safeParse({ email: "bad", password: "x" }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({
        email: "a@b.co",
        password: "anything",
      }).success,
    ).toBe(true);
  });

  it("requires numeric OTP token", () => {
    expect(
      verifyOtpSchema.safeParse({ email: "a@b.co", token: "abcdef" }).success,
    ).toBe(false);
    expect(
      verifyOtpSchema.safeParse({ email: "a@b.co", token: "123456" }).success,
    ).toBe(true);
  });
});

describe("eligibility matching", () => {
  const identity = {
    email: "student@college.edu",
    universityRollNo: "cs2024/001",
    graduationYear: 2027,
  };

  it("matches active roster identity case-insensitively", () => {
    const match = findEligibilityMatch([baseRow()], identity, "user-1");
    expect(match).toEqual({
      matched: true,
      rosterId: "roster-1",
      institutionId: "inst-1",
    });
  });

  it("fails closed for inactive roster", () => {
    const match = findEligibilityMatch(
      [baseRow({ status: "INACTIVE" })],
      identity,
      "user-1",
    );
    expect(match.matched).toBe(false);
  });

  it("fails closed when another user already linked", () => {
    const match = findEligibilityMatch(
      [baseRow({ linked_user_id: "other-user" })],
      identity,
      "user-1",
    );
    expect(match.matched).toBe(false);
    if (!match.matched) expect(match.reason).toBe("already_linked");
  });

  it("uses approved email as the eligibility identity", () => {
    const match = findEligibilityMatch(
      [baseRow({ university_roll_no: "OTHER" })],
      identity,
      "user-1",
    );
    expect(match.matched).toBe(true);
    expect(AUTH_SAFE_MESSAGES.eligibilityUnconfirmed).not.toMatch(/College/i);
  });
});
