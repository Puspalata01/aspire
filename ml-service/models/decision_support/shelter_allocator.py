from typing import Dict, List, Any
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.decision.shelter_capacity_planner import ShelterCapacityPlanner
from utils.logger import get_logger

logger = get_logger(__name__)


class ShelterAllocator:
    
    def __init__(self):
        self.planner = ShelterCapacityPlanner()
        logger.info("Initialized ShelterAllocator")
    
    def allocate_shelters(
        self,
        displaced_population: float,
        shelters: List[Dict[str, Any]],
        population_zones: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        result = self.planner.run(
            shelters=shelters,
            displaced_population=displaced_population,
            population_zones=population_zones,
        )
        return result
