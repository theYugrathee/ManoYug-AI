"use client";

import { useActionState } from "react";
import { setPlatformAdminAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function PlatformAdminManager() {
  const [state, action, pending] = useActionState(setPlatformAdminAction, null);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1 text-xs font-semibold text-muted">Teammate email
        <Input name="email" type="email" required placeholder="teammate@company.com" className="mt-2" disabled={pending} />
      </label>
      <input type="hidden" name="enabled" value="true" />
      <Button type="submit" loading={pending}>{pending ? "Saving…" : "Grant platform access"}</Button>
      {state ? <Alert tone={state.ok ? "success" : "danger"} className="sm:col-span-2">{state.message}</Alert> : null}
    </form>
  );
}
