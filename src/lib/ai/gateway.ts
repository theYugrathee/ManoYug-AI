import { getActivePrompt } from "@/lib/ai/prompts";
import {
  formatKnowledgeForPrompt,
  retrieveApprovedKnowledge,
} from "@/lib/ai/knowledge";
import { recordAiUsage } from "@/lib/ai/usage";
import { getAIProvider } from "@/lib/providers/ai";
import type { AIMessage } from "@/lib/providers/ai/types";
import {
  routeSafetyAction,
  runSafetyPostcheck,
  assessSafety,
  type SafetyRouteDecision,
} from "@/lib/safety";
import type { SafetyState } from "@/types/roles";

export type ChatTurnInput = {
  userText: string;
  history?: AIMessage[];
  language?: "en" | "hi" | "hinglish";
  studentInternalId?: string;
  institutionId?: string;
  previousRiskState?: SafetyState;
};

export type ChatTurnResult = {
  assistantText: string | null;
  decision: SafetyRouteDecision;
  provider: string;
  model: string;
  promptVersion: string;
  knowledgeIds: string[];
};

const CRISIS_FALLBACK =
  "I’m glad you told me. I’m an AI companion, not an emergency service, and I don’t want you to handle this alone. Please use the urgent-help options on this page to contact a trusted person, your campus support team, or Tele-MANAS (14416 or 1800-89-14416). If you may act on these thoughts or are in immediate danger, call 112 or go to the nearest emergency medical facility now.";

const BLOCKED_FALLBACK =
  "I cannot continue with that type of response. Your safety comes first. Please use Talk to a human or Help / Safety for verified support.";

/**
 * Full chat pipeline:
 * safety precheck → approved knowledge → prompt → model → postcheck → action router → usage
 */
export async function runChatTurn(
  input: ChatTurnInput,
): Promise<ChatTurnResult> {
  const prompt = getActivePrompt();
  const safety = await assessSafety({
    latestMessage: input.userText,
    recentMessages: input.history ?? [],
    previousRiskState: input.previousRiskState,
    studentInternalId: input.studentInternalId,
  });
  const pre = safety.precheck;
  const preRoute = safety.decision;

  if (preRoute.uiMode === "crisis_fullscreen") {
    return {
      assistantText: null,
      decision: preRoute,
      provider: "none",
      model: "none",
      promptVersion: prompt.version,
      knowledgeIds: [],
    };
  }

  const knowledge = retrieveApprovedKnowledge(input.userText);
  const knowledgeBlock = formatKnowledgeForPrompt(knowledge);

  const messages: AIMessage[] = [
    {
      role: "system",
      content: knowledgeBlock
        ? `${prompt.content}\n\n${knowledgeBlock}`
        : prompt.content,
    },
    ...(preRoute.uiMode === "offer_human"
      ? [{ role: "system" as const, content: "The student may be experiencing meaningful safety-related distress. Respond with empathy, one practical grounding step, and ask one direct, gentle question about whether they feel at risk of hurting themselves right now. Do not mention internal classification." }]
      : []),
    ...(input.history ?? []).slice(-12),
    { role: "user", content: input.userText },
  ];

  const provider = getAIProvider();
  const generated = await provider.generate({
    purpose: "conversation",
    messages,
    language: input.language,
    studentInternalId: input.studentInternalId,
    temperature: 0.4,
    maxTokens: 700,
  });

  await recordAiUsage({
    institutionId: input.institutionId,
    provider: generated.provider,
    model: generated.model,
    purpose: "conversation",
    inputTokens: generated.inputTokens,
    outputTokens: generated.outputTokens,
    latencyMs: generated.latencyMs,
  });

  const post = runSafetyPostcheck({
    userText: input.userText,
    modelText: generated.text,
    priorState: preRoute.assessment.state,
  });
  const decision = routeSafetyAction(post);

  if (!decision.allowModelReply) {
    return {
      assistantText:
        decision.uiMode === "crisis_fullscreen"
          ? CRISIS_FALLBACK
          : BLOCKED_FALLBACK,
      decision,
      provider: generated.provider,
      model: generated.model,
      promptVersion: prompt.version,
      knowledgeIds: knowledge.map((k) => k.id),
    };
  }

  return {
    assistantText: generated.text,
    decision,
    provider: generated.provider,
    model: generated.model,
    promptVersion: prompt.version,
    knowledgeIds: knowledge.map((k) => k.id),
  };
}

export { CRISIS_FALLBACK, BLOCKED_FALLBACK };
