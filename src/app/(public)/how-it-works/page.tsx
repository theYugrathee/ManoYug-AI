import Link from "next/link";

export const metadata = {
  title: "How ManoYug AI Works — Companion Pipeline & Safety",
  description: "Understand the multi-stage architecture behind ManoYug AI: prechecks, contextual memory, and verified crisis routing.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold">M</div>
            <span className="text-base font-semibold text-foreground">ManoYug AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/about" className="text-muted hover:text-foreground">About</Link>
            <Link href="/safety" className="text-muted hover:text-foreground">Safety Engine</Link>
            <Link href="/login" className="text-brand">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 my-fade-in-up space-y-12">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            Architecture & Pipeline
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            How ManoYug AI Operates
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            A step-by-step walkthrough of what happens when a student sends a message, how safety is enforced outside the LLM, and how institutions receive privacy-safe aggregated intelligence.
          </p>
        </div>

        {/* 4 Steps Breakdown */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">The 4-Stage Response Lifecycle</h2>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-elevated p-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-brand text-[var(--my-brand-fg)] flex items-center justify-center font-bold text-xs">1</span>
                <h3 className="font-bold text-foreground text-base">Student Interaction & Session Isolation</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed pl-10">
                The student inputs a message via web or mobile in English, Hindi, or Hinglish. Messages are stored within tenant-scoped partitions using Row-Level Security (RLS) in PostgreSQL. The session is strictly private to the student account.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-elevated p-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-[var(--my-danger)] text-white flex items-center justify-center font-bold text-xs">2</span>
                <h3 className="font-bold text-foreground text-base">Deterministic Safety Pre-Check</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed pl-10">
                Before reaching any AI model, the message passes through a deterministic regex and signal precheck. High-risk indicators (suicidal ideation, self-harm keywords, immediate medical danger) halt normal LLM generation and directly trigger full-screen crisis interventions.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-elevated p-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-brand text-[var(--my-brand-fg)] flex items-center justify-center font-bold text-xs">3</span>
                <h3 className="font-bold text-foreground text-base">Contextual LLM Generation & System Prompt Guardrails</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed pl-10">
                If the turn is safe, the prompt is formatted with active psychoeducation modules and rolling 12-message context. The companion generates an empathetic, culturally fluent response without robotic boilerplate or medical diagnostic claims.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-elevated p-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-[var(--my-info)] text-[var(--my-bg)] flex items-center justify-center font-bold text-xs">4</span>
                <h3 className="font-bold text-foreground text-base">Post-Check & Resource Attachment</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed pl-10">
                The generated text is reviewed by a post-check rule layer to prevent hallucinated helpline numbers or clinical assertions. If human support is requested, verified Tele-MANAS hotlines and campus contact numbers are injected seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy vs Analytics */}
        <section className="rounded-2xl border border-border bg-subtle p-8 space-y-4">
          <h2 className="text-xl font-bold text-foreground">How Aggregate Institutional Insights Work</h2>
          <p className="text-xs text-muted leading-relaxed">
            University administrators see trends like &quot;Exam stress rose 34% among 2nd-year engineering students this week.&quot; The system derives these themes from high-level non-identifiable categorizations, ensuring individual chat transcripts are never accessible by college faculty or staff.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link href="/safety" className="text-sm font-bold text-brand hover:underline">
            Read Complete Safety Policy →
          </Link>
          <Link href="/institutions" className="text-sm font-bold text-muted hover:text-foreground">
            For Institutional Deans →
          </Link>
        </div>
      </main>
    </div>
  );
}
