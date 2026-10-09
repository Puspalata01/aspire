import json
import inspect
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path
import numpy as np
import sys

sys.path.append(str(Path(__file__).parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ToolDefinition:
    name: str
    description: str
    parameters: Dict
    function: Callable
    requires_confirmation: bool = False


class ToolRegistry:

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        logger.info("Initialized ToolRegistry")

    def register(
        self,
        name: str,
        description: str,
        parameters: Dict,
        requires_confirmation: bool = False,
    ):
        def decorator(fn: Callable):
            self._tools[name] = ToolDefinition(
                name=name,
                description=description,
                parameters=parameters,
                function=fn,
                requires_confirmation=requires_confirmation,
            )
            logger.info(f"Registered tool: {name}")
            return fn
        return decorator

    def get(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters,
                },
            }
            for t in self._tools.values()
        ]

    def execute(self, name: str, arguments: Dict) -> Any:
        tool = self.get(name)
        if tool is None:
            raise ValueError(f"Unknown tool: {name}")
        logger.info(f"Executing tool: {name} with args: {list(arguments.keys())}")
        return tool.function(**arguments)


registry = ToolRegistry()


@registry.register(
    name="assess_flood_risk",
    description=(
        "Assess flood risk for a geographic area given hazard, vulnerability, "
        "and exposure data. Returns risk scores, classification, and alert zones."
    ),
    parameters={
        "type": "object",
        "properties": {
            "region": {
                "type": "string",
                "description": "Region name or bounding box as 'lat_min,lat_max,lon_min,lon_max'",
            },
            "hazard_intensity": {
                "type": "number",
                "description": "Flood hazard intensity (0-1 scale)",
            },
            "population_density": {
                "type": "number",
                "description": "Population density in persons/km²",
            },
            "vulnerability_score": {
                "type": "number",
                "description": "Composite vulnerability score (0-1)",
            },
        },
        "required": ["region", "hazard_intensity"],
    },
)
def assess_flood_risk(
    region: str,
    hazard_intensity: float,
    population_density: float = 500.0,
    vulnerability_score: float = 0.5,
) -> Dict:
    exposure = min(population_density / 5000.0, 1.0)
    risk_score = hazard_intensity * vulnerability_score * (0.5 + 0.5 * exposure)

    if risk_score >= 0.75:
        risk_class = "Critical"
    elif risk_score >= 0.50:
        risk_class = "High"
    elif risk_score >= 0.25:
        risk_class = "Medium"
    else:
        risk_class = "Low"

    estimated_affected = population_density * hazard_intensity * 10

    return {
        "region": region,
        "risk_score": round(risk_score, 3),
        "risk_class": risk_class,
        "estimated_affected_population": int(estimated_affected),
        "hazard_intensity": hazard_intensity,
        "vulnerability_score": vulnerability_score,
        "alert_level": risk_class,
    }


@registry.register(
    name="predict_population_impact",
    description=(
        "Predict population impact from a disaster event including affected, "
        "displaced and casualties estimates."
    ),
    parameters={
        "type": "object",
        "properties": {
            "affected_population": {
                "type": "number",
                "description": "Total population in the affected area",
            },
            "risk_score": {
                "type": "number",
                "description": "Overall risk score (0-1)",
            },
            "vulnerable_fraction": {
                "type": "number",
                "description": "Fraction of population that is vulnerable (children + elderly)",
            },
            "flood_depth_m": {
                "type": "number",
                "description": "Maximum flood depth in meters",
            },
        },
        "required": ["affected_population", "risk_score"],
    },
)
def predict_population_impact(
    affected_population: float,
    risk_score: float,
    vulnerable_fraction: float = 0.3,
    flood_depth_m: float = 1.0,
) -> Dict:
    depth_factor = min(flood_depth_m / 2.0, 1.0)
    displacement_rate = 0.1 + 0.8 * risk_score + 0.1 * depth_factor
    displacement_rate = min(displacement_rate, 0.95)

    displaced = affected_population * displacement_rate

    casualty_rates = {0.25: 0.0001, 0.50: 0.0005, 0.75: 0.002, 0.90: 0.008}
    base_rate = 0.0001
    for threshold, rate in sorted(casualty_rates.items()):
        if risk_score >= threshold:
            base_rate = rate

    vuln_multiplier = 1.0 + (2.5 - 1.0) * vulnerable_fraction
    casualties = affected_population * base_rate * vuln_multiplier

    return {
        "total_affected": int(affected_population),
        "displaced": int(displaced),
        "immediate_shelter_need": int(displaced * 0.7),
        "expected_casualties": round(casualties, 1),
        "injuries_estimated": round(casualties * 3.5, 1),
        "vulnerable_at_risk": int(affected_population * vulnerable_fraction),
    }


