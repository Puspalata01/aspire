import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from datetime import datetime
from generators.rainfall_generator import RainfallGenerator
from generators.dem_generator import DEMGenerator
from generators.satellite_generator import SatelliteImageryGenerator
from generators.population_infrastructure_generator import generate_complete_dataset
from utils.logger import get_logger

logger = get_logger(__name__)


def generate_all_sample_data():
    
    bbox = (17.78, 22.57, 81.37, 87.53)
    
    base_output = Path("data/sample")
    base_output.mkdir(parents=True, exist_ok=True)
    
    logger.info("=" * 60)
    logger.info("Starting comprehensive sample data generation")
    logger.info("=" * 60)
    
    logger.info("\n[1/5] Generating rainfall data...")
    rainfall_gen = RainfallGenerator(bbox=bbox, resolution=0.25)
    
    start_date = datetime(2024, 7, 1)
    rainfall_series, dates = rainfall_gen.generate_time_series(
        start_date=start_date,
        num_days=30,
        season='monsoon',
        event_day=15,
        event_intensity=4.0
    )
    
    rainfall_output = base_output / "rainfall"
    rainfall_gen.save_to_file(rainfall_series, dates, rainfall_output, format='npy')
    
    logger.info(f"  ✓ Generated {len(dates)} days of rainfall data")
    logger.info(f"  ✓ Mean: {rainfall_series.mean():.2f} mm/day, Max: {rainfall_series.max():.2f} mm/day")
    
    logger.info("\n[2/5] Generating DEM (terrain) data...")
    dem_gen = DEMGenerator(bbox=bbox, resolution=0.01)
    
    dem = dem_gen.generate_terrain(
        terrain_type='mixed',
        base_elevation=100.0,
        elevation_range=(0, 800)
    )
    
    dem_output = base_output / "dem"
    dem_gen.save_to_file(dem, dem_output, include_derivatives=True, format='npy')
    
    logger.info(f"  ✓ Generated DEM with shape: {dem.shape}")
    logger.info(f"  ✓ Elevation range: {dem.min():.2f} - {dem.max():.2f} meters")
    
    logger.info("\n[3/5] Generating satellite imagery (SAR)...")
    satellite_gen = SatelliteImageryGenerator(
        bbox=bbox,
        resolution=0.001,
        image_size=(512, 512)
    )
    
    pre_image, post_image = satellite_gen.generate_image_pair(
        pre_event=True,
        post_event=True,
        flood_percentage=0.35
    )
    
    flood_mask = satellite_gen._generate_flood_mask(0.35)
    
    satellite_output = base_output / "satellite"
    satellite_gen.save_to_file(
        {
            'sar_pre_event': pre_image,
            'sar_post_event': post_image,
            'flood_mask': flood_mask.astype('uint8') * 255
        },
        satellite_output,
        format='npy'
    )
    
    logger.info(f"  ✓ Generated SAR image pair with shape: {pre_image.shape}")
    logger.info(f"  ✓ Flood coverage: {flood_mask.sum() / flood_mask.size * 100:.2f}%")
    
    logger.info("\n[4/5] Generating population data...")
    pop_infra_output = base_output / "population_infrastructure"
    dataset = generate_complete_dataset(bbox, pop_infra_output, resolution=0.05)
    
    logger.info(f"  ✓ Total population: {dataset['population'].sum():,.0f}")
    logger.info(f"  ✓ Mean vulnerability: {dataset['vulnerability'].mean():.3f}")
    
    logger.info("\n[5/5] Generating metadata...")
    metadata = {
        'generation_date': datetime.now().isoformat(),
        'bbox': {
            'min_lat': bbox[0],
            'max_lat': bbox[1],
            'min_lon': bbox[2],
            'max_lon': bbox[3]
        },
        'datasets': {
            'rainfall': {
                'path': str(rainfall_output),
                'days': len(dates),
                'resolution': 0.25,
                'metadata': rainfall_gen.get_metadata()
            },
            'dem': {
                'path': str(dem_output),
                'shape': list(dem.shape),
                'resolution': 0.01,
                'metadata': dem_gen.get_metadata()
            },
            'satellite': {
                'path': str(satellite_output),
                'image_size': list(pre_image.shape),
                'resolution': 0.001,
                'metadata': satellite_gen.get_metadata()
            },
            'population_infrastructure': {
                'path': str(pop_infra_output),
                'total_population': int(dataset['population'].sum()),
                'resolution': 0.05
            }
        }
    }
    
    import json
    with open(base_output / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"  ✓ Metadata saved to {base_output / 'metadata.json'}")
    
    logger.info("\n" + "=" * 60)
    logger.info("Sample data generation completed successfully!")
    logger.info("=" * 60)
    logger.info(f"\nAll data saved to: {base_output.absolute()}")
    
    return metadata


if __name__ == "__main__":
    try:
        metadata = generate_all_sample_data()
        print("\n✓ Generation complete. Check logs/ for detailed logs.")
    except Exception as e:
        logger.error(f"Error during data generation: {e}", exc_info=True)
        raise
