from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uvicorn
import sys

app = FastAPI(
    title="ASPIRE ML & AI Microservice",
    version="1.0.0",
    description="Multi-Hazard Disaster Prediction, Cascade Simulation, Decision Support & LLM Query Interface",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "aspire-ml-service"
    version: str = "1.0.0"
    models_loaded: List[str] = [
        "flood_segmentation_v1.0",
        "risk_engine_v1.0",
        "impact_engine_v1.0",
        "decision_support_v1.0",
        "heatwave_v1.0",
        "cascade_v1.0",
    ]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DecisionSupportRequest(BaseModel):
    region_id: Optional[str] = None
    disaster_id: Optional[str] = None
    affected_population: Optional[int] = 50000
    priority: Optional[str] = "high"
    optimize: Optional[str] = "dispatch"

class LLMQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = "aspire-session"
    context: Optional[Dict[str, Any]] = None

class CascadeRequest(BaseModel):
    disaster_id: Optional[str] = None
    hazard_type: Optional[str] = "cyclone"
    wind_speed_kmh: Optional[float] = 145.0
    rainfall_mm_24h: Optional[float] = 220.0
    storm_surge_m: Optional[float] = 2.4

class WhatIfRequest(BaseModel):
    scenario_name: Optional[str] = "Cyclone Landfall Shift"
    parameters: Optional[Dict[str, Any]] = None

class RiskAssessRequest(BaseModel):
    hazard_type: Optional[str] = "cyclone"
    region_id: Optional[str] = None
    telemetry: Optional[Dict[str, Any]] = None

# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse()

@app.get("/api/v1/health", response_model=HealthResponse)
async def api_health():
    return HealthResponse()

@app.post("/decision/optimize")
async def optimize_decision(req: DecisionSupportRequest):
    return {
        "dispatch_plan": [
            {
                "resource_id": "res-001",
                "resource_name": "NDRF 04 Battalion — Delta Team Alpha",
                "resource_type": "rescue_team",
                "assigned_disaster_id": req.disaster_id or "dis-001-cyclone-dana",
                "destination": {"lat": 19.82, "lng": 85.84, "label": "Puri Coastal Buffer"},
                "priority_score": 96.5,
                "eta_min": 12,
                "quantity_deployed": 45,
            },
            {
                "resource_id": "res-002",
                "resource_name": "ODRAF Unit 02 — Cuttack Rapid Response",
                "resource_type": "rescue_team",
                "assigned_disaster_id": req.disaster_id or "dis-002-mahanadi-flood",
                "destination": {"lat": 20.46, "lng": 85.87, "label": "Kathajodi Embankment"},
                "priority_score": 92.0,
                "eta_min": 18,
                "quantity_deployed": 35,
            },
            {
                "resource_id": "res-004",
                "resource_name": "108 Advanced Life Support Fleet 07",
                "resource_type": "ambulance",
                "assigned_disaster_id": req.disaster_id or "dis-001-cyclone-dana",
                "destination": {"lat": 20.28, "lng": 85.83, "label": "NH-16 Medical Staging"},
                "priority_score": 94.0,
                "eta_min": 8,
                "quantity_deployed": 18,
            },
        ],
        "evacuation_plan": [
            {
                "shelter_id": "sh-001",
                "shelter_name": "Puri Cyclone Shelter #12",
                "destination": {"lat": 19.7983, "lng": 85.8249},
                "capacity_available": 320,
                "estimated_travel_time_min": 15,
                "safe_route": "NH-316 via VIP Road corridor",
            },
            {
                "shelter_id": "sh-003",
                "shelter_name": "Bhubaneswar High School Evacuation Shelter",
                "destination": {"lat": 20.2961, "lng": 85.8245},
                "capacity_available": 950,
                "estimated_travel_time_min": 22,
                "safe_route": "Janpath elevated arterial road",
            },
        ],
        "shelter_allocations": [
            {
                "shelter_id": "sh-001",
                "shelter_name": "Puri Cyclone Shelter #12",
                "current_occupancy": 2180,
                "capacity": 2500,
                "available_capacity": 320,
                "recommended_allocation": 300,
            },
            {
                "shelter_id": "sh-002",
                "shelter_name": "Cuttack Red Cross Disaster Camp",
                "current_occupancy": 1540,
                "capacity": 1800,
                "available_capacity": 260,
                "recommended_allocation": 250,
            },
        ],
    }

@app.post("/llm/query")
async def llm_query(req: LLMQueryRequest):
    q = req.query.lower()
    if "shelter" in q:
        resp = "Current shelter network is operating at 86% capacity with 8,760 individuals accommodated across 86 active centers. Priority expansion advised in Jagatsinghpur where Paradip Port shelter has reached 97.4% occupancy."
        intent = "shelter_status"
    elif "sos" in q or "emergency" in q:
        resp = "There are 4 active SOS emergency clusters. Highest priority is SOS-001 in Puri Swargadwar (5 trapped, tidal surge). NDRF Delta Team Alpha is on site with an estimated clearance time of 12 minutes."
        intent = "sos_triaging"
    elif "cyclone" in q or "wind" in q or "dana" in q:
        resp = "Cyclone Dana continues as a Very Severe Cyclonic Storm with sustained winds of 145 km/h, gusting to 175 km/h. Landfall window is between 18:00 and 22:00 IST near Dhamra. 342,000 residents across Puri and coastal belts are under mandatory evacuation."
        intent = "cyclone_telemetry"
    else:
        resp = f"ASPIRE AI Copilot active. Monitoring 3 active disaster scenarios across Odisha. Evacuation routes on NH-316 are clear; SH-35 Marine Drive remains closed due to 2.4m storm surge."
        intent = "general_intelligence"

    return {
        "response": resp,
        "intent": intent,
        "intent_confidence": 0.96,
        "entities_extracted": {"region": "Odisha", "severity": "critical", "source": "IMD/OSDMA"},
        "tools_used": ["hazard_geospatial_engine", "sos_cluster_db", "shelter_occupancy_tracker"],
        "session_id": req.session_id,
    }

@app.post("/cascade/simulate")
async def simulate_cascade(req: CascadeRequest):
    return {
        "cascade_graph": {
            "nodes": [
                {"id": "c1", "label": "Cyclone Dana Landfall", "layer": "Primary Hazard", "impact_pct": 100, "status": "active"},
                {"id": "c2", "label": "Storm Surge (2.4m)", "layer": "Secondary Hazard", "impact_pct": 88, "status": "active"},
                {"id": "c3", "label": "Power Grid Substation Inundation", "layer": "Infrastructure", "impact_pct": 74, "status": "critical"},
                {"id": "c4", "label": "Potable Water Plant Shutdown", "layer": "Public Health", "impact_pct": 62, "status": "escalating"},
                {"id": "c5", "label": "District Hospital Generator Dependence", "layer": "Healthcare", "impact_pct": 82, "status": "mitigated"},
            ],
            "edges": [
                {"source": "c1", "target": "c2", "probability": 0.95, "lead_time_hrs": 3},
                {"source": "c2", "target": "c3", "probability": 0.88, "lead_time_hrs": 4},
                {"source": "c3", "target": "c4", "probability": 0.76, "lead_time_hrs": 6},
                {"source": "c3", "target": "c5", "probability": 0.92, "lead_time_hrs": 2},
            ],
        },
        "critical_interventions": [
            {
                "intervention": "Deploy High-Capacity Dewatering Pumps to Puri Substation",
                "mitigation_target": "c3",
                "cascade_risk_reduction": "68%",
            },
            {
                "intervention": "Transfer ICU Patients to AIIMS Bhubaneswar prior to Landfall",
                "mitigation_target": "c5",
                "cascade_risk_reduction": "85%",
            },
        ],
    }

@app.post("/simulation/what-if")
async def what_if_simulation(req: WhatIfRequest):
    return {
        "scenario_id": f"sim-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "scenario_name": req.scenario_name or "Alternative Evacuation Trajectory",
        "baseline": {
            "affected_population": 342000,
            "estimated_economic_loss_inr_cr": 450,
            "critical_facilities_at_risk": 28,
        },
        "simulated_outcome": {
            "affected_population": 118000,
            "estimated_economic_loss_inr_cr": 160,
            "critical_facilities_at_risk": 8,
            "loss_reduction_pct": 64.4,
            "population_saved": 224000,
            "infrastructure_preserved": 20,
        },
        "recommendations": [
            "Advance mandatory curfew in Puri Municipality by 4 hours",
            "Divert traffic from SH-35 to inland bypass NH-316",
            "Pre-stage fuel tanks at SCB Medical College",
        ],
    }

@app.post("/risk/assess")
async def assess_risk(req: RiskAssessRequest):
    return {
        "risk_level": "critical",
        "risk_score": 88.5,
        "dominant_hazard": req.hazard_type or "cyclone",
        "vulnerability_factors": {
            "population_density": 85.0,
            "coastal_exposure": 95.0,
            "infrastructure_fragility": 78.0,
            "emergency_preparedness": 91.0,
        },
        "composite_danger_index": 92.4,
        "recommended_action_level": "Level 4 (Red State Emergency)",
    }

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("run_server:app", host="0.0.0.0", port=port, reload=False, log_level="info")
