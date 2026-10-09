import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class AssetClass:
    name: str
    unit_value: float
    fragility_threshold: float
    damage_ratio_at_threshold: float


ASSET_CLASSES = {
    'residential_building': AssetClass('Residential Building', 500_000, 1.5, 0.3),
    'commercial_building': AssetClass('Commercial Building', 2_000_000, 1.0, 0.4),
    'critical_facility': AssetClass('Critical Facility', 5_000_000, 0.5, 0.6),
    'road_segment': AssetClass('Road Segment', 200_000, 2.0, 0.2),
    'crop_field': AssetClass('Crop Field', 50_000, 0.3, 0.5),
}


class ExposureModel:

    def __init__(self, bbox: Tuple[float, float, float, float]):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = bbox
        logger.info("Initialized ExposureModel")

    def compute_population_exposure(
        self,
        population_density: np.ndarray,
        hazard_mask: np.ndarray,
        pixel_area_km2: float = 1.0
    ) -> Dict:
        hazard_binary = (hazard_mask > 0).astype(float)

        exposed_density = population_density * hazard_binary
        total_pop = float(population_density.sum() * pixel_area_km2)
        exposed_pop = float(exposed_density.sum() * pixel_area_km2)

        result = {
            'total_population': total_pop,
            'exposed_population': exposed_pop,
            'exposure_fraction': exposed_pop / (total_pop + 1e-8),
            'exposure_map': exposed_density,
        }

        logger.info(
            f"Population exposure — exposed: {exposed_pop:,.0f} / {total_pop:,.0f} "
            f"({result['exposure_fraction']*100:.1f}%)"
        )
        return result

    def compute_asset_exposure(
        self,
        asset_maps: Dict[str, np.ndarray],
        hazard_mask: np.ndarray,
        hazard_intensity: Optional[np.ndarray] = None,
        pixel_area_km2: float = 1.0
    ) -> Dict:
        hazard_binary = (hazard_mask > 0).astype(float)
        results = {}

        for asset_name, asset_count in asset_maps.items():
            asset_cls = ASSET_CLASSES.get(asset_name)
            unit_value = asset_cls.unit_value if asset_cls else 100_000

            exposed_count = float((asset_count * hazard_binary).sum())
            total_count = float(asset_count.sum())

            exposed_value = exposed_count * unit_value
            total_value = total_count * unit_value

            damage_ratio = 0.0
            if hazard_intensity is not None and asset_cls is not None:
                mean_intensity = float(hazard_intensity[hazard_binary > 0].mean()) if hazard_binary.any() else 0.0
                if mean_intensity >= asset_cls.fragility_threshold:
                    damage_ratio = asset_cls.damage_ratio_at_threshold * min(
                        mean_intensity / asset_cls.fragility_threshold, 2.0
                    )

            results[asset_name] = {
                'total_count': total_count,
                'exposed_count': exposed_count,
                'exposure_fraction': exposed_count / (total_count + 1e-8),
                'total_value_usd': total_value,
                'exposed_value_usd': exposed_value,
                'estimated_damage_ratio': damage_ratio,
                'estimated_loss_usd': exposed_value * damage_ratio,
            }

        total_exposed_value = sum(r['exposed_value_usd'] for r in results.values())
        total_estimated_loss = sum(r['estimated_loss_usd'] for r in results.values())
        results['_totals'] = {
            'total_exposed_value_usd': total_exposed_value,
            'total_estimated_loss_usd': total_estimated_loss,
        }

        logger.info(
            f"Asset exposure — total exposed: ${total_exposed_value:,.0f}, "
            f"estimated loss: ${total_estimated_loss:,.0f}"
        )
        return results

    def compute_agricultural_exposure(
        self,
        crop_area_map: np.ndarray,
        hazard_mask: np.ndarray,
        season: str = 'kharif',
        pixel_area_ha: float = 100.0
    ) -> Dict:
        season_yield = {'kharif': 2.5, 'rabi': 2.8, 'zaid': 1.8}
        price_per_ton = {'kharif': 15000, 'rabi': 18000, 'zaid': 20000}

        y = season_yield.get(season, 2.5)
        p = price_per_ton.get(season, 15000)

        hazard_binary = (hazard_mask > 0).astype(float)
        exposed_area = crop_area_map * hazard_binary

        total_area_ha = float(crop_area_map.sum() * pixel_area_ha)
        exposed_area_ha = float(exposed_area.sum() * pixel_area_ha)

        yield_loss_tons = exposed_area_ha * y
        value_loss = yield_loss_tons * p

        result = {
            'total_crop_area_ha': total_area_ha,
            'exposed_area_ha': exposed_area_ha,
            'exposure_fraction': exposed_area_ha / (total_area_ha + 1e-8),
            'season': season,
            'estimated_yield_loss_tons': yield_loss_tons,
            'estimated_value_loss_inr': value_loss,
            'exposure_map': exposed_area,
        }

        logger.info(
            f"Agricultural exposure — exposed: {exposed_area_ha:,.0f} ha, "
            f"loss: ₹{value_loss:,.0f}"
        )
        return result

    def compute_infrastructure_exposure(
        self,
        road_network: np.ndarray,
        hazard_mask: np.ndarray,
        pixel_length_km: float = 1.0
    ) -> Dict:
        hazard_binary = (hazard_mask > 0).astype(float)

        total_road_km = float((road_network > 0).sum() * pixel_length_km)
        exposed_road_km = float(((road_network > 0) & (hazard_binary > 0)).sum() * pixel_length_km)

        highway_km = float(((road_network == 3) & (hazard_binary > 0)).sum() * pixel_length_km)
        major_road_km = float(((road_network == 2) & (hazard_binary > 0)).sum() * pixel_length_km)
        minor_road_km = float(((road_network == 1) & (hazard_binary > 0)).sum() * pixel_length_km)

        repair_cost_per_km = {3: 5_000_000, 2: 2_000_000, 1: 500_000}
        total_repair_cost = (
            highway_km * repair_cost_per_km[3] +
            major_road_km * repair_cost_per_km[2] +
            minor_road_km * repair_cost_per_km[1]
        )

        result = {
            'total_road_km': total_road_km,
            'exposed_road_km': exposed_road_km,
            'exposure_fraction': exposed_road_km / (total_road_km + 1e-8),
            'breakdown': {
                'highway_km': highway_km,
                'major_road_km': major_road_km,
                'minor_road_km': minor_road_km,
            },
            'estimated_repair_cost_inr': total_repair_cost,
        }

        logger.info(
            f"Road exposure — {exposed_road_km:.1f} km / {total_road_km:.1f} km "
            f"({result['exposure_fraction']*100:.1f}%)"
        )
        return result

    def spatial_intersection(
        self,
        hazard_map: np.ndarray,
        element_map: np.ndarray,
        intensity_threshold: float = 0.0
    ) -> np.ndarray:
        hazard_binary = (hazard_map > intensity_threshold).astype(float)
        return element_map * hazard_binary

    def aggregate_by_admin_unit(
        self,
        exposure_map: np.ndarray,
        admin_unit_map: np.ndarray,
        unit_ids: Optional[List[int]] = None
    ) -> Dict[int, float]:
        if unit_ids is None:
            unit_ids = list(np.unique(admin_unit_map[admin_unit_map > 0]))

        aggregated = {}
        for uid in unit_ids:
            mask = (admin_unit_map == uid)
            aggregated[int(uid)] = float(exposure_map[mask].sum())

        return aggregated


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)
    bbox = (17.78, 22.57, 81.37, 87.53)

    model = ExposureModel(bbox)

    population = np.random.exponential(500, shape)
    hazard_mask = np.zeros(shape)
    hazard_mask[30:70, 30:70] = 1
    hazard_intensity = np.random.uniform(0, 3, shape) * hazard_mask

    pop_exp = model.compute_population_exposure(population, hazard_mask)
    print(f"Exposed population: {pop_exp['exposed_population']:,.0f}")
    print(f"Exposure fraction:  {pop_exp['exposure_fraction']*100:.1f}%")

    road_network = np.random.choice([0, 1, 2, 3], shape, p=[0.85, 0.08, 0.05, 0.02])
    road_exp = model.compute_infrastructure_exposure(road_network, hazard_mask)
    print(f"\nExposed roads: {road_exp['exposed_road_km']:.1f} km")
    print(f"Repair cost:   ₹{road_exp['estimated_repair_cost_inr']:,.0f}")
