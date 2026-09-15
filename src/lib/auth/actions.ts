"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SAFE_MESSAGES, type AuthActionResult } from "@/lib/auth/messages";
import { linkStudentEligibility } from "@/lib/auth/link-eligibility";
import { isSupabaseConfigured, isSupabaseAdminConfigured, createAdminClient } from "@/lib/db/supabase/admin";
import { hashPassword } from "@/lib/auth/password";
import { createClient } from "@/lib/db/supabase/server";
import {
  getTenantByCode,
  verifyStudentInRoster,
  authenticateInstitute,
  getTenant,
  createTenant,
  toggleTenantCode,
  resetInstitutePassword,
  deleteTenantSafely,
  permanentDeleteTenant,
  addRosterStudent,
  deleteRosterStudent,
  listRoster,
  saveSupportContact,
  deleteSupportContact,
  findTenantByStudentEmail,
  demoInstitutionId,
  DEV_STUDENT_KEY,
  type StoredTenant,
} from "@/lib/store/memory";
import { priceForCapacity } from "@/lib/commercial/pricing";
import { revalidatePath } from "next/cache";
import {
  flattenZodErrors,
  loginSchema,
  registerStudentSchema,
  instituteLoginSchema,
  createInstituteSchema,
  resendOtpSchema,
  verifyOtpSchema,
} from "@/lib/validation/auth";
import { randomUUID } from "node:crypto";
import { requireSuperAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/log";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * STUDENT REGISTRATION ACTION
 * Enforces Institute Code validation & Approved Roster check server-side.
 */
export async function registerStudentAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = registerStudentSchema.safeParse({
    fullName: formString(formData, "fullName"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    graduationYear: formString(formData, "graduationYear"),
    universityRollNo: formString(formData, "universityRollNo"),
    instituteCode: formString(formData, "instituteCode"),
    password: formString(formData, "password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: AUTH_SAFE_MESSAGES.registrationValidation,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const data = parsed.data;

  // Production persistence path: validate eligibility and create the complete
  // Auth/profile/membership graph in Supabase. Never hydrate process memory.
  if (isSupabaseConfigured() && isSupabaseAdminConfigured()) {
    try {
      const admin = createAdminClient();
      const { data: institution, error: institutionError } = await admin
        .from("institutions").select("id, name, code, status, is_code_active, student_capacity")
        // Institute codes are identifiers, not search text. `ilike` treats
        // `%` and `_` as wildcards and could select the wrong campus.
        .eq("code", data.instituteCode).eq("status", "ACTIVE").eq("is_code_active", true).maybeSingle();
      if (institutionError || !institution) return { ok: false, code: "INVALID_INSTITUTE_CODE", message: "That institute code doesn't appear to be valid.", fieldErrors: { instituteCode: "Institute code not found or inactive." } };

      const { data: rosterRows, error: rosterError } = await admin.from("institution_students")
        .select("id, email, mobile_number, phone, roll_number, university_roll_no, graduation_year, linked_user_id, status")
        .eq("institution_id", institution.id);
      if (rosterError) return { ok: false, code: "REGISTRATION_FAILED", message: "We could not verify campus eligibility. Please try again." };
      const eligible = (rosterRows ?? []).find((row) => {
        if (String(row.status ?? "ACTIVE") !== "ACTIVE") return false;
        const emailMatch = String(row.email ?? "").toLowerCase() === data.email.toLowerCase();
        // Email is the sole eligibility identifier. Other profile fields are
        // collected for the student account but never grant or deny access.
        return emailMatch;
      });
      if (!eligible) return { ok: false, code: "EMAIL_NOT_APPROVED", message: "This email is not associated with an eligible student account for this institute. Please contact your institute administrator.", fieldErrors: { email: "This email is not on your institute's approved student list." } };
      const submittedRoll = String(data.universityRollNo ?? "").trim().toUpperCase();
      if (eligible.linked_user_id) {
        return {
          ok: false,
          code: "ACCOUNT_EXISTS",
          message: "This campus record is already linked to an account. Please sign in or contact your institution administrator.",
          fieldErrors: { email: "This student record is already linked to an account." },
        };
      }
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        // OTP delivery is intentionally disabled until a verified sending
        // domain is available. Eligibility is still enforced server-side.
        email_confirm: true,
        user_metadata: { full_name: data.fullName, phone: data.phone },
      });
      let userId = created.user?.id;
      const createdNewUser = Boolean(userId);
      if (createError) {
        // A duplicate registration must never overwrite the existing password.
        // The old behaviour silently reset it, which made account ownership
        // ambiguous and could also leave an Auth user without the app graph.
        const { data: users, error: usersError } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const existing = usersError
          ? null
          : users.users.find((user) => user.email?.toLowerCase() === data.email.toLowerCase());
        if (!existing) {
          return { ok: false, code: "REGISTRATION_FAILED", message: "We could not create your account. Please try again." };
        }

        const [{ data: existingMembership }, { data: existingProfile }] = await Promise.all([
          admin.from("memberships").select("id").eq("user_id", existing.id).eq("role", "STUDENT").eq("is_active", true).limit(1),
          admin.from("student_profiles").select("user_id").eq("user_id", existing.id).maybeSingle(),
        ]);
        if ((existingMembership?.length ?? 0) > 0 || existingProfile) {
          return {
            ok: false,
            code: "ACCOUNT_EXISTS",
            message: "An account already exists for this email. Please sign in with your existing password.",
            fieldErrors: { email: "Account already exists. Use Student sign in instead." },
          };
        }

        // This is an interrupted first registration. Confirm the email and
        // refresh profile metadata, but preserve the password the user chose.
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, {
          email_confirm: true,
          user_metadata: { full_name: data.fullName, phone: data.phone },
        });
      }
      if (!userId) return { ok: false, code: "REGISTRATION_FAILED", message: "We could not create your account. Please try again." };
      const rosterUpdate = {
        linked_user_id: userId,
        full_name: data.fullName,
        mobile_number: data.phone,
        graduation_year: data.graduationYear,
        ...(submittedRoll ? { roll_number: submittedRoll, university_roll_no: submittedRoll } : {}),
      };
      const graphOperations = [
        ["profile", admin.from("profiles").upsert({ id: userId, email: data.email, full_name: data.fullName, phone: data.phone })],
        ["membership", admin.from("memberships").upsert({ user_id: userId, institution_id: institution.id, role: "STUDENT", is_active: true }, { onConflict: "user_id,institution_id,role" })],
        ["student_profile", admin.from("student_profiles").upsert({ user_id: userId, institution_id: institution.id, graduation_year: data.graduationYear, university_roll_no: submittedRoll || null })],
        ["roster_link", admin.from("institution_students").update(rosterUpdate, { count: "exact" }).eq("id", eligible.id).is("linked_user_id", null)],
      ] as const;
      const graphResults = await Promise.all(graphOperations.map(async ([name, operation]) => ({ name, result: await operation })));
      const graphFailure = graphResults.find(({ name, result }) => result.error || (name === "roster_link" && result.count === 0));
      if (graphFailure) {
        console.error("[auth.register.persistence.graph]", graphFailure.name, graphFailure.result.error);
        // Do not leave an orphan Auth user when this was a brand-new account.
        if (createdNewUser) await admin.auth.admin.deleteUser(userId);
        return { ok: false, code: "REGISTRATION_FAILED", message: "We could not finish linking your account to the institution. Please try again." };
      }
      const supabase = await createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (signInError) return { ok: false, code: "LOGIN_FAILED", message: "Account created. Please sign in with your new credentials." };
      return {
        ok: true,
        code: "REGISTERED",
        message: `Account created and verified for ${institution.name}.`,
        redirectTo: "/student/onboarding",
      };
    } catch (error) {
      console.error("[auth.register.persistence]", error);
      return { ok: false, code: "REGISTRATION_FAILED", message: "We could not create your account. Please try again." };
    }
  }

  // A configured Supabase deployment must have the service role available for
  // server-side eligibility and membership linking. Never fall back to the
  // process-memory session while the app is pointed at a real project.
  if (isSupabaseConfigured()) {
    return { ok: false, code: "REGISTRATION_FAILED", message: "Account registration is temporarily unavailable. Please contact support." };
  }

  // 1. Validate Institute Code Server-Side
  const tenant = getTenantByCode(data.instituteCode);
  if (!tenant || tenant.status !== "ACTIVE" || !tenant.isCodeActive) {
    return {
      ok: false,
      code: "INVALID_INSTITUTE_CODE",
      message: "That institute code doesn't appear to be valid. Please check the code provided by your college or university.",
      fieldErrors: {
        instituteCode: "Institute code not found or inactive. Check with your college administrator.",
      },
    };
  }

  // 2. Verify Student's Email or Phone in that Institute's Approved Roster
  const rosterCheck = verifyStudentInRoster(tenant.id, data.email, data.phone);
  if (!rosterCheck.verified) {
    return {
      ok: false,
      code: "EMAIL_NOT_APPROVED",
        message: "This email is not associated with an eligible student account for this institute. Please contact your institute administrator.",
      fieldErrors: {
        email: "This email is not on your institute's approved student list.",
      },
    };
  }

  // 3. Check capacity
  const rosterSize = listRoster(tenant.id).length;
  if (rosterSize >= tenant.studentCapacity) {
    return {
      ok: false,
      code: "CAPACITY_EXCEEDED",
      message: "This institute has reached its maximum student capacity. Please contact your institution administrator.",
    };
  }

  // 4. Check roll number uniqueness within this institution
  // 3. Process Account Creation
  const cookieStore = await cookies();

  // Helper to establish student session cookies
  const setStudentCookies = () => {
    cookieStore.set("manoyug_student_session", "true", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("manoyug_student_email", data.email, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("manoyug_student_inst_id", tenant.id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  };

  if (!isSupabaseConfigured()) {
    // Local / In-memory session setup
    setStudentCookies();

    return {
      ok: true,
      code: "REGISTERED",
      message: `Account created and verified for ${tenant.name}.`,
      redirectTo: "/student",
    };
  }

  try {
    // If Supabase Admin client is available, create or update user with auto-confirmed email
    if (isSupabaseAdminConfigured()) {
      try {
        const adminClient = createAdminClient();
        const { data: adminUser, error: adminErr } = await adminClient.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            full_name: data.fullName,
            phone: data.phone,
            graduation_year: data.graduationYear,
            university_roll_no: data.universityRollNo,
            institution_id: tenant.id,
            role_intent: "STUDENT",
          },
        });

        if (adminErr && adminErr.message?.toLowerCase().includes("already")) {
          // If user already exists, update password and confirm email so they can log in seamlessly
          const { data: usersList } = await adminClient.auth.admin.listUsers();
          const match = usersList?.users?.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
          if (match) {
            await adminClient.auth.admin.updateUserById(match.id, {
              password: data.password,
              email_confirm: true,
              user_metadata: {
                full_name: data.fullName,
                phone: data.phone,
                graduation_year: data.graduationYear,
                university_roll_no: data.universityRollNo,
                institution_id: tenant.id,
                role_intent: "STUDENT",
              },
            });
          }
        }
      } catch (adminEx) {
        console.error("[auth.register] admin client error:", adminEx);
      }
    } else {
      const supabase = await createClient();
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            graduation_year: data.graduationYear,
            university_roll_no: data.universityRollNo,
            institution_id: tenant.id,
            role_intent: "STUDENT",
          },
        },
      });
    }

    // Always establish student session so student is not blocked
    setStudentCookies();

    return {
      ok: true,
      code: "REGISTERED",
      message: `Account created and verified for ${tenant.name}.`,
      redirectTo: "/student",
    };
  } catch (err) {
    console.error("[auth.register] fallback activation", err);
    // Fallback gracefully to authenticated session
    setStudentCookies();

    return {
      ok: true,
      code: "REGISTERED",
      message: `Account created and verified for ${tenant.name}.`,
      redirectTo: "/student",
    };
  }
}

