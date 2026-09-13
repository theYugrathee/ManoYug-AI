import { notFound } from "next/navigation";
import { ChatClient } from "@/components/student/chat-client";
import { getConversationData } from "@/lib/student/actions";
import { requireStudentSession } from "@/lib/auth/session";
import { listCampusContacts } from "@/lib/data/platform";

export const metadata = { title: "Conversation" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([getConversationData(id), requireStudentSession()]);
  const campusContacts = await listCampusContacts(session.institutionId);
  const owned = data.conversations.some((c) => c.id === id);
  if (!owned) {
    notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] lg:h-screen w-full">
      <ChatClient
        conversationId={id}
        initialMessages={data.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))}
        campusContacts={campusContacts}
      />
    </div>
  );
}
