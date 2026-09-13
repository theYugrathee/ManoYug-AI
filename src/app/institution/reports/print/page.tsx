import { buildInstitutionReportCsv } from "@/lib/institution/resources";
import { PrintButton } from "@/components/institution/print-button";
import { requireInstitutionAdminSession } from "@/lib/auth/session";

export const metadata = { title: "Campus Compliance & Institutional Report (Printable)" };

/** Print-friendly HTML report (use browser Print → PDF). */
export default async function InstitutionReportPrintPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const csv = await buildInstitutionReportCsv(institutionId);
  const rows = csv
    .split("\n")
    .slice(1)
    .map((line) => line.split(","))
    .filter((r) => r.length >= 2);

  return (
    <main className="mx-auto max-w-4xl bg-white px-10 py-12 text-black print:px-0 print:py-4">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
            ManoYug AI · Campus Governance & NAAC / NIRF Compliance
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-neutral-900">{session.institutionName}</h1>
          <p className="text-xs text-neutral-600 mt-1">
            Unique Campus Code: <span className="font-mono font-bold text-neutral-900">{session.institutionCode}</span> · Tenant Isolation ID: <span className="font-mono text-[11px] text-neutral-500">{institutionId}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
            DPDP Act 2023 Compliant
          </span>
          <p className="text-[11px] text-neutral-400 mt-1">Audit Verified</p>
        </div>
      </div>

      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4 mb-8 text-xs text-neutral-700 leading-relaxed">
        <strong>Privacy Disclosure:</strong> This document certifies aggregate institutional utilization and deterministic safety escalations. In accordance with the Digital Personal Data Protection (DPDP) Act of India and Zero-Inspection Architecture, individual student chat sessions and private journal entries are mathematically isolated and never decrypted or exported for administrative review.
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b-2 border-neutral-800 text-left uppercase font-mono tracking-wider text-neutral-600">
            <th className="py-2.5 font-bold">Metric Dimension</th>
            <th className="py-2.5 font-bold">Recorded Campus Metric</th>
            <th className="py-2.5 font-bold">Operational Scope & Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {rows.map((r, idx) => (
            <tr key={idx} className="hover:bg-neutral-50">
              <td className="py-3 font-semibold text-neutral-900">{r[0]?.replace(/^'/, "")}</td>
              <td className="py-3 font-mono font-bold text-emerald-700 text-sm">{r[1]?.replace(/^'/, "")}</td>
              <td className="py-3 text-neutral-600">{r[2]?.replace(/^'/, "")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 border-t pt-6 text-[11px] text-neutral-500 flex items-center justify-between">
        <p>Report Generated: {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
        <PrintButton />
      </div>
    </main>
  );
}
