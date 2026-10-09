"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Compass, Wind, AlertCircle } from "lucide-react";

interface DarkGlobeHeroProps {
  is3D: boolean;
  showLayers?: boolean;
  showGrid?: boolean;
}

export function DarkGlobeHero({
  is3D,
  showLayers = true,
  showGrid = true,
}: DarkGlobeHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.35, y: -1.4 }); // Initially centered on Indian Ocean / Bay of Bengal
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isHoveredBeacon, setIsHoveredBeacon] = useState(false);

  // Rotation animation loop
  useEffect(() => {
    if (!is3D) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isDragging) {
        setRotation((prev) => ({
          ...prev,
          y: prev.y + dt * 0.08, // Slow majestic rotation
        }));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [is3D, isDragging]);

  // Canvas drawing for 3D Earth Globe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!is3D) {
      // 2D Tactical Coastal Grid View
      draw2DView(ctx, width, height, showLayers, showGrid);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38 * scale;

    // 1. Atmosphere Rim Glow (Outer halo)
    const haloGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.95,
      centerX,
      centerY,
      radius * 1.35
    );
    haloGrad.addColorStop(0, "rgba(59, 108, 255, 0.45)");
    haloGrad.addColorStop(0.3, "rgba(79, 179, 255, 0.22)");
    haloGrad.addColorStop(0.7, "rgba(36, 92, 223, 0.08)");
    haloGrad.addColorStop(1, "rgba(5, 7, 13, 0)");

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. Earth Sphere Base
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Deep Ocean gradient
    const oceanGrad = ctx.createRadialGradient(
      centerX - radius * 0.3,
      centerY - radius * 0.3,
      radius * 0.1,
      centerX,
      centerY,
      radius
    );
    oceanGrad.addColorStop(0, "#0E182D");
    oceanGrad.addColorStop(0.6, "#080F1F");
    oceanGrad.addColorStop(1, "#03060C");

    ctx.fillStyle = oceanGrad;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    // Latitude & Longitude Coordinate Grid (if enabled)
    if (showGrid) {
      drawCoordinateGrids(ctx, centerX, centerY, radius, rotation);
    }

    // 3. Procedural Landmasses & Night City Lights
    drawContinentsAndCityLights(ctx, centerX, centerY, radius, rotation);

    // 4. Subtle Inner Rim Shadow / Shading for 3D Depth
    const innerShadow = ctx.createRadialGradient(
      centerX - radius * 0.2,
      centerY - radius * 0.2,
      radius * 0.7,
      centerX,
      centerY,
      radius
    );
    innerShadow.addColorStop(0, "rgba(0,0,0,0)");
    innerShadow.addColorStop(0.85, "rgba(10, 18, 40, 0.6)");
    innerShadow.addColorStop(1, "rgba(3, 6, 12, 0.95)");

    ctx.fillStyle = innerShadow;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

    ctx.restore();

    // 5. Orbital Arcs / Flow Lines around Earth (as in reference image)
    drawOrbitalArcs(ctx, centerX, centerY, radius, rotation);

    // 6. Selected Focus Point Beacon (Puri Coast: ~20°N, 85°E)
    drawLandfallBeacon(ctx, centerX, centerY, radius, rotation);
  }, [is3D, rotation, scale, showLayers, showGrid]);

  // Helper: Draw 3D Coordinate Grids
  const drawCoordinateGrids = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: { x: number; y: number }
  ) => {
    ctx.strokeStyle = "rgba(79, 179, 255, 0.12)";
    ctx.lineWidth = 1;

    // Latitudes (-60, -30, 0, 30, 60)
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const rLat = r * Math.cos(phi);
      const yLat = -r * Math.sin(phi);

      ctx.beginPath();
      for (let lon = 0; lon <= 360; lon += 5) {
        const theta = (lon * Math.PI) / 180 + rot.y;
        const x3d = rLat * Math.sin(theta);
        const z3d = rLat * Math.cos(theta);
        const y3d = yLat;

        // Apply pitch (rot.x)
        const yp = y3d * Math.cos(rot.x) - z3d * Math.sin(rot.x);
        const zp = y3d * Math.sin(rot.x) + z3d * Math.cos(rot.x);

        if (zp > 0) {
          if (lon === 0) ctx.moveTo(cx + x3d, cy + yp);
          else ctx.lineTo(cx + x3d, cy + yp);
        }
      }
      ctx.stroke();
    }
  };

  // Helper: Draw Continents and Glowing City Lights
  const drawContinentsAndCityLights = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: { x: number; y: number }
  ) => {
    // Curated landmass cluster points (representing major continents and India/Asia coastline)
    const LAND_CENTERS = [
      // India & Odisha coastal arc
      { lat: 20, lon: 85, size: 28, lights: 14 },
      { lat: 15, lon: 78, size: 30, lights: 16 },
      { lat: 28, lon: 77, size: 26, lights: 12 },
      { lat: 22, lon: 88, size: 24, lights: 10 },
      // Southeast Asia
      { lat: 13, lon: 100, size: 32, lights: 12 },
      { lat: 1, lon: 104, size: 18, lights: 8 },
      // East Asia
      { lat: 35, lon: 118, size: 42, lights: 22 },
      { lat: 36, lon: 138, size: 24, lights: 18 },
      // Middle East
      { lat: 25, lon: 55, size: 35, lights: 14 },
      // Europe
      { lat: 48, lon: 12, size: 45, lights: 26 },
      // Africa
      { lat: 0, lon: 20, size: 55, lights: 18 },
      { lat: -25, lon: 28, size: 32, lights: 10 },
      // Americas (when rotated)
      { lat: 40, lon: -95, size: 60, lights: 30 },
      { lat: -15, lon: -50, size: 50, lights: 18 },
    ];

    LAND_CENTERS.forEach((land) => {
      const phi = (land.lat * Math.PI) / 180;
      const theta = (land.lon * Math.PI) / 180 + rot.y;

      const x = r * Math.cos(phi) * Math.sin(theta);
      const y = -r * Math.sin(phi);
      const z = r * Math.cos(phi) * Math.cos(theta);

      // Rotate with pitch rot.x
      const yp = y * Math.cos(rot.x) - z * Math.sin(rot.x);
      const zp = y * Math.sin(rot.x) + z * Math.cos(rot.x);

      // Only draw if facing viewer (zp > -r * 0.1)
      if (zp > -r * 0.15) {
        const screenX = cx + x;
        const screenY = cy + yp;
        const perspective = (zp + r) / (2 * r);
        const radiusScaled = land.size * (r / 240) * Math.max(0.4, perspective);

        // Landmass contour blob
        const landGrad = ctx.createRadialGradient(
          screenX,
          screenY,
          radiusScaled * 0.1,
          screenX,
          screenY,
          radiusScaled
        );
        landGrad.addColorStop(0, "rgba(22, 34, 58, 0.85)");
        landGrad.addColorStop(0.7, "rgba(16, 26, 46, 0.65)");
        landGrad.addColorStop(1, "rgba(10, 18, 32, 0)");

        ctx.fillStyle = landGrad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radiusScaled, 0, Math.PI * 2);
        ctx.fill();

        // Glowing City Lights Cluster (Warm golden #FFD27A & sparkling white)
        for (let i = 0; i < land.lights; i++) {
          const angle = (i * 137.5 * Math.PI) / 180;
          const dist = (radiusScaled * 0.7 * (i + 1)) / land.lights;
          const lx = screenX + Math.cos(angle) * dist;
          const ly = screenY + Math.sin(angle) * dist;

          const isBright = i % 3 === 0;
          ctx.fillStyle = isBright
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(255, 210, 122, 0.85)";

          ctx.beginPath();
          ctx.arc(lx, ly, isBright ? 1.4 : 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  };

  // Helper: Draw Orbit Flow Arcs around the Globe
  const drawOrbitalArcs = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: { x: number; y: number }
  ) => {
    ctx.save();
    ctx.strokeStyle = "rgba(79, 179, 255, 0.4)";
    ctx.lineWidth = 1.4;

    // Elliptical orbit 1
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.25, r * 0.48, rot.y * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Elliptical orbit 2 (inclined)
    ctx.strokeStyle = "rgba(59, 108, 255, 0.28)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.38, r * 0.55, -0.65 + rot.y * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Data packet dot traveling on orbit
    const t = rot.y * 2;
    const px = cx + Math.cos(t) * (r * 1.25);
    const py = cy + Math.sin(t) * (r * 0.48);
    ctx.fillStyle = "#4FB3FF";
    ctx.shadowColor = "#3B6CFF";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helper: Draw the Landfall Beacon at Puri Coast
  const drawLandfallBeacon = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: { x: number; y: number }
  ) => {
    // Puri Lat: 19.81°N, Lon: 85.83°E
    const phi = (19.81 * Math.PI) / 180;
    const theta = (85.83 * Math.PI) / 180 + rot.y;

    const x = r * Math.cos(phi) * Math.sin(theta);
    const y = -r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.cos(theta);

    const yp = y * Math.cos(rot.x) - z * Math.sin(rot.x);
    const zp = y * Math.sin(rot.x) + z * Math.cos(rot.x);

    // Only draw beacon if point is visible on frontal hemisphere
    if (zp > 0) {
      const bx = cx + x;
      const by = cy + yp;

      ctx.save();

      // Expanding ripple rings (CSS/canvas sync)
      const now = performance.now() / 1000;
      const ring1 = ((now % 2.4) / 2.4) * 28;
      const alpha1 = Math.max(0, 1 - (now % 2.4) / 2.4);

      const ring2 = (((now + 1.2) % 2.4) / 2.4) * 28;
      const alpha2 = Math.max(0, 1 - ((now + 1.2) % 2.4) / 2.4);

      // Ring 1
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha1 * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, ring1 + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 2
      ctx.strokeStyle = `rgba(79, 179, 255, ${alpha2 * 0.7})`;
      ctx.beginPath();
      ctx.arc(bx, by, ring2 + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Solid central beacon point (bright white with blue halo)
      ctx.shadowColor = "#3B6CFF";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();

      // Landfall Tag
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(16, 22, 36, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;

      const tagW = 140;
      const tagH = 24;
      const tagX = bx + 12;
      const tagY = by - 12;

      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F5F7FB";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.fillText("Puri Coast • Landfall", tagX + 8, tagY + 15);

      ctx.restore();
    }
  };

  // Helper: 2D Tactical View
  const draw2DView = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    showLayers: boolean,
    showGrid: boolean
  ) => {
    // 2D Tactical Map background
    ctx.fillStyle = "#0A0E17";
    ctx.fillRect(0, 0, w, h);

    if (showGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Odisha Coastline Vector
    ctx.strokeStyle = "#3B6CFF";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.7);
    ctx.bezierCurveTo(w * 0.35, h * 0.55, w * 0.65, h * 0.45, w * 0.9, h * 0.2);
    ctx.stroke();

    // Coastal fill
    ctx.fillStyle = "rgba(59, 108, 255, 0.08)";
    ctx.lineTo(w, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Landfall Eye Marker
    const cx = w * 0.55;
    const cy = h * 0.45;
    ctx.fillStyle = "#FF4D5E";
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 77, 94, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#F5F7FB";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText("Puri Coastal Landfall Sector (19.81°N, 85.83°E)", cx + 18, cy + 4);
  };

  // Mouse handlers for dragging/spinning globe
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation((prev) => ({
      x: Math.max(-0.8, Math.min(0.8, prev.x + dy * 0.005)),
      y: prev.y + dx * 0.005,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background radial gradient glow for atmospheric presence */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(59, 108, 255, 0.16) 0%, rgba(79, 179, 255, 0.08) 35%, transparent 70%)",
        }}
      />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Map Control Floating Buttons (Right Bottom area of map) */}
      <div className="absolute right-8 bottom-8 flex flex-col gap-2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(1.5, s + 0.15))}
          className="w-9 h-9 rounded-xl bg-[#161D2E]/80 border border-white/10 hover:border-white/20 text-[#9AA3B8] hover:text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setScale((s) => Math.max(0.7, s - 0.15))}
          className="w-9 h-9 rounded-xl bg-[#161D2E]/80 border border-white/10 hover:border-white/20 text-[#9AA3B8] hover:text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setScale(1);
            setRotation({ x: 0.35, y: -1.4 });
          }}
          className="w-9 h-9 rounded-xl bg-[#161D2E]/80 border border-white/10 hover:border-[#3B6CFF] text-[#3B6CFF] flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          title="Reset Alignment"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
