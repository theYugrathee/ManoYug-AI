import Link from "next/link";

export const metadata = {
  title: "AI Disclosure & Model Capabilities — ManoYug AI",
  description: "Transparency statement explaining how AI is utilized within ManoYug AI, model boundaries, and safety constraints.",
};

export default function AiDisclosurePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-[var(--my-brand-fg)] text-sm font-bold">M</div>
            <span className="text-base font-semibold text-foreground">ManoYug AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/safety" className="text-muted hover:text-foreground">Safety Engine</Link>
            <Link href="/privacy" className="text-muted hover:text-foreground">Privacy</Link>
            <Link href="/login" className="text-brand">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 my-fade-in-up space-y-10">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            AI Transparency
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            AI Disclosure & Model Architecture
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            We believe in complete transparency regarding how artificial intelligence is implemented within ManoYug AI.
          </p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">1. Nature of the Conversational Model</h2>
          <p>
            ManoYug AI utilizes large language models (including configured Google Gemini Flash architectures) augmented with deterministic safety pre-checks and psychoeducational knowledge bases.
          </p>
          <div className="rounded-2xl border border-border bg-elevated p-6 space-y-3 text-xs">
            <p className="font-bold text-foreground text-sm">Key Architectural Distinctions:</p>
            <p>• <strong>Safety Decision Authority:</strong> Critical safety decisions (e.g. triggering crisis interfaces or displaying emergency helpline numbers) are executed deterministically outside the LLM. The AI model cannot override or suppress a safety alert.</p>
            <p>• <strong>Zero Clinical Diagnosis:</strong> The model is constrained from generating medical diagnoses, naming psychiatric disorders, or advising on pharmaceutical dosages.</p>
            <p>• <strong>No Memory Extraction for Profiling:</strong> Conversational context is maintained only within a rolling window to support active dialogue. We do not construct psychological profile dossiers.</p>
          </div>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">2. Hallucination Safeguards & Helpline Integrity</h2>
          <p>
            Large language models are inherently prone to generating plausible-sounding but fabricated telephone numbers. ManoYug AI strictly prohibits the model from generating contact numbers; all helpline links and campus numbers are injected directly from a cryptographically verified database registry.
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xl font-bold text-foreground">3. Continuous Human & Clinical Review</h2>
          <p>
            System prompts, safety rules, and psychoeducational grounding exercises undergo regular evaluation against benchmark distress datasets to ensure high accuracy, cultural sensitivity, and zero tolerance for harm.
          </p>
        </section>

        <div className="border-t border-border pt-8 flex items-center justify-between">
          <Link href="/safety" className="text-sm font-bold text-brand hover:underline">
            Read Safety Engine Details →
          </Link>
          <Link href="/contact" className="text-sm font-bold text-muted hover:text-foreground">
            Contact Technical Team →
          </Link>
        </div>
      </main>
    </div>
  );
}
