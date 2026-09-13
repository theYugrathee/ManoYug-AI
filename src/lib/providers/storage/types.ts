export type UploadInput = {
  path: string;
  bytes: Uint8Array | Buffer;
  contentType: string;
  /** Tenant scoping — never put PII in path segments */
  institutionId?: string;
};

export type UploadResult =
  | { ok: true; path: string; url?: string }
  | { ok: false; error: string };

export interface StorageProvider {
  readonly name: string;
  upload(input: UploadInput): Promise<UploadResult>;
}
