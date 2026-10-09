from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.schemas.requests import AlertPayload, RiskLevel, HazardType
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/monitoring", tags=["Real-time Monitoring & Alerting"])

_alert_history: List[AlertPayload] = []
_active_alerts: List[AlertPayload] = []
_thresholds: dict = {
    "flood": {"low": 0.3, "medium": 0.5, "high": 0.7, "critical": 0.9},
    "heatwave": {"low": 35.0, "medium": 40.0, "high": 45.0, "critical": 50.0},
    "cyclone": {"low": 0.3, "medium": 0.6, "high": 0.8, "critical": 0.95},
}
_escalation_escalation_chain: dict = {
    "low": ["dashboard"],
    "medium": ["dashboard", "sms"],
    "high": ["dashboard", "sms", "email", "phone"],
    "critical": ["dashboard", "sms", "email", "phone", "broadcast"],
}


@router.get("/thresholds")
async def get_thresholds():
    """Get current alert thresholds per hazard type"""
    return {"thresholds": _thresholds, "escalation_chain": _escalation_escalation_chain}


@router.put("/thresholds/{hazard_type}")
async def update_thresholds(
    hazard_type: str,
    low: float,
    medium: float,
    high: float,
    critical: float,
):
    """Update alert thresholds for a hazard type"""
    if hazard_type not in _thresholds:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hazard type '{hazard_type}' not found"
        )
    
    if not (low < medium < high < critical):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Thresholds must satisfy: low < medium < high < critical"
        )
    
    _thresholds[hazard_type] = {
        "low": low, "medium": medium, "high": high, "critical": critical
    }
    
    logger.info(f"Updated thresholds for {hazard_type}: {low}, {medium}, {high}, {critical}")
    
    return {
        "hazard_type": hazard_type,
        "thresholds": _thresholds[hazard_type],
        "message": "Thresholds updated successfully"
    }


def _classify_severity(hazard_type: str, value: float) -> RiskLevel:
    th = _thresholds.get(hazard_type, _thresholds["flood"])
    if value >= th["critical"]:
        return RiskLevel.CRITICAL
    elif value >= th["high"]:
        return RiskLevel.HIGH
    elif value >= th["medium"]:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_measurement(
    hazard_type: HazardType,
    region: str,
    value: float,
    metadata: Optional[dict] = None,
):
    """
    Ingest a real-time measurement from sensor/stream and evaluate for alerting
    """
    severity = _classify_severity(hazard_type.value, value)
    
    if metadata is None:
        metadata = {}
    
    alert = AlertPayload(
        hazard_type=hazard_type,
        severity=severity,
        region=region,
        message=f"{hazard_type.value} reading in {region}: {value:.2f} ({severity.value})",
        risk_score=value,
        affected_population=metadata.get("population", 0),
        timestamp=datetime.utcnow(),
        metadata={**metadata, "value": value},
    )
    
    _active_alerts.append(alert)
    _alert_history.append(alert)
    
    logger.info(f"ALERT [{severity.value.upper()}] {hazard_type.value} in {region}: {value:.2f}")
    
    escalation = _escalation_escalation_chain[severity.value]
    
    return {
        "status": "ingested",
        "alert": alert.dict(),
        "escalation_channels": escalation,
        "active_alerts_count": len(_active_alerts),
    }


@router.post("/alerts/acknowledge/{alert_id}")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an active alert"""
    for i, alert in enumerate(_active_alerts):
        if str(i) == alert_id:
            acked = _active_alerts.pop(i)
            return {"status": "acknowledged", "alert_id": alert_id, "alert": acked.dict()}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Active alert {alert_id} not found"
    )


@router.get("/alerts/active")
async def get_active_alerts():
    """Retrieve all currently active alerts"""
    return {"active_alerts": [a.dict() for a in _active_alerts], "count": len(_active_alerts)}


@router.get("/alerts/history")
async def get_alert_history(limit: int = 50):
    """Retrieve alert history (recent alerts)"""
    recent = _alert_history[-limit:] if limit else _alert_history
    return {"history": [a.dict() for a in recent], "count": len(recent)}


@router.post("/alerts/rule-eval", response_model=AlertPayload)
async def evaluate_alert_rule(
    hazard_type: HazardType,
    region: str,
    flood_risk_score: float = 0.0,
    population_exposed: float = 0.0,
    infrastructure_risk: float = 0.0,
    temperature_anomaly: float = 0.0,
):
    """
    Evaluate a composite alert rule combining ML risk scores and thresholds
    """
    composite_risk = (
        0.5 * flood_risk_score +
        0.3 * infrastructure_risk +
        0.2 * min(1.0, temperature_anomaly / 50.0)
    )
    
    severity = _classify_severity(hazard_type.value, composite_risk)
    
    alert = AlertPayload(
        hazard_type=hazard_type,
        severity=severity,
        region=region,
        message=(
            f"Composite alert for {hazard_type.value} in {region}: "
            f"risk={composite_risk:.3f}, exposed={population_exposed:.0f}"
        ),
        risk_score=composite_risk,
        affected_population=population_exposed,
        timestamp=datetime.utcnow(),
        metadata={
            "flood_risk_score": flood_risk_score,
            "infrastructure_risk": infrastructure_risk,
            "temperature_anomaly": temperature_anomaly,
            "composite": composite_risk,
        },
    )
    
    _active_alerts.append(alert)
    _alert_history.append(alert)
    
    return alert


@router.get("/stats")
async def get_monitoring_stats():
    """Retrieve monitoring statistics"""
    return {
        "total_ingested": len(_alert_history),
        "active_alerts": len(_active_alerts),
        "by_severity": {
            sev.value: sum(1 for a in _alert_history if a.severity == sev)
            for sev in RiskLevel
        },
        "by_hazard": {
            hz.value: sum(1 for a in _alert_history if a.hazard_type == hz)
            for hz in HazardType
        },
        "last_ingested_at": _alert_history[-1].timestamp if _alert_history else None,
    }
