import Link from "next/link";
import { VERIFIED_RESOURCES } from "@/lib/wellbeing/catalogue";
import { Badge } from "@/components/ui/badge";

export type CampusSafetyContact = {
  id: string;
  title: string;
  phone?: string;
  email?: string;
  location?: string;
  operatingHours?: string;
  isEmergency: boolean;
};

export function CrisisPanel({
  state,
  compact = false,
  campusContacts = [],
}: {
  state: "RED" | "IMMINENT";
  compact?: boolean;
  campusContacts?: CampusSafetyContact[];
}) {
  const priorityContacts = [...campusContacts]
    .sort((a, b) => Number(b.isEmergency) - Number(a.isEmergency))
    .filter((contact) => contact.phone || contact.email)
    .slice(0, 3);
  return (
    <section
      role="alert"
      aria-live="assertive"
      className={
        compact
          ? "rounded-xl border border-[var(--my-danger)]/30 bg-[var(--my-danger-bg)] p-5"
          : "fixed inset-0 z-[var(--my-z-modal)] flex items-center justify-center bg-[rgb(0_0_0/0.72)] backdrop-blur-sm p-4 animate-in fade-in duration-300"
      }
    >
      <div
        className={
          compact
            ? "space-y-4"
            : "max-w-lg w-full space-y-5 rounded-2xl border border-border bg-elevated p-6 shadow-[var(--my-shadow-lg)]"
        }
      >
        <div className="flex items-center gap-2">
          <Badge variant="danger" dot>Safety Support: {state}</Badge>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            You deserve immediate human help
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            ManoYug AI is not an emergency service. Normal chat is paused while
            urgent support is active. Please contact a trusted person who can be
            with you. If you may be in immediate danger, call 112 or go to the
            nearest emergency medical facility.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <a href="tel:112" className="rounded-xl bg-[var(--my-danger)] px-4 py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90">
            Call 112 for emergency help
          </a>
          <a href="tel:14416" className="rounded-xl border border-border bg-subtle px-4 py-3 text-center text-sm font-bold text-foreground transition-colors hover:bg-elevated">
            Call Tele-MANAS 14416
          </a>
        </div>

        <ul className="space-y-3 text-sm">
          {VERIFIED_RESOURCES.map((r) => (
            <li
              key={r.contact}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
            >
              <div>
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted mt-0.5">{r.type}</p>
              </div>
              <p className="text-[var(--my-danger)] font-medium bg-[var(--my-danger-bg)] px-2.5 py-1 rounded-lg">{r.contact}</p>
            </li>
          ))}
        </ul>

        {priorityContacts.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Your campus support contacts</p>
            {priorityContacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border border-border bg-background px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{contact.title}</p>
                    {contact.location ? <p className="mt-0.5 text-xs text-muted">{contact.location}</p> : null}
                    {contact.operatingHours ? <p className="mt-0.5 text-xs text-muted">{contact.operatingHours}</p> : null}
                  </div>
                  {contact.phone ? <a href={`tel:${contact.phone}`} className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-[var(--my-brand-fg)]">Call</a> : null}
                </div>
                {!contact.phone && contact.email ? <a href={`mailto:${contact.email}`} className="mt-2 inline-block text-xs font-semibold text-brand underline">Email support</a> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-subtle p-3 text-xs leading-5 text-muted">Campus contacts have not been configured yet. Use Tele-MANAS or 112, and contact someone you trust nearby.</p>
        )}

        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
          <Link
            href="/student/support"
            className="rounded-xl flex-1 justify-center flex items-center bg-[var(--my-danger)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Talk to a human
          </Link>
          <Link
            href="/help"
            className="rounded-xl flex-1 justify-center flex items-center border border-border bg-subtle px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-elevated active:scale-[0.98]"
          >
            Help centre
          </Link>
        </div>
      </div>
    </section>
  );
}
