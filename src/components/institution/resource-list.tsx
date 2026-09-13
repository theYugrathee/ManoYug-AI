"use client";

import { useState, useTransition } from "react";
import type { InstitutionResource } from "@/lib/institution/resources";
import { deleteInstitutionResourceAction } from "@/lib/institution/actions";
import { Badge } from "@/components/ui/badge";

export function ResourceList({ initialResources }: { initialResources: InstitutionResource[] }) {
  const [resources, setResources] = useState<InstitutionResource[]>(initialResources);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (initialResources !== resources && initialResources.length !== resources.length) {
    setResources(initialResources);
  }

  const handleDelete = (r: InstitutionResource) => {
    if (!window.confirm(`Are you sure you want to remove "${r.name}" from your campus resources?`)) {
      return;
    }
    setDeletingId(r.id);
    startTransition(async () => {
      const res = await deleteInstitutionResourceAction(r.id);
      if (res.ok) {
        setResources((prev) => prev.filter((item) => item.id !== r.id));
      } else {
        alert(res.message);
      }
      setDeletingId(null);
    });
  };

  if (resources.length === 0) {
    return (
      <div className="rounded-xl border border-border border-dashed bg-transparent p-12 text-center text-sm text-muted">
        <p className="font-semibold text-foreground mb-1">No custom campus resources configured yet.</p>
        <p className="text-xs max-w-sm mx-auto">
          Use the form on the right to add internal counselling lines, medical officer contacts, or hostel wardens.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {resources.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-border bg-subtle p-5 hover:border-[var(--my-border-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="font-bold text-foreground">{r.name}</p>
              <Badge variant={r.status === "ACTIVE" ? "success" : "warning"} dot>
                {r.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-sm font-mono text-brand flex items-center gap-2">
              <span className="text-muted font-sans text-xs uppercase tracking-wider">{r.resourceType}</span>
              <span className="text-muted/50">•</span>
              {r.contactValue}
            </p>
          </div>

          <button
            type="button"
            disabled={deletingId === r.id}
            onClick={() => handleDelete(r)}
            className="rounded-lg border border-[var(--my-danger)]/30 bg-[var(--my-danger)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--my-danger)] hover:bg-[var(--my-danger)] hover:text-white transition-colors self-end sm:self-center disabled:opacity-50"
          >
            {deletingId === r.id ? "Removing…" : "Remove"}
          </button>
        </li>
      ))}
    </ul>
  );
}
