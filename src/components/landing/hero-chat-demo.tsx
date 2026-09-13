"use client";

import { useEffect, useState, useRef } from "react";

const MESSAGES = [
    { role: "user" as const, text: "bhai placement nahi ho rahi... bohot stress ho raha hai" },
    { role: "assistant" as const, text: "Samajh sakta hoon — placement ka pressure real hai, aur ye feelings valid hain. Tum akele nahi ho isme. Batao, kya koi specific cheez zyada stress de rahi hai?" },
];

export function HeroChatDemo() {
    const [visibleMessages, setVisibleMessages] = useState<number>(0);
    const [typedLength, setTypedLength] = useState(0);
    const [started, setStarted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setStarted(true), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!started) return;
        if (visibleMessages >= MESSAGES.length) return;

        const currentMsg = MESSAGES[visibleMessages];
        if (typedLength < currentMsg.text.length) {
            const speed = currentMsg.role === "assistant" ? 18 : 28;
            const timer = setTimeout(() => setTypedLength((l) => l + 1), speed);
            return () => clearTimeout(timer);
        } else {
            const delay = visibleMessages === 0 ? 600 : 1200;
            const timer = setTimeout(() => {
                setVisibleMessages((v) => v + 1);
                setTypedLength(0);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [started, visibleMessages, typedLength]);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-lg mx-auto rounded-2xl border border-border bg-elevated p-5 shadow-[var(--my-shadow-lg)]"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <div className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center text-[var(--my-brand-fg)] text-xs font-bold">M</div>
                <span className="text-sm font-medium text-foreground">ManoYug AI</span>
                <span className="ml-auto text-[10px] text-[var(--my-fg-subtle)]">AI companion · not a therapist</span>
            </div>

            {/* Messages */}
            <div className="space-y-3 min-h-[120px]">
                {MESSAGES.map((msg, i) => {
                    if (i > visibleMessages) return null;
                    const isTyping = i === visibleMessages;
                    const displayText = isTyping ? msg.text.slice(0, typedLength) : msg.text;
                    if (!displayText && !isTyping) return null;

                    return (
                        <div
                            key={i}
                            className={
                                msg.role === "user"
                                    ? "ml-10 rounded-xl bg-brand-subtle px-3.5 py-2.5 text-sm"
                                    : "mr-6 rounded-xl border border-border px-3.5 py-2.5 text-sm"
                            }
                            style={{ animation: i === visibleMessages && typedLength <= 1 ? "my-fade-in-up 0.3s ease both" : undefined }}
                        >
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--my-fg-subtle)]">
                                {msg.role === "user" ? "Student" : "ManoYug AI"}
                            </p>
                            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                                {displayText}
                                {isTyping && msg.role === "assistant" && typedLength < msg.text.length ? (
                                    <span className="my-caret" />
                                ) : null}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Composer placeholder */}
            <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-border bg-subtle px-3.5 py-2.5 text-sm text-[var(--my-fg-subtle)]">
                    What&apos;s on your mind?
                </div>
                <div className="rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-[var(--my-brand-fg)]">
                    Send
                </div>
            </div>

            {/* Ambient glow */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
        </div>
    );
}
