import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
from scipy.interpolate import interp1d
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class StormSurgeConfig:
    max_surge_height_m: float = 8.0
    wind_speed_coefficient: float = 0.03
    pressure_coefficient: float = 0.01
    coastal_slope: float = 0.001
    tide_amplitude_m: float = 2.0
    bathymetry_resolution_m: float = 100.0
    forecast_steps: int = 48
    
    saffir_simpson_surge: Dict[int, Tuple[float, float]] = None

    def __post_init__(self):
        if self.saffir_simpson_surge is None:
            self.saffir_simpson_surge = {
                1: (1.2, 1.5),
                2: (1.8, 2.4),
                3: (2.7, 3.7),
                4: (4.0, 5.5),
                5: (5.5, 8.0),
            }


class StormSurgePredictor:

    def __init__(self, config: Optional[StormSurgeConfig] = None):
        self.config = config or StormSurgeConfig()
        logger.info("Initialized StormSurgePredictor")

    def calculate_wind_surge(
        self,
        wind_speed: np.ndarray,
        wind_direction: np.ndarray,
        coastline_angle: float = 0.0,
    ) -> np.ndarray:
        cfg = self.config
        
        onshore_component = wind_speed * np.cos(np.radians(wind_direction - coastline_angle))
        onshore_component = np.maximum(onshore_component, 0)
        
        wind_surge = cfg.wind_speed_coefficient * (onshore_component ** 2) / 9.81
        
        return wind_surge

    def calculate_pressure_surge(
        self,
        pressure: np.ndarray,
        reference_pressure: float = 1013.0,
    ) -> np.ndarray:
        cfg = self.config
        
        pressure_deficit = reference_pressure - pressure
        
        surge_height = cfg.pressure_coefficient * pressure_deficit
        
        return surge_height

    def calculate_astronomical_tide(
        self,
        time_hours: np.ndarray,
        phase_offset: float = 0.0,
    ) -> np.ndarray:
        cfg = self.config
        
        tidal_period_hours = 12.42
        
        tide = cfg.tide_amplitude_m * np.sin(
            2 * np.pi * (time_hours / tidal_period_hours) + phase_offset
        )
        
        return tide

    def apply_bathymetry_effect(
        self,
        surge_base: np.ndarray,
        water_depth: np.ndarray,
    ) -> np.ndarray:
        depth_factor = np.ones_like(surge_base)
        
        shallow = water_depth < 50
        depth_factor[shallow] = 1.0 + (50 - water_depth[shallow]) / 100
        
        very_shallow = water_depth < 10
        depth_factor[very_shallow] = 2.5
        
        return surge_base * depth_factor

    def predict_surge_from_cyclone_params(
        self,
        wind_speed_kmh: float,
        pressure_mb: float,
        cyclone_category: int,
        distance_to_coast_km: float,
        approach_angle_deg: float = 0.0,
    ) -> Dict:
        cfg = self.config
        
        if cyclone_category in cfg.saffir_simpson_surge:
            surge_min, surge_max = cfg.saffir_simpson_surge[cyclone_category]
            empirical_surge = (surge_min + surge_max) / 2
        else:
            empirical_surge = 1.0
        
        wind_component = cfg.wind_speed_coefficient * ((wind_speed_kmh / 3.6) ** 2) / 9.81
        pressure_component = cfg.pressure_coefficient * (1013 - pressure_mb)
        
        computed_surge = wind_component + pressure_component
        
        final_surge = 0.6 * empirical_surge + 0.4 * computed_surge
        
        distance_factor = np.exp(-distance_to_coast_km / 200)
        final_surge *= distance_factor
        
        angle_factor = np.cos(np.radians(approach_angle_deg))
        if angle_factor > 0:
            final_surge *= (1 + 0.3 * angle_factor)
        
        return {
            'predicted_surge_m': final_surge,
            'empirical_component': empirical_surge,
            'wind_component': wind_component,
            'pressure_component': pressure_component,
            'distance_factor': distance_factor,
        }

    def forecast_surge_timeseries(
        self,
        wind_speed_series: np.ndarray,
        pressure_series: np.ndarray,
        time_hours: np.ndarray,
        water_depth: Optional[np.ndarray] = None,
        tide_phase: float = 0.0,
    ) -> Dict:
        logger.info(f"Forecasting surge for {len(time_hours)} timesteps...")
        
        wind_surge = self.calculate_wind_surge(
            wind_speed=wind_speed_series,
            wind_direction=np.zeros_like(wind_speed_series),
        )
        
        pressure_surge = self.calculate_pressure_surge(pressure_series)
        
        tide = self.calculate_astronomical_tide(time_hours, phase_offset=tide_phase)
        
        total_surge = wind_surge + pressure_surge + tide
        
        if water_depth is not None:
            if water_depth.shape != total_surge.shape:
                water_depth_broadcast = np.full_like(total_surge, water_depth.mean())
            else:
                water_depth_broadcast = water_depth
            total_surge = self.apply_bathymetry_effect(total_surge, water_depth_broadcast)
        
        max_surge = float(total_surge.max())
        max_surge_time = int(total_surge.argmax())
        mean_surge = float(total_surge.mean())
        
        exceedance_3m = int((total_surge > 3.0).sum())
        exceedance_5m = int((total_surge > 5.0).sum())
        
        return {
            'surge_timeseries': total_surge,
            'max_surge_height_m': max_surge,
            'max_surge_time_hours': float(time_hours[max_surge_time]),
            'mean_surge_m': mean_surge,
            'exceedance_3m_hours': exceedance_3m,
            'exceedance_5m_hours': exceedance_5m,
        }

    def generate_inundation_map(
        self,
        surge_height_m: float,
        dem: np.ndarray,
        coastline_mask: np.ndarray,
    ) -> Dict:
        logger.info(f"Generating inundation map for {surge_height_m:.1f}m surge...")
        
        from scipy.ndimage import distance_transform_edt
        
        distance_from_coast = distance_transform_edt(~coastline_mask)
        
        decay_distance_km = 20.0
        decay_factor = np.exp(-distance_from_coast / (decay_distance_km * 10))
        
        effective_surge = surge_height_m * decay_factor
        
        inundation_mask = (dem < effective_surge) & (dem >= 0)
        
        inundation_depth = np.maximum(effective_surge - dem, 0)
        inundation_depth[~inundation_mask] = 0
        
        inundated_area_km2 = float(inundation_mask.sum()) * (self.config.bathymetry_resolution_m / 1000) ** 2
        max_depth = float(inundation_depth.max())
        mean_depth = float(inundation_depth[inundation_mask].mean()) if inundation_mask.sum() > 0 else 0.0
        
        return {
            'inundation_mask': inundation_mask,
            'inundation_depth': inundation_depth,
            'inundated_area_km2': inundated_area_km2,
            'max_depth_m': max_depth,
            'mean_depth_m': mean_depth,
        }

    def run(
        self,
        wind_speed_series: np.ndarray,
        pressure_series: np.ndarray,
        time_hours: np.ndarray,
        dem: Optional[np.ndarray] = None,
        coastline_mask: Optional[np.ndarray] = None,
        water_depth: Optional[np.ndarray] = None,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running storm surge prediction...")
        
        surge_forecast = self.forecast_surge_timeseries(
            wind_speed_series=wind_speed_series,
            pressure_series=pressure_series,
            time_hours=time_hours,
            water_depth=water_depth,
        )
        
        inundation_result = {}
        if dem is not None and coastline_mask is not None:
            inundation_result = self.generate_inundation_map(
                surge_height_m=surge_forecast['max_surge_height_m'],
                dem=dem,
                coastline_mask=coastline_mask,
            )
        
        result = {
            'forecast': {k: v for k, v in surge_forecast.items() if not isinstance(v, np.ndarray)},
            'inundation': {k: v for k, v in inundation_result.items() if not isinstance(v, np.ndarray)},
            'rasters': {
                'surge_timeseries': surge_forecast['surge_timeseries'],
            }
        }
        
        if 'inundation_mask' in inundation_result:
            result['rasters']['inundation_mask'] = inundation_result['inundation_mask']
            result['rasters']['inundation_depth'] = inundation_result['inundation_depth']
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            
            for name, arr in result['rasters'].items():
                np.save(output_path / f'{name}.npy', arr)
            
            import json
            report = {k: v for k, v in result.items() if k != 'rasters'}
            with open(output_path / 'storm_surge_prediction.json', 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"Storm surge prediction saved to {output_path}")
        
        logger.info(
            f"Storm surge prediction complete — "
            f"max surge: {surge_forecast['max_surge_height_m']:.2f}m, "
            f"mean: {surge_forecast['mean_surge_m']:.2f}m"
        )
        
        return result


if __name__ == "__main__":
    np.random.seed(42)
    
    time_hours = np.arange(0, 48, 1)
    
    wind_speed = 120 + 30 * np.sin(np.linspace(0, np.pi, len(time_hours)))
    pressure = 960 + 20 * np.cos(np.linspace(0, np.pi, len(time_hours)))
    
    dem = np.random.uniform(-5, 50, (200, 200))
    
    coastline_mask = np.zeros((200, 200), dtype=bool)
    coastline_mask[:, :20] = True
    
    water_depth = np.linspace(0, 100, 200).reshape(-1, 1) * np.ones((200, 200))
    
    predictor = StormSurgePredictor()
    result = predictor.run(
        wind_speed_series=wind_speed,
        pressure_series=pressure,
        time_hours=time_hours,
        dem=dem,
        coastline_mask=coastline_mask,
        water_depth=water_depth,
        output_path=Path('data/processed/storm_surge'),
    )
    
    print(f"\nMax surge height    : {result['forecast']['max_surge_height_m']:.2f} m")
    print(f"Max surge time      : {result['forecast']['max_surge_time_hours']:.1f} hours")
    print(f"Mean surge          : {result['forecast']['mean_surge_m']:.2f} m")
    print(f">3m exceedance      : {result['forecast']['exceedance_3m_hours']} hours")
    print(f">5m exceedance      : {result['forecast']['exceedance_5m_hours']} hours")
    if result['inundation']:
        print(f"Inundated area      : {result['inundation']['inundated_area_km2']:.2f} km²")
        print(f"Max inundation depth: {result['inundation']['max_depth_m']:.2f} m")
