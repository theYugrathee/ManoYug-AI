import { recordAiUsage } from "@/lib/ai/usage";
import { getAIProvider } from "@/lib/providers/ai";
import type { AIMessage } from "@/lib/providers/ai/types";

export type SemanticRiskLevel = "none" | "low" | "moderate" | "high" | "imminent";
export type SemanticIntent = "none" | "passive" | "indirect" | "direct" | "unclear";
export type SemanticTimeframe = "none" | "unknown" | "future" | "soon" | "now";

export type SemanticRiskResult = {
  risk_level: SemanticRiskLevel;
  self_harm: boolean;
  suicidal_ideation: boolean;
  intent: SemanticIntent;
  plan_present: boolean;
  timeframe: SemanticTimeframe;
  means_present: boolean;
  immediate_danger: boolean;
  protective_factors: string[];
  reason_codes: string[];
  confidence: number;
  provider: string;
  model: string;
};

const CLASSIFIER_SYSTEM = `You are a safety risk classifier for a student wellbeing product. Classify only safety-relevant self-harm or suicide risk; do not diagnose mental illness. Understand English, Hindi, Hinglish, Roman Hindi, mixed language, slang, indirect language, and context. Distinguish grief, movies, songs, games, historical discussion, fiction, and statements about another person from the student's own current risk. Do not infer imminent danger from a single keyword. Return JSON only, with exactly these fields: risk_level (none|low|moderate|high|imminent), self_harm (boolean), suicidal_ideation (boolean), intent (none|passive|indirect|direct|unclear), plan_present (boolean), timeframe (none|unknown|future|soon|now), means_present (boolean), immediate_danger (boolean), protective_factors (string[]), reason_codes (string[]), confidence (number 0 to 1). If uncertain, choose the safer moderate level only when the context contains a meaningful safety concern.`;

const EMPTY_RESULT: Omit<SemanticRiskResult, "provider" | "model"> = {
  risk_level: "none",
  self_harm: false,
  suicidal_ideation: false,
  intent: "none",
  plan_present: false,
  timeframe: "none",
  means_present: false,
  immediate_danger: false,
  protective_factors: [],
  reason_codes: [],
  confidence: 0,
};

function parseClassifierJson(text: string): Omit<SemanticRiskResult, "provider" | "model"> | null {
  const candidate = text.replace(/```json?|```/gi, "").trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    const levels: SemanticRiskLevel[] = ["none", "low", "moderate", "high", "imminent"];
    const intents: SemanticIntent[] = ["none", "passive", "indirect", "direct", "unclear"];
    const timeframes: SemanticTimeframe[] = ["none", "unknown", "future", "soon", "now"];
    const risk = levels.includes(raw.risk_level as SemanticRiskLevel) ? raw.risk_level as SemanticRiskLevel : "moderate";
    const confidence = Number(raw.confidence);
    return {
      risk_level: risk,
      self_harm: Boolean(raw.self_harm),
      suicidal_ideation: Boolean(raw.suicidal_ideation),
      intent: intents.includes(raw.intent as SemanticIntent) ? raw.intent as SemanticIntent : "unclear",
      plan_present: Boolean(raw.plan_present),
      timeframe: timeframes.includes(raw.timeframe as SemanticTimeframe) ? raw.timeframe as SemanticTimeframe : "unknown",
      means_present: Boolean(raw.means_present),
      immediate_danger: Boolean(raw.immediate_danger),
      protective_factors: Array.isArray(raw.protective_factors) ? raw.protective_factors.map(String).slice(0, 5) : [],
      reason_codes: Array.isArray(raw.reason_codes) ? raw.reason_codes.map(String).slice(0, 8) : [],
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0.5,
    };
  } catch {
    return null;
  }
}

/**
 * Dedicated semantic layer. It is intentionally separate from response
 * generation and receives only a bounded, redacted conversation window.
 */
export async function classifySafetyRisk(input: {
  latestMessage: string;
  recentMessages: AIMessage[];
  previousRiskState?: string;
  studentInternalId?: string;
}): Promise<SemanticRiskResult> {
  const provider = getAIProvider();
  // The semantic classifier is an authenticated student-flow layer. Keep
  // evaluation/static-generation calls deterministic and offline when no
  // student identity is available; the application-owned precheck still
  // protects those calls from explicit crisis language.
  if (provider.name !== "gemini" || !input.studentInternalId) {
    return { ...EMPTY_RESULT, provider: provider.name, model: "none" };
  }

  const context = input.recentMessages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-8)
    .map((message) => `${message.role}: ${message.content.slice(0, 600)}`)
    .join("\n");
  const requestMessages: AIMessage[] = [
    { role: "system", content: CLASSIFIER_SYSTEM },
    { role: "user", content: `Previous application risk state: ${input.previousRiskState ?? "GREEN"}\nRecent bounded context:\n${context || "(none)"}\nLatest student message:\n${input.latestMessage.slice(0, 800)}` },
  ];
  try {
    const generated = await provider.generate({
      purpose: "safety",
      messages: requestMessages,
      studentInternalId: input.studentInternalId,
      maxTokens: 300,
      temperature: 0,
    });
    const parsed = parseClassifierJson(generated.text) ?? { ...EMPTY_RESULT, risk_level: "moderate" as const, confidence: 0.45, reason_codes: ["classifier_parse_failure"] };
    await recordAiUsage({ userId: input.studentInternalId, provider: generated.provider, model: generated.model, purpose: "safety", inputTokens: generated.inputTokens, outputTokens: generated.outputTokens, latencyMs: generated.latencyMs });
    return { ...parsed, provider: generated.provider, model: generated.model };
  } catch (error) {
    console.error("[safety.semantic] classifier failed", error);
    return { ...EMPTY_RESULT, provider: provider.name, model: "error" };
  }
}
