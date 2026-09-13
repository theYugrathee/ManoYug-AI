/**
 * Explicit capability strings — least privilege.
 * Never trust client-sent role/permission claims.
 */
export const PERMISSIONS = [
  "student.conversation.read_own",
  "student.conversation.write_own",
  "student.checkin.write_own",
  "student.appointment.manage_own",
  "student.support.request",
  "counsellor.case.read_assigned",
  "counsellor.case.update",
  "counsellor.notes.write",
  "counsellor.appointment.manage",
  "counsellor.queue.read",
  "institution.roster.manage",
  "institution.analytics.read",
  "institution.admin.manage",
  "institution.resources.manage",
  "institution.reports.read",
  "platform.tenant.manage",
  "platform.prompt.manage",
  "platform.safety_policy.manage",
  "platform.break_glass",
  "platform.finance.read",
  "platform.evaluation.manage",
  "clinical.review",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
