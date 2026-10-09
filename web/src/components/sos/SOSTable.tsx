"use client";

import React, { useState } from "react";
import { useSOSStore } from "@/stores/useSOSStore";
import { SOSRequest, SeverityLevel, SOSStatus } from "@/types";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { SOSTriageModal } from "./SOSTriageModal";
import {
  Phone,
  MapPin,
  Clock,
  Search,
  Filter,
  Users,
  AlertTriangle,
  ChevronRight,
  LifeBuoy,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export function SOSTable() {
  const { requests } = useSOSStore();
  const [selectedRequest, setSelectedRequest] = useState<SOSRequest | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<SeverityLevel | "all">("all");
  const [filterStatus, setFilterStatus] = useState<SOSStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const sosList = Array.isArray(requests) ? requests : [];

  const filteredRequests = sosList.filter((sos) => {
    if (!sos) return false;
    if (filterUrgency !== "all" && sos.urgency !== filterUrgency) return false;
    if (filterStatus !== "all" && sos.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (sos.requesterName || "").toLowerCase().includes(q) ||
        (sos.phone || "").includes(q) ||
        (sos.address || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white/95 p-3 rounded-[16px] border border-[#E7E2DA] shadow-[0_8px_20px_rgba(124,58,237,0.04)] backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#767092]" />
          <input
            type="text"
            placeholder="Search by civilian name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl text-xs text-[#1C1929] placeholder-[#767092] focus:outline-none focus:border-[#7C3AED] transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#5D5775]">
            <Filter className="w-3.5 h-3.5 text-[#767092]" />
            <span>Acuity:</span>
          </div>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as any)}
            className="bg-[#F8F7F4] border border-[#E7E2DA] text-xs text-[#1C1929] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#7C3AED]"
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical (Life-Threat)</option>
            <option value="high">High Urgency</option>
            <option value="medium">Medium Urgency</option>
            <option value="low">Low Urgency</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-[#F8F7F4] border border-[#E7E2DA] text-xs text-[#1C1929] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#7C3AED]"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* SOS List View */}
      <div className="rounded-[18px] border border-[#E7E2DA] bg-white/95 overflow-hidden backdrop-blur-xl shadow-[0_10px_30px_rgba(124,58,237,0.06)]">
        <div className="divide-y divide-[#E7E2DA]">
          {filteredRequests.map((sos) => {
            const isCritical = sos.urgency === "critical";
            const isHigh = sos.urgency === "high";

            return (
              <div
                key={sos.id}
                onClick={() => setSelectedRequest(sos)}
                className={`p-4 hover:bg-[#FBF9F5] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCritical ? "bg-red-50/40" : ""
                }`}
              >
                {/* Left: Urgency Beacon & Citizen Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <SeverityBadge severity={sos.urgency} />

                    <span className="text-xs font-mono font-bold text-[#767092]">
                      #{sos.id.toUpperCase()}
                    </span>

                    <span className="text-xs font-bold text-[#1C1929]">
                      {sos.requesterName}
                    </span>

                    <span className="text-xs text-[#7C3AED] flex items-center gap-1 font-mono font-medium">
                      <Phone className="w-3 h-3 text-[#7C3AED]" />
                      {sos.phone}
                    </span>

                    {/* Visual 4-Step Traffic-Light Indicator */}
                    <div className="flex items-center gap-1 ml-auto sm:ml-0" title={`Acuity level: ${sos.urgency}`}>
                      <span className={`w-2 h-2 rounded-full ${isCritical ? "bg-[#DC2626] shadow-[0_0_8px_#DC2626]" : isHigh ? "bg-[#EA580C]" : "bg-[#059669]"}`} />
                      <span className="text-[10px] font-mono text-[#767092]">
                        Level {isCritical ? "4/4" : isHigh ? "3/4" : "2/4"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5D5775] line-clamp-1 max-w-3xl">
                    &ldquo;{sos.description}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[#767092] pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[#1C1929] font-medium">
                      <MapPin className="w-3 h-3 text-[#DC2626] shrink-0" />
                      {sos.address}
                    </span>

                    {/* Visual Trapped People Pill */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] font-bold">
                      <Users className="w-3 h-3" />
                      {sos.peopleCount} trapped
                    </span>

                    <span className="flex items-center gap-1 font-mono text-[#767092]">
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
                          ? "bg-purple-50 text-[#7C3AED] border-purple-200"
                          : sos.status === "resolved"
                          ? "bg-emerald-50 text-[#059669] border-emerald-200"
                          : "bg-orange-50 text-[#EA580C] border-orange-200"
                      }`}
                    >
                      {sos.status.replace("_", " ")}
                    </span>
                    {sos.assignedTeam && (
                      <p className="text-[10px] text-[#5D5775] mt-1 truncate max-w-[140px] flex items-center gap-1 justify-end">
                        <LifeBuoy className="w-3 h-3 text-[#7C3AED]" />
                        <span>{sos.assignedTeam}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-[#F8F7F4] hover:bg-[#7C3AED] text-[#1C1929] hover:text-white text-xs font-semibold border border-[#E7E2DA] hover:border-transparent transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Dispatch</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="p-12 text-center text-[#767092]">
              <AlertTriangle className="w-8 h-8 mx-auto text-[#D97706] mb-2 opacity-80" />
              <p className="text-sm font-semibold text-[#1C1929]">No SOS requests match current filters.</p>
              <p className="text-xs text-[#767092] mt-1">Try resetting the urgency filter or search keyword.</p>
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
