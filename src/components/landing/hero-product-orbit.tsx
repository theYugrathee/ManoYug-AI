"use client";

import { useEffect, useRef } from "react";

export function HeroProductOrbit() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      stage.style.setProperty("--orbit-x", `${x * 10}deg`);
      stage.style.setProperty("--orbit-y", `${y * -10}deg`);
      stage.style.setProperty("--orbit-light-x", `${50 + x * 30}%`);
      stage.style.setProperty("--orbit-light-y", `${42 + y * 30}%`);
    };
    const reset = () => { stage.style.setProperty("--orbit-x", "0deg"); stage.style.setProperty("--orbit-y", "0deg"); };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", reset);
    return () => { stage.removeEventListener("pointermove", onMove); stage.removeEventListener("pointerleave", reset); };
  }, []);

  return (
    <div ref={stageRef} className="hero-orbit-stage" aria-label="Interactive ManoYug product preview">
      <div className="hero-orbit-halo" aria-hidden="true" />
      <div className="hero-orbit-ring hero-orbit-ring-one" aria-hidden="true" />
      <div className="hero-orbit-ring hero-orbit-ring-two" aria-hidden="true" />
      <div className="hero-orbit-main">
        <div className="hero-orbit-topbar"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#173E31] font-display text-lg font-bold text-white">M</span><div><p className="text-sm font-bold text-[#10231E]">Your space, at your pace</p><p className="text-xs text-[#6B8378]">Private · gentle · always available</p></div></div><span className="h-2.5 w-2.5 rounded-full bg-[#D58E2A] shadow-[0_0_0_5px_rgba(213,142,42,0.12)]" /></div>
        <div className="space-y-4 py-7"><div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-md bg-[#173E31] px-4 py-3 text-sm leading-6 text-white shadow-sm">I&apos;m feeling overwhelmed about everything due this week.</div><div className="max-w-[88%] rounded-2xl rounded-tl-md border border-[#D8E7DD] bg-[#F1F7F2] px-4 py-3 text-sm leading-6 text-[#244D3B]">That sounds like a lot to be carrying. Would it help to slow down for a minute and look at the next smallest thing together?</div></div>
        <div className="grid grid-cols-3 gap-2 border-t border-[#E3ECE6] pt-5 text-center text-[11px] font-semibold text-[#466559]"><span className="rounded-xl bg-[#F1F6F2] px-2 py-2">Talk it through</span><span className="rounded-xl bg-[#F1F6F2] px-2 py-2">Daily check-in</span><span className="rounded-xl bg-[#F1F6F2] px-2 py-2">Grounding tools</span></div>
      </div>
      <div className="hero-orbit-chip hero-orbit-chip-left"><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#97651D]">Care path</span><span className="mt-1 block text-xs font-semibold text-[#4B3820]">Small steps. Clear options.</span></div>
      <div className="hero-orbit-chip hero-orbit-chip-right"><span className="text-lg text-[#D58E2A]">✦</span><span className="text-xs font-bold text-[#315C49]">Available 24/7</span></div>
    </div>
  );
}
