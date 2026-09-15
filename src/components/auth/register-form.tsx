"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerStudentAction } from "@/lib/auth/actions";
import type { AuthActionResult } from "@/lib/auth/messages";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initial: AuthActionResult | null = null;

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    registerStudentAction,
    initial,
  );

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {state && !state.ok ? (
        <Alert tone="danger" role="alert">
          {state.message}
          {state.code === "ACCOUNT_EXISTS" ? (
            <Link className="ml-1 font-semibold underline underline-offset-2" href="/login/student">
              Sign in
            </Link>
          ) : null}
        </Alert>
      ) : null}
      {state?.ok ? (
        <Alert tone="success">{state.message}</Alert>
      ) : null}

      <Field id="fullName" label="Full name" error={errors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          invalid={Boolean(errors?.fullName)}
          disabled={pending}
          placeholder="Aisha Patel"
        />
      </Field>

      <Field id="email" label="Email" error={errors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={Boolean(errors?.email)}
          disabled={pending}
          placeholder="aisha@university.edu"
        />
      </Field>

      <Field
        id="phone"
        label="Phone"
        hint="Indian mobile number"
        error={errors?.phone}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          invalid={Boolean(errors?.phone)}
          disabled={pending}
          placeholder="+91"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="graduationYear"
          label="Graduation year"
          error={errors?.graduationYear}
        >
          <Input
            id="graduationYear"
            name="graduationYear"
            type="number"
            inputMode="numeric"
            required
            invalid={Boolean(errors?.graduationYear)}
            disabled={pending}
            placeholder="2027"
          />
        </Field>

        <Field
          id="universityRollNo"
          label="University roll number (optional)"
          error={errors?.universityRollNo}
        >
          <Input
            id="universityRollNo"
            name="universityRollNo"
            autoComplete="off"
            invalid={Boolean(errors?.universityRollNo)}
            disabled={pending}
            placeholder="CS23049"
          />
        </Field>
      </div>

      <Field
        id="password"
        label="Password"
        hint="At least 10 characters, including a letter and a number"
        error={errors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          invalid={Boolean(errors?.password)}
          disabled={pending}
        />
      </Field>

      <Button type="submit" loading={pending} className="w-full mt-2">
        {pending ? "Creating account…" : "Create student account"}
      </Button>
    </form>
  );
}
