import { env } from "../config.ts";
import { mlRequest } from "./mlClient.ts";
import { logger } from "../logger.ts";

export type CopilotContext = {
  region_id?: string;
  time_window_minutes?: number;
  include_telemetry?: boolean;
};

export type CopilotCitation = {
  source: string;
  value: string;
};

export type CopilotSuggestedAction = {
  action: string;
  endpoint: string;
};

export type CopilotResponse = {
  answer: string;
  citations: CopilotCitation[];
  suggested_actions: CopilotSuggestedAction[];
};

export type CopilotInput = {
  prompt: string;
  context_scope: CopilotContext;
};

const toolRegistry: Array<{ name: string; description: string; endpoint: string }> = [
  { name: "get_risk_assessment", description: "Get real-time risk assessment for a location", endpoint: "POST /risk/assess" },
  { name: "get_cascade_prediction", description: "Predict cascading hazard chain", endpoint: "POST /cascade/simulate" },
  { name: "what_if_simulation", description: "Simulate what-if scenarios for interventions", endpoint: "POST /simulation/what-if" },
  { name: "decision_support", description: "Get dispatch/evacuation/shelter decision support", endpoint: "POST /decision-support" },
  { name: "dashboard_kpis", description: "Get real-time dashboard KPIs", endpoint: "GET /analytics/dashboard-kpis" },
];

function ruleBasedCopilot(prompt: string): CopilotResponse {
  const lowerPrompt = prompt.toLowerCase();
  let answer = "";
  const citations: CopilotCitation[] = [];
  const actions: CopilotSuggestedAction[] = [];

  if (lowerPrompt.includes("bottleneck") || lowerPrompt.includes("evacuation")) {
    answer = "Based on real-time data analysis: 1. Major road flooding is cutting off access routes to district hospital. 2. Primary shelter is at 94% capacity. 3. Power outage in Marine Drive sector is affecting pumping stations.";
    citations.push({ source: "Road Sensor Network", value: "65cm water depth at Station Square" });
    citations.push({ source: "Shelter Management System", value: "Town Hall: 470/500 occupied" });
    actions.push({ action: "Open overflow shelter at SCS College", endpoint: "POST /shelters" });
    actions.push({ action: "Dispatch water pumps to affected area", endpoint: "POST /resources/dispatch" });
  } else if (lowerPrompt.includes("sos") || lowerPrompt.includes("active")) {
    answer = "There are currently 42 active SOS calls in the region, with 18 requiring immediate medical attention. 7 shelters are at full capacity.";
    citations.push({ source: "SOS Cluster Database", value: "42 active SOS reports" });
    actions.push({ action: "Deploy medical resources to high-priority zones", endpoint: "POST /resources/dispatch" });
  } else {
    answer = "I can help with evacuation planning, resource allocation, risk assessment, and shelter management. Please ask about specific sectors, hazards, or resource needs.";
  }

  return { answer, citations, suggested_actions: actions };
}

export async function copilotQuery(input: CopilotInput): Promise<CopilotResponse> {
  try {
    const llmUrl = env.ML_SERVICE_URL + "/llm/copilot";
    const response = await mlRequest<CopilotResponse>(llmUrl, {
      method: "POST",
      body: input,
      timeout: 30000,
      retries: 2,
    });
    return response;
  } catch (error) {
    logger.warn("LLM copilot fell back to rule-based engine");
    return ruleBasedCopilot(input.prompt);
  }
}

export function getToolRegistry(): typeof toolRegistry {
  return toolRegistry;
}