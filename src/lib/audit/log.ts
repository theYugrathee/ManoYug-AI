import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/db/supabase/admin";
import type { Role } from "@/types/roles";

/**
 * Privileged action audit — writes to Postgres when admin client is available,
 * otherwise logs structured JSON (never secrets / chat bodies).
 */
export async function writeAuditLog(input: {
  actorId?: string;
  role?: Role;
  institutionId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  result: "success" | "failure" | "denied";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const payload = {
    actor_id: input.actorId ?? null,
    role: input.role ?? null,
    institution_id: input.institutionId ?? null,
    action: input.action,
    resource: input.resource ?? null,
    resource_id: input.resourceId ?? null,
    result: input.result,
    metadata: input.metadata ?? {},
  };

  if (!isSupabaseAdminConfigured()) {
    console.info("[audit]", JSON.stringify(payload));
    return;
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert(payload);
    if (error) {
      console.error("[audit] insert failed", error.message);
      console.info("[audit:fallback]", JSON.stringify(payload));
    }
  } catch (err) {
    console.error("[audit] unexpected", err);
  }
}
