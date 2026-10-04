from typing import Dict, List, Any, Optional
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.decision.resource_allocation_optimizer import ResourceAllocationOptimizer
from utils.logger import get_logger

logger = get_logger(__name__)


class ResourceOptimizer:
    
    def __init__(self):
        self.optimizer = ResourceAllocationOptimizer()
        logger.info("Initialized ResourceOptimizer")
    
    def optimize_allocation(
        self,
        demand: Dict[str, Dict[str, float]],
        supply: Dict[str, Dict[str, float]],
        road_segments: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        result = self.optimizer.run(
            resource_demand=demand,
            resource_supply=supply,
            road_segments=road_segments,
        )
        return result
