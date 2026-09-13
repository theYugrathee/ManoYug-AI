"use client";

import { useState, useTransition } from "react";
import type { StoredRosterRow } from "@/lib/store/memory";
import { deleteRosterStudentAction } from "@/lib/student/actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function StudentRosterTable({ initialStudents }: { initialStudents: StoredRosterRow[] }) {
  const [students, setStudents] = useState<StoredRosterRow[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Keep state synced when props change
  if (initialStudents !== students && initialStudents.length !== students.length) {
    setStudents(initialStudents);
  }

  const departments = Array.from(
    new Set(students.map((s) => s.department).filter(Boolean) as string[]),
  );

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.university_roll_no && s.university_roll_no.toLowerCase().includes(q));
    const matchDept = deptFilter === "ALL" || s.department === deptFilter;
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchQuery && matchDept && matchStatus;
  });

  const handleDelete = (student: StoredRosterRow) => {
    const identifier = student.email || student.phone || student.name || student.university_roll_no;
    if (!window.confirm(`Are you sure you want to remove ${identifier} from the campus roster? This will revoke their eligibility.`)) {
      return;
    }
    setDeletingId(student.id);
    startTransition(async () => {
      const res = await deleteRosterStudentAction(student.id);
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
      } else {
        alert(res.message);
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search by name, roll no, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-border bg-subtle px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-subtle px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl border border-border bg-elevated overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-subtle text-muted uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Grad Year</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    {students.length === 0
                      ? "No authorized students in this campus roster yet. Use the manual form above or upload a CSV to authorize students."
                      : "No students match the selected search filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-subtle/70">
                    <td className="px-4 py-3.5 font-mono font-medium text-foreground">
                      {s.university_roll_no || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {s.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted font-mono">{s.email || "—"}</td>
                    <td className="px-4 py-3.5 text-muted font-mono">{s.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-foreground">{s.department ?? "General"}</td>
                    <td className="px-4 py-3.5 text-muted font-mono">{s.graduation_year ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          s.status === "ACTIVE"
                            ? "success"
                            : s.status === "PENDING"
                            ? "warning"
                            : "default"
                        }
                        dot
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={deletingId === s.id}
                        onClick={() => handleDelete(s)}
                        className="rounded-lg border border-[var(--my-danger)]/30 bg-[var(--my-danger)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--my-danger)] hover:bg-[var(--my-danger)] hover:text-white transition-colors disabled:opacity-50"
                      >
                        {deletingId === s.id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 bg-subtle/50 flex items-center justify-between text-xs text-muted">
          <span>Showing {filtered.length} of {students.length} authorized students</span>
          <span className="font-mono">Encrypted Tenant Scope</span>
        </div>
      </div>
    </div>
  );
}

