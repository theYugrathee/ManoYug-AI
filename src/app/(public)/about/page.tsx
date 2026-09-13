import Link from "next/link";

export const metadata = {
  title: "About ManoYug AI — Mission, Values & Platform Architecture",
  description: "Learn about ManoYug AI's mission to provide 24/7 AI-first student wellbeing support with deterministic safety and institutional privacy.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold">M</div>
            <span className="text-base font-semibold text-foreground">ManoYug AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/how-it-works" className="text-muted hover:text-foreground">How it Works</Link>
            <Link href="/safety" className="text-muted hover:text-foreground">Safety Engine</Link>
            <Link href="/login" className="text-brand">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 my-fade-in-up space-y-12">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            About Our Mission
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Bridging the 2 AM emotional support gap on Indian campuses.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            ManoYug AI is an institutional student wellbeing infrastructure layer designed to provide non-judgmental, immediate emotional support to university students while maintaining a deterministic safety boundary and strict confidentiality.
          </p>
        </div>

        {/* Core Identity & Boundaries */}
        <section className="rounded-2xl border border-border bg-elevated p-8 space-y-6">
          <h2 className="text-xl font-bold text-foreground">What ManoYug AI Is — and Is Not</h2>
          <div className="grid gap-6 sm:grid-cols-2 text-xs leading-relaxed">
            <div className="rounded-xl border border-brand/20 bg-subtle p-5 space-y-2">
              <h3 className="font-bold text-brand text-sm flex items-center gap-1.5">
                <span>✓</span> What ManoYug Is
              </h3>
              <ul className="space-y-1.5 text-muted">
                <li>• An empathetic 24/7 first-response AI emotional companion</li>
                <li>• Evidence-informed general wellbeing and grounding tool (breathing, sleep routines)</li>
                <li>• Real-time navigation bridge to verified national helplines (Tele-MANAS)</li>
                <li>• Privacy-preserving cohort sentiment layer for higher-ed leadership</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--my-danger)]/20 bg-subtle p-5 space-y-2">
              <h3 className="font-bold text-[var(--my-danger)] text-sm flex items-center gap-1.5">
                <span>✕</span> What ManoYug Is NOT
              </h3>
              <ul className="space-y-1.5 text-muted">
                <li>• NOT a therapist, psychologist, or psychiatrist</li>
                <li>• NOT a medical doctor or diagnostic instrument</li>
                <li>• NOT an emergency 911/112 dispatcher</li>
                <li>• NOT a replacement for clinical psychiatric or psychological intervention</li>
              </ul>
            </div>
          </div>
        </section>

        {/* The Indian Higher-Education Context */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">The India-Specific Student Reality</h2>
          <p className="text-sm text-muted leading-relaxed">
            Indian higher education places unique emotional demands on students. Entrance exams like JEE and NEET, the intense pressure of placement seasons, semester backlogs, hostel homesickness, and high parental expectations often converge simultaneously.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Yet traditional on-campus counselling centers face high stigma, limited hours, and student fear that &quot;the college will notify my parents or put it on my academic record.&quot; ManoYug AI solves this by ensuring that personal chats are private to the student, while university leaders receive anonymized theme analytics to organize timely campus interventions.
          </p>
        </section>

        {/* Safety & Ethics */}
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-2xl font-bold text-foreground">Ethical AI & Non-Engagement Principles</h2>
          <p className="text-sm text-muted leading-relaxed">
            Unlike commercial AI chatbots optimized for infinite engagement, retention loops, and user addiction, ManoYug AI is designed for student self-efficacy. It encourages healthy offline sleep routines, authentic peer connection, and human escalation whenever clinical distress is detected.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link href="/how-it-works" className="text-sm font-bold text-brand hover:underline">
            Explore How ManoYug Works →
          </Link>
          <Link href="/safety" className="text-sm font-bold text-muted hover:text-foreground">
            Read Safety Architecture →
          </Link>
        </div>
      </main>
    </div>
  );
}
