"use client";

import { useState, useTransition } from "react";
import {
  startMfaEnrollAction,
  verifyMfaEnrollAction,
} from "@/lib/privacy/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function MfaEnrollPanel() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-8 space-y-4 rounded-md border border-border bg-elevated p-4">
      <h2 className="font-semibold text-foreground">Enroll authenticator (TOTP)</h2>
      {error ? (
        <Alert tone="danger" role="alert">
          {error}
        </Alert>
      ) : null}
      {info ? <Alert tone="success">{info}</Alert> : null}

      {!factorId ? (
        <Button
          type="button"
          loading={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await startMfaEnrollAction();
              if (!res.ok) {
                setError(res.message);
                return;
              }
              setFactorId(res.factorId);
              setQr(res.qrCode);
              setSecret(res.secret);
              setInfo(res.message);
            });
          }}
        >
          Start MFA enrollment
        </Button>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("factorId", factorId);
            startTransition(async () => {
              const res = await verifyMfaEnrollAction(fd);
              if (!res.ok) setError(res.message);
              else setInfo(res.message);
            });
          }}
        >
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="MFA QR code" className="h-40 w-40 bg-white p-2" />
          ) : null}
          {secret ? (
            <p className="break-all text-xs text-muted">Secret: {secret}</p>
          ) : null}
          <Field id="code" label="6-digit code">
            <Input id="code" name="code" inputMode="numeric" required />
          </Field>
          <Button type="submit" loading={pending}>
            Verify & activate
          </Button>
        </form>
      )}
    </div>
  );
}
