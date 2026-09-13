import { createAdminClient } from "@/lib/db/supabase/admin";
import type {
  StoredFeatureFlag,
  StoredInstitutionRequest,
  StoredPricingPlan,
  StoredRosterRow,
  StoredSupportContact,
  StoredTenant,
} from "@/lib/store/memory";
import { priceForCapacity } from "@/lib/commercial/pricing";

type DbRow = Record<string, unknown>;

function required<T>(value: T | null, error: { message: string } | null, context: string): T {
  if (error || value == null) throw new Error(`${context}: ${error?.message ?? "no row returned"}`);
  return value;
}

export function mapTenant(row: DbRow): StoredTenant {
  const capacity = Number(row.student_capacity ?? row.max_capacity ?? 5000);
  const location = String(row.location ?? "");
  const [city = "", state = ""] = location.split(",").map((value) => value.trim());
  return {
    id: String(row.id), name: String(row.name), slug: String(row.slug), code: String(row.code ?? "NO_CODE"),
    isCodeActive: Boolean(row.is_code_active ?? true), status: (row.status as StoredTenant["status"]) ?? "ACTIVE",
    studentCapacity: capacity, annualPriceInr: priceForCapacity(capacity).annualInr,
    planLabel: `Up to ${capacity.toLocaleString("en-IN")} students`, activeStudents: Number(row.active_students ?? 0),
    contractStart: String(row.created_at ?? new Date().toISOString()).slice(0, 10),
    contractEnd: String(row.contract_end ?? ""), officialEmail: row.admin_email as string | undefined,
    adminEmail: row.admin_email as string | undefined, passwordHash: row.password_hash as string | undefined,
    institutionType: row.institution_type as string | undefined, phone: row.phone as string | undefined,
    city, state, website: row.website as string | undefined,
  };
}

export function mapRoster(row: DbRow): StoredRosterRow {
  return {
    id: String(row.id), institutionId: String(row.institution_id), email: String(row.email),
    phone: (row.mobile_number ?? row.phone) as string | undefined, name: row.full_name as string | undefined,
    university_roll_no: String(row.roll_number ?? row.university_roll_no ?? ""), graduation_year: row.graduation_year as number | undefined,
    department: row.department as string | undefined, programme: row.programme as string | undefined,
    batch: row.batch as string | undefined, status: row.status as StoredRosterRow["status"], createdAt: String(row.created_at),
  };
}

export function mapContact(row: DbRow): StoredSupportContact {
  return {
    id: String(row.id), institutionId: String(row.institution_id), title: String(row.title),
    contactType: row.contact_type as StoredSupportContact["contactType"], phone: String(row.phone ?? ""),
    email: row.email as string | undefined, location: row.location as string | undefined,
    operatingHours: row.operating_hours as string | undefined, isEmergency: Boolean(row.is_emergency), createdAt: String(row.created_at),
  };
}

export async function getTenantById(id: string): Promise<StoredTenant | null> {
  const client = createAdminClient();
  const { data, error } = await client.from("institutions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load institution: ${error.message}`);
  return data ? mapTenant(data as DbRow) : null;
}

export async function listTenantRoster(institutionId: string): Promise<StoredRosterRow[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("institution_students").select("*").eq("institution_id", institutionId).order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load student roster: ${error.message}`);
  return (data ?? []).map((row) => mapRoster(row as DbRow));
}

export async function createRosterStudent(institutionId: string, input: Omit<StoredRosterRow, "id" | "institutionId" | "createdAt">) {
  const client = createAdminClient();
  const { data, error } = await client.from("institution_students").insert({
    institution_id: institutionId, email: input.email, mobile_number: input.phone ?? null, full_name: input.name ?? null,
    roll_number: input.university_roll_no || null, university_roll_no: input.university_roll_no || null, graduation_year: input.graduation_year ?? null,
    department: input.department ?? null, programme: input.programme ?? null, batch: input.batch ?? null, status: input.status,
  }).select("*").single();
  return mapRoster(required(data as DbRow | null, error, "Could not add student"));
}

export async function deleteRosterStudentPersisted(institutionId: string, studentId: string) {
  const client = createAdminClient();
  const { error, count } = await client.from("institution_students").delete({ count: "exact" }).eq("id", studentId).eq("institution_id", institutionId);
  if (error) throw new Error(`Could not remove student: ${error.message}`);
  return (count ?? 0) === 1;
}

export async function listCampusContacts(institutionId: string): Promise<StoredSupportContact[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("institution_support_contacts").select("*").eq("institution_id", institutionId).order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load campus contacts: ${error.message}`);
  const contacts = (data ?? []).map((row) => mapContact(row as DbRow));
  if (contacts.length > 0) return contacts;

  // Always give the student a campus route during a crisis, even before an
  // institution has configured its dedicated wellbeing contacts. This is a
  // verified institution-admin address from the tenant record, not an AI-
  // generated number. Dedicated emergency contacts still take precedence.
  const { data: institution, error: institutionError } = await client
    .from("institutions")
    .select("id, name, admin_email")
    .eq("id", institutionId)
    .maybeSingle();
  if (institutionError) throw new Error(`Could not load campus contact fallback: ${institutionError.message}`);
  if (!institution?.admin_email) return [];
  return [{
    id: `institution-admin-${institution.id}`,
    institutionId,
    title: "Campus administration",
    contactType: "student_affairs",
    email: String(institution.admin_email),
    phone: "",
    location: String(institution.name ?? "Your institution"),
    operatingHours: "Contact as soon as possible",
    isEmergency: false,
    createdAt: new Date().toISOString(),
  }];
}

