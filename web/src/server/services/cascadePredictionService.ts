import { mlRequest } from "./mlClient.ts";
import { logger } from "../logger.ts";

export type CascadeNode = {
  id: string;
  label: string;
  probability: number;
  time_offset_hrs: number;
};

export type CascadeEdge = {
  from: string;
  to: string;
  causality: string;
};

export type CascadeResult = {
  cascade_graph: {
    nodes: CascadeNode[];
    edges: CascadeEdge[];
  };
  critical_interventions: Array<{
    intervention: string;
    mitigation_target: string;
    cascade_risk_reduction: string;
  }>;
};

export type CascadePredictionInput = {
  primary_event: {
    hazard_type: string;
    wind_speed_kmh?: number;
    landfall_lat?: number;
    landfall_lng?: number;
    duration_hours: number;
  };
  max_cascade_depth: number;
};

function ruleBasedCascade(input: CascadePredictionInput): CascadeResult {
  const { primary_event, max_cascade_depth } = input;

  const nodes: CascadeNode[] = [
    { id: "n1", label: `${primary_event.hazard_type.charAt(0).toUpperCase() + primary_event.hazard_type.slice(1)} Event`, probability: 1.0, time_offset_hrs: 0 },
  ];

  const chains: Record<string, Array<{ label: string; probability: number; time_offset_hrs: number }>> = {
    flood: [
      { label: "Urban Flooding & Drainage Overload", probability: 0.85, time_offset_hrs: 2 },
      { label: "Infrastructure Damage (Roads/Bridges)", probability: 0.72, time_offset_hrs: 6 },
      { label: "Waterborne Disease Outbreak Risk", probability: 0.55, time_offset_hrs: 72 },
    ],
    cyclone: [
      { label: "Storm Surge & Coastal Inundation", probability: 0.92, time_offset_hrs: 2 },
      { label: "Power Grid Failure", probability: 0.86, time_offset_hrs: 4 },
      { label: "Water Supply Contamination", probability: 0.68, time_offset_hrs: 12 },
    ],
    earthquake: [
      { label: "Structural Collapses & Building Damage", probability: 0.8, time_offset_hrs: 0 },
      { label: "Fire & Hazardous Material Spills", probability: 0.55, time_offset_hrs: 3 },
      { label: "Aftershock Sequence Triggering Landslides", probability: 0.5, time_offset_hrs: 24 },
    ],
  };

  const chain = chains[primary_event.hazard_type] || chains.flood;
  const chainLimit = Math.min(chain.length, max_cascade_depth - 1);

  for (let i = 0; i < chainLimit; i++) {
    const node = chain[i];
    nodes.push({ id: `n${i + 2}`, label: node.label, probability: node.probability, time_offset_hrs: node.time_offset_hrs });
    nodes[nodes.length - 2].id === "n1"
      ? nodes.push({ ...node, id: `n${i + 2}` })
      : null;
  }

  const edges: CascadeEdge[] = chain.map((node, i) => ({
    from: `n${i + 1}`,
    to: `n${i + 2}`,
    causality: "primary_impact_chain",
  }));

  const interventions = [
    { intervention: "Pre-position emergency response teams in high-risk zones", mitigation_target: "n2", cascade_risk_reduction: "25%" },
    { intervention: "Activate early warning systems and public alerts", mitigation_target: "n3", cascade_risk_reduction: "30%" },
    { intervention: "Secure critical infrastructure (power, water, medical)", mitigation_target: "n4", cascade_risk_reduction: "40%" },
  ];

  return { cascade_graph: { nodes, edges }, critical_interventions: interventions };
}

export async function predictCascade(input: CascadePredictionInput): Promise<CascadeResult> {
  try {
    const result = await mlRequest<CascadeResult>("/cascade/simulate", {
      method: "POST",
      body: input,
      timeout: 20000,
      retries: 2,
    });
    return result;
  } catch (error) {
    logger.warn("Cascade prediction fell back to rule-based engine");
    return ruleBasedCascade(input);
  }
}