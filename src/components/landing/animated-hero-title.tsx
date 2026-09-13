"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "When exams feel overwhelming.",
  "When placement pressure gets heavy.",
  "When you just need someone to listen.",
  "When you don't know who to talk to.",
  "When late-night thoughts won't stop.",
];

export function AnimatedHeroTitle() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PHRASES.length);
        setFade(true);
      }, 300);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-300 transform text-brand ${
        fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {PHRASES[index]}
    </span>
  );
}