/**
 * STUDENT LOGIN ACTION
 */
export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    instituteCode: formString(formData, "instituteCode") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: AUTH_SAFE_MESSAGES.registrationValidation,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const nextPath = formString(formData, "next") || "/student";
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      if (error || !data.user) return { ok: false, code: "LOGIN_FAILED", message: AUTH_SAFE_MESSAGES.loginFailed };
      const { data: memberships, error: membershipError } = await supabase.from("memberships").select("institution_id, role").eq("user_id", data.user.id).eq("is_active", true);
      if (membershipError) return { ok: false, code: "LOGIN_FAILED", message: "We could not verify your account access." };
      const studentMembership = (memberships ?? []).find((membership) => membership.role === "STUDENT");
      if (!studentMembership) return { ok: false, code: "UNAUTHORIZED", message: "This account does not have student access." };
      // A membership alone is not enough: require the durable profile and the
      // institution's approved roster link created during registration.
      const admin = createAdminClient();
      const [{ data: studentProfile }, { data: linkedRoster }] = await Promise.all([
        admin.from("student_profiles").select("user_id, institution_id").eq("user_id", data.user.id).eq("institution_id", studentMembership.institution_id).maybeSingle(),
        admin.from("institution_students").select("id").eq("linked_user_id", data.user.id).eq("institution_id", studentMembership.institution_id).eq("status", "ACTIVE").maybeSingle(),
      ]);
      if (!studentProfile || !linkedRoster) return { ok: false, code: "UNAUTHORIZED", message: "Your student eligibility link could not be verified. Contact your institute administrator." };
      if (parsed.data.instituteCode) {
        const { data: institution } = await admin.from("institutions").select("id, status, is_code_active").eq("code", parsed.data.instituteCode).maybeSingle();
        if (!institution || institution.id !== studentMembership.institution_id || institution.status !== "ACTIVE" || !institution.is_code_active) return { ok: false, code: "INSTITUTE_UNAVAILABLE", message: "This institute code is unavailable or does not match your account." };
      }
      cookieStore.set("manoyug_student_email", parsed.data.email, { path: "/", httpOnly: true, sameSite: "lax" });
      return { ok: true, code: "LOGGED_IN", message: "Signed in.", redirectTo: nextPath.startsWith("/") ? nextPath : "/student" };
    } catch (error) {
      console.error("[auth.login.persistence]", error);
      return { ok: false, code: "LOGIN_FAILED", message: AUTH_SAFE_MESSAGES.loginGeneric };
    }
  }

  let targetTenant: StoredTenant | null = null;
  if (parsed.data.instituteCode) {
    targetTenant = getTenantByCode(parsed.data.instituteCode);
    if (!targetTenant) {
      return {
        ok: false,
        code: "INVALID_INSTITUTE_CODE",
        message: "Institute code not found.",
        fieldErrors: { instituteCode: "Institute code not found." },
      };
    }
    if (targetTenant.status !== "ACTIVE" || !targetTenant.isCodeActive) {
      return {
        ok: false,
        code: "INSTITUTE_UNAVAILABLE",
        message: "This institute is currently unavailable.",
        fieldErrors: { instituteCode: "This institute is currently unavailable." },
      };
    }
  } else {
    targetTenant = findTenantByStudentEmail(parsed.data.email);
  }

  const institutionId = targetTenant ? targetTenant.id : demoInstitutionId();

  if (!isSupabaseConfigured()) {
    cookieStore.set("manoyug_student_session", "true", { path: "/", httpOnly: true, sameSite: "lax" });
    cookieStore.set("manoyug_student_email", parsed.data.email, { path: "/", httpOnly: true, sameSite: "lax" });
    cookieStore.set("manoyug_student_inst_id", institutionId, { path: "/", httpOnly: true, sameSite: "lax" });

    return {
      ok: true,
      code: "LOGGED_IN",
      message: "Signed in as Student.",
      redirectTo: nextPath.startsWith("/") ? nextPath : "/student",
    };
  }

  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return {
        ok: false,
        code: "LOGIN_FAILED",
        message: AUTH_SAFE_MESSAGES.loginFailed,
      };
    }

    // Check user membership role to route appropriately
    const { data: membershipRows } = await supabase
      .from("memberships")
      .select("role, institution_id")
      .eq("user_id", data.user.id)
      .eq("is_active", true);

    const isSuperAdmin = membershipRows?.some(
      (m) => m.role === "PLATFORM_SUPER_ADMIN" || m.role === "PLATFORM_ADMIN",
    );
    const isInstAdmin = membershipRows?.some(
      (m) => m.role === "INSTITUTION_ADMIN" || m.role === "INSTITUTION_SUPER_ADMIN",
    );

    let redirectTo = nextPath && nextPath !== "/student" ? nextPath : "/student";
    if (isSuperAdmin) {
      redirectTo = "/super-admin";
      cookieStore.delete("manoyug_student_session");
      cookieStore.delete("manoyug_student_email");
      cookieStore.delete("manoyug_student_inst_id");
      cookieStore.delete("manoyug_inst_id");
      cookieStore.delete("manoyug_role");
    } else if (isInstAdmin) {
      redirectTo = "/institution";
      cookieStore.delete("manoyug_student_session");
      cookieStore.delete("manoyug_student_email");
      cookieStore.delete("manoyug_student_inst_id");
      if (membershipRows?.[0]?.institution_id) {
        cookieStore.set("manoyug_inst_id", membershipRows[0].institution_id, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
        });
      }
    } else {
      cookieStore.set("manoyug_student_session", "true", { path: "/", httpOnly: true, sameSite: "lax" });
      cookieStore.set("manoyug_student_email", parsed.data.email, { path: "/", httpOnly: true, sameSite: "lax" });
    }

    return {
      ok: true,
      code: "LOGGED_IN",
      message: isSuperAdmin ? "Signed in as Super Administrator." : isInstAdmin ? "Signed in as Institution Administrator." : "Signed in.",
      redirectTo,
    };
  } catch (err) {
    console.error("[auth.login] unexpected", err);
    return {
      ok: false,
      code: "LOGIN_FAILED",
      message: AUTH_SAFE_MESSAGES.loginGeneric,
    };
  }
}

