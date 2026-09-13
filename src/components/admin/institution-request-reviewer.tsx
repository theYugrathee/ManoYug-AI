"use client";

import { useEffect, useState, useTransition } from "react";
import type { StoredInstitutionRequest } from "@/lib/store/memory";
import { reviewInstitutionRequestAction } from "@/lib/platform/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function InstitutionRequestReviewer({
  requests,
}: {
  requests: StoredInstitutionRequest[];
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [items, setItems] = useState<StoredInstitutionRequest[]>(requests);
  const [selected, setSelected] = useState<StoredInstitutionRequest | null>(
    requests[0] ?? null,
  );
  const [notes, setNotes] = useState("");
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(requests);
    setSelected((current) => current ? requests.find((request) => request.id === current.id) ?? current : requests[0] ?? null);
  }, [requests]);

  const filtered = items.filter(
    (r) => filter === "ALL" || r.status === filter,
  );

  function handleAction(status: "APPROVED" | "REJECTED" | "NEEDS_INFO") {
    if (!selected) return;
    startTransition(async () => {
      setActionError(null);
      const result = await reviewInstitutionRequestAction(selected.id, status, notes || undefined, status === "APPROVED" ? { code, adminEmail, adminPassword } : undefined);
      if (!result.ok) {
        setActionError(result.message ?? "Could not update this request.");
        return;
      }
      const next = { ...selected, status, notes: notes || selected.notes };
      setItems((current) => current.map((request) => request.id === next.id ? next : request));
      setSelected(next);
      setNotes("");
    });
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {["ALL", "PENDING", "APPROVED", "NEEDS_INFO", "REJECTED"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === tab
                ? "bg-brand text-[var(--my-brand-fg)]"
                : "text-muted hover:bg-subtle hover:text-foreground"
            }`}
          >
            {tab} ({items.filter((r) => tab === "ALL" || r.status === tab).length})
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-elevated p-8 text-center text-xs text-muted">
              {items.length === 0 ? "No institute requests yet." : "No requests in this view."}
            </div>
          ) : (
            filtered.map((r) => {
              const isSelected = selected?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelected(r);
                    setNotes(r.notes ?? "");
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-brand bg-subtle shadow-sm"
                      : "border-border bg-elevated hover:bg-subtle/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-sm leading-tight">
                      {r.institutionName}
                    </h3>
                    <Badge
                      variant={
                        r.status === "APPROVED"
                          ? "success"
                          : r.status === "PENDING"
                          ? "warning"
                          : r.status === "NEEDS_INFO"
                          ? "info"
                          : "danger"
                      }
                      dot
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">{r.city}, {r.state}</p>
                  <p className="mt-2 text-[11px] font-mono text-muted">
                    {r.approximateStudentCount.toLocaleString("en-IN")} students · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Request Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-2xl border border-border bg-elevated p-6 space-y-6 shadow-sm">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selected.institutionName}
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    {selected.institutionType} · {selected.city}, {selected.state}
                  </p>
                </div>
                <Badge
                  variant={
                    selected.status === "APPROVED"
                      ? "success"
                      : selected.status === "PENDING"
                      ? "warning"
                      : selected.status === "NEEDS_INFO"
                      ? "info"
                      : "danger"
                  }
                  dot
                >
                  {selected.status}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-muted block">Official Email</span>
                  <span className="font-mono font-medium text-foreground">{selected.officialEmail}</span>
                </div>
                <div>
                  <span className="text-muted block">Contact Phone</span>
                  <span className="font-mono font-medium text-foreground">{selected.contactPhone}</span>
                </div>
                <div>
                  <span className="text-muted block">Contact Person</span>
                  <span className="font-medium text-foreground">{selected.contactPersonName}</span>
                </div>
                <div>
                  <span className="text-muted block">Designation</span>
                  <span className="font-medium text-foreground">{selected.contactPersonDesignation}</span>
                </div>
                <div>
                  <span className="text-muted block">Estimated Students</span>
                  <span className="font-medium text-foreground">{selected.approximateStudentCount.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-muted block">Website</span>
                  <span className="font-medium text-brand">{selected.website || "—"}</span>
                </div>
              </div>

              {selected.notes ? (
                <div className="rounded-xl border border-border bg-subtle p-3.5 text-xs">
                  <span className="font-bold text-foreground block mb-1">Applicant Notes / Requirements:</span>
                  <p className="text-muted leading-relaxed">{selected.notes}</p>
                </div>
              ) : null}

              {/* Reviewer Action Form */}
              <div className="border-t border-border pt-4 space-y-3">
                <label htmlFor="admin-notes" className="text-xs font-bold text-foreground block">
                  Reviewer Notes / Verification Checklist
                </label>
                <textarea
                  id="admin-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record domain verification results, pilot term agreements, or required docs..."
                  className="w-full rounded-xl border border-border bg-subtle px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                  disabled={pending}
                />

                {selected.status === "PENDING" && (
                  <div className="grid gap-3 rounded-xl border border-border bg-subtle p-4 sm:grid-cols-3">
                    <label className="text-xs font-semibold text-foreground">Institute code<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BMU-2026" className="mt-1 w-full rounded-lg border border-border bg-elevated px-2.5 py-2 font-mono text-xs" /></label>
                    <label className="text-xs font-semibold text-foreground">Admin email<input value={adminEmail || selected.officialEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg border border-border bg-elevated px-2.5 py-2 text-xs" /></label>
                    <label className="text-xs font-semibold text-foreground">Admin password<input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} type="password" placeholder="Set temporary password" className="mt-1 w-full rounded-lg border border-border bg-elevated px-2.5 py-2 text-xs" /></label>
                  </div>
                )}
                {actionError ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{actionError}</p> : null}

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    loading={pending}
                    onClick={() => handleAction("APPROVED")}
                    className="bg-[var(--my-success)] text-[var(--my-bg)] hover:opacity-90"
                  >
                    ✓ Approve & Provision Tenant
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    loading={pending}
                    onClick={() => handleAction("NEEDS_INFO")}
                  >
                    ? Request More Info
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    loading={pending}
                    onClick={() => handleAction("REJECTED")}
                  >
                    ✕ Reject Request
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-elevated p-12 text-center text-xs text-muted">
              Select an onboarding request to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
