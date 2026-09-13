/**
 * Eligibility matching — pure logic (testable without DB).
 * Never expose match details to the client.
 */

export type RosterCandidate = {
  id: string;
  institution_id: string;
  email: string;
  university_roll_no?: string | null;
  graduation_year: number | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  linked_user_id: string | null;
  institution_status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
};

export type EligibilityIdentity = {
  email: string;
  universityRollNo?: string;
  graduationYear: number;
};

export type EligibilityMatch =
  | { matched: true; rosterId: string; institutionId: string }
  | { matched: false; reason: "no_match" | "inactive" | "already_linked" | "institution_unavailable" };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Exact identity match against a single roster row.
 * Institution suspension / inactive roster / already-linked all fail closed.
 */
export function evaluateRosterRow(
  row: RosterCandidate,
  identity: EligibilityIdentity,
  claimingUserId?: string,
): EligibilityMatch {
  if (row.institution_status !== "ACTIVE") {
    return { matched: false, reason: "institution_unavailable" };
  }

  if (row.status !== "ACTIVE") {
    return { matched: false, reason: "inactive" };
  }

  const emailOk = normalizeEmail(row.email) === normalizeEmail(identity.email);
  if (!emailOk) {
    return { matched: false, reason: "no_match" };
  }

  if (
    row.linked_user_id &&
    claimingUserId &&
    row.linked_user_id !== claimingUserId
  ) {
    return { matched: false, reason: "already_linked" };
  }

  if (row.linked_user_id && !claimingUserId) {
    return { matched: false, reason: "already_linked" };
  }

  return {
    matched: true,
    rosterId: row.id,
    institutionId: row.institution_id,
  };
}

/**
 * Pick the first successful match from candidates. Fail closed if none.
 * Callers must not tell the user *why* matching failed — reasons are for logs/tests only.
 */
export function findEligibilityMatch(
  candidates: RosterCandidate[],
  identity: EligibilityIdentity,
  claimingUserId?: string,
): EligibilityMatch {
  let lastFailure: EligibilityMatch = { matched: false, reason: "no_match" };

  for (const row of candidates) {
    const result = evaluateRosterRow(row, identity, claimingUserId);
    if (result.matched) {
      return result;
    }
    // Prefer specific closed reasons over generic no_match when identity fields align.
    if (result.reason !== "no_match") {
      lastFailure = result;
    }
  }

  return lastFailure;
}
