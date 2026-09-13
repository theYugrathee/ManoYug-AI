import {
  listAppointmentsForStudent,
  listCases,
  listCheckins,
  listConversations,
  listRoster,
  listTenants,
  type StoredCheckin,
} from "@/lib/store/memory";
import { summarizeAiUsage } from "@/lib/ai/usage";
import { isSupabaseAdminConfigured } from "@/lib/db/supabase/admin";
import { listPersistedTenants } from "@/lib/data/platform";

function cohortThreshold() {
  const n = Number(process.env.MIN_ANALYTICS_COHORT_SIZE ?? 10);
  return Number.isFinite(n) && n > 0 ? n : 10;
}

export type AnalyticsSnapshot = {
  institutionId: string;
  eligibleStudents: number;
  activatedAccounts: number;
  activationRate: number | null;
  conversations: number;
  checkins: number;
  humanSupportCases: number;
  safetyEscalations: number;
  appointmentsScheduled: number;
  avgMoodStudentReported: number | null;
  moodDistribution: { score: number; count: number; percentage: number }[];
  pressureAverages: {
    academic: number | null;
    sleep: number | null;
    energy: number | null;
    social: number | null;
    stress: number | null;
  };
  cadence: {
    daily: number;
    weekly: number;
  };
  suppressed: string[];
  labels: {
    mood: "STUDENT-REPORTED";
    safety: "AI-INFERRED / SYSTEM";
  };
  minCohort: number;
};

function avg(nums: number[]) {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export function buildInstitutionAnalytics(
  institutionId: string,
  explicitStudentKeys?: string[],
): AnalyticsSnapshot {
  const minCohort = cohortThreshold();
  const roster = listRoster(institutionId);
  const eligible = roster.length;
  const activated = roster.filter((r) => r.status === "ACTIVE").length;
  const suppressed: string[] = [];

  const studentKeys = explicitStudentKeys && explicitStudentKeys.length > 0
    ? explicitStudentKeys
    : roster.map((r) => r.email || r.phone || r.university_roll_no).filter(Boolean);

  let checkins: StoredCheckin[] = [];
  let conversations = 0;
  for (const key of studentKeys) {
    checkins = checkins.concat(listCheckins(key));
    conversations += listConversations(key).length;
  }

  const cases = listCases();
  const humanSupportCases = cases.filter((c) => c.source === "student_request").length;
  const safetyEscalations = cases.filter(
    (c) => c.source === "safety_escalation",
  ).length;

  const moodValues = checkins.map((c) => c.mood).filter((v): v is number => typeof v === "number");
  let avgMood = avg(moodValues);
  if (moodValues.length > 0 && moodValues.length < minCohort) {
    avgMood = null;
    suppressed.push("avgMood (below min cohort threshold)");
  }

  // Mood distribution 1..5
  const totalMoods = moodValues.length;
  const moodDistribution = [1, 2, 3, 4, 5].map((score) => {
    const count = moodValues.filter((m) => m === score).length;
    return {
      score,
      count,
      percentage: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0,
    };
  });

  // Pressure averages
  const academicValues = checkins.map((c) => c.academicPressure).filter((v): v is number => typeof v === "number");
  const sleepValues = checkins.map((c) => c.sleep).filter((v): v is number => typeof v === "number");
  const energyValues = checkins.map((c) => c.energy).filter((v): v is number => typeof v === "number");
  const socialValues = checkins.map((c) => c.socialConnection).filter((v): v is number => typeof v === "number");
  const stressValues = checkins.map((c) => c.stress).filter((v): v is number => typeof v === "number");

  const pressureAverages = {
    academic: avg(academicValues),
    sleep: avg(sleepValues),
    energy: avg(energyValues),
    social: avg(socialValues),
    stress: avg(stressValues),
  };

  const dailyCount = checkins.filter((c) => c.period === "daily").length;
  const weeklyCount = checkins.filter((c) => c.period === "weekly").length;

  const activationRate =
    eligible === 0 ? 0 : Math.round((activated / eligible) * 100);

  return {
    institutionId,
    eligibleStudents: eligible,
    activatedAccounts: activated,
    activationRate,
    conversations,
    checkins: checkins.length,
    humanSupportCases,
    safetyEscalations,
    appointmentsScheduled: listAppointmentsForStudent("").length,
    avgMoodStudentReported: avgMood,
    moodDistribution,
    pressureAverages,
    cadence: {
      daily: dailyCount,
      weekly: weeklyCount,
    },
    suppressed,
    labels: {
      mood: "STUDENT-REPORTED",
      safety: "AI-INFERRED / SYSTEM",
    },
    minCohort,
  };
}

export async function buildPlatformCommercialSummary() {
  const tenants = isSupabaseAdminConfigured()
    ? await listPersistedTenants()
    : listTenants();
  const revenue = tenants
    .filter((t) => t.status === "ACTIVE")
    .reduce((s, t) => s + t.annualPriceInr, 0);
  const usage = await summarizeAiUsage();
  return {
    tenantCount: tenants.length,
    activeTenants: tenants.filter((t) => t.status === "ACTIVE").length,
    contractedCapacity: tenants.reduce((s, t) => s + t.studentCapacity, 0),
    arrInr: revenue,
    aiRequestCount: usage.requestCount,
    estimatedAiCogsUsd: usage.estimatedCostUsd,
  };
}
