import { fetchLiveTenants } from "@/lib/platform/actions";
import { InstituteManager } from "@/components/super-admin/institute-manager";

export const metadata = { title: "Institute & Code Management — Super Admin" };

export default async function SuperAdminInstitutionsPage() {
  const tenants = await fetchLiveTenants();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--my-danger)] mb-1">
          Platform Governance · Multi-Tenancy Architecture
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Institute & Code Management
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Super Admin authority for generating unique institute codes, setting tenant capacity, creating administrator accounts, and managing active/revoked institutions.
        </p>
      </header>

      <InstituteManager initialTenants={tenants} />
    </main>
  );
}