/**
 * INSTITUTE LOGIN ACTION (Institute Code + Password)
 * Distinct from student login. Scopes session to the verified tenant.
 */
export async function instituteLoginAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = instituteLoginSchema.safeParse({
    instituteCode: formString(formData, "instituteCode"),
    password: formString(formData, "password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please enter your Institute Code and Password.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (isSupabaseAdminConfigured()) {
    try {
      const admin = createAdminClient();
      const { data: tenant, error } = await admin.from("institutions").select("id, name, code, password_hash, status, is_code_active").eq("code", parsed.data.instituteCode).maybeSingle();
      const { verifyPassword } = await import("@/lib/auth/password");
      if (error || !tenant || tenant.status !== "ACTIVE" || !tenant.is_code_active || !tenant.password_hash || !verifyPassword(parsed.data.password, tenant.password_hash)) return { ok: false, code: "AUTH_FAILED", message: "Invalid institute code or password." };
      const cookieStore = await cookies();
      cookieStore.set("manoyug_inst_id", tenant.id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set("manoyug_inst_code", tenant.code, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
      return { ok: true, code: "LOGGED_IN", message: `Authenticated as ${tenant.name}.`, redirectTo: "/institution" };
    } catch (error) {
      console.error("[instituteLogin.persistence]", error);
      return { ok: false, code: "AUTH_FAILED", message: "We could not verify institution access. Please try again." };
    }
  }

  // Try in-memory first
  let auth = authenticateInstitute(parsed.data.instituteCode, parsed.data.password);

  // Supabase fallback: hydrate from DB if tenant missing from memory
  if (!auth.ok && isSupabaseAdminConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from("institutions")
        .select("*")
        .eq("code", parsed.data.instituteCode)
        .eq("status", "ACTIVE")
        .eq("is_code_active", true)
        .single();

      if (data) {
        const { verifyPassword } = await import("@/lib/auth/password");
        const pwOk = verifyPassword(parsed.data.password, data.password_hash);
        if (pwOk) {
          // Hydrate in-memory store so session checks work
          const tenant: StoredTenant = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            code: data.code,
            isCodeActive: data.is_code_active ?? true,
            status: "ACTIVE",
            studentCapacity: data.student_capacity ?? 5000,
            annualPriceInr: priceForCapacity(data.student_capacity ?? 5000).annualInr,
            planLabel: `Up to ${(data.student_capacity ?? 5000).toLocaleString("en-IN")} students`,
            activeStudents: 0,
            contractStart: data.created_at ? new Date(data.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            adminEmail: data.admin_email,
            officialEmail: data.admin_email,
            passwordHash: data.password_hash,
            institutionType: data.institution_type ?? "University",
            city: data.location?.split(",")[0]?.trim() ?? "",
            state: data.location?.split(",")[1]?.trim() ?? "",
          };
          createTenant(tenant);
          auth = { ok: true, tenant };
        } else {
          auth = { ok: false, error: "Invalid credentials. Please verify your institute code and password." };
        }
      }
    } catch (err) {
      console.error("[instituteLoginAction] Supabase fallback error:", err);
    }
  }

  if (!auth.ok || !auth.tenant) {
    return {
      ok: false,
      code: "AUTH_FAILED",
      message: auth.error ?? "Invalid institute code or password.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("manoyug_inst_id", auth.tenant.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  cookieStore.set("manoyug_inst_code", auth.tenant.code, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    ok: true,
    code: "LOGGED_IN",
    message: `Authenticated as ${auth.tenant.name}.`,
    redirectTo: "/institution",
  };
}

/**
 * SUPER ADMIN QUICK SWITCH / AUTH ACTION
 */
export async function superAdminLoginAction(): Promise<AuthActionResult> {
  if (isSupabaseConfigured()) {
    return { ok: false, code: "UNAUTHORIZED", message: "Use the platform administrator sign-in page." };
  }
  const cookieStore = await cookies();
  cookieStore.set("manoyug_role", "SUPER_ADMIN", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return {
    ok: true,
    code: "LOGGED_IN",
    message: "Super Admin privileges activated.",
    redirectTo: "/super-admin",
  };
}

/** Platform-only sign-in verified against profiles.is_super_admin. */
export async function superAdminSignInAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION_ERROR", message: AUTH_SAFE_MESSAGES.registrationValidation, fieldErrors: flattenZodErrors(parsed.error) };
  }
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return { ok: false, code: "AUTH_UNAVAILABLE", message: AUTH_SAFE_MESSAGES.authNotConfigured };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    if (error || !data.user) return { ok: false, code: "LOGIN_FAILED", message: AUTH_SAFE_MESSAGES.loginFailed };

    const { data: profile, error: profileError } = await createAdminClient()
      .from("profiles")
      .select("is_super_admin")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError || !profile?.is_super_admin) {
      await supabase.auth.signOut();
      return { ok: false, code: "UNAUTHORIZED", message: "This account does not have platform administrator access." };
    }

    const cookieStore = await cookies();
    cookieStore.delete("manoyug_student_session");
    cookieStore.delete("manoyug_student_email");
    cookieStore.delete("manoyug_student_inst_id");
    cookieStore.delete("manoyug_inst_id");
    cookieStore.delete("manoyug_role");
    return { ok: true, code: "LOGGED_IN", message: "Signed in to the platform console.", redirectTo: "/super-admin" };
  } catch (error) {
    console.error("[auth.super-admin]", error);
    return { ok: false, code: "LOGIN_FAILED", message: AUTH_SAFE_MESSAGES.loginGeneric };
  }
}

