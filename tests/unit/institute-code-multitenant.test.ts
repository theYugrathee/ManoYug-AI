import { describe, expect, it, beforeEach } from "vitest";
import {
  registerStudentSchema,
  instituteLoginSchema,
  createInstituteSchema,
} from "@/lib/validation/auth";
import { chatMessageSchema } from "@/lib/validation/student";
import {
  getTenantByCode,
  verifyStudentInRoster,
  authenticateInstitute,
  toggleTenantCode,
  deleteTenantSafely,
  listTenants,
  listSupportContacts,
  saveSupportContact,
  addRosterStudent,
} from "@/lib/store/memory";
import { getActivePrompt } from "@/lib/ai/prompts";

describe("Institute Code & Multi-Tenant Security Tests", () => {
  it("validates registerStudentSchema with institute code", () => {
    const valid = registerStudentSchema.safeParse({
      fullName: "Priya Singh",
      email: "priya.singh@iitd.ac.in",
      phone: "+91 98765 43211",
      graduationYear: 2027,
      universityRollNo: "2023EE10204",
      instituteCode: "iitd-001",
      password: "StrongPass123!",
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.instituteCode).toBe("IITD-001");
      expect(valid.data.email).toBe("priya.singh@iitd.ac.in");
    }
  });

  it("finds tenant by unique institute code case-insensitively", () => {
    const tenant = getTenantByCode("iitd-001");
    expect(tenant).not.toBeNull();
    expect(tenant?.name).toContain("Indian Institute of Technology Delhi");
    expect(tenant?.isCodeActive).toBe(true);
  });

  it("returns null for non-existent institute code", () => {
    const tenant = getTenantByCode("UNKNOWN-999");
    expect(tenant).toBeNull();
  });

  it("verifies approved student email in institute roster", () => {
    const tenant = getTenantByCode("IITD-001")!;
    expect(tenant).toBeDefined();

    // Approved student
    const checkApproved = verifyStudentInRoster(tenant.id, "student@iitd.ac.in");
    expect(checkApproved.verified).toBe(true);
    expect(checkApproved.student?.university_roll_no).toBe("2022CS10101");

    // Unapproved student
    const checkUnapproved = verifyStudentInRoster(tenant.id, "random.outsider@gmail.com");
    expect(checkUnapproved.verified).toBe(false);
    expect(checkUnapproved.student).toBeUndefined();
  });

  it("authenticates institute using code + password", () => {
    const authSuccess = authenticateInstitute("IITD-001", "Admin123!");
    expect(authSuccess.ok).toBe(true);
    expect(authSuccess.tenant?.code).toBe("IITD-001");

    const authWrongPass = authenticateInstitute("IITD-001", "WrongPassword!");
    expect(authWrongPass.ok).toBe(false);
    expect(authWrongPass.error).toContain("Invalid credentials");

    const authWrongCode = authenticateInstitute("FAKE-000", "Admin123!");
    expect(authWrongCode.ok).toBe(false);
  });

  it("blocks registration when institute code is disabled", () => {
    const tenant = getTenantByCode("DU-001")!;
    expect(tenant).toBeDefined();

    // Disable code
    toggleTenantCode(tenant.id, false);
    const authDisabled = authenticateInstitute("DU-001", "Admin123!");
    expect(authDisabled.ok).toBe(false);
    expect(authDisabled.error).toContain("unavailable");

    // Re-enable
    toggleTenantCode(tenant.id, true);
    const authEnabled = authenticateInstitute("DU-001", "Admin123!");
    expect(authEnabled.ok).toBe(true);
  });

  it("enforces strict multi-tenant data isolation for campus support contacts", () => {
    const iitd = getTenantByCode("IITD-001")!;
    const du = getTenantByCode("DU-001")!;

    // Save support contact specifically for DU
    saveSupportContact({
      institutionId: du.id,
      title: "Delhi University Counselling Cell",
      contactType: "wellbeing_office",
      phone: "+91 11 2766 0000",
      isEmergency: false,
    });

    const duContacts = listSupportContacts(du.id);
    const iitdContacts = listSupportContacts(iitd.id);

    expect(duContacts.some((c) => c.title.includes("Delhi University"))).toBe(true);
    // IITD must NEVER see DU contacts
    expect(iitdContacts.some((c) => c.title.includes("Delhi University"))).toBe(false);
  });

  it("enforces 800 character maximum limit on student messages", () => {
    // Exactly 800 chars
    const exactly800 = "a".repeat(800);
    const valid = chatMessageSchema.safeParse({ message: exactly800 });
    expect(valid.success).toBe(true);

    // 801 chars (exceeds limit)
    const over800 = "a".repeat(801);
    const invalid = chatMessageSchema.safeParse({ message: over800 });
    expect(invalid.success).toBe(false);
  });

  it("verifies concise prompt style target in active master prompt", () => {
    const prompt = getActivePrompt();
    expect(prompt.content).toContain("2–4 short sentences");
    expect(prompt.content).toContain("empathy");
    expect(prompt.content).toContain("Tele-MANAS");
  });
});
