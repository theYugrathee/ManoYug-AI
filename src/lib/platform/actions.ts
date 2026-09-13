"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit/log";
import {
  getTenant,
  listInstitutionRequests,
  listPricingPlans,
  listStoreFeatureFlags,
  listTenants,
  searchAllStudents,
  toggleStoreFeatureFlag,
  updatePricingPlan,
  updateTenant,
  type StoredTenant,
} from "@/lib/store/memory";

import { isSupabaseAdminConfigured, createAdminClient } from "@/lib/db/supabase/admin";
import { priceForCapacity } from "@/lib/commercial/pricing";
import { listPersistedFeatureFlags, listPersistedPricingPlans, listPersistedRequests, listPersistedTenants } from "@/lib/data/platform";
import { hashPassword } from "@/lib/auth/password";
import { requireSuperAdminSession } from "@/lib/auth/session";
import { randomUUID } from "node:crypto";

export async function reviewInstitutionRequestAction(
  requestId: string,
  status: "APPROVED" | "REJECTED" | "NEEDS_INFO",
  notes?: string,
  provisioning?: { code?: string; adminEmail?: string; adminPassword?: string },
) {
  if (!isSupabaseAdminConfigured()) return { ok: false, message: "Supabase is not configured." };
  const reviewer = await requireSuperAdminSession();
  const adminClient = createAdminClient();
  const { data: request, error: requestError } = await adminClient.from("institution_requests").select("*").eq("id", requestId).maybeSingle();
  if (requestError || !request) return { ok: false, message: `Could not load request: ${requestError?.message ?? "not found"}` };
  if (request.status === "APPROVED" && status === "APPROVED") return { ok: false, message: "This request has already been approved and provisioned." };

  let provisionedInstitutionId: string | undefined;
  if (status === "APPROVED") {
    const code = String(provisioning?.code ?? "").trim().toUpperCase();
    const adminEmail = String(provisioning?.adminEmail ?? request.official_email ?? "").trim().toLowerCase();
    const adminPassword = String(provisioning?.adminPassword ?? "");
    if (!/^[A-Z0-9-]{4,30}$/.test(code)) return { ok: false, message: "Choose a unique institute code using 4–30 letters, numbers, or hyphens." };
    if (!adminEmail.includes("@")) return { ok: false, message: "Enter a valid institute administrator email." };
    if (adminPassword.length < 6) return { ok: false, message: "Set an institute administrator password of at least 6 characters." };

    const { data: existingCode, error: codeError } = await adminClient.from("institutions").select("id").eq("code", code).maybeSingle();
    if (codeError) return { ok: false, message: `Could not validate institute code: ${codeError.message}` };
    if (existingCode) return { ok: false, message: "That institute code is already assigned. Choose another code." };

    const institutionId = randomUUID();
    const slugBase = String(request.institution_name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "institution";
    const { data: createdInstitution, error: institutionError } = await adminClient.from("institutions").insert({
      id: institutionId,
      name: request.institution_name,
      slug: `${slugBase}-${institutionId.slice(0, 8)}`,
      code,
      status: "ACTIVE",
      is_code_active: true,
      student_capacity: Number(request.approximate_student_count ?? 5000),
      admin_email: adminEmail,
      password_hash: hashPassword(adminPassword),
      location: `${request.city}, ${request.state}`,
      institution_type: request.institution_type,
      website: request.website ?? null,
    }).select("id").single();
    if (institutionError || !createdInstitution) return { ok: false, message: `Could not provision institution: ${institutionError?.message ?? "unknown error"}` };
    provisionedInstitutionId = String(createdInstitution.id);
  }

  const requestUpdate = adminClient.from("institution_requests").update({
    status,
    notes: notes || null,
    reviewed_by: reviewer.userId,
    reviewed_at: new Date().toISOString(),
    ...(provisionedInstitutionId ? { institution_id: provisionedInstitutionId } : {}),
  }).eq("id", requestId);
  // Approval is a one-time transition. The status predicate prevents two
  // concurrent reviewers from provisioning two institutions for one request.
  const { data: persisted, error } = await (status === "APPROVED"
    ? requestUpdate.eq("status", "PENDING")
    : requestUpdate).select("id, institution_id").maybeSingle();
  if (error || !persisted) {
    if (provisionedInstitutionId) await adminClient.from("institutions").delete().eq("id", provisionedInstitutionId);
    const rawMessage = error?.message ?? (status === "APPROVED" ? "This request is no longer pending." : "not found");
    const message = /institution_id|schema cache/i.test(rawMessage)
      ? "The Supabase institution-request migration is not applied yet. Apply the latest migrations, then retry approval."
      : `Could not update request: ${rawMessage}`;
    return { ok: false, message };
  }

  await writeAuditLog({
    action: `institution.request.${status.toLowerCase()}`,
    resource: "institution_requests",
    resourceId: requestId,
    result: "success",
    metadata: { status, notes, institutionId: provisionedInstitutionId },
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/requests");
  revalidatePath("/super-admin/institutions");
  return { ok: true, data: { id: String(persisted.id), status, institutionId: provisionedInstitutionId } };
}

export async function toggleTenantStatusAction(
  tenantId: string,
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED",
) {
  if (!isSupabaseAdminConfigured()) return { ok: false, message: "Supabase is not configured." };
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("institutions").update({ status, is_code_active: status === "ACTIVE" }).eq("id", tenantId);
  if (error) return { ok: false, message: `Could not update institution: ${error.message}` };

  const tenant = getTenant(tenantId);
  if (tenant) {
    tenant.status = status;
    updateTenant(tenantId, { status, isCodeActive: status === "ACTIVE" });
  }

  await writeAuditLog({
    action: `institution.status.${status.toLowerCase()}`,
    resource: "institutions",
    resourceId: tenantId,
    result: "success",
    metadata: { name: tenant?.name ?? tenantId, status },
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/institutions");
  return { ok: true, message: `Tenant status set to ${status}.` };
}

export async function toggleFeatureFlagAction(key: string, isEnabled: boolean) {
  if (!isSupabaseAdminConfigured()) return { ok: false, message: "Supabase is not configured." };
  const { data: flag, error } = await createAdminClient().from("feature_flags").update({ is_enabled: isEnabled }).eq("key", key).select("*").maybeSingle();
  if (error || !flag) return { ok: false, message: `Could not update feature flag: ${error?.message ?? "not found"}` };

  await writeAuditLog({
    action: "platform.feature_flag.toggle",
    resource: "feature_flags",
    resourceId: key,
    result: "success",
    metadata: { key, isEnabled },
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/flags");
  return { ok: true, flag };
}

export async function updatePricingPlanAction(
  planId: string,
  annualPriceInr: number,
  studentCapacity: number,
) {
  if (!isSupabaseAdminConfigured()) return { ok: false, message: "Supabase is not configured." };
  const { data: plan, error } = await createAdminClient().from("pricing_plans").update({ annual_price_inr: annualPriceInr, student_capacity: studentCapacity }).eq("id", planId).select("*").maybeSingle();
  if (error || !plan) return { ok: false, message: `Could not update pricing plan: ${error?.message ?? "not found"}` };

  await writeAuditLog({
    action: "platform.pricing_plan.update",
    resource: "pricing_plans",
    resourceId: planId,
    result: "success",
    metadata: { annualPriceInr, studentCapacity },
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/pricing");
  return { ok: true, plan };
}

export async function fetchLiveTenants(): Promise<StoredTenant[]> {
  if (isSupabaseAdminConfigured()) return listPersistedTenants();
  return listTenants();
}

export async function fetchLiveInstitutionRequests() {
  await requireSuperAdminSession();
  if (isSupabaseAdminConfigured()) return listPersistedRequests();
  return listInstitutionRequests();
}

export async function fetchLiveGlobalStudents() {
  if (isSupabaseAdminConfigured()) {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("institution_students")
      .select("*, institutions(name, code)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not load students: ${error.message}`);
    return (data ?? []).map((s) => ({
      id: s.id,
      institutionId: s.institution_id,
      university_roll_no: s.roll_number || s.university_roll_no || "NO_ROLL",
      name: s.full_name || s.email.split("@")[0],
      email: s.email,
      phone: s.mobile_number || s.phone || "—",
      department: s.department || "General Studies",
      graduation_year: s.graduation_year || new Date().getFullYear() + 2,
      status: (s.status as "ACTIVE" | "INACTIVE" | "PENDING") || "ACTIVE",
      createdAt: s.created_at || new Date().toISOString(),
    }));
  }
  return searchAllStudents("");
}

export async function getSuperAdminOverviewData() {
  const tenants = await fetchLiveTenants();
  const requests = await fetchLiveInstitutionRequests();
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const flags = isSupabaseAdminConfigured() ? await listPersistedFeatureFlags() : listStoreFeatureFlags();
  const plans = isSupabaseAdminConfigured() ? await listPersistedPricingPlans() : listPricingPlans();

  return {
    tenants,
    requests,
    pendingRequests,
    flags,
    plans,
  };
}
