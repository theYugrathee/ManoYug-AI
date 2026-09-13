"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroNetworkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = window.innerWidth < 768;

    // ─── 1. Scene & Camera ───
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.002);

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    camera.position.set(0, isMobile ? 12 : 18, isMobile ? 130 : 110);

    // ─── 2. WebGL Renderer ───
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);

    // ─── 3. Texture for Soft Luminous Nodes ───
    const createNodeTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.9)");
      grad.addColorStop(0.3, "rgba(5, 150, 105, 0.55)");
      grad.addColorStop(0.65, "rgba(13, 148, 136, 0.2)");
      grad.addColorStop(1, "rgba(13, 148, 136, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const nodeTexture = createNodeTexture();

    // ─── 4. Dynamic 3D Flowing Wave Grid ───
    const gridCols = isMobile ? 32 : 54;
    const gridRows = isMobile ? 20 : 34;
    const totalGridPoints = gridCols * gridRows;

    const gridPositions = new Float32Array(totalGridPoints * 3);
    const gridColors = new Float32Array(totalGridPoints * 3);
    const initialGridData: { x: number; z: number; phase: number; freq: number }[] = [];

    const spacingX = isMobile ? 5.8 : 5.2;
    const spacingZ = isMobile ? 5.8 : 5.2;
    const offsetX = (gridCols * spacingX) / 2;
    const offsetZ = (gridRows * spacingZ) / 2;

    const colorEmerald = new THREE.Color("#059669");
    const colorTeal = new THREE.Color("#0D9488");
    const colorCyan = new THREE.Color("#14B8A6");
    const colorSlate = new THREE.Color("#94A3B8");

    let pIdx = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = c * spacingX - offsetX;
        const z = r * spacingZ - offsetZ - 25;
        const y = Math.sin(c * 0.22) * 3 + Math.cos(r * 0.22) * 3 - 22;

        gridPositions[pIdx * 3] = x;
        gridPositions[pIdx * 3 + 1] = y;
        gridPositions[pIdx * 3 + 2] = z;

        initialGridData.push({
          x,
          z,
          phase: (c * 0.12 + r * 0.15) % (Math.PI * 2),
          freq: 0.7 + Math.random() * 0.3,
        });

        // Subtle gradient coloring based on radial distance from center
        const distFromCenter = Math.sqrt(x * x + z * z);
        const normDist = Math.min(1, distFromCenter / (offsetX * 1.1));
        const cColor = normDist < 0.35 ? colorEmerald : normDist < 0.7 ? colorTeal : normDist < 0.88 ? colorCyan : colorSlate;

        gridColors[pIdx * 3] = cColor.r;
        gridColors[pIdx * 3 + 1] = cColor.g;
        gridColors[pIdx * 3 + 2] = cColor.b;

        pIdx++;
      }
    }

    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));
    gridGeometry.setAttribute("color", new THREE.BufferAttribute(gridColors, 3));

    const gridMaterial = new THREE.PointsMaterial({
      size: isMobile ? 2.6 : 3.2,
      vertexColors: true,
      map: nodeTexture || undefined,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const wavePoints = new THREE.Points(gridGeometry, gridMaterial);
    scene.add(wavePoints);

    // ─── 5. Ambient Floating Particles (No straight lines, clean subtle atmosphere) ───
    const orbCount = isMobile ? 18 : 32;
    const orbPositions = new Float32Array(orbCount * 3);
    const orbColors = new Float32Array(orbCount * 3);
    const orbVelocities: { x: number; y: number; z: number; ox: number; oy: number; oz: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < orbCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 35 + Math.random() * 75;
      const ox = Math.cos(theta) * radius;
      const oy = (Math.random() - 0.25) * 40 - 5;
      const oz = Math.sin(theta) * (radius * 0.55) - 15;

      orbPositions[i * 3] = ox;
      orbPositions[i * 3 + 1] = oy;
      orbPositions[i * 3 + 2] = oz;

      orbVelocities.push({
        x: ox,
        y: oy,
        z: oz,
        ox,
        oy,
        oz,
        speed: 0.006 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
      });

      const orbColor = i % 3 === 0 ? colorEmerald : i % 3 === 1 ? colorTeal : colorCyan;
      orbColors[i * 3] = orbColor.r;
      orbColors[i * 3 + 1] = orbColor.g;
      orbColors[i * 3 + 2] = orbColor.b;
    }

    const orbGeometry = new THREE.BufferGeometry();
    orbGeometry.setAttribute("position", new THREE.BufferAttribute(orbPositions, 3));
    orbGeometry.setAttribute("color", new THREE.BufferAttribute(orbColors, 3));

    const orbMaterial = new THREE.PointsMaterial({
      size: isMobile ? 3.8 : 4.8,
      vertexColors: true,
      map: nodeTexture || undefined,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const floatingOrbs = new THREE.Points(orbGeometry, orbMaterial);
    scene.add(floatingOrbs);

    // ─── 6. Cursor Interaction & Responsive Tracking ───
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = isMobile ? 12 : 18;
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX = (e.clientX - cx) / cx;
      mouseY = (e.clientY - cy) / cy;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // ─── 7. 60 FPS Kinetic Animation Loop ───
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax tracking cursor and scroll
      if (!prefersReducedMotion) {
        targetCameraX = mouseX * (isMobile ? 10 : 20);
        targetCameraY = (isMobile ? 12 : 18) - mouseY * (isMobile ? 8 : 14);

        camera.position.x += (targetCameraX - camera.position.x) * 0.04;
        camera.position.y += (targetCameraY - camera.position.y) * 0.04;

        const targetZ = (isMobile ? 130 : 110) + Math.min(scrollY * 0.05, 30);
        camera.position.z += (targetZ - camera.position.z) * 0.04;

        // Subtle slow rotation
        wavePoints.rotation.y = elapsedTime * 0.02;
        floatingOrbs.rotation.y = elapsedTime * 0.015;
      }

      // Animate 3D Wave Surface Vertices (soothing organic wave)
      const posAttr = gridGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < totalGridPoints; i++) {
        const d = initialGridData[i];
        if (!prefersReducedMotion) {
          const wave1 = Math.sin(elapsedTime * 1.1 * d.freq + d.phase) * 5.0;
          const wave2 = Math.cos(elapsedTime * 0.7 + d.x * 0.06) * 2.8;
          const ripple = Math.sin(elapsedTime * 1.3 + Math.sqrt(d.x * d.x + d.z * d.z) * 0.07) * 2.2;

          posArray[i * 3 + 1] = wave1 + wave2 + ripple - 20;
        }
      }
      posAttr.needsUpdate = true;

      // Animate Floating Orbs (peaceful breathing drift)
      const orbPosAttr = orbGeometry.attributes.position as THREE.BufferAttribute;
      const orbPosArray = orbPosAttr.array as Float32Array;

      for (let i = 0; i < orbCount; i++) {
        const vel = orbVelocities[i];
        if (!prefersReducedMotion) {
          vel.phase += vel.speed;
          orbPosArray[i * 3] = vel.ox + Math.sin(vel.phase + i) * 4.5;
          orbPosArray[i * 3 + 1] = vel.oy + Math.cos(vel.phase * 1.1 + i) * 3.5;
          orbPosArray[i * 3 + 2] = vel.oz + Math.sin(vel.phase * 0.7 + i) * 3.0;
        }
      }
      orbPosAttr.needsUpdate = true;

      camera.lookAt(0, -4, -20);
      renderer.render(scene, camera);
    };

    animate();

    // ─── 8. Cleanup ───
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      gridGeometry.dispose();
      gridMaterial.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      if (nodeTexture) nodeTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    />
  );
}
