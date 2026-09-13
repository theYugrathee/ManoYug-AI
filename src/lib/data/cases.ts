import { createAdminClient, isSupabaseConfigured } from "@/lib/db/supabase/admin";
import type { StoredCase } from "@/lib/store/memory";
import type { CaseStatus, SafetyState } from "@/types/roles";

function mapCase(row: Record<string, unknown>): StoredCase {
  const summary = (row.ai_summary ?? {}) as StoredCase["aiSummary"];
  const notes = Array.isArray(row.counsellor_notes) ? row.counsellor_notes : [];
  return {
    id: String(row.id),
    studentKey: String(row.student_user_id),
    status: row.status as CaseStatus,
    riskState: row.risk_state as SafetyState,
    source: String(row.source ?? "student_request"),
    conversationId: row.conversation_id ? String(row.conversation_id) : undefined,
    aiSummary: summary,
    notes: notes.map((note) => {
      const item = note as Record<string, unknown>;
      return {
        id: String(item.id),
        authorKey: String(item.author_id),
        body: String(item.body),
        createdAt: String(item.created_at),
      };
    }),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function assertConfigured() {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");
}

export async function listPersistedCases(): Promise<StoredCase[]> {
  assertConfigured();
  const { data, error } = await createAdminClient()
    .from("cases")
    .select("*, counsellor_notes(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load cases: ${error.message}`);
  return (data ?? []).map((row) => mapCase(row as Record<string, unknown>));
}

export async function getPersistedCase(id: string): Promise<StoredCase | null> {
  assertConfigured();
  const { data, error } = await createAdminClient()
    .from("cases")
    .select("*, counsellor_notes(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load case: ${error.message}`);
  return data ? mapCase(data as Record<string, unknown>) : null;
}

export async function updatePersistedCaseStatus(id: string, status: CaseStatus): Promise<StoredCase | null> {
  assertConfigured();
  const { data, error } = await createAdminClient()
    .from("cases")
    .update({ status })
    .eq("id", id)
    .select("*, counsellor_notes(*)")
    .maybeSingle();
  if (error) throw new Error(`Could not update case: ${error.message}`);
  return data ? mapCase(data as Record<string, unknown>) : null;
}

export async function addPersistedCaseNote(caseId: string, authorId: string, body: string): Promise<StoredCase | null> {
  assertConfigured();
  const admin = createAdminClient();
  const { data: parent, error: parentError } = await admin.from("cases").select("institution_id").eq("id", caseId).maybeSingle();
  if (parentError || !parent) throw new Error(`Could not find case: ${parentError?.message ?? "not found"}`);
  const { error } = await admin.from("counsellor_notes").insert({
    case_id: caseId,
    institution_id: parent.institution_id,
    author_id: authorId,
    body,
  });
  if (error) throw new Error(`Could not save counsellor note: ${error.message}`);
  return getPersistedCase(caseId);
}
