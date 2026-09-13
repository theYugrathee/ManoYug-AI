import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { getInstitutionDashboardData } from "@/lib/data/platform";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Wellbeing Themes & Analytics — Campus Operations" };

export default async function InstitutionAnalyticsPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const snap = await getInstitutionDashboardData(institutionId);
  const tenant = snap.tenant;

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            Aggregated Analytics
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
          Wellbeing Themes & Analytics
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Real-time aggregated engagement and wellbeing trends for <span className="font-semibold text-foreground font-display">{tenant?.name || session.institutionName}</span> ({tenant?.code || session.institutionCode}). Private student conversations are cryptographically excluded from all analytical views.
        </p>
      </header>

      <Alert tone="info" title="Zero-Inspection Privacy & Anonymity Guarantee">
        All wellbeing metrics represent voluntary, student-reported check-ins. Cohort cuts below {snap.minCohort} records are mathematically suppressed to prevent dean or counselor re-identification.
      </Alert>

      {snap.suppressed.length > 0 ? (
        <Alert tone="warning" title="Privacy Suppression Active">
          Certain fine-grained metrics were suppressed to protect student anonymity because fewer than {snap.minCohort} check-ins are currently recorded.
        </Alert>
      ) : null}

      {/* ─── 1. CORE OPERATIONAL KPIS ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-brand rounded-full"></div>
          <h2 className="text-base font-bold text-foreground">Campus Adoption & Engagement</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Authorized Students" value={snap.eligibleStudents} detail={`Campus Code: ${tenant?.code || session.institutionCode}`} />
          <StatCard label="Active Accounts" value={snap.activatedAccounts} detail={`${snap.activationRate ?? 0}% onboarding rate`} className="border-l-4 border-l-brand" />
          <StatCard label="Total Check-ins Logged" value={snap.checkins} detail={`${snap.cadence.daily} daily · ${snap.cadence.weekly} weekly`} />
          <StatCard label="Private AI Conversations" value={snap.conversations} detail="100% Zero Inspection" />
        </div>
      </section>

      {/* ─── 2. CLINICAL & SAFETY ROUTING ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-[var(--my-warning)] rounded-full"></div>
          <h2 className="text-base font-bold text-foreground">Clinical & Safety Routing</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Human Support Cases" value={snap.humanSupportCases} detail="Student 'Talk to a Human' taps" />
          <StatCard
            label="System Safety Escalations"
            value={snap.safetyEscalations}
            detail="Deterministic Tele-MANAS triggers"
            className={snap.safetyEscalations > 0 ? "border-l-4 border-l-[var(--my-danger)]" : ""}
          />
          <div className="sm:col-span-2 rounded-2xl border border-border bg-elevated p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Cohort Average Mood</span>
              <Badge variant="info">Student-Reported</Badge>
            </div>
            <div className="my-2 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-foreground font-display">
                {snap.avgMoodStudentReported == null ? "—" : snap.avgMoodStudentReported}
              </span>
              <span className="text-xs text-muted">out of 5.0 rating scale</span>
            </div>
            <p className="text-xs text-muted">
              {snap.checkins === 0
                ? "No student check-ins recorded yet."
                : `Calculated across ${snap.checkins} student check-in submissions.`}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. MOOD SPECTRUM & PRESSURE FACTORS ─── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mood Distribution Card */}
        <section className="rounded-2xl border border-border bg-elevated p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Reported Mood Distribution</h3>
            <p className="text-xs text-muted mt-0.5">Rating scale from 1 (Severe Distress) to 5 (Thriving).</p>
          </div>

          <div className="space-y-3">
            {snap.moodDistribution.map((m) => {
              const moodLabels = ["Severe Distress", "Struggling", "Neutral / Coping", "Positive", "Thriving"];
              return (
                <div key={m.score} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Level {m.score} · {moodLabels[m.score - 1]}
                    </span>
                    <span className="font-mono text-brand font-semibold">
                      {m.count} logs ({m.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.score <= 2 ? "bg-[var(--my-danger)]" : m.score === 3 ? "bg-[var(--my-warning)]" : "bg-brand"
                      }`}
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Wellbeing Pressure Dimensions */}
        <section className="rounded-2xl border border-border bg-elevated p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Pressure & Coping Dimensions</h3>
            <p className="text-xs text-muted mt-0.5">Average scores (1 = optimal, 5 = high distress/pressure).</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-foreground">Academic & Exam Pressure</span>
                <span className="font-mono text-brand font-semibold">
                  {snap.pressureAverages.academic ? `${snap.pressureAverages.academic} / 5.0` : "—"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-subtle overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full"
                  style={{ width: `${((snap.pressureAverages.academic ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-foreground">Sleep Deprivation & Rest Deficit</span>
                <span className="font-mono text-[var(--my-accent)] font-semibold">
                  {snap.pressureAverages.sleep ? `${snap.pressureAverages.sleep} / 5.0` : "—"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-subtle overflow-hidden">
                <div
                  className="h-full bg-[var(--my-accent)] rounded-full"
                  style={{ width: `${((snap.pressureAverages.sleep ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-foreground">Energy Depletion & Fatigue</span>
                <span className="font-mono text-[var(--my-info)] font-semibold">
                  {snap.pressureAverages.energy ? `${snap.pressureAverages.energy} / 5.0` : "—"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-subtle overflow-hidden">
                <div
                  className="h-full bg-[var(--my-info)] rounded-full"
                  style={{ width: `${((snap.pressureAverages.energy ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-foreground">Social Isolation & Homesickness</span>
                <span className="font-mono text-muted font-semibold">
                  {snap.pressureAverages.social ? `${snap.pressureAverages.social} / 5.0` : "—"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-subtle overflow-hidden">
                <div
                  className="h-full bg-muted rounded-full"
                  style={{ width: `${((snap.pressureAverages.social ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
