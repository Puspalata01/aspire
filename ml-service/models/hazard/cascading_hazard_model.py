import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import networkx as nx
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class CascadingHazardConfig:
    hazard_types: List[str] = None
    dependency_thresholds: Dict[str, float] = None
    time_delay_hours: Dict[Tuple[str, str], float] = None
    amplification_factors: Dict[Tuple[str, str], float] = None
    max_cascade_depth: int = 5

    def __post_init__(self):
        if self.hazard_types is None:
            self.hazard_types = ['flood', 'cyclone', 'storm_surge', 'landslide', 'infrastructure_failure']
        
        if self.dependency_thresholds is None:
            self.dependency_thresholds = {
                'flood': 0.5,
                'cyclone': 0.6,
                'storm_surge': 0.5,
                'landslide': 0.4,
                'infrastructure_failure': 0.3,
            }
        
        if self.time_delay_hours is None:
            self.time_delay_hours = {
                ('cyclone', 'storm_surge'): 6.0,
                ('cyclone', 'flood'): 12.0,
                ('flood', 'landslide'): 24.0,
                ('storm_surge', 'flood'): 6.0,
                ('flood', 'infrastructure_failure'): 12.0,
                ('cyclone', 'infrastructure_failure'): 18.0,
            }
        
        if self.amplification_factors is None:
            self.amplification_factors = {
                ('cyclone', 'storm_surge'): 1.5,
                ('cyclone', 'flood'): 1.3,
                ('flood', 'landslide'): 1.2,
                ('storm_surge', 'flood'): 1.4,
                ('flood', 'infrastructure_failure'): 1.1,
                ('cyclone', 'infrastructure_failure'): 1.2,
            }


