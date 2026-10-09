import numpy as np
import networkx as nx
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass
from pathlib import Path
from heapq import heappush, heappop
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class EvacuationConfig:
    max_evacuation_distance_km: float = 50.0
    road_capacity_persons_per_hour: Dict[str, float] = None
    road_speeds_kmh: Dict[str, float] = None
    shelter_capacity_multiplier: float = 1.2
    congestion_factor_threshold: float = 0.7
    route_recalculation_interval_minutes: float = 15.0
    vulnerable_priority_weight: float = 2.0

    def __post_init__(self):
        if self.road_capacity_persons_per_hour is None:
            self.road_capacity_persons_per_hour = {
                'highway': 2000,
                'major': 800,
                'minor': 300,
            }
        if self.road_speeds_kmh is None:
            self.road_speeds_kmh = {
                'highway': 80,
                'major': 50,
                'minor': 30,
            }


class EvacuationRouteOptimizer:

    def __init__(self, config: Optional[EvacuationConfig] = None):
        self.config = config or EvacuationConfig()
        self.graph = nx.DiGraph()
        self.shelters = {}
        self.population_zones = {}
        logger.info("Initialized EvacuationRouteOptimizer")

    def build_road_network(
        self,
        road_segments: List[Dict],
        flood_risk_map: Optional[np.ndarray] = None,
    ):
        logger.info(f"Building road network with {len(road_segments)} segments...")
        
        for seg in road_segments:
            node_from = seg['from']
            node_to = seg['to']
            distance_km = seg['distance_km']
            road_type = seg.get('road_type', 'minor')
            
            speed = self.config.road_speeds_kmh.get(road_type, 30)
            capacity = self.config.road_capacity_persons_per_hour.get(road_type, 300)
            
            risk_factor = 1.0
            if flood_risk_map is not None and 'risk_score' in seg:
                risk_score = seg['risk_score']
                risk_factor = 1.0 + (risk_score * 5.0)
            
            travel_time = (distance_km / speed) * 60 * risk_factor
            
            self.graph.add_edge(
                node_from, node_to,
                distance=distance_km,
                travel_time=travel_time,
                capacity=capacity,
                road_type=road_type,
                risk_factor=risk_factor,
                current_load=0,
            )
        
        logger.info(f"Network built: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")

    def register_shelters(self, shelters: List[Dict]):
        for shelter in shelters:
            shelter_id = shelter['id']
            self.shelters[shelter_id] = {
                'node': shelter['node'],
                'capacity': shelter['capacity'],
                'current_occupancy': 0,
                'location': shelter.get('location', (0, 0)),
                'amenities': shelter.get('amenities', []),
            }
        logger.info(f"Registered {len(self.shelters)} shelters")

    def register_population_zones(self, zones: List[Dict]):
        for zone in zones:
            zone_id = zone['id']
            self.population_zones[zone_id] = {
                'node': zone['node'],
                'population': zone['population'],
                'vulnerable_fraction': zone.get('vulnerable_fraction', 0.25),
                'location': zone.get('location', (0, 0)),
            }
        logger.info(f"Registered {len(self.population_zones)} population zones")

    def find_optimal_route(
        self,
        origin_node: int,
        shelter_candidates: List[int],
        weight: str = 'travel_time',
    ) -> Optional[Dict]:
        best_route = None
        best_cost = float('inf')
        best_shelter = None
        
        for shelter_node in shelter_candidates:
            if not nx.has_path(self.graph, origin_node, shelter_node):
                continue
            
            try:
                path = nx.shortest_path(
                    self.graph, origin_node, shelter_node, weight=weight
                )
                cost = nx.shortest_path_length(
                    self.graph, origin_node, shelter_node, weight=weight
                )
                
                if cost < best_cost:
                    best_cost = cost
                    best_route = path
                    best_shelter = shelter_node
            except nx.NetworkXNoPath:
                continue
        
        if best_route is None:
            return None
        
        route_distance = sum(
            self.graph[best_route[i]][best_route[i+1]]['distance']
            for i in range(len(best_route) - 1)
        )
        
        return {
            'path': best_route,
            'shelter': best_shelter,
            'travel_time_minutes': best_cost,
            'distance_km': route_distance,
            'num_segments': len(best_route) - 1,
        }

    def optimize_evacuation_plan(
        self,
        prioritize_vulnerable: bool = True,
    ) -> Dict:
        logger.info("Optimizing evacuation plan...")
        
        evacuation_plan = {}
        shelter_assignments = {sid: [] for sid in self.shelters.keys()}
        unassigned_zones = []
        
        zones = list(self.population_zones.items())
        if prioritize_vulnerable:
            zones.sort(key=lambda x: x[1]['vulnerable_fraction'], reverse=True)
        
        for zone_id, zone_data in zones:
            origin = zone_data['node']
            population = zone_data['population']
            
            available_shelters = [
                sid for sid, sdata in self.shelters.items()
                if sdata['current_occupancy'] < sdata['capacity']
            ]
            
            if not available_shelters:
                logger.warning(f"No available shelter capacity for zone {zone_id}")
                unassigned_zones.append(zone_id)
                continue
            
            shelter_nodes = [self.shelters[sid]['node'] for sid in available_shelters]
            
            route = self.find_optimal_route(origin, shelter_nodes)
            
            if route is None:
                logger.warning(f"No path found for zone {zone_id}")
                unassigned_zones.append(zone_id)
                continue
            
            assigned_shelter_id = None
            for sid, sdata in self.shelters.items():
                if sdata['node'] == route['shelter']:
                    assigned_shelter_id = sid
                    break
            
            if assigned_shelter_id:
                remaining_capacity = (
                    self.shelters[assigned_shelter_id]['capacity'] -
                    self.shelters[assigned_shelter_id]['current_occupancy']
                )
                assigned_population = min(population, remaining_capacity)
                
                self.shelters[assigned_shelter_id]['current_occupancy'] += assigned_population
                
                evacuation_plan[zone_id] = {
                    'shelter': assigned_shelter_id,
                    'route': route,
                    'population': assigned_population,
                    'unassigned_population': population - assigned_population,
                }
                
                shelter_assignments[assigned_shelter_id].append(zone_id)
                
                for i in range(len(route['path']) - 1):
                    u, v = route['path'][i], route['path'][i+1]
                    if self.graph.has_edge(u, v):
                        self.graph[u][v]['current_load'] += assigned_population
        
        total_population = sum(z['population'] for z in self.population_zones.values())
        assigned_population = sum(
            plan['population'] for plan in evacuation_plan.values()
        )
        
        logger.info(
            f"Evacuation plan complete: {assigned_population:,.0f}/{total_population:,.0f} "
            f"assigned ({100*assigned_population/total_population:.1f}%)"
        )
        
        return {
            'evacuation_plan': evacuation_plan,
            'shelter_assignments': shelter_assignments,
            'unassigned_zones': unassigned_zones,
            'total_population': total_population,
            'assigned_population': assigned_population,
            'assignment_rate': assigned_population / total_population if total_population > 0 else 0,
        }

    def identify_bottlenecks(self) -> List[Dict]:
        bottlenecks = []
        
        for u, v, data in self.graph.edges(data=True):
            capacity = data['capacity']
            load = data['current_load']
            utilization = load / capacity if capacity > 0 else 0
            
            if utilization > self.config.congestion_factor_threshold:
                bottlenecks.append({
                    'edge': (u, v),
                    'utilization': utilization,
                    'capacity': capacity,
                    'load': load,
                    'road_type': data['road_type'],
                })
        
        bottlenecks.sort(key=lambda x: x['utilization'], reverse=True)
        
        logger.info(f"Identified {len(bottlenecks)} bottleneck segments")
        return bottlenecks

    def calculate_clearance_time(self, evacuation_plan: Dict) -> Dict:
        zone_clearance_times = {}
        
        for zone_id, plan in evacuation_plan['evacuation_plan'].items():
            route = plan['route']
            population = plan['population']
            
            min_capacity = float('inf')
            for i in range(len(route['path']) - 1):
                u, v = route['path'][i], route['path'][i+1]
                if self.graph.has_edge(u, v):
                    capacity = self.graph[u][v]['capacity']
                    min_capacity = min(min_capacity, capacity)
            
            travel_time = route['travel_time_minutes']
            throughput_time = (population / min_capacity) * 60 if min_capacity > 0 else 999
            total_clearance = travel_time + throughput_time
            
            zone_clearance_times[zone_id] = {
                'travel_time_minutes': travel_time,
                'throughput_time_minutes': throughput_time,
                'total_clearance_minutes': total_clearance,
            }
        
        max_clearance = max(
            (t['total_clearance_minutes'] for t in zone_clearance_times.values()),
            default=0
        )
        
        return {
            'zone_clearance_times': zone_clearance_times,
            'total_evacuation_time_minutes': max_clearance,
            'total_evacuation_time_hours': max_clearance / 60,
        }

    def run(
        self,
        road_segments: List[Dict],
        shelters: List[Dict],
        population_zones: List[Dict],
        flood_risk_map: Optional[np.ndarray] = None,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running evacuation route optimization...")
        
        self.build_road_network(road_segments, flood_risk_map)
        self.register_shelters(shelters)
        self.register_population_zones(population_zones)
        
        evacuation_plan = self.optimize_evacuation_plan()
        bottlenecks = self.identify_bottlenecks()
        clearance = self.calculate_clearance_time(evacuation_plan)
        
        result = {
            **evacuation_plan,
            'bottlenecks': bottlenecks[:10],
            'clearance_time': clearance,
            'network_stats': {
                'nodes': self.graph.number_of_nodes(),
                'edges': self.graph.number_of_edges(),
                'shelters': len(self.shelters),
                'population_zones': len(self.population_zones),
            }
        }
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            import json
            with open(output_path / 'evacuation_plan.json', 'w') as f:
                json.dump(result, f, indent=2, default=str)
            logger.info(f"Evacuation plan saved to {output_path}")
        
        logger.info(
            f"Evacuation optimization complete — "
            f"{evacuation_plan['assigned_population']:,.0f} assigned, "
            f"clearance time: {clearance['total_evacuation_time_hours']:.1f}h"
        )
        
        return result


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
        {'id': f'shelter_{i}', 'node': 10 + i*10, 'capacity': np.random.randint(500, 3000),
         'location': (np.random.uniform(0, 100), np.random.uniform(0, 100))}
        for i in range(5)
    ]
    
    population_zones = [
        {'id': f'zone_{i}', 'node': i*5, 'population': np.random.randint(100, 2000),
         'vulnerable_fraction': np.random.uniform(0.15, 0.45),
         'location': (np.random.uniform(0, 100), np.random.uniform(0, 100))}
        for i in range(10)
    ]
    
    optimizer = EvacuationRouteOptimizer()
    result = optimizer.run(
        road_segments=road_segments,
        shelters=shelters,
        population_zones=population_zones,
        output_path=Path('data/processed/evacuation'),
    )
    
    print(f"\nTotal population    : {result['total_population']:,}")
    print(f"Assigned population : {result['assigned_population']:,}")
    print(f"Assignment rate     : {result['assignment_rate']*100:.1f}%")
    print(f"Evacuation time     : {result['clearance_time']['total_evacuation_time_hours']:.1f} hours")
    print(f"Bottlenecks found   : {len(result['bottlenecks'])}")
