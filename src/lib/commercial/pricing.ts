/**
 * Commercial pricing schedule (INR / year) — authoritative from blueprint.
 * Estimates only until finance systems connect.
 */

export const PRICING_TIERS = [
  { maxStudents: 5_000, annualInr: 400_000 },
  { maxStudents: 10_000, annualInr: 800_000 },
  { maxStudents: 15_000, annualInr: 1_200_000 },
  { maxStudents: 20_000, annualInr: 1_600_000 },
  { maxStudents: 25_000, annualInr: 2_000_000 },
  { maxStudents: 50_000, annualInr: 4_000_000 },
  { maxStudents: 100_000, annualInr: 8_000_000 },
] as const;

export function priceForCapacity(studentCapacity: number): {
  annualInr: number;
  planLabel: string;
} {
  const tier =
    PRICING_TIERS.find((t) => studentCapacity <= t.maxStudents) ??
    PRICING_TIERS[PRICING_TIERS.length - 1]!;
  return {
    annualInr: tier.annualInr,
    planLabel: `Up to ${tier.maxStudents.toLocaleString("en-IN")} students`,
  };
}

export function estimateGrossMargin(input: {
  annualRevenueInr: number;
  estimatedAiCogsUsd: number;
  usdToInr?: number;
}): {
  revenueInr: number;
  estimatedCogsInr: number;
  estimatedGrossProfitInr: number;
  estimatedGrossMarginPct: number | null;
  note: string;
} {
  const fx = input.usdToInr ?? 84;
  const cogsInr = input.estimatedAiCogsUsd * fx;
  const profit = input.annualRevenueInr - cogsInr;
  const margin =
    input.annualRevenueInr <= 0
      ? null
      : Math.round((profit / input.annualRevenueInr) * 1000) / 10;
  return {
    revenueInr: input.annualRevenueInr,
    estimatedCogsInr: Math.round(cogsInr),
    estimatedGrossProfitInr: Math.round(profit),
    estimatedGrossMarginPct: margin,
    note: "Estimates only — AI COGS from usage meter; not audited financials.",
  };
}
