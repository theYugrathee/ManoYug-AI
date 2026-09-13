"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { CrisisPanel, type CampusSafetyContact } from "@/components/safety/crisis-panel";
import type { SafetyUiMode } from "@/lib/safety";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  feedback?: "helpful" | "unhelpful";
};

type DecisionPayload = {
  uiMode: SafetyUiMode;
  assessment: { state: "GREEN" | "AMBER" | "RED" | "IMMINENT" };
};

const SUGGESTIONS = [
  "I'm feeling overwhelmed with exams and backlogs",
  "Placement pressure is really getting to me",
  "I feel lonely in the hostel and miss home",
  "I can't sleep because my mind won't stop racing",
  "I just need someone to listen without judgment",
  "Can you guide me through a 2-minute breathing reset?",
];

export function ChatClient({
  conversationId,
  initialMessages,
  campusContacts = [],
}: {
  conversationId?: string;
  initialMessages: ChatMessage[];
  campusContacts?: CampusSafetyContact[];
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q");

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [activeId] = useState(conversationId);
  const [decision, setDecision] = useState<DecisionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (initialQuery && messages.length === 0 && !pending) {
      setInput(initialQuery);
    }
  }, [initialQuery, messages.length, pending]);

  const crisis =
    decision?.uiMode === "crisis_fullscreen" &&
    (decision.assessment.state === "RED" || decision.assessment.state === "IMMINENT");

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleFeedback(id: string, rating: "helpful" | "unhelpful") {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: rating } : m)),
    );
  }

  function stopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  function send(textToSend?: string) {
    const text = (textToSend ?? input).trim();
    if (!text || pending) return;

    setError(null);
    setInput("");
    const optimisticId = `user-${Date.now()}`;
    const assistantId = `asst-${Date.now()}`;

    setMessages((m) => [
      ...m,
      { id: optimisticId, role: "user", content: text },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    startTransition(async () => {
      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeId,
            message: text,
            language: "en",
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const fallback = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId: activeId,
              message: text,
              language: "en",
            }),
          });
          const data = await fallback.json();
          if (!fallback.ok || !data.ok) {
            setError(data.message ?? "Could not send message. Try again.");
            setMessages((m) => m.filter((x) => x.id !== assistantId));
            return;
          }
          setMessages((m) =>
            m.map((x) =>
              x.id === assistantId ? { ...x, content: data.assistantText } : x,
            ),
          );
          if (data.decision) setDecision(data.decision);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const payload = JSON.parse(dataStr);
              if ((payload.type === "token" || payload.type === "chunk") && payload.text) {
                setMessages((m) =>
                  m.map((x) =>
                    x.id === assistantId
                      ? { ...x, content: x.content + payload.text }
                      : x,
                  ),
                );
              }
              if (payload.type === "replace" && payload.text) {
                setMessages((m) =>
                  m.map((x) =>
                    x.id === assistantId ? { ...x, content: payload.text! } : x,
                  ),
                );
              }
              if (payload.type === "done") {
                if (payload.decision) setDecision(payload.decision);
                if (payload.assistantText) {
                  setMessages((m) =>
                    m.map((x) =>
                      x.id === assistantId
                        ? { ...x, content: payload.assistantText! }
                        : x,
                    ),
                  );
                }
              }
              if (payload.type === "error") {
                setError(payload.message ?? "Stream failed.");
                setMessages((m) => m.filter((x) => x.id !== assistantId));
              }
            } catch {
              // Ignore partial frame parse
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Network connection issue. Please retry.");
          setMessages((m) => m.filter((x) => x.id !== assistantId));
        }
      } finally {
        abortControllerRef.current = null;
      }
    });
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] md:h-screen flex-col max-w-4xl mx-auto px-4 py-4 md:py-6 relative text-[#0F172A]">
      {crisis ? (
        <div className="mb-4">
          <CrisisPanel state={decision!.assessment.state as "RED" | "IMMINENT"} campusContacts={campusContacts} />
        </div>
      ) : null}

      {(decision?.uiMode === "elevated_banner" || decision?.uiMode === "offer_human") && (
        <Alert tone="warning" title="Verified Support Is Available" className="mb-4 flex-shrink-0">
          If you are feeling overwhelmed, you can reach out to verified campus contacts or national helplines anytime.{" "}
          <Link href="/student/support" className="font-semibold underline underline-offset-4 text-[#0F172A]">
            View Human Support Contacts →
          </Link>
        </Alert>
      )}

      {decision?.uiMode === "blocked_response" && (
        <div className="mb-4 flex-shrink-0">
          <CrisisPanel state="RED" compact campusContacts={campusContacts} />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full px-2 lg:px-4 pb-6 space-y-6" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-7 my-reveal">
            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-white text-2xl font-bold shadow-xs">
              <span className="font-display">M</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] font-display">
                What&apos;s on your mind today?
              </h2>
              <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                A private, confidential space for college life. Talk through exam stress, placement anxiety, or simply decompress.
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  disabled={pending}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left text-xs sm:text-sm text-[#0F172A] shadow-xs transition-all hover:border-[#0F172A] hover:shadow-sm cursor-pointer"
                >
                  <span className="line-clamp-2 leading-relaxed">{suggestion}</span>
                  <span className="block text-[11px] font-semibold text-[#0F172A] mt-2">Ask ManoYug →</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"} my-fade-in-up`}
            >
              <div
                className={`group relative max-w-[88%] sm:max-w-[80%] rounded-2xl px-5 py-4 text-sm ${
                  m.role === "user"
                    ? "bg-[#0F172A] text-white font-medium rounded-tr-xs shadow-xs"
                    : "bg-white border border-[#E2E8F0] text-[#0F172A] leading-relaxed rounded-tl-xs shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.content}
                  {pending && m.role === "assistant" && !m.content ? (
                    <span className="inline-flex items-center gap-2 text-[#64748B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-ping" />
                      ManoYug is reflecting…
                    </span>
                  ) : null}
                </div>

                {/* Assistant Message Action Bar */}
                {m.role === "assistant" && m.content && !pending && (
                  <div className="mt-3.5 pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-[#0F172A] transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === m.id ? "✓ Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">Helpful?</span>
                      <button
                        type="button"
                        onClick={() => handleFeedback(m.id, "helpful")}
                        className={`p-1 rounded hover:bg-slate-100 cursor-pointer ${
                          m.feedback === "helpful" ? "text-emerald-600 font-bold" : "hover:text-[#0F172A]"
                        }`}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(m.id, "unhelpful")}
                        className={`p-1 rounded hover:bg-slate-100 cursor-pointer ${
                          m.feedback === "unhelpful" ? "text-rose-600 font-bold" : "hover:text-[#0F172A]"
                        }`}
                        title="Not helpful"
                      >
                        👎
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {error ? (
        <Alert tone="danger" role="alert" className="mb-4 flex-shrink-0">
          {error}
        </Alert>
      ) : null}

      {/* Composer Area */}
      <div className="relative pt-2 px-2 lg:px-4 flex-shrink-0 w-full mb-2">
        <form
          className="relative max-w-3xl mx-auto flex flex-col gap-1 rounded-2xl border border-[#CBD5E1] bg-white p-3 shadow-xs transition-all focus-within:border-[#0F172A] focus-within:ring-2 focus-within:ring-[#0F172A]/10"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="flex items-end gap-2 w-full">
            <label htmlFor="chat-input" className="sr-only">
              Message ManoYug AI
            </label>
            <Textarea
              id="chat-input"
              value={input}
          maxLength={800}
          onChange={(e) => {
                if (e.target.value.length <= 800) {
                  setInput(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={pending || Boolean(crisis)}
              placeholder={
                crisis
                  ? "Chat paused for safety — please use verified resources above"
                  : "What's on your mind? (Press Enter to send, Shift + Enter for new line)"
              }
              className="min-h-[46px] max-h-[180px] flex-1 resize-none bg-transparent border-0 px-3 py-2.5 text-sm text-[#0F172A] focus-visible:ring-0 focus-visible:outline-none placeholder:text-[#94A3B8]"
            />

            {pending ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={stopGeneration}
                className="mb-1 rounded-xl px-3 h-10 border border-[#CBD5E1] text-xs font-semibold"
                title="Stop response"
              >
                ⏹ Stop
              </Button>
            ) : (
              <Button
                type="submit"
                variant={input.trim() ? "primary" : "secondary"}
                size="sm"
                disabled={Boolean(crisis) || !input.trim() || input.length > 800}
                className="mb-1 rounded-xl w-10 h-10 p-0 flex items-center justify-center cursor-pointer"
                aria-label="Send message"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </Button>
            )}
          </div>

          {/* Character counter */}
          <div className="flex items-center justify-between px-3 pb-1 text-[11px] text-[#94A3B8]">
            <span>800 characters maximum · Hinglish, Hindi, English</span>
            <span className={input.length >= 760 ? "text-rose-600 font-semibold" : ""}>
              {input.length.toLocaleString()}/800
            </span>
          </div>
        </form>

        <p className="text-[11px] text-center text-[#94A3B8] mt-2">
          ManoYug AI is an emotional active-listening companion. It does not provide medical diagnoses or replace professional therapy.
        </p>
      </div>
    </div>
  );
}
