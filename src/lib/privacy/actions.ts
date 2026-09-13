"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit/log";
import { getAppSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import { trackEvent } from "@/lib/providers/analytics";
import { DEV_STUDENT_KEY } from "@/lib/store/memory";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { randomUUID } from "node:crypto";

type FeedbackRow = {
  id: string;
  conversationId?: string;
  rating: "up" | "down" | "report";
  note?: string;
  createdAt: string;
};

const g = globalThis as unknown as { __manoyugFeedback?: FeedbackRow[] };
function feedbackStore() {
  if (!g.__manoyugFeedback) g.__manoyugFeedback = [];
  return g.__manoyugFeedback;
}

export async function submitMessageFeedbackAction(formData: FormData) {
  const rating = String(formData.get("rating") || "") as FeedbackRow["rating"];
  const conversationId = String(formData.get("conversationId") || "") || undefined;
  const note = String(formData.get("note") || "").trim() || undefined;
  if (!["up", "down", "report"].includes(rating)) {
    return { ok: false, message: "Invalid feedback." };
  }

  const session = await getAppSession();
  const userId = session?.userId ?? DEV_STUDENT_KEY;

  if (isSupabaseConfigured() && session?.userId) {
    const { error } = await createAdminClient().from("message_feedback").insert({ user_id: userId, conversation_id: conversationId ?? null, rating, note: note ?? null });
    if (error) return { ok: false, message: "We could not save your feedback. Please try again." };
  } else {
    feedbackStore().unshift({ id: randomUUID(), conversationId, rating, note, createdAt: new Date().toISOString() });
  }

  await trackEvent({
    name: "chat_feedback",
    userId,
    properties: { rating },
  });

  return { ok: true, message: "Thanks — feedback recorded." };
}

type DeletionRequest = {
  id: string;
  userId: string;
  reason: string;
  status: "RECEIVED" | "IN_REVIEW" | "COMPLETED";
  createdAt: string;
};

const gDel = globalThis as unknown as { __manoyugDeletion?: DeletionRequest[] };
function deletionStore() {
  if (!gDel.__manoyugDeletion) gDel.__manoyugDeletion = [];
  return gDel.__manoyugDeletion;
}

export async function requestDataDeletionAction(formData: FormData) {
  const reason = String(formData.get("reason") || "").trim();
  if (reason.length < 5) {
    return { ok: false, message: "Please add a short reason (min 5 characters)." };
  }

  const session = await getAppSession();
  const userId = session?.userId ?? DEV_STUDENT_KEY;

  const row: DeletionRequest = { id: randomUUID(), userId, reason, status: "RECEIVED", createdAt: new Date().toISOString() };
  if (isSupabaseConfigured() && session?.userId) {
    const { data, error } = await createAdminClient().from("data_deletion_requests").insert({ user_id: userId, reason }).select("id, status, created_at").single();
    if (error || !data) return { ok: false, message: "We could not save your deletion request. Please try again." };
    row.id = data.id;
    row.status = data.status as DeletionRequest["status"];
    row.createdAt = data.created_at;
  } else {
    deletionStore().unshift(row);
  }

  await writeAuditLog({
    actorId: userId,
    action: "privacy.deletion_requested",
    resource: "deletion_requests",
    resourceId: row.id,
    result: "success",
  });

  revalidatePath("/student/privacy");
  return {
    ok: true,
    message:
      "Deletion request received. An authorized reviewer will process it — this is not an instant wipe.",
  };
}

export async function listDeletionRequests() {
  if (isSupabaseConfigured()) {
    const { data, error } = await createAdminClient().from("data_deletion_requests").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) return [];
    return (data ?? []).map((row) => ({ id: row.id, userId: row.user_id, reason: row.reason, status: row.status as DeletionRequest["status"], createdAt: row.created_at }));
  }
  return deletionStore().slice(0, 50);
}

/**
 * MFA enroll — real when Supabase Auth is configured; otherwise honest messaging.
 */
export async function startMfaEnrollAction() {
  if (!isSupabaseConfigured()) {
    return {
      ok: false as const,
      message:
        "Connect Supabase Auth first, then enable TOTP MFA in the dashboard.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "ManoYug authenticator",
    });
    if (error) {
      return { ok: false as const, message: error.message };
    }
    return {
      ok: true as const,
      message: "Scan the QR / secret in your authenticator app, then verify.",
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  } catch (err) {
    console.error("[mfa.enroll]", err);
    return {
      ok: false as const,
      message: "MFA enrollment failed. Check Auth MFA is enabled in Supabase.",
    };
  }
}

export async function verifyMfaEnrollAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, message: "Supabase is not configured." };
  }
  const factorId = String(formData.get("factorId") || "");
  const code = String(formData.get("code") || "").trim();
  if (!factorId || !code) {
    return { ok: false as const, message: "Factor and code are required." };
  }

  try {
    const supabase = await createClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      return { ok: false as const, message: challenge.error.message };
    }
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });
    if (verify.error) {
      return { ok: false as const, message: verify.error.message };
    }
    await writeAuditLog({
      action: "auth.mfa.enrolled",
      result: "success",
      resource: "mfa_factors",
      resourceId: factorId,
    });
    return { ok: true as const, message: "MFA factor verified and active." };
  } catch (err) {
    console.error("[mfa.verify]", err);
    return { ok: false as const, message: "Verification failed." };
  }
}
