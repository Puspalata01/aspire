import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class EconomicLossConfig:
    currency: str = "INR"
    
    building_value_per_sqm: Dict[str, float] = None
    avg_building_area_sqm: Dict[str, float] = None
    
    road_repair_cost_per_km: Dict[str, float] = None
    bridge_repair_cost_per_unit: float = 15000000.0
    
    crop_value_per_hectare: Dict[str, float] = None
    livestock_loss_per_capita: float = 5000.0
    
    business_interruption_daily: float = 2500.0
    household_content_loss_fraction: float = 0.30
    
    gdp_multiplier_direct: float = 1.0
    gdp_multiplier_indirect: float = 0.35
    
    discount_rate: float = 0.05

    def __post_init__(self):
        if self.building_value_per_sqm is None:
            self.building_value_per_sqm = {
                'concrete': 35000,
                'brick': 22000,
                'wood': 15000,
                'informal': 8000,
            }
        if self.avg_building_area_sqm is None:
            self.avg_building_area_sqm = {
                'concrete': 120,
                'brick': 80,
                'wood': 60,
                'informal': 40,
            }
        if self.road_repair_cost_per_km is None:
            self.road_repair_cost_per_km = {
                'highway': 8000000,
                'major': 3500000,
                'minor': 1200000,
            }
        if self.crop_value_per_hectare is None:
            self.crop_value_per_hectare = {
                'kharif': 80000,
                'rabi': 95000,
                'zaid': 60000,
            }


