"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateStudentSupportRequestStatusAction,
} from "@/lib/institution/actions";
import type {
  InstitutionSafetyAlertItem,
  InstitutionSupportRequestItem,
} from "@/lib/data/platform";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InstitutionSupportInbox({
  supportRequests,
  safetyAlerts,
}: {
  supportRequests: InstitutionSupportRequestItem[];
  safetyAlerts: InstitutionSafetyAlertItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateStatus(id: string, status: "ACKNOWLEDGED" | "CLOSED") {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateStudentSupportRequestStatusAction(id, status);
      setFeedback(result.message);
    });
  }

  return (
    <div className="space-y-8">
      {feedback ? (
        <div className="rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-foreground" role="status">
          {feedback}
        </div>
      ) : null}

      <section className="space-y-4" aria-labelledby="safety-alerts-heading">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="safety-alerts-heading" className="text-lg font-bold text-foreground">Safety alerts</h2>
            <p className="text-sm text-muted">High-risk signals requiring prompt, human follow-up. Private conversation text is never shown here.</p>
          </div>
          {safetyAlerts.length > 0 ? <Badge variant="danger" dot>{safetyAlerts.length} active alert{safetyAlerts.length === 1 ? "" : "s"}</Badge> : null}
        </div>

        {safetyAlerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-elevated p-6 text-sm text-muted">No active safety alerts for this institute.</div>
        ) : (
          <div className="space-y-3">
            {safetyAlerts.map((alert) => (
              <article key={alert.id} className="rounded-2xl border border-[var(--my-danger)]/40 bg-[var(--my-danger-bg)] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="danger">{alert.state === "IMMINENT" ? "IMMINENT" : "RED"}</Badge>
                      <a className="font-semibold text-foreground underline-offset-4 hover:underline" href={`mailto:${alert.studentEmail}`}>
                        {alert.studentEmail}
                      </a>
                      {alert.studentName ? <span className="text-sm text-muted">· {alert.studentName}</span> : null}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground">{alert.message}</p>
                    <p className="mt-2 text-xs text-muted">Detected {formatDate(alert.createdAt)}</p>
                  </div>
                  <a href={`mailto:${alert.studentEmail}`} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--my-danger)] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90">
                    Contact student
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="support-requests-heading">
        <div>
          <h2 id="support-requests-heading" className="text-lg font-bold text-foreground">Student support requests</h2>
          <p className="text-sm text-muted">Callback requests submitted from the student Support & Resources page.</p>
        </div>

        {supportRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-elevated p-6 text-sm text-muted">No student support requests yet.</div>
        ) : (
          <div className="space-y-3">
            {supportRequests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-border bg-elevated p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <a className="font-semibold text-foreground underline-offset-4 hover:underline" href={`mailto:${request.studentEmail}`}>
                        {request.studentEmail}
                      </a>
                      {request.studentName ? <span className="text-sm text-muted">· {request.studentName}</span> : null}
                      <Badge variant={request.status === "NEW" ? "warning" : request.status === "ACKNOWLEDGED" ? "info" : "success"}>{request.status}</Badge>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{request.note}</p>
                    <p className="mt-2 text-xs text-muted">Submitted {formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {request.status === "NEW" ? <Button size="sm" variant="secondary" disabled={isPending} onClick={() => updateStatus(request.id, "ACKNOWLEDGED")}>Acknowledge</Button> : null}
                    {request.status !== "CLOSED" ? <Button size="sm" variant="outline" disabled={isPending} onClick={() => updateStatus(request.id, "CLOSED")}>Mark closed</Button> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
