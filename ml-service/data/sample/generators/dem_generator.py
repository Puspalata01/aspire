import numpy as np
from typing import Tuple, Optional
from pathlib import Path
from scipy.ndimage import gaussian_filter
from utils.logger import get_logger

logger = get_logger(__name__)


class DEMGenerator:
    
    def __init__(
        self,
        bbox: Tuple[float, float, float, float],
        resolution: float = 0.001,
        seed: Optional[int] = 42
    ):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = bbox
        self.resolution = resolution
        self.seed = seed
        np.random.seed(seed)
        
        self.lat_points = int((self.max_lat - self.min_lat) / resolution)
        self.lon_points = int((self.max_lon - self.min_lon) / resolution)
        
        logger.info(f"Initialized DEMGenerator with grid size: {self.lat_points}x{self.lon_points}")
    
    def generate_terrain(
        self,
        terrain_type: str = 'mixed',
        base_elevation: float = 50.0,
        elevation_range: Tuple[float, float] = (0, 1000)
    ) -> np.ndarray:
        
        if terrain_type == 'coastal':
            dem = self._generate_coastal_terrain(base_elevation, elevation_range)
        elif terrain_type == 'mountainous':
            dem = self._generate_mountainous_terrain(base_elevation, elevation_range)
        elif terrain_type == 'plain':
            dem = self._generate_plain_terrain(base_elevation, elevation_range)
        else:
            dem = self._generate_mixed_terrain(base_elevation, elevation_range)
        
        dem = self._add_river_valleys(dem)
        
        dem = self._smooth_terrain(dem)
        
        return dem
    
    def _generate_coastal_terrain(
        self,
        base_elevation: float,
        elevation_range: Tuple[float, float]
    ) -> np.ndarray:
        
        dem = np.zeros((self.lat_points, self.lon_points))
        
        x = np.linspace(0, 1, self.lon_points)
        y = np.linspace(0, 1, self.lat_points)
        X, Y = np.meshgrid(x, y)
        
        coastal_gradient = X * (elevation_range[1] - elevation_range[0]) + elevation_range[0]
        
        noise = self._generate_perlin_noise(scale=50) * 100
        
        dem = coastal_gradient + noise
        
        return dem
    
    def _generate_mountainous_terrain(
        self,
        base_elevation: float,
        elevation_range: Tuple[float, float]
    ) -> np.ndarray:
        
        dem = np.zeros((self.lat_points, self.lon_points))
        
        num_peaks = np.random.randint(3, 8)
        
        for _ in range(num_peaks):
            peak_lat = np.random.randint(0, self.lat_points)
            peak_lon = np.random.randint(0, self.lon_points)
            peak_height = np.random.uniform(elevation_range[0] + 200, elevation_range[1])
            
            y, x = np.ogrid[:self.lat_points, :self.lon_points]
            distance = np.sqrt((y - peak_lat)**2 + (x - peak_lon)**2)
            
            peak_radius = np.random.uniform(100, 300)
            peak = peak_height * np.exp(-(distance**2) / (2 * peak_radius**2))
            
            dem += peak
        
        noise = self._generate_perlin_noise(scale=30) * 50
        dem += noise
        
        return dem
    
    def _generate_plain_terrain(
        self,
        base_elevation: float,
        elevation_range: Tuple[float, float]
    ) -> np.ndarray:
        
        dem = np.full((self.lat_points, self.lon_points), base_elevation)
        
        gentle_slope = self._generate_perlin_noise(scale=100) * 20
        
        small_variations = self._generate_perlin_noise(scale=20) * 5
        
        dem = dem + gentle_slope + small_variations
        
        return dem
    
    def _generate_mixed_terrain(
        self,
        base_elevation: float,
        elevation_range: Tuple[float, float]
    ) -> np.ndarray:
        
        coastal = self._generate_coastal_terrain(base_elevation, elevation_range) * 0.4
        mountainous = self._generate_mountainous_terrain(base_elevation, elevation_range) * 0.3
        plain = self._generate_plain_terrain(base_elevation, elevation_range) * 0.3
        
        dem = coastal + mountainous + plain
        
        return dem
    
    def _generate_perlin_noise(self, scale: int = 100) -> np.ndarray:
        
        noise = np.random.randn(self.lat_points, self.lon_points)
        
        noise = gaussian_filter(noise, sigma=scale/10)
        
        noise = (noise - noise.min()) / (noise.max() - noise.min())
        
        return noise
    
    def _add_river_valleys(self, dem: np.ndarray) -> np.ndarray:
        
        num_rivers = np.random.randint(2, 5)
        
        for _ in range(num_rivers):
            start_lon = np.random.randint(0, self.lon_points)
            
            river_path = []
            current_lat = 0
            current_lon = start_lon
            
            while current_lat < self.lat_points:
                river_path.append((current_lat, current_lon))
                
                current_lat += np.random.randint(5, 15)
                current_lon += np.random.randint(-10, 11)
                current_lon = np.clip(current_lon, 0, self.lon_points - 1)
            
            for lat, lon in river_path:
                y, x = np.ogrid[:self.lat_points, :self.lon_points]
                distance = np.sqrt((y - lat)**2 + (x - lon)**2)
                
                valley_depth = 50 * np.exp(-(distance**2) / (2 * 20**2))
                dem -= valley_depth
        
        dem = np.clip(dem, 0, None)
        
        return dem
    
    def _smooth_terrain(self, dem: np.ndarray, sigma: float = 2.0) -> np.ndarray:
        
        return gaussian_filter(dem, sigma=sigma)
    
    def calculate_slope(self, dem: np.ndarray) -> np.ndarray:
        
        dy, dx = np.gradient(dem)
        
        slope = np.sqrt(dx**2 + dy**2)
        
        slope_degrees = np.arctan(slope) * (180 / np.pi)
        
        return slope_degrees
    
    def calculate_aspect(self, dem: np.ndarray) -> np.ndarray:
        
        dy, dx = np.gradient(dem)
        
        aspect = np.arctan2(-dy, dx)
        
        aspect_degrees = aspect * (180 / np.pi)
        aspect_degrees = (aspect_degrees + 360) % 360
        
        return aspect_degrees
    
    def save_to_file(
        self,
        dem: np.ndarray,
        output_path: Path,
        include_derivatives: bool = True,
        format: str = 'npy'
    ):
        
        output_path.mkdir(parents=True, exist_ok=True)
        
        if format == 'npy':
            np.save(output_path / 'dem.npy', dem)
            
            if include_derivatives:
                slope = self.calculate_slope(dem)
                aspect = self.calculate_aspect(dem)
                np.save(output_path / 'slope.npy', slope)
                np.save(output_path / 'aspect.npy', aspect)
        
        elif format == 'csv':
            np.savetxt(output_path / 'dem.csv', dem, delimiter=',')
            
            if include_derivatives:
                slope = self.calculate_slope(dem)
                aspect = self.calculate_aspect(dem)
                np.savetxt(output_path / 'slope.csv', slope, delimiter=',')
                np.savetxt(output_path / 'aspect.csv', aspect, delimiter=',')
        
        logger.info(f"Saved DEM data to {output_path} in {format} format")
    
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
            'units': 'meters',
            'vertical_datum': 'MSL',
            'source': 'synthetic',
            'generator': 'DEMGenerator'
        }


if __name__ == "__main__":
    bbox = (17.78, 22.57, 81.37, 87.53)
    
    generator = DEMGenerator(bbox=bbox, resolution=0.01)
    
    dem = generator.generate_terrain(
        terrain_type='mixed',
        base_elevation=100.0,
        elevation_range=(0, 800)
    )
    
    output_path = Path("data/sample/dem")
    generator.save_to_file(dem, output_path, include_derivatives=True, format='npy')
    
    print(f"Generated DEM shape: {dem.shape}")
    print(f"Elevation range: {dem.min():.2f} - {dem.max():.2f} meters")
    print(f"Mean elevation: {dem.mean():.2f} meters")
