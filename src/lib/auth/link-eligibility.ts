import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase/admin";
import {
  findEligibilityMatch,
  type EligibilityIdentity,
  type EligibilityMatch,
  type RosterCandidate,
} from "@/lib/auth/eligibility";

type LinkResult =
  | { linked: true; institutionId: string }
  | { linked: false; reason: "not_configured" | "no_match" | "db_error" };

/**
 * After authenticated registration: match the approved roster and create the
 * STUDENT membership. Email eligibility is checked before account creation in
 * the production registration action as well.
 * Uses service role (roster is admin-only under RLS). Fail closed; never leak why.
 */
export async function linkStudentEligibility(params: {
  userId: string;
  identity: EligibilityIdentity;
  fullName: string;
  phone: string;
}): Promise<LinkResult> {
  if (!isSupabaseAdminConfigured()) {
    return { linked: false, reason: "not_configured" };
  }

  const admin = createAdminClient();
  const email = params.identity.email.trim().toLowerCase();

  const { data: rows, error } = await admin
    .from("institution_students")
    .select(
      `
      id,
      institution_id,
      email,
      university_roll_no,
      graduation_year,
      status,
      linked_user_id,
      institutions!inner ( status )
    `,
    )
    .ilike("email", email)
    .limit(20);

  if (error) {
    console.error("[eligibility] roster lookup failed", error.message);
    return { linked: false, reason: "db_error" };
  }

  const candidates: RosterCandidate[] = (rows ?? []).map((row) => {
    const institution = row.institutions as
      | { status: RosterCandidate["institution_status"] }
      | { status: RosterCandidate["institution_status"] }[]
      | null;
    const institutionStatus = Array.isArray(institution)
      ? institution[0]?.status
      : institution?.status;

    return {
      id: row.id as string,
      institution_id: row.institution_id as string,
      email: row.email as string,
      university_roll_no: row.university_roll_no as string,
      graduation_year: (row.graduation_year as number | null) ?? null,
      status: row.status as RosterCandidate["status"],
      linked_user_id: (row.linked_user_id as string | null) ?? null,
      institution_status:
        institutionStatus ?? ("ARCHIVED" as RosterCandidate["institution_status"]),
    };
  });

  const match: EligibilityMatch = findEligibilityMatch(
    candidates,
    params.identity,
    params.userId,
  );

  if (!match.matched) {
    return { linked: false, reason: "no_match" };
  }

  const now = new Date().toISOString();

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: params.userId,
      email,
      full_name: params.fullName,
      phone: params.phone,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("[eligibility] profile upsert failed", profileError.message);
    return { linked: false, reason: "db_error" };
  }

  const { error: membershipError } = await admin.from("memberships").upsert(
    {
      user_id: params.userId,
      institution_id: match.institutionId,
      role: "STUDENT",
      is_active: true,
    },
    { onConflict: "user_id,institution_id,role" },
  );

  if (membershipError) {
    console.error("[eligibility] membership failed", membershipError.message);
    return { linked: false, reason: "db_error" };
  }

  const { error: studentProfileError } = await admin
    .from("student_profiles")
    .upsert(
      {
        user_id: params.userId,
        institution_id: match.institutionId,
        graduation_year: params.identity.graduationYear,
        university_roll_no: params.identity.universityRollNo,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );

  if (studentProfileError) {
    console.error(
      "[eligibility] student_profiles failed",
      studentProfileError.message,
    );
    return { linked: false, reason: "db_error" };
  }

  const { error: rosterError } = await admin
    .from("institution_students")
    .update({ linked_user_id: params.userId, updated_at: now })
    .eq("id", match.rosterId)
    .is("linked_user_id", null);

  if (rosterError) {
    console.error("[eligibility] roster link failed", rosterError.message);
    return { linked: false, reason: "db_error" };
  }

  await admin.from("audit_logs").insert({
    actor_id: params.userId,
    role: "STUDENT",
    institution_id: match.institutionId,
    action: "student.eligibility.linked",
    resource: "institution_students",
    resource_id: match.rosterId,
    result: "success",
    metadata: {},
  });

  await admin.from("analytics_events").insert({
    institution_id: match.institutionId,
    user_id: params.userId,
    event_name: "account_created",
    properties: { source: "eligibility_link" },
  });

  return { linked: true, institutionId: match.institutionId };
}
