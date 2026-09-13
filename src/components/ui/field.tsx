import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./label";

export type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-brand ml-0.5" aria-hidden="true">*</span>}
      </Label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-[var(--my-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
