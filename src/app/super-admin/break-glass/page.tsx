import Link from "next/link";
import { isFeatureEnabled } from "@/lib/platform/feature-flags";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Break-glass" };

export default async function BreakGlassPage() {
  const enabled = await isFeatureEnabled("break_glass.enabled");

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up flex flex-col justify-center max-w-4xl min-h-[70vh]">
      <header className="mb-8 text-center sm:text-left">
        <div className="mx-auto sm:mx-0 w-16 h-16 rounded-2xl bg-[var(--my-danger)]/10 text-[var(--my-danger)] flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Emergency Break-Glass Protocol
        </h1>
      </header>

      <Alert
        className="mb-8"
        tone={enabled ? "danger" : "info"}
        title={enabled ? "CRITICAL: Protocol Active — Requires Workflow" : "Protocol Standby (Disabled By Default)"}
      >
        Emergency access to sensitive encrypted user data is not a universal backdoor. It requires a stated clinical/legal reason, explicit multi-factor authorization, a time-boxed session bounding, direct user/auditor notification, and a post-incident review.
      </Alert>

      <div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)]">
        {!enabled ? (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Activation Sequence</h2>
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">
              To trigger the emergency break-glass environment, the <code>FEATURE_FLAG_BREAK_GLASS_ENABLED=1</code> flag must be explicitly set at the infrastructure level during controlled incidents. Subsequently, time-boxed ticketed sessions must be authorized against the primary auth provider.
            </p>
            <div className="p-4 bg-background border border-border border-dashed rounded-lg flex items-center justify-center">
              <span className="text-xs uppercase font-bold tracking-wider text-muted">Awaiting Infrastructure Flag (Disabled)</span>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-[var(--my-danger)] mb-2">Protocol Active</h2>
            <p className="text-sm text-foreground mb-6">
              The infrastructure flag is currently enabled. You must wire a time-boxed database session context before the system will grant any sensitive decryption reads. Activity is fully logged and immutable.
            </p>
            <button className="h-10 px-6 rounded-lg bg-[var(--my-danger)] text-white text-sm font-semibold hover:bg-[var(--my-danger-hover)] transition-colors opacity-50 cursor-not-allowed">
              Initialize Time-Boxed Session (Requires Setup)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