export type InstitutionSupportRequestItem = {
  id: string;
  studentUserId: string;
  studentEmail: string;
  studentName?: string;
  note: string;
  status: "NEW" | "ACKNOWLEDGED" | "CLOSED";
  createdAt: string;
  updatedAt?: string;
};

export type InstitutionSafetyAlertItem = {
  id: string;
  studentUserId: string;
  studentEmail: string;
  studentName?: string;
  state: "RED" | "IMMINENT";
  message: string;
  createdAt: string;
};

async function profilesForUsers(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { email: string; fullName?: string }>();
  const client = createAdminClient();
  const { data, error } = await client.from("profiles").select("id, email, full_name").in("id", userIds);
  if (error) throw new Error(`Could not load student contact details: ${error.message}`);
  return new Map((data ?? []).map((row) => [String(row.id), {
    email: String(row.email ?? ""),
    fullName: row.full_name ? String(row.full_name) : undefined,
  }]));
}

export async function listInstitutionSupportInbox(institutionId: string): Promise<InstitutionSupportRequestItem[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("student_support_requests")
    .select("id, student_user_id, note, status, created_at, updated_at")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load student support requests: ${error.message}`);

  const rows = (data ?? []) as DbRow[];
  const profiles = await profilesForUsers([...new Set(rows.map((row) => String(row.student_user_id))) ]);
  return rows.map((row) => {
    const studentUserId = String(row.student_user_id);
    const profile = profiles.get(studentUserId);
    return {
      id: String(row.id),
      studentUserId,
      studentEmail: profile?.email || "Email unavailable",
      studentName: profile?.fullName,
      note: String(row.note ?? ""),
      status: (row.status as InstitutionSupportRequestItem["status"]) ?? "NEW",
      createdAt: String(row.created_at),
      updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    };
  });
}

export async function listInstitutionSafetyAlerts(institutionId: string): Promise<InstitutionSafetyAlertItem[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("safety_events")
    .select("id, user_id, state, created_at")
    .eq("institution_id", institutionId)
    .in("state", ["RED", "IMMINENT"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load safety alerts: ${error.message}`);

  // Show the latest active alert per student so an institution can act quickly
  // without being flooded by repeated events from one conversation.
  const rows = (data ?? []) as DbRow[];
  const latestByStudent = new Map<string, DbRow>();
  for (const row of rows) {
    const userId = String(row.user_id);
    if (!latestByStudent.has(userId)) latestByStudent.set(userId, row);
  }
  const profiles = await profilesForUsers([...latestByStudent.keys()]);
  return [...latestByStudent.values()].map((row) => {
    const studentUserId = String(row.user_id);
    const profile = profiles.get(studentUserId);
    const state = row.state === "IMMINENT" ? "IMMINENT" : "RED";
    return {
      id: String(row.id),
      studentUserId,
      studentEmail: profile?.email || "Email unavailable",
      studentName: profile?.fullName,
      state,
      message: "The safety system detected a high-risk signal. Contact this student immediately through your approved campus support process. Student safety comes first.",
      createdAt: String(row.created_at),
    };
  });
}

