"use client";

import { useActionState } from "react";
import { bookAppointmentAction } from "@/lib/student/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AppointmentForm() {
  const [state, action, pending] = useActionState(bookAppointmentAction, null);

  const defaultStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setMinutes(0, 0, 0);
    d.setHours(11);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
  })();

  return (
    <form action={action} className="mt-6 max-w-lg space-y-4">
      {state ? (
        <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>
      ) : null}
      <Field id="startsAt" label="Start time">
        <Input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={defaultStart}
        />
      </Field>
      <Field id="durationMin" label="Duration (minutes)">
        <Input
          id="durationMin"
          name="durationMin"
          type="number"
          min={15}
          max={120}
          defaultValue={30}
          required
        />
      </Field>
      <Field id="notes" label="Notes (optional)">
        <Input id="notes" name="notes" maxLength={300} />
      </Field>
      <Button type="submit" loading={pending}>
        Book appointment
      </Button>
    </form>
  );
}
