from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.schemas.requests import (
    DecisionSupportRequest,
    DecisionSupportResponse,
)
from models.decision_support.evacuation_planner import EvacuationPlanner
from models.decision_support.resource_optimizer import ResourceOptimizer
from models.decision_support.shelter_allocator import ShelterAllocator
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/decision", tags=["Decision Support"])


@router.post("/optimize", response_model=DecisionSupportResponse)
async def optimize_response(request: DecisionSupportRequest):
    """
    Generate optimized evacuation routes, resource allocation, and shelter assignments
    """
    try:
        prepared_shelters = []
        for sh in request.shelters:
            s = dict(sh)
            if 'floor_area_sqm' not in s and 'capacity' in s:
                s['floor_area_sqm'] = s['capacity'] * 2.0
            prepared_shelters.append(s)
            
        evacuation_planner = EvacuationPlanner()
        resource_optimizer = ResourceOptimizer()
        shelter_allocator = ShelterAllocator()
        
        evacuation_plan = evacuation_planner.plan_evacuation(
            population_zones=request.population_zones,
            shelters=prepared_shelters,
            road_segments=request.road_segments,
            priorities=request.priorities,
        )
        
        resource_plan = {}
        if request.resource_demand and request.resource_supply:
            resource_plan = resource_optimizer.optimize_allocation(
                demand=request.resource_demand,
                supply=request.resource_supply,
                road_segments=request.road_segments,
            )
        
        shelter_plan = shelter_allocator.allocate_shelters(
            displaced_population=request.displaced_population,
            shelters=prepared_shelters,
            population_zones=request.population_zones,
        )
        
        return DecisionSupportResponse(
            model_version="decision_support_v1.0",
            evacuation={
                "total_evacuees": evacuation_plan.get("total_evacuees", 0),
                "routes": evacuation_plan.get("routes", []),
                "avg_distance_km": evacuation_plan.get("avg_distance_km", 0.0),
                "estimated_duration_hours": evacuation_plan.get("estimated_duration_hours", 0.0),
            },
            resources={
                "allocations": resource_plan.get("allocations", []),
                "total_cost": resource_plan.get("total_cost", 0.0),
                "unmet_demand": resource_plan.get("unmet_demand", {}),
            },
            shelter={
                "assignments": shelter_plan.get("assignments", []),
                "total_capacity": shelter_plan.get("total_capacity", 0),
                "utilization_rate": shelter_plan.get("utilization_rate", 0.0),
                "overflow": shelter_plan.get("overflow", 0),
            },
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Decision support optimization error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {str(e)}"
        )
