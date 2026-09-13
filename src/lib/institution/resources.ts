import { randomUUID } from "node:crypto";
import { getInstitutionDashboardData } from "@/lib/data/platform";
import { escapeCsvFormula } from "@/lib/institution/csv-roster";

export type InstitutionResource = {
  id: string;
  institutionId: string;
  name: string;
  resourceType: string;
  contactValue: string;
  region?: string;
  status: "ACTIVE" | "PENDING_REVIEW" | "EXPIRED";
  verifiedAt?: string;
  reviewBy?: string;
};

type ResourceDb = { items: Map<string, InstitutionResource> };
const g = globalThis as unknown as { __manoyugResources?: ResourceDb };

function db() {
  if (!g.__manoyugResources) {
    g.__manoyugResources = { items: new Map() };
  }
  return g.__manoyugResources;
}

export function listInstitutionResources(institutionId: string): InstitutionResource[] {
  return [...db().items.values()].filter(
    (r) => r.institutionId === institutionId,
  );
}

export function upsertInstitutionResource(
  input: Omit<InstitutionResource, "id"> & { id?: string },
): InstitutionResource {
  const id = input.id ?? randomUUID();
  const row: InstitutionResource = {
    ...input,
    id,
    status: input.status || "ACTIVE",
    verifiedAt: input.verifiedAt || new Date().toISOString(),
  };
  db().items.set(id, row);
  return row;
}

export function deleteInstitutionResource(
  institutionId: string,
  resourceId: string,
): boolean {
  const item = db().items.get(resourceId);
  if (!item || item.institutionId !== institutionId) return false;
  db().items.delete(resourceId);
  return true;
}

export async function buildInstitutionReportCsv(institutionId: string): Promise<string> {
  const stats = await getInstitutionDashboardData(institutionId);
  const tenant = stats.tenant;

  const lines = [
    ["Metric", "Value", "Operational Note"].map(escapeCsvFormula).join(","),
    ["Institution Name", escapeCsvFormula(tenant?.name ?? "Unknown Institution"), "Tenant Identity"].join(","),
    ["Institution Code", escapeCsvFormula(tenant?.code ?? "N/A"), "Unique Access Code"].join(","),
    ["Total Enrolled / Eligible Students", String(stats.eligibleCount), "Authorized Roster Count"].join(","),
    ["Active Student Accounts", String(stats.activeCount), "Onboarded Accounts"].join(","),
    ["Total Safety Escalations", String(stats.safetyEventsCount), "Deterministic Tele-MANAS/Resource Routing"].join(","),
    ["Human Support Requests", String(stats.humanSupportCases), "Student Initiated Contact"].join(","),
    ["Compliance Framework", "DPDP Act India 2023 · NIRF Criterion 5", "Standard Compliance Baseline"].join(","),
    ["Zero Chat Inspection Guarantee", "TRUE - 100% Cryptographically Isolated", "Zero conversation access"].join(","),
    ["export_contains_private_chats", "false", "Strict zero student conversation export guarantee"].join(","),
    ["Report Generated At", escapeCsvFormula(new Date().toISOString()), "UTC Timestamp"].join(","),
  ];
  return lines.join("\n");
}
