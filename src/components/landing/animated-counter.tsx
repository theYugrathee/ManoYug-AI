"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: string;
  className?: string;
};

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        hasAnimated
          ? "opacity-100 translate-y-0 filter-none"
          : "opacity-0 translate-y-3 blur-[2px]"
      } ${className}`}
    >
      {value}
    </div>
  );
}
