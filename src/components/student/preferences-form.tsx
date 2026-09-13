"use client";

import { useState, useTransition } from "react";
import { saveStudentPreferencesAction } from "@/lib/auth/logout";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PreferencesForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 max-w-md space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await saveStudentPreferencesAction(fd);
          setMessage(res.message);
        });
      }}
    >
      {message ? <Alert tone="info">{message}</Alert> : null}
      <div className="space-y-1.5">
        <Label htmlFor="language">Language</Label>
        <select
          id="language"
          name="language"
          className="w-full rounded-md border border-border bg-elevated px-3 py-2.5 text-sm"
          defaultValue="en"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="style">Response style</Label>
        <select
          id="style"
          name="style"
          className="w-full rounded-md border border-border bg-elevated px-3 py-2.5 text-sm"
          defaultValue="balanced"
        >
          <option value="balanced">Balanced</option>
          <option value="brief">Brief</option>
          <option value="warm">Warm</option>
        </select>
      </div>
      <Button type="submit" loading={pending}>
        Save preferences
      </Button>
    </form>
  );
}
