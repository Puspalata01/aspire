"use client";

import React, { useState } from "react";
import { useSOSStore } from "@/stores/useSOSStore";
import { Button } from "@/components/ui/button";
import {
  LifeBuoy,
  X,
  MapPin,
  Phone,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SOSRequestType } from "@/types";

export function CitizenSOSModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addSOS } = useSOSStore();
  const [name, setName] = useState("Balaram Sahoo");
  const [phone, setPhone] = useState("+91 98452 11920");
  const [type, setType] = useState<SOSRequestType>("rescue");
  const [peopleCount, setPeopleCount] = useState(4);
  const [description, setDescription] = useState(
    "Water has entered our ground floor up to chest level. 1 elderly person unable to climb stairs."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addSOS({
        id: `sos-${Date.now().toString(36)}`,
        requesterName: name,
        phone,
        location: { lat: 19.8135, lng: 85.8312 },
        address: "Puri Coastal Ward 4, Near Light House",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] p-6 text-[#1D1D1F] shadow-raise-3 space-y-4">
        {/* Urgent Header */}
        <div className="flex items-start justify-between border-b border-[#D4D4D1] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#F1F1EF] text-[#D64545] border border-[#D64545] shadow-raise-1">
              <LifeBuoy className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#D64545]">
                DISASTER EMERGENCY SOS
              </h3>
              <p className="text-xs text-[#4A4A4F]">
                Direct satellite uplink to NDRF & State Control Room
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F1EF] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1 text-[#4A4A4F] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS location pill */}
        <div className="flex items-center justify-between p-3 rounded-full bg-[#E2E2E0] border border-[#D4D4D1] shadow-sink-1 text-xs">
          <div className="flex items-center gap-2 text-[#1D1D1F]">
            <MapPin className="w-4 h-4 text-[#D64545] shrink-0" />
            <span>Puri Coastal Ward 4 (19.8135° N, 85.8312° E)</span>
          </div>
          <span className="font-mono text-[#2E9E6B] font-bold text-[10px]">
            GPS: ±4m
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#4A4A4F] font-semibold block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full p-2.5 px-4 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              />
            </div>
            <div>
              <label className="text-[#4A4A4F] font-semibold block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full p-2.5 px-4 text-[#1D1D1F] font-mono shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#4A4A4F] font-semibold block mb-1">
                Emergency Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full p-2.5 px-4 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              >
                <option value="rescue">Immediate Rescue (Trapped)</option>
                <option value="medical_emergency">Medical Emergency / Trauma</option>
                <option value="food">Food & Drinking Water</option>
                <option value="shelter">Shelter Evacuation</option>
              </select>
            </div>
            <div>
              <label className="text-[#4A4A4F] font-semibold block mb-1">
                Total People Trapped
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-full p-2.5 px-4 text-[#1D1D1F] font-mono shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4A4A4F] font-semibold block mb-1">
              Describe Situation & Hazards
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Roof collapsing, rising flood water, elderly or infants present..."
              className="w-full bg-[#E2E2E0] border border-[#D4D4D1] rounded-[16px] p-3 text-[#1D1D1F] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#F1F1EF] border-2 border-[#D64545] text-[#D64545] font-extrabold text-sm uppercase tracking-wider shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 rounded-full transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Broadcasting Distress Signal..." : "Transmit Emergency SOS"}
          </button>
        </form>
      </div>
    </div>
  );
}
