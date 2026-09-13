import { FeatureFlagManager } from "@/components/admin/feature-flag-manager";
import { listPersistedFeatureFlags } from "@/lib/data/platform";

export const metadata = { title: "Feature Flags & System Toggles" };

export default async function SuperAdminFlagsPage() {
  const flags = await listPersistedFeatureFlags();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Runtime Configuration
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Feature Flags & Experiments
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Dynamically toggle streaming, cultural language personas, and analytics modules across environments without requiring application redeployments.
        </p>
      </header>

      <FeatureFlagManager initialFlags={flags} />
    </main>
  );
}
