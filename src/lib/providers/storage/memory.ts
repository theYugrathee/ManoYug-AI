import type { StorageProvider, UploadInput, UploadResult } from "./types";

/**
 * Dev storage — does not claim cloud upload succeeded.
 * Wire Supabase Storage when credentials exist.
 */
export class LocalMemoryStorageProvider implements StorageProvider {
  readonly name = "memory";
  private files = new Map<string, { contentType: string; size: number }>();

  async upload(input: UploadInput): Promise<UploadResult> {
    const size = input.bytes.byteLength;
    if (size > 5_000_000) {
      return { ok: false, error: "File too large (max 5MB in memory provider)." };
    }
    this.files.set(input.path, { contentType: input.contentType, size });
    console.info(
      `[storage:memory] stored path=${input.path} type=${input.contentType} bytes=${size}`,
    );
    return { ok: true, path: input.path };
  }
}
