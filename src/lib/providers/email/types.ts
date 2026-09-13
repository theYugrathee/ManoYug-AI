export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Never put OTP or sensitive content in logs beyond what providers allow */
  tags?: Record<string, string>;
};

export type SendEmailResult =
  | { ok: true; providerMessageId?: string }
  | { ok: false; error: string };

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
