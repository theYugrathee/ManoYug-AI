import Link from "next/link";
import { runEvaluationSuite } from "@/lib/eval/suite";
import { isFeatureEnabled } from "@/lib/platform/feature-flags";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Evaluations" };

export default async function EvaluationsPage() {
  if (!(await isFeatureEnabled("eval.suite"))) {
    return (
      <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Evaluation Suite</h1>
        </header>
        <Alert tone="warning" title="Module Disabled">The automated evaluation suite flag is currently disabled in this environment.</Alert>
      </main>
    );
  }

  const report = await runEvaluationSuite();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Platform Governance
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Evaluation Suite
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          LLM safety, prompt-injection, and language behavioral checks. CI deployments are blocked if critical test cases fail in pre-flight.
        </p>
      </header>

      <section className="mb-8">
        <div className={`rounded-xl border border-${report.failed === 0 ? '[var(--my-success)]' : '[var(--my-danger)]'}/30 bg-${report.failed === 0 ? '[var(--my-success)]' : '[var(--my-danger)]'}/5 p-6`}>
          <h2 className={`text-xl font-bold ${report.failed === 0 ? 'text-[var(--my-success)]' : 'text-[var(--my-danger)]'} mb-2`}>
            Test Report: {report.passed} Passed / {report.failed} Failed
          </h2>
          <p className="text-sm text-foreground">Executed {report.results.length} total deterministic test cases against the LLM gateway.</p>
        </div>
      </section>

      <div className="rounded-xl border border-border bg-elevated overflow-hidden">
        <table className="min-w-full text-left text-sm whitespace-nowrap hidden sm:table">
          <thead className="bg-subtle text-xs uppercase tracking-wider text-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold w-24">Status</th>
              <th className="px-6 py-4 font-semibold">Test ID</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold w-full">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {report.results.map((r) => (
              <tr key={r.id} className="hover:bg-subtle transition-colors">
                <td className="px-6 py-4">
                  <Badge variant={r.passed ? 'success' : 'danger'}>{r.passed ? 'PASS' : 'FAIL'}</Badge>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-brand">{r.id}</td>
                <td className="px-6 py-4 text-muted text-xs uppercase tracking-wider font-semibold">{r.category}</td>
                <td className="px-6 py-4 text-foreground text-xs whitespace-normal">{r.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-border">
          {report.results.map((r) => (
            <div key={r.id} className="p-4 bg-elevated space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={r.passed ? 'success' : 'danger'}>{r.passed ? 'PASS' : 'FAIL'}</Badge>
                <span className="font-mono text-[10px] text-brand">{r.id}</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">{r.category}</p>
              <p className="text-xs text-foreground mt-1 leading-relaxed">{r.details}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
