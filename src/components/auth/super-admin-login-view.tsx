"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { superAdminSignInAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/messages";

const initial: AuthActionResult | null = null;

export function SuperAdminLoginView() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(superAdminSignInAction, initial);

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.replace(state.redirectTo);
      router.refresh();
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state && !state.ok ? <Alert tone="danger" role="alert">{state.message}</Alert> : null}
      <Field id="super-admin-email" label="Platform email" error={!state?.ok ? state?.fieldErrors?.email : undefined}>
        <Input id="super-admin-email" name="email" type="email" autoComplete="email" required disabled={pending} placeholder="name@company.com" />
      </Field>
      <Field id="super-admin-password" label="Password" error={!state?.ok ? state?.fieldErrors?.password : undefined}>
        <Input id="super-admin-password" name="password" type="password" autoComplete="current-password" required disabled={pending} />
      </Field>
      <Button type="submit" loading={pending} className="w-full">{pending ? "Checking access…" : "Sign in to platform console"}</Button>
      <p className="text-center text-xs leading-5 text-[#64748B]">This address is not listed in public navigation. Only accounts marked as platform administrators can continue.</p>
    </form>
  );
}
