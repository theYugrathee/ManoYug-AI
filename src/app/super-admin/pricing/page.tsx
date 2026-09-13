import { PricingPlanManager } from "@/components/admin/pricing-plan-manager";
import { listPersistedPricingPlans } from "@/lib/data/platform";

export const metadata = { title: "Commercial Pricing Tier Configuration" };

export default async function SuperAdminPricingPage() {
  const plans = await listPersistedPricingPlans();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Revenue & Commercials
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Commercial Pricing Tiers
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Configure institutional pricing tiers based on annual student enrollment capacity. Changes dynamically reflect in commercial proposals and ARR models.
        </p>
      </header>

      <PricingPlanManager initialPlans={plans} />
    </main>
  );
}
