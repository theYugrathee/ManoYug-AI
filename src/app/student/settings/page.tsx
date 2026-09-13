import Link from "next/link";
import { logoutAction } from "@/lib/auth/logout";
import { PreferencesForm } from "@/components/student/preferences-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Settings" };

export default function StudentSettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up">
      <header className="mb-10 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted">
          Language and response preferences only — no psychological profiling labels.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8">
        <PreferencesForm />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-subtle p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Account & Safety</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/student/privacy"
            className="flex-1 rounded-xl border border-border bg-elevated px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand/50 hover:bg-brand-subtle flex justify-between items-center group"
          >
            <span>Privacy & data</span>
            <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/ai-disclosure"
            className="flex-1 rounded-xl border border-border bg-elevated px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-[var(--my-border-strong)] flex justify-between items-center group"
          >
            <span>AI disclosure</span>
            <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <form action={logoutAction} className="mt-4 pt-6 border-t border-border/50 flex justify-center sm:justify-start">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto text-[var(--my-danger)] hover:bg-[var(--my-danger-bg)] hover:text-[var(--my-danger)] border-[var(--my-danger)]/20">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
