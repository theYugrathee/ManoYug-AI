import { InstitutionSupportInbox } from "@/components/institution/support-inbox";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { getInstitutionSupportInboxData } from "@/lib/institution/actions";

export const metadata = { title: "Student Support & Safety" };

export default async function InstitutionSupportPage() {
  const session = await requireInstitutionAdminSession();
  const { supportRequests, safetyAlerts } = await getInstitutionSupportInboxData();

  return (
    <main className="flex-1 space-y-8 p-6 lg:p-8 xl:p-10 my-fade-in-up">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Safety & escalation</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Student Support & Safety</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Respond to wellbeing callback requests and high-risk safety alerts for {session.institutionName || "your institute"}. Use your approved campus process for every urgent follow-up.
        </p>
      </header>
      <InstitutionSupportInbox supportRequests={supportRequests} safetyAlerts={safetyAlerts} />
    </main>
  );
}
