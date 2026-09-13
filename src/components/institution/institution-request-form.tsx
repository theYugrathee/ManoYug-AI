"use client";

import { useActionState } from "react";
import { submitInstitutionOnboardingRequest } from "@/lib/institution/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function InstitutionRequestForm() {
  const [state, formAction, pending] = useActionState(
    submitInstitutionOnboardingRequest,
    null,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.ok ? (
        <Alert tone="danger">{state.message}</Alert>
      ) : null}

      {state?.ok ? (
        <Alert tone="success" className="border-brand/40 bg-brand/10">
          <p className="font-semibold text-brand">Request Received</p>
          <p className="mt-1 text-sm">{state.message}</p>
        </Alert>
      ) : null}

      {!state?.ok ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="institutionName" label="Institution / University Name" required>
              <Input
                id="institutionName"
                name="institutionName"
                required
                placeholder="e.g. National Institute of Technology, Trichy"
                disabled={pending}
              />
            </Field>

            <Field id="institutionType" label="Institution Type" required>
              <select
                id="institutionType"
                name="institutionType"
                className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                disabled={pending}
              >
                <option value="Central University / IIT / NIT">Central University / IIT / NIT / AIIMS</option>
                <option value="State University">State University</option>
                <option value="Private Deemed University">Private Deemed University</option>
                <option value="Engineering / Medical College">Standalone Engineering / Medical College</option>
                <option value="Other Higher Ed Institution">Other Higher Ed Institution</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="officialEmail" label="Official Institutional Email" hint="Must use official college domain" required>
              <Input
                id="officialEmail"
                name="officialEmail"
                type="email"
                required
                placeholder="dean.studentaffairs@university.edu.in"
                disabled={pending}
              />
            </Field>

            <Field id="contactPhone" label="Contact Phone Number" hint="Official phone or mobile" required>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                disabled={pending}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="approximateStudentCount" label="Enrolled Students" required>
              <Input
                id="approximateStudentCount"
                name="approximateStudentCount"
                type="number"
                defaultValue={4500}
                required
                disabled={pending}
              />
            </Field>

            <Field id="city" label="City" required>
              <Input id="city" name="city" required placeholder="Tiruchirappalli" disabled={pending} />
            </Field>

            <Field id="state" label="State" required>
              <Input id="state" name="state" required placeholder="Tamil Nadu" disabled={pending} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="contactPersonName" label="Contact Person's Name" required>
              <Input
                id="contactPersonName"
                name="contactPersonName"
                required
                placeholder="Prof. S. Ranganathan"
                disabled={pending}
              />
            </Field>

            <Field id="contactPersonDesignation" label="Designation" required>
              <Input
                id="contactPersonDesignation"
                name="contactPersonDesignation"
                required
                placeholder="Dean / Head of Wellness"
                disabled={pending}
              />
            </Field>
          </div>

          <Field id="website" label="Institution Website (Optional)">
            <Input id="website" name="website" placeholder="https://www.nitt.edu" disabled={pending} />
          </Field>

          <Field id="notes" label="Additional Notes or Specific Campus Requirements (Optional)">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Tell us about your upcoming semester timeline, exam dates, or existing counselling cell setup..."
              className="w-full rounded-xl border border-border bg-subtle px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
              disabled={pending}
            />
          </Field>

          <Button type="submit" loading={pending} className="w-full mt-3 py-3 text-base">
            {pending ? "Submitting Request…" : "Request Institution Onboarding"}
          </Button>

          <p className="text-center text-xs text-muted mt-2">
            Institutional admin accounts are manually vetted and authorized by ManoYug Super Admins. We never expose student data or issue self-serve admin tokens.
          </p>
        </>
      ) : null}
    </form>
  );
}
