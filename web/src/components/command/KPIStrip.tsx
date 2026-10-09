"use client";

import React from "react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { MetricCard } from "@/components/shared/MetricCard";
import { formatNumber } from "@/lib/utils";
import {
  Users,
  AlertTriangle,
  LifeBuoy,
  Home,
  HeartPulse,
  Compass,
} from "lucide-react";

export function KPIStrip() {
  const { kpis } = useDisasterStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      <MetricCard
        title="Affected Population"
        value={formatNumber(kpis.totalAffected)}
        subtitle="Across 3 coastal blocks"
        change="+12.4%"
        trend="up"
        trendGood={false}
        icon={Users}
        variant="warning"
      />
      <MetricCard
        title="Evacuated Safely"
        value={formatNumber(kpis.totalEvacuated)}
        subtitle="48.1% of vulnerable belt"
        change="+8,200/hr"
        trend="up"
        trendGood={true}
        icon={Compass}
        variant="success"
      />
      <MetricCard
        title="Active SOS Tickets"
        value={kpis.activeSOSCount}
        subtitle={`${kpis.criticalSOSCount} critical life-threats`}
        change="+3 new"
        trend="up"
        trendGood={false}
        icon={LifeBuoy}
        variant="critical"
      />
      <MetricCard
        title="NDRF & ODRAF Teams"
        value={kpis.deployedNDRFTeams}
        subtitle="14 Boats, 4 Airdrop Helis"
        icon={AlertTriangle}
        variant="accent"
      />
      <MetricCard
        title="Shelter Occupancy"
        value={`${kpis.shelterOccupancyRate}%`}
        subtitle={`${kpis.activeSheltersCount} multi-purpose hubs`}
        change="Near capacity"
        trend="up"
        trendGood={false}
        icon={Home}
        variant="default"
      />
      <MetricCard
        title="ICU Surge Index"
        value={`${kpis.hospitalICUCapacityRate}%`}
        subtitle="10 critical beds remaining"
        change="Critical"
        trend="up"
        trendGood={false}
        icon={HeartPulse}
        variant="critical"
      />
    </div>
  );
}