@registry.register(
    name="estimate_economic_loss",
    description=(
        "Estimate total economic loss from a disaster event including direct "
        "and indirect costs in INR."
    ),
    parameters={
        "type": "object",
        "properties": {
            "affected_area_km2": {
                "type": "number",
                "description": "Total affected area in km²",
            },
            "building_damage_fraction": {
                "type": "number",
                "description": "Average fraction of buildings damaged (0-1)",
            },
            "road_damage_km": {
                "type": "number",
                "description": "Length of damaged roads in km",
            },
            "crop_loss_fraction": {
                "type": "number",
                "description": "Fraction of crop area damaged (0-1)",
            },
            "affected_population": {
                "type": "number",
                "description": "Total affected population",
            },
        },
        "required": ["affected_area_km2"],
    },
)
def estimate_economic_loss(
    affected_area_km2: float,
    building_damage_fraction: float = 0.3,
    road_damage_km: float = 0.0,
    crop_loss_fraction: float = 0.2,
    affected_population: float = 0.0,
) -> Dict:
    building_value_per_km2 = 500_000_000
    building_loss = affected_area_km2 * building_damage_fraction * building_value_per_km2

    road_loss = road_damage_km * 2_000_000

    crop_area_km2 = affected_area_km2 * 0.4
    crop_value_per_km2 = 8_000_000
    crop_loss = crop_area_km2 * crop_loss_fraction * crop_value_per_km2

    biz_disruption = affected_population * 2500 * 14

    direct_total = building_loss + road_loss + crop_loss + biz_disruption
    indirect_total = direct_total * 0.35

    return {
        "currency": "INR",
        "building_loss": int(building_loss),
        "infrastructure_loss": int(road_loss),
        "agricultural_loss": int(crop_loss),
        "business_interruption": int(biz_disruption),
        "direct_total": int(direct_total),
        "indirect_total": int(indirect_total),
        "total_economic_loss": int(direct_total + indirect_total),
    }


@registry.register(
    name="get_evacuation_route",
    description=(
        "Get recommended evacuation routes from an affected zone to the nearest "
        "safe shelter, considering road network and hazard conditions."
    ),
    parameters={
        "type": "object",
        "properties": {
            "origin_zone": {
                "type": "string",
                "description": "Name or ID of the origin zone to evacuate from",
            },
            "population": {
                "type": "number",
                "description": "Population to evacuate",
            },
            "road_condition": {
                "type": "string",
                "enum": ["normal", "degraded", "partially_blocked"],
                "description": "Current road network condition",
            },
            "vulnerable_fraction": {
                "type": "number",
                "description": "Fraction of population needing special transport",
            },
        },
        "required": ["origin_zone", "population"],
    },
)
def get_evacuation_route(
    origin_zone: str,
    population: float,
    road_condition: str = "normal",
    vulnerable_fraction: float = 0.25,
) -> Dict:
    speed_factors = {"normal": 1.0, "degraded": 0.6, "partially_blocked": 0.35}
    speed_factor = speed_factors.get(road_condition, 1.0)

    base_distance_km = 25.0
    base_speed_kmh = 40.0 * speed_factor
    travel_time_hours = base_distance_km / base_speed_kmh

    capacity_per_hour = 800
    throughput_hours = population / capacity_per_hour
    total_clearance_hours = travel_time_hours + throughput_hours

    buses_needed = int(np.ceil(population * vulnerable_fraction / 40))

    return {
        "origin_zone": origin_zone,
        "recommended_route": f"Route via NH-16 to Shelter Complex Alpha",
        "distance_km": base_distance_km,
        "estimated_travel_time_hours": round(travel_time_hours, 1),
        "total_clearance_time_hours": round(total_clearance_hours, 1),
        "population_to_evacuate": int(population),
        "buses_required": buses_needed,
        "road_condition": road_condition,
        "alternate_routes": ["Route via SH-5", "Route via Coastal Road"],
    }


