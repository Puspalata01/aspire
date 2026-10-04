import numpy as np
from typing import Dict, Optional
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.flood.population_impact_estimator import PopulationImpactEstimator, PopulationImpactConfig
from models.flood.infrastructure_damage_predictor import InfrastructureDamagePredictor, InfrastructureDamageConfig
from models.flood.economic_loss_model import EconomicLossModel, EconomicLossConfig
from utils.logger import get_logger

logger = get_logger(__name__)


class ImpactPredictionEngine:

    def __init__(
        self,
        population_config: Optional[PopulationImpactConfig] = None,
        infrastructure_config: Optional[InfrastructureDamageConfig] = None,
        economic_config: Optional[EconomicLossConfig] = None,
    ):
        self.population_estimator = PopulationImpactEstimator(population_config)
        self.infrastructure_predictor = InfrastructureDamagePredictor(infrastructure_config)
        self.economic_model = EconomicLossModel(economic_config)
        logger.info("Initialized ImpactPredictionEngine")

    def predict(
        self,
        hazard_data: Dict[str, np.ndarray],
        risk_data: Dict[str, np.ndarray],
        population_data: Dict[str, np.ndarray],
        infrastructure_data: Dict[str, np.ndarray],
        pixel_area_km2: float = 1.0,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("=" * 60)
        logger.info("Starting Impact Prediction")
        logger.info("=" * 60)

        flood_depth = hazard_data.get('flood_depth', hazard_data.get('hazard_intensity'))
        hazard_mask = hazard_data.get('flood_mask', hazard_data.get('hazard_mask'))
        risk_score = risk_data.get('risk_score')
        risk_classified = risk_data.get('risk_classified')

        logger.info("\n[1/3] Estimating population impact...")
        pop_impact = self.population_estimator.run(
            population_density=population_data.get('population_density'),
            hazard_mask=hazard_mask,
            risk_score=risk_score,
            risk_classified=risk_classified,
            vulnerable_fraction=population_data.get('poverty_index'),
            flood_depth=flood_depth,
            pixel_area_km2=pixel_area_km2,
        )

        logger.info("\n[2/3] Predicting infrastructure damage...")
        infra_damage = self.infrastructure_predictor.run(
            flood_depth=flood_depth,
            building_type=infrastructure_data.get('building_type'),
            building_age=infrastructure_data.get('building_age'),
            road_network=infrastructure_data.get('road_network'),
            bridge_locations=infrastructure_data.get('bridge_locations'),
        )

        logger.info("\n[3/3] Modeling economic losses...")
        
        building_damage_map = infra_damage['rasters'].get('building_damage')
        if building_damage_map is None:
            building_damage_map = np.zeros_like(flood_depth)
        
        road_damage_map = infra_damage['rasters'].get('road_damage')
        bridge_damage_map = infra_damage['rasters'].get('bridge_damage')
        
        crop_area = infrastructure_data.get('crop_area')
        crop_damage_map = None
        crop_type = None
        if crop_area is not None:
            crop_damage_map = crop_area * (hazard_mask > 0).astype(float)
            crop_type = np.random.choice([0, 1, 2], crop_area.shape)

        economic_loss = self.economic_model.run(
            building_damage_map=building_damage_map,
            building_type=infrastructure_data.get('building_type'),
            road_damage_map=road_damage_map,
            road_network=infrastructure_data.get('road_network'),
            bridge_damage_map=bridge_damage_map,
            bridge_locations=infrastructure_data.get('bridge_locations'),
            crop_damage_map=crop_damage_map,
            crop_type=crop_type,
            affected_population=pop_impact['affected']['affected_population'],
            pixel_area_km2=pixel_area_km2,
        )

        combined = {
            'population': {k: v for k, v in pop_impact.items() if k != 'rasters'},
            'infrastructure': {k: v for k, v in infra_damage.items() if k != 'rasters'},
            'economic': {k: v for k, v in economic_loss.items() if k != 'rasters'},
            'rasters': {
                **pop_impact['rasters'],
                **infra_damage['rasters'],
                **economic_loss['rasters'],
            }
        }

        if output_path:
            self._save(combined, Path(output_path))

        logger.info("\n" + "=" * 60)
        logger.info("Impact Prediction Completed")
        logger.info(f"  Affected pop     : {pop_impact['affected']['affected_population']:,.0f}")
        logger.info(f"  Displaced        : {pop_impact['displaced']['total_displaced']:,.0f}")
        logger.info(f"  Expected casualties: {pop_impact['casualties']['expected_casualties']:.1f}")
        if 'buildings' in infra_damage:
            logger.info(f"  Buildings damaged: {infra_damage['buildings']['damaged_buildings']:,}")
        logger.info(f"  Economic loss    : {economic_loss['summary']['total_economic_loss']:,.0f} {economic_loss['summary']['currency']}")
        logger.info("=" * 60)

        return combined

    def _save(self, combined: Dict, output_path: Path):
        output_path.mkdir(parents=True, exist_ok=True)

        rasters = combined.pop('rasters', {})
        for name, arr in rasters.items():
            np.save(output_path / f'{name}.npy', arr)

        import json
        with open(output_path / 'impact_prediction_report.json', 'w') as f:
            json.dump(combined, f, indent=2, default=str)

        combined['rasters'] = rasters
        logger.info(f"Impact prediction saved to {output_path}")


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)

    hazard_data = {
        'flood_depth': np.random.uniform(0, 3, shape),
        'hazard_mask': np.zeros(shape),
    }
    hazard_data['hazard_mask'][30:70, 30:70] = 1

    risk_data = {
        'risk_score': np.random.beta(2, 5, shape),
        'risk_classified': np.digitize(np.random.beta(2, 5, shape), [0.25, 0.50, 0.75, 0.90]).astype(np.int8),
    }

    population_data = {
        'population_density': np.random.exponential(500, shape),
        'poverty_index': np.random.uniform(0.2, 0.6, shape),
    }

    infrastructure_data = {
        'building_type': np.random.choice([0, 1, 2, 3], shape, p=[0.3, 0.4, 0.2, 0.1]),
        'building_age': np.random.uniform(0, 1, shape),
        'road_network': np.random.choice([0, 1, 2, 3], shape, p=[0.90, 0.06, 0.03, 0.01]),
        'bridge_locations': np.random.choice([0, 1], shape, p=[0.995, 0.005]),
        'crop_area': np.random.uniform(0, 1, shape),
    }

    engine = ImpactPredictionEngine()
    result = engine.predict(
        hazard_data=hazard_data,
        risk_data=risk_data,
        population_data=population_data,
        infrastructure_data=infrastructure_data,
        output_path=Path('data/processed/impact_prediction'),
    )

    print(f"\nAffected population  : {result['population']['affected']['affected_population']:,.0f}")
    print(f"Displaced            : {result['population']['displaced']['total_displaced']:,.0f}")
    print(f"Expected casualties  : {result['population']['casualties']['expected_casualties']:.1f}")
    print(f"Buildings damaged    : {result['infrastructure']['buildings']['damaged_buildings']:,}")
    print(f"Total economic loss  : {result['economic']['summary']['total_economic_loss']:,.0f} {result['economic']['summary']['currency']}")
