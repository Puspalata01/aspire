import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ShelterConfig:
    min_space_per_person_sqm: float = 3.5
    comfort_space_per_person_sqm: float = 6.0
    max_occupancy_factor: float = 1.2
    vulnerable_space_multiplier: float = 1.5
    essential_amenities: List[str] = None
    capacity_buffer_fraction: float = 0.15

    def __post_init__(self):
        if self.essential_amenities is None:
            self.essential_amenities = [
                'water', 'sanitation', 'medical', 'food_storage', 'power'
            ]


class ShelterCapacityPlanner:

    def __init__(self, config: Optional[ShelterConfig] = None):
        self.config = config or ShelterConfig()
        self.shelters = {}
        logger.info("Initialized ShelterCapacityPlanner")

    def assess_shelter_capacity(
        self,
        shelter_id: str,
        floor_area_sqm: float,
        existing_occupancy: int = 0,
        amenities: Optional[List[str]] = None,
        accessibility_score: float = 1.0,
    ) -> Dict:
        cfg = self.config
        
        max_capacity = int(floor_area_sqm / cfg.min_space_per_person_sqm)
        comfort_capacity = int(floor_area_sqm / cfg.comfort_space_per_person_sqm)
        emergency_capacity = int(max_capacity * cfg.max_occupancy_factor)
        
        available_capacity = max_capacity - existing_occupancy
        
        amenity_coverage = 0.0
        if amenities:
            covered = sum(1 for a in cfg.essential_amenities if a in amenities)
            amenity_coverage = covered / len(cfg.essential_amenities)
        
        capacity_score = (
            (available_capacity / max_capacity) * 0.4 +
            amenity_coverage * 0.4 +
            accessibility_score * 0.2
        )
        
        return {
            'shelter_id': shelter_id,
            'max_capacity': max_capacity,
            'comfort_capacity': comfort_capacity,
            'emergency_capacity': emergency_capacity,
            'existing_occupancy': existing_occupancy,
            'available_capacity': available_capacity,
            'amenity_coverage': amenity_coverage,
            'accessibility_score': accessibility_score,
            'capacity_score': capacity_score,
        }

    def plan_shelter_allocation(
        self,
        shelters: List[Dict],
        displaced_population: float,
        vulnerable_fraction: float = 0.30,
        distribution_strategy: str = 'balanced',
    ) -> Dict:
        logger.info(f"Planning shelter allocation for {displaced_population:,.0f} displaced persons...")
        
        shelter_assessments = []
        total_available_capacity = 0
        
        for shelter in shelters:
            assessment = self.assess_shelter_capacity(
                shelter_id=shelter['id'],
                floor_area_sqm=shelter['floor_area_sqm'],
                existing_occupancy=shelter.get('existing_occupancy', 0),
                amenities=shelter.get('amenities', []),
                accessibility_score=shelter.get('accessibility_score', 1.0),
            )
            shelter_assessments.append(assessment)
            total_available_capacity += assessment['available_capacity']
        
        if distribution_strategy == 'balanced':
            shelter_assessments.sort(key=lambda x: x['capacity_score'], reverse=True)
        elif distribution_strategy == 'fill_first':
            shelter_assessments.sort(key=lambda x: x['available_capacity'], reverse=True)
        elif distribution_strategy == 'comfort_priority':
            shelter_assessments.sort(
                key=lambda x: x['comfort_capacity'] - x['existing_occupancy'],
                reverse=True
            )
        
        allocation = {}
        remaining_population = displaced_population
        
        for assessment in shelter_assessments:
            if remaining_population <= 0:
                allocation[assessment['shelter_id']] = {
                    'allocated': 0,
                    'utilization': assessment['existing_occupancy'] / assessment['max_capacity'],
                }
                continue
            
            allocatable = min(
                assessment['available_capacity'],
                remaining_population
            )
            
            allocation[assessment['shelter_id']] = {
                'allocated': allocatable,
                'total_occupancy': assessment['existing_occupancy'] + allocatable,
                'utilization': (assessment['existing_occupancy'] + allocatable) / assessment['max_capacity'],
                'capacity_score': assessment['capacity_score'],
            }
            
            remaining_population -= allocatable
        
        capacity_gap = max(0, remaining_population)
        allocation_rate = (displaced_population - capacity_gap) / displaced_population if displaced_population > 0 else 1.0
        
        avg_utilization = np.mean([
            alloc['utilization'] for alloc in allocation.values()
        ])
        
        logger.info(
            f"Allocation complete — rate: {allocation_rate*100:.1f}%, "
            f"capacity gap: {capacity_gap:,.0f}, avg utilization: {avg_utilization*100:.1f}%"
        )
        
        return {
            'allocation': allocation,
            'shelter_assessments': shelter_assessments,
            'total_available_capacity': total_available_capacity,
            'displaced_population': displaced_population,
            'capacity_gap': capacity_gap,
            'allocation_rate': allocation_rate,
            'average_utilization': avg_utilization,
        }

    def calculate_amenity_requirements(
        self,
        population: float,
        duration_days: float = 7.0,
    ) -> Dict:
        water_liters_per_person_day = 15.0
        food_kg_per_person_day = 0.5
        sanitation_units_per_100_persons = 1.0
        medical_staff_per_1000_persons = 2.0
        
        return {
            'water_liters': population * water_liters_per_person_day * duration_days,
            'food_kg': population * food_kg_per_person_day * duration_days,
            'sanitation_units': int(np.ceil(population * sanitation_units_per_100_persons / 100)),
            'medical_staff': int(np.ceil(population * medical_staff_per_1000_persons / 1000)),
            'blankets': int(population * 1.5),
            'hygiene_kits': int(population * 0.8),
            'duration_days': duration_days,
        }

    def identify_capacity_gaps(
        self,
        allocation_result: Dict,
    ) -> List[Dict]:
        gaps = []
        
        for shelter_id, alloc in allocation_result['allocation'].items():
            utilization = alloc['utilization']
            
            if utilization > 0.95:
                gaps.append({
                    'shelter_id': shelter_id,
                    'gap_type': 'overcapacity',
                    'utilization': utilization,
                    'severity': 'critical' if utilization > 1.1 else 'high',
                })
            
            assessment = next(
                (s for s in allocation_result['shelter_assessments'] if s['shelter_id'] == shelter_id),
                None
            )
            if assessment and assessment['amenity_coverage'] < 0.6:
                gaps.append({
                    'shelter_id': shelter_id,
                    'gap_type': 'amenities',
                    'amenity_coverage': assessment['amenity_coverage'],
                    'severity': 'critical' if assessment['amenity_coverage'] < 0.4 else 'medium',
                })
        
        if allocation_result['capacity_gap'] > 0:
            gaps.append({
                'shelter_id': 'system_wide',
                'gap_type': 'insufficient_capacity',
                'capacity_gap': allocation_result['capacity_gap'],
                'severity': 'critical',
            })
        
        gaps.sort(key=lambda x: 0 if x['severity'] == 'critical' else (1 if x['severity'] == 'high' else 2))
        
        return gaps

    def recommend_expansion(
        self,
        capacity_gap: float,
    ) -> List[Dict]:
        recommendations = []
        
        if capacity_gap <= 0:
            return recommendations
        
        temporary_shelter_capacity = 200
        num_temp_shelters = int(np.ceil(capacity_gap / temporary_shelter_capacity))
        
        recommendations.append({
            'action': 'deploy_temporary_shelters',
            'quantity': num_temp_shelters,
            'capacity_added': num_temp_shelters * temporary_shelter_capacity,
            'estimated_cost_inr': num_temp_shelters * 500000,
            'deployment_time_days': 3,
            'priority': 'critical',
        })
        
        if capacity_gap > 1000:
            recommendations.append({
                'action': 'activate_community_hosting',
                'estimated_capacity': int(capacity_gap * 0.3),
                'estimated_cost_inr': int(capacity_gap * 0.3 * 200),
                'deployment_time_days': 1,
                'priority': 'high',
            })
        
        if capacity_gap > 5000:
            recommendations.append({
                'action': 'request_regional_support',
                'capacity_needed': int(capacity_gap * 0.4),
                'priority': 'critical',
            })
        
        return recommendations

    def run(
        self,
        shelters: List[Dict],
        displaced_population: float,
        vulnerable_fraction: float = 0.30,
        distribution_strategy: str = 'balanced',
        duration_days: float = 7.0,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running shelter capacity planning...")
        
        allocation_result = self.plan_shelter_allocation(
            shelters=shelters,
            displaced_population=displaced_population,
            vulnerable_fraction=vulnerable_fraction,
            distribution_strategy=distribution_strategy,
        )
        
        amenity_requirements = self.calculate_amenity_requirements(
            population=displaced_population - allocation_result['capacity_gap'],
            duration_days=duration_days,
        )
        
        gaps = self.identify_capacity_gaps(allocation_result)
        
        recommendations = self.recommend_expansion(allocation_result['capacity_gap'])
        
        result = {
            **allocation_result,
            'amenity_requirements': amenity_requirements,
            'capacity_gaps': gaps,
            'expansion_recommendations': recommendations,
            'planning_parameters': {
                'displaced_population': displaced_population,
                'vulnerable_fraction': vulnerable_fraction,
                'distribution_strategy': distribution_strategy,
                'duration_days': duration_days,
            }
        }
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            import json
            with open(output_path / 'shelter_capacity_plan.json', 'w') as f:
                json.dump(result, f, indent=2, default=str)
            logger.info(f"Shelter capacity plan saved to {output_path}")
        
        logger.info(
            f"Shelter planning complete — "
            f"allocated: {displaced_population - allocation_result['capacity_gap']:,.0f}, "
            f"gap: {allocation_result['capacity_gap']:,.0f}, "
            f"recommendations: {len(recommendations)}"
        )
        
        return result


if __name__ == "__main__":
    np.random.seed(42)
    
    shelters = [
        {
            'id': f'shelter_{i}',
            'floor_area_sqm': np.random.uniform(500, 3000),
            'existing_occupancy': np.random.randint(0, 100),
            'amenities': np.random.choice(
                ['water', 'sanitation', 'medical', 'food_storage', 'power'],
                size=np.random.randint(2, 6),
                replace=False
            ).tolist(),
            'accessibility_score': np.random.uniform(0.6, 1.0),
        }
        for i in range(15)
    ]
    
    displaced_population = 8500
    
    planner = ShelterCapacityPlanner()
    result = planner.run(
        shelters=shelters,
        displaced_population=displaced_population,
        distribution_strategy='balanced',
        duration_days=7.0,
        output_path=Path('data/processed/shelter_planning'),
    )
    
    print(f"\nDisplaced population    : {result['displaced_population']:,.0f}")
    print(f"Available capacity      : {result['total_available_capacity']:,.0f}")
    print(f"Allocation rate         : {result['allocation_rate']*100:.1f}%")
    print(f"Capacity gap            : {result['capacity_gap']:,.0f}")
    print(f"Average utilization     : {result['average_utilization']*100:.1f}%")
    print(f"Identified gaps         : {len(result['capacity_gaps'])}")
    print(f"Recommendations         : {len(result['expansion_recommendations'])}")
