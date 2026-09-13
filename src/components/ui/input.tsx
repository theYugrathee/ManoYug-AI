import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const sharedClasses =
  "w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] shadow-xs " +
  "placeholder:text-[#94A3B8] " +
  "transition-all duration-150 " +
  "focus-visible:border-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]/10 " +
  "disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-50";

export function Input({ className, invalid, id, ...props }: InputProps) {
  return (
    <input
      id={id}
      className={cn(
        sharedClasses,
        invalid ? "border-[#E11D48] focus-visible:border-[#E11D48] focus-visible:ring-[#E11D48]/10" : "",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, id, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      className={cn(
        sharedClasses,
        "resize-y min-h-[5rem]",
        invalid ? "border-[#E11D48] focus-visible:border-[#E11D48] focus-visible:ring-[#E11D48]/10" : "",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
