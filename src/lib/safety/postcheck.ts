import type {
  SafetyAssessment,
  SafetyPostcheckInput,
} from "@/lib/safety/types";
import { runSafetyPrecheck } from "@/lib/safety/precheck";

const CURRENT_POLICY_VERSION = "safety-policy-v1.0.0";

const UNSAFE_ASSISTANT_PATTERNS: RegExp[] = [
  /\b(here(?:'s| is) how to (kill|suicide|overdose))\b/i,
  /\b(lethal dose|best method to die|hide it from)\b/i,
  /\bi (called|notified|contacted) (your )?(counsellor|parents|police)\b/i,
  /\bpolice are (coming|on the way)\b/i,
];

/**
 * Safety postprocessor — application authority over model output.
 * Can only escalate or block; never downgrade a prior RED/IMMINENT precheck.
 */
export function runSafetyPostcheck(
  input: SafetyPostcheckInput,
): SafetyAssessment {
  const userSide = runSafetyPrecheck({ text: input.userText });
  const modelSignals = UNSAFE_ASSISTANT_PATTERNS.some((p) =>
    p.test(input.modelText),
  )
    ? (["self_harm_language"] as const)
    : [];

  let state = userSide.state;
  let action = userSide.recommended_action;
  const signals = [...userSide.signals];

  if (modelSignals.length > 0) {
    signals.push("self_harm_language");
    state = state === "GREEN" || state === "AMBER" ? "RED" : state;
    action = "block_unsafe_content";
  }

  // Never let postcheck soften a crisis precheck
  const order = { GREEN: 0, AMBER: 1, RED: 2, IMMINENT: 3 } as const;
  if (order[input.priorState] > order[state]) {
    state = input.priorState;
    if (state === "IMMINENT") action = "show_crisis_interface";
    if (state === "RED") action = "show_elevated_resources";
    if (state === "AMBER") action = "offer_human_support";
  }

  return {
    state,
    confidence: Math.max(userSide.confidence, modelSignals.length ? 0.85 : 0),
    signals: [...new Set(signals)],
    recommended_action: action,
    policy_version: CURRENT_POLICY_VERSION,
  };
}