/** Promote or demote an existing Supabase Auth user without creating an institution membership. */
export async function setPlatformAdminAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
) {
  const session = await requireSuperAdminSession();
  const email = formString(formData, "email").trim().toLowerCase();
  const enabled = formData.get("enabled") === "true";
  if (!email || !email.includes("@")) return { ok: false, message: "Enter a valid teammate email." };

  try {
    const admin = createAdminClient();
    const { data: profile, error: lookupError } = await admin.from("profiles").select("id, email").ilike("email", email).maybeSingle();
    if (lookupError || !profile) return { ok: false, message: "Create this teammate's Supabase Auth account first, then promote it." };
    const { error } = await admin.from("profiles").update({ is_super_admin: enabled }).eq("id", profile.id);
    if (error) return { ok: false, message: `Could not update platform access: ${error.message}` };
    await writeAuditLog({ actorId: session.userId, action: enabled ? "platform.admin.promote" : "platform.admin.demote", resource: "profiles", resourceId: profile.id, result: "success", metadata: { email } });
    revalidatePath("/super-admin/security");
    return { ok: true, message: enabled ? `${email} can now sign in at /super-admin.` : `${email} no longer has platform access.` };
  } catch {
    return { ok: false, message: "Platform access update failed." };
  }
}

/**
 * SUPER ADMIN: CREATE NEW INSTITUTE ACTION
 */
