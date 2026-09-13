"use client";

import { useActionState, useState } from "react";
import type { StoredSupportContact } from "@/lib/store/memory";
import { saveSupportContactAction, deleteSupportContactAction } from "@/lib/institution/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function SupportContactManager({
  contacts,
  institutionId,
}: {
  contacts: StoredSupportContact[];
  institutionId: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [saveState, formAction, pending] = useActionState(async (_prev: any, formData: FormData) => {
    const res = await saveSupportContactAction(formData);
    if (res.ok) setShowAdd(false);
    return res;
  }, null);

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to remove this support contact?")) {
      await deleteSupportContactAction(id, institutionId);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Configured Support Contacts</h2>
          <p className="text-xs text-muted">
            These contact cards appear directly in the student app under &quot;Talk to a Human&quot; and during elevated safety triggers.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
          variant={showAdd ? "secondary" : "primary"}
        >
          {showAdd ? "Cancel" : "+ Add Campus Contact"}
        </Button>
      </div>

      {saveState ? (
        <Alert tone={saveState.ok ? "success" : "danger"}>
          {saveState.message}
        </Alert>
      ) : null}

      {/* Add Contact Form */}
      {showAdd ? (
        <form action={formAction} className="rounded-2xl border border-brand/30 bg-subtle p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-foreground">Add New Campus Support Number</h3>
          <input type="hidden" name="institutionId" value={institutionId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="title" label="Contact Title / Office Name" required>
              <Input id="title" name="title" required placeholder="e.g. Campus Wellness Office" disabled={pending} />
            </Field>

            <Field id="contactType" label="Category" required>
              <select
                id="contactType"
                name="contactType"
                className="w-full rounded-xl border border-border bg-elevated px-3 py-2.5 text-xs text-foreground focus:border-brand focus:outline-none"
                disabled={pending}
              >
                <option value="wellbeing_office">Wellbeing & Counselling Office</option>
                <option value="campus_security">Campus Security / Quick Response</option>
                <option value="hostel_warden">Hostel Affairs / Wardens</option>
                <option value="emergency">Campus Health Centre / Emergency</option>
                <option value="student_affairs">Dean of Student Affairs Desk</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Phone / Extension" required>
              <Input id="phone" name="phone" required placeholder="+91 11 2659 7135 or Ext. 1000" disabled={pending} />
            </Field>

            <Field id="email" label="Official Email Address (Optional)">
              <Input id="email" name="email" type="email" placeholder="wellbeing@university.ac.in" disabled={pending} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="location" label="Physical Campus Location (Optional)">
              <Input id="location" name="location" placeholder="SAC Building, 2nd Floor, Room 204" disabled={pending} />
            </Field>

            <Field id="operatingHours" label="Operating Hours (Optional)">
              <Input id="operatingHours" name="operatingHours" placeholder="Monday – Saturday: 9 AM – 7 PM" disabled={pending} />
            </Field>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isEmergency" name="isEmergency" value="true" className="rounded" />
            <label htmlFor="isEmergency" className="text-xs text-foreground font-medium">
              Mark as 24/7 Campus Emergency Contact
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={pending}>
              Save Support Contact
            </Button>
          </div>
        </form>
      ) : null}

      {/* Existing Contacts List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-2xl border border-border bg-elevated p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-foreground text-sm">{contact.title}</h3>
                {contact.isEmergency ? (
                  <span className="rounded-full bg-[var(--my-danger-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--my-danger)] flex-shrink-0">
                    Emergency
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs font-mono font-bold text-brand">{contact.phone}</p>
              {contact.location ? <p className="mt-1 text-xs text-muted">📍 {contact.location}</p> : null}
              {contact.operatingHours ? <p className="mt-0.5 text-xs text-muted">🕒 {contact.operatingHours}</p> : null}
              {contact.email ? <p className="mt-0.5 text-xs text-muted">✉️ {contact.email}</p> : null}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => handleDelete(contact.id)}
                className="text-xs text-[var(--my-danger)] hover:underline"
              >
                Delete Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
