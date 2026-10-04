from typing import Dict, List, Any, Optional
import numpy as np
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.heatwave.heatwave_detector import HeatwaveDetector as BaseHeatwaveDetector, HeatwaveConfig
from utils.logger import get_logger

logger = get_logger(__name__)


class HeatwaveDetector:
    
    def __init__(
        self,
        t_max_threshold: float = 40.0,
        duration_days: int = 3,
        intensity_threshold: float = 2.0,
    ):
        config = HeatwaveConfig(
            temperature_threshold_celsius=t_max_threshold,
            duration_threshold_days=duration_days,
        )
        self.base_detector = BaseHeatwaveDetector(config)
        self.t_max_threshold = t_max_threshold
        self.duration_days = duration_days
        logger.info("Initialized HeatwaveDetector wrapper")
    
    def detect_events(
        self,
        temperature_timeseries: np.ndarray,
        threshold: float = 40.0,
        min_duration: int = 3,
    ) -> List[Dict[str, Any]]:
        if temperature_timeseries.ndim == 3:
            events = []
            spatial_mean = temperature_timeseries.mean(axis=(1, 2))
            consecutive = 0
            start_idx = 0
            
            for i, temp in enumerate(spatial_mean):
                if temp >= threshold:
                    if consecutive == 0:
                        start_idx = i
                    consecutive += 1
                else:
                    if consecutive >= min_duration:
                        events.append({
                            "event_id": f"hw_{start_idx}",
                            "start_day": start_idx,
                            "end_day": i - 1,
                            "duration": consecutive,
                            "max_temp": float(spatial_mean[start_idx:i].max()),
                            "avg_temp": float(spatial_mean[start_idx:i].mean()),
                            "intensity": float(spatial_mean[start_idx:i].max() - threshold),
                        })
                    consecutive = 0
            
            if consecutive >= min_duration:
                events.append({
                    "event_id": f"hw_{start_idx}",
                    "start_day": start_idx,
                    "end_day": len(spatial_mean) - 1,
                    "duration": consecutive,
                    "max_temp": float(spatial_mean[start_idx:].max()),
                    "avg_temp": float(spatial_mean[start_idx:].mean()),
                    "intensity": float(spatial_mean[start_idx:].max() - threshold),
                })
            
            return events
        
        return []
