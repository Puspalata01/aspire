"use client";

import React from "react";
import { useSOSStore } from "@/stores/useSOSStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { formatTimeAgo } from "@/lib/utils";
import { SOSTriageModal } from "./SOSTriageModal";
import {
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  LifeBuoy,
  Radio,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export function SOSTable() {
  const {
    requests,
    filterUrgency,
    filterStatus,
    searchQuery,
    setFilterUrgency,
    setFilterStatus,
    setSearchQuery,
    selectedRequest,
    setSelectedRequest,
  } = useSOSStore();

  const filteredRequests = requests.filter((r) => {
    if (filterUrgency !== "all" && r.urgency !== filterUrgency) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (
      searchQuery &&
      !r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#101624]/75 p-3 rounded-[16px] border border-white/10 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7488]" />
          <input
            type="text"
            placeholder="Search by civilian name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#161D2E]/80 border border-white/10 rounded-xl text-xs text-[#F5F7FB] placeholder-[#6B7488] focus:outline-none focus:border-[#3B6CFF] transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#9AA3B8]">
            <Filter className="w-3.5 h-3.5 text-[#6B7488]" />
            <span>Acuity:</span>
          </div>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as any)}
            className="bg-[#161D2E]/80 border border-white/10 text-xs text-[#F5F7FB] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3B6CFF]"
          >
            <option value="all" className="bg-[#101624]">All Levels</option>
            <option value="critical" className="bg-[#101624]">Critical (Life-Threat)</option>
            <option value="high" className="bg-[#101624]">High Urgency</option>
            <option value="medium" className="bg-[#101624]">Medium Urgency</option>
            <option value="low" className="bg-[#101624]">Low Urgency</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-[#161D2E]/80 border border-white/10 text-xs text-[#F5F7FB] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#3B6CFF]"
          >
            <option value="all" className="bg-[#101624]">All Statuses</option>
            <option value="received" className="bg-[#101624]">Received</option>
            <option value="verified" className="bg-[#101624]">Verified</option>
            <option value="in_progress" className="bg-[#101624]">In Progress</option>
            <option value="resolved" className="bg-[#101624]">Resolved</option>
          </select>
        </div>
      </div>

      {/* SOS List View */}
      <div className="rounded-[18px] border border-white/10 bg-[#101624]/75 overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="divide-y divide-white/5">
          {filteredRequests.map((sos) => {
            const isCritical = sos.urgency === "critical";
            const isHigh = sos.urgency === "high";

            return (
              <div
                key={sos.id}
                onClick={() => setSelectedRequest(sos)}
                className={`p-4 hover:bg-[#161D2E]/80 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCritical ? "bg-[#FF4D5E]/5" : ""
                }`}
              >
                {/* Left: Urgency Beacon & Citizen Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <SeverityBadge severity={sos.urgency} />

                    <span className="text-xs font-mono font-bold text-[#6B7488]">
                      #{sos.id.toUpperCase()}
                    </span>

                    <span className="text-xs font-bold text-[#F5F7FB]">
                      {sos.requesterName}
                    </span>

                    <span className="text-xs text-[#9AA3B8] flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-[#3B6CFF]" />
                      {sos.phone}
                    </span>

                    {/* Visual 4-Step Traffic-Light Indicator */}
                    <div className="flex items-center gap-1 ml-auto sm:ml-0" title={`Acuity level: ${sos.urgency}`}>
                      <span className={`w-2 h-2 rounded-full ${isCritical ? "bg-[#FF4D5E] shadow-[0_0_8px_#FF4D5E]" : isHigh ? "bg-[#FF8A3D]" : "bg-[#2FD07F]"}`} />
                      <span className="text-[10px] font-mono text-[#6B7488]">
                        Level {isCritical ? "4/4" : isHigh ? "3/4" : "2/4"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#9AA3B8] line-clamp-1 max-w-3xl">
                    &ldquo;{sos.description}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[#6B7488] pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[#F5F7FB]">
                      <MapPin className="w-3 h-3 text-[#FF4D5E] shrink-0" />
                      {sos.address}
                    </span>

                    {/* Visual Trapped People Pill */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B6CFF]/15 text-[#4FB3FF] border border-[#3B6CFF]/30 font-bold">
                      <Users className="w-3 h-3" />
                      {sos.peopleCount} trapped
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[#6B7488]">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(sos.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Operational Status & Dispatch Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono border ${
                        sos.status === "in_progress"
                          ? "bg-[#3B6CFF]/20 text-[#3B6CFF] border-[#3B6CFF]/40"
                          : sos.status === "resolved"
                          ? "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                          : "bg-[#FF8A3D]/20 text-[#FF8A3D] border-[#FF8A3D]/40"
                      }`}
                    >
                      {sos.status.replace("_", " ")}
                    </span>
                    {sos.assignedTeam && (
                      <p className="text-[10px] text-[#6B7488] mt-1 truncate max-w-[140px] flex items-center gap-1 justify-end">
                        <LifeBuoy className="w-3 h-3 text-[#3B6CFF]" />
                        <span>{sos.assignedTeam}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#3B6CFF] text-[#F5F7FB] text-xs font-semibold border border-white/10 hover:border-transparent transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Dispatch</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="p-12 text-center text-[#6B7488]">
              <AlertTriangle className="w-8 h-8 mx-auto text-[#F5C542] mb-2 opacity-80" />
              <p className="text-sm font-semibold text-[#F5F7FB]">No SOS requests match current filters.</p>
              <p className="text-xs text-[#6B7488] mt-1">Try resetting the urgency filter or search keyword.</p>
            </div>
          )}
        </div>
      </div>

      {/* Triage Modal */}
      {selectedRequest && (
        <SOSTriageModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
