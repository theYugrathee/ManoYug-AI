import type { SafetyAssessment } from "@/lib/safety/types";

export type SafetyUiMode =
  | "normal_chat"
  | "offer_human"
  | "elevated_banner"
  | "crisis_fullscreen"
  | "blocked_response";

export type SafetyRouteDecision = {
  uiMode: SafetyUiMode;
  allowModelReply: boolean;
  escalateCase: boolean;
  showVerifiedResources: boolean;
  assessment: SafetyAssessment;
};

/**
 * Action router — frontend/API decide UX from structured safety state.
 * The model cannot override this decision.
 */
export function routeSafetyAction(
  assessment: SafetyAssessment,
): SafetyRouteDecision {
  switch (assessment.recommended_action) {
    case "show_crisis_interface":
      return {
        uiMode: "crisis_fullscreen",
        allowModelReply: false,
        escalateCase: true,
        showVerifiedResources: true,
        assessment,
      };
    case "show_elevated_resources":
      return {
        uiMode: "crisis_fullscreen",
        allowModelReply: false,
        escalateCase: true,
        showVerifiedResources: true,
        assessment,
      };
    case "offer_human_support":
      return {
        uiMode: "offer_human",
        allowModelReply: true,
        escalateCase: false,
        showVerifiedResources: false,
        assessment,
      };
    case "block_unsafe_content":
      return {
        uiMode: "blocked_response",
        allowModelReply: false,
        escalateCase: true,
        showVerifiedResources: true,
        assessment,
      };
    default:
      return {
        uiMode: "normal_chat",
        allowModelReply: true,
        escalateCase: false,
        showVerifiedResources: false,
        assessment,
      };
  }
}