export async function createInstituteAction(formData: FormData) {
  const parsed = createInstituteSchema.safeParse({
    name: formString(formData, "name"),
    institutionType: formString(formData, "institutionType"),
    city: formString(formData, "city"),
    state: formString(formData, "state"),
    code: formString(formData, "code"),
    adminEmail: formString(formData, "adminEmail"),
    password: formString(formData, "password"),
    studentCapacity: formString(formData, "studentCapacity"),
    phone: formString(formData, "phone"),
    website: formString(formData, "website"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fill all required fields properly.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  // Development-only check. Production validates uniqueness in Postgres.
  const existing = !isSupabaseAdminConfigured() ? getTenantByCode(parsed.data.code) : null;
  if (existing) {
    return {
      ok: false,
      message: `Institute code ${parsed.data.code} is already assigned to "${existing.name}". Please use a unique code.`,
      fieldErrors: { code: "This code is already in use." },
    };
  }

  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);
  const capacity = parsed.data.studentCapacity;

  const newTenant: StoredTenant = {
    id: randomUUID(),
    name: parsed.data.name,
    slug: parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    code: parsed.data.code,
    isCodeActive: true,
    status: "ACTIVE",
    studentCapacity: capacity,
    annualPriceInr: priceForCapacity(capacity).annualInr,
    planLabel: `Up to ${capacity.toLocaleString("en-IN")} students`,
    activeStudents: 0,
    contractStart: now.toISOString().slice(0, 10),
    contractEnd: end.toISOString().slice(0, 10),
    officialEmail: parsed.data.adminEmail,
    adminEmail: parsed.data.adminEmail,
    passwordHash: hashPassword(parsed.data.password),
    institutionType: parsed.data.institutionType,
    phone: parsed.data.phone,
    city: parsed.data.city,
    state: parsed.data.state,
    website: parsed.data.website,
  };

  if (isSupabaseAdminConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient.from("institutions").insert({
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
        code: newTenant.code,
        is_code_active: true,
        status: "ACTIVE",
        student_capacity: capacity,
        admin_email: newTenant.adminEmail,
        password_hash: newTenant.passwordHash,
        location: `${newTenant.city || ""}, ${newTenant.state || ""}`.trim().replace(/^,\s*|,\s*$/g, ""),
        institution_type: newTenant.institutionType || "University",
      });
      if (error) return { ok: false, message: `Could not create institute: ${error.message}`, fieldErrors: error.message.toLowerCase().includes("code") ? { code: "This code is already in use." } : undefined };
      revalidatePath("/super-admin");
      revalidatePath("/super-admin/institutions");
      return { ok: true, tenant: newTenant, message: `Institute "${newTenant.name}" created with code ${newTenant.code}.` };
    } catch (err) {
      console.error("[createInstituteAction] Supabase save error:", err);
      return { ok: false, message: "Could not create institute in Supabase. Please try again." };
    }
  }

  const result = createTenant(newTenant);
  if (!result.ok) {
    return { ok: false, message: result.error, fieldErrors: { code: "This code is already in use." } };
  }

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/institutions");

  return { ok: true, tenant: result.tenant, message: `Institute "${newTenant.name}" created with code ${newTenant.code}.` };
}

/**
 * SUPER ADMIN: TOGGLE INSTITUTE CODE STATUS
 */
export async function toggleInstituteCodeAction(institutionId: string, isCodeActive: boolean) {
  if (isSupabaseAdminConfigured()) {
    const { data, error } = await createAdminClient().from("institutions").update({ is_code_active: isCodeActive }).eq("id", institutionId).select("code").maybeSingle();
    if (error || !data) return { ok: false, message: `Could not update institute: ${error?.message ?? "not found"}` };
    revalidatePath("/super-admin/institutions");
    return { ok: true, isCodeActive, message: `Institute code ${data.code} is now ${isCodeActive ? "Active" : "Disabled"}.` };
  }

  const updated = toggleTenantCode(institutionId, isCodeActive);
  revalidatePath("/super-admin/institutions");
  if (!updated) return { ok: false, message: "Institute not found." };
  return {
    ok: true,
    isCodeActive: updated.isCodeActive,
    message: `Institute code ${updated.code} is now ${updated.isCodeActive ? "Active" : "Disabled"}.`,
  };
}

/**
 * SUPER ADMIN: RESET INSTITUTE CREDENTIALS
 */
export async function resetInstitutePasswordAction(institutionId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }

  if (isSupabaseAdminConfigured()) {
    const { data, error } = await createAdminClient().from("institutions").update({ password_hash: hashPassword(newPassword) }).eq("id", institutionId).select("name, code").maybeSingle();
    if (error || !data) return { ok: false, message: `Could not reset password: ${error?.message ?? "not found"}` };
    revalidatePath("/super-admin/institutions");
    return { ok: true, message: `Password reset successfully for ${data.name} (${data.code}).` };
  }

  const hashedLocal = hashPassword(newPassword);
  const updated = resetInstitutePassword(institutionId, hashedLocal);
  revalidatePath("/super-admin/institutions");
  if (!updated) return { ok: false, message: "Institute not found." };
  return { ok: true, message: `Password reset successfully for ${updated.name} (${updated.code}).` };
}

