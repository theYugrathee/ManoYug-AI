import { ManualStudentForm } from "@/components/institution/manual-student-form";
import { RosterCsvImporter } from "@/components/institution/roster-csv-importer";
import { StudentRosterTable } from "@/components/institution/student-roster-table";
import { Alert } from "@/components/ui/alert";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { getTenantById, listTenantRoster } from "@/lib/data/platform";

export const metadata = { title: "Add / Remove Students — Campus Access Roster" };

export default async function InstitutionStudentsPage() {
  const session = await requireInstitutionAdminSession();
  const institutionId = session.institutionId;
  const [tenant, students] = await Promise.all([getTenantById(institutionId), listTenantRoster(institutionId)]);

  return (
    <main className="flex-1 p-6 lg:p-8 xl:p-10 my-fade-in-up space-y-8">
      <header>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            Student Access & Identity Management
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
          Add / Remove Students
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Authorize student access under <span className="font-semibold text-foreground font-display">{tenant?.name || session.institutionName}</span> ({tenant?.code || session.institutionCode}). When students create an account with your campus code, the system verifies their email or phone number against this approved roster.
        </p>
      </header>

      <Alert tone="info" title="Zero-Inspection Privacy Guard">
        This roster governs access eligibility only. Institution administrators cannot read student chat messages, individual check-in reflections, or private journal entries.
      </Alert>

      {/* Manual Student Addition & CSV Batch Import in Tabs / Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Manual Add Form */}
        <div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">👤</span>
              <h2 className="text-base font-bold text-foreground">Add Student Manually</h2>
            </div>
            <p className="text-xs text-muted mb-6">
              Select Email or Phone number to authorize a single student immediately.
            </p>
            <ManualStudentForm />
          </div>
        </div>

        {/* CSV Importer Section */}
        <div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">📄</span>
              <h2 className="text-base font-bold text-foreground">Batch Import via CSV</h2>
            </div>
            <p className="text-xs text-muted mb-6">
              Upload class or department rosters with <span className="font-mono text-brand">email</span> or <span className="font-mono text-brand">phone</span> columns.
            </p>
            <RosterCsvImporter />
          </div>
        </div>
      </div>

      {/* Student Table Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Authorized Campus Students ({students.length})</h2>
            <p className="text-xs text-muted">Manage active student access and remove ineligible accounts.</p>
          </div>
        </div>
        <StudentRosterTable initialStudents={students} />
      </div>
    </main>
  );
}
