import { getActivePrompt } from "@/lib/ai/prompts";
import {
  formatKnowledgeForPrompt,
  retrieveApprovedKnowledge,
} from "@/lib/ai/knowledge";
import { recordAiUsage } from "@/lib/ai/usage";
import { writeAuditLog } from "@/lib/audit/log";
import { getAppSession } from "@/lib/auth/session";
import {
  appendMessageForUser,
  createConversationForUser,
  createSafetyEscalation,
  getConversationForUser,
  getPersistenceMode,
  listMessagesForUser,
} from "@/lib/data/conversations";
import { getAIProvider } from "@/lib/providers/ai";
import type { AIMessage } from "@/lib/providers/ai/types";
import { isFeatureEnabled } from "@/lib/platform/feature-flags";
import {
  routeSafetyAction,
  runSafetyPostcheck,
  assessSafety,
} from "@/lib/safety";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { DEV_STUDENT_KEY } from "@/lib/store/memory";
import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { chatMessageSchema } from "@/lib/validation/student";
import { BLOCKED_FALLBACK, CRISIS_FALLBACK } from "@/lib/ai/gateway";
import type { SafetyState } from "@/types/roles";

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  if (!(await isFeatureEnabled("chat.enabled")) || !(await isFeatureEnabled("chat.streaming"))) {
    return new Response(
      JSON.stringify({ ok: false, message: "Streaming chat disabled." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: "Invalid JSON" }), {
      status: 400,
    });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ ok: false, message: "Invalid message" }),
      { status: 400 },
    );
  }

  const session = await getAppSession();
  if (!session && isSupabaseConfigured()) {
    return new Response(JSON.stringify({ ok: false, message: "Please sign in as a student to use chat." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const studentKey = session?.userId ?? DEV_STUDENT_KEY;

  const limit = checkRateLimit({
    key: `chat:${studentKey}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ ok: false, message: "Too many messages." }),
      { status: 429 },
    );
  }

  let conversationId = parsed.data.conversationId;
  let previousRiskState: SafetyState = "GREEN";
  if (conversationId) {
    const existing = await getConversationForUser(conversationId, studentKey);
    if (!existing) {
      return new Response(
        JSON.stringify({ ok: false, message: "Conversation not found" }),
        { status: 404 },
      );
    }
    previousRiskState = existing.latestSafetyState;
  } else {
    const created = await createConversationForUser(
      studentKey,
      parsed.data.language,
    );
    conversationId = created.id;
    previousRiskState = created.latestSafetyState;
  }

  const history = (await listMessagesForUser(conversationId, studentKey)).map(
    (m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }),
  );

  await appendMessageForUser(conversationId, studentKey, {
    role: "user",
    content: parsed.data.message,
  });

  const safety = await assessSafety({
    latestMessage: parsed.data.message,
    recentMessages: history,
    previousRiskState,
    studentInternalId: studentKey,
  });
  const pre = safety.precheck;
  const preRoute = safety.decision;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) =>
        controller.enqueue(encoder.encode(sse(payload)));

      send({
        type: "meta",
        conversationId,
        storage: getPersistenceMode(),
      });

      if (preRoute.uiMode === "crisis_fullscreen") {
        await createSafetyEscalation({
          userId: studentKey,
          riskState: preRoute.assessment.state,
          source: "safety_escalation",
          conversationId,
          signals: preRoute.assessment.signals,
        });
        const text = CRISIS_FALLBACK;
        await appendMessageForUser(conversationId!, studentKey, {
          role: "assistant",
          content: text,
          safetyState: preRoute.assessment.state,
          blocked: true,
        });
        send({ type: "token", text });
        send({ type: "done", decision: preRoute, assistantText: text });
        controller.close();
        return;
      }

      const prompt = getActivePrompt();
      const knowledge = retrieveApprovedKnowledge(parsed.data.message);
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
        ...history.slice(-12),
        { role: "user", content: parsed.data.message },
      ];

      const provider = getAIProvider();
      const started = Date.now();
      let full = "";

      try {
        if (provider.stream) {
          for await (const chunk of provider.stream({
            purpose: "conversation",
            messages,
            language: parsed.data.language,
            studentInternalId: studentKey,
            temperature: 0.4,
            maxTokens: 600,
          })) {
            full += chunk;
            send({ type: "token", text: chunk });
          }
        } else {
          const generated = await provider.generate({
            purpose: "conversation",
            messages,
            language: parsed.data.language,
            studentInternalId: studentKey,
          });
          full = generated.text;
          send({ type: "token", text: full });
          await recordAiUsage({
            userId: studentKey,
            provider: generated.provider,
            model: generated.model,
            purpose: "conversation",
            inputTokens: generated.inputTokens,
            outputTokens: generated.outputTokens,
            latencyMs: generated.latencyMs,
          });
        }
      } catch (err) {
        console.error("[api/chat/stream]", err);
        await writeAuditLog({
          actorId: studentKey,
          action: "chat.stream.failed",
          resource: "conversations",
          resourceId: conversationId,
          result: "failure",
        });
        send({
          type: "error",
          message: "AI provider failed. Try again or use Talk to a human.",
        });
        controller.close();
        return;
      }

      if (provider.stream) {
        await recordAiUsage({
          userId: studentKey,
          provider: provider.name,
          model: provider.name === "gemini" ? (process.env.GEMINI_MODEL ?? "gemini-2.0-flash") : "mock-wellbeing-v0",
          purpose: "conversation",
          inputTokens: Math.round(messages.reduce((n, m) => n + m.content.length, 0) / 4),
          outputTokens: Math.round(full.length / 4),
          latencyMs: Date.now() - started,
        });
      }

      const post = runSafetyPostcheck({
        userText: parsed.data.message,
        modelText: full,
        priorState: preRoute.assessment.state,
      });
      const decision = routeSafetyAction(post);

      let assistantText = full;
      if (!decision.allowModelReply) {
        assistantText =
          decision.uiMode === "crisis_fullscreen"
            ? CRISIS_FALLBACK
            : BLOCKED_FALLBACK;
        send({ type: "replace", text: assistantText });
      }

      if (decision.escalateCase) {
        await createSafetyEscalation({
          userId: studentKey,
          riskState: decision.assessment.state,
          source: "safety_escalation",
          conversationId,
          signals: decision.assessment.signals,
        });
      }

      await appendMessageForUser(conversationId!, studentKey, {
        role: "assistant",
        content: assistantText,
        safetyState: decision.assessment.state,
        blocked: !decision.allowModelReply,
      });

      send({
        type: "done",
        decision,
        assistantText,
        promptVersion: prompt.version,
        knowledgeIds: knowledge.map((k) => k.id),
        provider: provider.name,
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
