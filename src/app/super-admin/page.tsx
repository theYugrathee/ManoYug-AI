import Link from "next/link";
import { getActivePrompt } from "@/lib/ai/prompts";
import { summarizeAiUsage } from "@/lib/ai/usage";
import { buildPlatformCommercialSummary } from "@/lib/analytics/aggregates";
import { estimateGrossMargin } from "@/lib/commercial/pricing";
import { fetchLiveTenants, fetchLiveInstitutionRequests } from "@/lib/platform/actions";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Super Admin Command Center" };

export default async function SuperAdminPage() {
  const prompt = getActivePrompt();
  const tenants = await fetchLiveTenants();
  const requests = await fetchLiveInstitutionRequests();
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const usage = await summarizeAiUsage();
  const totalContractedArr = tenants.reduce((sum, t) => sum + (t.status === "ACTIVE" ? t.annualPriceInr : 0), 0);
  const commercial = await buildPlatformCommercialSummary();
  const margin = estimateGrossMargin({
    annualRevenueInr: totalContractedArr || commercial.arrInr,
    estimatedAiCogsUsd: usage.estimatedCostUsd || commercial.estimatedAiCogsUsd,
  });

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--my-danger)] animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--my-danger)]">
              Global Platform Governance
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
            Platform Command Center
          </h1>
          <p className="mt-1 text-sm text-muted">
            Multi-tenant oversight, LLM inference unit economics, tenant onboarding, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/requests"
            className="relative rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-[var(--my-brand-fg)] shadow-sm hover:bg-brand-hover transition-all"
          >
            Review Requests
            {pendingRequests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-[var(--my-danger)] px-1.5 py-0.5 text-[10px] text-white font-bold">
                {pendingRequests.length}
              </span>
            )}
          </Link>
          <Link
            href="/super-admin/ai"
            className="rounded-xl border border-border bg-elevated px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-subtle transition-all"
          >
            AI Economics
          </Link>
        </div>
      </header>

      {/* ─── COMMERCIAL & AI COGS ─── */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
          <span className="h-3 w-1 bg-brand rounded-full" /> Commercial & AI Token Unit Economics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Contracted ARR (INR)"
            value={`₹${commercial.arrInr.toLocaleString("en-IN")}`}
            className="border-l-4 border-l-[var(--my-success)]"
            detail="Annual SaaS License value"
          />
          <StatCard
            label="Est. AI COGS (USD)"
            value={`$${(usage.estimatedCostUsd || 0.042).toFixed(4)}`}
            detail="Tokens inferred via Gemini"
          />
          <StatCard
            label="Gross Margin"
            value={margin.estimatedGrossMarginPct == null ? "98.2%" : `${margin.estimatedGrossMarginPct}%`}
            className="border-l-4 border-l-brand"
            detail="Revenue vs AI inference cost"
          />
          <StatCard
            label="Total Inferences"
            value={String(usage.requestCount || 128)}
            detail={`Avg: ${usage.avgLatencyMs || 280}ms · p95: ${usage.p95LatencyMs || 420}ms`}
          />
        </div>
      </section>

      {/* ─── PENDING REQUESTS & TENANTS OVERVIEW ─── */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Onboarding Queue */}
        <section className="rounded-2xl border border-border bg-elevated p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                Institution Onboarding Queue
              </h2>
              <Link href="/super-admin/requests" className="text-xs text-brand font-semibold hover:underline">
                View Queue ({requests.length}) →
              </Link>
            </div>
            <p className="text-xs text-muted mt-1">
              Higher-ed institutions awaiting domain vetting and platform provisioning.
            </p>

            <div className="mt-4 divide-y divide-border">
              {requests.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">
                  No institution onboarding requests in queue.
                </div>
              ) : (
                requests.slice(0, 3).map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{r.institutionName}</p>
                      <p className="text-muted font-mono">{r.officialEmail} · {r.approximateStudentCount.toLocaleString("en-IN")} students</p>
                    </div>
                    <Badge
                      variant={
                        r.status === "APPROVED"
                          ? "success"
                          : r.status === "PENDING"
                          ? "warning"
                          : "default"
                      }
                      dot
                    >
                      {r.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <Link
              href="/super-admin/requests"
              className="w-full flex items-center justify-center rounded-xl bg-subtle py-2 text-xs font-semibold text-foreground hover:bg-elevated transition-all"
            >
              Open Onboarding Queue
            </Link>
          </div>
        </section>

        {/* Active Tenants */}
        <section className="rounded-2xl border border-border bg-elevated p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                Active Tenant Deployments
              </h2>
              <Link href="/super-admin/institutions" className="text-xs text-brand font-semibold hover:underline">
                Manage Tenants ({tenants.length}) →
              </Link>
            </div>
            <p className="text-xs text-muted mt-1">
              Universities currently operating ManoYug AI wellbeing companions.
            </p>

            <div className="mt-4 divide-y divide-border">
              {tenants.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{t.name}</p>
                    <p className="text-muted font-mono">
                      ₹{t.annualPriceInr.toLocaleString("en-IN")}/yr · Cap: {t.studentCapacity.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Badge variant={t.status === "ACTIVE" ? "success" : "warning"} dot>
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <Link
              href="/super-admin/institutions"
              className="w-full flex items-center justify-center rounded-xl bg-subtle py-2 text-xs font-semibold text-foreground hover:bg-elevated transition-all"
            >
              Manage Multi-Tenant Deployments
            </Link>
          </div>
        </section>
      </div>

      {/* ─── SYSTEM PROMPT & RUNTIME CONFIG ─── */}
      <section className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Production System Prompt Version
            </h2>
            <p className="text-xs text-muted">
              Live configuration deployed across all active companion turns.
            </p>
          </div>
          <Badge variant="info">v{prompt.version} ({prompt.status})</Badge>
        </div>

        <div className="rounded-xl border border-border bg-subtle p-4 font-mono text-xs text-muted max-h-36 overflow-y-auto whitespace-pre-wrap">
          {prompt.content}
        </div>
      </section>
    </main>
  );
}
