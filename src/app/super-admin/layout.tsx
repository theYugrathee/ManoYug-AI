import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Sidebar } from "@/components/ui/sidebar";
import { requireSuperAdminSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/logout";

const NAV = [
  { href: "/super-admin", label: "Command Center", section: "Platform" },
  { href: "/super-admin/institutions", label: "Institute & Code Management", section: "Platform" },
  { href: "/super-admin/requests", label: "Institution Requests", section: "Platform" },
  { href: "/super-admin/students", label: "Global Student Directory", section: "Platform" },
  { href: "/super-admin/ai", label: "AI Economics & Latency", section: "Telemetry" },
  { href: "/super-admin/evaluations", label: "Evaluation Suite", section: "Telemetry" },
  { href: "/super-admin/pricing", label: "Pricing Tiers", section: "Commercial" },
  { href: "/super-admin/flags", label: "Feature Flags", section: "Configuration" },
  { href: "/super-admin/security", label: "MFA & Security", section: "Compliance" },
  { href: "/super-admin/retention", label: "Data Retention", section: "Compliance" },
  { href: "/super-admin/break-glass", label: "Break-glass Access", section: "Emergency" },
];

const BOTTOM_NAV = [
  { href: "/", label: "ManoYug Public Home" },
];

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  if (requestHeaders.get("x-manoyug-super-admin-login") === "1") {
    return children;
  }

  // Server-enforced authorization: unauthorized users are redirected immediately
  const session = await requireSuperAdminSession();

  return (
    <Sidebar
      brandLabel="Super Admin"
      brandHref="/super-admin"
      items={NAV}
      bottomItems={BOTTOM_NAV}
      logoutAction={logoutAction}
    >
      <div className="flex flex-1 flex-col bg-[var(--my-bg)] min-w-0">
        <div className="bg-[var(--my-bg-elevated)]/90 backdrop-blur-md px-6 py-3 border-b border-[var(--my-border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--my-danger)] animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--my-danger)] font-mono">
              Restricted Environment · Full Platform Governance
            </p>
          </div>
          <span className="text-[11px] font-mono text-[var(--my-fg-subtle)] hidden sm:inline">
            Authenticated: {session.email}
          </span>
        </div>
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </Sidebar>
  );
}
