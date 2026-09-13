import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const variantClass: Record<BadgeVariant, string> = {
  default: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
  success: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  warning: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  danger: "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]",
  info: "bg-[#EFF6FF] text-[#0284C7] border-[#BFDBFE]",
};

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        variantClass[variant],
        className,
      )}
    >
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}
