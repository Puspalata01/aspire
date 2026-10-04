import numpy as np
from typing import Tuple, Optional
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)


class PopulationGenerator:
    
    def __init__(
        self,
        bbox: Tuple[float, float, float, float],
        resolution: float = 0.01,
        seed: Optional[int] = 42
    ):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = bbox
        self.resolution = resolution
        self.seed = seed
        np.random.seed(seed)
        
        self.lat_points = int((self.max_lat - self.min_lat) / resolution)
        self.lon_points = int((self.max_lon - self.min_lon) / resolution)
        
        logger.info(f"Initialized PopulationGenerator with grid size: {self.lat_points}x{self.lon_points}")
    
    def generate_population_density(
        self,
        total_population: int = 42000000,
        urban_centers: int = 5
    ) -> np.ndarray:
        
        density_map = np.zeros((self.lat_points, self.lon_points))
        
        for _ in range(urban_centers):
            center_y = np.random.randint(0, self.lat_points)
            center_x = np.random.randint(0, self.lon_points)
            
            y, x = np.ogrid[:self.lat_points, :self.lon_points]
            distance = np.sqrt((y - center_y)**2 + (x - center_x)**2)
            
            radius = np.random.uniform(30, 80)
            peak_density = np.random.uniform(5000, 15000)
            
            urban_density = peak_density * np.exp(-(distance**2) / (2 * radius**2))
            density_map += urban_density
        
        rural_density = np.random.uniform(100, 500, (self.lat_points, self.lon_points))
        density_map += rural_density
        
        current_total = density_map.sum()
        density_map = (density_map / current_total) * total_population
        
        return density_map
    
    def generate_age_distribution(self) -> dict:
        
        age_groups = {
            'children_0_14': np.random.uniform(0.22, 0.28, (self.lat_points, self.lon_points)),
            'youth_15_24': np.random.uniform(0.17, 0.22, (self.lat_points, self.lon_points)),
            'adults_25_54': np.random.uniform(0.38, 0.45, (self.lat_points, self.lon_points)),
            'elderly_55_plus': np.random.uniform(0.12, 0.18, (self.lat_points, self.lon_points))
        }
        
        for lat in range(self.lat_points):
            for lon in range(self.lon_points):
                total = sum(group[lat, lon] for group in age_groups.values())
                for group in age_groups.values():
                    group[lat, lon] /= total
        
        return age_groups
    
    def generate_vulnerability_index(
        self,
        population_density: np.ndarray,
        age_distribution: dict
    ) -> np.ndarray:
        
        vulnerability = np.zeros((self.lat_points, self.lon_points))
        
        density_norm = (population_density - population_density.min()) / \
                       (population_density.max() - population_density.min())
        vulnerability += density_norm * 0.3
        
        vulnerable_ages = age_distribution['children_0_14'] + age_distribution['elderly_55_plus']
        vulnerability += vulnerable_ages * 0.4
        
        socioeconomic = np.random.uniform(0.3, 0.8, (self.lat_points, self.lon_points))
        vulnerability += socioeconomic * 0.3
        
        vulnerability = np.clip(vulnerability, 0, 1)
        
        return vulnerability


