import { StudentSupportHub } from "@/components/student/support-hub";
import { requireStudentSession } from "@/lib/auth/session";
import { getTenantById, listCampusContacts } from "@/lib/data/platform";

export const metadata = { title: "Support & Resources" };

export default async function SupportPage() {
  const session = await requireStudentSession();
  const [tenant, campusContacts] = await Promise.all([
    getTenantById(session.institutionId),
    listCampusContacts(session.institutionId),
  ]);

  return <StudentSupportHub tenant={tenant} campusContacts={campusContacts} />;
}
