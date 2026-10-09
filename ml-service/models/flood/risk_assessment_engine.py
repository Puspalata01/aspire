import numpy as np
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.flood.vulnerability_scorer import VulnerabilityScorer, VulnerabilityWeights
from models.flood.exposure_model import ExposureModel
from models.flood.risk_classifier import RiskClassifier, RiskEngine, RiskThresholds, RiskLevel, RISK_LABELS
from utils.logger import get_logger
from utils.config_loader import config

logger = get_logger(__name__)


class RiskAssessmentEngine:

    def __init__(
        self,
        bbox: Optional[Tuple[float, float, float, float]] = None,
        vulnerability_weights: Optional[VulnerabilityWeights] = None,
        risk_thresholds: Optional[RiskThresholds] = None,
    ):
        self.bbox = bbox or (
            config.get('geography.bbox.min_lat'),
            config.get('geography.bbox.max_lat'),
            config.get('geography.bbox.min_lon'),
            config.get('geography.bbox.max_lon'),
        )

        cfg_thresholds = config.get('risk.thresholds', {})
        if risk_thresholds is None:
            risk_thresholds = RiskThresholds(
                low=cfg_thresholds.get('low', 0.25),
                medium=cfg_thresholds.get('medium', 0.50),
                high=cfg_thresholds.get('high', 0.75),
                critical=cfg_thresholds.get('critical', 0.90),
            )

        self.vulnerability_scorer = VulnerabilityScorer(vulnerability_weights)
        self.exposure_model = ExposureModel(self.bbox)
        self.risk_engine = RiskEngine(risk_thresholds, self.bbox)

        logger.info("Initialized RiskAssessmentEngine")

    def assess(
        self,
        hazard_data: Dict[str, np.ndarray],
        population_data: Dict[str, np.ndarray],
        infrastructure_data: Dict[str, np.ndarray],
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("=" * 60)
        logger.info("Starting Risk Assessment")
        logger.info("=" * 60)

        logger.info("\n[1/4] Scoring vulnerability...")
        vuln_scores = self.vulnerability_scorer.compute(
            {**population_data, **infrastructure_data}
        )
        vulnerability_map = vuln_scores['composite_vulnerability']
        vuln_report = self.vulnerability_scorer.generate_report(vuln_scores)

        logger.info("\n[2/4] Computing exposure...")
        hazard_mask = hazard_data.get('flood_mask', hazard_data.get('hazard_mask'))
        hazard_intensity = hazard_data.get('hazard_intensity')

        population_density = population_data.get('population_density')

        pop_exposure = {}
        if population_density is not None and hazard_mask is not None:
            pop_exposure = self.exposure_model.compute_population_exposure(
                population_density, hazard_mask
            )

        road_network = infrastructure_data.get('road_network')
        road_exposure = {}
        if road_network is not None and hazard_mask is not None:
            road_exposure = self.exposure_model.compute_infrastructure_exposure(
                road_network, hazard_mask
            )

        crop_area = infrastructure_data.get('crop_area')
        agri_exposure = {}
        if crop_area is not None and hazard_mask is not None:
            agri_exposure = self.exposure_model.compute_agricultural_exposure(
                crop_area, hazard_mask
            )

        if population_density is not None and hazard_mask is not None:
            exposure_map = pop_exposure.get('exposure_map', np.zeros_like(vulnerability_map))
        else:
            exposure_map = np.zeros_like(vulnerability_map)

        reference_map = hazard_data.get(
            'hazard_intensity',
            hazard_data.get('flood_mask', np.zeros_like(vulnerability_map))
        )
        if reference_map.shape != vulnerability_map.shape:
            from scipy.ndimage import zoom
            factors = (
                vulnerability_map.shape[0] / reference_map.shape[0],
                vulnerability_map.shape[1] / reference_map.shape[1],
            )
            reference_map = zoom(reference_map, factors, order=1)

        if exposure_map.shape != vulnerability_map.shape:
            from scipy.ndimage import zoom as zoom2
            factors = (
                vulnerability_map.shape[0] / exposure_map.shape[0],
                vulnerability_map.shape[1] / exposure_map.shape[1],
            )
            exposure_map = zoom2(exposure_map, factors, order=1)

        logger.info("\n[3/4] Classifying risk...")
        risk_result = self.risk_engine.run(
            hazard_map=reference_map,
            vulnerability_map=vulnerability_map,
            exposure_map=exposure_map,
        )

        logger.info("\n[4/4] Building combined report...")
        combined = {
            'risk': risk_result,
            'vulnerability': vuln_report,
            'exposure': {
                'population': {k: v for k, v in pop_exposure.items() if not isinstance(v, np.ndarray)},
                'infrastructure': {k: v for k, v in road_exposure.items() if not isinstance(v, np.ndarray)},
                'agriculture': {k: v for k, v in agri_exposure.items() if not isinstance(v, np.ndarray)},
            },
            'alert_zones': risk_result.get('alert_zones', []),
            'rasters': {
                'vulnerability_map': vulnerability_map,
                'exposure_map': exposure_map,
                'risk_score': risk_result['risk_score'],
                'risk_classified': risk_result['risk_classified'],
            },
        }

        if output_path:
            self._save(combined, Path(output_path))

        logger.info("\n" + "=" * 60)
        logger.info("Risk Assessment Completed")
        logger.info(f"  Mean risk  : {risk_result['summary']['overall']['mean_risk']:.3f}")
        logger.info(f"  Max risk   : {risk_result['summary']['overall']['max_risk']:.3f}")
        logger.info(f"  Alert zones: {len(risk_result.get('alert_zones', []))}")
        if pop_exposure:
            logger.info(f"  Exposed pop: {pop_exposure.get('exposed_population', 0):,.0f}")
        logger.info("=" * 60)

        return combined

    def assess_temporal(
        self,
        hazard_series: np.ndarray,
        population_data: Dict[str, np.ndarray],
        infrastructure_data: Dict[str, np.ndarray],
    ) -> Dict:
        logger.info("Running temporal risk assessment...")

        vuln_scores = self.vulnerability_scorer.compute(
            {**population_data, **infrastructure_data}
        )
        vulnerability_map = vuln_scores['composite_vulnerability']

        pop_density = population_data.get('population_density', np.zeros_like(vulnerability_map))
        if pop_density.shape != vulnerability_map.shape:
            from scipy.ndimage import zoom
            f = (vulnerability_map.shape[0] / pop_density.shape[0],
                 vulnerability_map.shape[1] / pop_density.shape[1])
            pop_density = zoom(pop_density, f, order=1)

        result = self.risk_engine.classifier.temporal_risk_evolution(
            hazard_series=hazard_series,
            vulnerability_map=vulnerability_map,
            exposure_map=pop_density / (pop_density.max() + 1e-8),
        )

        logger.info(
            f"Temporal risk — peak day: {result['peak_day']}, "
            f"peak risk: {result['peak_risk']:.3f}, "
            f"high-risk days: {result['high_risk_days']}"
        )
        return result

    def _save(self, combined: Dict, output_path: Path):
        output_path.mkdir(parents=True, exist_ok=True)

        rasters = combined.pop('rasters', {})
        for name, arr in rasters.items():
            np.save(output_path / f'{name}.npy', arr)

        serializable = {}
        for section, content in combined.items():
            if isinstance(content, dict):
                serializable[section] = {
                    k: v for k, v in content.items()
                    if not isinstance(v, np.ndarray)
                }
            elif isinstance(content, list):
                serializable[section] = content
            else:
                serializable[section] = content

        with open(output_path / 'risk_assessment_report.json', 'w') as f:
            json.dump(serializable, f, indent=2, default=str)

        combined['rasters'] = rasters
        logger.info(f"Assessment saved to {output_path}")


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)
    bbox = (17.78, 22.57, 81.37, 87.53)

    hazard_mask = np.zeros(shape)
    hazard_mask[30:70, 30:70] = 1
    hazard_intensity = np.random.uniform(0, 3, shape) * hazard_mask

    population_data = {
        'population_density': np.random.exponential(500, shape),
        'children_fraction': np.random.uniform(0.18, 0.30, shape),
        'elderly_fraction': np.random.uniform(0.08, 0.18, shape),
        'poverty_index': np.random.uniform(0.2, 0.8, shape),
        'distance_to_hospital': np.random.uniform(500, 50000, shape),
        'distance_to_shelter': np.random.uniform(200, 20000, shape),
    }

    infrastructure_data = {
        'road_network': np.random.choice([0, 1, 2, 3], shape, p=[0.85, 0.08, 0.05, 0.02]),
        'building_age': np.random.uniform(0, 1, shape),
        'housing_quality': np.random.uniform(0.3, 0.9, shape),
        'road_density': np.random.uniform(0, 1, shape),
        'crop_area': np.random.uniform(0, 1, shape) * (1 - hazard_mask),
    }

    engine = RiskAssessmentEngine(bbox=bbox)
    result = engine.assess(
        hazard_data={'flood_mask': hazard_mask, 'hazard_intensity': hazard_intensity},
        population_data=population_data,
        infrastructure_data=infrastructure_data,
        output_path=Path('data/processed/risk_assessment'),
    )

    print(f"\nMean risk score : {result['risk']['summary']['overall']['mean_risk']:.3f}")
    print(f"Max risk score  : {result['risk']['summary']['overall']['max_risk']:.3f}")
    print(f"Alert zones     : {len(result['alert_zones'])}")
    print(f"Exposed pop     : {result['exposure']['population'].get('exposed_population', 0):,.0f}")
