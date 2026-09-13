import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: string;
};

const icons: Record<AlertTone, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  danger: "✕",
};

const toneClass: Record<AlertTone, string> = {
  info: "border-[var(--my-info)]/30 bg-[var(--my-info-bg)] text-[var(--my-info)]",
  success:
    "border-[var(--my-success)]/30 bg-[var(--my-success-bg)] text-[var(--my-success)]",
  warning:
    "border-[var(--my-warning)]/30 bg-[var(--my-warning-bg)] text-[var(--my-warning)]",
  danger:
    "border-[var(--my-danger)]/30 bg-[var(--my-danger-bg)] text-[var(--my-danger)]",
};

export function Alert({
  className,
  tone = "info",
  title,
  children,
  role = "status",
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      <span className="mt-0.5 flex-shrink-0 text-base" aria-hidden="true">
        {icons[tone]}
      </span>
      <div className="flex-1">
        {title ? <p className="font-semibold text-foreground">{title}</p> : null}
        <div className={title ? "mt-1 text-muted" : undefined}>{children}</div>
      </div>
    </div>
  );
}
