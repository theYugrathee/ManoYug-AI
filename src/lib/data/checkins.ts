import {
  isSupabaseConfigured,
} from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import {
  addCheckin as memAdd,
  listCheckins as memList,
  type StoredCheckin,
  demoInstitutionId,
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

export async function listCheckinsForUser(
  userId: string,
): Promise<StoredCheckin[]> {
  if (!isSupabaseConfigured()) return memList(userId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      console.error("[repo.checkins.list]", error?.message);
      throw new Error(`Could not load check-ins: ${error?.message ?? "unknown error"}`);
    }

    return data.map((row) => ({
      id: row.id as string,
      studentKey: row.user_id as string,
      period: row.period as "daily" | "weekly",
      mood: row.mood as number,
      stress: row.stress as number,
      energy: row.energy as number,
      sleep: row.sleep as number,
      academicPressure: row.academic_pressure as number,
      socialConnection: row.social_connection as number,
      note: (row.note as string) || undefined,
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    console.error("[repo.checkins.list]", err);
    throw err;
  }
}

export async function addCheckinForUser(
  userId: string,
  data: Omit<StoredCheckin, "id" | "studentKey" | "createdAt">,
): Promise<StoredCheckin> {
  if (!isSupabaseConfigured()) return memAdd(userId, data);

  try {
    const supabase = await createClient();
    const institutionId = await resolveInstitutionId(userId);
    const { data: row, error } = await supabase
      .from("checkins")
      .insert({
        institution_id: institutionId,
        user_id: userId,
        period: data.period,
        mood: data.mood,
        stress: data.stress,
        energy: data.energy,
        sleep: data.sleep,
        academic_pressure: data.academicPressure,
        social_connection: data.socialConnection,
        note: data.note ?? null,
      })
      .select("*")
      .single();

    if (error || !row) {
      console.error("[repo.checkins.add]", error?.message);
      throw new Error(`Could not save check-in: ${error?.message ?? "unknown error"}`);
    }

    return {
      id: row.id as string,
      studentKey: row.user_id as string,
      period: row.period as "daily" | "weekly",
      mood: row.mood as number,
      stress: row.stress as number,
      energy: row.energy as number,
      sleep: row.sleep as number,
      academicPressure: row.academic_pressure as number,
      socialConnection: row.social_connection as number,
      note: (row.note as string) || undefined,
      createdAt: row.created_at as string,
    };
  } catch (err) {
    console.error("[repo.checkins.add]", err);
    throw err;
  }
}
