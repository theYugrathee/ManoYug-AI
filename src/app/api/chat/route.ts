import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit/log";
import { getAppSession } from "@/lib/auth/session";
import { runChatTurn } from "@/lib/ai/gateway";
import {
  appendMessageForUser,
  createConversationForUser,
  createSafetyEscalation,
  getConversationForUser,
  getPersistenceMode,
  listMessagesForUser,
} from "@/lib/data/conversations";
import { isFeatureEnabled } from "@/lib/platform/feature-flags";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { DEV_STUDENT_KEY } from "@/lib/store/memory";
import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { chatMessageSchema } from "@/lib/validation/student";
import type { SafetyState } from "@/types/roles";

async function resolveStudentKey(): Promise<string | null> {
  const session = await getAppSession();
  if (!session && isSupabaseConfigured()) return null;
  return session?.userId ?? DEV_STUDENT_KEY;
}

export async function POST(request: Request) {
  if (!(await isFeatureEnabled("chat.enabled"))) {
    return NextResponse.json(
      { ok: false, message: "Chat is temporarily disabled." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid message", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const studentKey = await resolveStudentKey();
  if (!studentKey) {
    return NextResponse.json({ ok: false, message: "Please sign in as a student to use chat." }, { status: 401 });
  }
  const limit = checkRateLimit({
    key: `chat:${studentKey}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many messages. Please wait a minute and try again.",
        retryAfterMs: limit.retryAfterMs,
      },
      { status: 429 },
    );
  }

  let conversationId = parsed.data.conversationId;
  let previousRiskState: SafetyState = "GREEN";

  if (conversationId) {
    const existing = await getConversationForUser(conversationId, studentKey);
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Conversation not found" },
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

  let turn;
  try {
    turn = await runChatTurn({
      userText: parsed.data.message,
      history,
      language: parsed.data.language,
      studentInternalId: studentKey,
      previousRiskState,
    });
  } catch (err) {
    console.error("[api/chat]", err);
    await writeAuditLog({
      actorId: studentKey,
      action: "chat.turn.failed",
      resource: "conversations",
      resourceId: conversationId,
      result: "failure",
    });
    return NextResponse.json(
      {
        ok: false,
        message:
          "The AI provider failed. Try again, or use Talk to a human / Help.",
      },
      { status: 502 },
    );
  }

  if (turn.decision.escalateCase) {
    await createSafetyEscalation({
      userId: studentKey,
      riskState: turn.decision.assessment.state,
      source: "safety_escalation",
      conversationId,
      signals: turn.decision.assessment.signals,
    });
  }

  const assistantText =
    turn.assistantText ??
    "Safety interface active. Please use Help / Safety for verified human support.";

  await appendMessageForUser(conversationId, studentKey, {
    role: "assistant",
    content: assistantText,
    safetyState: turn.decision.assessment.state,
    blocked: !turn.decision.allowModelReply,
  });

  return NextResponse.json({
    ok: true,
    conversationId,
    // Crisis turns intentionally skip the model and return null from the
    // gateway; expose the deterministic safety fallback to the client rather
    // than rendering an empty assistant bubble.
    assistantText,
    decision: turn.decision,
    provider: turn.provider,
    model: turn.model,
    promptVersion: turn.promptVersion,
    knowledgeIds: turn.knowledgeIds,
    storage: getPersistenceMode(),
  });
}
