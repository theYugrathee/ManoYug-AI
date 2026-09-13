import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { requireStudentSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/logout";

const NAV = [
  { href: "/student", label: "New Conversation", section: "Companion" },
  { href: "/student/chat", label: "Past Conversations", section: "Companion" },
  { href: "/student/check-in", label: "Daily Check-in", section: "Wellbeing" },
  { href: "/student/exercises", label: "Grounding Exercises", section: "Wellbeing" },
  { href: "/student/support", label: "Support & Resources", section: "Support" },
];

const BOTTOM_NAV = [
  { href: "/student/timeline", label: "Activity Timeline" },
  { href: "/student/settings", label: "Profile & Privacy" },
  { href: "/help", label: "Safety & Helpline" },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  // Server-enforced student session check
  const session = await requireStudentSession();

  return (
    <Sidebar
      brandLabel="ManoYug AI"
      brandHref="/student"
      items={NAV}
      bottomItems={BOTTOM_NAV}
      logoutAction={logoutAction}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </Sidebar>
  );
}
