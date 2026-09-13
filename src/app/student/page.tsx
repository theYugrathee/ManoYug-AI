import { ChatClient } from "@/components/student/chat-client";
import { requireStudentSession } from "@/lib/auth/session";
import { listCampusContacts } from "@/lib/data/platform";

export const metadata = { title: "What's on your mind? — ManoYug AI" };

export default async function StudentDefaultLandingPage() {
  const session = await requireStudentSession();
  const campusContacts = await listCampusContacts(session.institutionId);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] lg:h-screen w-full">
      <ChatClient initialMessages={[]} campusContacts={campusContacts} />
    </div>
  );
}
