"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollReveal({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        /* Respect prefers-reduced-motion */
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.classList.add("my-visible");
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add("my-visible"), delay);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div ref={ref} className={`my-scroll-reveal ${className}`}>
            {children}
        </div>
    );
}
