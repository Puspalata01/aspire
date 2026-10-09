"use client";

import React, { useState } from "react";
import { useSOSStore } from "@/stores/useSOSStore";
import { LifeBuoy, X, MapPin } from "lucide-react";
import { toast } from "sonner";

interface CitizenSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CitizenSOSModal({ isOpen, onClose }: CitizenSOSModalProps) {
  const { addSOS } = useSOSStore();
  const [name, setName] = useState("Debashis Patra");
  const [phone, setPhone] = useState("+91 94371 88219");
  const [peopleCount, setPeopleCount] = useState(4);
  const [type, setType] = useState<"rescue" | "medical_emergency" | "food" | "shelter">("rescue");
  const [description, setDescription] = useState(
    "Ground floor flooded up to chest level. 2 elderly persons trapped."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addSOS({
        id: `sos-${Date.now().toString().slice(-4)}`,
        requesterName: name,
        phone,
        location: { lat: 19.8135, lng: 85.8312 },
        address: "Puri Coastal Ward 4, Balukhand Sanctuary Road",
        type,
        urgency: "critical",
        status: "received",
        peopleCount,
        specialNeeds: ["elderly"],
        description,
        createdAt: new Date().toISOString(),
        assignedTeam: null,
        estimatedReachMinutes: null,
      });

      setIsSubmitting(false);
      toast.error(
        "EMERGENCY SOS TRANSMITTED! Unified Command has received your GPS beacon. Keep phone line clear.",
        { duration: 8000 }
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-[24px] border border-[#E7E2DA] bg-white p-6 text-[#1C1929] shadow-2xl space-y-4">
        {/* Urgent Header */}
        <div className="flex items-start justify-between border-b border-[#E7E2DA] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-50 text-[#DC2626] border border-red-200 shadow-xs">
              <LifeBuoy className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#DC2626]">
                DISASTER EMERGENCY SOS
              </h3>
              <p className="text-xs text-[#5D5775]">
                Direct satellite uplink to NDRF & State Control Room
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] border border-[#E7E2DA] text-[#5D5775] hover:text-[#1C1929] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS location pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] text-xs">
          <div className="flex items-center gap-2 text-[#1C1929]">
            <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>Puri Coastal Ward 4 (19.8135° N, 85.8312° E)</span>
          </div>
          <span className="font-mono text-[#059669] font-bold text-[10px]">
            GPS: ±4m
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#5D5775] font-semibold block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl p-2.5 px-4 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="text-[#5D5775] font-semibold block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl p-2.5 px-4 text-[#1C1929] font-mono focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#5D5775] font-semibold block mb-1">
                Emergency Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl p-2.5 px-4 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              >
                <option value="rescue">Immediate Rescue (Trapped)</option>
                <option value="medical_emergency">Medical Emergency / Trauma</option>
                <option value="food">Food & Drinking Water</option>
                <option value="shelter">Shelter Evacuation</option>
              </select>
            </div>
            <div>
              <label className="text-[#5D5775] font-semibold block mb-1">
                Total People Trapped
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl p-2.5 px-4 text-[#1C1929] font-mono focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#5D5775] font-semibold block mb-1">
              Describe Situation & Hazards
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Roof collapsing, rising flood water, elderly or infants present..."
              className="w-full bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl p-3 text-[#1C1929] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_16px_rgba(220,38,38,0.35)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Broadcasting Distress Signal..." : "Transmit Emergency SOS"}
          </button>
        </form>
      </div>
    </div>
  );
}
