import Link from "next/link";
import { DeletionRequestForm } from "@/components/student/deletion-request-form";

export const metadata = { title: "Privacy" };

export default function StudentPrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <header className="mb-10 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Your Privacy
        </h1>
        <p className="mt-2 text-sm text-muted">
          Transparency in data collection, access, and retention.
        </p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <section className="rounded-2xl border border-border bg-elevated p-6 transition-all hover:border-[var(--my-border-strong)]">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="h-5 w-1 bg-brand rounded-full"></div> What we collect
          </h2>
          <p>
            Account identity fields, eligibility match metadata, check-ins you submit, conversation content needed for support, safety events, and usage analytics. <strong className="text-foreground">We explicitly do not do raw message dumps to third-party marketing tools.</strong>
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-elevated p-6 transition-all hover:border-[var(--my-border-strong)]">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="h-5 w-1 bg-brand rounded-full"></div> Who can access chats
          </h2>
          <p>
            You; assigned counsellors when escalated or you request human support; platform staff <strong className="text-foreground">only via audited break-glass</strong>. Institution admins see aggregates — not private chats by default.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-elevated p-6 transition-all hover:border-[var(--my-border-strong)]">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="h-5 w-1 bg-brand rounded-full"></div> Retention & Limits
          </h2>
          <p>
            Retention is configurable by your institutional tenant. We do not claim absolute confidentiality — imminent safety routing may involve human intervention to protect you.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-10 border-t border-border">
        <div className="rounded-2xl border border-[var(--my-danger)]/20 bg-[var(--my-danger-bg)]/50 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-2 text-center sm:text-left">
            Data Deletion
          </h2>
          <p className="text-sm text-muted mb-6 text-center sm:text-left">
            Requesting deletion will remove your identifiable check-ins and conversation history. This action cannot be reversed.
          </p>
          <div className="max-w-md mx-auto sm:mx-0">
            <DeletionRequestForm />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center sm:text-left">
        <Link href="/privacy" className="text-sm font-semibold text-brand hover:underline underline-offset-4 pointer-events-auto">
          Read full privacy policy →
        </Link>
      </div>
    </main>
  );
}
