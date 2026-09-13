import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getTenant, getTenantByCode, demoInstitutionId, DEV_STUDENT_KEY } from "@/lib/store/memory";
import type { Role } from "@/types/roles";

export type AppSession = {
  userId: string;
  email: string | null;
  configured: boolean;
  role?: Role;
  institutionId?: string;
};

export type InstituteAdminSession = {
  userId: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  role: "INSTITUTION_ADMIN" | "INSTITUTION_SUPER_ADMIN";
};

export type SuperAdminSession = {
  userId: string;
  email: string;
  role: "PLATFORM_SUPER_ADMIN" | "PLATFORM_ADMIN";
};

export type StudentSession = {
  userId: string;
  email: string | null;
  institutionId: string;
  institutionCode?: string;
  role: "STUDENT";
};

async function getPersistedTenant(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("institutions").select("id, name, code, status, is_code_active, admin_email").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}

async function isPersistedSuperAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data, error } = await createAdminClient()
      .from("profiles")
      .select("is_super_admin")
      .eq("id", userId)
      .maybeSingle();
    return !error && Boolean(data?.is_super_admin);
  } catch {
    return false;
  }
}

/**
 * Resolve authenticated user from Supabase cookies or dev session.
 */
export async function getAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const instId = cookieStore.get("manoyug_inst_id")?.value;
  const devRole = cookieStore.get("manoyug_role")?.value;

  if (!isSupabaseConfigured()) {
    if (instId) {
      const tenant = getTenant(instId);
      return {
        userId: `admin-${instId}`,
        email: tenant?.adminEmail ?? "admin@institute.ac.in",
        configured: false,
        role: "INSTITUTION_ADMIN",
        institutionId: instId,
      };
    }
    if (devRole === "SUPER_ADMIN") {
      return {
        userId: "dev-super-admin",
        email: "superadmin@manoyug.internal",
        configured: false,
        role: "PLATFORM_SUPER_ADMIN",
      };
    }
    const studentLoggedIn = cookieStore.get("manoyug_student_session")?.value;
    if (studentLoggedIn) {
      return {
        userId: DEV_STUDENT_KEY,
        email: cookieStore.get("manoyug_student_email")?.value ?? "student@iitd.ac.in",
        configured: false,
        role: "STUDENT",
        institutionId: cookieStore.get("manoyug_student_inst_id")?.value ?? demoInstitutionId(),
      };
    }
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }

    const [memberships, profileIsSuperAdmin] = await Promise.all([
      getActiveMemberships(data.user.id),
      isPersistedSuperAdmin(data.user.id),
    ]);
    const rolesPriority: Role[] = [
      "PLATFORM_SUPER_ADMIN",
      "PLATFORM_ADMIN",
      "PLATFORM_SUPPORT",
      "INSTITUTION_SUPER_ADMIN",
      "INSTITUTION_ADMIN",
      "COUNSELLOR_SUPERVISOR",
      "COUNSELLOR",
      "CLINICAL_REVIEWER",
      "FINANCE",
      "STUDENT",
    ];
    let primaryRole: Role = profileIsSuperAdmin ? "PLATFORM_SUPER_ADMIN" : "STUDENT";
    let primaryInstitution: string | undefined = undefined;
    for (const r of rolesPriority) {
      if (profileIsSuperAdmin) break;
      const match = memberships.find((m) => m.role === r);
      if (match) {
        primaryRole = match.role;
        primaryInstitution = match.institutionId;
        break;
      }
    }

    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      configured: true,
      role: primaryRole,
      institutionId: primaryInstitution,
    };
  } catch {
    return null;
  }
}

export async function getActiveMemberships(userId: string): Promise<
  Array<{ institutionId: string; role: Role }>
> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("memberships")
      .select("institution_id, role")
      .eq("user_id", userId)
      .eq("is_active", true);
    if (error || !data) return [];
    return data.map((row) => ({
      institutionId: row.institution_id as string,
      role: row.role as Role,
    }));
  } catch {
    return [];
  }
}

export async function userHasRole(
  userId: string,
  roles: Role[],
  institutionId?: string,
): Promise<boolean> {
  const memberships = await getActiveMemberships(userId);
  return memberships.some(
    (m) =>
      roles.includes(m.role) &&
      (!institutionId || m.institutionId === institutionId),
  );
}

