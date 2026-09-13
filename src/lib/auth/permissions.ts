import type { Permission } from "@/types/permissions";
import type { Role } from "@/types/roles";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  STUDENT: [
    "student.conversation.read_own",
    "student.conversation.write_own",
    "student.checkin.write_own",
    "student.appointment.manage_own",
    "student.support.request",
  ],
  COUNSELLOR: [
    "counsellor.case.read_assigned",
    "counsellor.case.update",
    "counsellor.notes.write",
    "counsellor.appointment.manage",
    "counsellor.queue.read",
  ],
  COUNSELLOR_SUPERVISOR: [
    "counsellor.case.read_assigned",
    "counsellor.case.update",
    "counsellor.notes.write",
    "counsellor.appointment.manage",
    "counsellor.queue.read",
  ],
  INSTITUTION_ADMIN: [
    "institution.roster.manage",
    "institution.analytics.read",
    "institution.resources.manage",
    "institution.reports.read",
  ],
  INSTITUTION_SUPER_ADMIN: [
    "institution.roster.manage",
    "institution.analytics.read",
    "institution.admin.manage",
    "institution.resources.manage",
    "institution.reports.read",
  ],
  PLATFORM_SUPPORT: ["institution.analytics.read"],
  PLATFORM_ADMIN: [
    "platform.tenant.manage",
    "platform.prompt.manage",
    "platform.safety_policy.manage",
    "platform.evaluation.manage",
  ],
  PLATFORM_SUPER_ADMIN: [
    "platform.tenant.manage",
    "platform.prompt.manage",
    "platform.safety_policy.manage",
    "platform.break_glass",
    "platform.finance.read",
    "platform.evaluation.manage",
    "clinical.review",
  ],
  CLINICAL_REVIEWER: ["clinical.review", "platform.safety_policy.manage"],
  FINANCE: ["platform.finance.read"],
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function assertPermission(
  role: Role,
  permission: Permission,
): void {
  if (!roleHasPermission(role, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
