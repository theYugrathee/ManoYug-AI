import { summarizeAiUsage } from "@/lib/ai/usage";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "AI Model Economics & Latency" };

export default async function SuperAdminAiPage() {
  const usage = await summarizeAiUsage();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Inference Telemetry
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AI Model Economics & Latency
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Real-time unit cost tracking, token consumption metrics, and inference latency percentiles across Gemini provider integrations.
        </p>
      </header>

      {/* ─── METRIC CARDS ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Inferences"
          value={String(usage.requestCount)}
          detail={usage.requestCount === 0 ? "No turns recorded yet" : "Live student companion turns"}
        />
        <StatCard
          label="Est. Cumulative COGS"
          value={`$${usage.estimatedCostUsd.toFixed(4)}`}
          className="border-l-4 border-l-brand"
          detail="Gemini API token costs"
        />
        <StatCard
          label="Average Turn Latency"
          value={usage.requestCount === 0 ? "—" : `${usage.avgLatencyMs} ms`}
          detail={usage.requestCount === 0 ? "Awaiting inference calls" : `p95: ${usage.p95LatencyMs} ms`}
        />
        <StatCard
          label="Total Tokens Consumed"
          value={(usage.totalInputTokens + usage.totalOutputTokens).toLocaleString()}
          detail={`Input: ${usage.totalInputTokens.toLocaleString()} · Output: ${usage.totalOutputTokens.toLocaleString()}`}
        />
      </div>

      {/* ─── MODEL BREAKDOWN ─── */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">Active Model Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-subtle border border-border">
              <div>
                <p className="font-bold text-foreground text-xs">gemini-2.5-flash (Configured Default)</p>
                <p className="text-muted text-[11px]">Primary student wellbeing conversational provider</p>
              </div>
              <Badge variant="success" dot>Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-subtle border border-border">
              <div>
                <p className="font-bold text-foreground text-xs">Deterministic Safety Engine (Local Precheck)</p>
                <p className="text-muted text-[11px]">Regex & signal classification (0 token cost)</p>
              </div>
              <Badge variant="info">Zero Latency</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">Cost Safeguards</h2>
          <ul className="text-xs text-muted space-y-2.5">
            <li className="flex items-center gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>Per-student turn rate limiter active (Max 60 turns / hour)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>Crisis and elevated danger queries short-circuit model generation (saves COGS)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>Rolling 12-message history window prevents prompt bloat</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
