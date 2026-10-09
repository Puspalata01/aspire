"use client";

import React, { useState } from "react";
import { SOSRequest } from "@/types";
import { useSOSStore } from "@/stores/useSOSStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import {
  X,
  Phone,
  MapPin,
  Users,
  CheckCircle2,
  Truck,
  ShieldAlert,
  Clock,
  Radio,
  LifeBuoy,
  HeartPulse,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export function SOSTriageModal({
  request,
  onClose,
}: {
  request: SOSRequest;
  onClose: () => void;
  }) {
  const { updateStatus } = useSOSStore();
  const [selectedTeam, setSelectedTeam] = useState(
    request.assignedTeam || "NDRF Team Bravo-3 (Inflatable Boat)"
  );
  const [status, setStatus] = useState<SOSRequest["status"]>(request.status);

  const handleSave = () => {
    updateStatus(request.id, status, selectedTeam);
    toast.success(`SOS #${request.id.toUpperCase()} updated: ${status.toUpperCase()} (${selectedTeam})`);
    onClose();
  };

  const tacticalTeams = [
    { id: "NDRF Team Bravo-3 (Inflatable Boat)", label: "NDRF Bravo-3 (Boat)", icon: LifeBuoy, eta: "6 mins", distance: "1.2 km" },
    { id: "ODRAF Unit Echo-1 (Amphibious Vehicle)", label: "ODRAF Echo-1 (Amphibious)", icon: Truck, eta: "11 mins", distance: "2.8 km" },
    { id: "IAF Helicopter Rescue Squad (Puri Station)", label: "IAF Airlift Squad (Chopper)", icon: Radio, eta: "14 mins", distance: "6.5 km" },
    { id: "Red Cross Mobile Trauma Ambulance 4", label: "Red Cross ALS Ambulance", icon: HeartPulse, eta: "8 mins", distance: "1.9 km" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl rounded-[22px] border border-white/10 bg-[#101624] shadow-2xl p-6 text-[#F5F7FB] space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={request.urgency} />
              <span className="font-mono text-xs font-bold text-[#6B7488]">
                #{request.id.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#F5F7FB] mt-1.5 flex items-center gap-2">
              <span>Emergency Dispatch:</span>
              <span className="text-[#3B6CFF]">{request.requesterName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#9AA3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Citizen Distress Information Card */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-[#161D2E]/80 p-4 rounded-[16px] border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B6CFF]/15 border border-[#3B6CFF]/30 flex items-center justify-center text-[#3B6CFF]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#6B7488] block">Phone Contact</span>
              <span className="font-mono font-semibold text-[#F5F7FB]">{request.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF4D5E]/15 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#6B7488] block">Citizens Trapped</span>
              <span className="font-bold text-[#FF4D5E] text-sm">{request.peopleCount} individuals</span>
            </div>
          </div>

          <div className="col-span-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-[#6B7488] block">Location Landmark</span>
            <div className="flex items-center gap-1.5 font-medium text-[#F5F7FB] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF8A3D] shrink-0" />
              <span>{request.address}</span>
              <span className="text-[10px] font-mono text-[#6B7488]">
                ({request.location.lat.toFixed(4)}°N, {request.location.lng.toFixed(4)}°E)
              </span>
            </div>
          </div>

          <div className="col-span-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-[#6B7488] block">Reported Distress Message</span>
            <p className="text-xs text-[#9AA3B8] mt-1 italic bg-[#101624] p-2.5 rounded-lg border border-white/5">
              &quot;{request.description}&quot;
            </p>
          </div>
        </div>

        {/* Visual Rescue Fleet Selection (Show Don't Tell) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#9AA3B8] block">
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
                      ? "bg-[#3B6CFF]/20 border-[#3B6CFF] text-[#F5F7FB] shadow-[0_0_15px_rgba(59,108,255,0.3)]"
                      : "bg-[#161D2E]/60 border-white/5 text-[#9AA3B8] hover:border-white/20"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#3B6CFF] text-white" : "bg-white/5 text-[#9AA3B8]"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{team.label}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#6B7488]">
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
          <label className="text-xs font-bold text-[#9AA3B8] block">
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
                      ? "bg-[#2FD07F]/20 border-[#2FD07F] text-[#2FD07F]"
                      : st === "in_progress"
                      ? "bg-[#3B6CFF]/20 border-[#3B6CFF] text-[#3B6CFF]"
                      : "bg-[#FF8A3D]/20 border-[#FF8A3D] text-[#FF8A3D]"
                    : "bg-[#161D2E]/60 border-white/5 text-[#6B7488] hover:text-[#9AA3B8]"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#9AA3B8] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#3B6CFF] hover:bg-[#325bd4] text-xs font-bold text-white shadow-[0_0_15px_rgba(59,108,255,0.4)] flex items-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Confirm Tactical Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
