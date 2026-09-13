export const ROLES = [
  "STUDENT",
  "COUNSELLOR",
  "COUNSELLOR_SUPERVISOR",
  "INSTITUTION_ADMIN",
  "INSTITUTION_SUPER_ADMIN",
  "PLATFORM_SUPPORT",
  "PLATFORM_ADMIN",
  "PLATFORM_SUPER_ADMIN",
  "CLINICAL_REVIEWER",
  "FINANCE",
] as const;

export type Role = (typeof ROLES)[number];

export const SAFETY_STATES = ["GREEN", "AMBER", "RED", "IMMINENT"] as const;
export type SafetyState = (typeof SAFETY_STATES)[number];

export const CASE_STATUSES = [
  "NEW",
  "ACKNOWLEDGED",
  "CONTACTING",
  "CONTACTED",
  "APPOINTMENT_SCHEDULED",
  "REFERRED",
  "MONITORING",
  "RESOLVED",
  "UNABLE_TO_REACH",
  "CLOSED",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const PROMPT_STATUSES = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "ACTIVE",
  "ROLLED_BACK",
  "ARCHIVED",
] as const;
export type PromptStatus = (typeof PROMPT_STATUSES)[number];
