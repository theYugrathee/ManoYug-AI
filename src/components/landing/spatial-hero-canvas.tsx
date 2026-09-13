"use client";

import { useEffect, useRef } from "react";

type Node3D = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
  color: string;
  alpha: number;
  pulseOffset: number;
};

export function SpatialHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const nodeCount = isMobile ? 32 : 64;
    const fov = 420;

    const colors = [
      "rgba(15, 23, 42, ",   // Deep Charcoal
      "rgba(2, 132, 199, ",  // Ocean Azure
      "rgba(13, 148, 136, ", // Clinical Teal
      "rgba(100, 116, 139, ",// Steel Slate
    ];

    const nodes: Node3D[] = [];

    function initNodes() {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 120 + Math.random() * 240;

        nodes.push({
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: (radius * Math.sin(phi) * Math.sin(theta)) * 0.7,
          z: radius * Math.cos(phi),
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.15,
          vz: (Math.random() - 0.5) * 0.18,
          baseRadius: Math.random() * 1.5 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.4 + 0.3,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function resize() {
      if (!canvas) return;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    initNodes();

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left - width / 2) / (width / 2);
      mouseRef.current.targetY = (e.clientY - rect.top - height / 2) / (height / 2);
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      const rotY = time * 0.15 + mouseRef.current.x * 0.3;
      const rotX = Math.sin(time * 0.08) * 0.08 - mouseRef.current.y * 0.25;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const cx = width / 2;
      const cy = height / 2;

      type ProjectedNode = {
        px: number;
        py: number;
        pz: number;
        scale: number;
        node: Node3D;
      };

      const projected: ProjectedNode[] = [];

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        const d = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
        if (d > 280) {
          node.vx *= -1;
          node.vy *= -1;
          node.vz *= -1;
        }

        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;

        const y1 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const distance = fov / (fov + z2 + 200);
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

      const maxConnectDist = isMobile ? 70 : 90;
      ctx.lineWidth = 0.75;

      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.14 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(100, 116, 139, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      for (const p of projected) {
        const pulse = Math.sin(time * 2 + p.node.pulseOffset) * 0.25 + 0.95;
        const radius = p.node.baseRadius * p.scale * pulse;
        const alpha = p.node.alpha * Math.max(0.2, Math.min(0.8, p.scale * 1.3));

        ctx.fillStyle = `${p.node.color}${alpha})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-90 transition-opacity duration-1000"
      />
    </div>
  );
}