class CascadingHazardModel:

    def __init__(self, config: Optional[CascadingHazardConfig] = None):
        self.config = config or CascadingHazardConfig()
        self.dependency_graph = nx.DiGraph()
        self._build_dependency_graph()
        logger.info("Initialized CascadingHazardModel")

    def _build_dependency_graph(self):
        for (source, target), delay in self.config.time_delay_hours.items():
            amplification = self.config.amplification_factors.get((source, target), 1.0)
            self.dependency_graph.add_edge(
                source, target,
                delay_hours=delay,
                amplification=amplification
            )
        
        logger.info(f"Built dependency graph with {self.dependency_graph.number_of_edges()} dependencies")

    def calculate_trigger_probability(
        self,
        primary_intensity: float,
        hazard_type: str,
    ) -> float:
        threshold = self.config.dependency_thresholds.get(hazard_type, 0.5)
        
        if primary_intensity < threshold:
            return 0.0
        
        excess = primary_intensity - threshold
        prob = 1.0 - np.exp(-3 * excess)
        
        return min(prob, 1.0)

    def propagate_cascade(
        self,
        initial_hazards: Dict[str, float],
        time_horizon_hours: float = 72.0,
    ) -> Dict:
        logger.info(f"Propagating cascade from {len(initial_hazards)} initial hazards...")
        
        cascade_timeline = []
        active_hazards = {}
        triggered_hazards = set()
        
        for hazard, intensity in initial_hazards.items():
            cascade_timeline.append({
                'time_hours': 0.0,
                'hazard': hazard,
                'intensity': intensity,
                'source': 'initial',
                'probability': 1.0,
            })
            active_hazards[hazard] = intensity
            triggered_hazards.add(hazard)
        
        current_time = 0.0
        cascade_depth = 0
        
        while current_time < time_horizon_hours and cascade_depth < self.config.max_cascade_depth:
            new_hazards = {}
            
            for source_hazard, source_intensity in active_hazards.items():
                if source_hazard not in self.dependency_graph:
                    continue
                
                for target_hazard in self.dependency_graph.successors(source_hazard):
                    if target_hazard in triggered_hazards:
                        continue
                    
                    edge_data = self.dependency_graph[source_hazard][target_hazard]
                    delay = edge_data['delay_hours']
                    amplification = edge_data['amplification']
                    
                    trigger_time = current_time + delay
                    if trigger_time > time_horizon_hours:
                        continue
                    
                    trigger_prob = self.calculate_trigger_probability(source_intensity, source_hazard)
                    
                    if trigger_prob > 0.1:
                        triggered_intensity = source_intensity * amplification * trigger_prob
                        triggered_intensity = min(triggered_intensity, 1.0)
                        
                        cascade_timeline.append({
                            'time_hours': trigger_time,
                            'hazard': target_hazard,
                            'intensity': triggered_intensity,
                            'source': source_hazard,
                            'probability': trigger_prob,
                        })
                        
                        new_hazards[target_hazard] = triggered_intensity
                        triggered_hazards.add(target_hazard)
            
            if not new_hazards:
                break
            
            active_hazards = new_hazards
            current_time += min(
                self.config.time_delay_hours.values(),
                default=12.0
            )
            cascade_depth += 1
        
        cascade_timeline.sort(key=lambda x: x['time_hours'])
        
        logger.info(f"Cascade complete: {len(cascade_timeline)} events over {cascade_depth} stages")
        
        return {
            'cascade_timeline': cascade_timeline,
            'triggered_hazards': list(triggered_hazards),
            'cascade_depth': cascade_depth,
            'total_events': len(cascade_timeline),
        }

    def calculate_compound_risk(
        self,
        active_hazards: Dict[str, float],
    ) -> Dict:
        if not active_hazards:
            return {
                'compound_risk_score': 0.0,
                'risk_class': 'negligible',
            }
        
        individual_risks = list(active_hazards.values())
        
        compound_risk = 1.0 - np.prod([1.0 - r for r in individual_risks])
        
        synergy_factor = 1.0
        if len(active_hazards) > 1:
            synergy_factor = 1.0 + 0.2 * (len(active_hazards) - 1)
        
        compound_risk = min(compound_risk * synergy_factor, 1.0)
        
        if compound_risk >= 0.9:
            risk_class = 'critical'
        elif compound_risk >= 0.75:
            risk_class = 'high'
        elif compound_risk >= 0.5:
            risk_class = 'medium'
        elif compound_risk >= 0.25:
            risk_class = 'low'
        else:
            risk_class = 'negligible'
        
        return {
            'compound_risk_score': compound_risk,
            'risk_class': risk_class,
            'num_concurrent_hazards': len(active_hazards),
            'synergy_factor': synergy_factor,
            'individual_risks': active_hazards,
        }

    def identify_critical_paths(self) -> List[Dict]:
        critical_paths = []
        
        for source in self.dependency_graph.nodes():
            for target in self.dependency_graph.nodes():
                if source == target:
                    continue
                
                if nx.has_path(self.dependency_graph, source, target):
                    paths = list(nx.all_simple_paths(
                        self.dependency_graph, source, target,
                        cutoff=self.config.max_cascade_depth
                    ))
                    
                    for path in paths:
                        total_delay = sum(
                            self.dependency_graph[path[i]][path[i+1]]['delay_hours']
                            for i in range(len(path) - 1)
                        )
                        
                        total_amplification = np.prod([
                            self.dependency_graph[path[i]][path[i+1]]['amplification']
                            for i in range(len(path) - 1)
                        ])
                        
                        critical_paths.append({
                            'path': path,
                            'length': len(path),
                            'total_delay_hours': total_delay,
                            'total_amplification': total_amplification,
                            'criticality': total_amplification / (total_delay + 1),
                        })
        
        critical_paths.sort(key=lambda x: x['criticality'], reverse=True)
        
        return critical_paths[:10]

    def run(
        self,
        initial_hazards: Dict[str, float],
        time_horizon_hours: float = 72.0,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running cascading hazard analysis...")
        
        cascade = self.propagate_cascade(initial_hazards, time_horizon_hours)
        
        hazards_by_time = {}
        for event in cascade['cascade_timeline']:
            time_bucket = int(event['time_hours'] / 6) * 6
            if time_bucket not in hazards_by_time:
                hazards_by_time[time_bucket] = {}
            hazards_by_time[time_bucket][event['hazard']] = event['intensity']
        
        compound_risk_timeline = []
        for time_hours in sorted(hazards_by_time.keys()):
            risk = self.calculate_compound_risk(hazards_by_time[time_hours])
            risk['time_hours'] = time_hours
            compound_risk_timeline.append(risk)
        
        critical_paths = self.identify_critical_paths()
        
        max_compound_risk = max(
            (r['compound_risk_score'] for r in compound_risk_timeline),
            default=0.0
        )
        
        result = {
            'cascade': cascade,
            'compound_risk_timeline': compound_risk_timeline,
            'critical_paths': critical_paths,
            'max_compound_risk': max_compound_risk,
            'time_horizon_hours': time_horizon_hours,
        }
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            import json
            with open(output_path / 'cascading_hazard_analysis.json', 'w') as f:
                json.dump(result, f, indent=2, default=str)
            logger.info(f"Cascading hazard analysis saved to {output_path}")
        
        logger.info(
            f"Cascading hazard analysis complete — "
            f"triggered: {len(cascade['triggered_hazards'])} hazards, "
            f"depth: {cascade['cascade_depth']}, "
            f"max risk: {max_compound_risk:.3f}"
        )
        
        return result


if __name__ == "__main__":
    np.random.seed(42)
    
    initial_hazards = {
        'cyclone': 0.85,
        'flood': 0.60,
    }
    
    model = CascadingHazardModel()
    result = model.run(
        initial_hazards=initial_hazards,
        time_horizon_hours=72.0,
        output_path=Path('data/processed/cascading_hazard'),
    )
    
    print(f"\nInitial hazards     : {list(initial_hazards.keys())}")
    print(f"Triggered hazards   : {result['cascade']['triggered_hazards']}")
    print(f"Total events        : {result['cascade']['total_events']}")
    print(f"Cascade depth       : {result['cascade']['cascade_depth']}")
    print(f"Max compound risk   : {result['max_compound_risk']:.3f}")
    
    print(f"\nCascade timeline:")
    for event in result['cascade']['cascade_timeline'][:10]:
        print(f"  t={event['time_hours']:5.1f}h: {event['hazard']:25s} "
              f"(intensity: {event['intensity']:.3f}, from: {event['source']})")
    
    print(f"\nTop 3 critical paths:")
    for i, path in enumerate(result['critical_paths'][:3], 1):
        print(f"  {i}. {' → '.join(path['path'])} (criticality: {path['criticality']:.3f})")
