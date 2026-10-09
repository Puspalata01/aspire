import { mlRequest, checkMlService, getCircuitBreakerState } from "./mlClient.ts";

export type RiskAssessmentInput = {
  latitude: number;
  longitude: number;
  radius_km: number;
  hazard_types: string[];
  include_explanation?: boolean;
};

export type RiskComponentScore = {
  flood_inundation_risk?: number;
  structural_vulnerability?: number;
  population_exposure?: number;
  evacuation_impedance?: number;
};

export type FeatureAttribution = {
  feature: string;
  weight: number;
  raw_value: string;
};

export type PredictedTrajectory = {
  hours_ahead: number;
  projected_score: number;
};

export type ActionableProtocol = string;

export type RiskAssessmentResult = {
  risk_score: number;
  risk_category: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  component_scores: RiskComponentScore;
  feature_attributions: FeatureAttribution[];
  predicted_trajectory: PredictedTrajectory[];
  actionable_protocols: ActionableProtocol[];
};

function ruleBasedRiskAssessment(input: RiskAssessmentInput): RiskAssessmentResult {
  const { latitude, longitude, hazard_types } = input;
  let riskScore = 0.3;
  const components: RiskComponentScore = {};
  const attributions: FeatureAttribution[] = [];

  if (hazard_types.includes("flood")) {
    components.flood_inundation_risk = 0.75;
    riskScore += 0.25;
    attributions.push({ feature: "elevation_below_10m", weight: 0.3, raw_value: "estimated" });
  }
  if (hazard_types.includes("cyclone")) {
    components.structural_vulnerability = 0.65;
    riskScore += 0.15;
    attributions.push({ feature: "wind_zone_coastal", weight: 0.25, raw_value: "zone_3" });
  }
  if (hazard_types.includes("landslide")) {
    components.evacuation_impedance = 0.6;
    riskScore += 0.1;
    attributions.push({ feature: "slope_gt_15_deg", weight: 0.2, raw_value: "estimated" });
  }
  if (hazard_types.includes("earthquake")) {
    components.structural_vulnerability = Math.max(components.structural_vulnerability || 0, 0.7);
    riskScore += 0.1;
    attributions.push({ feature: "seismic_zone_4", weight: 0.15, raw_value: "zone_4" });
  }

  riskScore = Math.min(riskScore, 0.95);
  const riskCategory = riskScore >= 0.8 ? "CRITICAL" : riskScore >= 0.6 ? "HIGH" : riskScore >= 0.4 ? "MEDIUM" : "LOW";

  return {
    risk_score: Math.round(riskScore * 1000) / 1000,
    risk_category: riskCategory as any,
    confidence: 0.65,
    component_scores: components,
    feature_attributions: attributions,
    predicted_trajectory: [
      { hours_ahead: 3, projected_score: Math.min(riskScore + 0.02, 0.95) },
      { hours_ahead: 6, projected_score: Math.min(riskScore + 0.05, 0.95) },
      { hours_ahead: 12, projected_score: Math.max(riskScore - 0.05, 0.2) },
    ],
    actionable_protocols: [
      "Monitor local weather and river gauges",
      "Review evacuation routes for identified hazards",
      "Ensure shelter capacity in affected zones",
    ],
  };
}

export async function assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
  const mlHealthy = await checkMlService();
  const circuitState = getCircuitBreakerState();

  if (!mlHealthy || circuitState === "open") {
    return ruleBasedRiskAssessment(input);
  }

  try {
    const result = await mlRequest<RiskAssessmentResult>("/risk/assess", {
      method: "POST",
      body: input,
      timeout: 15000,
      retries: 2,
    });
    return result;
  } catch (error) {
    return ruleBasedRiskAssessment(input);
  }
}

export async function assessFloodRisk(input: { latitude: number; longitude: number; radius_km: number }): Promise<RiskAssessmentResult> {
  return assessRisk({ ...input, hazard_types: ["flood"] });
}

export async function assessMultiHazardRisk(input: { latitude: number; longitude: number; radius_km: number; hazard_types: string[] }): Promise<RiskAssessmentResult> {
  return assessRisk({ ...input, hazard_types: input.hazard_types });
}