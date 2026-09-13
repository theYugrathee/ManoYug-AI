"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resendOtpAction, verifyOtpAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/messages";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initial: AuthActionResult | null = null;

export function OtpForm({ email }: { email: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(verifyOtpAction, initial);
  const [resendState, resendAction, resendPending] = useActionState(
    resendOtpAction,
    initial,
  );

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <div className="mt-8 space-y-6">
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />

        {state && !state.ok ? (
          <Alert tone="danger" role="alert">
            {state.message}
          </Alert>
        ) : null}
        {state?.ok ? (
          <Alert
            tone={
              state.code === "VERIFIED_LINKED" ? "success" : "warning"
            }
          >
            {state.message}
          </Alert>
        ) : null}
        {resendState?.ok ? (
          <Alert tone="info">{resendState.message}</Alert>
        ) : null}

        <Field
          id="token"
          label="Verification code"
          hint={`Sent to ${email || "your email"}`}
          error={errors?.token}
        >
          <Input
            id="token"
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            invalid={Boolean(errors?.token)}
            disabled={pending}
            className="tracking-[0.3em]"
          />
        </Field>

        <Button type="submit" loading={pending} className="w-full">
          {pending ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <form action={resendAction}>
        <input type="hidden" name="email" value={email} />
        <Button
          type="submit"
          variant="ghost"
          loading={resendPending}
          className="w-full"
        >
          Resend code
        </Button>
      </form>
    </div>
  );
}
