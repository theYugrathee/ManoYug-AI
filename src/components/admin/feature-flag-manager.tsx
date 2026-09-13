"use client";

import { useState, useTransition } from "react";
import type { StoredFeatureFlag } from "@/lib/store/memory";
import { toggleFeatureFlagAction } from "@/lib/platform/actions";
import { Badge } from "@/components/ui/badge";

export function FeatureFlagManager({ initialFlags }: { initialFlags: StoredFeatureFlag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [, startTransition] = useTransition();

  function handleToggle(key: string, current: boolean) {
    const next = !current;
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: next } : f)));
    startTransition(async () => {
      await toggleFeatureFlagAction(key, next);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {flags.map((flag) => (
        <div
          key={flag.key}
          className="rounded-2xl border border-border bg-elevated p-5 flex flex-col justify-between shadow-sm transition-all hover:border-[var(--my-border-strong)]"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-foreground text-sm">{flag.name}</h3>
              <Badge variant={flag.isEnabled ? "success" : "default"} dot>
                {flag.isEnabled ? "ENABLED" : "DISABLED"}
              </Badge>
            </div>
            <p className="font-mono text-[11px] text-muted mb-2">{flag.key}</p>
            <p className="text-xs text-muted leading-relaxed">{flag.description}</p>
          </div>

          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted font-mono">Env: {flag.environment}</span>
            <button
              type="button"
              onClick={() => handleToggle(flag.key, flag.isEnabled)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                flag.isEnabled
                  ? "bg-[var(--my-danger-bg)] text-[var(--my-danger)] hover:bg-[var(--my-danger)] hover:text-white"
                  : "bg-brand text-[var(--my-brand-fg)] hover:bg-brand-hover"
              }`}
            >
              {flag.isEnabled ? "Disable Flag" : "Enable Flag"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
