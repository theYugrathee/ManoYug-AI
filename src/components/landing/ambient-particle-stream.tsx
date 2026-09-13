"use client";

import { useEffect, useRef } from "react";

type AmbientParticleStreamProps = {
  className?: string;
  density?: "sparse" | "medium";
  direction?: "up" | "down";
};

export function AmbientParticleStream({
  className = "",
  density = "sparse",
  direction = "down",
}: AmbientParticleStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const count = density === "sparse" ? Math.floor(width / 75) : Math.floor(width / 45);

    type Dot = {
      x: number;
      y: number;
      radius: number;
      speed: number;
      alpha: number;
      pulseSpeed: number;
      phase: number;
      driftX: number;
      color: string;
    };

    const dots: Dot[] = [];
    const colors = ["#64748B", "#0284C7", "#0D9488", "#94A3B8"];

    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.8,
        speed: (Math.random() * 0.25 + 0.1) * (direction === "down" ? 1 : -1),
        alpha: Math.random() * 0.3 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      dots.forEach((dot) => {
        if (!prefersReducedMotion) {
          dot.y += dot.speed;
          dot.x += Math.sin(dot.phase) * dot.driftX;
          dot.phase += dot.pulseSpeed;

          // Wrap around edges
          if (direction === "down" && dot.y > height) {
            dot.y = -5;
            dot.x = Math.random() * width;
          } else if (direction === "up" && dot.y < -5) {
            dot.y = height + 5;
            dot.x = Math.random() * width;
          }
        }

        const currentAlpha = dot.alpha + Math.sin(dot.phase) * 0.1;
        const clampedAlpha = Math.max(0.04, Math.min(currentAlpha, 0.45));

        ctx.save();
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 116, 139, ${clampedAlpha * 0.15})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = clampedAlpha;
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 400;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [density, direction]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
