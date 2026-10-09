import numpy as np
from typing import Tuple, Optional
from datetime import datetime, timedelta
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)


class RainfallGenerator:
    
    def __init__(
        self,
        bbox: Tuple[float, float, float, float],
        resolution: float = 0.25,
        seed: Optional[int] = 42
    ):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = bbox
        self.resolution = resolution
        self.seed = seed
        np.random.seed(seed)
        
        self.lat_points = int((self.max_lat - self.min_lat) / resolution)
        self.lon_points = int((self.max_lon - self.min_lon) / resolution)
        
        logger.info(f"Initialized RainfallGenerator with grid size: {self.lat_points}x{self.lon_points}")
    
    def generate_daily_rainfall(
        self,
        date: datetime,
        season: str = 'monsoon',
        anomaly_factor: float = 1.0
    ) -> np.ndarray:
        
        base_rainfall = self._get_seasonal_base(season)
        
        spatial_pattern = self._generate_spatial_pattern()
        
        noise = np.random.gamma(2, 2, size=(self.lat_points, self.lon_points))
        
        rainfall = base_rainfall * spatial_pattern * noise * anomaly_factor
        
        rainfall = np.clip(rainfall, 0, 500)
        
        return rainfall
    
    def generate_time_series(
        self,
        start_date: datetime,
        num_days: int,
        season: str = 'monsoon',
        event_day: Optional[int] = None,
        event_intensity: float = 3.0
    ) -> Tuple[np.ndarray, list]:
        
        time_series = []
        dates = []
        
        for day in range(num_days):
            current_date = start_date + timedelta(days=day)
            
            if event_day is not None and day == event_day:
                anomaly = event_intensity
                logger.info(f"Generating extreme rainfall event on day {day}")
            else:
                anomaly = 1.0 + np.random.normal(0, 0.2)
            
            daily_rain = self.generate_daily_rainfall(current_date, season, anomaly)
            time_series.append(daily_rain)
            dates.append(current_date)
        
        return np.array(time_series), dates
    
    def _get_seasonal_base(self, season: str) -> float:
        seasonal_means = {
            'pre_monsoon': 15.0,
            'monsoon': 80.0,
            'post_monsoon': 30.0,
            'winter': 5.0
        }
        return seasonal_means.get(season, 50.0)
    
    def _generate_spatial_pattern(self) -> np.ndarray:
        
        y = np.linspace(0, 2 * np.pi, self.lat_points)
        x = np.linspace(0, 2 * np.pi, self.lon_points)
        X, Y = np.meshgrid(x, y)
        
        pattern = (
            0.5 * np.sin(X) * np.cos(Y) +
            0.3 * np.sin(2 * X) +
            0.2 * np.cos(3 * Y) +
            1.0
        )
        
        pattern = (pattern - pattern.min()) / (pattern.max() - pattern.min())
        
        return pattern
    
    def save_to_file(
        self,
        rainfall_data: np.ndarray,
        dates: list,
        output_path: Path,
        format: str = 'npy'
    ):
        
        output_path.mkdir(parents=True, exist_ok=True)
        
        if format == 'npy':
            np.save(output_path / 'rainfall_data.npy', rainfall_data)
            np.save(output_path / 'dates.npy', np.array([d.isoformat() for d in dates]))
        elif format == 'csv':
            for i, (data, date) in enumerate(zip(rainfall_data, dates)):
                filename = output_path / f"rainfall_{date.strftime('%Y%m%d')}.csv"
                np.savetxt(filename, data, delimiter=',')
        
        logger.info(f"Saved rainfall data to {output_path} in {format} format")
    
    def get_metadata(self) -> dict:
        
        return {
            'bbox': {
                'min_lat': self.min_lat,
                'max_lat': self.max_lat,
                'min_lon': self.min_lon,
                'max_lon': self.max_lon
            },
            'resolution': self.resolution,
            'grid_shape': (self.lat_points, self.lon_points),
            'units': 'mm/day',
            'source': 'synthetic',
            'generator': 'RainfallGenerator'
        }


if __name__ == "__main__":
    bbox = (17.78, 22.57, 81.37, 87.53)
    
    generator = RainfallGenerator(bbox=bbox, resolution=0.25)
    
    start_date = datetime(2024, 7, 1)
    rainfall_series, dates = generator.generate_time_series(
        start_date=start_date,
        num_days=30,
        season='monsoon',
        event_day=15,
        event_intensity=4.0
    )
    
    output_path = Path("data/sample/rainfall")
    generator.save_to_file(rainfall_series, dates, output_path, format='npy')
    
    print(f"Generated rainfall data shape: {rainfall_series.shape}")
    print(f"Mean daily rainfall: {rainfall_series.mean():.2f} mm/day")
    print(f"Max daily rainfall: {rainfall_series.max():.2f} mm/day")
