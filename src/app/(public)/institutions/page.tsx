import Link from "next/link";
import { InstitutionRequestForm } from "@/components/institution/institution-request-form";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export const metadata = {
  title: "For Higher Education Institutions — ManoYug AI",
  description: "AI-first student wellbeing infrastructure, safety escalation, and privacy-preserving aggregate analytics for Indian universities.",
};

export default function InstitutionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold shadow-sm">
              M
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              ManoYug AI
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted md:flex" aria-label="Primary">
            <Link className="transition-colors hover:text-foreground" href="/how-it-works">How it works</Link>
            <Link className="transition-colors hover:text-foreground" href="/safety">Safety Engine</Link>
            <Link className="text-brand font-medium" href="/institutions">For Institutions</Link>
            <Link className="transition-colors hover:text-foreground" href="/about">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link className="hidden text-sm text-muted transition-colors hover:text-foreground sm:inline-flex" href="/login">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-brand px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--my-brand-fg)] shadow-[var(--my-glow)] transition-all hover:bg-brand-hover active:scale-[0.97]"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-20">
        {/* ─── HERO WITH ONBOARDING FORM AT TOP ─── */}
        <section className="relative px-6 py-12 md:py-16 overflow-hidden border-b border-border">
          <div className="absolute inset-0 my-grid-bg" aria-hidden="true" />
          <div className="absolute top-10 right-10 w-[500px] h-[400px] rounded-full bg-brand/[0.06] blur-[120px] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-6xl grid gap-12 lg:grid-cols-12 items-start">
            {/* Left Column: Product Value & Highlights */}
            <div className="lg:col-span-5 space-y-6 pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3.5 py-1 text-xs font-semibold text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Institutional Infrastructure
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Scalable first-line student wellbeing. <br />
                <span className="text-brand">Zero compromise on privacy.</span>
              </h1>

              <p className="text-sm leading-relaxed text-muted sm:text-base">
                Equip your university with 24/7 empathetic emotional first-response, deterministic Tele-MANAS escalation, and actionable cohort-level theme analytics.
              </p>

              <div className="space-y-3.5 pt-2 border-t border-border">
                <div className="flex items-start gap-3 text-xs text-muted">
                  <span className="h-5 w-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold flex-shrink-0">✓</span>
                  <span><strong className="text-foreground">24/7 First Response:</strong> Culturally fluent emotional support during peak 2 AM exam and placement anxiety.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-muted">
                  <span className="h-5 w-5 rounded-lg bg-[var(--my-danger-bg)] text-[var(--my-danger)] flex items-center justify-center font-bold flex-shrink-0">🛡️</span>
                  <span><strong className="text-foreground">Deterministic Safety Guardrails:</strong> Hard-coded routing to Tele-MANAS (14416) and campus security desks.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-muted">
                  <span className="h-5 w-5 rounded-lg bg-[var(--my-info-bg)] text-[var(--my-info)] flex items-center justify-center font-bold flex-shrink-0">🔒</span>
                  <span><strong className="text-foreground">Zero Chat Inspection:</strong> Deans receive aggregate wellbeing trends without reading private student chats.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Onboarding Form on Top */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-brand/30 bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-lg)]">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">Request Institutional Onboarding</p>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                    Bring ManoYug AI to Your Campus
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    Complete the details below. Our campus wellness deployment team will reach out within 24 hours.
                  </p>
                </div>
                <InstitutionRequestForm />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3 PILLARS ─── */}
        <section className="px-6 py-20 bg-elevated/40 border-b border-border">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl text-center">
                Why modern universities deploy ManoYug AI
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-subtle p-6">
                <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mb-4">
                  24/7
                </div>
                <h3 className="font-semibold text-foreground text-lg">Instant 2 AM First Response</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  Students experience peak anxiety late at night before exams or placement shortlists. ManoYug provides culturally fluent, non-judgmental guidance right when traditional campus offices are closed.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-subtle p-6">
                <div className="h-10 w-10 rounded-xl bg-[var(--my-danger-bg)] text-[var(--my-danger)] flex items-center justify-center font-bold text-lg mb-4">
                  🛡️
                </div>
                <h3 className="font-semibold text-foreground text-lg">Deterministic Safety Guardrails</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  High-risk and crisis queries trigger immediate, hard-coded safety workflows. The system directly connects students to national emergency lines like Tele-MANAS (14416) and campus security.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-subtle p-6">
                <div className="h-10 w-10 rounded-xl bg-[var(--my-info-bg)] text-[var(--my-info)] flex items-center justify-center font-bold text-lg mb-4">
                  🔒
                </div>
                <h3 className="font-semibold text-foreground text-lg">Strict Privacy Architecture</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  Admins cannot casually browse private student chats. Deans receive aggregate theme analytics (e.g. &quot;Exam stress rose 32% before midterms&quot;) to guide university policy and workshops.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-elevated px-6 py-12 text-sm text-muted">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ManoYug AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/safety" className="hover:text-foreground">Safety Engine</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
