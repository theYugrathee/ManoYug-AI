import { SupportContactManager } from "@/components/institution/support-contact-manager";
import { Alert } from "@/components/ui/alert";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { getSupportContactsData } from "@/lib/institution/actions";

export const metadata = { title: "Campus Support Contacts Configuration" };

export default async function InstitutionContactsPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const contacts = await getSupportContactsData(institutionId);

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
          Safety & Human Escalation
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Campus Support Contacts
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Configure direct phone lines, emails, and operating hours for your university&apos;s counselling office, health centre, hostel wardens, and campus security.
        </p>
      </header>

      <Alert tone="info" title="Deterministic Escalation Notice">
        When an enrolled student taps &quot;Talk to a Human&quot; or triggers elevated safety concerns, ManoYug AI directly presents these verified campus contacts alongside national helplines (Tele-MANAS 14416).
      </Alert>

      <SupportContactManager contacts={contacts} institutionId={institutionId} />
    </main>
  );
}
