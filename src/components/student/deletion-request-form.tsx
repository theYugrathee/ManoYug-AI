"use client";

import { useState, useTransition } from "react";
import { requestDataDeletionAction } from "@/lib/privacy/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function DeletionRequestForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 max-w-lg space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await requestDataDeletionAction(fd);
          setMsg({ ok: res.ok, text: res.message });
        });
      }}
    >
      {msg ? (
        <Alert tone={msg.ok ? "success" : "danger"}>{msg.text}</Alert>
      ) : null}
      <Field
        id="reason"
        label="Why are you requesting deletion?"
        hint="Reviewed by authorized staff — not an instant wipe."
      >
        <textarea
          id="reason"
          name="reason"
          required
          rows={3}
          className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
        />
      </Field>
      <Button type="submit" variant="danger" loading={pending}>
        Request deletion
      </Button>
    </form>
  );
}
