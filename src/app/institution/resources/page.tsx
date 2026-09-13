import { ResourceForm } from "@/components/institution/resource-form";
import { ResourceList } from "@/components/institution/resource-list";
import { getInstitutionResourcesData } from "@/lib/institution/actions";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Campus Verified Resources — Institution Management" };

export default async function InstitutionResourcesPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const data = await getInstitutionResourcesData();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            Safety & Escalation
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
          Campus Verified Resources
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Manage internal campus support contacts, medical officer hotlines, and crisis desks for <span className="font-semibold text-foreground font-display">{session.institutionName}</span> ({session.institutionCode}). Added resources become active immediately for enrolled students.
        </p>
      </header>

      <Alert tone="info" title="Direct Campus Activation">
        All registered resources are immediately active and displayed in student crisis routing panels alongside national emergency helplines (Tele-MANAS 14416).
      </Alert>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left Col - Resource List */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Active Campus Resources ({data.resources.length})</h2>
          </div>
          <ResourceList initialResources={data.resources} />
        </section>

        {/* Right Col - New Resource Form */}
        <section>
          <div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)] lg:sticky lg:top-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🏢</span>
              <h2 className="text-lg font-bold text-foreground">Add Campus Resource</h2>
            </div>
            <p className="text-xs text-muted mb-6">
              Add direct telephone numbers, emails, or office rooms for your campus.
            </p>
            <ResourceForm />
          </div>
        </section>
      </div>
    </main>
  );
}
