# Sample Data Generators

This directory contains synthetic data generators for the Multi-Hazard ML Service.

## Overview

These generators create realistic sample data for training and testing flood detection models without requiring access to real datasets. All generators support the Odisha, India bounding box and can be configured for different resolutions and scenarios.

## Available Generators

### 1. Rainfall Generator (`rainfall_generator.py`)

Generates synthetic daily rainfall data simulating IMD gridded format.

**Features:**
- Seasonal patterns (pre-monsoon, monsoon, post-monsoon, winter)
- Spatial correlation using sinusoidal patterns
- Extreme event simulation
- Time-series generation with configurable duration

**Usage:**
```python
from generators.rainfall_generator import RainfallGenerator
from datetime import datetime

bbox = (17.78, 22.57, 81.37, 87.53)
generator = RainfallGenerator(bbox=bbox, resolution=0.25)

rainfall_series, dates = generator.generate_time_series(
    start_date=datetime(2024, 7, 1),
    num_days=30,
    season='monsoon',
    event_day=15,
    event_intensity=4.0
)
```

**Output:** Daily rainfall grids (mm/day)

---

### 2. DEM Generator (`dem_generator.py`)

Creates Digital Elevation Models with realistic terrain features.

**Features:**
- Multiple terrain types (coastal, mountainous, plain, mixed)
- River valley generation
- Slope and aspect calculation
- Gaussian smoothing for realistic topography

**Usage:**
```python
from generators.dem_generator import DEMGenerator

generator = DEMGenerator(bbox=bbox, resolution=0.01)
dem = generator.generate_terrain(
    terrain_type='mixed',
    base_elevation=100.0,
    elevation_range=(0, 800)
)

slope = generator.calculate_slope(dem)
aspect = generator.calculate_aspect(dem)
```

**Output:** Elevation (meters), slope (degrees), aspect (degrees)

---

### 3. Satellite Imagery Generator (`satellite_generator.py`)

Generates synthetic SAR and optical satellite imagery.

**Features:**
- SAR image simulation (Sentinel-1 style)
- Pre/post-event image pairs
- Flood inundation masking
- Speckle noise simulation
- Optical RGB/multispectral images

**Usage:**
```python
from generators.satellite_generator import SatelliteImageryGenerator

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
```

**Output:** SAR backscatter images, flood masks

---

### 4. Population & Infrastructure Generator (`population_infrastructure_generator.py`)

Creates population density, vulnerability indices, and infrastructure data.

**Features:**
- Population density with urban/rural patterns
- Age distribution (children, youth, adults, elderly)
- Vulnerability index calculation
- Road network generation
- Building distribution (residential, commercial, critical facilities)
- Land use classification

**Usage:**
```python
from generators.population_infrastructure_generator import generate_complete_dataset

dataset = generate_complete_dataset(
    bbox=bbox,
    output_path=Path("data/sample/population_infrastructure"),
    resolution=0.05
)
```

**Output:** Population grids, road networks, building counts, land use maps

---

## Quick Start: Generate All Data

Run the master script to generate a complete sample dataset:

```bash
cd ml-service
python data/sample/generate_all.py
```

This creates:
```
data/sample/
├── rainfall/
│   ├── rainfall_data.npy
│   └── dates.npy
├── dem/
│   ├── dem.npy
│   ├── slope.npy
│   └── aspect.npy
├── satellite/
│   ├── sar_pre_event.npy
│   ├── sar_post_event.npy
│   └── flood_mask.npy
├── population_infrastructure/
│   ├── population_density.npy
│   ├── vulnerability_index.npy
│   ├── road_network.npy
│   ├── land_use.npy
│   └── critical_facilities.json
└── metadata.json
```

## Configuration

### Bounding Box (Odisha, India)
```python
bbox = (17.78, 22.57, 81.37, 87.53)  # (min_lat, max_lat, min_lon, max_lon)
```

### Resolutions
- **Rainfall:** 0.25° (~25 km) - matches IMD gridded data
- **DEM:** 0.01° (~1 km) - similar to SRTM 30m aggregated
- **Satellite:** 0.001° (~100 m) - Sentinel-1 resolution
- **Population:** 0.05° (~5 km) - WorldPop style

### Customization

Modify parameters in each generator:

```python
generator = RainfallGenerator(
    bbox=bbox,
    resolution=0.25,
    seed=42  # For reproducibility
)
```

## Data Formats

- **NumPy (.npy):** Primary format for raster data
- **CSV:** Alternative format for gridded data
- **JSON:** Metadata and point features
- **PNG:** Optional for imagery visualization

## Validation

Generated data includes:
- Spatial consistency checks
- Value range validation
- Metadata for traceability
- Statistical summaries in logs

## Notes

- All data is **synthetic** and intended for development/testing only
- Spatial patterns are plausible but not based on real observations
- Use real datasets (IMD, ERA5, Sentinel-1) for production models
- Generators use fixed seeds for reproducibility

## Dependencies

```python
numpy
scipy
loguru
Pillow  # For PNG export
```

See `requirements.txt` in project root for full dependencies.

---

**Generated:** 2026-10-04  
**Version:** 0.1.0
