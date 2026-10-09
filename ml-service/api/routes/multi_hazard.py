from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import numpy as np
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.schemas.requests import (
    HeatwaveRequest,
    HeatwaveResponse,
    CascadeRequest,
    CascadeResponse,
)
from models.multi_hazard.heatwave_detector import HeatwaveDetector
from models.multi_hazard.cascade_analyzer import CascadeAnalyzer
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/multi-hazard", tags=["Multi-Hazard Analysis"])


@router.post("/heatwave/analyze", response_model=HeatwaveResponse)
async def analyze_heatwave(request: HeatwaveRequest):
    """
    Detect heatwave events and assess exposure risk
    """
    try:
        detector = HeatwaveDetector(
            t_max_threshold=40.0,
            duration_days=3,
            intensity_threshold=2.0,
        )
        
        temperature = np.array(request.temperature)
        
        events = detector.detect_events(
            temperature_timeseries=temperature,
            threshold=40.0,
            min_duration=3,
        )
        
        forecast = {
            "next_7_days": "moderate_risk",
            "peak_temperature": float(temperature.max()),
            "avg_temperature": float(temperature.mean()),
        }
        
        exposure = {}
        if request.population_density is not None:
            pop = np.array(request.population_density)
            exposed_pop = float(pop.sum())
            exposure["total_exposed"] = int(exposed_pop)
            
            if request.vulnerable_fraction is not None:
                vuln_frac = np.array(request.vulnerable_fraction)
                vulnerable_pop = float((pop * vuln_frac).sum())
                exposure["vulnerable_exposed"] = int(vulnerable_pop)
        
        risk = {
            "overall_level": "high" if len(events) > 0 else "low",
            "event_count": len(events),
            "mean_intensity": float(np.mean([e.get("intensity", 0) for e in events])) if events else 0.0,
        }
        
        return HeatwaveResponse(
            model_version="heatwave_v1.0",
            events=events,
            forecast=forecast,
            exposure=exposure,
            risk=risk,
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Heatwave analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Heatwave analysis failed: {str(e)}"
        )


@router.post("/cascade/analyze", response_model=CascadeResponse)
async def analyze_cascade(request: CascadeRequest):
    """
    Analyze multi-hazard cascade scenarios and compound risk
    """
    try:
        analyzer = CascadeAnalyzer()
        
        timeline = analyzer.simulate_cascade(
            initial_hazards=request.initial_hazards,
            time_horizon_hours=request.time_horizon_hours,
        )
        
        compound_risk_timeline = []
        for step in timeline:
            active_count = step.get("active_hazards_count", 0)
            compound_risk = min(1.0, active_count * 0.3)
            compound_risk_timeline.append({
                "time_hours": step.get("time_hours", 0),
                "compound_risk": compound_risk,
            })
        
        max_compound_risk = max([cr["compound_risk"] for cr in compound_risk_timeline]) if compound_risk_timeline else 0.0
        
        critical_paths = analyzer.find_critical_paths(timeline)
        
        return CascadeResponse(
            model_version="cascade_v1.0",
            cascade_timeline=timeline,
            compound_risk_timeline=compound_risk_timeline,
            max_compound_risk=max_compound_risk,
            critical_paths=critical_paths,
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Cascade analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cascade analysis failed: {str(e)}"
        )
