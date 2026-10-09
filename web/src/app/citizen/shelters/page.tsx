"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shelter } from "@/types";
import { Home, MapPin, Phone, Users, ShieldCheck, Search, Navigation } from "lucide-react";
import { CapacityBar } from "@/components/shared/CapacityBar";

export default function CitizenSheltersPage() {
  const [search, setSearch] = useState("");
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    api.getShelters().then((data) => {
      if (data && data.length > 0) {
        setShelters(data);
      }
    });
  }, []);

  const filtered = shelters.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );


  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Find Nearest Disaster Shelter</h1>
        <p className="text-xs text-[#8A8A90] mt-1">
          Government designated multi-purpose cyclone shelters equipped with food, generator power, RO drinking water and doctors.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A90]" />
        <input
          type="text"
          placeholder="Search by area or shelter name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#E2E2E0] border border-[#D4D4D1] rounded-full text-xs text-[#1D1D1F] placeholder-[#8A8A90] shadow-sink-1 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((sh) => (
          <div
            key={sh.id}
            className="p-6 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 space-y-3.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-[#F1F1EF] text-[#2E9E6B] border border-[#D4D4D1] shadow-raise-1">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F] leading-snug">{sh.name}</h3>
                  <p className="text-xs text-[#4A4A4F] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D64545]" /> {sh.address}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#2F6FE0] bg-[#F1F1EF] px-3 py-1 rounded-full border border-[#D4D4D1] shadow-raise-1">
                {sh.distanceKm ?? sh.distance_km ?? 0} km
              </span>
            </div>

            <CapacityBar
              current={sh.currentOccupancy ?? sh.current_occupancy ?? 0}
              total={sh.capacity}
              label="Occupancy Status"
              unit="persons"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(sh.facilities || []).map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#E2E2E0] shadow-sink-1 text-[#4A4A4F]"
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D4D4D1] text-xs">
              <a
                href={`tel:${sh.contactPhone || sh.contact_phone || ""}`}
                className="text-[#4A4A4F] hover:text-[#1D1D1F] flex items-center gap-1.5 font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-[#2E9E6B]" /> {sh.contactPhone || sh.contact_phone || "Contact"}
              </a>
              <a
                href={`https://maps.google.com/?q=${sh.location.lat},${sh.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-[#8E8E93] hover:bg-[#9C9CA1] active:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-semibold flex items-center gap-1.5 shadow-raise-1 text-xs transition-all"
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate (GPS)
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
