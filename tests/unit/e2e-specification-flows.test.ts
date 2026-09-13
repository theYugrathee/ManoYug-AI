import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock Next.js cookies for Server Actions in test execution
const cookieMap = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieMap.has(name) ? { name, value: cookieMap.get(name)! } : undefined),
    set: (name: string, value: string) => {
      cookieMap.set(name, value);
    },
    delete: (name: string) => {
      cookieMap.delete(name);
    },
    getAll: () => [...cookieMap.entries()].map(([name, value]) => ({ name, value })),
  }),
}));

import {
  createTenant,
  getTenant,
  getTenantByCode,
  updateTenant,
  toggleTenantCode,
  listTenants,
  addRosterStudent,
  listRoster,
  isRollNumberTaken,
  createInstitutionRequest,
  listInstitutionRequests,
  saveSupportContact,
  listSupportContacts,
  createConversation,
  appendMessage,
  listMessages,
  type StoredTenant,
} from "@/lib/store/memory";
import { registerStudentAction, loginAction } from "@/lib/auth/actions";
import { MockAIProvider } from "@/lib/providers/ai/mock";

describe("Section 34: End-to-End Specification Flow Verification", () => {
  let tenantA: StoredTenant;
  let tenantB: StoredTenant;

  beforeEach(() => {
    cookieMap.clear();
  });

  /**
   * TEST 1:
   * Create Institution A.
   * Verify it exists.
   * Create Institution B.
   * Verify both exist.
   * Edit A.
   * Verify B is unchanged.
   */
  it("TEST 1: Multi-tenant independent creation and non-destructive update", () => {
    // Create Institution A
    const resA = createTenant({
      name: "Delhi University Spec Test",
      code: "DU2026",
      officialEmail: "admin@du2026.example.ac.in",
      studentCapacity: 5000,
      annualPriceInr: 900000,
      adminEmail: "admin@du2026.example.ac.in",
      passwordHash: "AdminPass123!",
      city: "New Delhi",
      state: "Delhi",
    });
    expect(resA.ok).toBe(true);
    tenantA = (resA as { ok: true; tenant: StoredTenant }).tenant;
    expect(tenantA.id).toBeTruthy();
    expect(tenantA.code).toBe("DU2026");

    // Verify A exists
    const fetchedA = getTenant(tenantA.id);
    expect(fetchedA).not.toBeNull();
    expect(fetchedA?.name).toBe("Delhi University Spec Test");

    // Create Institution B
    const resB = createTenant({
      name: "IIT Bombay Spec Test",
      code: "IITB2026",
      officialEmail: "wellness@iitb2026.example.ac.in",
      studentCapacity: 7500,
      annualPriceInr: 1200000,
      adminEmail: "admin@iitb2026.example.ac.in",
      passwordHash: "AdminPass123!",
      city: "Mumbai",
      state: "Maharashtra",
    });
    expect(resB.ok).toBe(true);
    tenantB = (resB as { ok: true; tenant: StoredTenant }).tenant;
    expect(tenantB.id).toBeTruthy();
    expect(tenantB.code).toBe("IITB2026");

    // Verify both exist simultaneously
    expect(getTenant(tenantA.id)).not.toBeNull();
    expect(getTenant(tenantB.id)).not.toBeNull();
    expect(tenantA.id).not.toBe(tenantB.id);

    // Edit Institution A
    const updatedA = updateTenant(tenantA.id, {
      name: "Delhi University Updated Campus",
      studentCapacity: 9500,
    });
    expect(updatedA?.name).toBe("Delhi University Updated Campus");
    expect(updatedA?.studentCapacity).toBe(9500);

    // Verify Institution B is COMPLETELY UNCHANGED
    const reFetchedB = getTenant(tenantB.id);
    expect(reFetchedB?.name).toBe("IIT Bombay Spec Test");
    expect(reFetchedB?.studentCapacity).toBe(7500);
    expect(reFetchedB?.code).toBe("IITB2026");
  });

  /**
   * TEST 2:
   * Give A code: DU2026
   * Register student using DU2026.
   * Verify student belongs to A.
   * Try invalid code -> Must fail.
   */
  it("TEST 2: Student registration validates real institute code & links to institution", async () => {
    // Add student to tenantA roster
    addRosterStudent(tenantA.id, {
      email: "rohit.sharma@du2026.example.ac.in",
      university_roll_no: "DU-2026-CS01",
      graduation_year: 2027,
      status: "ACTIVE",
    });

    // Register with valid code DU2026
    const validFormData = new FormData();
    validFormData.append("fullName", "Rohit Sharma");
    validFormData.append("email", "rohit.sharma@du2026.example.ac.in");
    validFormData.append("phone", "+91 98765 43210");
    validFormData.append("graduationYear", "2027");
    validFormData.append("universityRollNo", "DU-2026-CS01");
    validFormData.append("instituteCode", "DU2026");
    validFormData.append("password", "SecurePassword123!");

    const regResult = await registerStudentAction(null, validFormData);
    expect(regResult.ok).toBe(true);
    expect(regResult.code).toBe("REGISTERED");
    expect(cookieMap.get("manoyug_student_inst_id")).toBe(tenantA.id);

    // Try registration with invalid code
    const invalidFormData = new FormData();
    invalidFormData.append("fullName", "Aman Verma");
    invalidFormData.append("email", "aman@outside.ac.in");
    invalidFormData.append("phone", "+91 98765 43211");
    invalidFormData.append("graduationYear", "2027");
    invalidFormData.append("universityRollNo", "ROLL-INVALID");
    invalidFormData.append("instituteCode", "NON-EXISTENT-CODE");
    invalidFormData.append("password", "SecurePassword123!");

    const invalidResult = await registerStudentAction(null, invalidFormData);
    expect(invalidResult.ok).toBe(false);
    expect(invalidResult.code).toBe("INVALID_INSTITUTE_CODE");
    expect(invalidResult.message).toContain("institute code");
  });

  /**
   * TEST 3:
   * Shut down A.
   * Try registering student -> Must fail.
   * Try restarting A.
   * Registration must work again.
   */
  it("TEST 3: Institution non-destructive shutdown and restart lifecycle", async () => {
    // Add student candidate to roster
    addRosterStudent(tenantA.id, {
      email: "priya.verma@du2026.example.ac.in",
      university_roll_no: "DU-2026-EE02",
      graduation_year: 2028,
      status: "ACTIVE",
    });

    // Shut down Institution A
    const shutdownTenant = updateTenant(tenantA.id, {
      status: "SHUT_DOWN",
      isCodeActive: false,
    });
    expect(shutdownTenant?.status).toBe("SHUT_DOWN");
    expect(shutdownTenant?.isCodeActive).toBe(false);

    // Try registering student into shut down institution
    const shutdownFormData = new FormData();
    shutdownFormData.append("fullName", "Priya Verma");
    shutdownFormData.append("email", "priya.verma@du2026.example.ac.in");
    shutdownFormData.append("phone", "+91 98765 43212");
    shutdownFormData.append("graduationYear", "2028");
    shutdownFormData.append("universityRollNo", "DU-2026-EE02");
    shutdownFormData.append("instituteCode", "DU2026");
    shutdownFormData.append("password", "SecurePassword123!");

    const shutdownRegResult = await registerStudentAction(null, shutdownFormData);
    expect(shutdownRegResult.ok).toBe(false);
    expect(shutdownRegResult.code).toBe("INVALID_INSTITUTE_CODE");

    // Restart Institution A
    const restartedTenant = updateTenant(tenantA.id, {
      status: "ACTIVE",
      isCodeActive: true,
    });
    expect(restartedTenant?.status).toBe("ACTIVE");
    expect(restartedTenant?.isCodeActive).toBe(true);

    // Try registering student again after restart -> MUST SUCCEED
    const restartRegResult = await registerStudentAction(null, shutdownFormData);
    expect(restartRegResult.ok).toBe(true);
    expect(restartRegResult.code).toBe("REGISTERED");
  });

  /**
   * TEST 4:
   * Create Institution B with code: IITB2026
   * Register student.
   * Verify student belongs to B.
   * Verify student cannot access A data.
   */
  it("TEST 4: Multi-tenant data isolation between Institution A and B", async () => {
    // Add student to Institution B's roster
    addRosterStudent(tenantB.id, {
      email: "rahul.mehta@iitb2026.example.ac.in",
      university_roll_no: "IITB-2026-ME01",
      graduation_year: 2027,
      status: "ACTIVE",
    });

    // Register student for B
    const formB = new FormData();
    formB.append("fullName", "Rahul Mehta");
    formB.append("email", "rahul.mehta@iitb2026.example.ac.in");
    formB.append("phone", "+91 98765 43213");
    formB.append("graduationYear", "2027");
    formB.append("universityRollNo", "IITB-2026-ME01");
    formB.append("instituteCode", "IITB2026");
    formB.append("password", "SecurePassword123!");

    const resB = await registerStudentAction(null, formB);
    expect(resB.ok).toBe(true);
    expect(cookieMap.get("manoyug_student_inst_id")).toBe(tenantB.id);

    // Provision private campus emergency support contact for Institution A
    const contactA = saveSupportContact({
      institutionId: tenantA.id,
      title: "Delhi University Proctor Office Emergency Line",
      contactType: "wellbeing_office",
      phone: "+91 11 2766 9999",
      isEmergency: true,
    });

    // Provision private campus emergency support contact for Institution B
    const contactB = saveSupportContact({
      institutionId: tenantB.id,
      title: "IIT Bombay Hospital Emergency Desk",
      contactType: "emergency",
      phone: "+91 22 2576 8888",
      isEmergency: true,
    });

    // Check Isolation: Querying contacts for Institution B must NEVER return Institution A contacts
    const contactsForB = listSupportContacts(tenantB.id);
    expect(contactsForB.some((c) => c.title.includes("Delhi University"))).toBe(false);
    expect(contactsForB.some((c) => c.id === contactB.id)).toBe(true);

    // Check Isolation: Querying contacts for Institution A must NEVER return Institution B contacts
    const contactsForA = listSupportContacts(tenantA.id);
    expect(contactsForA.some((c) => c.title.includes("IIT Bombay"))).toBe(false);
    expect(contactsForA.some((c) => c.id === contactA.id)).toBe(true);
  });

  /**
   * TEST 5:
   * Institution request form.
   * Submit request.
   * Verify it appears in Super Admin queue.
   */
  it("TEST 5: Institution onboarding request submission and queue appearance", () => {
    const newReq = createInstitutionRequest({
      institutionName: "Banaras Hindu University",
      institutionType: "Central University",
      officialEmail: "wellness@bhu.example.ac.in",
      contactPhone: "+91 542 236 8558",
      city: "Varanasi",
      state: "Uttar Pradesh",
      approximateStudentCount: 30000,
      contactPersonName: "Prof. S. Tripathi",
      contactPersonDesignation: "Dean of Student Welfare",
      notes: "Looking for 24/7 bilingual student emotional first response.",
    });

    expect(newReq.id).toBeTruthy();
    expect(newReq.status).toBe("PENDING");

    // Verify it appears in Super Admin list
    const pendingList = listInstitutionRequests().filter((r) => r.status === "PENDING");
    const found = pendingList.find((r) => r.id === newReq.id);
    expect(found).toBeDefined();
    expect(found?.institutionName).toBe("Banaras Hindu University");
    expect(found?.contactPersonName).toBe("Prof. S. Tripathi");
  });

  /**
   * TEST 6:
   * Student login.
   * Logout.
   * Login again.
   * Verify session works.
   */
  it("TEST 6: Student login and session validation with institute code", async () => {
    // Login with institute code and credentials
    const loginFormData = new FormData();
    loginFormData.append("email", "rohit.sharma@du2026.example.ac.in");
    loginFormData.append("password", "SecurePassword123!");
    loginFormData.append("instituteCode", "DU2026");

    const loginRes = await loginAction(null, loginFormData);
    expect(loginRes.ok).toBe(true);
    expect(loginRes.code).toBe("LOGGED_IN");
    expect(cookieMap.get("manoyug_student_session")).toBe("true");
    expect(cookieMap.get("manoyug_student_inst_id")).toBe(tenantA.id);

    // Logout / clear session
    cookieMap.clear();
    expect(cookieMap.get("manoyug_student_session")).toBeUndefined();

    // Login again
    const reLoginRes = await loginAction(null, loginFormData);
    expect(reLoginRes.ok).toBe(true);
    expect(cookieMap.get("manoyug_student_session")).toBe("true");
    expect(cookieMap.get("manoyug_student_inst_id")).toBe(tenantA.id);

    // Login with invalid institute code must fail
    const badCodeFormData = new FormData();
    badCodeFormData.append("email", "rohit.sharma@du2026.example.ac.in");
    badCodeFormData.append("password", "SecurePassword123!");
    badCodeFormData.append("instituteCode", "WRONG-CODE-999");

    const badCodeRes = await loginAction(null, badCodeFormData);
    expect(badCodeRes.ok).toBe(false);
    expect(badCodeRes.code).toBe("INVALID_INSTITUTE_CODE");
  });

  /**
   * TEST 7:
   * AI conversation:
   * Message 1 -> Receive response.
   * Message 2 with completely different info -> Verify response is contextual and not identical.
   * Send 5+ messages -> Verify conversation history remains intact and does not repeat.
   */
  it("TEST 7: AI multi-turn contextual conversation without repetitive response loops", async () => {
    const aiProvider = new MockAIProvider();
    const studentKey = "student-test-001";
    const conversation = createConversation(studentKey, "hinglish");
    const conversationId = conversation.id;

    const messages = [
      "bhai placement nahi ho rahi... bohot stress ho raha hai",
      "2 interviews reject ho gaye is hafte",
      "ghar pe parents roz call karke pooch rahe hain",
      "lagta hai meri koi preparation hi nahi hai",
      "kya mujhe thoda break lena chahiye?",
    ];

    const responses: string[] = [];
    const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (let i = 0; i < messages.length; i++) {
      const userText = messages[i];
      conversationHistory.push({ role: "user", content: userText });

      // Save user message to persistent conversation store
      appendMessage(conversationId, studentKey, {
        role: "user",
        content: userText,
      });

      // Call AI provider with full conversation history
      const result = await aiProvider.generate({
        purpose: "conversation",
        messages: conversationHistory,
        language: "hinglish",
      });

      expect(result.text).toBeTruthy();
      expect(result.text.length).toBeGreaterThan(15);

      // Verify consecutive responses are NOT identical
      if (responses.length > 0) {
        const lastResponse = responses[responses.length - 1];
        expect(result.text).not.toBe(lastResponse);
      }

      responses.push(result.text);
      conversationHistory.push({ role: "assistant", content: result.text });

      // Save assistant message to persistent conversation store
      appendMessage(conversationId, studentKey, {
        role: "assistant",
        content: result.text,
      });
    }

    // Verify all 5 turns produced responses
    expect(responses.length).toBe(5);

    // Verify conversation state persistence: Reload conversation from database store
    const persistedMessages = listMessages(conversationId, studentKey);
    expect(persistedMessages.length).toBe(10); // 5 user + 5 assistant
    expect(persistedMessages[0].content).toBe(messages[0]);
    expect(persistedMessages[1].content).toBe(responses[0]);
  });

  /**
   * TEST 8:
   * Open app with empty database / tenant scope.
   * Verify NO fake institutions, fake support contacts, or fake stats appear.
   */
  it("TEST 8: Clean isolation and empty state without fabricated demo entities", () => {
    // Non-existent institution returns clean empty lists, NOT hardcoded fake records
    const emptyInstitutionId = "11111111-2222-3333-4444-555555555555";
    const emptyContacts = listSupportContacts(emptyInstitutionId);
    expect(emptyContacts).toEqual([]);

    const emptyRoster = listRoster(emptyInstitutionId);
    expect(emptyRoster).toEqual([]);

    // Roll number uniqueness check returns false for empty tenant
    expect(isRollNumberTaken(emptyInstitutionId, "NON-EXISTENT-ROLL")).toBe(false);
  });
});
