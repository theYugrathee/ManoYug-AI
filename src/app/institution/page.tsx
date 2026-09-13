import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { getInstitutionDashboardData } from "@/lib/data/platform";

export const metadata = { title: "Institution Executive Overview" };

export default async function InstitutionOverviewPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const stats = await getInstitutionDashboardData(institutionId);
  const { tenant, eligibleCount, activeCount, activationRate, totalCheckins, safetyEventsCount, themes, avgMood } = stats;

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      {/* ─── HEADER ─── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-brand">
              Campus Administration
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
            {tenant?.name ?? session.institutionName ?? "Campus Wellbeing Operations"}
          </h1>
          <p className="text-sm text-muted mt-1">
            Real-time aggregate engagement and wellbeing infrastructure monitoring for <span className="font-mono text-foreground font-semibold">{tenant?.code || session.institutionCode}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/institution/students"
            className="rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-[var(--my-brand-fg)] shadow-sm hover:bg-brand-hover transition-all"
          >
            + Add / Remove Students
          </Link>
          <Link
            href="/institution/contacts"
            className="rounded-xl border border-border bg-elevated px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-subtle transition-all"
          >
            Campus Contacts
          </Link>
        </div>
      </header>

      {/* ─── METRIC CARDS ─── */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Eligible Students"
            value={eligibleCount.toLocaleString("en-IN")}
            detail={`Capacity: ${(tenant?.studentCapacity ?? 5000).toLocaleString("en-IN")}`}
          />
          <StatCard
            label="Activated Accounts"
            value={activeCount.toLocaleString("en-IN")}
            detail={`${activationRate}% onboarding completion`}
            className="border-l-4 border-l-brand"
          />
          <StatCard
            label="Wellbeing Check-ins"
            value={totalCheckins.toLocaleString("en-IN")}
            detail={avgMood ? `Avg Mood: ${avgMood} / 5.0` : "Awaiting student logs"}
          />
          <StatCard
            label="Safety Escalations"
            value={String(safetyEventsCount)}
            detail="Tele-MANAS & Campus Emergency Routed"
            className={safetyEventsCount > 0 ? "border-l-4 border-l-[var(--my-warning)]" : ""}
          />
        </div>
      </section>

      {/* ─── WELLBEING THEMES & INSIGHTS ─── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Aggregated Themes */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-elevated p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Reported Wellbeing Themes (Aggregated)
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Cohort-level sentiment analysis. Private conversations remain strictly inaccessible.
              </p>
            </div>
            <Link
              href="/institution/analytics"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Full Analytics →
            </Link>
          </div>

          {themes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-2">
              <p className="text-sm font-medium text-foreground">No student check-ins recorded yet for this campus.</p>
              <p className="text-xs text-muted max-w-md mx-auto">
                As students log reflections and check-ins under code <span className="font-mono text-brand">{tenant?.code || session.institutionCode}</span>, anonymized thematic trends will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {themes.map((t, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-foreground">{t.label}</span>
                    <span className="text-brand">{t.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        t.color === "brand"
                          ? "bg-brand"
                          : t.color === "accent"
                          ? "bg-[var(--my-accent)]"
                          : t.color === "info"
                          ? "bg-[var(--my-info)]"
                          : "bg-muted"
                      }`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-border bg-subtle p-4 text-xs text-muted flex items-start gap-3 mt-4">
                <span className="text-base">💡</span>
                <div>
                  <strong className="text-foreground">Campus Trend Note:</strong> Aggregated from {totalCheckins} verified student check-ins. Private conversation content is never decrypted or inspected.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Quick Operations Sidebar */}
        <section className="rounded-2xl border border-border bg-elevated p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Operational Status</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border text-xs">
                <span className="text-muted">AI Companion Status</span>
                <span className="text-[var(--my-success)] font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--my-success)]" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border text-xs">
                <span className="text-muted">Safety Layer Policy</span>
                <span className="font-mono text-foreground">Deterministic v2.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border text-xs">
                <span className="text-muted">Tele-MANAS Bridge</span>
                <span className="text-[var(--my-success)] font-semibold">Active (14416)</span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-muted">Privacy Compliance</span>
                <span className="text-brand font-semibold">DPDP Act India · Zero Chat Read</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <Link
              href="/institution/students"
              className="w-full flex items-center justify-center rounded-xl bg-subtle border border-border py-2 text-xs font-semibold text-foreground hover:bg-elevated transition-all"
            >
              Add / Remove Students
            </Link>
            <Link
              href="/institution/contacts"
              className="w-full flex items-center justify-center rounded-xl bg-subtle border border-border py-2 text-xs font-semibold text-foreground hover:bg-elevated transition-all"
            >
              Campus Support Directory
            </Link>
            <Link
              href="/institution/support"
              className="w-full flex items-center justify-center rounded-xl bg-subtle border border-border py-2 text-xs font-semibold text-foreground hover:bg-elevated transition-all"
            >
              Student Support & Safety Inbox
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
