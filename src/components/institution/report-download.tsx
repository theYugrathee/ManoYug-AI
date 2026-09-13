"use client";

import { useState, useTransition } from "react";
import { getInstitutionReportCsvAction } from "@/lib/institution/actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ReportDownload() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {error ? (
        <Alert tone="danger" role="alert">
          {error}
        </Alert>
      ) : null}

      <div className="rounded-xl border border-border bg-subtle p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Standard Export</h3>
          <p className="text-xs text-muted mt-1 max-w-sm">
            UTF-8 encoded CSV. Fields are automatically escaped to prevent formula injection attacks in Excel.
          </p>
        </div>

        <Button
          type="button"
          loading={pending}
          onClick={() => {
            startTransition(async () => {
              try {
                const csv = await getInstitutionReportCsvAction();
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `manoyug-institution-report-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                setError("Export failed. Please try again or contact support.");
              }
            });
          }}
          className="w-full sm:w-auto"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download CSV
        </Button>
      </div>

      <p className="text-xs text-muted flex items-center gap-1.5 mt-2 opacity-70">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        Private conversation content is cryptographically isolated and never included in exports.
      </p>
    </div>
  );
}
