"use client";

import { useState, useTransition } from "react";
import {
  previewRosterCsv,
  type RosterPreviewResult,
} from "@/lib/institution/csv-roster";
import { confirmRosterImportAction } from "@/lib/student/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card"; // Note: reusing our new component

export function RosterCsvImporter() {
  const [preview, setPreview] = useState<RosterPreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | null) {
    setError(null);
    setResult(null);
    setPreview(null);
    if (!file) return;
    if (file.size > 2_000_000) {
      setError("File is too large for client-side preview (limit ~2MB).");
      return;
    }
    const text = await file.text();
    setPreview(previewRosterCsv(text));
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-subtle p-8 transition-colors hover:border-brand hover:bg-brand-subtle group">
        <div className="pointer-events-none flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-elevated p-3 border border-border shadow-sm group-hover:bg-brand group-hover:text-[var(--my-brand-fg)] group-hover:border-brand transition-all">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground">Upload CSV File</h3>
          <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
            Only the <span className="font-mono text-xs text-foreground">email</span> column is required. Roll number, phone, name, batch, and department are optional.
          </p>
        </div>
        <input
          id="roster-csv"
          type="file"
          accept=".csv,text/csv"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          aria-label="Upload CSV File"
        />
      </div>

      {error ? <Alert tone="danger" role="alert">{error}</Alert> : null}
      {result ? <Alert tone="success">{result}</Alert> : null}

      {/* Preview Zone */}
      {preview ? (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Preview Report</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {preview.warnings.map((w, i) => (
            <Alert key={`warn-${i}`} tone="warning">{w}</Alert>
          ))}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Rows" value={preview.total} />
            <StatCard label="Accepted" value={preview.accepted} className="border-l-4 border-l-[var(--my-success)]" />
            <StatCard label="Rejected" value={preview.rejected} className={preview.rejected > 0 ? "border-l-4 border-l-[var(--my-danger)]" : ""} />
            <StatCard label="Duplicates" value={preview.duplicates} className={preview.duplicates > 0 ? "border-l-4 border-l-[var(--my-warning)]" : ""} />
          </div>

          <div className="rounded-xl border border-border bg-elevated overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="min-w-full text-left text-sm whitespace-nowrap hidden sm:table">
                <thead className="bg-subtle text-xs uppercase tracking-wider text-muted border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Row</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Roll Number</th>
                    <th className="px-4 py-3 font-semibold">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.rows.map((r) => (
                    <tr key={r.line} className="hover:bg-subtle transition-colors">
                      <td className="px-4 py-3 text-muted text-xs font-mono">{r.line}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{r.raw.email}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.raw.university_roll_no}</td>
                      <td className="px-4 py-3">
                        {r.ok ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[var(--my-success)] bg-[var(--my-success-bg)] border border-[var(--my-success)]/20 px-2 py-0.5 rounded-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--my-success)] block" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--my-danger)] bg-[var(--my-danger-bg)] border border-[var(--my-danger)]/20 px-2 py-1 rounded-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--my-danger)] block" /> {r.errors[0] ?? "Invalid schema"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-subtle border-t border-border p-4 flex justify-end">
              <Button
                type="button"
                loading={pending}
                disabled={preview.accepted === 0}
                onClick={() => {
                  startTransition(async () => {
                    const res = await confirmRosterImportAction(preview);
                    if (res.ok) {
                      setResult(res.message);
                      setPreview(null);
                    } else {
                      setError(res.message);
                    }
                  });
                }}
              >
                Confirm Import ({preview.accepted} rows)
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
