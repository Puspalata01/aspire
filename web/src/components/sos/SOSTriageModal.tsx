"use client";

import React, { useState } from "react";
import { SOSRequest, SOSStatus } from "@/types";
import { useSOSStore } from "@/stores/useSOSStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import {
  X,
  MapPin,
  Phone,
  Users,
  Send,
  Truck,
  HeartPulse,
  Radio,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";

interface SOSTriageModalProps {
  request: SOSRequest;
  onClose: () => void;
}

export function SOSTriageModal({ request, onClose }: { request: SOSRequest; onClose: () => void }) {
  const { updateStatus } = useSOSStore();
  const [selectedTeam, setSelectedTeam] = useState<string>(
    request.assignedTeam || "NDRF Team 4 (Puri District)"
  );
  const [status, setStatus] = useState<SOSStatus>(request.status);

  const handleSave = () => {
    updateStatus(request.id, status, selectedTeam);
    toast.success(`Dispatched ${selectedTeam} to ${request.requesterName}`);
    onClose();
  };

  const tacticalTeams = [
    { id: "NDRF Team 4 (Puri District)", label: "NDRF Inflatable Boat Squad", icon: LifeBuoy, eta: "6 mins", distance: "1.2 km" },
    { id: "ODRAF Swift Rescue Unit 2", label: "ODRAF Heavy Equipment Team", icon: Truck, eta: "11 mins", distance: "3.8 km" },
    { id: "IAF Helicopter Rescue Squad (Puri Station)", label: "IAF Airlift Squad (Chopper)", icon: Radio, eta: "14 mins", distance: "6.5 km" },
    { id: "Red Cross Mobile Trauma Ambulance 4", label: "Red Cross ALS Ambulance", icon: HeartPulse, eta: "8 mins", distance: "1.9 km" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-xl rounded-[22px] border border-[#E7E2DA] bg-white shadow-2xl p-6 text-[#1C1929] space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E7E2DA] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={request.urgency} />
              <span className="font-mono text-xs font-bold text-[#767092]">
                #{request.id.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#1C1929] mt-1.5 flex items-center gap-2">
              <span>Emergency Dispatch:</span>
              <span className="text-[#7C3AED]">{request.requesterName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] border border-[#E7E2DA] text-[#5D5775] hover:text-[#1C1929] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Citizen Distress Information Card */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F7F4] p-4 rounded-[16px] border border-[#E7E2DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#767092] block">Phone Contact</span>
              <span className="font-mono font-semibold text-[#1C1929]">{request.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#767092] block">Citizens Trapped</span>
              <span className="font-bold text-[#DC2626] text-sm">{request.peopleCount} individuals</span>
            </div>
          </div>

          <div className="col-span-2 pt-2 border-t border-[#E7E2DA]">
            <span className="text-[10px] text-[#767092] block">Location Landmark</span>
            <div className="flex items-center gap-1.5 font-medium text-[#1C1929] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              <span>{request.address}</span>
              <span className="text-[10px] font-mono text-[#767092]">
                ({request.location.lat.toFixed(4)}°N, {request.location.lng.toFixed(4)}°E)
              </span>
            </div>
          </div>

          <div className="col-span-2 pt-2 border-t border-[#E7E2DA]">
            <span className="text-[10px] text-[#767092] block">Reported Distress Message</span>
            <p className="text-xs text-[#5D5775] mt-1 italic bg-white p-2.5 rounded-lg border border-[#E7E2DA]">
              &quot;{request.description}&quot;
            </p>
          </div>
        </div>

        {/* Visual Rescue Fleet Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#5D5775] block">
            Select Tactical Dispatch Unit
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tacticalTeams.map((team) => {
              const Icon = team.icon;
              const isSelected = selectedTeam === team.id;
              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? "bg-[#F3E8FF] border-[#7C3AED] text-[#1C1929] shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                      : "bg-[#F8F7F4] border-[#E7E2DA] text-[#5D5775] hover:border-[#7C3AED]/40 hover:text-[#1C1929]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#7C3AED] text-white" : "bg-white text-[#767092] border border-[#E7E2DA]"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{team.label}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#767092]">
                      <span>ETA {team.eta}</span>
                      <span>•</span>
                      <span>{team.distance}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Pills Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#5D5775] block">
            Update Operational Status
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["received", "verified", "in_progress", "resolved"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                  status === st
                    ? st === "resolved"
                      ? "bg-emerald-50 border-emerald-400 text-[#059669]"
                      : st === "in_progress"
                      ? "bg-purple-50 border-purple-400 text-[#7C3AED]"
                      : "bg-orange-50 border-orange-400 text-[#EA580C]"
                    : "bg-[#F8F7F4] border-[#E7E2DA] text-[#767092] hover:text-[#1C1929]"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E2DA]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] border border-[#E7E2DA] text-xs font-semibold text-[#5D5775] hover:text-[#1C1929] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] flex items-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Confirm Tactical Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
