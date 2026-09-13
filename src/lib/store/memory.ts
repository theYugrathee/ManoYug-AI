import { randomUUID } from "node:crypto";
import type { CaseStatus, SafetyState } from "@/types/roles";
import { verifyPassword } from "@/lib/auth/password";

/**
 * Application data store used when Supabase is not connected.
 * Labelled development persistence in-process — swap to Postgres repos in production.
 */

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  safetyState?: SafetyState;
  blocked?: boolean;
  createdAt: string;
};

export type StoredConversation = {
  id: string;
  studentKey: string;
  title: string;
  language: "en" | "hi" | "hinglish";
  latestSafetyState: SafetyState;
  createdAt: string;
  updatedAt: string;
};

export type StoredCase = {
  id: string;
  studentKey: string;
  status: CaseStatus;
  riskState: SafetyState;
  source: string;
  conversationId?: string;
  aiSummary?: {
    facts: string[];
    systemSignals: string[];
    interpretation: string[];
  };
  notes: Array<{ id: string; authorKey: string; body: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type StoredCheckin = {
  id: string;
  studentKey: string;
  period: "daily" | "weekly";
  mood: number;
  stress: number;
  energy: number;
  sleep: number;
  academicPressure: number;
  socialConnection: number;
  note?: string;
  createdAt: string;
};

export type StoredAppointment = {
  id: string;
  studentKey: string;
  counsellorKey: string;
  startsAt: string;
  endsAt: string;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  createdAt: string;
};

export type StoredTenant = {
  id: string;
  name: string;
  slug: string;
  code: string;
  isCodeActive: boolean;
  status: "ACTIVE" | "SHUT_DOWN" | "SUSPENDED" | "ARCHIVED";
  studentCapacity: number;
  annualPriceInr: number;
  planLabel: string;
  activeStudents: number;
  contractStart: string;
  contractEnd: string;
  officialEmail?: string;
  adminEmail?: string;
  passwordHash?: string;
  institutionType?: string;
  phone?: string;
  city?: string;
  state?: string;
  website?: string;
};

export type StoredRosterRow = {
  id: string;
  institutionId: string;
  email: string;
  phone?: string;
  name?: string;
  university_roll_no: string;
  graduation_year?: number;
  department?: string;
  programme?: string;
  batch?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
};

export type StoredInstitutionRequest = {
  id: string;
  institutionName: string;
  officialEmail: string;
  contactPhone: string;
  institutionType: string;
  approximateStudentCount: number;
  city: string;
  state: string;
  website?: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO";
  institutionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredSupportContact = {
  id: string;
  institutionId: string;
  title: string;
  contactType: "wellbeing_office" | "counsellor" | "campus_security" | "hostel_warden" | "emergency" | "student_affairs";
  phone: string;
  email?: string;
  location?: string;
  operatingHours?: string;
  isEmergency: boolean;
  createdAt: string;
};

export type StoredPricingPlan = {
  id: string;
  name: string;
  slug: string;
  studentCapacity: number;
  annualPriceInr: number;
  description: string;
  features: string[];
  isActive: boolean;
};

export type StoredFeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  environment: string;
};

export type StoredSafetyEvent = {
  id: string;
  institutionId: string;
  userKey: string;
  conversationId?: string;
  messageId?: string;
  state: SafetyState;
  signals: string[];
  recommendedAction: string;
  createdAt: string;
};

export type TimelineEvent = {
  id: string;
  studentKey: string;
  type: "checkin" | "exercise" | "support" | "chat" | "appointment" | "safety";
  label: string;
  createdAt: string;
};

type MemoryDb = {
  conversations: Map<string, StoredConversation>;
  messages: Map<string, StoredMessage[]>;
  cases: Map<string, StoredCase>;
  checkins: Map<string, StoredCheckin[]>;
  supportRequests: Map<
    string,
    { id: string; studentKey: string; createdAt: string; note: string }[]
  >;
  appointments: Map<string, StoredAppointment>;
  tenants: Map<string, StoredTenant>;
  roster: Map<string, StoredRosterRow>;
  timeline: Map<string, TimelineEvent[]>;
  exerciseCompletions: Map<string, { slug: string; at: string }[]>;
  institutionRequests: Map<string, StoredInstitutionRequest>;
  supportContacts: Map<string, StoredSupportContact[]>;
  pricingPlans: Map<string, StoredPricingPlan>;
  featureFlags: Map<string, StoredFeatureFlag>;
  safetyEvents: Map<string, StoredSafetyEvent[]>;
};

const globalStore = globalThis as unknown as { __manoyugMemory?: MemoryDb };

function seedInitialData(db: MemoryDb) {
  // Real multi-tenant architecture: starts empty until institutions are provisioned or requested.
  if (db.pricingPlans.size === 0) {
    const plans: StoredPricingPlan[] = [
      {
        id: "plan-5k",
        name: "Campus Tier 1",
        slug: "tier-5000",
        studentCapacity: 5000,
        annualPriceInr: 400000,
        description: "For colleges and institutes up to 5,000 enrolled students.",
        features: ["Up to 5,000 verified students", "Full ManoYug AI Companion", "External Deterministic Safety Engine", "Aggregate Wellbeing Trends", "CSV Roster Sync"],
        isActive: true,
      },
      {
        id: "plan-10k",
        name: "Campus Tier 2",
        slug: "tier-10000",
        studentCapacity: 10000,
        annualPriceInr: 800000,
        description: "For medium universities up to 10,000 enrolled students.",
        features: ["Up to 10,000 verified students", "Full ManoYug AI Companion", "Tele-MANAS Verified Routing", "Custom Campus Support Directory", "Department-level Analytics"],
        isActive: true,
      },
      {
        id: "plan-15k",
        name: "Campus Tier 3",
        slug: "tier-15000",
        studentCapacity: 15000,
        annualPriceInr: 1200000,
        description: "For larger colleges and multi-department institutions up to 15,000 enrolled students.",
        features: ["Up to 15,000 verified students", "Full ManoYug AI Companion", "High Concurrency & SLA", "Custom Campus Resource Direct-dial", "Priority Support & Training"],
        isActive: true,
      },
      {
        id: "plan-20k",
        name: "University Tier 4",
        slug: "tier-20000",
        studentCapacity: 20000,
        annualPriceInr: 1600000,
        description: "For state and central universities up to 20,000 enrolled students.",
        features: ["Up to 20,000 verified students", "Dedicated Tenant Isolation", "Priority Onboarding", "Custom Analytics Exports", "Multi-admin Governance"],
        isActive: true,
      },
      {
        id: "plan-25k",
        name: "University Tier 5",
        slug: "tier-25000",
        studentCapacity: 25000,
        annualPriceInr: 2000000,
        description: "For university clusters up to 25,000 enrolled students.",
        features: ["Up to 25,000 verified students", "Full ManoYug AI Companion", "Dedicated Support Manager", "Custom Branding & Portals"],
        isActive: true,
      },
      {
        id: "plan-50k",
        name: "Mega Campus Tier 6",
        slug: "tier-50000",
        studentCapacity: 50000,
        annualPriceInr: 4000000,
        description: "For large university systems and technical boards up to 50,000 students.",
        features: ["Up to 50,000 verified students", "Custom SLA & Uptime Guarantee", "Multi-Campus Federated Directory", "Dedicated Engineering Support"],
        isActive: true,
      },
      {
        id: "plan-100k",
        name: "Statewide / Consortium",
        slug: "tier-100000",
        studentCapacity: 100000,
        annualPriceInr: 8000000,
        description: "For statewide higher education boards and consortia up to 1,00,000 students.",
        features: ["Up to 1,00,000 verified students", "State-level Wellbeing Insights", "Custom On-prem/Hybrid Gateway Options", "24/7 Priority Emergency Escalation"],
        isActive: true,
      },
    ];
    for (const p of plans) db.pricingPlans.set(p.id, p);
  }

  if (db.featureFlags.size === 0) {
    const flags: StoredFeatureFlag[] = [
      { id: "flag-1", key: "chat.streaming", name: "Realtime Streaming", description: "Stream assistant tokens in realtime", isEnabled: true, environment: "all" },
      { id: "flag-2", key: "multilingual.hinglish", name: "Hinglish Cultural Persona", description: "Natural Indian student cultural understanding", isEnabled: true, environment: "all" },
      { id: "flag-3", key: "analytics.advanced_trends", name: "Wellbeing Themes & Seasonality", description: "Exam and placement stress trend aggregation", isEnabled: true, environment: "all" },
      { id: "flag-4", key: "tele_manas.direct_bridge", name: "Tele-MANAS One-Touch Bridge", description: "Instant dialer button for National Helpline 14416", isEnabled: true, environment: "all" },
    ];
    for (const f of flags) db.featureFlags.set(f.key, f);
  }

  if (!db.supportContacts.has(demoInstitutionId())) {
    const contacts: StoredSupportContact[] = [
      {
        id: randomUUID(),
        institutionId: demoInstitutionId(),
        title: "IIT Delhi Student Wellbeing Cell",
        contactType: "wellbeing_office",
        phone: "+91 11 2659 7135",
        email: "wellbeing@iitd.ac.in",
        location: "Student Activity Centre, 2nd Floor",
        operatingHours: "Monday – Saturday: 9:00 AM – 7:00 PM",
        isEmergency: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        institutionId: demoInstitutionId(),
        title: "Campus Security & Emergency Desk",
        contactType: "campus_security",
        phone: "+91 11 2659 1000",
        email: "security@iitd.ac.in",
        location: "Main Gate Security HQ",
        operatingHours: "24/7",
        isEmergency: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        institutionId: demoInstitutionId(),
        title: "Hostel Affairs Dean Office",
        contactType: "hostel_warden",
        phone: "+91 11 2659 7140",
        email: "hostels@iitd.ac.in",
        location: "Administrative Block Block-A",
        operatingHours: "9:30 AM – 5:30 PM",
        isEmergency: false,
        createdAt: new Date().toISOString(),
      },
    ];
    db.supportContacts.set(demoInstitutionId(), contacts);
  }
}

function db(): MemoryDb {
  if (!globalStore.__manoyugMemory) {
    globalStore.__manoyugMemory = {
      conversations: new Map(),
      messages: new Map(),
      cases: new Map(),
      checkins: new Map(),
      supportRequests: new Map(),
      appointments: new Map(),
      tenants: new Map(),
      roster: new Map(),
      timeline: new Map(),
      exerciseCompletions: new Map(),
      institutionRequests: new Map(),
      supportContacts: new Map(),
      pricingPlans: new Map(),
      featureFlags: new Map(),
      safetyEvents: new Map(),
    };
  }
  seedInitialData(globalStore.__manoyugMemory);
  return globalStore.__manoyugMemory;
}

function pushTimeline(
  studentKey: string,
  type: TimelineEvent["type"],
  label: string,
) {
  const list = db().timeline.get(studentKey) ?? [];
  list.unshift({
    id: randomUUID(),
    studentKey,
    type,
    label,
    createdAt: new Date().toISOString(),
  });
  db().timeline.set(studentKey, list.slice(0, 100));
}

export function listConversations(studentKey: string): StoredConversation[] {
  return [...db().conversations.values()]
    .filter((c) => c.studentKey === studentKey)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getConversation(
  id: string,
  studentKey: string,
): StoredConversation | null {
  const c = db().conversations.get(id);
  if (!c || c.studentKey !== studentKey) return null;
  return c;
}

export function createConversation(
  studentKey: string,
  language: StoredConversation["language"] = "en",
): StoredConversation {
  const now = new Date().toISOString();
  const conversation: StoredConversation = {
    id: randomUUID(),
    studentKey,
    title: "New conversation",
    language,
    latestSafetyState: "GREEN",
    createdAt: now,
    updatedAt: now,
  };
  db().conversations.set(conversation.id, conversation);
  db().messages.set(conversation.id, []);
  return conversation;
}

export function listMessages(
  conversationId: string,
  studentKey: string,
): StoredMessage[] {
  const c = getConversation(conversationId, studentKey);
  if (!c) return [];
  return db().messages.get(conversationId) ?? [];
}

export function appendMessage(
  conversationId: string,
  studentKey: string,
  message: Omit<StoredMessage, "id" | "conversationId" | "createdAt">,
): StoredMessage | null {
  const c = getConversation(conversationId, studentKey);
  if (!c) return null;
  const row: StoredMessage = {
    id: randomUUID(),
    conversationId,
    createdAt: new Date().toISOString(),
    ...message,
  };
  const list = db().messages.get(conversationId) ?? [];
  list.push(row);
  db().messages.set(conversationId, list);
  c.updatedAt = row.createdAt;
  if (message.role === "user" && c.title === "New conversation") {
    c.title = message.content.slice(0, 48) || "Conversation";
  }
  if (message.safetyState) c.latestSafetyState = message.safetyState;
  db().conversations.set(c.id, c);
  if (message.role === "user") {
    pushTimeline(studentKey, "chat", "Message sent to ManoYug AI");
  }
  return row;
}

export function createEscalationCase(input: {
  studentKey: string;
  riskState: SafetyState;
  source: string;
  conversationId?: string;
  signals?: string[];
}): StoredCase {
  const now = new Date().toISOString();
  const row: StoredCase = {
    id: randomUUID(),
    studentKey: input.studentKey,
    status: "NEW",
    riskState: input.riskState,
    source: input.source,
    conversationId: input.conversationId,
    aiSummary: {
      facts: ["Student interaction triggered an operational safety state."],
      systemSignals: input.signals ?? [input.riskState],
      interpretation: [
        "Possible elevated concern — for support review, not a clinical diagnosis.",
      ],
    },
    notes: [],
    createdAt: now,
    updatedAt: now,
  };
  db().cases.set(row.id, row);
  pushTimeline(input.studentKey, "safety", `Safety state ${input.riskState}`);
  return row;
}

export function getCase(id: string): StoredCase | null {
  return db().cases.get(id) ?? null;
}

export function listCases(): StoredCase[] {
  return [...db().cases.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function updateCaseStatus(
  id: string,
  status: CaseStatus,
): StoredCase | null {
  const row = db().cases.get(id);
  if (!row) return null;
  row.status = status;
  row.updatedAt = new Date().toISOString();
  db().cases.set(id, row);
  return row;
}

export function addCaseNote(
  caseId: string,
  authorKey: string,
  body: string,
): StoredCase | null {
  const row = db().cases.get(caseId);
  if (!row) return null;
  row.notes.push({
    id: randomUUID(),
    authorKey,
    body,
    createdAt: new Date().toISOString(),
  });
  row.updatedAt = new Date().toISOString();
  db().cases.set(caseId, row);
  return row;
}

export function addCheckin(
  studentKey: string,
  data: Omit<StoredCheckin, "id" | "studentKey" | "createdAt">,
): StoredCheckin {
  const row: StoredCheckin = {
    id: randomUUID(),
    studentKey,
    createdAt: new Date().toISOString(),
    ...data,
  };
  const list = db().checkins.get(studentKey) ?? [];
  list.unshift(row);
  db().checkins.set(studentKey, list);
  pushTimeline(studentKey, "checkin", `${data.period} check-in saved`);
  return row;
}

export function listCheckins(studentKey: string): StoredCheckin[] {
  return db().checkins.get(studentKey) ?? [];
}

export function requestHumanSupport(studentKey: string, note: string) {
  const row = {
    id: randomUUID(),
    studentKey,
    note,
    createdAt: new Date().toISOString(),
  };
  const list = db().supportRequests.get(studentKey) ?? [];
  list.unshift(row);
  db().supportRequests.set(studentKey, list);
  createEscalationCase({
    studentKey,
    riskState: "AMBER",
    source: "student_request",
  });
  pushTimeline(studentKey, "support", "Human support requested");
  return row;
}

export function listTimeline(studentKey: string): TimelineEvent[] {
  return db().timeline.get(studentKey) ?? [];
}

export function completeExercise(studentKey: string, slug: string) {
  const list = db().exerciseCompletions.get(studentKey) ?? [];
  list.unshift({ slug, at: new Date().toISOString() });
  db().exerciseCompletions.set(studentKey, list);
  pushTimeline(studentKey, "exercise", `Completed exercise: ${slug}`);
  return list[0];
}

export function listExerciseCompletions(studentKey: string) {
  return db().exerciseCompletions.get(studentKey) ?? [];
}

export function listTenants(): StoredTenant[] {
  return [...db().tenants.values()];
}

export function getTenant(id: string): StoredTenant | null {
  return db().tenants.get(id) ?? null;
}

export function getTenantByCode(code: string): StoredTenant | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return [...db().tenants.values()].find(
    (t) => t.code?.toUpperCase() === normalized,
  ) ?? null;
}

/**
 * Explicit INSERT for new tenants. Rejects if the code is already taken.
 * Never overwrites an existing tenant.
 */
export function createTenant(
  tenant: Partial<Omit<StoredTenant, "id" | "code" | "name">> & {
    id?: string;
    code: string;
    name: string;
    officialEmail?: string;
  },
): { ok: true; tenant: StoredTenant } | { ok: false; error: string } {
  const id = tenant.id || randomUUID();
  const normalizedCode = tenant.code.trim().toUpperCase();
  // Guard: duplicate code
  const codeConflict = getTenantByCode(normalizedCode);
  if (codeConflict) {
    return { ok: false, error: `Institute code "${normalizedCode}" is already in use by "${codeConflict.name}".` };
  }
  // Guard: duplicate ID
  if (db().tenants.has(id)) {
    return { ok: false, error: "Tenant ID collision — please retry." };
  }
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);

  const capacity = tenant.studentCapacity ?? 2500;
  const row: StoredTenant = {
    slug: tenant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    studentCapacity: capacity,
    annualPriceInr: tenant.annualPriceInr ?? 450000,
    planLabel: tenant.planLabel ?? `Up to ${capacity.toLocaleString("en-IN")} students`,
    contractStart: now.toISOString().slice(0, 10),
    contractEnd: end.toISOString().slice(0, 10),
    ...tenant,
    id,
    code: normalizedCode,
    isCodeActive: tenant.isCodeActive ?? true,
    status: tenant.status ?? "ACTIVE",
    activeStudents: tenant.activeStudents ?? 0,
  };
  db().tenants.set(id, row);
  return { ok: true, tenant: row };
}

/** Update an existing tenant's fields (for edits only). */
export function updateTenant(id: string, updates: Partial<Omit<StoredTenant, "id">>): StoredTenant | null {
  const tenant = db().tenants.get(id);
  if (!tenant) return null;
  Object.assign(tenant, updates);
  db().tenants.set(id, tenant);
  return tenant;
}

/** Check if a roll number is already registered within a specific institution by another student. */
export function isRollNumberTaken(
  institutionId: string,
  rollNumber: string,
  excludeEmail?: string,
): boolean {
  const normalized = rollNumber.trim().toUpperCase();
  const normalizedExclude = excludeEmail?.trim().toLowerCase();
  return [...db().roster.values()].some(
    (r) =>
      r.institutionId === institutionId &&
      r.university_roll_no.toUpperCase() === normalized &&
      r.status === "ACTIVE" &&
      (normalizedExclude ? r.email.toLowerCase() !== normalizedExclude : true),
  );
}

export function toggleTenantCode(id: string, isCodeActive: boolean): StoredTenant | null {
  const tenant = db().tenants.get(id);
  if (!tenant) return null;
  tenant.isCodeActive = isCodeActive;
  db().tenants.set(id, tenant);
  return tenant;
}

export function resetInstitutePassword(id: string, newPassword: string): StoredTenant | null {
  const tenant = db().tenants.get(id);
  if (!tenant) return null;
  tenant.passwordHash = newPassword;
  db().tenants.set(id, tenant);
  return tenant;
}

export function shutdownTenant(id: string): StoredTenant | null {
  const tenant = db().tenants.get(id);
  if (!tenant) return null;
  tenant.status = "SHUT_DOWN";
  tenant.isCodeActive = false;
  db().tenants.set(id, tenant);
  return tenant;
}

export function restartTenant(id: string): StoredTenant | null {
  const tenant = db().tenants.get(id);
  if (!tenant) return null;
  tenant.status = "ACTIVE";
  tenant.isCodeActive = true;
  db().tenants.set(id, tenant);
  return tenant;
}

export function deleteTenantSafely(id: string): boolean {
  const tenant = db().tenants.get(id);
  if (!tenant) return false;
  // Soft delete / archive status to avoid orphaning data
  tenant.status = "ARCHIVED";
  tenant.isCodeActive = false;
  db().tenants.set(id, tenant);
  return true;
}

export function permanentDeleteTenant(id: string): boolean {
  const exists = db().tenants.has(id);
  if (!exists) return false;
  db().tenants.delete(id);
  // Remove associated roster rows
  for (const [key, r] of db().roster.entries()) {
    if (r.institutionId === id) db().roster.delete(key);
  }
  // Remove associated support contacts
  db().supportContacts.delete(id);
  return true;
}

export function authenticateInstitute(
  code: string,
  password: string,
): { ok: boolean; tenant?: StoredTenant; error?: string } {
  const tenant = getTenantByCode(code);
  if (!tenant) {
    return { ok: false, error: "Invalid institute code or institute account not found." };
  }
  if (tenant.status === "SHUT_DOWN") {
    return { ok: false, error: "This institution is currently shut down. Access has been temporarily disabled." };
  }
  if (tenant.status !== "ACTIVE" || !tenant.isCodeActive) {
    return { ok: false, error: "This institute account is currently unavailable. Please contact ManoYug support." };
  }
  if (tenant.passwordHash && !verifyPassword(password, tenant.passwordHash)) {
    return { ok: false, error: "Invalid credentials. Please verify your institute code and password." };
  }
  return { ok: true, tenant };
}

export function normalizePhoneDigits(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "").slice(-10);
}

export function verifyStudentInRoster(
  institutionId: string,
  email: string,
  phone?: string,
): { verified: boolean; student?: StoredRosterRow } {
  const normalizedEmail = email.trim().toLowerCase();
  const roster = listRoster(institutionId);
  const found = roster.find((r) => {
    if (r.status !== "ACTIVE") return false;
    const emailMatch = Boolean(normalizedEmail && r.email && r.email.toLowerCase() === normalizedEmail);
    return emailMatch;
  });
  return { verified: Boolean(found), student: found };
}

export function findTenantByStudentIdentifier(identifier: string): StoredTenant | null {
  const normalizedEmail = identifier.trim().toLowerCase();
  const normalizedPhone = normalizePhoneDigits(identifier);
  const allRoster = [...db().roster.values()];
  const match = allRoster.find((r) => {
    if (r.status !== "ACTIVE") return false;
    const emailMatch = Boolean(normalizedEmail && r.email && r.email.toLowerCase() === normalizedEmail);
    const phoneMatch = Boolean(normalizedPhone && r.phone && normalizePhoneDigits(r.phone) === normalizedPhone);
    return emailMatch || phoneMatch;
  });
  if (!match) return null;
  return db().tenants.get(match.institutionId) ?? null;
}

export const findTenantByStudentEmail = findTenantByStudentIdentifier;

export function addRosterStudent(
  institutionId: string,
  student: Omit<StoredRosterRow, "id" | "institutionId" | "createdAt">,
): StoredRosterRow {
  const id = randomUUID();
  const row: StoredRosterRow = {
    id,
    institutionId,
    createdAt: new Date().toISOString(),
    ...student,
  };
  db().roster.set(id, row);
  const tenant = db().tenants.get(institutionId);
  if (tenant) {
    tenant.activeStudents = [...db().roster.values()].filter(
      (r) => r.institutionId === institutionId && r.status === "ACTIVE",
    ).length;
    db().tenants.set(institutionId, tenant);
  }
  return row;
}

export function deleteRosterStudent(
  institutionId: string,
  studentId: string,
): boolean {
  const student = db().roster.get(studentId);
  if (!student || student.institutionId !== institutionId) return false;
  db().roster.delete(studentId);
  const tenant = db().tenants.get(institutionId);
  if (tenant) {
    tenant.activeStudents = [...db().roster.values()].filter(
      (r) => r.institutionId === institutionId && r.status === "ACTIVE",
    ).length;
    db().tenants.set(institutionId, tenant);
  }
  return true;
}

export function importRosterRows(
  institutionId: string,
  rows: Array<Omit<StoredRosterRow, "id" | "institutionId" | "createdAt">>,
): { imported: number; skipped: number } {
  let imported = 0;
  let skipped = 0;
  const existing = [...db().roster.values()].filter(
    (r) => r.institutionId === institutionId,
  );
  for (const row of rows) {
    const rowEmail = (row.email ?? "").trim().toLowerCase();
    const rowPhone = normalizePhoneDigits(row.phone);
    const rowRoll = (row.university_roll_no ?? "").trim().toUpperCase();

    const dup = existing.some((e) => {
      const eEmail = (e.email ?? "").trim().toLowerCase();
      const ePhone = normalizePhoneDigits(e.phone);
      const eRoll = (e.university_roll_no ?? "").trim().toUpperCase();

      if (rowEmail && eEmail && rowEmail === eEmail) return true;
      if (rowPhone && ePhone && rowPhone === ePhone) return true;
      if (rowRoll && eRoll && rowRoll === eRoll) return true;
      return false;
    });

    if (dup) {
      skipped += 1;
      continue;
    }
    const stored: StoredRosterRow = {
      id: randomUUID(),
      institutionId,
      createdAt: new Date().toISOString(),
      ...row,
    };
    db().roster.set(stored.id, stored);
    imported += 1;
  }
  const tenant = db().tenants.get(institutionId);
  if (tenant) {
    tenant.activeStudents = [...db().roster.values()].filter(
      (r) => r.institutionId === institutionId && r.status === "ACTIVE",
    ).length;
    db().tenants.set(institutionId, tenant);
  }
  return { imported, skipped };
}

export function listRoster(institutionId: string): StoredRosterRow[] {
  return [...db().roster.values()].filter(
    (r) => r.institutionId === institutionId,
  );
}

export function getInstitutionRealStats(institutionId: string) {
  const tenant = getTenant(institutionId);
  const roster = listRoster(institutionId);
  const eligibleCount = roster.length;
  const activeCount = roster.filter((r) => r.status === "ACTIVE").length;
  const activationRate = eligibleCount > 0 ? Math.round((activeCount / eligibleCount) * 100) : 0;
  const safetyEvents = listAllSafetyEvents(institutionId);

  // Aggregate student keys for this institution
  const studentKeys = roster.map((r) => r.email || r.phone || r.university_roll_no).filter(Boolean);
  
  // Real checkins
  let allCheckins: StoredCheckin[] = [];
  let totalConversations = 0;
  for (const key of studentKeys) {
    const c = listCheckins(key);
    allCheckins = allCheckins.concat(c);
    totalConversations += listConversations(key).length;
  }

  // Calculate mood & pressure dimensions
  const totalCheckins = allCheckins.length;
  const moodSum = allCheckins.reduce((acc, c) => acc + (c.mood || 0), 0);
  const avgMood = totalCheckins > 0 ? Math.round((moodSum / totalCheckins) * 10) / 10 : null;

  // Real theme breakdown based on reported pressure scores >= 3
  const highStressCount = allCheckins.filter((c) => (c.stress ?? 0) >= 3 || (c.academicPressure ?? 0) >= 3).length;
  const sleepDisruptionCount = allCheckins.filter((c) => (c.sleep ?? 0) <= 2).length;
  const lowEnergyCount = allCheckins.filter((c) => (c.energy ?? 0) <= 2).length;
  const isolationCount = allCheckins.filter((c) => (c.socialConnection ?? 0) <= 2).length;

  const totalSignals = highStressCount + sleepDisruptionCount + lowEnergyCount + isolationCount;

  const themes = totalSignals > 0
    ? [
        {
          label: "Exam Preparation & Academic Pressure",
          percentage: Math.round((highStressCount / totalSignals) * 100),
          color: "brand",
        },
        {
          label: "Placement, Routine & Energy Depletion",
          percentage: Math.round((lowEnergyCount / totalSignals) * 100),
          color: "accent",
        },
        {
          label: "Sleep Quality & Rest Deprivation",
          percentage: Math.round((sleepDisruptionCount / totalSignals) * 100),
          color: "info",
        },
        {
          label: "Social Isolation & Campus Adjustment",
          percentage: Math.round((isolationCount / totalSignals) * 100),
          color: "muted",
        },
      ]
    : [];

  return {
    tenant,
    eligibleCount,
    activeCount,
    activationRate,
    totalCheckins,
    totalConversations,
    safetyEventsCount: safetyEvents.length,
    avgMood,
    themes,
    checkins: allCheckins,
  };
}


export function searchAllStudents(query: string) {
  const q = query.toLowerCase().trim();
  const all = [...db().roster.values()];
  if (!q) return all;
  return all.filter(
    (s) =>
      s.email.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.university_roll_no.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q),
  );
}

/* ─── Institution Requests ─── */
export function listInstitutionRequests(): StoredInstitutionRequest[] {
  return [...db().institutionRequests.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getInstitutionRequest(id: string): StoredInstitutionRequest | null {
  return db().institutionRequests.get(id) ?? null;
}

export function createInstitutionRequest(
  input: Omit<StoredInstitutionRequest, "id" | "status" | "createdAt" | "updatedAt">,
): StoredInstitutionRequest {
  const now = new Date().toISOString();
  const row: StoredInstitutionRequest = {
    id: randomUUID(),
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  db().institutionRequests.set(row.id, row);
  return row;
}

export function updateInstitutionRequestStatus(
  id: string,
  status: StoredInstitutionRequest["status"],
  notes?: string,
): StoredInstitutionRequest | null {
  const req = db().institutionRequests.get(id);
  if (!req) return null;
  req.status = status;
  if (notes !== undefined) req.notes = notes;
  req.updatedAt = new Date().toISOString();
  db().institutionRequests.set(id, req);

  // Approval only updates status. Super Admin must manually create the tenant
  // with a chosen institute code via the Create Institute form.

  return req;
}

/* ─── Institution Support Contacts ─── */
export function listSupportContacts(institutionId: string): StoredSupportContact[] {
  return db().supportContacts.get(institutionId) ?? [];
}

export function saveSupportContact(contact: Omit<StoredSupportContact, "id" | "createdAt"> & { id?: string }): StoredSupportContact {
  const list = db().supportContacts.get(contact.institutionId) ?? [];
  const id = contact.id || randomUUID();
  const existingIdx = list.findIndex((c) => c.id === id);
  const row: StoredSupportContact = {
    id,
    institutionId: contact.institutionId,
    title: contact.title,
    contactType: contact.contactType,
    phone: contact.phone,
    email: contact.email,
    location: contact.location,
    operatingHours: contact.operatingHours,
    isEmergency: contact.isEmergency,
    createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    list[existingIdx] = row;
  } else {
    list.push(row);
  }
  db().supportContacts.set(contact.institutionId, list);
  return row;
}

export function deleteSupportContact(institutionId: string, id: string): boolean {
  const list = db().supportContacts.get(institutionId) ?? [];
  const filtered = list.filter((c) => c.id !== id);
  db().supportContacts.set(institutionId, filtered);
  return filtered.length < list.length;
}

/* ─── Pricing Plans ─── */
export function listPricingPlans(): StoredPricingPlan[] {
  return [...db().pricingPlans.values()];
}

export function updatePricingPlan(id: string, updates: Partial<StoredPricingPlan>): StoredPricingPlan | null {
  const plan = db().pricingPlans.get(id);
  if (!plan) return null;
  const updated = { ...plan, ...updates };
  db().pricingPlans.set(id, updated);
  return updated;
}

/* ─── Feature Flags ─── */
export function listStoreFeatureFlags(): StoredFeatureFlag[] {
  return [...db().featureFlags.values()];
}

export function toggleStoreFeatureFlag(key: string, isEnabled: boolean): StoredFeatureFlag | null {
  const flag = db().featureFlags.get(key);
  if (!flag) return null;
  flag.isEnabled = isEnabled;
  db().featureFlags.set(key, flag);
  return flag;
}

/* ─── Safety Events ─── */
export function listAllSafetyEvents(institutionId?: string): StoredSafetyEvent[] {
  const all: StoredSafetyEvent[] = [];
  for (const [tenantId, events] of db().safetyEvents.entries()) {
    if (!institutionId || tenantId === institutionId) {
      all.push(...events);
    }
  }
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function bookAppointment(input: {
  studentKey: string;
  counsellorKey: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}): { ok: true; appointment: StoredAppointment } | { ok: false; message: string } {
  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);
  if (!(end > start)) {
    return { ok: false, message: "End time must be after start time." };
  }
  if (start.getTime() < Date.now() - 60_000) {
    return { ok: false, message: "Cannot book appointments in the past." };
  }

  for (const appt of db().appointments.values()) {
    if (appt.status !== "SCHEDULED") continue;
    if (appt.counsellorKey !== input.counsellorKey) continue;
    if (
      overlaps(
        start,
        end,
        new Date(appt.startsAt),
        new Date(appt.endsAt),
      )
    ) {
      return { ok: false, message: "That slot is already booked." };
    }
  }

  const appointment: StoredAppointment = {
    id: randomUUID(),
    studentKey: input.studentKey,
    counsellorKey: input.counsellorKey,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    status: "SCHEDULED",
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  db().appointments.set(appointment.id, appointment);
  return { ok: true, appointment };
}

export function cancelAppointment(
  id: string,
  studentKey: string,
): StoredAppointment | null {
  const appt = db().appointments.get(id);
  if (!appt || appt.studentKey !== studentKey) return null;
  appt.status = "CANCELLED";
  db().appointments.set(id, appt);
  return appt;
}

export function listAppointmentsForStudent(studentKey: string): StoredAppointment[] {
  return [...db().appointments.values()]
    .filter((a) => a.studentKey === studentKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function listAppointmentsForCounsellor(counsellorKey: string): StoredAppointment[] {
  return [...db().appointments.values()]
    .filter((a) => a.counsellorKey === counsellorKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function demoInstitutionId() {
  return "00000000-0000-4000-8000-000000000001";
}

export const DEV_STUDENT_KEY = "dev-student";
export const DEV_COUNSELLOR_KEY = "dev-counsellor";
