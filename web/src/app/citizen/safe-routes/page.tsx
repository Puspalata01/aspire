"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoadSegment } from "@/types";
import { Navigation, AlertTriangle, CheckCircle, Ban, ArrowRight } from "lucide-react";

export default function CitizenSafeRoutesPage() {
  const [roads, setRoads] = useState<RoadSegment[]>([]);

  useEffect(() => {
    api.getRoads().then((data) => {
      if (data && data.length > 0) {
        setRoads(data);
      }
    });
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Safe Evacuation Route Finder</h1>
        <p className="text-xs text-[#8A8A90] mt-1">
          Real-time highway viability avoiding flooded breaches and downed electrical grids.
        </p>
      </div>

      <div className="p-5 rounded-[24px] bg-[#F1F1EF] border border-[#D4D4D1] shadow-raise-2 text-xs text-[#4A4A4F] flex items-start gap-3.5">
        <CheckCircle className="w-5 h-5 text-[#2E9E6B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#1D1D1F] block mb-1 font-bold text-sm">
            RECOMMENDED PRIMARY ROUTE: NH-316 Northbound Expressway
          </strong>
          Take Grand Road to Pipili bypass northward toward Bhubaneswar. Road remains dry with active police traffic marshals.
        </div>
      </div>

      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8A90]">
          Highway & Coastal Road Status
        </h3>
        {roads.map((road) => (

          <div
            key={road.id}
            className="p-5 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-1 hover:shadow-raise-2 transition-all flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    road.status === "open"
                      ? "bg-[#2E9E6B]"
                      : road.status === "blocked"
                      ? "bg-[#D64545]"
                      : "bg-[#2F6FE0]"
                  }`}
                />
                <h4 className="text-xs font-bold text-[#1D1D1F]">{road.name}</h4>
              </div>
              <p className="text-xs text-[#4A4A4F]">{road.notes}</p>
            </div>

            <span
              className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono shadow-raise-1 border ${
                road.status === "open"
                  ? "bg-[#F1F1EF] text-[#2E9E6B] border-[#2E9E6B]"
                  : road.status === "blocked"
                  ? "bg-[#F1F1EF] text-[#D64545] border-[#D64545]"
                  : "bg-[#F1F1EF] text-[#2F6FE0] border-[#2F6FE0]"
              }`}
            >
              {road.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
