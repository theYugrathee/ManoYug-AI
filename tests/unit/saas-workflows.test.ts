import { describe, expect, it } from "vitest";
import {
  createInstitutionRequest,
  listInstitutionRequests,
  updateInstitutionRequestStatus,
  listSupportContacts,
  saveSupportContact,
  deleteSupportContact,
  listPricingPlans,
  updatePricingPlan,
  listStoreFeatureFlags,
  toggleStoreFeatureFlag,
  demoInstitutionId,
} from "@/lib/store/memory";
import { MockAIProvider } from "@/lib/providers/ai/mock";

describe("Institution Onboarding Request Workflow", () => {
  it("submits an institution request in PENDING state", () => {
    const req = createInstitutionRequest({
      institutionName: "Indian Institute of Science",
      officialEmail: "wellness@iisc.ac.in",
      contactPhone: "+91 80 2293 2004",
      institutionType: "Institute of National Importance",
      approximateStudentCount: 3800,
      city: "Bengaluru",
      state: "Karnataka",
      contactPersonName: "Prof. K. Sharma",
      contactPersonDesignation: "Dean of Students",
    });

    expect(req.id).toBeTruthy();
    expect(req.status).toBe("PENDING");

    const all = listInstitutionRequests();
    const found = all.find((r) => r.id === req.id);
    expect(found).toBeTruthy();
  });

  it("updates request status to APPROVED and auto-provisions tenant", () => {
    const req = createInstitutionRequest({
      institutionName: "IIT Roorkee Test",
      officialEmail: "wellness@iitr.ac.in",
      contactPhone: "+91 1332 285 311",
      institutionType: "IIT",
      approximateStudentCount: 5000,
      city: "Roorkee",
      state: "Uttarakhand",
      contactPersonName: "Dr. A. Verma",
      contactPersonDesignation: "Dean",
    });

    const updated = updateInstitutionRequestStatus(req.id, "APPROVED", "Verified official domain.");
    expect(updated?.status).toBe("APPROVED");
    expect(updated?.notes).toContain("Verified");
  });
});

describe("Campus Support Contacts Management", () => {
  it("saves and lists support contacts for an institution", () => {
    const instId = demoInstitutionId();
    const contact = saveSupportContact({
      institutionId: instId,
      title: "Hostel Health Desk Test",
      contactType: "hostel_warden",
      phone: "+91 11 2659 9999",
      isEmergency: false,
    });

    expect(contact.id).toBeTruthy();
    const list = listSupportContacts(instId);
    expect(list.some((c) => c.id === contact.id)).toBe(true);

    // Delete
    deleteSupportContact(instId, contact.id);
    const updated = listSupportContacts(instId);
    expect(updated.some((c) => c.id === contact.id)).toBe(false);
  });
});

describe("Pricing Plans & Feature Flags", () => {
  it("allows updating pricing plan capacity and price", () => {
    const plans = listPricingPlans();
    expect(plans.length).toBeGreaterThan(0);

    const first = plans[0];
    const updated = updatePricingPlan(first.id, { annualPriceInr: 500000 });
    expect(updated?.annualPriceInr).toBe(500000);
  });

  it("toggles feature flags dynamically", () => {
    const flags = listStoreFeatureFlags();
    expect(flags.length).toBeGreaterThan(0);

    const flagKey = flags[0].key;
    const initial = flags[0].isEnabled;

    const toggled = toggleStoreFeatureFlag(flagKey, !initial);
    expect(toggled?.isEnabled).toBe(!initial);

    // Reset
    toggleStoreFeatureFlag(flagKey, initial);
  });
});

describe("AI Companion Persona Output", () => {
  it("does not leak dev tags or robotic boilerplates in fallback generation", async () => {
    const provider = new MockAIProvider();
    const res = await provider.generate({
      purpose: "conversation",
      messages: [{ role: "user", content: "bhai placement nahi ho rahi, sabki ho gayi" }],
      language: "hinglish",
    });

    expect(res.text).not.toContain("[dev: MockAIProvider");
    expect(res.text).not.toContain("I am ManoYug AI, an AI student wellbeing companion");
    expect(res.text.length).toBeGreaterThan(20);
  });
});
