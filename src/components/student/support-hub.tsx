import Link from "next/link";
import { VERIFIED_RESOURCES } from "@/lib/wellbeing/catalogue";
import { Badge } from "@/components/ui/badge";
import { SupportForm } from "@/components/student/support-form";
import type { StoredSupportContact, StoredTenant } from "@/lib/store/memory";

export function StudentSupportHub({
  tenant,
  campusContacts,
}: {
  tenant: StoredTenant | null;
  campusContacts: StoredSupportContact[];
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 md:px-8 md:py-12 my-fade-in-up space-y-10">
      <header className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand text-2xl font-bold">🤝</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Support & Resources</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted max-w-xl mx-auto">
          Find verified national helplines, campus contacts, and a direct way to request human support from your institute.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand" />Verified national support in India</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {VERIFIED_RESOURCES.map((resource) => (
            <div key={resource.contact} className="rounded-2xl border border-border bg-elevated p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-foreground text-lg">{resource.name}</h3><Badge variant="info">{resource.type}</Badge></div>
                <p className="mt-2 text-xs text-muted leading-relaxed">{resource.note}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4"><span className="text-xs uppercase tracking-wider font-semibold text-muted">Contact</span><a href={`tel:${resource.contact.replace(/[^0-9+]/g, "")}`} className="font-medium text-brand hover:underline">{resource.contact}</a></div>
            </div>
          ))}
          <div className="rounded-2xl border border-[var(--my-danger)]/30 bg-[var(--my-danger-bg)] p-6 flex flex-col justify-between">
            <div><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-foreground text-lg">Emergency Response 112</h3><Badge variant="danger">Immediate danger</Badge></div><p className="mt-2 text-xs text-muted leading-relaxed">For urgent police, fire, medical, or other emergency assistance. If you may harm yourself or someone else, call now or go to the nearest emergency facility.</p></div>
            <div className="mt-6"><a href="tel:112" className="inline-flex items-center gap-2 rounded-xl bg-[var(--my-danger)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">📞 Call 112 now</a></div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--my-info)] flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--my-info)]" />Support from {tenant?.name ?? "Your Institute"}</h2>
        {campusContacts.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{campusContacts.map((contact) => <div key={contact.id} className="rounded-2xl border border-border bg-elevated p-5 flex flex-col justify-between"><div><div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-foreground text-sm">{contact.title}</h3>{contact.isEmergency ? <Badge variant="danger">Emergency</Badge> : null}</div>{contact.location ? <p className="mt-2 text-xs text-muted">📍 {contact.location}</p> : null}{contact.operatingHours ? <p className="mt-1 text-xs text-muted">🕒 {contact.operatingHours}</p> : null}{contact.email ? <p className="mt-1 text-xs text-muted">✉️ {contact.email}</p> : null}</div><div className="mt-4 pt-3 border-t border-border">{contact.phone ? <a href={`tel:${contact.phone}`} className="text-xs font-bold text-brand hover:underline">📞 {contact.phone}</a> : contact.email ? <a href={`mailto:${contact.email}`} className="text-xs font-bold text-brand hover:underline">✉️ Email support</a> : null}</div></div>)}</div> : <div className="rounded-xl border border-border bg-subtle p-4 text-xs text-muted">Campus support contacts are being updated by your institute. Tele-MANAS (14416) remains available 24/7.</div>}
      </section>

      <section className="space-y-4"><h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted" />Request institute support</h2><div className="rounded-2xl border border-border bg-elevated p-6 sm:p-8 shadow-[var(--my-shadow-md)]"><SupportForm /></div></section>

      <div className="rounded-2xl border border-[var(--my-danger)]/20 bg-[var(--my-danger-bg)] p-5 text-center"><p className="text-sm text-foreground"><span className="font-semibold text-[var(--my-danger)]">Immediate danger or medical emergency?</span> Dial <strong>112</strong> or visit <Link href="/help" className="font-semibold text-brand underline underline-offset-4">Help & Safety</Link>.</p></div>
    </main>
  );
}
