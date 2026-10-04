import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
from scipy import stats
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class PopulationImpactConfig:
    displacement_hazard_threshold: float = 0.5
    casualty_rate_low: float = 0.0001
    casualty_rate_medium: float = 0.0005
    casualty_rate_high: float = 0.002
    casualty_rate_critical: float = 0.008
    vulnerable_multiplier: float = 2.5
    uncertainty_samples: int = 1000


class PopulationImpactEstimator:

    def __init__(self, config: Optional[PopulationImpactConfig] = None):
        self.config = config or PopulationImpactConfig()
        logger.info("Initialized PopulationImpactEstimator")

    def estimate_affected(
        self,
        population_density: np.ndarray,
        hazard_mask: np.ndarray,
        pixel_area_km2: float = 1.0
    ) -> Dict:
        exposed = population_density * (hazard_mask > 0).astype(float)
        total_pop = float(population_density.sum() * pixel_area_km2)
        affected_pop = float(exposed.sum() * pixel_area_km2)

        return {
            'total_population': total_pop,
            'affected_population': affected_pop,
            'affected_fraction': affected_pop / (total_pop + 1e-8),
            'affected_map': exposed,
        }

    def estimate_displaced(
        self,
        population_density: np.ndarray,
        risk_score: np.ndarray,
        flood_depth: Optional[np.ndarray] = None,
    ) -> Dict:
        cfg = self.config
        displacement_prob = np.zeros_like(risk_score)
        displacement_prob[risk_score >= 0.25] = 0.10
        displacement_prob[risk_score >= 0.50] = 0.35
        displacement_prob[risk_score >= 0.75] = 0.65
        displacement_prob[risk_score >= 0.90] = 0.90

        if flood_depth is not None:
            if flood_depth.shape != displacement_prob.shape:
                from scipy.ndimage import zoom
                f = (displacement_prob.shape[0] / flood_depth.shape[0],
                     displacement_prob.shape[1] / flood_depth.shape[1])
                flood_depth = zoom(flood_depth, f, order=1)
            depth_factor = np.clip(flood_depth / 2.0, 0, 1)
            displacement_prob = np.clip(displacement_prob + 0.2 * depth_factor, 0, 1)

        displaced_map = population_density * displacement_prob
        total_displaced = float(displaced_map.sum())
        immediate_shelter_need = total_displaced * 0.7
        medium_term_displaced = total_displaced * 0.3

        return {
            'total_displaced': total_displaced,
            'immediate_shelter_need': immediate_shelter_need,
            'medium_term_displaced': medium_term_displaced,
            'displacement_probability_map': displacement_prob,
            'displaced_map': displaced_map,
        }

    def estimate_casualties(
        self,
        population_density: np.ndarray,
        risk_classified: np.ndarray,
        vulnerable_fraction: Optional[np.ndarray] = None,
    ) -> Dict:
        cfg = self.config
        rate_map = np.zeros_like(risk_classified, dtype=float)
        rate_map[risk_classified == 1] = cfg.casualty_rate_low
        rate_map[risk_classified == 2] = cfg.casualty_rate_medium
        rate_map[risk_classified == 3] = cfg.casualty_rate_high
        rate_map[risk_classified == 4] = cfg.casualty_rate_critical

        if vulnerable_fraction is not None:
            if vulnerable_fraction.shape != rate_map.shape:
                from scipy.ndimage import zoom
                f = (rate_map.shape[0] / vulnerable_fraction.shape[0],
                     rate_map.shape[1] / vulnerable_fraction.shape[1])
                vulnerable_fraction = zoom(vulnerable_fraction, f, order=1)
            vuln_multiplier = 1.0 + (cfg.vulnerable_multiplier - 1.0) * vulnerable_fraction
            rate_map = rate_map * vuln_multiplier

        expected_casualties = float((population_density * rate_map).sum())

        ci_low = expected_casualties * 0.5
        ci_high = expected_casualties * 2.0

        return {
            'expected_casualties': expected_casualties,
            'casualty_rate_map': rate_map,
            'casualties_map': population_density * rate_map,
            'confidence_interval_90': (ci_low, ci_high),
            'injuries_estimated': expected_casualties * 3.5,
        }

    def estimate_vulnerable_populations(
        self,
        population_density: np.ndarray,
        children_fraction: np.ndarray,
        elderly_fraction: np.ndarray,
        hazard_mask: np.ndarray,
    ) -> Dict:
        exposed = hazard_mask > 0

        children_exposed = float((population_density * children_fraction * exposed).sum())
        elderly_exposed = float((population_density * elderly_fraction * exposed).sum())
        total_exposed = float((population_density * exposed).sum())

        return {
            'total_exposed': total_exposed,
            'children_exposed': children_exposed,
            'elderly_exposed': elderly_exposed,
            'other_exposed': total_exposed - children_exposed - elderly_exposed,
            'vulnerable_fraction': (children_exposed + elderly_exposed) / (total_exposed + 1e-8),
        }

    def run(
        self,
        population_density: np.ndarray,
        hazard_mask: np.ndarray,
        risk_score: np.ndarray,
        risk_classified: np.ndarray,
        vulnerable_fraction: Optional[np.ndarray] = None,
        flood_depth: Optional[np.ndarray] = None,
        pixel_area_km2: float = 1.0,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running population impact estimation...")

        affected = self.estimate_affected(population_density, hazard_mask, pixel_area_km2)
        displaced = self.estimate_displaced(population_density, risk_score, flood_depth)
        casualties = self.estimate_casualties(population_density, risk_classified, vulnerable_fraction)

        result = {
            'affected': {k: v for k, v in affected.items() if not isinstance(v, np.ndarray)},
            'displaced': {k: v for k, v in displaced.items() if not isinstance(v, np.ndarray)},
            'casualties': {k: (list(v) if isinstance(v, tuple) else v)
                          for k, v in casualties.items() if not isinstance(v, np.ndarray)},
            'rasters': {
                'affected_map': affected['affected_map'],
                'displaced_map': displaced['displaced_map'],
                'displacement_probability': displaced['displacement_probability_map'],
                'casualties_map': casualties['casualties_map'],
            },
        }

        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            for name, arr in result['rasters'].items():
                np.save(output_path / f'{name}.npy', arr)
            import json
            report = {k: v for k, v in result.items() if k != 'rasters'}
            with open(output_path / 'population_impact.json', 'w') as f:
                json.dump(report, f, indent=2, default=str)

        logger.info(
            f"Population impact — affected: {affected['affected_population']:,.0f}, "
            f"displaced: {displaced['total_displaced']:,.0f}, "
            f"casualties: {casualties['expected_casualties']:.1f}"
        )
        return result


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)

    pop = np.random.exponential(500, shape)
    mask = np.zeros(shape); mask[30:70, 30:70] = 1
    risk_score = np.random.beta(2, 5, shape)
    risk_cls = np.digitize(risk_score, [0.25, 0.50, 0.75, 0.90]).astype(np.int8)
    vuln = np.random.uniform(0.25, 0.55, shape)

    estimator = PopulationImpactEstimator()
    result = estimator.run(pop, mask, risk_score, risk_cls, vuln)

    print(f"Affected    : {result['affected']['affected_population']:,.0f}")
    print(f"Displaced   : {result['displaced']['total_displaced']:,.0f}")
    print(f"Casualties  : {result['casualties']['expected_casualties']:.1f}")
    print(f"Injuries est: {result['casualties']['injuries_estimated']:.1f}")
