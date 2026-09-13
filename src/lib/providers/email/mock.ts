import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

/**
 * Dev provider — logs delivery intent without claiming production send.
 * Does not log full message bodies that may contain OTPs in production paths;
 * for local mock OTP flows, subject + truncated to are enough.
 */
export class MockEmailProvider implements EmailProvider {
  readonly name = "mock";

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const toHint =
      input.to.length > 4
        ? `${input.to.slice(0, 2)}…${input.to.slice(-4)}`
        : "[redacted]";
    console.info(
      `[MockEmailProvider] queued subject="${input.subject}" to=${toHint}`,
    );
    return { ok: true, providerMessageId: `mock-${Date.now()}` };
  }
}
