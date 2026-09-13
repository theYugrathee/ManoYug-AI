import { fetchLiveGlobalStudents } from "@/lib/platform/actions";
import { StudentRosterTable } from "@/components/institution/student-roster-table";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Global Student Directory" };

export default async function SuperAdminStudentsPage() {
  const students = await fetchLiveGlobalStudents();

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--my-danger)] mb-1">
          Identity Registry
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Global Verified Student Directory
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Search verified student accounts across all tenant institutions. Roster data is strictly scoped for account authentication and license validation.
        </p>
      </header>

      <Alert tone="info" title="Privacy Standard">
        Private student chats and check-in mood scores are encrypted and not visible in administrative views.
      </Alert>

      <StudentRosterTable initialStudents={students} />
    </main>
  );
}