export async function saveCampusContact(input: Omit<StoredSupportContact, "id" | "createdAt"> & { id?: string }) {
  const client = createAdminClient();
  const payload = { institution_id: input.institutionId, title: input.title, contact_type: input.contactType, phone: input.phone, email: input.email ?? null, location: input.location ?? null, operating_hours: input.operatingHours ?? null, is_emergency: input.isEmergency };
  const query = input.id ? client.from("institution_support_contacts").update(payload).eq("id", input.id) : client.from("institution_support_contacts").insert(payload);
  const { data, error } = await query.select("*").single();
  return mapContact(required(data as DbRow | null, error, "Could not save support contact"));
}

export async function deleteCampusContact(institutionId: string, contactId: string) {
  const client = createAdminClient();
  const { error, count } = await client.from("institution_support_contacts").delete({ count: "exact" }).eq("id", contactId).eq("institution_id", institutionId);
  if (error) throw new Error(`Could not delete support contact: ${error.message}`);
  return (count ?? 0) === 1;
}

export async function listInstitutionResourcesPersisted(institutionId: string) {
  const client = createAdminClient();
  const { data, error } = await client.from("resources").select("*").eq("institution_id", institutionId).order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load resources: ${error.message}`);
  return (data ?? []).map((row) => ({ id: String(row.id), institutionId: String(row.institution_id), name: String(row.name), resourceType: String(row.resource_type), contactValue: String(row.contact_value), region: row.region as string | undefined, status: row.status as "ACTIVE" | "PENDING_REVIEW" | "EXPIRED", verifiedAt: row.verified_at as string | undefined, reviewBy: row.review_by as string | undefined }));
}

export async function saveInstitutionResourcePersisted(input: { id?: string; institutionId: string; name: string; resourceType: string; contactValue: string; status: "ACTIVE" | "PENDING_REVIEW" | "EXPIRED" }) {
  const client = createAdminClient();
  const payload = { institution_id: input.institutionId, name: input.name, resource_type: input.resourceType, contact_value: input.contactValue, status: input.status, verified_at: new Date().toISOString() };
  const query = input.id ? client.from("resources").update(payload).eq("id", input.id) : client.from("resources").insert(payload);
  const { data, error } = await query.select("*").single();
  const row = required(data as DbRow | null, error, "Could not save campus resource");
  return { id: String(row.id), institutionId: String(row.institution_id), name: String(row.name), resourceType: String(row.resource_type), contactValue: String(row.contact_value), status: row.status as "ACTIVE" | "PENDING_REVIEW" | "EXPIRED", verifiedAt: row.verified_at as string | undefined };
}

export async function deleteInstitutionResourcePersisted(institutionId: string, id: string) {
  const client = createAdminClient();
  const { error, count } = await client.from("resources").delete({ count: "exact" }).eq("id", id).eq("institution_id", institutionId);
  if (error) throw new Error(`Could not delete resource: ${error.message}`);
  return (count ?? 0) === 1;
}

export async function listPersistedPricingPlans(): Promise<StoredPricingPlan[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("pricing_plans").select("*").order("student_capacity");
  if (error) throw new Error(`Could not load pricing plans: ${error.message}`);
  return (data ?? []).map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug), studentCapacity: Number(row.student_capacity), annualPriceInr: Number(row.annual_price_inr), description: String(row.description ?? ""), features: Array.isArray(row.features) ? row.features.map(String) : [], isActive: Boolean(row.is_active) }));
}

export async function listPersistedFeatureFlags(): Promise<StoredFeatureFlag[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("feature_flags").select("*").order("key");
  if (error) throw new Error(`Could not load feature flags: ${error.message}`);
  return (data ?? []).map((row) => ({ id: String(row.id), key: String(row.key), name: String(row.name), description: String(row.description ?? ""), isEnabled: Boolean(row.is_enabled), environment: String(row.environment ?? "all") }));
}

export async function listPersistedTenants(): Promise<StoredTenant[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("institutions").select("*").neq("id", "00000000-0000-0000-0000-000000000001").order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load institutions: ${error.message}`);
  return (data ?? []).map((row) => mapTenant(row as DbRow));
}

