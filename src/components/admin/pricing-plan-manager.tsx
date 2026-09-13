"use client";

import { useState, useTransition } from "react";
import type { StoredPricingPlan } from "@/lib/store/memory";
import { updatePricingPlanAction } from "@/lib/platform/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PricingPlanManager({ initialPlans }: { initialPlans: StoredPricingPlan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [capInput, setCapInput] = useState<number>(0);
  const [pending, startTransition] = useTransition();

  function startEdit(plan: StoredPricingPlan) {
    setEditingId(plan.id);
    setPriceInput(plan.annualPriceInr);
    setCapInput(plan.studentCapacity);
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await updatePricingPlanAction(id, priceInput, capInput);
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, annualPriceInr: priceInput, studentCapacity: capInput } : p,
        ),
      );
      setEditingId(null);
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isEditing = editingId === plan.id;
        return (
          <div
            key={plan.id}
            className="rounded-2xl border border-border bg-elevated p-6 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground text-base">{plan.name}</h3>
                <Badge variant={plan.isActive ? "success" : "default"}>
                  {plan.isActive ? "Active" : "Archived"}
                </Badge>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">{plan.description}</p>

              {isEditing ? (
                <div className="space-y-3 mb-4 rounded-xl border border-brand/30 bg-subtle p-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted block mb-1">
                      Annual Price (INR)
                    </label>
                    <Input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted block mb-1">
                      Student Capacity Limit
                    </label>
                    <Input
                      type="number"
                      value={capInput}
                      onChange={(e) => setCapInput(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                    ₹{plan.annualPriceInr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted block mt-0.5">
                    / year · Up to {plan.studentCapacity.toLocaleString("en-IN")} students
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                  Included Capabilities:
                </span>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted">
                    <span className="text-brand font-bold">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    loading={pending}
                    onClick={() => saveEdit(plan.id)}
                  >
                    Save Tier
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => startEdit(plan)}
                >
                  Configure Tier
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
