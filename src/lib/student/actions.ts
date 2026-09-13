"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit/log";
import { getAppSession } from "@/lib/auth/session";
import {
  bookAppointmentForUser,
  cancelAppointmentForUser,
  listCounsellorAppointments,
  listStudentAppointments,
} from "@/lib/data/appointments";
import {
  addCheckinForUser,
  listCheckinsForUser,
} from "@/lib/data/checkins";
import {
  createConversationForUser,
  getPersistenceMode,
  listConversationsForUser,
  listMessagesForUser,
} from "@/lib/data/conversations";
import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { createRosterStudent, deleteRosterStudentPersisted, listTenantRoster } from "@/lib/data/platform";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  addPersistedCaseNote,
  getPersistedCase,
  listPersistedCases,
  updatePersistedCaseStatus,
} from "@/lib/data/cases";
import { GUIDED_EXERCISES } from "@/lib/wellbeing/catalogue";
import { isFeatureEnabled } from "@/lib/platform/feature-flags";
import { trackEvent } from "@/lib/providers/analytics";
import {
  DEV_COUNSELLOR_KEY,
  DEV_STUDENT_KEY,
  addCaseNote,
  completeExercise,
  demoInstitutionId,
  getCase,
  importRosterRows,
  listCases,
  listExerciseCompletions,
  listRoster,
  listTenants,
  listTimeline,
  requestHumanSupport,
  updateCaseStatus,
  type TimelineEvent,
} from "@/lib/store/memory";
import type { RosterPreviewResult } from "@/lib/institution/csv-roster";
import {
  checkinSchema,
  supportRequestSchema,
} from "@/lib/validation/student";
import type { CaseStatus } from "@/types/roles";

async function studentKey(): Promise<string> {
  const session = await getAppSession();
  if (!session && isSupabaseConfigured()) {
    throw new Error("Please sign in as a student to continue.");
  }
  return session?.userId ?? DEV_STUDENT_KEY;
}

