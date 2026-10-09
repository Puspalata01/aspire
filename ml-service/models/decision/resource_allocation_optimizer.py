import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
from ortools.linear_solver import pywraplp
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ResourceConfig:
    resource_types: List[str] = None
    optimization_objective: str = "minimize_unmet_demand"
    max_delivery_distance_km: float = 100.0
    vehicle_capacity_units: float = 1000.0
    vehicle_speed_kmh: float = 40.0
    planning_horizon_hours: float = 72.0
    priority_weights: Dict[str, float] = None

    def __post_init__(self):
        if self.resource_types is None:
            self.resource_types = [
                'food', 'water', 'medical', 'shelter_supplies', 'rescue_teams'
            ]
        if self.priority_weights is None:
            self.priority_weights = {
                'critical': 10.0,
                'high': 5.0,
                'medium': 2.0,
                'low': 1.0,
            }


class ResourceAllocationOptimizer:

    def __init__(self, config: Optional[ResourceConfig] = None):
        self.config = config or ResourceConfig()
        self.solver = None
        logger.info("Initialized ResourceAllocationOptimizer")

    def optimize_allocation(
        self,
        demand: Dict[str, Dict[str, float]],
        supply: Dict[str, Dict[str, float]],
        distance_matrix: np.ndarray,
        priorities: Dict[str, str],
    ) -> Dict:
        logger.info("Running resource allocation optimization...")
        
        demand_zones = list(demand.keys())
        supply_depots = list(supply.keys())
        resources = self.config.resource_types
        
        solver = pywraplp.Solver.CreateSolver('SCIP')
        if not solver:
            raise RuntimeError("OR-Tools solver not available")
        
        allocation = {}
        for r in resources:
            allocation[r] = {}
            for i, depot in enumerate(supply_depots):
                allocation[r][depot] = {}
                for j, zone in enumerate(demand_zones):
                    var_name = f'alloc_{r}_{depot}_{zone}'
                    allocation[r][depot][zone] = solver.NumVar(0, solver.infinity(), var_name)
        
        for r in resources:
            for i, depot in enumerate(supply_depots):
                available = supply[depot].get(r, 0)
                constraint = solver.Constraint(0, available)
                for j, zone in enumerate(demand_zones):
                    constraint.SetCoefficient(allocation[r][depot][zone], 1)
        
        unmet_demand = {}
        for r in resources:
            unmet_demand[r] = {}
            for j, zone in enumerate(demand_zones):
                needed = demand[zone].get(r, 0)
                var_name = f'unmet_{r}_{zone}'
                unmet_var = solver.NumVar(0, needed, var_name)
                unmet_demand[r][zone] = unmet_var
                
                constraint = solver.Constraint(needed, needed)
                for i, depot in enumerate(supply_depots):
                    constraint.SetCoefficient(allocation[r][depot][zone], 1)
                constraint.SetCoefficient(unmet_var, 1)
        
        objective = solver.Objective()
        
        for r in resources:
            for j, zone in enumerate(demand_zones):
                priority = priorities.get(zone, 'medium')
                weight = self.config.priority_weights.get(priority, 1.0)
                objective.SetCoefficient(unmet_demand[r][zone], weight)
        
        objective.SetMinimization()
        
        logger.info(f"Solving LP with {solver.NumVariables()} variables and {solver.NumConstraints()} constraints...")
        status = solver.Solve()
        
        if status != pywraplp.Solver.OPTIMAL:
            logger.warning(f"Solver status: {status} (not optimal)")
        
        result_allocation = {}
        for r in resources:
            result_allocation[r] = {}
            for depot in supply_depots:
                result_allocation[r][depot] = {}
                for zone in demand_zones:
                    value = allocation[r][depot][zone].solution_value()
                    if value > 0.01:
                        result_allocation[r][depot][zone] = value
        
        result_unmet = {}
        for r in resources:
            result_unmet[r] = {}
            for zone in demand_zones:
                value = unmet_demand[r][zone].solution_value()
                result_unmet[r][zone] = value
        
        total_demand = sum(
            sum(demand[zone].values()) for zone in demand_zones
        )
        total_unmet = sum(
            sum(result_unmet[r].values()) for r in resources
        )
        fulfillment_rate = 1 - (total_unmet / total_demand) if total_demand > 0 else 1.0
        
        logger.info(f"Optimization complete — fulfillment rate: {fulfillment_rate*100:.1f}%")
        
        return {
            'allocation': result_allocation,
            'unmet_demand': result_unmet,
            'total_demand': total_demand,
            'total_unmet': total_unmet,
            'fulfillment_rate': fulfillment_rate,
            'solver_status': status,
        }

    def calculate_delivery_schedule(
        self,
        allocation: Dict[str, Dict[str, Dict[str, float]]],
        depot_locations: Dict[str, Tuple[float, float]],
        zone_locations: Dict[str, Tuple[float, float]],
    ) -> Dict:
        logger.info("Calculating delivery schedule...")
        
        schedule = []
        
        for resource in allocation:
            for depot in allocation[resource]:
                for zone, quantity in allocation[resource][depot].items():
                    if quantity < 0.01:
                        continue
                    
                    depot_loc = depot_locations.get(depot, (0, 0))
                    zone_loc = zone_locations.get(zone, (0, 0))
                    
                    distance = np.sqrt(
                        (depot_loc[0] - zone_loc[0])**2 +
                        (depot_loc[1] - zone_loc[1])**2
                    )
                    
                    travel_time_hours = distance / self.config.vehicle_speed_kmh
                    num_trips = int(np.ceil(quantity / self.config.vehicle_capacity_units))
                    
                    total_time_hours = travel_time_hours * 2 * num_trips
                    
                    schedule.append({
                        'resource': resource,
                        'from': depot,
                        'to': zone,
                        'quantity': quantity,
                        'distance_km': distance,
                        'num_trips': num_trips,
                        'travel_time_hours': travel_time_hours,
                        'total_delivery_time_hours': total_time_hours,
                    })
        
        schedule.sort(key=lambda x: x['total_delivery_time_hours'])
        
        max_delivery_time = max(
            (s['total_delivery_time_hours'] for s in schedule),
            default=0
        )
        
        return {
            'schedule': schedule,
            'total_deliveries': len(schedule),
            'max_delivery_time_hours': max_delivery_time,
        }

    def prioritize_zones(
        self,
        zones: List[str],
        risk_scores: Dict[str, float],
        population: Dict[str, float],
        vulnerable_fraction: Dict[str, float],
    ) -> Dict[str, str]:
        priorities = {}
        
        for zone in zones:
            risk = risk_scores.get(zone, 0.0)
            pop = population.get(zone, 0.0)
            vuln = vulnerable_fraction.get(zone, 0.25)
            
            priority_score = (risk * 0.5) + (vuln * 0.3) + (min(pop / 10000, 1.0) * 0.2)
            
            if priority_score >= 0.75:
                priorities[zone] = 'critical'
            elif priority_score >= 0.50:
                priorities[zone] = 'high'
            elif priority_score >= 0.25:
                priorities[zone] = 'medium'
            else:
                priorities[zone] = 'low'
        
        return priorities

    def run(
        self,
        demand: Dict[str, Dict[str, float]],
        supply: Dict[str, Dict[str, float]],
        distance_matrix: Optional[np.ndarray] = None,
        priorities: Optional[Dict[str, str]] = None,
        depot_locations: Optional[Dict[str, Tuple[float, float]]] = None,
        zone_locations: Optional[Dict[str, Tuple[float, float]]] = None,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running resource allocation optimization...")
        
        demand_zones = list(demand.keys())
        supply_depots = list(supply.keys())
        
        if distance_matrix is None:
            distance_matrix = np.random.uniform(10, 100, (len(supply_depots), len(demand_zones)))
        
        if priorities is None:
            priorities = {zone: 'medium' for zone in demand_zones}
        
        allocation_result = self.optimize_allocation(
            demand=demand,
            supply=supply,
            distance_matrix=distance_matrix,
            priorities=priorities,
        )
        
        if depot_locations is None:
            depot_locations = {depot: (np.random.uniform(0, 100), np.random.uniform(0, 100))
                              for depot in supply_depots}
        if zone_locations is None:
            zone_locations = {zone: (np.random.uniform(0, 100), np.random.uniform(0, 100))
                             for zone in demand_zones}
        
        delivery_schedule = self.calculate_delivery_schedule(
            allocation=allocation_result['allocation'],
            depot_locations=depot_locations,
            zone_locations=zone_locations,
        )
        
        result = {
            **allocation_result,
            'delivery_schedule': delivery_schedule,
            'priorities': priorities,
        }
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            import json
            
            serializable = {k: v for k, v in result.items() if k != 'allocation'}
            serializable['allocation_summary'] = {
                resource: {
                    depot: sum(zones.values())
                    for depot, zones in depots.items()
                }
                for resource, depots in result['allocation'].items()
            }
            
            with open(output_path / 'resource_allocation.json', 'w') as f:
                json.dump(serializable, f, indent=2, default=str)
            logger.info(f"Resource allocation saved to {output_path}")
        
        logger.info(
            f"Resource allocation complete — "
            f"fulfillment: {allocation_result['fulfillment_rate']*100:.1f}%, "
            f"deliveries: {delivery_schedule['total_deliveries']}"
        )
        
        return result


if __name__ == "__main__":
    np.random.seed(42)
    
    demand = {
        f'zone_{i}': {
            'food': np.random.uniform(100, 500),
            'water': np.random.uniform(200, 800),
            'medical': np.random.uniform(50, 200),
            'shelter_supplies': np.random.uniform(100, 400),
        }
        for i in range(10)
    }
    
    supply = {
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
    
    optimizer = ResourceAllocationOptimizer()
    result = optimizer.run(
        demand=demand,
        supply=supply,
        priorities=priorities,
        output_path=Path('data/processed/resource_allocation'),
    )
    
    print(f"\nTotal demand      : {result['total_demand']:,.1f} units")
    print(f"Total unmet       : {result['total_unmet']:,.1f} units")
    print(f"Fulfillment rate  : {result['fulfillment_rate']*100:.1f}%")
    print(f"Total deliveries  : {result['delivery_schedule']['total_deliveries']}")
    print(f"Max delivery time : {result['delivery_schedule']['max_delivery_time_hours']:.1f} hours")
