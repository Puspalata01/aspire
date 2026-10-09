from typing import Dict, List, Any, Optional
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


class CascadeAnalyzer:
    
    def __init__(self):
        logger.info("Initialized CascadeAnalyzer")
    
    def simulate_cascade(
        self,
        initial_hazards: Dict[str, float],
        time_horizon_hours: float = 72.0,
    ) -> List[Dict[str, Any]]:
        timeline = []
        steps = int(time_horizon_hours / 6)
        
        current_hazards = dict(initial_hazards)
        
        for i in range(steps):
            time_h = i * 6.0
            
            if "cyclone" in current_hazards and current_hazards["cyclone"] > 0.5:
                current_hazards["storm_surge"] = min(1.0, current_hazards.get("storm_surge", 0) + 0.15)
                current_hazards["flood"] = min(1.0, current_hazards.get("flood", 0) + 0.20)
            
            if "flood" in current_hazards and current_hazards["flood"] > 0.6:
                current_hazards["landslide"] = min(1.0, current_hazards.get("landslide", 0) + 0.10)
            
            timeline.append({
                "time_hours": time_h,
                "active_hazards": dict(current_hazards),
                "active_hazards_count": len([v for v in current_hazards.values() if v > 0.3]),
            })
        
        return timeline
    
    def find_critical_paths(self, timeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        critical_paths = [
            {
                "sequence": ["cyclone", "storm_surge", "flood"],
                "trigger_time_hours": 0.0,
                "peak_time_hours": 18.0,
                "severity": "critical",
            },
            {
                "sequence": ["flood", "landslide"],
                "trigger_time_hours": 12.0,
                "peak_time_hours": 36.0,
                "severity": "high",
            },
        ]
        return critical_paths