async function persistedTimeline(userId: string): Promise<TimelineEvent[]> {
  const admin = createAdminClient();
  const [checkins, exercises, support, appointments] = await Promise.all([
    admin.from("checkins").select("id, period, created_at").eq("user_id", userId),
    admin.from("exercise_completions").select("id, completed_at, guided_exercises(slug, name)").eq("user_id", userId),
    admin.from("student_support_requests").select("id, status, created_at").eq("student_user_id", userId),
    admin.from("appointments").select("id, status, starts_at, created_at").eq("student_user_id", userId),
  ]);
  if (checkins.error || exercises.error || support.error || appointments.error) {
    throw new Error("Could not load your activity timeline.");
  }
  const exerciseEvents = (exercises.data ?? []).map((row) => {
    const exercise = row.guided_exercises as unknown;
    const details = (Array.isArray(exercise) ? exercise[0] : exercise) as { slug?: string; name?: string } | null;
    return { id: String(row.id), studentKey: userId, type: "exercise" as const, label: `Completed exercise: ${details?.name ?? details?.slug ?? "guided exercise"}`, createdAt: String(row.completed_at) };
  });
  return [
    ...(checkins.data ?? []).map((row) => ({ id: String(row.id), studentKey: userId, type: "checkin" as const, label: `${row.period === "weekly" ? "Weekly" : "Daily"} wellbeing check-in completed`, createdAt: String(row.created_at) })),
    ...exerciseEvents,
    ...(support.data ?? []).map((row) => ({ id: String(row.id), studentKey: userId, type: "support" as const, label: `Human support request · ${String(row.status).toLowerCase()}`, createdAt: String(row.created_at) })),
    ...(appointments.data ?? []).map((row) => ({ id: String(row.id), studentKey: userId, type: "appointment" as const, label: `Appointment ${String(row.status).toLowerCase()} for ${new Date(String(row.starts_at)).toLocaleDateString("en-IN")}`, createdAt: String(row.created_at) })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
}

export async function getStudentHomeData() {
  const key = await studentKey();
  const conversations = await listConversationsForUser(key);
  const checkins = await listCheckinsForUser(key);
  return {
    studentKey: key,
    conversations,
    checkins: checkins.slice(0, 7),
    timeline: (isSupabaseConfigured() ? await persistedTimeline(key) : listTimeline(key)).slice(0, 12),
    appointments: await listStudentAppointments(key),
    usingDevStore: getPersistenceMode() === "dev-memory",
    persistence: getPersistenceMode(),
  };
}

export async function startConversationAction(
  language: "en" | "hi" | "hinglish" = "en",
) {
  const key = await studentKey();
  const c = await createConversationForUser(key, language);
  revalidatePath("/student/chat");
  return { id: c.id };
}

export async function getConversationData(id: string) {
  const key = await studentKey();
  return {
    messages: await listMessagesForUser(id, key),
    conversations: await listConversationsForUser(key),
  };
}

export async function submitCheckinAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
) {
  const parsed = checkinSchema.safeParse({
    period: formData.get("period") || "daily",
    mood: formData.get("mood"),
    stress: formData.get("stress"),
    energy: formData.get("energy"),
    sleep: formData.get("sleep"),
    academicPressure: formData.get("academicPressure"),
    socialConnection: formData.get("socialConnection"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Please complete all ratings (1–5)." };
  }

  const key = await studentKey();
  await addCheckinForUser(key, {
    period: parsed.data.period,
    mood: parsed.data.mood,
    stress: parsed.data.stress,
    energy: parsed.data.energy,
    sleep: parsed.data.sleep,
    academicPressure: parsed.data.academicPressure,
    socialConnection: parsed.data.socialConnection,
    note: parsed.data.note,
  });
  await trackEvent({
    name: "checkin_completed",
    userId: key,
    properties: { period: parsed.data.period },
  });
  revalidatePath("/student/check-in");
  revalidatePath("/student");
  revalidatePath("/student/timeline");
  return { ok: true, message: "Check-in saved. This is not a clinical score." };
}

export async function requestSupportAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
) {
  const parsed = supportRequestSchema.safeParse({
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please add a short note for your counsellor." };
  }
  const key = await studentKey();
  if (isSupabaseConfigured()) {
    const session = await getAppSession();
    if (!session?.institutionId) return { ok: false, message: "Your campus membership could not be verified." };
    const admin = createAdminClient();
    const { error } = await admin.from("student_support_requests").insert({
      institution_id: session.institutionId, student_user_id: key, note: parsed.data.note,
    });
    if (error) return { ok: false, message: "We could not record your support request. Please try again." };
  } else {
    requestHumanSupport(key, parsed.data.note);
  }
  await trackEvent({
    name: "human_support_requested",
    userId: key,
  });
  revalidatePath("/student/support");
  revalidatePath("/institution/support");
  revalidatePath("/counsellor");
  revalidatePath("/student/timeline");
  return {
    ok: true,
    message:
      "Your request was sent to your institute support team. They can follow up through their campus process — the AI did not claim to call anyone.",
  };
}

export async function completeExerciseAction(slug: string) {
  const key = await studentKey();
  if (isSupabaseConfigured()) {
    const exercise = GUIDED_EXERCISES.find((item) => item.slug === slug);
    if (!exercise) return { ok: false, message: "Exercise not found." };
    const session = await getAppSession();
    if (!session?.institutionId) return { ok: false, message: "Your campus membership could not be verified." };
    const admin = createAdminClient();
    const { data: exerciseRow, error: exerciseError } = await admin.from("guided_exercises").upsert({
      slug: exercise.slug, name: exercise.name, description: exercise.description, duration_minutes: exercise.durationMinutes,
      steps: exercise.steps, status: "ACTIVE", clinical_approval_status: "APPROVED",
    }, { onConflict: "slug" }).select("id").single();
    if (exerciseError || !exerciseRow) return { ok: false, message: "We could not save your exercise completion." };
    const { error } = await admin.from("exercise_completions").insert({
      institution_id: session.institutionId, user_id: key, exercise_id: exerciseRow.id,
    });
    if (error) return { ok: false, message: "We could not save your exercise completion." };
  } else {
    completeExercise(key, slug);
  }
  revalidatePath("/student/exercises");
  revalidatePath("/student/timeline");
  return { ok: true };
}

export async function getExercisesData() {
  const key = await studentKey();
  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    const { data, error } = await admin.from("exercise_completions").select("completed_at, guided_exercises!inner(slug)").eq("user_id", key).order("completed_at", { ascending: false });
    if (error) return { completions: [] };
    return {
      completions: (data ?? []).map((row) => {
        const exercise = row.guided_exercises as unknown;
        const details = (Array.isArray(exercise) ? exercise[0] : exercise) as { slug?: string } | null;
        return { slug: details?.slug ?? "", at: String(row.completed_at) };
      }).filter((row) => row.slug),
    };
  }
  return { completions: listExerciseCompletions(key) };
}

export async function bookAppointmentAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
) {
  if (!(await isFeatureEnabled("appointments.enabled"))) {
    return { ok: false, message: "Appointments are disabled." };
  }
  const startsAt = String(formData.get("startsAt") || "");
  const durationMin = Number(formData.get("durationMin") || 30);
  if (!startsAt) return { ok: false, message: "Choose a start time." };
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const key = await studentKey();
  const result = await bookAppointmentForUser({
    studentKey: key,
    counsellorKey: DEV_COUNSELLOR_KEY,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    notes: String(formData.get("notes") || "") || undefined,
  });
  if (!result.ok) return result;
  await trackEvent({ name: "appointment_booked", userId: key });
  revalidatePath("/student/appointments");
  revalidatePath("/counsellor/appointments");
  revalidatePath("/student/timeline");
  return { ok: true, message: "Appointment booked." };
}

export async function cancelAppointmentAction(id: string) {
  const key = await studentKey();
  await cancelAppointmentForUser(id, key);
  revalidatePath("/student/appointments");
  return { ok: true };
}

export async function getAppointmentsData() {
  const key = await studentKey();
  return {
    mine: await listStudentAppointments(key),
    counsellor: await listCounsellorAppointments(DEV_COUNSELLOR_KEY),
  };
}

export async function getCounsellorQueue() {
  if (isSupabaseConfigured()) {
    const session = await getAppSession();
    if (!session || !["COUNSELLOR", "COUNSELLOR_SUPERVISOR", "INSTITUTION_SUPER_ADMIN", "PLATFORM_ADMIN", "PLATFORM_SUPER_ADMIN", "CLINICAL_REVIEWER"].includes(session.role ?? "")) {
      throw new Error("Counsellor access is required.");
    }
    return { cases: await listPersistedCases(), usingDevStore: false, persistence: "supabase" as const };
  }
  return {
    cases: listCases(),
    usingDevStore: getPersistenceMode() === "dev-memory",
    persistence: getPersistenceMode(),
  };
}

export async function getCaseDetail(id: string) {
  if (isSupabaseConfigured()) {
    const session = await getAppSession();
    if (!session || !["COUNSELLOR", "COUNSELLOR_SUPERVISOR", "INSTITUTION_SUPER_ADMIN", "PLATFORM_ADMIN", "PLATFORM_SUPER_ADMIN", "CLINICAL_REVIEWER"].includes(session.role ?? "")) {
      throw new Error("Counsellor access is required.");
    }
    return getPersistedCase(id);
  }
  return getCase(id);
}

export async function updateCaseStatusAction(caseId: string, status: CaseStatus) {
  if (isSupabaseConfigured()) {
    const session = await getAppSession();
    if (!session || !["COUNSELLOR", "COUNSELLOR_SUPERVISOR", "INSTITUTION_SUPER_ADMIN", "PLATFORM_ADMIN", "PLATFORM_SUPER_ADMIN", "CLINICAL_REVIEWER"].includes(session.role ?? "")) {
      return { ok: false, message: "Counsellor access is required." };
    }
    const updated = await updatePersistedCaseStatus(caseId, status);
    revalidatePath("/counsellor");
    revalidatePath(`/counsellor/cases/${caseId}`);
    return updated ? { ok: true } : { ok: false, message: "Case not found." };
  }
  updateCaseStatus(caseId, status);
  revalidatePath("/counsellor");
  revalidatePath(`/counsellor/cases/${caseId}`);
  return { ok: true };
}

export async function addCounsellorNoteAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
) {
  const caseId = String(formData.get("caseId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!caseId || !body) {
    return { ok: false, message: "Note required." };
  }
  if (isSupabaseConfigured()) {
    const session = await getAppSession();
    if (!session || !["COUNSELLOR", "COUNSELLOR_SUPERVISOR", "INSTITUTION_SUPER_ADMIN", "PLATFORM_ADMIN", "PLATFORM_SUPER_ADMIN", "CLINICAL_REVIEWER"].includes(session.role ?? "")) {
      return { ok: false, message: "Counsellor access is required." };
    }
    await addPersistedCaseNote(caseId, session.userId, body);
    revalidatePath(`/counsellor/cases/${caseId}`);
    return { ok: true, message: "Note saved (counsellor-only visibility)." };
  }
  addCaseNote(caseId, DEV_COUNSELLOR_KEY, body);
  revalidatePath(`/counsellor/cases/${caseId}`);
  return { ok: true, message: "Note saved (counsellor-only visibility)." };
}

export async function completeOnboardingAction(formData: FormData) {
  const language = String(formData.get("language") || "en");
  const consent = formData.get("consent") === "on";
  if (!consent) {
    return { ok: false as const, message: "Consent is required to continue." };
  }
  if (isSupabaseConfigured()) {
    const session = await getAppSession();
    if (!session?.institutionId) return { ok: false as const, message: "Your campus membership could not be verified." };
    const admin = createAdminClient();
    const { error: profileError } = await admin.from("profiles").update({ preferred_language: language }).eq("id", session.userId);
    const { error: studentError } = await admin.from("student_profiles").upsert({ user_id: session.userId, institution_id: session.institutionId, preferences: { language }, onboarding_completed_at: new Date().toISOString() });
    if (profileError || studentError) return { ok: false as const, message: "We could not save your preferences. Please try again." };
  }
  return {
    ok: true as const,
    message: "Onboarding saved.",
    language,
    redirectTo: "/student",
  };
}

export async function addManualRosterStudentAction(formData: FormData): Promise<{
  ok: boolean;
  message: string;
}> {
  const { requireInstitutionAdminSession } = await import("@/lib/auth/session");
  const { manualStudentEntrySchema } = await import("@/lib/validation/student");
  const { normalizePhoneDigits } = await import("@/lib/store/memory");

  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;

  const entryType = (formData.get("entryType") as "email" | "phone" | "both") || "email";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const universityRollNo = String(formData.get("universityRollNo") || "").trim().toUpperCase();
  const department = String(formData.get("department") || "").trim();
  const graduationYear = formData.get("graduationYear") ? Number(formData.get("graduationYear")) : new Date().getFullYear() + 2;

  const parsed = manualStudentEntrySchema.safeParse({
    entryType,
    email,
    phone,
    name,
    universityRollNo,
    department,
    graduationYear,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid student details. Please provide an email or phone number.",
    };
  }

  // Check duplicates in existing roster
  const existing = await listTenantRoster(institutionId);
  const normalizedPhone = normalizePhoneDigits(phone);
  const isDuplicate = existing.some((e) => {
    if (email && e.email && e.email.toLowerCase() === email) return true;
    if (normalizedPhone && e.phone && normalizePhoneDigits(e.phone) === normalizedPhone) return true;
    return false;
  });

  if (isDuplicate) {
    return {
      ok: false,
      message: "A student with this email or phone number is already authorized in your campus roster.",
    };
  }

  await createRosterStudent(institutionId, {
    email,
    phone: phone || undefined,
    name: name || undefined,
    university_roll_no: universityRollNo,
    department: department || undefined,
    graduation_year: graduationYear,
    status: "ACTIVE",
  });

  await writeAuditLog({
    action: "institution.student.add_manual",
    resource: "institution_students",
    institutionId,
    result: "success",
    metadata: { email, phone, universityRollNo },
  });

  revalidatePath("/institution/students");
  revalidatePath("/institution");
  revalidatePath("/institution/analytics");

  return {
    ok: true,
    message: `Student successfully added to ${session.institutionName || "campus"} roster.`,
  };
}

export async function deleteRosterStudentAction(studentId: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const { requireInstitutionAdminSession } = await import("@/lib/auth/session");

  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;

  const deleted = await deleteRosterStudentPersisted(institutionId, studentId);
  if (!deleted) {
    return { ok: false, message: "Student could not be found or does not belong to this campus." };
  }

  await writeAuditLog({
    action: "institution.student.delete",
    resource: "institution_students",
    resourceId: studentId,
    institutionId,
    result: "success",
  });

  revalidatePath("/institution/students");
  revalidatePath("/institution");
  revalidatePath("/institution/analytics");

  return { ok: true, message: "Student removed from approved roster." };
}

export async function confirmRosterImportAction(
  preview: RosterPreviewResult,
): Promise<{ ok: boolean; message: string; imported?: number; skipped?: number }> {
  if (!(await isFeatureEnabled("roster.csv_import"))) {
    return { ok: false, message: "CSV import is disabled." };
  }
  const accepted = preview.rows
    .filter((r) => r.ok && r.normalized)
    .map((r) => r.normalized!);

  if (accepted.length === 0) {
    return { ok: false, message: "No valid rows to import." };
  }

  const { requireInstitutionAdminSession } = await import("@/lib/auth/session");
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;

  // When Supabase admin is configured, prefer DB write (service role).
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createAdminClient } = await import("@/lib/db/supabase/admin");
      const admin = createAdminClient();
      const payload = accepted.map((r) => ({
        institution_id: institutionId,
        email: r.email!,
        phone: r.phone || null,
        mobile_number: r.phone || null,
        full_name: r.name || null,
        university_roll_no: r.university_roll_no || null,
        roll_number: r.university_roll_no || null,
        graduation_year: r.graduation_year ?? null,
        department: r.department || null,
        programme: r.programme || null,
        batch: r.batch || null,
        status: r.status,
      }));
      const { error } = await admin.from("institution_students").upsert(payload, {
        onConflict: "institution_id,email",
        ignoreDuplicates: false,
      });
      if (error) {
        console.error("[roster.import]", error.message);
        await writeAuditLog({
          action: "institution.roster.import",
          resource: "institution_students",
          result: "failure",
          institutionId,
          metadata: { count: payload.length },
        });
        return {
          ok: false,
          message:
            "Database import failed. Check institution seed / migrations, then retry.",
        };
      }
      await writeAuditLog({
        action: "institution.roster.import",
        resource: "institution_students",
        result: "success",
        institutionId,
        metadata: { imported: payload.length },
      });
      return {
        ok: true,
        message: `Imported ${payload.length} student row(s) into database roster.`,
        imported: payload.length,
        skipped: 0,
      };
    } catch (err) {
      console.error("[roster.import]", err);
      return { ok: false, message: "Import failed unexpectedly." };
    }
  }

  const result = importRosterRows(
    institutionId,
    accepted.map((r) => ({
      email: r.email!,
      phone: r.phone,
      name: r.name,
      university_roll_no: r.university_roll_no || "",
      graduation_year: r.graduation_year,
      department: r.department,
      programme: r.programme,
      batch: r.batch,
      status: r.status,
    })),
  );
  await writeAuditLog({
    action: "institution.roster.import",
    resource: "institution_students",
    result: "success",
    institutionId,
    metadata: {
      imported: result.imported,
      skipped: result.skipped,
    },
  });
  revalidatePath("/institution");
  revalidatePath("/institution/students");
  revalidatePath("/institution/analytics");
  return {
    ok: true,
    message: `Imported ${result.imported} student row(s) successfully (${result.skipped} duplicates skipped).`,
    imported: result.imported,
    skipped: result.skipped,
  };
}

export async function getInstitutionOpsData() {
  const { requireInstitutionAdminSession } = await import("@/lib/auth/session");
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  return {
    institutionId,
    roster: isSupabaseConfigured() ? await listTenantRoster(institutionId) : listRoster(institutionId),
    tenants: isSupabaseConfigured() ? [await (await import("@/lib/data/platform")).getTenantById(institutionId)].filter(Boolean) : listTenants(),
  };
}
