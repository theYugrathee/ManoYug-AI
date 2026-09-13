import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "icon";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0F172A] text-white font-medium hover:bg-[#1E293B] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all",
  secondary:
    "border border-[#E2E8F0] bg-white text-[#0F172A] font-medium hover:bg-[#F8FAFC] hover:border-[#CBD5E1] active:scale-[0.99] disabled:opacity-50 shadow-xs transition-all",
  outline:
    "border border-[#E2E8F0] bg-transparent text-[#0F172A] font-medium hover:bg-[#F8FAFC] hover:border-[#CBD5E1] active:scale-[0.99] disabled:opacity-50 transition-all",
  ghost:
    "text-[#64748B] font-medium hover:text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-50 transition-colors",
  danger:
    "bg-[#E11D48] text-white font-medium hover:bg-[#BE123C] shadow-sm disabled:opacity-50 transition-all",
  icon:
    "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] disabled:opacity-50 transition-colors",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-4.5 py-2.5 text-sm font-medium rounded-xl gap-2",
  lg: "px-6 py-3.5 text-sm font-semibold rounded-xl gap-2.5",
  xl: "px-8 py-4 text-base font-semibold rounded-xl gap-3",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center cursor-pointer select-none",
        "transition-all duration-150 ease-out",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A]",
        "disabled:cursor-not-allowed",
        variantClass[variant],
        variant === "icon" ? "rounded-xl p-2.5 aspect-square" : sizeClass[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin text-current"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
