import { NextResponse } from "next/server";
import { domainStore } from "@/server/domainStore";

export async function GET() {
  const kpis = domainStore.getDashboardKpis();
  return NextResponse.json({
    totalAffected: kpis.total_affected_population,
    totalEvacuated: 124500,
    activeSOSCount: kpis.pending_sos_reports,
    criticalSOSCount: 2,
    resolvedSOSCount: kpis.resolved_sos_reports,
    deployedNDRFTeams: kpis.deployed_rescue_teams,
    activeSheltersCount: kpis.relief_camps_active,
    shelterOccupancyRate: kpis.relief_camps_occupancy_rate,
    hospitalICUCapacityRate: 84,
    safeRoadCoveragePct: 79,
    aiConfidenceScore: 94.2,
    ...kpis,
  });
}

