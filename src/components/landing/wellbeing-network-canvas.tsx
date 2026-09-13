"use client";

import { useEffect, useRef } from "react";

type NetworkNode = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  glow: string;
  pulsePhase: number;
  isCampusHub: boolean;
};

export function WellbeingNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let dpr = 1;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const nodeCount = isMobile ? 38 : 72;
    const fov = 480;

    const palette = [
      { fill: "rgba(15, 23, 42, ", glow: "rgba(15, 23, 42, 0.2)" },     // Deep Slate
      { fill: "rgba(2, 132, 199, ", glow: "rgba(2, 132, 199, 0.25)" },  // Ocean Blue
      { fill: "rgba(13, 148, 136, ", glow: "rgba(13, 148, 136, 0.25)" },// Clinical Teal
      { fill: "rgba(100, 116, 139, ", glow: "rgba(100, 116, 139, 0.2)" },// Steel Slate
    ];

    const nodes: NetworkNode[] = [];

    function initNodes() {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 100 + Math.random() * 240;
        const p = palette[Math.floor(Math.random() * palette.length)];
        const isHub = i % 10 === 0;

        nodes.push({
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.sin(phi) * Math.sin(theta) * 0.72,
          z: radius * Math.cos(phi),
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.14,
          vz: (Math.random() - 0.5) * 0.16,
          radius: isHub ? Math.random() * 2.2 + 2.5 : Math.random() * 1.4 + 1.0,
          color: p.fill,
          glow: p.glow,
          pulsePhase: Math.random() * Math.PI * 2,
          isCampusHub: isHub,
        });
      }
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    initNodes();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouseRef.current.targetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseRef.current.isHovered = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isHovered = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    const render = () => {
      time += 0.01;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const rotY = time * 0.12 + mouseRef.current.x * 0.35;
      const rotX = Math.sin(time * 0.06) * 0.1 - mouseRef.current.y * 0.25;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Central ambient soft glow
      const corePulse = Math.sin(time * 1.2) * 12 + 60;
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 2.8);
      coreGlow.addColorStop(0, "rgba(2, 132, 199, 0.08)");
      coreGlow.addColorStop(0.4, "rgba(13, 148, 136, 0.03)");
      coreGlow.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // 3D projected nodes
      type ProjectedPoint = {
        px: number;
        py: number;
        pz: number;
        scale: number;
        node: NetworkNode;
      };

      const projected: ProjectedPoint[] = [];

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        const distSq = node.x * node.x + node.y * node.y + node.z * node.z;
        if (distSq > 280 * 280) {
          node.vx *= -1;
          node.vy *= -1;
          node.vz *= -1;
        }

        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;
        const y1 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const distance = fov / (fov + z2 + 220);
        const px = cx + x1 * distance;
        const py = cy + y1 * distance;

        if (distance > 0) {
          projected.push({
            px,
            py,
            pz: z2,
            scale: distance,
            node,
          });
        }
      }

      projected.sort((a, b) => b.pz - a.pz);

      // Connective synapses
      const maxDist = isMobile ? 75 : 95;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.2 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(100, 116, 139, ${alpha})`;
            ctx.lineWidth = 0.75 * Math.min(p1.scale, p2.scale);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of projected) {
        const pulse = Math.sin(time * 2.2 + p.node.pulsePhase) * 0.25 + 0.95;
        const r = p.node.radius * p.scale * pulse;
        const alpha = Math.min(0.85, Math.max(0.15, (p.pz + 280) / 560));

        if (p.node.isCampusHub) {
          const hubGlow = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 3.5);
          hubGlow.addColorStop(0, p.node.glow);
          hubGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = hubGlow;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.8, r), 0, Math.PI * 2);
        ctx.fillStyle = `${p.node.color}${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-90"
      aria-hidden="true"
    />
  );
}
