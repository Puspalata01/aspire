import numpy as np
from typing import Dict, List, Optional
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.decision.evacuation_route_optimizer import EvacuationRouteOptimizer, EvacuationConfig
from models.decision.resource_allocation_optimizer import ResourceAllocationOptimizer, ResourceConfig
from models.decision.shelter_capacity_planner import ShelterCapacityPlanner, ShelterConfig
from utils.logger import get_logger

logger = get_logger(__name__)


class DecisionSupportEngine:

    def __init__(
        self,
        evacuation_config: Optional[EvacuationConfig] = None,
        resource_config: Optional[ResourceConfig] = None,
        shelter_config: Optional[ShelterConfig] = None,
    ):
        self.evacuation_optimizer = EvacuationRouteOptimizer(evacuation_config)
        self.resource_optimizer = ResourceAllocationOptimizer(resource_config)
        self.shelter_planner = ShelterCapacityPlanner(shelter_config)
        logger.info("Initialized DecisionSupportEngine")

    def run(
        self,
        road_segments: List[Dict],
        shelters: List[Dict],
        population_zones: List[Dict],
        resource_demand: Dict[str, Dict[str, float]],
        resource_supply: Dict[str, Dict[str, float]],
        displaced_population: float,
        flood_risk_map: Optional[np.ndarray] = None,
        priorities: Optional[Dict[str, str]] = None,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("=" * 60)
        logger.info("Starting Decision Support System")
        logger.info("=" * 60)

        logger.info("\n[1/3] Optimizing evacuation routes...")
        evacuation_result = self.evacuation_optimizer.run(
            road_segments=road_segments,
            shelters=shelters,
            population_zones=population_zones,
            flood_risk_map=flood_risk_map,
        )

        logger.info("\n[2/3] Optimizing resource allocation...")
        
        zone_ids = list(resource_demand.keys())
        depot_ids = list(resource_supply.keys())
        
        depot_locations = {
            depot['id']: depot.get('location', (np.random.uniform(0, 100), np.random.uniform(0, 100)))
            for depot in shelters[:len(depot_ids)]
        }
        zone_locations = {
            zone['id']: zone.get('location', (np.random.uniform(0, 100), np.random.uniform(0, 100)))
            for zone in population_zones
        }
        
        resource_result = self.resource_optimizer.run(
            demand=resource_demand,
            supply=resource_supply,
            priorities=priorities,
            depot_locations=depot_locations,
            zone_locations=zone_locations,
        )

        logger.info("\n[3/3] Planning shelter capacity...")
        shelter_result = self.shelter_planner.run(
            shelters=shelters,
            displaced_population=displaced_population,
            distribution_strategy='balanced',
            duration_days=7.0,
        )

        combined = {
            'evacuation': {
                'total_population': evacuation_result['total_population'],
                'assigned_population': evacuation_result['assigned_population'],
                'assignment_rate': evacuation_result['assignment_rate'],
                'clearance_time_hours': evacuation_result['clearance_time']['total_evacuation_time_hours'],
                'bottlenecks_count': len(evacuation_result['bottlenecks']),
                'unassigned_zones': evacuation_result['unassigned_zones'],
            },
            'resources': {
                'total_demand': resource_result['total_demand'],
                'total_unmet': resource_result['total_unmet'],
                'fulfillment_rate': resource_result['fulfillment_rate'],
                'total_deliveries': resource_result['delivery_schedule']['total_deliveries'],
                'max_delivery_time_hours': resource_result['delivery_schedule']['max_delivery_time_hours'],
            },
            'shelter': {
                'displaced_population': shelter_result['displaced_population'],
                'total_available_capacity': shelter_result['total_available_capacity'],
                'capacity_gap': shelter_result['capacity_gap'],
                'allocation_rate': shelter_result['allocation_rate'],
                'average_utilization': shelter_result['average_utilization'],
                'capacity_gaps_count': len(shelter_result['capacity_gaps']),
                'recommendations_count': len(shelter_result['expansion_recommendations']),
            },
            'detailed_results': {
                'evacuation_full': evacuation_result,
                'resources_full': resource_result,
                'shelter_full': shelter_result,
            }
        }

        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            import json
            
            summary = {k: v for k, v in combined.items() if k != 'detailed_results'}
            with open(output_path / 'decision_support_summary.json', 'w') as f:
                json.dump(summary, f, indent=2, default=str)
            
            logger.info(f"Decision support results saved to {output_path}")

        logger.info("\n" + "=" * 60)
        logger.info("Decision Support System Completed")
        logger.info(f"  Evacuation assignment : {evacuation_result['assignment_rate']*100:.1f}%")
        logger.info(f"  Clearance time        : {evacuation_result['clearance_time']['total_evacuation_time_hours']:.1f}h")
        logger.info(f"  Resource fulfillment  : {resource_result['fulfillment_rate']*100:.1f}%")
        logger.info(f"  Shelter allocation    : {shelter_result['allocation_rate']*100:.1f}%")
        logger.info(f"  Capacity gap          : {shelter_result['capacity_gap']:,.0f}")
        logger.info("=" * 60)

        return combined


if __name__ == "__main__":
    np.random.seed(42)
    
    road_segments = []
    for i in range(50):
        road_segments.append({
            'from': i,
            'to': i + 1,
            'distance_km': np.random.uniform(2, 10),
            'road_type': np.random.choice(['highway', 'major', 'minor'], p=[0.2, 0.3, 0.5]),
            'risk_score': np.random.uniform(0, 0.6),
        })
    for i in range(0, 50, 10):
        road_segments.append({
            'from': i,
            'to': i + 5,
            'distance_km': np.random.uniform(5, 15),
            'road_type': 'major',
            'risk_score': np.random.uniform(0, 0.3),
        })
    
    shelters = [
        {
            'id': f'shelter_{i}',
            'node': 10 + i*10,
            'capacity': np.random.randint(500, 3000),
            'location': (np.random.uniform(0, 100), np.random.uniform(0, 100)),
            'floor_area_sqm': np.random.uniform(500, 3000),
            'existing_occupancy': np.random.randint(0, 100),
            'amenities': np.random.choice(
                ['water', 'sanitation', 'medical', 'food_storage', 'power'],
                size=np.random.randint(2, 6),
                replace=False
            ).tolist(),
            'accessibility_score': np.random.uniform(0.6, 1.0),
        }
        for i in range(5)
    ]
    
    population_zones = [
        {
            'id': f'zone_{i}',
            'node': i*5,
            'population': np.random.randint(100, 2000),
            'vulnerable_fraction': np.random.uniform(0.15, 0.45),
            'location': (np.random.uniform(0, 100), np.random.uniform(0, 100))
        }
        for i in range(10)
    ]
    
    resource_demand = {
        f'zone_{i}': {
            'food': np.random.uniform(100, 500),
            'water': np.random.uniform(200, 800),
            'medical': np.random.uniform(50, 200),
            'shelter_supplies': np.random.uniform(100, 400),
        }
        for i in range(10)
    }
    
    resource_supply = {
        f'depot_{i}': {
            'food': np.random.uniform(800, 1500),
            'water': np.random.uniform(1500, 3000),
            'medical': np.random.uniform(300, 800),
            'shelter_supplies': np.random.uniform(600, 1200),
        }
        for i in range(3)
    }
    
    priorities = {
        f'zone_{i}': np.random.choice(['critical', 'high', 'medium', 'low'], p=[0.2, 0.3, 0.3, 0.2])
        for i in range(10)
    }
    
    displaced_population = 8500
    
    engine = DecisionSupportEngine()
    result = engine.run(
        road_segments=road_segments,
        shelters=shelters,
        population_zones=population_zones,
        resource_demand=resource_demand,
        resource_supply=resource_supply,
        displaced_population=displaced_population,
        priorities=priorities,
        output_path=Path('data/processed/decision_support'),
    )
    
    print(f"\nEvacuation assignment  : {result['evacuation']['assignment_rate']*100:.1f}%")
    print(f"Clearance time         : {result['evacuation']['clearance_time_hours']:.1f} hours")
    print(f"Resource fulfillment   : {result['resources']['fulfillment_rate']*100:.1f}%")
    print(f"Shelter allocation     : {result['shelter']['allocation_rate']*100:.1f}%")
    print(f"Capacity gap           : {result['shelter']['capacity_gap']:,.0f} persons")
