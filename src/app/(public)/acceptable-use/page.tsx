import Link from "next/link";

export const metadata = { title: "Acceptable use" };

export default function AcceptableUsePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 my-fade-in-up">
      <Link href="/" className="text-sm font-semibold text-brand hover:underline underline-offset-4 mb-8 block">← Home</Link>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-brand text-[var(--my-brand-fg)] font-bold text-lg flex items-center justify-center shadow-[var(--my-glow)]">M</div>
        <span className="text-sm font-bold uppercase tracking-wider text-brand">ManoYug AI</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Acceptable Use
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <div className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
          {[
            "Use the platform for personal wellbeing support as an eligible student or authorized staff.",
            "Do not attempt to extract other students' data, bypass safety, or abuse OTP/auth.",
            "Do not upload malware or CSV payloads intended to exploit spreadsheet software.",
            "Do not use the AI to obtain self-harm methods or to harass others.",
          ].map((rule, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-subtle text-[11px] font-bold text-muted border border-border border-dashed mt-0.5">
                {idx + 1}
              </span>
              <p className="text-foreground">{rule}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--my-warning)]/30 bg-[var(--my-warning-bg)] p-6">
          <p className="font-semibold text-foreground">Legal placeholder — counsel review required.</p>
        </div>
      </div>
    </main>
  );
}
