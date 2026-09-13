import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Data retention" };

const CLASSES = [
  { name: "Eligibility Roster", default: "Contract + 1 year", category: "Core Operations" },
  { name: "Account Identity", default: "Account lifetime + 90 days", category: "Core Operations" },
  { name: "Conversation Content", default: "Configurable / Minimized", category: "Sensitive" },
  { name: "Safety Events", default: "Longer retention for governance", category: "Sensitive" },
  { name: "Counsellor Notes", default: "Policy-bound / Restricted access", category: "Clinical" },
  { name: "Global Analytics", default: "Aggregates preferred", category: "Operational" },
  { name: "Audit Logs", default: "Extended / Immutable", category: "Compliance" },
  { name: "Billing Statements", default: "Statutory finance retention", category: "Compliance" },
] as const;

export default function DataRetentionPage() {
  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Compliance
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Data Retention Policies
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          We explicitly do not retain everything forever. Right-to-be-forgotten deletion workflows require authorization and generate immutable audit logs. The defaults below represent baseline engineering targets, not formal legal guarantees.
        </p>
      </header>

      <Alert tone="warning" className="mb-10 w-fit" title="Legal Governance">
        Formal legal counsel and DPO review is stringently required prior to finalizing binding production SLA commitments.
      </Alert>

      <section>
        <div className="rounded-2xl border border-border bg-elevated hidden sm:block">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-subtle text-xs uppercase tracking-wider text-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/3">Data Class</th>
                <th className="px-6 py-4 font-semibold w-1/4">Category</th>
                <th className="px-6 py-4 font-semibold w-full">Retention Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CLASSES.map((c) => (
                <tr key={c.name} className="hover:bg-subtle transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{c.name}</td>
                  <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">{c.category}</td>
                  <td className="px-6 py-4 text-brand font-mono text-xs">{c.default}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {CLASSES.map((c) => (
            <div key={c.name} className="rounded-xl border border-border bg-elevated p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-foreground text-sm">{c.name}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted bg-subtle px-2 py-0.5 rounded-md">{c.category}</span>
              </div>
              <p className="text-xs font-mono text-brand">{c.default}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
