from typing import Dict, List, Any, Optional
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.decision.evacuation_route_optimizer import EvacuationRouteOptimizer
from utils.logger import get_logger

logger = get_logger(__name__)


class EvacuationPlanner:
    
    def __init__(self):
        self.optimizer = EvacuationRouteOptimizer()
        logger.info("Initialized EvacuationPlanner")
    
    def plan_evacuation(
        self,
        population_zones: List[Dict[str, Any]],
        shelters: List[Dict[str, Any]],
        road_segments: List[Dict[str, Any]],
        priorities: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        normalized_segments = []
        for i, seg in enumerate(road_segments):
            s = dict(seg)
            if 'from' not in s:
                s['from'] = s.get('source', 0)
            if 'to' not in s:
                s['to'] = s.get('target', 1)
            normalized_segments.append(s)
            
        normalized_shelters = []
        for i, sh in enumerate(shelters):
            s = dict(sh)
            if 'node' not in s:
                s['node'] = s.get('to', s.get('target', 10 + i * 10))
            normalized_shelters.append(s)
            
        normalized_zones = []
        for i, pz in enumerate(population_zones):
            z = dict(pz)
            if 'node' not in z:
                z['node'] = z.get('from', z.get('source', i * 5))
            normalized_zones.append(z)
            
        result = self.optimizer.run(
            road_segments=normalized_segments,
            shelters=normalized_shelters,
            population_zones=normalized_zones,
            flood_risk_map=None,
        )
        return result
