import Link from "next/link";

export const metadata = {
  title: "Terms of Service — ManoYug AI",
  description: "Terms and conditions governing student and institutional access to the ManoYug AI wellbeing platform.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold">M</div>
            <span className="text-base font-semibold text-foreground">ManoYug AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/privacy" className="text-muted hover:text-foreground">Privacy</Link>
            <Link href="/safety" className="text-muted hover:text-foreground">Safety</Link>
            <Link href="/login" className="text-brand">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 my-fade-in-up space-y-10">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            Legal Terms
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-muted font-mono">Effective: September 2026</p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">1. Non-Clinical Wellbeing Disclaimer</h2>
          <p>
            ManoYug AI provides non-clinical emotional support, psychoeducation, and wellbeing navigation. It is not licensed to practice medicine, provide clinical psychiatric diagnoses, prescribe pharmaceutical drugs, or serve as emergency medical services.
          </p>
          <div className="rounded-xl border border-[var(--my-danger)]/30 bg-[var(--my-danger-bg)] p-4 text-xs text-foreground font-medium">
            IF YOU OR SOMEONE YOU KNOW IS EXPERIENCING A LIFE-THREATENING EMERGENCY, IMMEDIATE RISK OF SELF-HARM, OR CRITICAL MEDICAL DISTRESS, PLEASE DIAL 112 (NATIONAL EMERGENCY SERVICES) OR 14416 (TELE-MANAS) IMMEDIATELY.
          </div>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">2. Eligibility & Institutional Access</h2>
          <p>
            Access is provided to enrolled students and authorized administrators of partner universities and colleges. You agree to provide accurate registration details and maintain the security of your account credentials.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">3. Acceptable Use Policy</h2>
          <p>
            Users must not attempt to manipulate the AI to generate harmful, illegal, or abusive content, reverse-engineer platform endpoints, probe system prompts, or bypass tenant isolation safeguards.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted under applicable law, ManoYug AI and its institutional partners shall not be held liable for indirect, incidental, or consequential damages arising from conversational reliance or network interruptions.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link href="/privacy" className="text-sm font-bold text-brand hover:underline">
            Read Privacy Policy →
          </Link>
          <Link href="/contact" className="text-sm font-bold text-muted hover:text-foreground">
            Contact Support →
          </Link>
        </div>
      </main>
    </div>
  );
}
