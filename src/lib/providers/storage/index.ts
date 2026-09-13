import {
  createAdminClient,
  isSupabaseAdminConfigured,
} from "@/lib/db/supabase/admin";
import { LocalMemoryStorageProvider } from "./memory";
import type { StorageProvider, UploadInput, UploadResult } from "./types";

class SupabaseStorageProvider implements StorageProvider {
  readonly name = "supabase";

  constructor(private readonly bucket = process.env.STORAGE_BUCKET ?? "uploads") {}

  async upload(input: UploadInput): Promise<UploadResult> {
    if (!isSupabaseAdminConfigured()) {
      return { ok: false, error: "Supabase service role not configured." };
    }
    try {
      const admin = createAdminClient();
      const { error } = await admin.storage
        .from(this.bucket)
        .upload(input.path, input.bytes, {
          contentType: input.contentType,
          upsert: false,
        });
      if (error) return { ok: false, error: error.message };
      const { data } = admin.storage.from(this.bucket).getPublicUrl(input.path);
      return { ok: true, path: input.path, url: data.publicUrl };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed",
      };
    }
  }
}

let cached: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cached) return cached;

  if (
    (process.env.STORAGE_PROVIDER === "supabase" ||
      process.env.STORAGE_PROVIDER === "auto") &&
    isSupabaseAdminConfigured()
  ) {
    cached = new SupabaseStorageProvider();
    return cached;
  }

  cached = new LocalMemoryStorageProvider();
  return cached;
}

export type { StorageProvider, UploadInput, UploadResult } from "./types";
