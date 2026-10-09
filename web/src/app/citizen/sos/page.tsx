"use client";

import React, { useState } from "react";
import { CitizenSOSModal } from "@/components/citizen/CitizenSOSModal";
import { LifeBuoy, MapPin, Phone, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitizenSOSPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8 text-center pt-4">
      <div className="space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#F1F1EF] text-[#D64545] border-2 border-[#D64545] flex items-center justify-center shadow-raise-2">
          <LifeBuoy className="w-10 h-10 animate-spin" style={{ animationDuration: "12s" }} />
        </div>
        <h1 className="text-3xl font-black text-[#1D1D1F]">EMERGENCY SOS CENTER</h1>
        <p className="text-xs text-[#4A4A4F] max-w-md mx-auto">
          If you or your family are in immediate danger from flooding, falling trees, or medical collapse, transmit an SOS beacon now.
        </p>
      </div>

      <div className="p-4 rounded-full bg-[#E2E2E0] border border-[#D4D4D1] shadow-sink-1 text-xs text-[#1D1D1F] flex items-center justify-center gap-3">
        <MapPin className="w-4 h-4 text-[#D64545]" />
        <span>Live GPS Coordinates Locked: 19.8135° N, 85.8312° E (Puri Coastal)</span>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-14 bg-[#F1F1EF] text-[#D64545] border-2 border-[#D64545] font-extrabold text-base tracking-wider shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 rounded-full transition-all cursor-pointer"
      >
        OPEN SOS TRANSMISSION FORM
      </button>

      <CitizenSOSModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
