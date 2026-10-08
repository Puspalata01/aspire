import { env } from "../config.ts";
import { mlRequest, checkMlService, getCircuitBreakerState } from "./mlClient.ts";
import { logger } from "../logger.ts";

export type DispatchPlan = {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  assigned_disaster_id: string;
  destination: { lat: number; lng: number; label?: string };
  priority_score: number;
  eta_min: number;
  quantity_deployed: number;
};

export type EvacuationPlan = {
  shelter_id: string;
  shelter_name: string;
  destination: { lat: number; lng: number };
  capacity_available: number;
  estimated_travel_time_min: number;
  safe_route: string;
};

export type ShelterAllocation = {
  shelter_id: string;
  shelter_name: string;
  current_occupancy: number;
  capacity: number;
  available_capacity: number;
  recommended_allocation: number;
};

export type DecisionSupportResult = {
  dispatch_plan: DispatchPlan[];
  evacuation_plan: EvacuationPlan[];
  shelter_allocations: ShelterAllocation[];
};

export type DecisionSupportInput = {
  region_id: string;
  disaster_id: string;
  affected_population: number;
  priority: "low" | "medium" | "high" | "critical";
};

export async function supportDecision(input: DecisionSupportInput): Promise<DecisionSupportResult> {
  if (input.priority === "critical") {
    const dispatchPlan = await mlRequest<DispatchPlan[]>(
      env.ML_SERVICE_URL + "/decision/optimization",
      { method: "POST", body: { ...input, optimize: "dispatch" }, timeout: 20000 }
    ).catch(() => []);
    if (dispatchPlan && dispatchPlan.length > 0) return { dispatch_plan: dispatchPlan, evacuation_plan: [], shelter_allocations: [] };
  }

  return ruleBasedDecisionSupport(input);
}

function ruleBasedDecisionSupport(input: DecisionSupportInput): DecisionSupportResult {
  const priorityWeights: Record<string, number> = { low: 0.5, medium: 0.65, high: 0.8, critical: 0.95 };
  const weight = priorityWeights[input.priority];

  return {
    dispatch_plan: [
      { resource_id: "res-1", resource_name: "NDRF Team Alpha", resource_type: "rescue_team", assigned_disaster_id: input.disaster_id, destination: { lat: 20.25, lng: 85.83, label: "Sector A" }, priority_score: weight, eta_min: 25, quantity_deployed: 12 },
      { resource_id: "res-2", resource_name: "Medical Unit Bravo", resource_type: "medical_unit", assigned_disaster_id: input.disaster_id, destination: { lat: 20.27, lng: 85.85, label: "Sector B" }, priority_score: weight * 0.9, eta_min: 35, quantity_deployed: 8 },
    ],
    evacuation_plan: [
      { shelter_id: "shelter-1", shelter_name: "Puri Town Hall", destination: { lat: 20.255, lng: 85.828 }, capacity_available: 300, estimated_travel_time_min: 18, safe_route: "Grand Road / State Highway 60" },
      { shelter_id: "shelter-2", shelter_name: "SCS College Shelter", destination: { lat: 20.272, lng: 85.845 }, capacity_available: 200, estimated_travel_time_min: 22, safe_route: "Coastal Highway" },
    ],
    shelter_allocations: [
      { shelter_id: "shelter-1", shelter_name: "Puri Town Hall", current_occupancy: 470, capacity: 500, available_capacity: 30, recommended_allocation: 250 },
      { shelter_id: "shelter-2", shelter_name: "SCS College Shelter", current_occupancy: 150, capacity: 350, available_capacity: 200, recommended_allocation: 150 },
    ],
  };
}