import { InstitutionRequestReviewer } from "@/components/admin/institution-request-reviewer";
import { Alert } from "@/components/ui/alert";
import { fetchLiveInstitutionRequests } from "@/lib/platform/actions";

export const metadata = { title: "Institution Onboarding Queue" };

export default async function InstitutionRequestsPage() {
  const requests = await fetchLiveInstitutionRequests();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--my-danger)] mb-1">
          Access Control & Provisioning
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Institution Onboarding Queue
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Review incoming requests from universities, engineering colleges, and higher-ed institutions. Approving a request creates the tenant partition and allows roster syncing.
        </p>
      </header>

      <Alert tone="info" title="Vetting Policy">
        Verify that the applicant email uses an official university domain (.edu.in, .ac.in) and that the contact person holds official administrative authority.
      </Alert>

      <InstitutionRequestReviewer requests={requests} />
    </main>
  );
}