/**
 * SUPER ADMIN: SAFELY ARCHIVE / REVOKE INSTITUTE ACCESS
 */
export async function deleteInstituteAction(institutionId: string) {
  if (isSupabaseAdminConfigured()) {
    const { data, error } = await createAdminClient().from("institutions").update({ status: "ARCHIVED", is_code_active: false }).eq("id", institutionId).select("id").maybeSingle();
    if (error || !data) return { ok: false, message: `Could not archive institute: ${error?.message ?? "not found"}` };
    revalidatePath("/super-admin");
    revalidatePath("/super-admin/institutions");
    return { ok: true, message: "Institute archived and access revoked safely." };
  }

  const success = deleteTenantSafely(institutionId);
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/institutions");
  if (!success) return { ok: false, message: "Institute not found." };
  return { ok: true, message: "Institute archived and access revoked safely." };
}

/**
 * SUPER ADMIN: PERMANENTLY DELETE INSTITUTE & ALL ASSOCIATED DATA
 */
export async function permanentDeleteInstituteAction(institutionId: string) {
  if (isSupabaseAdminConfigured()) {
    const { error } = await createAdminClient().from("institutions").delete().eq("id", institutionId);
    if (error) return { ok: false, message: `Could not permanently delete institute: ${error.message}` };
    revalidatePath("/super-admin");
    revalidatePath("/super-admin/institutions");
    revalidatePath("/super-admin/students");
    return { ok: true, message: "Institute and all associated student rosters deleted permanently." };
  }

  permanentDeleteTenant(institutionId);
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/institutions");
  revalidatePath("/super-admin/students");

  return { ok: true, message: "Institute and all associated student rosters deleted permanently." };
}

