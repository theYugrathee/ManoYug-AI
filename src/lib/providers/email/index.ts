import type { EmailProvider } from "./types";
import { MockEmailProvider } from "./mock";
import { ResendEmailProvider } from "./resend";

export type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

let cached: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cached) return cached;

  const mode = (process.env.EMAIL_PROVIDER ?? "auto").toLowerCase();
  const key = process.env.RESEND_API_KEY;

  if ((mode === "resend" || mode === "auto") && key) {
    cached = new ResendEmailProvider(key);
    return cached;
  }

  cached = new MockEmailProvider();
  return cached;
}

export function resetEmailProviderCache() {
  cached = null;
}
