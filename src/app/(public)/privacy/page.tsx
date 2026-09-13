import Link from "next/link";

export const metadata = {
  title: "Privacy Policy & Data Protection — ManoYug AI",
  description: "Comprehensive overview of ManoYug AI's strict data protection, encrypted conversations, and student confidentiality protections.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold">M</div>
            <span className="text-base font-semibold text-foreground">ManoYug AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/terms" className="text-muted hover:text-foreground">Terms</Link>
            <Link href="/safety" className="text-muted hover:text-foreground">Safety Engine</Link>
            <Link href="/login" className="text-brand">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 my-fade-in-up space-y-10">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            Confidentiality & Compliance
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Privacy Policy & Student Data Shield
          </h1>
          <p className="mt-2 text-xs text-muted font-mono">Last updated: September 2026</p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">1. Our Fundamental Commitment to Student Privacy</h2>
          <p>
            ManoYug AI was founded on a simple principle: students cannot be genuinely candid about their fears, academic stress, or emotional challenges if they believe college administrators, professors, or parents are inspecting their conversations.
          </p>
          <div className="rounded-2xl border border-brand/30 bg-elevated p-6 space-y-2">
            <p className="font-bold text-foreground text-sm">Key Privacy Guarantees:</p>
            <ul className="space-y-1 text-xs text-muted">
              <li>• University deans and professors <strong>cannot read individual student chat transcripts</strong>.</li>
              <li>• Private check-in reflections and exercise journals are encrypted and strictly confidential.</li>
              <li>• Institutional analytics are computed in aggregate (e.g. minimum cohort size threshold of 25 students).</li>
              <li>• We never sell student data or train external frontier commercial models on personal transcripts.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">2. Data We Collect & Purpose</h2>
          <ul className="space-y-2 text-xs text-muted">
            <li><strong>Account Identity:</strong> Full name, university email, phone number, university roll number, and graduation year to verify institutional enrollment eligibility.</li>
            <li><strong>Conversational Sessions:</strong> Messages exchanged with the AI companion within an encrypted session database to enable conversational continuity.</li>
            <li><strong>Wellbeing Check-ins:</strong> Optional numeric ratings (mood, stress, sleep, academic load) and personal notes stored privately for student self-reflection.</li>
            <li><strong>Inference Telemetry:</strong> Token consumption, response latency, and system error rates to ensure platform uptime and monitor AI unit economics.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">3. Row-Level Security & Multi-Tenant Isolation</h2>
          <p>
            All data stored in PostgreSQL is partitioned by tenant ID and protected by strict Supabase Row-Level Security (RLS) policies. Student tokens cannot query other students&apos; records, and Institution A cannot access Institution B&apos;s data under any condition.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">4. Student Rights & Data Deletion</h2>
          <p>
            Students retain full ownership of their personal wellbeing journey. Through the Settings interface, a student may export their activity history or permanently purge their account and associated conversations at any time.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link href="/terms" className="text-sm font-bold text-brand hover:underline">
            Read Terms of Service →
          </Link>
          <Link href="/ai-disclosure" className="text-sm font-bold text-muted hover:text-foreground">
            AI Disclosure & Model Boundaries →
          </Link>
        </div>
      </main>
    </div>
  );
}