class EconomicLossModel:

    def __init__(self, config: Optional[EconomicLossConfig] = None):
        self.config = config or EconomicLossConfig()
        logger.info(f"Initialized EconomicLossModel (currency: {self.config.currency})")

    def calculate_building_loss(
        self,
        building_damage_map: np.ndarray,
        building_type: np.ndarray,
        pixel_area_km2: float = 1.0,
    ) -> Dict:
        cfg = self.config
        type_mapping = {0: 'concrete', 1: 'brick', 2: 'wood', 3: 'informal'}
        
        loss_map = np.zeros_like(building_damage_map, dtype=float)
        
        for idx, type_name in type_mapping.items():
            mask = (building_type == idx)
            value_per_bld = cfg.building_value_per_sqm[type_name] * cfg.avg_building_area_sqm[type_name]
            loss_map[mask] = building_damage_map[mask] * value_per_bld
        
        structural_loss = float(loss_map.sum())
        content_loss = structural_loss * cfg.household_content_loss_fraction
        total_loss = structural_loss + content_loss
        
        return {
            'structural_loss': structural_loss,
            'content_loss': content_loss,
            'total_building_loss': total_loss,
            'loss_map': loss_map,
            'loss_by_type': {
                type_name: float(loss_map[building_type == idx].sum())
                for idx, type_name in type_mapping.items()
                if (building_type == idx).sum() > 0
            }
        }

    def calculate_infrastructure_loss(
        self,
        road_damage_map: np.ndarray,
        road_network: np.ndarray,
        bridge_damage_map: Optional[np.ndarray] = None,
        bridge_locations: Optional[np.ndarray] = None,
        pixel_area_km2: float = 1.0,
    ) -> Dict:
        cfg = self.config
        road_mapping = {1: 'minor', 2: 'major', 3: 'highway'}
        
        road_loss = 0.0
        road_loss_by_type = {}
        
        for idx, road_type in road_mapping.items():
            mask = (road_network == idx)
            if mask.sum() == 0:
                continue
            damaged_km = float((road_damage_map[mask] * pixel_area_km2).sum())
            cost = damaged_km * cfg.road_repair_cost_per_km[road_type]
            road_loss += cost
            road_loss_by_type[road_type] = cost
        
        bridge_loss = 0.0
        damaged_bridges = 0
        if bridge_damage_map is not None and bridge_locations is not None:
            bridge_loss = float((bridge_damage_map * (bridge_locations > 0)).sum() * cfg.bridge_repair_cost_per_unit)
            damaged_bridges = int((bridge_damage_map[bridge_locations > 0] > 0.2).sum())
        
        total_infra_loss = road_loss + bridge_loss
        
        return {
            'road_loss': road_loss,
            'road_loss_by_type': road_loss_by_type,
            'bridge_loss': bridge_loss,
            'damaged_bridges_count': damaged_bridges,
            'total_infrastructure_loss': total_infra_loss,
        }

    def calculate_agricultural_loss(
        self,
        crop_damage_map: np.ndarray,
        crop_type: np.ndarray,
        pixel_area_km2: float = 1.0,
    ) -> Dict:
        cfg = self.config
        type_mapping = {0: 'kharif', 1: 'rabi', 2: 'zaid'}
        
        loss_map = np.zeros_like(crop_damage_map, dtype=float)
        
        for idx, crop_season in type_mapping.items():
            mask = (crop_type == idx)
            if mask.sum() == 0:
                continue
            area_hectares = pixel_area_km2 * 100
            value_per_pixel = cfg.crop_value_per_hectare[crop_season] * area_hectares
            loss_map[mask] = crop_damage_map[mask] * value_per_pixel
        
        total_crop_loss = float(loss_map.sum())
        
        return {
            'total_crop_loss': total_crop_loss,
            'loss_map': loss_map,
            'loss_by_season': {
                season: float(loss_map[crop_type == idx].sum())
                for idx, season in type_mapping.items()
                if (crop_type == idx).sum() > 0
            }
        }

    def calculate_business_interruption(
        self,
        affected_population: float,
        mean_disruption_days: float = 14.0,
        business_participation_rate: float = 0.35,
    ) -> Dict:
        cfg = self.config
        
        affected_businesses = affected_population * business_participation_rate
        daily_loss = affected_businesses * cfg.business_interruption_daily
        total_loss = daily_loss * mean_disruption_days
        
        return {
            'affected_businesses': affected_businesses,
            'daily_business_loss': daily_loss,
            'total_business_interruption_loss': total_loss,
            'mean_disruption_days': mean_disruption_days,
        }

    def calculate_indirect_losses(
        self,
        direct_losses: float,
        supply_chain_multiplier: float = 0.20,
    ) -> Dict:
        cfg = self.config
        
        base_indirect = direct_losses * cfg.gdp_multiplier_indirect
        supply_chain_loss = direct_losses * supply_chain_multiplier
        total_indirect = base_indirect + supply_chain_loss
        
        return {
            'base_indirect_loss': base_indirect,
            'supply_chain_loss': supply_chain_loss,
            'total_indirect_loss': total_indirect,
        }

    def run(
        self,
        building_damage_map: np.ndarray,
        building_type: np.ndarray,
        road_damage_map: Optional[np.ndarray] = None,
        road_network: Optional[np.ndarray] = None,
        bridge_damage_map: Optional[np.ndarray] = None,
        bridge_locations: Optional[np.ndarray] = None,
        crop_damage_map: Optional[np.ndarray] = None,
        crop_type: Optional[np.ndarray] = None,
        affected_population: Optional[float] = None,
        pixel_area_km2: float = 1.0,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running economic loss modeling...")
        
        building_loss = self.calculate_building_loss(building_damage_map, building_type, pixel_area_km2)
        
        infra_loss = {'total_infrastructure_loss': 0.0}
        if road_damage_map is not None and road_network is not None:
            infra_loss = self.calculate_infrastructure_loss(
                road_damage_map, road_network, bridge_damage_map, bridge_locations, pixel_area_km2
            )
        
        agri_loss = {'total_crop_loss': 0.0}
        if crop_damage_map is not None and crop_type is not None:
            agri_loss = self.calculate_agricultural_loss(crop_damage_map, crop_type, pixel_area_km2)
        
        business_loss = {'total_business_interruption_loss': 0.0}
        if affected_population is not None:
            business_loss = self.calculate_business_interruption(affected_population)
        
        direct_total = (
            building_loss['total_building_loss'] +
            infra_loss['total_infrastructure_loss'] +
            agri_loss['total_crop_loss'] +
            business_loss['total_business_interruption_loss']
        )
        
        indirect_loss = self.calculate_indirect_losses(direct_total)
        
        total_economic_loss = direct_total + indirect_loss['total_indirect_loss']
        
        result = {
            'summary': {
                'currency': self.config.currency,
                'direct_losses': direct_total,
                'indirect_losses': indirect_loss['total_indirect_loss'],
                'total_economic_loss': total_economic_loss,
            },
            'buildings': {k: v for k, v in building_loss.items() if not isinstance(v, np.ndarray)},
            'infrastructure': infra_loss,
            'agriculture': agri_loss,
            'business_interruption': business_loss,
            'indirect': indirect_loss,
            'rasters': {
                'building_loss_map': building_loss['loss_map'],
            }
        }
        
        if crop_damage_map is not None and crop_type is not None:
            result['rasters']['crop_loss_map'] = agri_loss['loss_map']
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            for name, arr in result['rasters'].items():
                np.save(output_path / f'{name}.npy', arr)
            import json
            report = {k: v for k, v in result.items() if k != 'rasters'}
            with open(output_path / 'economic_loss.json', 'w') as f:
                json.dump(report, f, indent=2, default=str)
        
        logger.info(
            f"Economic loss — direct: {direct_total:,.0f} {self.config.currency}, "
            f"indirect: {indirect_loss['total_indirect_loss']:,.0f} {self.config.currency}, "
            f"total: {total_economic_loss:,.0f} {self.config.currency}"
        )
        return result


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)
    
    bld_dmg = np.random.uniform(0, 1, shape)
    bld_type = np.random.choice([0, 1, 2, 3], shape, p=[0.3, 0.4, 0.2, 0.1])
    road_dmg = np.random.uniform(0, 0.6, shape)
    road_net = np.random.choice([0, 1, 2, 3], shape, p=[0.90, 0.06, 0.03, 0.01])
    
    model = EconomicLossModel()
    result = model.run(
        building_damage_map=bld_dmg,
        building_type=bld_type,
        road_damage_map=road_dmg,
        road_network=road_net,
        affected_population=50000,
    )
    
    print(f"Direct losses  : {result['summary']['direct_losses']:,.0f} {result['summary']['currency']}")
    print(f"Indirect losses: {result['summary']['indirect_losses']:,.0f} {result['summary']['currency']}")
    print(f"Total loss     : {result['summary']['total_economic_loss']:,.0f} {result['summary']['currency']}")
    print(f"Building loss  : {result['buildings']['total_building_loss']:,.0f} {result['summary']['currency']}")
    print(f"Infra loss     : {result['infrastructure']['total_infrastructure_loss']:,.0f} {result['summary']['currency']}")
