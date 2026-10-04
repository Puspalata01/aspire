import numpy as np
from typing import Tuple, Optional
from pathlib import Path
from scipy.ndimage import gaussian_filter
from utils.logger import get_logger

logger = get_logger(__name__)


class SatelliteImageryGenerator:
    
    def __init__(
        self,
        bbox: Tuple[float, float, float, float],
        resolution: float = 0.001,
        image_size: Tuple[int, int] = (512, 512),
        seed: Optional[int] = 42
    ):
        self.min_lat, self.max_lat, self.min_lon, self.max_lon = bbox
        self.resolution = resolution
        self.image_size = image_size
        self.seed = seed
        np.random.seed(seed)
        
        logger.info(f"Initialized SatelliteImageryGenerator with image size: {image_size}")
    
    def generate_sar_image(
        self,
        flooded: bool = False,
        flood_percentage: float = 0.3,
        water_bodies: bool = True
    ) -> np.ndarray:
        
        sar_image = self._generate_base_sar()
        
        if water_bodies:
            sar_image = self._add_permanent_water(sar_image)
        
        if flooded:
            sar_image = self._add_flood_inundation(sar_image, flood_percentage)
        
        sar_image = self._add_speckle_noise(sar_image)
        
        return sar_image
    
    def generate_optical_image(
        self,
        scene_type: str = 'rural',
        cloud_cover: float = 0.0,
        num_bands: int = 3
    ) -> np.ndarray:
        
        if num_bands == 3:
            image = self._generate_rgb_image(scene_type)
        elif num_bands == 4:
            image = self._generate_multispectral_image(scene_type)
        else:
            raise ValueError(f"Unsupported number of bands: {num_bands}")
        
        if cloud_cover > 0:
            image = self._add_clouds(image, cloud_cover)
        
        return image
    
    def _generate_base_sar(self) -> np.ndarray:
        
        base = np.random.gamma(2, 2, size=self.image_size) * 50
        
        num_urban_areas = np.random.randint(2, 6)
        for _ in range(num_urban_areas):
            center_y = np.random.randint(0, self.image_size[0])
            center_x = np.random.randint(0, self.image_size[1])
            size = np.random.randint(30, 100)
            
            y, x = np.ogrid[:self.image_size[0], :self.image_size[1]]
            mask = ((y - center_y)**2 + (x - center_x)**2) <= size**2
            base[mask] = np.random.uniform(150, 255, size=np.sum(mask))
        
        num_vegetation = np.random.randint(3, 8)
        for _ in range(num_vegetation):
            center_y = np.random.randint(0, self.image_size[0])
            center_x = np.random.randint(0, self.image_size[1])
            size = np.random.randint(50, 150)
            
            y, x = np.ogrid[:self.image_size[0], :self.image_size[1]]
            mask = ((y - center_y)**2 + (x - center_x)**2) <= size**2
            base[mask] = np.random.uniform(80, 150, size=np.sum(mask))
        
        base = gaussian_filter(base, sigma=2)
        
        return base
    
    def _add_permanent_water(self, sar_image: np.ndarray) -> np.ndarray:
        
        num_water_bodies = np.random.randint(1, 4)
        
        for _ in range(num_water_bodies):
            center_y = np.random.randint(0, self.image_size[0])
            center_x = np.random.randint(0, self.image_size[1])
            radius_y = np.random.randint(20, 60)
            radius_x = np.random.randint(20, 80)
            
            y, x = np.ogrid[:self.image_size[0], :self.image_size[1]]
            mask = ((y - center_y)/radius_y)**2 + ((x - center_x)/radius_x)**2 <= 1
            
            sar_image[mask] = np.random.uniform(0, 20, size=np.sum(mask))
        
        return sar_image
    
    def _add_flood_inundation(
        self,
        sar_image: np.ndarray,
        flood_percentage: float
    ) -> np.ndarray:
        
        flood_mask = self._generate_flood_mask(flood_percentage)
        
        sar_image[flood_mask] = np.random.uniform(0, 25, size=np.sum(flood_mask))
        
        sar_image = gaussian_filter(sar_image, sigma=1)
        
        return sar_image
    
    def _generate_flood_mask(self, flood_percentage: float) -> np.ndarray:
        
        base_noise = np.random.rand(*self.image_size)
        base_noise = gaussian_filter(base_noise, sigma=20)
        
        threshold = np.percentile(base_noise, (1 - flood_percentage) * 100)
        flood_mask = base_noise > threshold
        
        y_gradient = np.linspace(1.0, 0.5, self.image_size[0])
        y_gradient = np.tile(y_gradient[:, np.newaxis], (1, self.image_size[1]))
        
        flood_mask = flood_mask & (np.random.rand(*self.image_size) < y_gradient)
        
        return flood_mask
    
    def _add_speckle_noise(self, sar_image: np.ndarray, intensity: float = 0.1) -> np.ndarray:
        
        noise = np.random.gamma(1/intensity, intensity, size=self.image_size)
        noisy_image = sar_image * noise
        
        return np.clip(noisy_image, 0, 255)
    
    def _generate_rgb_image(self, scene_type: str) -> np.ndarray:
        
        image = np.zeros((*self.image_size, 3), dtype=np.uint8)
        
        if scene_type == 'rural':
            image[:, :, 0] = np.random.randint(80, 120, self.image_size)
            image[:, :, 1] = np.random.randint(100, 150, self.image_size)
            image[:, :, 2] = np.random.randint(60, 100, self.image_size)
        elif scene_type == 'urban':
            image[:, :, 0] = np.random.randint(100, 150, self.image_size)
            image[:, :, 1] = np.random.randint(100, 150, self.image_size)
            image[:, :, 2] = np.random.randint(100, 150, self.image_size)
        else:
            image[:, :, :] = np.random.randint(50, 150, (*self.image_size, 3))
        
        for c in range(3):
            image[:, :, c] = gaussian_filter(image[:, :, c], sigma=3)
        
        return image
    
    def _generate_multispectral_image(self, scene_type: str) -> np.ndarray:
        
        rgb = self._generate_rgb_image(scene_type)
        
        nir = np.random.randint(120, 180, self.image_size)
        nir = gaussian_filter(nir, sigma=3)
        
        image = np.dstack([rgb, nir])
        
        return image
    
    def _add_clouds(self, image: np.ndarray, cloud_cover: float) -> np.ndarray:
        
        cloud_mask = np.random.rand(*self.image_size) < cloud_cover
        cloud_mask = gaussian_filter(cloud_mask.astype(float), sigma=30) > 0.3
        
        if image.ndim == 3:
            cloud_mask = np.stack([cloud_mask] * image.shape[2], axis=2)
        
        cloudy_image = image.copy()
        cloudy_image[cloud_mask] = np.random.randint(200, 255)
        
        return cloudy_image
    
    def generate_image_pair(
        self,
        pre_event: bool = True,
        post_event: bool = True,
        flood_percentage: float = 0.3
    ) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        
        pre_image = None
        post_image = None
        
        if pre_event:
            pre_image = self.generate_sar_image(flooded=False, water_bodies=True)
        
        if post_event:
            post_image = self.generate_sar_image(
                flooded=True,
                flood_percentage=flood_percentage,
                water_bodies=True
            )
        
        return pre_image, post_image
    
    def save_to_file(
        self,
        images: dict,
        output_path: Path,
        format: str = 'npy'
    ):
        
        output_path.mkdir(parents=True, exist_ok=True)
        
        for name, image in images.items():
            if image is not None:
                if format == 'npy':
                    np.save(output_path / f"{name}.npy", image)
                elif format == 'png':
                    from PIL import Image
                    if image.ndim == 2:
                        img = Image.fromarray(image.astype(np.uint8))
                    else:
                        img = Image.fromarray(image.astype(np.uint8))
                    img.save(output_path / f"{name}.png")
        
        logger.info(f"Saved {len(images)} images to {output_path} in {format} format")
    
    def get_metadata(self) -> dict:
        
        return {
            'bbox': {
                'min_lat': self.min_lat,
                'max_lat': self.max_lat,
                'min_lon': self.min_lon,
                'max_lon': self.max_lon
            },
            'resolution': self.resolution,
            'image_size': self.image_size,
            'sensor_type': 'SAR (Synthetic)',
            'polarization': 'VV',
            'source': 'synthetic',
            'generator': 'SatelliteImageryGenerator'
        }


if __name__ == "__main__":
    bbox = (17.78, 22.57, 81.37, 87.53)
    
    generator = SatelliteImageryGenerator(
        bbox=bbox,
        resolution=0.001,
        image_size=(512, 512)
    )
    
    pre_image, post_image = generator.generate_image_pair(
        pre_event=True,
        post_event=True,
        flood_percentage=0.35
    )
    
    flood_mask = generator._generate_flood_mask(0.35)
    
    output_path = Path("data/sample/satellite")
    generator.save_to_file(
        {
            'sar_pre_event': pre_image,
            'sar_post_event': post_image,
            'flood_mask': flood_mask.astype(np.uint8) * 255
        },
        output_path,
        format='npy'
    )
    
    print(f"Generated SAR image shape: {pre_image.shape}")
    print(f"Flood mask coverage: {flood_mask.sum() / flood_mask.size * 100:.2f}%")
