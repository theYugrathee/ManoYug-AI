"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeOnboardingAction } from "@/lib/student/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md my-fade-in-up">
        {/* Keep onboarding visually consistent with the auth flow. */}
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-brand text-[var(--my-brand-fg)] font-bold mb-6 shadow-[var(--my-glow)]">M</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Before you begin
          </h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            ManoYug AI is an AI companion — not a human therapist, psychologist, psychiatrist, or emergency service. Conversations are private by default. Safety systems may route you to human support if necessary.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)]">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                const result = await completeOnboardingAction(fd);
                if (!result.ok) {
                  setError(result.message);
                  return;
                }
                router.push(result.redirectTo);
              });
            }}
          >
            {error ? (
              <Alert tone="danger" role="alert">
                {error}
              </Alert>
            ) : null}

            <div className="space-y-3">
              <label htmlFor="language" className="block text-sm font-semibold text-foreground">
                Preferred language
              </label>
              <div className="relative">
                <select
                  id="language"
                  name="language"
                  className="w-full appearance-none rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-foreground transition-colors hover:border-[var(--my-border-strong)] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="hinglish">Hinglish</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-subtle p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="h-4 w-4 rounded border-border bg-elevated text-brand accent-brand focus:ring-brand focus:ring-offset-background"
                  />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-foreground">I acknowledge</span>
                  <p className="text-muted text-xs leading-relaxed mt-1">I understand the AI disclosure and that this platform is not a replacement for emergency care.</p>
                </div>
              </label>
            </div>

            <Button type="submit" loading={pending} className="w-full h-11">
              Continue to Student Space
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