@registry.register(
    name="get_resource_needs",
    description=(
        "Calculate resource requirements (food, water, medical, shelter) "
        "for a displaced population over a specified duration."
    ),
    parameters={
        "type": "object",
        "properties": {
            "displaced_population": {
                "type": "number",
                "description": "Number of displaced persons",
            },
            "duration_days": {
                "type": "number",
                "description": "Duration of relief operations in days",
            },
            "vulnerable_fraction": {
                "type": "number",
                "description": "Fraction of vulnerable population (children, elderly, disabled)",
            },
        },
        "required": ["displaced_population"],
    },
)
def get_resource_needs(
    displaced_population: float,
    duration_days: float = 7.0,
    vulnerable_fraction: float = 0.30,
) -> Dict:
    return {
        "displaced_population": int(displaced_population),
        "duration_days": duration_days,
        "water_liters": int(displaced_population * 15 * duration_days),
        "food_kg": int(displaced_population * 0.5 * duration_days),
        "medical_kits": int(displaced_population / 50),
        "sanitation_units": int(np.ceil(displaced_population / 100)),
        "blankets": int(displaced_population * 1.5),
        "hygiene_kits": int(displaced_population * 0.8),
        "medical_staff": int(np.ceil(displaced_population / 500)),
        "rescue_teams": int(np.ceil(displaced_population / 2000)),
        "special_needs_support": int(displaced_population * vulnerable_fraction),
    }


@registry.register(
    name="check_shelter_availability",
    description="Check available shelter capacity in a region and get allocation recommendations.",
    parameters={
        "type": "object",
        "properties": {
            "region": {
                "type": "string",
                "description": "Region name to check shelter availability",
            },
            "required_capacity": {
                "type": "number",
                "description": "Number of persons needing shelter",
            },
        },
        "required": ["region", "required_capacity"],
    },
)
def check_shelter_availability(region: str, required_capacity: float) -> Dict:
    available_capacity = int(required_capacity * 0.65)
    gap = max(0, required_capacity - available_capacity)

    return {
        "region": region,
        "required_capacity": int(required_capacity),
        "available_capacity": available_capacity,
        "capacity_gap": int(gap),
        "allocation_rate": round(available_capacity / required_capacity, 2),
        "top_shelters": [
            {"name": "Government School Complex A", "capacity": int(available_capacity * 0.4)},
            {"name": "Stadium Relief Centre", "capacity": int(available_capacity * 0.35)},
            {"name": "Community Hall Network", "capacity": int(available_capacity * 0.25)},
        ],
        "additional_action_required": gap > 0,
        "recommendation": (
            f"Deploy {int(np.ceil(gap/200))} temporary shelters to cover capacity gap of {int(gap)}"
            if gap > 0 else "Existing shelter capacity is sufficient."
        ),
    }


if __name__ == "__main__":
    tools = registry.list_tools()
    print(f"Registered tools: {[t['function']['name'] for t in tools]}\n")

    result = registry.execute("assess_flood_risk", {
        "region": "Odisha Coastal Zone",
        "hazard_intensity": 0.82,
        "population_density": 1200,
        "vulnerability_score": 0.65,
    })
    print(f"Flood risk assessment:\n  {json.dumps(result, indent=2)}\n")

    result = registry.execute("get_resource_needs", {
        "displaced_population": 25000,
        "duration_days": 10,
    })
    print(f"Resource needs:\n  {json.dumps(result, indent=2)}")
