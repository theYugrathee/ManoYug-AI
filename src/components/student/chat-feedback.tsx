"use client";

import { useState, useTransition } from "react";
import { submitMessageFeedbackAction } from "@/lib/privacy/actions";
import { Button } from "@/components/ui/button";

export function ChatFeedback({ conversationId }: { conversationId?: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(rating: "up" | "down" | "report") {
    const fd = new FormData();
    fd.set("rating", rating);
    if (conversationId) fd.set("conversationId", conversationId);
    startTransition(async () => {
      const res = await submitMessageFeedbackAction(fd);
      setNote(res.message);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span>Was this helpful?</span>
      <Button type="button" size="sm" variant="ghost" loading={pending} onClick={() => send("up")}>
        Helpful
      </Button>
      <Button type="button" size="sm" variant="ghost" loading={pending} onClick={() => send("down")}>
        Not helpful
      </Button>
      <Button type="button" size="sm" variant="ghost" loading={pending} onClick={() => send("report")}>
        Report
      </Button>
      {note ? <span className="text-[var(--my-success)]">{note}</span> : null}
    </div>
  );
}
