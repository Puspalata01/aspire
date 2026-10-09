"use client";

import React, { useEffect, useState } from "react";
import { useMapStore } from "@/stores/useMapStore";
import { api } from "@/lib/api";
import { Shelter, Hospital, Resource } from "@/types";
import { RealEarthMap } from "./RealEarthMap";

export function MapboxView({ height = "100%" }: { height?: string }) {
  const { center, zoom, layers, setSelectedEntity } = useMapStore();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getShelters(),
      api.getHospitals(),
      api.getResources(),
    ]).then(([sh, h, r]) => {
      if (!isMounted) return;
      if (sh && sh.length > 0) setShelters(sh);
      if (h && h.length > 0) setHospitals(h);
      if (r && r.length > 0) setResources(r);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#05070D] rounded-[20px] shadow-2xl"
      style={{ height }}
    >
      <RealEarthMap
        height="100%"
        initialMode="globe"
        initialTheme="satellite"
        initialCenter={[center.lng || 85.82, center.lat || 20.29]}
        initialZoom={zoom || 7.5}
        initialPitch={40}
        shelters={layers.shelters ? shelters : []}
        hospitals={layers.hospitals ? hospitals : []}
        resources={layers.ndrfUnits ? resources : []}
        onSelectEntity={(entity) => {
          const entityType = entity?.capacity ? "shelter" : entity?.icuBeds ? "hospital" : "hazard";
          setSelectedEntity({ type: entityType, id: entity.id, data: entity });
        }}
        showTopBar={true}
        showTelemetryBar={true}
        showCameraControls={true}
      />
    </div>
  );
}
