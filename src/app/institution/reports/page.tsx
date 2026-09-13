import { ReportDownload } from "@/components/institution/report-download";
import { Alert } from "@/components/ui/alert";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import Link from "next/link";

export const metadata = { title: "Compliance Reports & Data Exports" };

export default async function InstitutionReportsPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            Governance & Auditing
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
          Compliance & Exports
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Generate official operational exports, NIRF Criterion 5 documentation, and NAAC institutional wellbeing audits for <span className="font-semibold text-foreground font-display">{session.institutionName}</span> ({session.institutionCode}).
        </p>
      </header>

      <Alert tone="info" title="Cryptographic Privacy Guarantee">
        Exports contain aggregate cohort indicators and safety-routing tallies only. In accordance with India&apos;s DPDP Act 2023, private chat logs and reflection journals are strictly excluded.
      </Alert>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Generate CSV Export</h2>
            <p className="text-sm text-muted mt-1 mb-6">
              Download UTF-8 encoded audit datasets formatted for your university&apos;s internal quality assurance cell (IQAC).
            </p>
          </div>

          <ReportDownload />
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-border bg-subtle p-6 sm:p-8 shadow-[var(--my-shadow-md)]">
          <div className="mb-6 flex-1">
            <div className="h-10 w-10 bg-brand/20 text-brand rounded-xl flex items-center justify-center mb-4 border border-brand/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Presentation & PDF View</h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Access clean, formatted compliance sheets branded with your institution&apos;s verified credentials for syndicate and governing body reviews.
            </p>
          </div>

          <Link
            href="/institution/reports/print"
            target="_blank"
            className="group flex items-center justify-between w-full h-12 rounded-xl bg-elevated px-5 text-sm font-semibold text-foreground border border-border transition-all hover:border-brand hover:text-brand"
          >
            <span>Open Branded Printable View</span>
            <span className="transition-transform group-hover:translate-x-1 font-mono">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