/**
 * STRICT SERVER GUARD: Requires Super Admin privileges.
 * If not authenticated or lacks PLATFORM_SUPER_ADMIN / PLATFORM_ADMIN, redirects immediately.
 */
export async function requireSuperAdminSession(): Promise<SuperAdminSession> {
  const cookieStore = await cookies();
  const devRole = cookieStore.get("manoyug_role")?.value;

  if (!isSupabaseConfigured() && devRole === "SUPER_ADMIN") {
    return {
      userId: "dev-super-admin",
      email: "superadmin@manoyug.internal",
      role: "PLATFORM_SUPER_ADMIN",
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        const [memberships, profileIsSuperAdmin] = await Promise.all([
          getActiveMemberships(data.user.id),
          isPersistedSuperAdmin(data.user.id),
        ]);
        const isSuper = profileIsSuperAdmin || memberships.some(
          (m) => m.role === "PLATFORM_SUPER_ADMIN" || m.role === "PLATFORM_ADMIN",
        );
        if (isSuper) {
          return {
            userId: data.user.id,
            email: data.user.email ?? "admin@platform.gov.in",
            role: "PLATFORM_SUPER_ADMIN",
          };
        }
      }
    } catch {
      // Handled by redirect below
    }
  }

  redirect("/login?next=/super-admin&error=unauthorized");
}

/**
 * STRICT SERVER GUARD: Requires Institute Admin session.
 * Scopes all operations to the verified institutionId.
 */
export async function requireInstitutionAdminSession(): Promise<InstituteAdminSession> {
  const cookieStore = await cookies();
  const instId = cookieStore.get("manoyug_inst_id")?.value;
  const instCode = cookieStore.get("manoyug_inst_code")?.value;

  if (instId) {
    const tenant = isSupabaseConfigured() ? await getPersistedTenant(instId) : getTenant(instId) ?? (instCode ? getTenantByCode(instCode) : null);
    if (tenant && tenant.status === "ACTIVE" && ("is_code_active" in tenant ? tenant.is_code_active : tenant.isCodeActive)) {
      return {
        userId: `admin-${tenant.id}`,
        institutionId: tenant.id,
        institutionName: tenant.name,
        institutionCode: tenant.code,
        role: "INSTITUTION_ADMIN",
      };
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        const memberships = await getActiveMemberships(data.user.id);
        const adminMembership = memberships.find(
          (m) => m.role === "INSTITUTION_ADMIN" || m.role === "INSTITUTION_SUPER_ADMIN",
        );
        if (adminMembership) {
          const tenant = await getPersistedTenant(adminMembership.institutionId);
          return {
            userId: data.user.id,
            institutionId: adminMembership.institutionId,
            institutionName: tenant?.name ?? "Partner Institution",
            institutionCode: tenant?.code ?? "UNKNOWN",
            role: adminMembership.role as "INSTITUTION_ADMIN" | "INSTITUTION_SUPER_ADMIN",
          };
        }
      }
    } catch {
      // Handled by redirect below
    }
  }

  redirect("/login?accountType=institute&error=unauthorized");
}

/**
 * STRICT SERVER GUARD: Requires authenticated Student session.
 */
export async function requireStudentSession(): Promise<StudentSession> {
  const cookieStore = await cookies();
  const studentSession = cookieStore.get("manoyug_student_session")?.value;
  const studentEmail = cookieStore.get("manoyug_student_email")?.value;
  const instId = cookieStore.get("manoyug_student_inst_id")?.value ?? demoInstitutionId();

  if (!isSupabaseConfigured()) {
    const tenant = getTenant(instId);
    return {
      userId: DEV_STUDENT_KEY,
      email: studentEmail ?? "student@iitd.ac.in",
      institutionId: instId,
      institutionCode: tenant?.code ?? "IITD-001",
      role: "STUDENT",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      const memberships = await getActiveMemberships(data.user.id);
      const studentMembership = memberships.find((m) => m.role === "STUDENT");
      const tenant = studentMembership ? await getPersistedTenant(studentMembership.institutionId) : null;
      if (!studentMembership) redirect("/login?next=/student&error=unauthorized");
      return {
        userId: data.user.id,
        email: data.user.email ?? null,
        institutionId: studentMembership.institutionId,
        institutionCode: tenant?.code,
        role: "STUDENT",
      };
    }
  } catch {
    // Handled by redirect below
  }

  redirect("/login?next=/student");
}
