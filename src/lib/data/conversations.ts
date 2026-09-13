import {
  createAdminClient,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import type { SafetyState } from "@/types/roles";
import {
  appendMessage as memAppend,
  createConversation as memCreate,
  createEscalationCase as memEscalate,
  getConversation as memGetConversation,
  listConversations as memListConversations,
  listMessages as memListMessages,
  type StoredConversation,
  type StoredMessage,
  demoInstitutionId,
} from "@/lib/store/memory";

export type PersistenceMode = "supabase" | "dev-memory";

export function getPersistenceMode(): PersistenceMode {
  return isSupabaseConfigured() ? "supabase" : "dev-memory";
}

async function resolveInstitutionId(userId: string): Promise<string> {
  if (!isSupabaseConfigured()) return demoInstitutionId();
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("student_profiles")
      .select("institution_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data?.institution_id) throw new Error("No institution membership found for this student.");
    return data.institution_id as string;
  } catch (err) {
    throw err;
  }
}

export async function listConversationsForUser(
  userId: string,
): Promise<StoredConversation[]> {
  if (!isSupabaseConfigured()) return memListConversations(userId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("student_user_id", userId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      console.error("[repo.conversations.list]", error?.message);
      throw new Error(`Could not load conversations: ${error?.message ?? "unknown error"}`);
    }

    return data.map((row) => ({
      id: row.id as string,
      studentKey: row.student_user_id as string,
      title: (row.title as string) || "Conversation",
      language: (row.language as StoredConversation["language"]) || "en",
      latestSafetyState: (row.latest_safety_state as SafetyState) || "GREEN",
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  } catch (err) {
    console.error("[repo.conversations.list]", err);
    throw err;
  }
}

export async function getConversationForUser(
  id: string,
  userId: string,
): Promise<StoredConversation | null> {
  if (!isSupabaseConfigured()) return memGetConversation(id, userId);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("student_user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id as string,
      studentKey: data.student_user_id as string,
      title: (data.title as string) || "Conversation",
      language: (data.language as StoredConversation["language"]) || "en",
      latestSafetyState: (data.latest_safety_state as SafetyState) || "GREEN",
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  } catch (err) {
    throw err;
  }
}

export async function createConversationForUser(
  userId: string,
  language: StoredConversation["language"] = "en",
): Promise<StoredConversation> {
  if (!isSupabaseConfigured()) return memCreate(userId, language);

  try {
    const supabase = await createClient();
    const institutionId = await resolveInstitutionId(userId);
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        institution_id: institutionId,
        student_user_id: userId,
        title: "New conversation",
        language,
        latest_safety_state: "GREEN",
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[repo.conversations.create]", error?.message);
      throw new Error(`Could not create conversation: ${error?.message ?? "unknown error"}`);
    }

    return {
      id: data.id as string,
      studentKey: data.student_user_id as string,
      title: (data.title as string) || "New conversation",
      language: (data.language as StoredConversation["language"]) || language,
      latestSafetyState: "GREEN",
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  } catch (err) {
    console.error("[repo.conversations.create]", err);
    throw err;
  }
}

export async function listMessagesForUser(
  conversationId: string,
  userId: string,
): Promise<StoredMessage[]> {
  if (!isSupabaseConfigured()) return memListMessages(conversationId, userId);

  const owned = await getConversationForUser(conversationId, userId);
  if (!owned) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("[repo.messages.list]", error?.message);
      throw new Error(`Could not load messages: ${error?.message ?? "unknown error"}`);
    }

    return data.map((row) => ({
      id: row.id as string,
      conversationId: row.conversation_id as string,
      role: row.role as StoredMessage["role"],
      content: row.content as string,
      safetyState: (row.safety_state as SafetyState) || undefined,
      blocked: Boolean(row.blocked),
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    throw err;
  }
}

export async function appendMessageForUser(
  conversationId: string,
  userId: string,
  message: Omit<StoredMessage, "id" | "conversationId" | "createdAt">,
): Promise<StoredMessage | null> {
  if (!isSupabaseConfigured()) {
    return memAppend(conversationId, userId, message);
  }

  const owned = await getConversationForUser(conversationId, userId);
  if (!owned) return null;

  try {
    const supabase = await createClient();
    const institutionId = await resolveInstitutionId(userId);
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        institution_id: institutionId,
        role: message.role,
        content: message.content,
        safety_state: message.safetyState ?? null,
        blocked: message.blocked ?? false,
        metadata: {},
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[repo.messages.append]", error?.message);
      throw new Error(`Could not save message: ${error?.message ?? "unknown error"}`);
    }

    if (message.role === "user" && owned.title === "New conversation") {
      await supabase
        .from("conversations")
        .update({
          title: message.content.slice(0, 48) || "Conversation",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    if (message.safetyState) {
      await supabase
        .from("conversations")
        .update({
          latest_safety_state: message.safetyState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    return {
      id: data.id as string,
      conversationId: data.conversation_id as string,
      role: data.role as StoredMessage["role"],
      content: data.content as string,
      safetyState: (data.safety_state as SafetyState) || undefined,
      blocked: Boolean(data.blocked),
      createdAt: data.created_at as string,
    };
  } catch (err) {
    console.error("[repo.messages.append]", err);
    throw err;
  }
}

export async function createSafetyEscalation(input: {
  userId: string;
  riskState: SafetyState;
  source: string;
  conversationId?: string;
  signals?: string[];
}) {
  if (!isSupabaseConfigured()) {
    return memEscalate({
      studentKey: input.userId,
      riskState: input.riskState,
      source: input.source,
      conversationId: input.conversationId,
      signals: input.signals,
    });
  }

  try {
    const institutionId = await resolveInstitutionId(input.userId);
    const client = isSupabaseAdminConfigured()
      ? createAdminClient()
      : await createClient();

    const { data: caseRow, error } = await client
      .from("cases")
      .insert({
        institution_id: institutionId,
        student_user_id: input.userId,
        conversation_id: input.conversationId ?? null,
        status: "NEW",
        risk_state: input.riskState,
        source: input.source,
        ai_summary: {
          facts: ["Student interaction triggered an operational safety state."],
          systemSignals: input.signals ?? [input.riskState],
          interpretation: [
            "Possible elevated concern — for counsellor review, not a clinical diagnosis.",
          ],
        },
      })
      .select("*")
      .single();

    if (error) {
      console.error("[repo.cases.create]", error.message);
      throw new Error(`Could not create safety escalation: ${error.message}`);
    }

    await client.from("safety_events").insert({
      institution_id: institutionId,
      user_id: input.userId,
      conversation_id: input.conversationId ?? null,
      state: input.riskState,
      signals: input.signals ?? [],
      recommended_action:
        input.riskState === "IMMINENT"
          ? "show_crisis_interface"
          : "show_elevated_resources",
      policy_version: "safety-policy-v1.0.0",
      source: "precheck",
    });

    return caseRow;
  } catch (err) {
    console.error("[repo.cases.create]", err);
    throw err;
  }
}
