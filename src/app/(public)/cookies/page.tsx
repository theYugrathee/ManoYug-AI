import Link from "next/link";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 my-fade-in-up">
      <Link href="/" className="text-sm font-semibold text-brand hover:underline underline-offset-4 mb-8 block">← Home</Link>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-brand text-[var(--my-brand-fg)] font-bold text-lg flex items-center justify-center shadow-[var(--my-glow)]">M</div>
        <span className="text-sm font-bold uppercase tracking-wider text-brand">ManoYug AI</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Cookie Policy
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <div className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-[var(--my-success)] rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong className="text-foreground">Essential Only:</strong> We use essential cookies for authentication sessions (Supabase Auth). These are required for the platform to function.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-[var(--my-success)] rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong className="text-foreground">No Advertising:</strong> We do not use advertising, tracking, or retargeting cookies of any kind.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-[var(--my-success)] rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong className="text-foreground">First-Party Analytics:</strong> Analytics are privacy-conscious and first-party only — no data leaves for third-party marketing infrastructure.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--my-warning)]/30 bg-[var(--my-warning-bg)] p-6">
          <p className="font-semibold text-foreground">Legal placeholder — counsel review required for a final cookie notice.</p>
        </div>
      </div>
    </main>
  );
}
