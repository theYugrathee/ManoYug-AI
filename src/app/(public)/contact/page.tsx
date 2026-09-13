import Link from "next/link";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 my-fade-in-up">
      <Link href="/" className="text-sm font-semibold text-brand hover:underline underline-offset-4 mb-8 block">← Home</Link>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-brand text-[var(--my-brand-fg)] font-bold text-lg flex items-center justify-center shadow-[var(--my-glow)]">M</div>
        <span className="text-sm font-bold uppercase tracking-wider text-brand">ManoYug AI</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Contact
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <p>
          For institutional sales and onboarding, contact your assigned ManoYug account representative through your institutional partnership portal.
        </p>

        <div className="rounded-2xl border border-[var(--my-warning)]/30 bg-[var(--my-warning-bg)] p-6">
          <p className="text-foreground font-medium">
            <strong>Student crisis support</strong> should use campus counselling and verified helplines on our <Link href="/help" className="text-brand underline underline-offset-4">Help / Safety</Link> page — not this contact channel.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-elevated p-6 text-center">
          <p className="text-xs uppercase font-bold tracking-wider text-muted mb-2">
            Platform Support
          </p>
          <p className="text-foreground font-medium">
            Email is configured per deployment environment and is not hardcoded here.
          </p>
        </div>
      </div>
    </main>
  );
}
