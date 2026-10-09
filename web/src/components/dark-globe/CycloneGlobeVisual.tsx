"use client";

import React, { useEffect, useRef, useState } from "react";
import { Compass, Grid3X3, Globe2, Wind, Eye } from "lucide-react";

export function CycloneGlobeVisual() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.38, y: -1.35 }); // Focused on India / Bay of Bengal
  const [is3D, setIs3D] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Gentle subtle breathing rotation when not dragged
      if (!isDragging) {
        setRotation((prev) => ({
          ...prev,
          y: prev.y + dt * 0.02,
        }));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isDragging]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.44;

    // 1. Atmosphere Rim Glow (Outer Halo)
    const haloGrad = ctx.createRadialGradient(
      cx,
      cy,
      radius * 0.96,
      cx,
      cy,
      radius * 1.35
    );
    haloGrad.addColorStop(0, "rgba(59, 108, 255, 0.45)");
    haloGrad.addColorStop(0.3, "rgba(79, 179, 255, 0.22)");
    haloGrad.addColorStop(0.7, "rgba(36, 92, 223, 0.08)");
    haloGrad.addColorStop(1, "rgba(5, 7, 13, 0)");

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. Earth Globe Sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Deep Nocturnal Ocean gradient
    const oceanGrad = ctx.createRadialGradient(
      cx - radius * 0.3,
      cy - radius * 0.3,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    oceanGrad.addColorStop(0, "#0E182D");
    oceanGrad.addColorStop(0.55, "#080F1F");
    oceanGrad.addColorStop(1, "#03060C");

    ctx.fillStyle = oceanGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Coordinate Grid lines
    ctx.strokeStyle = "rgba(79, 179, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const rLat = radius * Math.cos(phi);
      const yLat = -radius * Math.sin(phi);

      ctx.beginPath();
      for (let lon = 0; lon <= 360; lon += 6) {
        const theta = (lon * Math.PI) / 180 + rotation.y;
        const x3d = rLat * Math.sin(theta);
        const z3d = rLat * Math.cos(theta);
        const y3d = yLat;

        const yp = y3d * Math.cos(rotation.x) - z3d * Math.sin(rotation.x);
        const zp = y3d * Math.sin(rotation.x) + z3d * Math.cos(rotation.x);

        if (zp > 0) {
          if (lon === 0) ctx.moveTo(cx + x3d, cy + yp);
          else ctx.lineTo(cx + x3d, cy + yp);
        }
      }
      ctx.stroke();
    }

    // 3. Indian Subcontinent & Asian Landmass + City Lights
    drawIndianLandmass(ctx, cx, cy, radius, rotation);

    // 4. Inner Shadow
    const innerShadow = ctx.createRadialGradient(
      cx - radius * 0.25,
      cy - radius * 0.25,
      radius * 0.7,
      cx,
      cy,
      radius
    );
    innerShadow.addColorStop(0, "rgba(0,0,0,0)");
    innerShadow.addColorStop(0.85, "rgba(10, 18, 40, 0.55)");
    innerShadow.addColorStop(1, "rgba(3, 6, 12, 0.95)");
    ctx.fillStyle = innerShadow;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    ctx.restore();

    // 5. Orbital Arcs
    ctx.save();
    ctx.strokeStyle = "rgba(79, 179, 255, 0.35)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.25, radius * 0.52, rotation.y * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(59, 108, 255, 0.25)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.35, radius * 0.58, -0.6 + rotation.y * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Odisha Glowing Border & Cyclone Vortex
    drawOdishaAndCyclone(ctx, cx, cy, radius, rotation);
  }, [rotation, isDragging, is3D]);

  // Helper to draw Indian landmass and night city lights
  const drawIndianLandmass = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: { x: number; y: number }
  ) => {
    const CITIES = [
      { lat: 20.3, lon: 85.8, name: "Bhubaneswar", lights: 18, size: 26 }, // Odisha
      { lat: 19.8, lon: 85.8, name: "Puri", lights: 14, size: 20 },
      { lat: 22.5, lon: 88.3, name: "Kolkata", lights: 24, size: 30 },
      { lat: 13.0, lon: 80.2, name: "Chennai", lights: 20, size: 28 },
      { lat: 17.3, lon: 78.4, name: "Hyderabad", lights: 22, size: 28 },
      { lat: 19.0, lon: 72.8, name: "Mumbai", lights: 28, size: 34 },
      { lat: 28.6, lon: 77.2, name: "New Delhi", lights: 26, size: 32 },
      { lat: 12.9, lon: 77.5, name: "Bengaluru", lights: 22, size: 28 },
      { lat: 23.0, lon: 72.5, name: "Ahmedabad", lights: 18, size: 26 },
      { lat: 7.8, lon: 80.7, name: "Sri Lanka", lights: 12, size: 18 },
      { lat: 24.0, lon: 90.0, name: "Dhaka", lights: 20, size: 26 },
      { lat: 16.8, lon: 96.1, name: "Myanmar", lights: 14, size: 24 },
    ];

    CITIES.forEach((c) => {
      const phi = (c.lat * Math.PI) / 180;
      const theta = (c.lon * Math.PI) / 180 + rot.y;

      const x = r * Math.cos(phi) * Math.sin(theta);
      const y = -r * Math.sin(phi);
      const z = r * Math.cos(phi) * Math.cos(theta);

      const yp = y * Math.cos(rot.x) - z * Math.sin(rot.x);
      const zp = y * Math.sin(rot.x) + z * Math.cos(rot.x);

      if (zp > -r * 0.1) {
        const sx = cx + x;
        const sy = cy + yp;
        const scale = (zp + r) / (2 * r);
        const radiusScaled = c.size * (r / 220) * Math.max(0.4, scale);

        // Landmass blob
        const landGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, radiusScaled);
        landGrad.addColorStop(0, "rgba(24, 38, 64, 0.8)");
        landGrad.addColorStop(0.7, "rgba(16, 26, 46, 0.6)");
        landGrad.addColorStop(1, "rgba(10, 18, 32, 0)");

        ctx.fillStyle = landGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, radiusScaled, 0, Math.PI * 2);
        ctx.fill();

        // City lights
        for (let i = 0; i < c.lights; i++) {
          const angle = (i * 137.5 * Math.PI) / 180;
          const dist = (radiusScaled * 0.65 * (i + 1)) / c.lights;
          const lx = sx + Math.cos(angle) * dist;
          const ly = sy + Math.sin(angle) * dist;
          const isWhite = i % 3 === 0;

          ctx.fillStyle = isWhite
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(255, 215, 120, 0.85)";
          ctx.beginPath();
          ctx.arc(lx, ly, isWhite ? 1.3 : 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  };

  // Helper to draw highlighted Odisha region + Cyclone Vortex with spiral convective cloud bands
  const drawOdishaAndCyclone = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rot: { x: number; y: number }
  ) => {
    // 1. Odisha Boundary Projection (~20.5°N, 85.5°E)
    const oPhi = (20.5 * Math.PI) / 180;
    const oTheta = (85.5 * Math.PI) / 180 + rot.y;

    const ox = r * Math.cos(oPhi) * Math.sin(oTheta);
    const oy = -r * Math.sin(oPhi);
    const oz = r * Math.cos(oPhi) * Math.cos(oTheta);

    const oyp = oy * Math.cos(rot.x) - oz * Math.sin(rot.x);
    const ozp = oy * Math.sin(rot.x) + oz * Math.cos(rot.x);

    if (ozp > 0) {
      const sx = cx + ox;
      const sy = cy + oyp;

      // Draw Glowing Green Odisha State Boundary
      ctx.save();
      ctx.shadowColor = "#2FD07F";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "#2FD07F";
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      // Stylized coastal polygon for Odisha
      ctx.moveTo(sx - 24, sy - 18);
      ctx.lineTo(sx + 16, sy - 26);
      ctx.lineTo(sx + 28, sy - 8);
      ctx.lineTo(sx + 36, sy + 14); // Coastline
      ctx.lineTo(sx + 14, sy + 32);
      ctx.lineTo(sx - 12, sy + 22);
      ctx.lineTo(sx - 30, sy + 8);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "rgba(47, 208, 127, 0.12)";
      ctx.fill();

      // "Odisha" label
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#2FD07F";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("Odisha", sx - 10, sy + 12);

      // Bhubaneswar Pin
      const bbx = sx + 8;
      const bby = sy - 4;
      ctx.shadowColor = "#3B6CFF";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#3B6CFF";
      ctx.beginPath();
      ctx.arc(bbx, bby, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(bbx, bby, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Bhubaneswar Label Pill
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(16, 22, 36, 0.85)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bbx + 8, bby - 9, 84, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F5F7FB";
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.fillText("Bhubaneswar", bbx + 14, bby + 3);

      ctx.restore();
    }

    // 2. Cyclone Vortex in Bay of Bengal (~18.0°N, 88.0°E)
    const cPhi = (18.0 * Math.PI) / 180;
    const cTheta = (88.0 * Math.PI) / 180 + rot.y;

    const cxPos = r * Math.cos(cPhi) * Math.sin(cTheta);
    const cyPos = -r * Math.sin(cPhi);
    const czPos = r * Math.cos(cPhi) * Math.cos(cTheta);

    const cyp = cyPos * Math.cos(rot.x) - czPos * Math.sin(rot.x);
    const czp = cyPos * Math.sin(rot.x) + czPos * Math.cos(rot.x);

    if (czp > 0) {
      const csx = cx + cxPos;
      const csy = cy + cyp;

      ctx.save();

      // Swirling convective rainband spiral
      const time = performance.now() / 800;
      const vortexGrad = ctx.createRadialGradient(csx, csy, 4, csx, csy, 55);
      vortexGrad.addColorStop(0, "rgba(255, 77, 94, 0.9)");
      vortexGrad.addColorStop(0.25, "rgba(245, 197, 66, 0.7)");
      vortexGrad.addColorStop(0.55, "rgba(47, 208, 127, 0.5)");
      vortexGrad.addColorStop(0.85, "rgba(59, 108, 255, 0.25)");
      vortexGrad.addColorStop(1, "rgba(5, 7, 13, 0)");

      ctx.fillStyle = vortexGrad;
      ctx.beginPath();
      ctx.arc(csx, csy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms
      ctx.strokeStyle = "rgba(245, 197, 66, 0.8)";
      ctx.lineWidth = 2.2;
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2.2; a += 0.15) {
          const armOffset = (arm * (Math.PI * 2)) / 3 + time;
          const currentR = 6 + a * 6;
          const px = csx + Math.cos(a + armOffset) * currentR;
          const py = csy + Math.sin(a + armOffset) * currentR * 0.75;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Cyclone Eye Pin (Bright Red Circle + concentric pulse)
      ctx.shadowColor = "#FF4D5E";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#FF4D5E";
      ctx.beginPath();
      ctx.arc(csx, csy, 10, 0, Math.PI * 2);
      ctx.fill();

      // White spiral icon in eye
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(csx, csy, 4, 0, Math.PI * 1.5);
      ctx.stroke();

      // Dashed Landfall Trajectory Cone (pointing WNW to Puri/Jagatsinghpur)
      ctx.strokeStyle = "rgba(255, 77, 94, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(csx, csy);
      ctx.quadraticCurveTo(csx - 25, csy - 30, csx - 55, csy - 45);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  };

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
      className="relative w-full h-[460px] lg:h-[500px] overflow-hidden rounded-[20px] bg-[#0A0E17]/60 border border-white/10 select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Atmosphere Glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(59, 108, 255, 0.22) 0%, rgba(79, 179, 255, 0.08) 45%, transparent 75%)",
        }}
      />

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* ── Floating Overlay Card 1: Cyclone Forecast (Top-Right of Globe) ── */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <div className="rounded-[14px] bg-[#101624]/85 border border-white/15 p-3.5 backdrop-blur-xl shadow-2xl flex flex-col gap-2 min-w-[210px]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E]">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F5F7FB] leading-tight">
                Cyclone Forecast
              </h4>
              <span className="text-[10px] text-[#FF4D5E] font-medium leading-tight block">
                Landfall in 18 hrs
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1 text-[11px] border-t border-white/10 font-mono">
            <div className="flex items-center justify-between text-[#9AA3B8]">
              <span>Wind Speed</span>
              <span className="text-[#F5F7FB] font-bold">120-150 km/h</span>
            </div>
            <div className="flex items-center justify-between text-[#9AA3B8]">
              <span>Pressure</span>
              <span className="text-[#F5F7FB] font-bold">960 hPa</span>
            </div>
            <div className="flex items-center justify-between text-[#9AA3B8]">
              <span>Path</span>
              <span className="text-[#F5F7FB] font-bold">WNW - NNW</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Overlay Card 2: Map Legend (Bottom-Left of Globe) ── */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <div className="rounded-[14px] bg-[#101624]/85 border border-white/15 px-3 py-2.5 backdrop-blur-xl shadow-xl flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E]" />
            <span className="text-[#F5F7FB] font-medium">Cyclone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B6CFF]" />
            <span className="text-[#F5F7FB] font-medium">Flood</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4FB3FF]" />
            <span className="text-[#F5F7FB] font-medium">Rainfall</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C542]" />
            <span className="text-[#F5F7FB] font-medium">Affected Area</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t border-dashed border-[#FF4D5E]" />
            <span className="text-[#F5F7FB] font-medium">Evacuation Route</span>
          </div>
        </div>
      </div>

      {/* ── Floating Controls (Bottom-Right of Globe) ── */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Compass Rose */}
        <div
          className="w-8 h-8 rounded-full bg-[#101624]/85 border border-white/15 flex items-center justify-center text-[#9AA3B8] shadow-lg backdrop-blur-md"
          title="North"
        >
          <span className="text-[10px] font-bold font-mono text-[#F5F7FB]">N</span>
        </div>

        {/* Globe Grid Toggle */}
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className="w-8 h-8 rounded-full bg-[#101624]/85 hover:bg-[#3B6CFF] border border-white/15 text-[#9AA3B8] hover:text-white flex items-center justify-center shadow-lg backdrop-blur-md transition-colors cursor-pointer"
          title="Toggle Grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