/**
 * INSTITUTE ADMIN: ADD SINGLE ROSTER STUDENT
 */
export async function addRosterStudentAction(institutionId: string, formData: FormData) {
  const email = formString(formData, "email").toLowerCase().trim();
  const name = formString(formData, "name").trim();
  const roll = formString(formData, "university_roll_no").trim();
  const department = formString(formData, "department").trim();
  const gradYear = Number(formString(formData, "graduation_year")) || new Date().getFullYear() + 2;

  if (!email) {
    return { ok: false, message: "Student email is required." };
  }

  const row = addRosterStudent(institutionId, {
    email,
    name: name || undefined,
    university_roll_no: roll,
    department: department || undefined,
    graduation_year: gradYear,
    status: "ACTIVE",
  });

  return { ok: true, student: row, message: `Student ${email} added to approved roster.` };
}

/**
 * INSTITUTE ADMIN: DELETE ROSTER STUDENT
 */
export async function deleteRosterStudentAction(institutionId: string, studentId: string) {
  const ok = deleteRosterStudent(institutionId, studentId);
  return { ok, message: ok ? "Student removed from roster." : "Student record not found." };
}

/**
 * INSTITUTE ADMIN: SAVE CAMPUS SUPPORT CONTACT
 */
export async function saveCampusSupportContactAction(institutionId: string, formData: FormData) {
  const title = formString(formData, "title").trim();
  const contactType = (formString(formData, "contactType") || "wellbeing_office") as any;
  const phone = formString(formData, "phone").trim();
  const email = formString(formData, "email").trim();
  const location = formString(formData, "location").trim();
  const operatingHours = formString(formData, "operatingHours").trim();
  const isEmergency = formString(formData, "isEmergency") === "true";
  const id = formString(formData, "id").trim() || undefined;

  if (!title || !phone) {
    return { ok: false, message: "Title and phone number are required." };
  }

  const contact = saveSupportContact({
    id,
    institutionId,
    title,
    contactType,
    phone,
    email: email || undefined,
    location: location || undefined,
    operatingHours: operatingHours || undefined,
    isEmergency,
  });

  return { ok: true, contact, message: "Support contact saved successfully." };
}

