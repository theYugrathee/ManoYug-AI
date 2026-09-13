"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit/log";
import { isSupabaseConfigured } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  // Clear all custom session cookies
  for (const name of [
    "manoyug_inst_id",
    "manoyug_inst_code",
    "manoyug_role",
    "manoyug_student_session",
    "manoyug_student_email",
    "manoyug_student_inst_id",
  ]) {
    cookieStore.delete(name);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      await writeAuditLog({
        action: "auth.logout",
        result: "success",
      });
    } catch (err) {
      console.error("[logout]", err);
    }
  }
  redirect("/");
}

export async function saveStudentPreferencesAction(formData: FormData) {
  const language = String(formData.get("language") || "en");
  const style = String(formData.get("style") || "balanced");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ preferred_language: language })
          .eq("id", data.user.id);
        await supabase
          .from("student_profiles")
          .update({
            preferences: { response_style: style, language },
          })
          .eq("user_id", data.user.id);
      }
    } catch (err) {
      console.error("[prefs]", err);
      return { ok: false as const, message: "Could not save preferences." };
    }
  }

  revalidatePath("/student/settings");
  return {
    ok: true as const,
    message: isSupabaseConfigured()
      ? "Preferences saved."
      : "Preferences noted for this session. Connect Supabase to persist.",
    language,
    style,
  };
}
