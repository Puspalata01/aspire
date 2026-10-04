# Preprocessing Pipeline

This module provides comprehensive data preprocessing capabilities for the Multi-Hazard ML Service.

## Components

### 1. GeospatialPreprocessor
Handles geospatial data transformations.

**Features:**
- Grid resampling and alignment
- Bounding box cropping
- Missing value interpolation
- Spatial feature creation
- Coordinate normalization

**Usage:**
```python
from pipelines.preprocessing.geospatial_preprocessor import GeospatialPreprocessor

preprocessor = GeospatialPreprocessor(target_crs="EPSG:4326")

aligned_grids = preprocessor.align_grids(
    [grid1, grid2],
    target_shape=(256, 256)
)

spatial_features = preprocessor.create_spatial_features(
    shape=(256, 256),
    bbox=(17.78, 22.57, 81.37, 87.53)
)
```

---

### 2. TimeSeriesPreprocessor
Processes temporal data and creates sequences.

**Features:**
- Normalization (z-score, minmax, robust)
- Sequence creation for LSTM/RNN models
- Temporal feature engineering
- Missing value handling
- Outlier detection and removal
- Smoothing filters

**Usage:**
```python
from pipelines.preprocessing.timeseries_preprocessor import TimeSeriesPreprocessor

preprocessor = TimeSeriesPreprocessor()

normalized, params = preprocessor.normalize(data, method='zscore')

X, y = preprocessor.create_sequences_multivariate(
    data,
    sequence_length=30,
    forecast_horizon=7
)
```

---

### 3. ImagePreprocessor
Processes satellite imagery and raster data.

**Features:**
- Resizing with multiple interpolation methods
- Normalization (standard, minmax, ImageNet)
- Augmentation (flip, rotate, brightness, contrast, noise)
- Patch creation and reconstruction
- Denoising filters
- Contrast enhancement (CLAHE, histogram equalization)

**Usage:**
```python
from pipelines.preprocessing.image_preprocessor import ImagePreprocessor

preprocessor = ImagePreprocessor(target_size=(256, 256))

resized = preprocessor.resize(image, size=(256, 256))
normalized = preprocessor.normalize(resized, method='0_1')

augmented = preprocessor.augment(
    image,
    horizontal_flip=True,
    rotate=15,
    brightness=30
)

patches = preprocessor.create_patches(
    image,
    patch_size=(128, 128),
    stride=(64, 64)
)
```

---

### 4. DataValidator
Validates data quality and consistency.

**Features:**
- Shape validation
- Value range checking
- Geospatial consistency validation
- Time series validation
- Quality scoring
- Outlier detection
- Comprehensive quality reports

**Usage:**
```python
from pipelines.preprocessing.data_validator import DataValidator

validator = DataValidator()

passed, msg = validator.validate_shape(data, expected_shape=(256, 256))
passed, msg = validator.validate_range(data, min_value=0, max_value=255)

quality = validator.check_data_quality(
    data,
    max_missing_percentage=0.1,
    max_outlier_percentage=0.05
)

report = validator.generate_quality_report(data, name="rainfall")
```

---

### 5. FeatureEngineering
Creates domain-specific features for flood detection.

**Features:**
- Flood-specific features (rainfall aggregations, low-lying areas)
- Temporal features (rolling statistics, velocity, acceleration)
- Spatial features (gradients, distance transforms)
- Interaction features
- Feature selection
- Training dataset builder

**Usage:**
```python
from pipelines.preprocessing.feature_engineering import FeatureEngineering

fe = FeatureEngineering()

features, feature_names = fe.create_flood_features(
    rainfall=rainfall_data,
    dem=elevation_data,
    slope=slope_data,
    land_use=land_use_data,
    population=population_data
)

temporal_features = fe.create_temporal_features(
    rainfall_series,
    window_sizes=[3, 7, 14, 30]
)

dataset = fe.build_training_dataset(
    data_dict=features_dict,
    labels=flood_labels,
    output_path=Path("data/processed/dataset"),
    train_split=0.7,
    validation_split=0.15
)
```

---

### 6. PreprocessingPipeline
End-to-end preprocessing orchestration.

**Features:**
- Automated data loading
- Multi-step validation
- Grid alignment
- Dataset-specific preprocessing
- Feature engineering
- Training dataset creation

**Usage:**
```python
from pipelines.preprocessing.preprocessing_pipeline import PreprocessingPipeline

pipeline = PreprocessingPipeline()

dataset = pipeline.process_flood_data(
    data_paths={
        'rainfall_data': 'data/sample/rainfall/rainfall_data.npy',
        'dem': 'data/sample/dem/dem.npy',
        'flood_mask': 'data/sample/satellite/flood_mask.npy'
    },
    output_path=Path("data/processed/flood_dataset"),
    target_shape=(256, 256)
)

dataset = pipeline.process_sample_data()
```

---

## Pipeline Workflow

```
Raw Data
   ↓
1. Load & Validate
   ↓
2. Align Grids (spatial alignment)
   ↓
3. Preprocess (normalization, cleaning)
   ↓
4. Feature Engineering (domain features)
   ↓
5. Build Dataset (train/val/test split)
   ↓
Processed Dataset
```

---

## Output Format

The preprocessing pipeline generates:

```
data/processed/flood_dataset/
├── X_train.npy          # Training features
├── y_train.npy          # Training labels
├── X_val.npy            # Validation features
├── y_val.npy            # Validation labels
├── X_test.npy           # Test features
├── y_test.npy           # Test labels
└── metadata.json        # Feature names, shapes, splits
```

---

## Configuration

Preprocessing parameters are configured in `config/config.yaml`:

```yaml
paths:
  raw_data: "./data/raw"
  processed_data: "./data/processed"
  sample_data: "./data/sample"

geography:
  bbox:
    min_lat: 17.78
    max_lat: 22.57
    min_lon: 81.37
    max_lon: 87.53

flood:
  image_size: 256
```

---

## Quick Start

### Process Sample Data

```bash
cd ml-service

# Generate sample data first
python data/sample/generate_all.py

# Run preprocessing pipeline
python pipelines/preprocessing/preprocessing_pipeline.py
```

### Custom Preprocessing

```python
from pipelines.preprocessing import (
    GeospatialPreprocessor,
    TimeSeriesPreprocessor,
    ImagePreprocessor,
    FeatureEngineering
)

geo = GeospatialPreprocessor()
ts = TimeSeriesPreprocessor()
img = ImagePreprocessor()
fe = FeatureEngineering()

aligned = geo.align_grids([rainfall, dem], target_shape=(256, 256))

normalized_rain, params = ts.normalize(aligned[0], method='minmax')

features, names = fe.create_flood_features(
    rainfall=normalized_rain,
    dem=aligned[1]
)
```

---

## Dependencies

```
numpy
scipy
opencv-python (cv2)
rasterio
```

See `requirements.txt` for versions.

---

## Testing

```bash
# Test individual components
python pipelines/preprocessing/geospatial_preprocessor.py
python pipelines/preprocessing/timeseries_preprocessor.py
python pipelines/preprocessing/image_preprocessor.py

# Test full pipeline
python pipelines/preprocessing/preprocessing_pipeline.py
```

---

## Notes

- All preprocessors handle NaN and infinite values
- Spatial alignment uses bilinear interpolation by default
- Feature engineering is customizable per hazard type
- Validation reports include quality scores and statistics
- Pipeline is modular - use components independently or together

---

**Version:** 0.1.0  
**Last Updated:** 2026-10-04
