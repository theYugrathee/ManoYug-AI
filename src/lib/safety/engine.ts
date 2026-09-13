import type { AIMessage } from "@/lib/providers/ai/types";
import { routeSafetyAction, type SafetyRouteDecision } from "@/lib/safety/action-router";
import { runSafetyPrecheck } from "@/lib/safety/precheck";
import { classifySafetyRisk, type SemanticRiskResult } from "@/lib/safety/semantic";
import type { SafetyAssessment } from "@/lib/safety/types";

const ORDER = { GREEN: 0, AMBER: 1, RED: 2, IMMINENT: 3 } as const;

function semanticAssessment(result: SemanticRiskResult): SafetyAssessment {
  const state = result.risk_level === "imminent" || result.immediate_danger ? "IMMINENT"
    : result.risk_level === "high" ? "RED"
      : result.risk_level === "moderate" ? "AMBER" : "GREEN";
  const signals = [
    ...(result.self_harm ? ["self_harm_language" as const] : []),
    ...(result.suicidal_ideation ? ["suicidal_ideation" as const] : []),
    ...(result.immediate_danger ? ["immediate_danger" as const] : []),
    ...(result.risk_level === "moderate" ? ["hopelessness" as const] : []),
  ];
  return {
    state,
    confidence: result.confidence,
    signals: [...new Set(signals)],
    recommended_action: state === "IMMINENT" ? "show_crisis_interface" : state === "RED" ? "show_elevated_resources" : state === "AMBER" ? "offer_human_support" : "continue_support",
    policy_version: "safety-policy-v1.0.0",
  };
}

export async function assessSafety(input: {
  latestMessage: string;
  recentMessages: AIMessage[];
  previousRiskState?: SafetyAssessment["state"];
  studentInternalId?: string;
}): Promise<{ decision: SafetyRouteDecision; precheck: SafetyAssessment; semantic: SemanticRiskResult | null }> {
  const precheck = runSafetyPrecheck({ text: input.latestMessage });

  // Explicit imminent language is an application-owned hard stop. It does not
  // wait for a remote model and cannot be softened by classifier uncertainty.
  if (precheck.state === "IMMINENT") {
    return { decision: routeSafetyAction(precheck), precheck, semantic: null };
  }

  const semantic = await classifySafetyRisk({
    latestMessage: input.latestMessage,
    recentMessages: input.recentMessages,
    previousRiskState: input.previousRiskState ?? precheck.state,
    studentInternalId: input.studentInternalId,
  });
  const semanticCheck = semanticAssessment(semantic);
  const strongest = ORDER[precheck.state] >= ORDER[semanticCheck.state] ? precheck : semanticCheck;
  return { decision: routeSafetyAction(strongest), precheck, semantic };
}
