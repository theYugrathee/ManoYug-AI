"use client";

import { useState, useTransition } from "react";
import { addManualRosterStudentAction } from "@/lib/student/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ManualStudentForm() {
  const [entryType] = useState<"email" | "phone" | "both">("email");
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-subtle px-4 py-3 text-xs leading-5 text-muted">
        Student email is required for account access. Phone, name, department, graduation year, and roll number are optional details.
      </div>

      {msg ? (
        <Alert tone={msg.tone}>
          {msg.text}
        </Alert>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          fd.set("entryType", entryType);
          setMsg(null);

          startTransition(async () => {
            const res = await addManualRosterStudentAction(fd);
            if (res.ok) {
              setMsg({ tone: "success", text: res.message });
              form.reset();
            } else {
              setMsg({ tone: "danger", text: res.message });
            }
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
              <label htmlFor="student-email" className="text-xs font-semibold text-foreground">
                Student Official / Personal Email <span className="text-brand">*</span>
              </label>
              <Input
                id="student-email"
                name="email"
                type="email"
                required
                placeholder="student@university.edu.in"
                className="bg-subtle text-xs"
              />
          </div>

          <div className="space-y-1.5">
              <label htmlFor="student-phone" className="text-xs font-semibold text-foreground">
                Student Mobile Number <span className="text-muted">(Optional)</span>
              </label>
              <Input
                id="student-phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="bg-subtle text-xs font-mono"
              />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="student-roll" className="text-xs font-semibold text-foreground">
              University Roll / Registration No. <span className="text-muted">(Optional)</span>
            </label>
            <Input
              id="student-roll"
              name="universityRollNo"
              placeholder="e.g. 2024CS1092"
              className="bg-subtle text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="student-name" className="text-xs font-semibold text-foreground">
              Full Name <span className="text-muted">(Optional)</span>
            </label>
            <Input
              id="student-name"
              name="name"
              placeholder="e.g. Aarav Sharma"
              className="bg-subtle text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="student-dept" className="text-xs font-semibold text-foreground">
              Department / Branch <span className="text-muted">(Optional)</span>
            </label>
            <Input
              id="student-dept"
              name="department"
              placeholder="e.g. Computer Science"
              className="bg-subtle text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="student-grad" className="text-xs font-semibold text-foreground">
              Graduation Year <span className="text-muted">(Optional)</span>
            </label>
            <Input
              id="student-grad"
              name="graduationYear"
              type="number"
              defaultValue={currentYear + 2}
              className="bg-subtle text-xs font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" loading={pending} className="w-full sm:w-auto">
            <span>+ Add eligible student</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
