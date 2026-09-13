import { randomUUID } from "node:crypto";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase/admin";

export type AiUsageEvent = {
  id: string;
  institutionId?: string;
  provider: string;
  model: string;
  purpose: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  createdAt: string;
};

type UsageInput = {
  institutionId?: string;
  userId?: string;
  provider: string;
  model: string;
  purpose: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
};

type UsageDb = { events: AiUsageEvent[] };

const g = globalThis as unknown as { __manoyugUsage?: UsageDb };

function db(): UsageDb {
  if (!g.__manoyugUsage) g.__manoyugUsage = { events: [] };
  return g.__manoyugUsage;
}

/** Rough public list prices — mark estimates in UI */
const COST_PER_1K: Record<string, { in: number; out: number }> = {
  "gemini-2.5-flash": { in: 0.000075, out: 0.0003 },
  "gemini-2.0-flash": { in: 0.0001, out: 0.0004 },
  "mock-wellbeing-v0": { in: 0, out: 0 },
};

export async function recordAiUsage(input: UsageInput): Promise<AiUsageEvent> {
  const rates = COST_PER_1K[input.model] ?? { in: 0.0005, out: 0.0015 };
  const inTok = input.inputTokens ?? 0;
  const outTok = input.outputTokens ?? 0;
  const event: AiUsageEvent = {
    id: randomUUID(),
    institutionId: input.institutionId,
    provider: input.provider,
    model: input.model,
    purpose: input.purpose,
    inputTokens: inTok,
    outputTokens: outTok,
    latencyMs: input.latencyMs,
    estimatedCostUsd:
      (inTok / 1000) * rates.in + (outTok / 1000) * rates.out,
    createdAt: new Date().toISOString(),
  };
  if (isSupabaseAdminConfigured()) {
    let institutionId = input.institutionId;
    if (!institutionId && input.userId) {
      const { data } = await createAdminClient()
        .from("student_profiles")
        .select("institution_id")
        .eq("user_id", input.userId)
        .maybeSingle();
      institutionId = data?.institution_id ?? undefined;
    }
    const { data, error } = await createAdminClient()
      .from("ai_usage_logs")
      .insert({
        institution_id: institutionId ?? null,
        user_id: input.userId ?? null,
        provider: input.provider,
        model: input.model,
        purpose: input.purpose,
        input_tokens: inTok,
        output_tokens: outTok,
        latency_ms: input.latencyMs,
        estimated_cost_usd: event.estimatedCostUsd,
      })
      .select("id, institution_id, provider, model, purpose, input_tokens, output_tokens, latency_ms, estimated_cost_usd, created_at")
      .single();
    if (error) {
      console.error("[ai-usage] Could not persist usage event:", error.message);
      return event;
    }
    return {
      id: String(data.id),
      institutionId: data.institution_id ?? undefined,
      provider: data.provider,
      model: data.model,
      purpose: data.purpose,
      inputTokens: Number(data.input_tokens),
      outputTokens: Number(data.output_tokens),
      latencyMs: Number(data.latency_ms),
      estimatedCostUsd: Number(data.estimated_cost_usd),
      createdAt: data.created_at,
    };
  }

  db().events.unshift(event);
  if (db().events.length > 5000) db().events.length = 5000;
  return event;
}

export function listAiUsage(limit = 100): AiUsageEvent[] {
  return db().events.slice(0, limit);
}

export async function summarizeAiUsage() {
  let events = db().events;
  if (isSupabaseAdminConfigured()) {
    const { data, error } = await createAdminClient()
      .from("ai_usage_logs")
      .select("id, institution_id, provider, model, purpose, input_tokens, output_tokens, latency_ms, estimated_cost_usd, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (!error) {
      events = (data ?? []).map((row) => ({
        id: String(row.id), institutionId: row.institution_id ?? undefined,
        provider: row.provider, model: row.model, purpose: row.purpose,
        inputTokens: Number(row.input_tokens), outputTokens: Number(row.output_tokens),
        latencyMs: Number(row.latency_ms), estimatedCostUsd: Number(row.estimated_cost_usd),
        createdAt: row.created_at,
      }));
    }
  }
  const totalCost = events.reduce((s, e) => s + e.estimatedCostUsd, 0);
  const totalIn = events.reduce((s, e) => s + e.inputTokens, 0);
  const totalOut = events.reduce((s, e) => s + e.outputTokens, 0);
  const latencies = events.map((e) => e.latencyMs).sort((a, b) => a - b);
  const p95 =
    latencies.length === 0
      ? 0
      : latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))]!;
  return {
    requestCount: events.length,
    totalInputTokens: totalIn,
    totalOutputTokens: totalOut,
    estimatedCostUsd: totalCost,
    avgLatencyMs:
      latencies.length === 0
        ? 0
        : Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    p95LatencyMs: p95,
    estimateLabel: "Estimated COGS — not invoiced billing",
  };
}
