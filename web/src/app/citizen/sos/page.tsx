"use client";

import React, { useState } from "react";
import { CitizenSOSModal } from "@/components/citizen/CitizenSOSModal";
import { LifeBuoy, MapPin, Phone, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitizenSOSPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8 text-center pt-4 text-[#1C1929] select-none">
      <div className="space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shadow-sm">
          <LifeBuoy className="w-10 h-10 animate-spin" style={{ animationDuration: "12s" }} />
        </div>
        <h1 className="text-3xl font-black text-[#1C1929] tracking-tight">EMERGENCY SOS CENTER</h1>
        <p className="text-xs text-[#5D5775] max-w-md mx-auto leading-relaxed">
          If you or your family are in immediate danger from flooding, falling trees, or medical collapse, transmit an SOS beacon now.
        </p>
      </div>

      <div className="p-4 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] shadow-sm text-xs text-[#1C1929] flex items-center justify-center gap-3">
        <MapPin className="w-4 h-4 text-rose-500" />
        <span className="font-medium">Live GPS Coordinates Locked: 19.8135° N, 85.8312° E (Puri Coastal)</span>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base tracking-wider shadow-sm rounded-full transition-all cursor-pointer"
      >
        OPEN SOS TRANSMISSION FORM
      </button>

      <CitizenSOSModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
