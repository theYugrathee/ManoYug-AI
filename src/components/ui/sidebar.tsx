"use client";

import { type ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/* ─── Types ─── */
export type SidebarItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  section?: string;
};

type SidebarProps = {
  items: SidebarItem[];
  brandLabel: string;
  brandHref: string;
  bottomItems?: SidebarItem[];
  /** Server action or URL to call on logout */
  logoutAction?: () => Promise<void>;
  children: ReactNode;
};

/* ─── Icons ─── */
function MenuIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

/* ─── Component ─── */
export function Sidebar({ items, brandLabel, brandHref, bottomItems, logoutAction, children }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  /* Close on route change */
  useEffect(() => { close(); }, [pathname, close]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  /* Group items by section */
  const sections = items.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    const key = item.section ?? "_default";
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  function renderNav(navItems: SidebarItem[]) {
    return navItems.map((item) => {
      const active = pathname === item.href || (item.href !== brandHref && pathname.startsWith(item.href + "/"));
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150",
            active
              ? "bg-[#F1F5F9] text-[#0F172A] font-semibold border-l-2 border-[#0F172A]"
              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
          )}
          aria-current={active ? "page" : undefined}
        >
          {item.icon ? <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center opacity-80">{item.icon}</span> : null}
          <span className="truncate">{item.label}</span>
        </Link>
      );
    });
  }

  async function handleLogout() {
    if (!logoutAction || loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutAction();
    } catch {
      setLoggingOut(false);
    }
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E2E8F0]">
        <Link href={brandHref} className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-white font-bold text-sm shadow-xs">
            <span className="font-display">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#0F172A] font-display">{brandLabel}</span>
            <span className="text-[10px] text-[#64748B] tracking-wider uppercase font-mono">Workspace</span>
          </div>
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        {Object.entries(sections).map(([section, sectionItems]) => (
          <div key={section} className="space-y-1">
            {section !== "_default" ? (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] font-mono">
                {section}
              </p>
            ) : null}
            {renderNav(sectionItems)}
          </div>
        ))}
      </nav>

      {/* Bottom items + Logout */}
      <div className="border-t border-[#E2E8F0] px-3 py-3 space-y-1 bg-[#F8FAFC]">
        {bottomItems && bottomItems.length > 0 ? renderNav(bottomItems) : null}

        {logoutAction ? (
          <button
            id="sidebar-logout-btn"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-150 mt-1",
              loggingOut
                ? "text-[#94A3B8] cursor-not-allowed"
                : "text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer",
            )}
            aria-label="Log out"
          >
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              <LogoutIcon />
            </span>
            <span className="truncate font-medium">
              {loggingOut ? "Signing out…" : "Log Out"}
            </span>
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="flex h-full min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[var(--my-sidebar-w)] lg:border-r lg:border-[#E2E8F0] lg:bg-white lg:fixed lg:inset-y-0 lg:z-[var(--my-z-sidebar)] shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open ? (
        <div
          className="fixed inset-0 z-[var(--my-z-overlay)] bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      ) : null}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[var(--my-z-modal)] flex w-[280px] flex-col bg-white border-r border-[#E2E8F0] shadow-xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={close}
            className="rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-[var(--my-sidebar-w)] min-w-0">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <Link href={brandHref} className="text-sm font-bold text-[#0F172A] font-display">{brandLabel}</Link>
        </header>
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
