"use client";

import { useEffect, useRef } from "react";

export function AiPresenceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = 440);
    const height = (canvas.height = 440);
    let time = 0;

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      angle: number;
      speed: number;
      dist: number;
      color: string;
    }> = [];

    const colors = ["#0D9488", "#0284C7", "#059669", "#334155"];

    for (let i = 0; i < 48; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        radius: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.012,
        dist: 50 + Math.random() * 110,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Outer ambient glow
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
      grad.addColorStop(0, "rgba(2, 132, 199, 0.12)");
      grad.addColorStop(0.5, "rgba(13, 148, 136, 0.05)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Core pulsating sphere
      const corePulse = Math.sin(time * 1.5) * 4 + 44;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse);
      coreGrad.addColorStop(0, "rgba(2, 132, 199, 0.8)");
      coreGrad.addColorStop(0.6, "rgba(13, 148, 136, 0.4)");
      coreGrad.addColorStop(1, "rgba(13, 148, 136, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic orbital wave rings
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        const baseRadius = 60 + r * 35;
        const wave = Math.sin(time * 1.2 + r) * 3;
        ctx.arc(cx, cy, baseRadius + wave, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(13, 148, 136, ${0.2 - r * 0.04})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Orbiting particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none h-full w-full max-w-[440px] max-h-[440px]"
      aria-hidden="true"
    />
  );
}
