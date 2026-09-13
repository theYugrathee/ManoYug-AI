"use client";

import { useActionState, useState } from "react";
import { submitCheckinAction } from "@/lib/student/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

const SCALES = [
  { name: "mood", label: "Mood", desc: "How are you feeling overall?" },
  { name: "stress", label: "Stress", desc: "Current tension or pressure level" },
  { name: "energy", label: "Energy", desc: "Physical and mental fuel" },
  { name: "sleep", label: "Sleep", desc: "Quality of rest from last night" },
  { name: "academicPressure", label: "Academics", desc: "Study/placement pressure" },
  { name: "socialConnection", label: "Connection", desc: "Feeling supported/close to others" },
] as const;

function RatingCircle({
  value,
  current,
  onClick
}: {
  value: number;
  current: number;
  onClick: () => void;
}) {
  const active = current === value;
  // Change color based on value (1 = red, 5 = green for most scales)
  // We'll use a dynamic bg for the active state
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border transition-all duration-300 flex items-center justify-center font-semibold text-sm sm:text-base ${active
          ? "border-brand bg-brand text-[var(--my-brand-fg)] scale-110 shadow-[var(--my-shadow-md)] z-10"
          : "border-border bg-subtle text-muted hover:border-brand/50 hover:bg-elevated hover:text-foreground"
        }`}
      aria-label={`Rate ${value} out of 5`}
      aria-pressed={active}
    >
      {value}
    </button>
  );
}

export function CheckinForm() {
  const [state, action, pending] = useActionState(submitCheckinAction, null);

  // Local state for the custom UI
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(SCALES.map((s) => [s.name, 3]))
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-[var(--my-success)]/30 bg-[var(--my-success-bg)] p-8 text-center my-fade-in-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--my-success)]/20 mb-4">
          <span className="text-2xl text-[var(--my-success)]">✓</span>
        </div>
        <h3 className="text-xl font-bold text-foreground">Check-in complete</h3>
        <p className="mt-2 text-sm text-[var(--my-success)]">Thank you for taking a moment to reflect. This helps you track your wellbeing over time.</p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-8 my-fade-in-up">
      {state && !state.ok ? (
        <Alert tone="danger">{state.message}</Alert>
      ) : null}

      <input type="hidden" name="period" value="daily" />

      {/* Hidden inputs to pass state to Server Action */}
      {SCALES.map(s => (
        <input key={`hidden-${s.name}`} type="hidden" name={s.name} value={ratings[s.name]} />
      ))}

      <div className="grid gap-6 sm:grid-cols-2">
        {SCALES.map((s) => (
          <div key={s.name} className="rounded-2xl border border-border bg-elevated p-5 sm:p-6 transition-all hover:border-[var(--my-border-strong)]">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">{s.label}</h3>
              <p className="text-xs text-muted mt-1">{s.desc}</p>
            </div>

            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-border z-0" aria-hidden="true" />
              {[1, 2, 3, 4, 5].map((val) => (
                <RatingCircle
                  key={val}
                  value={val}
                  current={ratings[s.name]}
                  onClick={() => setRatings(prev => ({ ...prev, [s.name]: val }))}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] uppercase font-semibold tracking-wider text-muted">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-elevated p-5 sm:p-6">
        <label htmlFor="note" className="block font-semibold text-foreground mb-1">Optional note</label>
        <p className="text-xs text-muted mb-4">Anything else you want to track for yourself today?</p>
        <Textarea
          id="note"
          name="note"
          maxLength={500}
          placeholder="Reflections, triggers, or wins..."
          className="bg-subtle"
        />
      </div>

      <div className="flex items-center justify-end">
        <Button type="submit" loading={pending} size="lg" className="w-full sm:w-auto px-10">
          Save check-in
        </Button>
      </div>
    </form>
  );
}
