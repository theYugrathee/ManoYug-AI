import type { EmailProvider, SendEmailInput, SendEmailResult } from "./types";

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly from = process.env.EMAIL_FROM ?? "noreply@manoyug.example",
  ) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }

    const json = (await res.json()) as { id?: string };
    return { ok: true, providerMessageId: json.id };
  }
}
