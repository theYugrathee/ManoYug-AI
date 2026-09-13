"use client";

import { useState, useTransition } from "react";
import {
  addInstitutionResourceAction,
} from "@/lib/institution/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResourceForm() {
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setMsg(null);

        startTransition(async () => {
          const res = await addInstitutionResourceAction(fd);
          if (res.ok) {
            setMsg({ tone: "success", text: res.message });
            form.reset();
          } else {
            setMsg({ tone: "danger", text: res.message });
          }
        });
      }}
    >
      {msg ? <Alert tone={msg.tone}>{msg.text}</Alert> : null}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-foreground">Resource Name</label>
        <Input id="name" name="name" required placeholder="e.g. Campus Wellbeing Centre" className="bg-subtle" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="resourceType" className="text-sm font-semibold text-foreground">Resource Type</label>
        <div className="relative">
          <select
            id="resourceType"
            name="resourceType"
            required
            className="w-full appearance-none rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-foreground transition-colors hover:border-[var(--my-border-strong)] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            defaultValue="counselling_office"
          >
            <option value="counselling_office">Counselling Office</option>
            <option value="health_center">Health Center / Medical Officer</option>
            <option value="peer_support">Peer Support & Student Volunteers</option>
            <option value="emergency_line">Campus Emergency & Security Line</option>
            <option value="hostel_warden">Hostel Warden & Proctor</option>
            <option value="anti_ragging">Anti-Ragging Squad Helpline</option>
            <option value="other">Other Official Resource</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contactValue" className="text-sm font-semibold text-foreground">Contact Value (Phone, Email, or Room)</label>
        <p className="text-[11px] text-muted mb-2">Direct helpline, mobile/landline number, official email, or campus office room number.</p>
        <Input id="contactValue" name="contactValue" required placeholder="+91 11 2659 7135 or room 204" className="bg-subtle" />
      </div>

      <div className="mt-2 text-right">
        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          + Register & Activate Resource
        </Button>
      </div>
    </form>
  );
}

