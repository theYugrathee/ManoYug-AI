export type FeatureFlag =
  | "chat.enabled"
  | "chat.streaming"
  | "gemini.enabled"
  | "roster.csv_import"
  | "appointments.enabled"
  | "analytics.dashboard"
  | "eval.suite"
  | "break_glass.enabled";

const DEFAULTS: Record<FeatureFlag, boolean> = {
  "chat.enabled": true,
  "chat.streaming": true,
  "gemini.enabled": true,
  "roster.csv_import": true,
  "appointments.enabled": true,
  "analytics.dashboard": true,
  "eval.suite": true,
  "break_glass.enabled": false,
};

/**
 * Feature flags — env override FEATURE_FLAG_<NAME>=0|1
 * e.g. FEATURE_FLAG_CHAT_STREAMING=0
 */
export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  const envKey = `FEATURE_FLAG_${flag.replace(/\./g, "_").toUpperCase()}`;
  const raw = process.env[envKey];
  if (raw === "0" || raw === "false") return false;
  if (raw === "1" || raw === "true") return true;

  if (isSupabaseAdminConfigured()) {
    const { data, error } = await createAdminClient()
      .from("feature_flags")
      .select("is_enabled")
      .eq("key", flag)
      .maybeSingle();
    if (!error && data) return Boolean(data.is_enabled);
  }

  return DEFAULTS[flag];
}

export async function listFeatureFlags(): Promise<Array<{ flag: FeatureFlag; enabled: boolean }>> {
  return Promise.all((Object.keys(DEFAULTS) as FeatureFlag[]).map(async (flag) => ({
    flag,
    enabled: await isFeatureEnabled(flag),
  })));
}
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/db/supabase/admin";
