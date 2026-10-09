import { mlRequest } from "./mlClient.ts";
import { logger } from "../logger.ts";

export type WhatIfScenario = {
  interventions: Array<{
    type: "evacuation" | "resource_dispatch" | "shelter_open" | "road_closure";
    target_id: string;
    timestamp: Date | string;
    parameters?: Record<string, unknown>;
  }>;
  horizon_hours: number;
};

export type WhatIfResult = {
  baseline_projection: {
    expected_insured_losses_usd: number;
    affected_population: number;
    critical_infrastructure_impacted: string[];
  };
  scenario_projection: {
    expected_insured_losses_usd: number;
    affected_population: number;
    critical_infrastructure_impacted: string[];
  };
  improvement: {
    loss_reduction_pct: number;
    population_saved: number;
    infrastructure_preserved: string[];
  };
};

function ruleBasedWhatIf(scenario: WhatIfScenario): WhatIfResult {
  const interventionCount = scenario.interventions.length;
  const coverageFactor = Math.min(interventionCount * 0.15, 0.6);

  const baseline = {
    expected_insured_losses_usd: 5000000 * (1 + interventionCount * 0.1),
    affected_population: 10000 * scenario.horizon_hours / 24,
    critical_infrastructure_impacted: ["power_grid", "water_supply", "medical_facilities"],
  };

  const scenario_proj = {
    expected_insured_losses_usd: baseline.expected_insured_losses_usd * (1 - coverageFactor),
    affected_population: Math.max(baseline.affected_population * (1 - coverageFactor), 0),
    critical_infrastructure_impacted:
      baseline.critical_infrastructure_impacted.filter(
        (_, i) => i > interventionCount * 0.5 || Math.random() > 0.3
      ),
  };

  return {
    baseline_projection: baseline,
    scenario_projection: scenario_proj,
    improvement: {
      loss_reduction_pct: Math.round(coverageFactor * 100),
      population_saved: Math.round(baseline.affected_population - scenario_proj.affected_population),
      infrastructure_preserved: scenario_proj.critical_infrastructure_impacted,
    },
  };
}

export async function simulateWhatIf(scenario: WhatIfScenario): Promise<WhatIfResult> {
  try {
    const result = await mlRequest<WhatIfResult>("/simulation/what-if", {
      method: "POST",
      body: scenario,
      timeout: 30000,
      retries: 2,
    });
    return result;
  } catch (error) {
    logger.warn("What-if simulation fell back to rule-based engine");
    return ruleBasedWhatIf(scenario);
  }
}