export async function listPersistedRequests(): Promise<StoredInstitutionRequest[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("institution_requests").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load institution requests: ${error.message}`);
  return (data ?? []).map((row) => { const [locationCity = "Campus", locationState = "IN"] = String(row.location ?? "").split(",").map((value) => value.trim()); return { id: String(row.id), institutionId: row.institution_id ? String(row.institution_id) : undefined, institutionName: String(row.institution_name), officialEmail: String(row.official_email), contactPhone: String(row.contact_phone), institutionType: String(row.institution_type ?? "University"), approximateStudentCount: Number(row.approximate_student_count ?? 500), city: String(row.city ?? locationCity), state: String(row.state ?? locationState), website: row.website as string | undefined, contactPersonName: String(row.contact_person_name ?? row.contact_person ?? ""), contactPersonDesignation: String(row.contact_person_designation ?? "Authorized Representative"), status: row.status as StoredInstitutionRequest["status"], notes: (row.notes ?? row.message) as string | undefined, createdAt: String(row.created_at), updatedAt: String(row.updated_at) }; });
}

export async function getInstitutionDashboardData(institutionId: string) {
  const client = createAdminClient();
  const [tenant, rosterResult, checkinsResult, conversationsResult, safetyResult, supportResult] = await Promise.all([
    getTenantById(institutionId),
    client.from("institution_students").select("id, status, linked_user_id").eq("institution_id", institutionId),
    client.from("checkins").select("mood, stress, energy, sleep, academic_pressure, social_connection, period").eq("institution_id", institutionId),
    client.from("conversations").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
    client.from("safety_events").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
    client.from("student_support_requests").select("id", { count: "exact", head: true }).eq("institution_id", institutionId),
  ]);
  if (rosterResult.error || checkinsResult.error || conversationsResult.error || safetyResult.error || supportResult.error) throw new Error("Could not load institution dashboard data.");
  const roster = rosterResult.data ?? [];
  const checkins = checkinsResult.data ?? [];
  const average = (values: Array<number | null>) => { const valid = values.filter((value): value is number => typeof value === "number"); return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10 : null; };
  const highStress = checkins.filter((row) => Number(row.stress) >= 3 || Number(row.academic_pressure) >= 3).length;
  const lowEnergy = checkins.filter((row) => Number(row.energy) <= 2).length;
  const lowSleep = checkins.filter((row) => Number(row.sleep) <= 2).length;
  const isolated = checkins.filter((row) => Number(row.social_connection) <= 2).length;
  const totalSignals = highStress + lowEnergy + lowSleep + isolated;
  const themes = totalSignals ? [
    { label: "Exam Preparation & Academic Pressure", percentage: Math.round((highStress / totalSignals) * 100), color: "brand" },
    { label: "Placement, Routine & Energy Depletion", percentage: Math.round((lowEnergy / totalSignals) * 100), color: "accent" },
    { label: "Sleep Quality & Rest Deprivation", percentage: Math.round((lowSleep / totalSignals) * 100), color: "info" },
    { label: "Social Isolation & Campus Adjustment", percentage: Math.round((isolated / totalSignals) * 100), color: "muted" },
  ] : [];
  return {
    tenant, eligibleCount: roster.length, activeCount: roster.filter((row) => row.status === "ACTIVE" && row.linked_user_id).length,
    activationRate: roster.length ? Math.round((roster.filter((row) => row.status === "ACTIVE" && row.linked_user_id).length / roster.length) * 100) : 0,
    totalCheckins: checkins.length, totalConversations: conversationsResult.count ?? 0, safetyEventsCount: safetyResult.count ?? 0,
    avgMood: average(checkins.map((row) => row.mood as number | null)), themes,
    pressureAverages: { academic: average(checkins.map((row) => row.academic_pressure as number | null)), sleep: average(checkins.map((row) => row.sleep as number | null)), energy: average(checkins.map((row) => row.energy as number | null)), social: average(checkins.map((row) => row.social_connection as number | null)), stress: average(checkins.map((row) => row.stress as number | null)) },
    cadence: { daily: checkins.filter((row) => row.period === "daily").length, weekly: checkins.filter((row) => row.period === "weekly").length },
    moodDistribution: [1, 2, 3, 4, 5].map((score) => ({ score, count: checkins.filter((row) => row.mood === score).length, percentage: checkins.length ? Math.round((checkins.filter((row) => row.mood === score).length / checkins.length) * 100) : 0 })),
    humanSupportCases: supportResult.count ?? 0,
    minCohort: 10,
    suppressed: checkins.length > 0 && checkins.length < 10 ? ["Cohort metrics are suppressed below 10 check-ins."] : [],
    eligibleStudents: roster.length,
    activatedAccounts: roster.filter((row) => row.status === "ACTIVE" && row.linked_user_id).length,
    checkins: checkins.length,
    conversations: conversationsResult.count ?? 0,
    safetyEscalations: safetyResult.count ?? 0,
    avgMoodStudentReported: average(checkins.map((row) => row.mood as number | null)),
  };
}
