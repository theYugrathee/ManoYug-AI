"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/messages";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initial: AuthActionResult | null = null;

export function LoginForm({ nextPath = "/student" }: { nextPath?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, initial);

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {state && !state.ok ? (
        <Alert tone="danger" role="alert">
          {state.message}
        </Alert>
      ) : null}

      <Field id="email" label="Email" error={errors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={Boolean(errors?.email)}
          disabled={pending}
          placeholder="name@example.com"
        />
      </Field>

      <Field id="password" label="Password" error={errors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(errors?.password)}
          disabled={pending}
        />
      </Field>

      <Button type="submit" loading={pending} className="w-full mt-2">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