class InfrastructureGenerator:
    
    def __init__(
        self,
        bbox: Tuple[float, float, float, float],
        resolution: float = 0.01,
        seed: Optional[int] = 42
    ):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = bbox
        self.resolution = resolution
        self.seed = seed
        np.random.seed(seed)
        
        self.lat_points = int((self.max_lat - self.min_lat) / resolution)
        self.lon_points = int((self.max_lon - self.min_lon) / resolution)
        
        logger.info(f"Initialized InfrastructureGenerator with grid size: {self.lat_points}x{self.lon_points}")
    
    def generate_road_network(self) -> np.ndarray:
        
        road_map = np.zeros((self.lat_points, self.lon_points), dtype=np.uint8)
        
        num_highways = np.random.randint(3, 7)
        for _ in range(num_highways):
            if np.random.rand() > 0.5:
                row = np.random.randint(0, self.lat_points)
                road_map[row, :] = 3
            else:
                col = np.random.randint(0, self.lon_points)
                road_map[:, col] = 3
        
        num_major_roads = np.random.randint(10, 20)
        for _ in range(num_major_roads):
            start_y = np.random.randint(0, self.lat_points)
            start_x = np.random.randint(0, self.lon_points)
            
            length = np.random.randint(50, 150)
            direction = np.random.choice(['horizontal', 'vertical', 'diagonal'])
            
            for i in range(length):
                y = start_y + (i if direction in ['vertical', 'diagonal'] else 0)
                x = start_x + (i if direction in ['horizontal', 'diagonal'] else 0)
                
                if 0 <= y < self.lat_points and 0 <= x < self.lon_points:
                    if road_map[y, x] == 0:
                        road_map[y, x] = 2
        
        return road_map
    
    def generate_buildings(self) -> dict:
        
        residential = np.random.poisson(5, (self.lat_points, self.lon_points))
        
        commercial = np.zeros((self.lat_points, self.lon_points))
        num_commercial = np.random.randint(10, 20)
        for _ in range(num_commercial):
            y = np.random.randint(0, self.lat_points)
            x = np.random.randint(0, self.lon_points)
            size = np.random.randint(5, 15)
            
            y_start = max(0, y - size)
            y_end = min(self.lat_points, y + size)
            x_start = max(0, x - size)
            x_end = min(self.lon_points, x + size)
            
            commercial[y_start:y_end, x_start:x_end] = np.random.randint(10, 50)
        
        critical = np.zeros((self.lat_points, self.lon_points))
        
        facility_types = {
            'hospitals': np.random.randint(15, 30),
            'schools': np.random.randint(50, 100),
            'fire_stations': np.random.randint(10, 20),
            'police_stations': np.random.randint(10, 20)
        }
        
        facilities = []
        for facility_type, count in facility_types.items():
            for _ in range(count):
                y = np.random.randint(0, self.lat_points)
                x = np.random.randint(0, self.lon_points)
                critical[y, x] = {'hospitals': 5, 'schools': 3, 'fire_stations': 4, 'police_stations': 4}[facility_type]
                facilities.append({'type': facility_type, 'lat': y, 'lon': x})
        
        return {
            'residential': residential,
            'commercial': commercial,
            'critical_facilities': critical,
            'facility_locations': facilities
        }
    
    def generate_land_use(self) -> np.ndarray:
        
        land_use = np.zeros((self.lat_points, self.lon_points), dtype=np.uint8)
        
        num_urban = np.random.randint(5, 10)
        for _ in range(num_urban):
            center_y = np.random.randint(0, self.lat_points)
            center_x = np.random.randint(0, self.lon_points)
            radius = np.random.randint(20, 60)
            
            y, x = np.ogrid[:self.lat_points, :self.lon_points]
            mask = ((y - center_y)**2 + (x - center_x)**2) <= radius**2
            land_use[mask] = 1
        
        agricultural_mask = (land_use == 0) & (np.random.rand(self.lat_points, self.lon_points) > 0.3)
        land_use[agricultural_mask] = 2
        
        forest_mask = (land_use == 0) & (np.random.rand(self.lat_points, self.lon_points) > 0.5)
        land_use[forest_mask] = 3
        
        water_mask = (land_use == 0) & (np.random.rand(self.lat_points, self.lon_points) > 0.95)
        land_use[water_mask] = 4
        
        return land_use


def generate_complete_dataset(
    bbox: Tuple[float, float, float, float],
    output_path: Path,
    resolution: float = 0.01
):
    
    logger.info("Starting complete dataset generation...")
    
    pop_gen = PopulationGenerator(bbox, resolution)
    population = pop_gen.generate_population_density()
    age_dist = pop_gen.generate_age_distribution()
    vulnerability = pop_gen.generate_vulnerability_index(population, age_dist)
    
    infra_gen = InfrastructureGenerator(bbox, resolution)
    roads = infra_gen.generate_road_network()
    buildings = infra_gen.generate_buildings()
    land_use = infra_gen.generate_land_use()
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    np.save(output_path / 'population_density.npy', population)
    np.save(output_path / 'vulnerability_index.npy', vulnerability)
    np.save(output_path / 'road_network.npy', roads)
    np.save(output_path / 'land_use.npy', land_use)
    
    for age_group, data in age_dist.items():
        np.save(output_path / f'{age_group}.npy', data)
    
    for building_type, data in buildings.items():
        if building_type != 'facility_locations':
            np.save(output_path / f'buildings_{building_type}.npy', data)
    
    import json
    with open(output_path / 'critical_facilities.json', 'w') as f:
        json.dump(buildings['facility_locations'], f, indent=2)
    
    logger.info(f"Complete dataset saved to {output_path}")
    
    return {
        'population': population,
        'vulnerability': vulnerability,
        'age_distribution': age_dist,
        'roads': roads,
        'buildings': buildings,
        'land_use': land_use
    }


if __name__ == "__main__":
    bbox = (17.78, 22.57, 81.37, 87.53)
    
    output_path = Path("data/sample/population_infrastructure")
    dataset = generate_complete_dataset(bbox, output_path, resolution=0.05)
    
    print(f"Total population: {dataset['population'].sum():,.0f}")
    print(f"Mean vulnerability index: {dataset['vulnerability'].mean():.3f}")
    print(f"Number of road cells: {(dataset['roads'] > 0).sum()}")
    print(f"Urban area percentage: {(dataset['land_use'] == 1).sum() / dataset['land_use'].size * 100:.2f}%")
