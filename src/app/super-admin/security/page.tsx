import Link from "next/link";
import { MfaEnrollPanel } from "@/components/admin/mfa-enroll-panel";
import { Alert } from "@/components/ui/alert";
import { PlatformAdminManager } from "@/components/admin/platform-admin-manager";

export const metadata = { title: "Security · MFA" };

export default function MfaSettingsPage() {
  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Compliance & Security
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Multi-Factor Authentication
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Platform admins, institution super-admins, and clinical reviewers must enable MFA. Students use standard authentication paths without enforced TOTP.
        </p>
      </header>

      <Alert tone="info" className="mb-8 border-[var(--my-info)]/30 bg-[var(--my-info-bg)]" title="Infrastructure Requirement">
        TOTP MFA must be initialized in the core Supabase Auth dashboard prior to enrollment here. The action below performs verified enrollment directly against the provider.
      </Alert>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)]">
          <MfaEnrollPanel />
        </section>

        <section className="rounded-2xl border border-border bg-subtle p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 bg-[var(--my-warning)] rounded-full"></div>
            <h2 className="text-xl font-bold text-foreground">Enforcement Matrix</h2>
          </div>

          <ul className="space-y-4">
            <li className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="h-2 w-2 rounded-full bg-[var(--my-warning)]"></div>
              <div>
                <p className="text-sm font-bold text-foreground">Platform Admins</p>
                <p className="text-xs text-muted">MFA Required (Strict)</p>
              </div>
            </li>
            <li className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="h-2 w-2 rounded-full bg-[var(--my-warning)]"></div>
              <div>
                <p className="text-sm font-bold text-foreground">Institution Super-Admins</p>
                <p className="text-xs text-muted">MFA Required (Strict)</p>
              </div>
            </li>
            <li className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="h-2 w-2 rounded-full bg-[var(--my-warning)]"></div>
              <div>
                <p className="text-sm font-bold text-foreground">Clinical Reviewers</p>
                <p className="text-xs text-muted">MFA Required (Strict)</p>
              </div>
            </li>
            <li className="flex items-center gap-3 pb-2">
              <div className="h-2 w-2 rounded-full bg-[var(--my-danger)]"></div>
              <div>
                <p className="text-sm font-bold text-[#ff4d4f]">Break-Glass Sessions</p>
                <p className="text-xs text-muted">MFA + Audited Reason (Ultra-Strict)</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)]">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">Platform administrator access</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Promote an existing Supabase Auth profile for platform-console access. This flag does not create a student record or institution membership.</p>
        </div>
        <PlatformAdminManager />
      </section>
    </main>
  );
}
