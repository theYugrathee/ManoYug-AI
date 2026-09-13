import type { SafetyState } from "@/types/roles";

export type SafetySignal =
  | "hopelessness"
  | "self_harm_language"
  | "suicidal_ideation"
  | "immediate_danger"
  | "violence_risk"
  | "severe_distress"
  | "abuse_or_ragging"
  | "medical_emergency_language";

export type RecommendedSafetyAction =
  | "continue_support"
  | "offer_human_support"
  | "show_elevated_resources"
  | "show_crisis_interface"
  | "block_unsafe_content";

export interface SafetyAssessment {
  state: SafetyState;
  confidence: number;
  signals: SafetySignal[];
  recommended_action: RecommendedSafetyAction;
  policy_version: string;
}

export interface SafetyPrecheckInput {
  text: string;
  language?: "en" | "hi" | "hinglish";
  conversationId?: string;
}

export interface SafetyPostcheckInput {
  userText: string;
  modelText: string;
  priorState: SafetyState;
}
