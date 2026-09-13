import Link from "next/link";

export const metadata = {
  title: "Safety Architecture & Crisis Protocol — ManoYug AI",
  description: "Comprehensive overview of ManoYug AI's multi-layered safety engine, crisis escalation protocols, and national helpline verification.",
};

export default function SafetyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold">M</div>
            <span className="text-base font-semibold text-foreground">ManoYug AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/how-it-works" className="text-muted hover:text-foreground">How it Works</Link>
            <Link href="/privacy" className="text-muted hover:text-foreground">Privacy</Link>
            <Link href="/help" className="text-brand">Helpline (14416)</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 my-fade-in-up space-y-12">
        <div>
          <span className="rounded-full bg-[var(--my-danger)]/10 px-3 py-1 text-xs font-bold text-[var(--my-danger)] uppercase tracking-wider">
            Safety Guardrails
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Safety Architecture Outside the Model
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            How ManoYug AI protects students through deterministic pre-checks, non-hallucinating emergency escalation, and strict clinical boundaries.
          </p>
        </div>

        {/* 4 Safety States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">4 Deterministic Safety States</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--my-success)]/30 bg-elevated p-6 space-y-2">
              <span className="rounded-full bg-[var(--my-success-bg)] px-2.5 py-1 text-xs font-bold text-[var(--my-success)]">GREEN — General Wellbeing</span>
              <p className="text-xs text-muted leading-relaxed mt-2">
                Routine academic stress, sleep concerns, exam planning, or general conversational support. The AI acts as an empathetic sounding board with evidence-based grounding techniques.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--my-warning)]/30 bg-elevated p-6 space-y-2">
              <span className="rounded-full bg-[var(--my-warning-bg)] px-2.5 py-1 text-xs font-bold text-[var(--my-warning)]">AMBER — Elevated Concern</span>
              <p className="text-xs text-muted leading-relaxed mt-2">
                Prolonged distress, severe hopelessness, or ragging/harassment mention. An un-intrusive support banner is injected offering verified human contacts without interrupting conversation.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--my-danger)]/40 bg-elevated p-6 space-y-2">
              <span className="rounded-full bg-[var(--my-danger-bg)] px-2.5 py-1 text-xs font-bold text-[var(--my-danger)]">RED — Acute Distress</span>
              <p className="text-xs text-muted leading-relaxed mt-2">
                Explicit self-harm references or violence signals. The companion prioritizes de-escalation and highlights immediate connection to Tele-MANAS (14416) and campus wellness desks.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--my-danger)] bg-[var(--my-danger-bg)] p-6 space-y-2">
              <span className="rounded-full bg-[var(--my-danger)] px-2.5 py-1 text-xs font-bold text-white">IMMINENT — Active Crisis</span>
              <p className="text-xs text-foreground leading-relaxed mt-2 font-medium">
                Immediate danger signals (active suicide attempt, means present, acute medical emergency). Normal chat halts and full-screen crisis controls take over with direct one-touch dialers to emergency lines.
              </p>
            </div>
          </div>
        </section>

        {/* National Verified Helplines */}
        <section className="rounded-2xl border border-border bg-elevated p-8 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Verified Emergency Registry</h2>
          <p className="text-xs text-muted leading-relaxed">
            ManoYug AI never generates or guesses helpline numbers in AI prompts. Crisis resources are loaded from a cryptographically signed database registry maintained by platform safety engineers.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-subtle border border-border">
              <p className="font-bold text-foreground">Tele-MANAS (Govt of India)</p>
              <p className="text-brand font-mono font-bold mt-1 text-sm">Dial: 14416 / 1800-89-14416</p>
              <p className="text-muted mt-1">24/7 National Mental Health Helpline (20+ Indian Languages)</p>
            </div>
            <div className="p-4 rounded-xl bg-subtle border border-border">
              <p className="font-bold text-foreground">National Emergency Services</p>
              <p className="text-[var(--my-danger)] font-mono font-bold mt-1 text-sm">Dial: 112</p>
              <p className="text-muted mt-1">Immediate police, fire, or ambulance response</p>
            </div>
          </div>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link href="/privacy" className="text-sm font-bold text-brand hover:underline">
            Read Privacy Architecture →
          </Link>
          <Link href="/help" className="text-sm font-bold text-foreground hover:underline">
            Emergency Help Center →
          </Link>
        </div>
      </main>
    </div>
  );
}
