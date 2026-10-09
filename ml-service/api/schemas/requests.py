from pydantic import BaseModel, Field, field_validator
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime
from enum import Enum
import numpy as np


class HazardType(str, Enum):
    FLOOD = "flood"
    CYCLONE = "cyclone"
    STORM_SURGE = "storm_surge"
    HEATWAVE = "heatwave"
    LANDSLIDE = "landslide"


class RiskLevel(str, Enum):
    NEGLIGIBLE = "negligible"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class BoundingBox(BaseModel):
    min_lat: float = Field(..., ge=-90, le=90)
    max_lat: float = Field(..., ge=-90, le=90)
    min_lon: float = Field(..., ge=-180, le=180)
    max_lon: float = Field(..., ge=-180, le=180)

    @field_validator("max_lat")
    @classmethod
    def validate_max_lat(cls, v, info):
        if "min_lat" in info.data and v <= info.data["min_lat"]:
            raise ValueError("max_lat must be greater than min_lat")
        return v

    @field_validator("max_lon")
    @classmethod
    def validate_max_lon(cls, v, info):
        if "min_lon" in info.data and v <= info.data["min_lon"]:
            raise ValueError("max_lon must be greater than min_lon")
        return v


class GridSpec(BaseModel):
    rows: int = Field(..., ge=2, le=4096)
    cols: int = Field(..., ge=2, le=4096)

    @property
    def shape(self) -> Tuple[int, int]:
        return (self.rows, self.cols)


class FloodDetectionRequest(BaseModel):
    grid: GridSpec
    bbox: BoundingBox
    pixel_size_m: float = Field(90.0, gt=0)
    dem: Optional[List[List[float]]] = None
    rainfall: Optional[List[List[float]]] = None
    satellite: Optional[List[List[float]]] = None
    soil_moisture: Optional[List[List[float]]] = None
    channel_order: List[str] = Field(default=["dem", "rainfall", "satellite", "soil_moisture"])
    return_probability: bool = True


class FloodDetectionResponse(BaseModel):
    model_version: str
    grid: GridSpec
    bbox: BoundingBox
    flood_mask: List[List[int]]
    flood_area_km2: float
    probability_map: Optional[List[List[float]]] = None
    mean_probability: Optional[float] = None
    inference_time_ms: float
    timestamp: datetime


class RiskAssessmentRequest(BaseModel):
    grid: GridSpec
    bbox: BoundingBox
    pixel_size_m: float = Field(90.0, gt=0)
    hazard_mask: Optional[List[List[int]]] = None
    hazard_intensity: Optional[List[List[float]]] = None
    population_density: List[List[float]]
    infrastructure: Optional[Dict[str, List[List[float]]]] = None
    thresholds: Optional[Dict[str, float]] = None


class RiskAssessmentResponse(BaseModel):
    model_version: str
    grid: GridSpec
    risk_score: List[List[float]]
    risk_classified: List[List[int]]
    risk_level: RiskLevel
    summary: Dict[str, Any]
    alert_zones: List[Dict[str, Any]]
    timestamp: datetime


class ImpactPredictionRequest(BaseModel):
    grid: GridSpec
    bbox: BoundingBox
    pixel_size_m: float = Field(90.0, gt=0)
    flood_depth: List[List[float]]
    hazard_mask: List[List[int]]
    risk_score: List[List[float]]
    risk_classified: List[List[int]]
    population_density: List[List[float]]
    building_type: Optional[List[List[int]]] = None
    road_network: Optional[List[List[int]]] = None
    bridge_locations: Optional[List[List[int]]] = None
    include_economic: bool = True


class ImpactPredictionResponse(BaseModel):
    model_version: str
    population: Dict[str, Any]
    infrastructure: Dict[str, Any]
    economic: Optional[Dict[str, Any]] = None
    timestamp: datetime


class DecisionSupportRequest(BaseModel):
    road_segments: List[Dict[str, Any]]
    shelters: List[Dict[str, Any]]
    population_zones: List[Dict[str, Any]]
    resource_demand: Optional[Dict[str, Dict[str, float]]] = None
    resource_supply: Optional[Dict[str, Dict[str, float]]] = None
    displaced_population: float = Field(..., ge=0)
    priorities: Optional[Dict[str, str]] = None


class DecisionSupportResponse(BaseModel):
    model_version: str
    evacuation: Dict[str, Any]
    resources: Dict[str, Any]
    shelter: Dict[str, Any]
    timestamp: datetime


class HeatwaveRequest(BaseModel):
    grid: GridSpec
    bbox: BoundingBox
    temperature: List[List[List[float]]]
    humidity: Optional[List[List[List[float]]]] = None
    population_density: Optional[List[List[float]]] = None
    vulnerable_fraction: Optional[List[List[float]]] = None
    urban_density: Optional[List[List[float]]] = None
    vegetation_index: Optional[List[List[float]]] = None


class HeatwaveResponse(BaseModel):
    model_version: str
    events: List[Dict[str, Any]]
    forecast: Dict[str, Any]
    exposure: Dict[str, Any]
    risk: Dict[str, Any]
    timestamp: datetime


class CascadeRequest(BaseModel):
    initial_hazards: Dict[str, float]
    time_horizon_hours: float = Field(72.0, gt=0, le=720)


class CascadeResponse(BaseModel):
    model_version: str
    cascade_timeline: List[Dict[str, Any]]
    compound_risk_timeline: List[Dict[str, Any]]
    max_compound_risk: float
    critical_paths: List[Dict[str, Any]]
    timestamp: datetime


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    session_id: str = "default"
    context: Optional[Dict[str, Any]] = None


class QueryResponse(BaseModel):
    response: str
    intent: str
    intent_confidence: float
    entities_extracted: Dict[str, str]
    tools_used: List[str]
    session_id: str


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any] = Field(default_factory=dict)


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


class AlertPayload(BaseModel):
    hazard_type: HazardType
    severity: RiskLevel
    region: str
    message: str
    risk_score: float
    affected_population: float = 0.0
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    uptime_seconds: float
    models_loaded: List[str]
    timestamp: datetime