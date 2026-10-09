import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime, timedelta
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class HeatwaveConfig:
    temperature_threshold_celsius: float = 40.0
    duration_threshold_days: int = 3
    heatwave_categories: Dict[str, Tuple[float, float]] = None
    humidity_weight: float = 0.3
    heat_index_method: str = 'rothfusz'
    forecast_horizon_days: int = 10
    population_exposure_threshold: float = 35.0

    def __post_init__(self):
        if self.heatwave_categories is None:
            self.heatwave_categories = {
                'moderate': (35, 40),
                'severe': (40, 45),
                'extreme': (45, 50),
                'catastrophic': (50, float('inf')),
            }


class HeatwaveDetector:

    def __init__(self, config: Optional[HeatwaveConfig] = None):
        self.config = config or HeatwaveConfig()
        logger.info("Initialized HeatwaveDetector")

    def calculate_heat_index(
        self,
        temperature_c: np.ndarray,
        relative_humidity: np.ndarray,
    ) -> np.ndarray:
        t_f = temperature_c * 9/5 + 32
        rh = relative_humidity
        
        hi = (
            -42.379 +
            2.04901523 * t_f +
            10.14333127 * rh -
            0.22475541 * t_f * rh -
            6.83783e-3 * t_f**2 -
            5.481717e-2 * rh**2 +
            1.22874e-3 * t_f**2 * rh +
            8.5282e-4 * t_f * rh**2 -
            1.99e-6 * t_f**2 * rh**2
        )
        
        hi_c = (hi - 32) * 5/9
        
        low_temp = temperature_c < 27
        hi_c[low_temp] = temperature_c[low_temp]
        
        return hi_c

    def detect_heatwave_events(
        self,
        temperature_series: np.ndarray,
        dates: Optional[List] = None,
    ) -> List[Dict]:
        cfg = self.config
        
        if dates is None:
            dates = list(range(len(temperature_series)))
        
        daily_max = temperature_series.max(axis=(1, 2)) if temperature_series.ndim == 3 else temperature_series
        
        exceeds_threshold = daily_max >= cfg.temperature_threshold_celsius
        
        events = []
        in_event = False
        event_start = None
        event_temps = []
        
        for i, (exceeds, temp) in enumerate(zip(exceeds_threshold, daily_max)):
            if exceeds:
                if not in_event:
                    in_event = True
                    event_start = i
                    event_temps = [temp]
                else:
                    event_temps.append(temp)
            else:
                if in_event:
                    duration = len(event_temps)
                    if duration >= cfg.duration_threshold_days:
                        events.append({
                            'start_day': event_start,
                            'end_day': i - 1,
                            'duration_days': duration,
                            'max_temperature': float(max(event_temps)),
                            'mean_temperature': float(np.mean(event_temps)),
                            'peak_day': event_start + int(np.argmax(event_temps)),
                        })
                    in_event = False
                    event_start = None
                    event_temps = []
        
        if in_event and len(event_temps) >= cfg.duration_threshold_days:
            events.append({
                'start_day': event_start,
                'end_day': len(daily_max) - 1,
                'duration_days': len(event_temps),
                'max_temperature': float(max(event_temps)),
                'mean_temperature': float(np.mean(event_temps)),
                'peak_day': event_start + int(np.argmax(event_temps)),
            })
        
        for event in events:
            event['category'] = self.classify_intensity(event['max_temperature'])
        
        logger.info(f"Detected {len(events)} heatwave events")
        return events

    def classify_intensity(self, temperature: float) -> str:
        for category, (min_temp, max_temp) in self.config.heatwave_categories.items():
            if min_temp <= temperature < max_temp:
                return category
        return 'unknown'

    def calculate_population_exposure(
        self,
        heat_index_map: np.ndarray,
        population_density: np.ndarray,
        vulnerable_fraction: Optional[np.ndarray] = None,
    ) -> Dict:
        cfg = self.config
        
        exposed_mask = heat_index_map >= cfg.population_exposure_threshold
        
        exposed_population = float((population_density * exposed_mask).sum())
        
        if vulnerable_fraction is not None:
            if vulnerable_fraction.shape != population_density.shape:
                vulnerable_fraction = np.full_like(population_density, vulnerable_fraction.mean())
            vulnerable_exposed = float((population_density * vulnerable_fraction * exposed_mask).sum())
        else:
            vulnerable_exposed = exposed_population * 0.25
        
        severe_mask = heat_index_map >= 45
        severe_exposed = float((population_density * severe_mask).sum())
        
        return {
            'total_exposed': exposed_population,
            'vulnerable_exposed': vulnerable_exposed,
            'severe_exposure': severe_exposed,
            'exposed_area_fraction': float(exposed_mask.mean()),
        }

    def forecast_heatwave(
        self,
        temperature_series: np.ndarray,
        humidity_series: Optional[np.ndarray] = None,
    ) -> Dict:
        logger.info(f"Forecasting heatwave for {len(temperature_series)} timesteps...")
        
        if temperature_series.ndim == 3:
            daily_max_temp = temperature_series.max(axis=(1, 2))
            spatial_avg_temp = temperature_series.mean(axis=(1, 2))
        else:
            daily_max_temp = temperature_series
            spatial_avg_temp = temperature_series
        
        if humidity_series is not None:
            if humidity_series.ndim == 3:
                avg_humidity = humidity_series.mean(axis=(1, 2))
            else:
                avg_humidity = humidity_series
            
            heat_index_series = self.calculate_heat_index(spatial_avg_temp, avg_humidity)
        else:
            heat_index_series = spatial_avg_temp
        
        exceeds = daily_max_temp >= self.config.temperature_threshold_celsius
        heatwave_days = int(exceeds.sum())
        
        consecutive_days = 0
        max_consecutive = 0
        for exceed in exceeds:
            if exceed:
                consecutive_days += 1
                max_consecutive = max(max_consecutive, consecutive_days)
            else:
                consecutive_days = 0
        
        heatwave_likely = max_consecutive >= self.config.duration_threshold_days
        
        peak_day = int(daily_max_temp.argmax())
        peak_temperature = float(daily_max_temp[peak_day])
        
        return {
            'heatwave_likely': heatwave_likely,
            'heatwave_days': heatwave_days,
            'max_consecutive_days': max_consecutive,
            'peak_day': peak_day,
            'peak_temperature': peak_temperature,
            'mean_temperature': float(daily_max_temp.mean()),
            'heat_index_series': heat_index_series,
        }

    def generate_risk_map(
        self,
        heat_index_map: np.ndarray,
        urban_density_map: Optional[np.ndarray] = None,
        vegetation_index: Optional[np.ndarray] = None,
    ) -> Dict:
        logger.info("Generating heatwave risk map...")
        
        base_risk = np.clip((heat_index_map - 30) / 20, 0, 1)
        
        if urban_density_map is not None:
            if urban_density_map.shape != base_risk.shape:
                from scipy.ndimage import zoom
                f = (base_risk.shape[0] / urban_density_map.shape[0],
                     base_risk.shape[1] / urban_density_map.shape[1])
                urban_density_map = zoom(urban_density_map, f, order=1)
            
            uhi_factor = 1.0 + 0.3 * np.clip(urban_density_map, 0, 1)
            base_risk = np.clip(base_risk * uhi_factor, 0, 1)
        
        if vegetation_index is not None:
            if vegetation_index.shape != base_risk.shape:
                from scipy.ndimage import zoom
                f = (base_risk.shape[0] / vegetation_index.shape[0],
                     base_risk.shape[1] / vegetation_index.shape[1])
                vegetation_index = zoom(vegetation_index, f, order=1)
            
            cooling_factor = 1.0 - 0.2 * np.clip(vegetation_index, 0, 1)
            base_risk = np.clip(base_risk * cooling_factor, 0, 1)
        
        risk_classified = np.digitize(base_risk, [0.25, 0.50, 0.75, 0.90]).astype(np.int8)
        
        return {
            'risk_map': base_risk,
            'risk_classified': risk_classified,
            'mean_risk': float(base_risk.mean()),
            'high_risk_area_fraction': float((base_risk > 0.75).mean()),
        }

    def run(
        self,
        temperature_series: np.ndarray,
        humidity_series: Optional[np.ndarray] = None,
        population_density: Optional[np.ndarray] = None,
        vulnerable_fraction: Optional[np.ndarray] = None,
        urban_density_map: Optional[np.ndarray] = None,
        vegetation_index: Optional[np.ndarray] = None,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running heatwave detection and forecasting...")
        
        events = self.detect_heatwave_events(temperature_series)
        
        forecast = self.forecast_heatwave(temperature_series, humidity_series)
        
        if temperature_series.ndim == 3:
            latest_temp_map = temperature_series[-1]
            if humidity_series is not None:
                latest_humidity_map = humidity_series[-1] if humidity_series.ndim == 3 else np.full_like(latest_temp_map, humidity_series[-1])
            else:
                latest_humidity_map = np.full_like(latest_temp_map, 50.0)
            
            heat_index_map = self.calculate_heat_index(latest_temp_map, latest_humidity_map)
        else:
            heat_index_map = self.calculate_heat_index(
                temperature_series[-1:],
                humidity_series[-1:] if humidity_series is not None else np.array([50.0])
            )
        
        exposure = {}
        if population_density is not None:
            exposure = self.calculate_population_exposure(
                heat_index_map,
                population_density,
                vulnerable_fraction,
            )
        
        risk = self.generate_risk_map(
            heat_index_map,
            urban_density_map,
            vegetation_index,
        )
        
        result = {
            'events': events,
            'forecast': {k: v for k, v in forecast.items() if not isinstance(v, np.ndarray)},
            'exposure': exposure,
            'risk': {k: v for k, v in risk.items() if not isinstance(v, np.ndarray)},
            'rasters': {
                'heat_index_map': heat_index_map,
                'risk_map': risk['risk_map'],
                'risk_classified': risk['risk_classified'],
            }
        }
        
        if 'heat_index_series' in forecast:
            result['rasters']['heat_index_series'] = forecast['heat_index_series']
        
        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            
            for name, arr in result['rasters'].items():
                np.save(output_path / f'{name}.npy', arr)
            
            import json
            report = {k: v for k, v in result.items() if k != 'rasters'}
            with open(output_path / 'heatwave_analysis.json', 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"Heatwave analysis saved to {output_path}")
        
        logger.info(
            f"Heatwave analysis complete — "
            f"events: {len(events)}, "
            f"heatwave likely: {forecast['heatwave_likely']}, "
            f"peak temp: {forecast['peak_temperature']:.1f}°C"
        )
        
        return result


if __name__ == "__main__":
    np.random.seed(42)
    
    num_days = 30
    temperature_series = 35 + 8 * np.sin(np.linspace(0, 2*np.pi, num_days)) + np.random.normal(0, 2, num_days)
    temperature_series[10:18] += 7
    
    humidity_series = 60 + 20 * np.sin(np.linspace(0, 4*np.pi, num_days)) + np.random.normal(0, 5, num_days)
    
    temp_spatial = np.stack([
        temperature_series[:, None, None] + np.random.normal(0, 1, (num_days, 100, 100))
        for _ in range(1)
    ])[0]
    
    humidity_spatial = np.stack([
        humidity_series[:, None, None] + np.random.normal(0, 3, (num_days, 100, 100))
        for _ in range(1)
    ])[0]
    
    population = np.random.exponential(500, (100, 100))
    vulnerable = np.random.uniform(0.15, 0.35, (100, 100))
    urban = np.random.uniform(0, 1, (100, 100))
    vegetation = np.random.uniform(0, 0.8, (100, 100))
    
    detector = HeatwaveDetector()
    result = detector.run(
        temperature_series=temp_spatial,
        humidity_series=humidity_spatial,
        population_density=population,
        vulnerable_fraction=vulnerable,
        urban_density_map=urban,
        vegetation_index=vegetation,
        output_path=Path('data/processed/heatwave'),
    )
    
    print(f"\nHeatwave events detected: {len(result['events'])}")
    for event in result['events']:
        print(f"  Days {event['start_day']}-{event['end_day']}: {event['category']}, "
              f"max {event['max_temperature']:.1f}°C, duration {event['duration_days']} days")
    
    print(f"\nForecast heatwave likely: {result['forecast']['heatwave_likely']}")
    print(f"Peak temperature        : {result['forecast']['peak_temperature']:.1f}°C")
    print(f"Heatwave days           : {result['forecast']['heatwave_days']}")
    if result['exposure']:
        print(f"Total exposed           : {result['exposure']['total_exposed']:,.0f}")
        print(f"Vulnerable exposed      : {result['exposure']['vulnerable_exposed']:,.0f}")
