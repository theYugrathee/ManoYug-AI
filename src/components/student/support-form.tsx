"use client";

import { useActionState } from "react";
import { requestSupportAction } from "@/lib/student/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function SupportForm() {
  const [state, action, pending] = useActionState(requestSupportAction, null);

  return (
    <form action={action} className="mt-6 max-w-lg space-y-4">
      {state ? (
        <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>
      ) : null}
      <Field
        id="note"
        label="What would help?"
        hint="Sent securely to your institute support team — not posted publicly."
      >
        <textarea
          id="note"
          name="note"
          required
          rows={4}
          className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
        />
      </Field>
      <Button type="submit" loading={pending}>
        Send request to my institute
      </Button>
    </form>
  );
}
