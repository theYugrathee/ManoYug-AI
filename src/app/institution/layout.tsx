import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { requireInstitutionAdminSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/logout";

const NAV = [
  { href: "/institution", label: "Executive Overview", section: "Operations" },
  { href: "/institution/students", label: "Add / Remove Students", section: "Operations" },
  { href: "/institution/contacts", label: "Campus Support Contacts", section: "Safety & Escalation" },
  { href: "/institution/support", label: "Student Support & Safety", section: "Safety & Escalation" },
  { href: "/institution/analytics", label: "Wellbeing Themes & Analytics", section: "Operations" },
  { href: "/institution/resources", label: "Verified Resources", section: "Safety & Escalation" },
  { href: "/institution/reports", label: "Compliance & Exports", section: "Governance" },
];

const BOTTOM_NAV = [
  { href: "/", label: "ManoYug Public Portal" },
];

export default async function InstitutionLayout({ children }: { children: ReactNode }) {
  // Server-enforced authorization: scopes this entire layout to the verified tenant
  const session = await requireInstitutionAdminSession();

  return (
    <Sidebar
      brandLabel={session.institutionName || "Institution Admin"}
      brandHref="/institution"
      items={NAV}
      bottomItems={BOTTOM_NAV}
      logoutAction={logoutAction}
    >
      <div className="flex flex-1 flex-col overflow-hidden bg-[var(--my-bg)] min-w-0">
        <div className="bg-[var(--my-bg-elevated)]/90 backdrop-blur-md px-6 py-3 border-b border-[var(--my-border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[var(--my-brand)] animate-pulse" />
            <span className="font-semibold text-[var(--my-fg)] font-display">{session.institutionName}</span>
            <span className="text-[var(--my-fg-subtle)] hidden sm:inline">· Active Partition</span>
          </div>
          <span className="font-mono text-[var(--my-brand)] font-bold bg-[var(--my-brand)]/10 border border-[var(--my-brand)]/20 px-2.5 py-0.5 rounded-lg text-xs">
            {session.institutionCode}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </Sidebar>
  );
}
