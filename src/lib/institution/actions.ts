"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit/log";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import {
  buildInstitutionReportCsv,
} from "@/lib/institution/resources";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  deleteCampusContact,
  deleteInstitutionResourcePersisted,
  listCampusContacts,
  listInstitutionSafetyAlerts,
  listInstitutionSupportInbox,
  listInstitutionResourcesPersisted,
  saveCampusContact,
  saveInstitutionResourcePersisted,
} from "@/lib/data/platform";

export async function getInstitutionSupportInboxData() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const [supportRequests, safetyAlerts] = await Promise.all([
    listInstitutionSupportInbox(institutionId),
    listInstitutionSafetyAlerts(institutionId),
  ]);
  return { supportRequests, safetyAlerts };
}

export async function updateStudentSupportRequestStatusAction(
  requestId: string,
  status: "ACKNOWLEDGED" | "CLOSED",
) {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const client = createAdminClient();
  const { data, error } = await client
    .from("student_support_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("institution_id", institutionId)
    .select("id, status")
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "We could not update that support request." };
  }

  await writeAuditLog({
    action: "institution.student_support.status",
    resource: "student_support_requests",
    resourceId: requestId,
    institutionId,
    result: "success",
    metadata: { status },
  });
  revalidatePath("/institution/support");
  revalidatePath("/institution");
  return { ok: true, message: "Student support request updated." };
}

export async function getInstitutionResourcesData() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  return {
    institutionId,
    resources: await listInstitutionResourcesPersisted(institutionId),
  };
}

export async function addInstitutionResourceAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const resourceType = String(formData.get("resourceType") || "").trim();
  const contactValue = String(formData.get("contactValue") || "").trim();
  if (!name || !resourceType || !contactValue) {
    return { ok: false, message: "All fields are required." };
  }

  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;

  await saveInstitutionResourcePersisted({
    institutionId,
    name,
    resourceType,
    contactValue,
    status: "ACTIVE",
  });

  await writeAuditLog({
    action: "institution.resources.create",
    resource: "resources",
    institutionId,
    result: "success",
    metadata: { name, resourceType },
  });

  revalidatePath("/institution/resources");
  return {
    ok: true,
    message: "Campus resource registered and activated immediately.",
  };
}

export async function deleteInstitutionResourceAction(resourceId: string) {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;

  const deleted = await deleteInstitutionResourcePersisted(institutionId, resourceId);
  if (!deleted) return { ok: false, message: "Resource not found." };

  await writeAuditLog({
    action: "institution.resources.delete",
    resource: "resources",
    resourceId,
    institutionId,
    result: "success",
  });

  revalidatePath("/institution/resources");
  return {
    ok: true,
    message: "Resource removed successfully.",
  };
}

export async function getInstitutionReportCsvAction() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const csv = await buildInstitutionReportCsv(institutionId);
  await writeAuditLog({
    action: "institution.reports.export",
    resource: "reports",
    institutionId,
    result: "success",
    metadata: { format: "csv" },
  });
  return csv;
}

export async function submitInstitutionOnboardingRequest(
  _prevState: unknown,
  formData: FormData,
) {
  const institutionName = String(formData.get("institutionName") || "").trim();
  const officialEmail = String(formData.get("officialEmail") || "").trim().toLowerCase();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const institutionType = String(formData.get("institutionType") || "University").trim();
  const approximateStudentCount = Number(formData.get("approximateStudentCount") || 1000);
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const contactPersonName = String(formData.get("contactPersonName") || "").trim();
  const contactPersonDesignation = String(formData.get("contactPersonDesignation") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!institutionName || !officialEmail || !contactPhone || !contactPersonName || !contactPersonDesignation || !city || !state) {
    return {
      ok: false,
      message: "Please fill in all mandatory fields.",
    };
  }

  if (!officialEmail.includes("@") || !officialEmail.includes(".")) {
    return {
      ok: false,
      message: "Please provide a valid official institution email address.",
    };
  }
  if (!Number.isInteger(approximateStudentCount) || approximateStudentCount < 1 || approximateStudentCount > 500000) {
    return { ok: false, message: "Enter a valid enrolled student count." };
  }

  const adminClient = createAdminClient();
  const { data: request, error } = await adminClient.from("institution_requests").insert({
    institution_name: institutionName, official_email: officialEmail, contact_phone: contactPhone,
    institution_type: institutionType, approximate_student_count: approximateStudentCount, status: "PENDING",
    city, state, website: website || null, contact_person_name: contactPersonName,
    contact_person_designation: contactPersonDesignation || "Administrator", notes: notes || null,
  }).select("id").single();
  if (error || !request) return { ok: false, message: "We could not save your request. Please try again." };

  await writeAuditLog({
    action: "institution.request.submitted",
    resource: "institution_requests",
    resourceId: request.id,
    result: "success",
    metadata: { institutionName, officialEmail },
  });

  return {
    ok: true,
    message: "Thanks. Your institution request has been received. Our team will review your information and contact you via your official email.",
  };
}

export async function getSupportContactsData(institutionId?: string) {
  if (institutionId) return listCampusContacts(institutionId);
  const session = await requireInstitutionAdminSession();
  return listCampusContacts(session.institutionId);
}

export async function saveSupportContactAction(formData: FormData) {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const title = String(formData.get("title") || "").trim();
  const contactType = String(formData.get("contactType") || "wellbeing_office") as any;
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || undefined;
  const location = String(formData.get("location") || "").trim() || undefined;
  const operatingHours = String(formData.get("operatingHours") || "").trim() || undefined;
  const isEmergency = formData.get("isEmergency") === "true";

  if (!title || !phone) {
    return { ok: false, message: "Title and phone number are required." };
  }

  await saveCampusContact({
    id,
    institutionId,
    title,
    contactType,
    phone,
    email,
    location,
    operatingHours,
    isEmergency,
  });

  await writeAuditLog({
    action: "institution.support_contact.save",
    resource: "institution_support_contacts",
    institutionId,
    result: "success",
    metadata: { title, contactType, isEmergency },
  });

  revalidatePath("/institution/contacts");
  revalidatePath("/institution/resources");
  revalidatePath("/institution");
  return { ok: true, message: "Support contact saved successfully." };
}

export async function deleteSupportContactAction(contactId: string, institutionIdParam?: string) {
  const session = await requireInstitutionAdminSession();
  const institutionId = institutionIdParam || session.institutionId;
  const deleted = await deleteCampusContact(institutionId, contactId);
  if (!deleted) return { ok: false, message: "Support contact not found." };

  await writeAuditLog({
    action: "institution.support_contact.delete",
    resource: "institution_support_contacts",
    resourceId: contactId,
    institutionId,
    result: "success",
  });

  revalidatePath("/institution/contacts");
  revalidatePath("/institution/resources");
  revalidatePath("/institution");
  return { ok: true, message: "Support contact deleted." };
}
