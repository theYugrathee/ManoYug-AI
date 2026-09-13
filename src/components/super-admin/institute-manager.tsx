"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  createInstituteAction,
  toggleInstituteCodeAction,
  resetInstitutePasswordAction,
  deleteInstituteAction,
  permanentDeleteInstituteAction,
} from "@/lib/auth/actions";
import type { StoredTenant } from "@/lib/store/memory";

export function InstituteManager({ initialTenants }: { initialTenants: StoredTenant[] }) {
  const router = useRouter();
  const [tenants, setTenants] = useState<StoredTenant[]>(initialTenants);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Create Form State
  const [name, setName] = useState("");
  const [institutionType, setInstitutionType] = useState("University (State / Central)");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentCapacity, setStudentCapacity] = useState("5000");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("institutionType", institutionType);
    formData.append("city", city);
    formData.append("state", state);
    formData.append("code", code.trim().toUpperCase());
    formData.append("adminEmail", adminEmail.trim().toLowerCase());
    formData.append("password", password);
    formData.append("studentCapacity", studentCapacity);

    try {
      const res = await createInstituteAction(formData);
      if (!res.ok) {
        setMsg({ type: "danger", text: res.message });
        setLoading(false);
        return;
      }
      if (res.tenant) {
        setTenants((prev) => [res.tenant!, ...prev]);
      }
      setMsg({ type: "success", text: res.message });
      setShowCreateModal(false);
      // Reset fields
      setName("");
      setCode("");
      setAdminEmail("");
      setPassword("");
      router.refresh();
    } catch {
      setMsg({ type: "danger", text: "Failed to create institute." });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCode(id: string, currentStatus: boolean) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await toggleInstituteCodeAction(id, !currentStatus);
      if (res.ok) {
        setTenants((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isCodeActive: res.isCodeActive! } : t)),
        );
        setMsg({ type: "success", text: res.message });
        router.refresh();
      } else {
        setMsg({ type: "danger", text: res.message });
      }
    } catch {
      setMsg({ type: "danger", text: "Failed to update code status." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(id: string) {
    if (!newPassword || newPassword.length < 6) {
      setMsg({ type: "danger", text: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await resetInstitutePasswordAction(id, newPassword);
      if (res.ok) {
        setMsg({ type: "success", text: res.message });
        setResettingId(null);
        setNewPassword("");
        router.refresh();
      } else {
        setMsg({ type: "danger", text: res.message });
      }
    } catch {
      setMsg({ type: "danger", text: "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, instName: string) {
    if (!confirm(`Are you sure you want to safely revoke access for "${instName}"? Existing data will be archived safely without orphaning records.`)) {
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await deleteInstituteAction(id);
      if (res.ok) {
        setTenants((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "ARCHIVED", isCodeActive: false } : t)),
        );
        setMsg({ type: "success", text: res.message });
        router.refresh();
      } else {
        setMsg({ type: "danger", text: res.message });
      }
    } catch {
      setMsg({ type: "danger", text: "Failed to revoke institute access." });
    } finally {
      setLoading(false);
    }
  }

  async function handlePermanentDelete(id: string, instName: string) {
    const confirmation = prompt(
      `⚠️ WARNING: PERMANENT DELETION\n\nYou are about to PERMANENTLY DELETE "${instName}" and all associated student rosters, codes, and credentials from the platform.\n\nType DELETE to confirm:`,
    );
    if (confirmation !== "DELETE") {
      if (confirmation !== null) {
        setMsg({ type: "danger", text: "Deletion cancelled: confirmation text did not match 'DELETE'." });
      }
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      const res = await permanentDeleteInstituteAction(id);
      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== id));
        setMsg({ type: "success", text: res.message });
        router.refresh();
      } else {
        setMsg({ type: "danger", text: "Failed to permanently delete institute." });
      }
    } catch {
      setMsg({ type: "danger", text: "An error occurred while deleting the institute." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {msg ? (
        <Alert tone={msg.type === "success" ? "success" : "danger"} role="alert">
          {msg.text}
        </Alert>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Institutes & Unique Access Codes ({tenants.length})
          </h2>
          <p className="text-xs text-muted">
            Super Admin controls unique code generation, tenant capacity, and institute credentials.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl bg-brand font-semibold text-xs shadow-sm hover:bg-brand-hover"
        >
          + Provision New Institute & Code
        </Button>
      </div>

      {/* ─── CREATE INSTITUTE MODAL ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Provision New Institute</h3>
                <p className="text-xs text-muted">Creates isolated tenant partition & generated institute code.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-foreground text-sm p-1 rounded-lg hover:bg-subtle"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Institution Name *</label>
                <Input
                  required
                  placeholder="e.g. Indian Institute of Technology, Bombay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Institution Type *</label>
                  <Input
                    required
                    placeholder="e.g. Central University"
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Student Capacity *</label>
                  <Input
                    type="number"
                    required
                    min={50}
                    max={500000}
                    value={studentCapacity}
                    onChange={(e) => setStudentCapacity(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">City *</label>
                  <Input
                    required
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">State *</label>
                  <Input
                    required
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Unique Institute Code Section */}
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">Unique Institute Code *</label>
                  <span className="text-[11px] text-muted">Manual assignment</span>
                </div>
                <Input
                  required
                  placeholder="e.g. IITD-001 or DU-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                  disabled={loading}
                  className="font-mono uppercase font-bold text-brand tracking-wider bg-background"
                />
                <p className="text-[11px] text-muted">
                  Assign a permanent, unique uppercase code. Students and institute staff will use this code to access the platform.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Institute Admin Email *</label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. admin@iitb.ac.in"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Initial Admin Password *</label>
                  <Input
                    type="password"
                    required
                    placeholder="At least 10 chars with numbers"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-brand text-xs font-semibold">
                  {loading ? "Creating..." : "Save & Provision Institute →"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── RESET PASSWORD DIALOG ─── */}
      {resettingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-elevated p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-foreground text-sm">Reset Institute Admin Password</h3>
            <p className="text-xs text-muted">
              Enter a new secure password for this institute administrator account.
            </p>
            <Input
              type="password"
              placeholder="Enter new password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setResettingId(null);
                  setNewPassword("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleResetPassword(resettingId)}
                disabled={loading || !newPassword}
                className="bg-brand font-semibold text-xs"
              >
                {loading ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTITUTIONS TABLE ─── */}
      <div className="rounded-2xl border border-border bg-elevated overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-subtle text-muted uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Institution & Location</th>
                <th className="px-5 py-3.5">Institute Code</th>
                <th className="px-5 py-3.5">Code Status</th>
                <th className="px-5 py-3.5">Admin Email</th>
                <th className="px-5 py-3.5">Capacity & Enrolled</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted">
                    <p className="font-semibold text-foreground text-sm mb-1">No institutions currently provisioned</p>
                    <p className="text-muted text-xs mb-3">Click &quot;+ Provision New Institute & Code&quot; to add a college or approve an onboarding request.</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                      className="bg-brand text-xs font-semibold"
                    >
                      + Provision First Institute
                    </Button>
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-subtle/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground text-sm">{t.name}</p>
                      <p className="text-muted text-[11px]">{t.city ?? "India"}, {t.state ?? "IN"} · {t.institutionType ?? "University"}</p>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-brand text-xs">
                      <span className="bg-brand/10 px-2.5 py-1 rounded-md border border-brand/20">
                        {t.code ?? "NO_CODE"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={t.isCodeActive ? "success" : "danger"} dot>
                        {t.isCodeActive ? "Code Active" : "Code Disabled"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-foreground font-mono">
                      {t.adminEmail ?? t.officialEmail ?? "—"}
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <span className="text-brand font-bold">{t.activeStudents.toLocaleString("en-IN")}</span> /{" "}
                      <span className="text-muted">{t.studentCapacity.toLocaleString("en-IN")}</span>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={t.status === "ACTIVE" ? "success" : "warning"}>
                        {t.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleCode(t.id, t.isCodeActive)}
                          disabled={loading}
                          className="text-[11px] h-7 px-2.5"
                          title={t.isCodeActive ? "Disable code (blocks student registration)" : "Enable code"}
                        >
                          {t.isCodeActive ? "Disable Code" : "Enable Code"}
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setResettingId(t.id)}
                          disabled={loading}
                          className="text-[11px] h-7 px-2.5"
                          title="Reset Institute Password"
                        >
                          Reset PW
                        </Button>

                        {t.status === "ACTIVE" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDelete(t.id, t.name)}
                            disabled={loading}
                            className="text-[11px] h-7 px-2 text-amber-400 hover:bg-amber-400/10"
                            title="Safely archive/revoke institute access"
                          >
                            Revoke
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handlePermanentDelete(t.id, t.name)}
                          disabled={loading}
                          className="text-[11px] h-7 px-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30"
                          title="Permanently erase institute and all student data"
                        >
                          Delete 🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
