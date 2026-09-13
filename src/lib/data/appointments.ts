import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import {
  bookAppointment as memBook,
  cancelAppointment as memCancel,
  listAppointmentsForCounsellor as memListCounsellor,
  listAppointmentsForStudent as memListStudent,
  type StoredAppointment,
  demoInstitutionId,
  DEV_COUNSELLOR_KEY,
} from "@/lib/store/memory";

async function resolveInstitutionId(userId: string): Promise<string> {
  if (!isSupabaseConfigured()) return demoInstitutionId();
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("student_profiles")
      .select("institution_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data?.institution_id) throw new Error("No institution membership found for this student.");
    return data.institution_id as string;
  } catch (err) {
    throw err;
  }
}

function mapRow(row: Record<string, unknown>): StoredAppointment {
  return {
    id: row.id as string,
    studentKey: row.student_user_id as string,
    counsellorKey: row.counsellor_user_id as string,
    startsAt: row.starts_at as string,
    endsAt: row.ends_at as string,
    status: row.status as StoredAppointment["status"],
    notes: (row.notes as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export async function listStudentAppointments(
  userId: string,
): Promise<StoredAppointment[]> {
  if (!isSupabaseConfigured()) return memListStudent(userId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("student_user_id", userId)
      .order("starts_at", { ascending: true });

    if (error || !data) {
      console.error("[repo.appointments.student]", error?.message);
      throw new Error(`Could not load appointments: ${error?.message ?? "unknown error"}`);
    }
    return data.map((r) => mapRow(r as Record<string, unknown>));
  } catch (err) {
    throw err;
  }
}

export async function listCounsellorAppointments(
  counsellorId: string,
): Promise<StoredAppointment[]> {
  if (!isSupabaseConfigured()) return memListCounsellor(counsellorId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("counsellor_user_id", counsellorId)
      .order("starts_at", { ascending: true });

    if (error || !data) {
      console.error("[repo.appointments.counsellor]", error?.message);
      throw new Error(`Could not load appointments: ${error?.message ?? "unknown error"}`);
    }
    return data.map((r) => mapRow(r as Record<string, unknown>));
  } catch (err) {
    throw err;
  }
}

export async function bookAppointmentForUser(input: {
  studentKey: string;
  counsellorKey?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}): Promise<
  { ok: true; appointment: StoredAppointment } | { ok: false; message: string }
> {
  const counsellorKey = input.counsellorKey ?? DEV_COUNSELLOR_KEY;

  if (!isSupabaseConfigured()) {
    return memBook({ ...input, counsellorKey });
  }

  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);
  if (!(end > start)) {
    return { ok: false, message: "End time must be after start time." };
  }
  if (start.getTime() < Date.now() - 60_000) {
    return { ok: false, message: "Cannot book appointments in the past." };
  }

  try {
    const supabase = await createClient();
    const institutionId = await resolveInstitutionId(input.studentKey);

    // Overlap check (DB also has exclusion constraint when applied)
    const { data: existing } = await supabase
      .from("appointments")
      .select("id, starts_at, ends_at")
      .eq("counsellor_user_id", counsellorKey)
      .eq("status", "SCHEDULED");

    for (const row of existing ?? []) {
      const bStart = new Date(row.starts_at as string);
      const bEnd = new Date(row.ends_at as string);
      if (start < bEnd && bStart < end) {
        return { ok: false, message: "That slot is already booked." };
      }
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        institution_id: institutionId,
        student_user_id: input.studentKey,
        counsellor_user_id: counsellorKey,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "SCHEDULED",
        notes: input.notes ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[repo.appointments.book]", error?.message);
      return { ok: false, message: `Could not book appointment: ${error?.message ?? "unknown error"}` };
    }

    return { ok: true, appointment: mapRow(data as Record<string, unknown>) };
  } catch (err) {
    console.error("[repo.appointments.book]", err);
    return { ok: false, message: "Could not book appointment. Please try again." };
  }
}

export async function cancelAppointmentForUser(
  id: string,
  studentKey: string,
): Promise<StoredAppointment | null> {
  if (!isSupabaseConfigured()) return memCancel(id, studentKey);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "CANCELLED" })
      .eq("id", id)
      .eq("student_user_id", studentKey)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      console.error("[repo.appointments.cancel]", error?.message);
      throw new Error(`Could not cancel appointment: ${error?.message ?? "unknown error"}`);
    }
    return mapRow(data as Record<string, unknown>);
  } catch (err) {
    throw err;
  }
}