/**
 * INSTITUTE ADMIN: DELETE CAMPUS SUPPORT CONTACT
 */
export async function deleteCampusSupportContactAction(institutionId: string, contactId: string) {
  const ok = deleteSupportContact(institutionId, contactId);
  return { ok, message: ok ? "Contact removed." : "Contact not found." };
}

/**
 * VERIFY OTP ACTION
 */
export async function verifyOtpAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    cookieStore.set("manoyug_student_session", "true", { path: "/", httpOnly: true, sameSite: "lax" });
    return {
      ok: true,
      code: "VERIFIED_LINKED",
      message: "Mock OTP verified.",
      redirectTo: "/student",
    };
  }

  const parsed = verifyOtpSchema.safeParse({
    email: formString(formData, "email"),
    token: formString(formData, "token"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: AUTH_SAFE_MESSAGES.otpInvalid,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: "signup",
    });

    if (error || !data.user) {
      const retry = await supabase.auth.verifyOtp({
        email: parsed.data.email,
        token: parsed.data.token,
        type: "email",
      });
      if (retry.error || !retry.data.user) {
        return {
          ok: false,
          code: "OTP_INVALID",
          message: AUTH_SAFE_MESSAGES.otpInvalid,
        };
      }
      return { ok: true, code: "VERIFIED_LINKED", message: "OTP verified.", redirectTo: "/student" };
    }

    return { ok: true, code: "VERIFIED_LINKED", message: "OTP verified.", redirectTo: "/student" };
  } catch (err) {
    console.error("[auth.verifyOtp] unexpected", err);
    return {
      ok: false,
      code: "OTP_INVALID",
      message: AUTH_SAFE_MESSAGES.otpInvalid,
    };
  }
}

export async function resendOtpAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = resendOtpSchema.safeParse({
    email: formString(formData, "email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: AUTH_SAFE_MESSAGES.otpInvalid,
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      code: "OTP_RESENT",
      message: "Mock verification code resent.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data.email,
    });

    if (error) {
      console.error("[auth.resendOtp]", error.message);
      return {
        ok: false,
        code: "OTP_INVALID",
        message: "We could not resend the code. Please wait a moment and try again.",
      };
    }

    return {
      ok: true,
      code: "OTP_RESENT",
      message: AUTH_SAFE_MESSAGES.otpResent,
    };
  } catch (err) {
    console.error("[auth.resendOtp] unexpected", err);
    return {
      ok: false,
      code: "OTP_INVALID",
      message: "We could not resend the code. Please wait a moment and try again.",
    };
  }
}

/** Used after successful client redirect handling */
export async function redirectAfterAuth(path: string) {
  redirect(path.startsWith("/") ? path : "/student");
}
