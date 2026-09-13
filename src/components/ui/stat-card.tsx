import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
};

export function StatCard({ label, value, detail, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-all duration-150 hover:border-[#CBD5E1] hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] font-mono">{label}</p>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.positive !== false
                ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                : "bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]",
            )}
          >
            {trend.positive !== false ? "↑" : "↓"} {trend.value}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] font-display">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[#64748B] leading-relaxed">{detail}</p> : null}
    </div>
  );
}
