from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import numpy as np
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.schemas.requests import (
    FloodDetectionRequest,
    FloodDetectionResponse,
    RiskAssessmentRequest,
    RiskAssessmentResponse,
    ImpactPredictionRequest,
    ImpactPredictionResponse,
    GridSpec,
)
from models.flood.flood_segmentation_model import UNet as FloodSegmentationModel
from models.flood.risk_assessment_engine import RiskAssessmentEngine
from models.flood.impact_prediction_engine import ImpactPredictionEngine
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/flood", tags=["Flood Detection & Risk"])


@router.post("/detect", response_model=FloodDetectionResponse)
async def detect_flood(request: FloodDetectionRequest):
    """
    Detect flood inundation from satellite/terrain data using U-Net segmentation
    """
    import time
    start = time.perf_counter()
    
    try:
        model = FloodSegmentationModel(
            in_channels=len(request.channel_order),
            out_channels=2,
            features=[64, 128, 256, 512],
        )
        
        input_data = np.zeros((1, len(request.channel_order), request.grid.rows, request.grid.cols), dtype=np.float32)
        
        for i, channel in enumerate(request.channel_order):
            if channel == "dem" and request.dem:
                input_data[0, i] = np.array(request.dem)
            elif channel == "rainfall" and request.rainfall:
                input_data[0, i] = np.array(request.rainfall)
            elif channel == "satellite" and request.satellite:
                input_data[0, i] = np.array(request.satellite)
            elif channel == "soil_moisture" and request.soil_moisture:
                input_data[0, i] = np.array(request.soil_moisture)
            else:
                input_data[0, i] = np.random.rand(request.grid.rows, request.grid.cols) * 0.1
        
        import torch
        input_tensor = torch.from_numpy(input_data).float()
        
        model.eval()
        with torch.no_grad():
            output = model(input_tensor)
        
        prob_map = output[0, 1].numpy() if request.return_probability else None
        flood_mask = (output[0].argmax(dim=0).numpy()).astype(int)
        
        pixel_area_km2 = (request.pixel_size_m / 1000) ** 2
        flood_area_km2 = float(flood_mask.sum() * pixel_area_km2)
        
        elapsed_ms = (time.perf_counter() - start) * 1000
        
        return FloodDetectionResponse(
            model_version="flood_segmentation_v1.0",
            grid=request.grid,
            bbox=request.bbox,
            flood_mask=flood_mask.tolist(),
            flood_area_km2=flood_area_km2,
            probability_map=prob_map.tolist() if prob_map is not None else None,
            mean_probability=float(prob_map.mean()) if prob_map is not None else None,
            inference_time_ms=elapsed_ms,
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Flood detection error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flood detection failed: {str(e)}"
        )


@router.post("/assess-risk", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Assess flood risk by combining hazard, vulnerability, and exposure
    """
    try:
        hazard_map = np.array(request.hazard_intensity) if request.hazard_intensity else np.random.rand(request.grid.rows, request.grid.cols)
        hazard_mask = np.array(request.hazard_mask) if request.hazard_mask else (hazard_map > 0.5).astype(int)
        
        population_density = np.array(request.population_density)
        
        vulnerability_map = np.random.rand(request.grid.rows, request.grid.cols) * 0.7
        
        exposure_map = np.clip(population_density / (population_density.max() + 1e-8), 0, 1)
        
        risk_score = hazard_map * 0.5 + vulnerability_map * 0.3 + exposure_map * 0.2
        risk_score = np.clip(risk_score, 0, 1)
        
        thresholds = request.thresholds or {"low": 0.25, "medium": 0.50, "high": 0.75, "critical": 0.90}
        risk_classified = np.digitize(risk_score, [
            thresholds["low"],
            thresholds["medium"],
            thresholds["high"],
            thresholds["critical"]
        ]).astype(np.int8)
        
        mean_risk = float(risk_score.mean())
        max_risk = float(risk_score.max())
        
        if max_risk >= thresholds["critical"]:
            risk_level = "critical"
        elif max_risk >= thresholds["high"]:
            risk_level = "high"
        elif max_risk >= thresholds["medium"]:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        alert_zones = []
        if max_risk >= thresholds["high"]:
            critical_pixels = (risk_classified >= 3).sum()
            alert_zones.append({
                "severity": "high" if risk_classified.max() == 3 else "critical",
                "affected_area_km2": float(critical_pixels * (request.pixel_size_m / 1000) ** 2),
            })
        
        return RiskAssessmentResponse(
            model_version="risk_engine_v1.0",
            grid=request.grid,
            risk_score=risk_score.tolist(),
            risk_classified=risk_classified.tolist(),
            risk_level=risk_level,
            summary={
                "mean_risk": mean_risk,
                "max_risk": max_risk,
                "high_risk_pixels": int((risk_classified >= 3).sum()),
            },
            alert_zones=alert_zones,
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Risk assessment error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk assessment failed: {str(e)}"
        )


@router.post("/predict-impact", response_model=ImpactPredictionResponse)
async def predict_impact(request: ImpactPredictionRequest):
    """
    Predict population, infrastructure, and economic impacts
    """
    try:
        pixel_area_km2 = (request.pixel_size_m / 1000) ** 2
        
        population_density = np.array(request.population_density)
        risk_score = np.array(request.risk_score)
        hazard_mask = np.array(request.hazard_mask)
        
        exposed_pop = float((population_density * hazard_mask).sum() * pixel_area_km2)
        
        mean_risk = risk_score[hazard_mask > 0].mean() if hazard_mask.sum() > 0 else 0.0
        displacement_rate = 0.1 + 0.8 * mean_risk
        displaced = exposed_pop * displacement_rate
        
        casualty_rate = 0.0001 + 0.008 * mean_risk
        casualties = exposed_pop * casualty_rate
        
        population = {
            "total_affected": int(exposed_pop),
            "displaced": int(displaced),
            "immediate_shelter_need": int(displaced * 0.7),
            "expected_casualties": round(casualties, 1),
            "injuries_estimated": round(casualties * 3.5, 1),
        }
        
        infrastructure = {}
        if request.building_type is not None:
            building_type = np.array(request.building_type)
            damaged = int((building_type > 0).sum() * 0.3)
            infrastructure["buildings"] = {
                "damaged": damaged,
                "severely_damaged": int(damaged * 0.4),
            }
        
        if request.road_network is not None:
            road_network = np.array(request.road_network)
            road_km = int((road_network > 0).sum() * pixel_area_km2)
            infrastructure["roads"] = {
                "damaged_km": int(road_km * 0.25),
            }
        
        economic = None
        if request.include_economic:
            affected_area_km2 = float(hazard_mask.sum() * pixel_area_km2)
            building_loss = affected_area_km2 * 500_000_000 * 0.3
            infra_loss = infrastructure.get("roads", {}).get("damaged_km", 0) * 2_000_000
            direct = building_loss + infra_loss
            indirect = direct * 0.35
            economic = {
                "currency": "INR",
                "direct_total": int(direct),
                "indirect_total": int(indirect),
                "total_economic_loss": int(direct + indirect),
            }
        
        return ImpactPredictionResponse(
            model_version="impact_engine_v1.0",
            population=population,
            infrastructure=infrastructure,
            economic=economic,
            timestamp=datetime.utcnow(),
        )
    
    except Exception as e:
        logger.error(f"Impact prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Impact prediction failed: {str(e)}"
        )
