from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from pipelines.preprocessing.geospatial_preprocessor import GeospatialPreprocessor
from pipelines.preprocessing.timeseries_preprocessor import TimeSeriesPreprocessor
from pipelines.preprocessing.image_preprocessor import ImagePreprocessor
from pipelines.preprocessing.data_validator import DataValidator
from pipelines.preprocessing.feature_engineering import FeatureEngineering
from utils.logger import get_logger, setup_logging
from utils.config_loader import config
import numpy as np

setup_logging()
logger = get_logger(__name__)


class PreprocessingPipeline:
    
    def __init__(self):
        self.geospatial = GeospatialPreprocessor()
        self.timeseries = TimeSeriesPreprocessor()
        self.image = ImagePreprocessor()
        self.validator = DataValidator()
        self.feature_engineering = FeatureEngineering()
        
        self.bbox = (
            config.get('geography.bbox.min_lat'),
            config.get('geography.bbox.max_lat'),
            config.get('geography.bbox.min_lon'),
            config.get('geography.bbox.max_lon')
        )
        
        logger.info("Initialized PreprocessingPipeline")
    
    def process_flood_data(
        self,
        data_paths: dict,
        output_path: Path,
        target_shape: tuple = (256, 256)
    ) -> dict:
        
        logger.info("="*60)
        logger.info("Starting Flood Data Preprocessing Pipeline")
        logger.info("="*60)
        
        logger.info("\n[Step 1/6] Loading raw data...")
        raw_data = self._load_raw_data(data_paths)
        
        logger.info("\n[Step 2/6] Validating data quality...")
        validation_results = self._validate_data(raw_data)
        
        logger.info("\n[Step 3/6] Aligning spatial grids...")
        aligned_data = self._align_grids(raw_data, target_shape)
        
        logger.info("\n[Step 4/6] Preprocessing individual datasets...")
        processed_data = self._preprocess_datasets(aligned_data)
        
        logger.info("\n[Step 5/6] Engineering features...")
        features = self._engineer_features(processed_data)
        
        logger.info("\n[Step 6/6] Building training dataset...")
        dataset = self._build_dataset(features, processed_data, output_path)
        
        logger.info("\n" + "="*60)
        logger.info("Preprocessing Pipeline Completed Successfully")
        logger.info("="*60)
        
        return dataset
    
    def _load_raw_data(self, data_paths: dict) -> dict:
        
        raw_data = {}
        
        for key, path in data_paths.items():
            path = Path(path)
            
            if path.suffix == '.npy':
                raw_data[key] = np.load(path)
                logger.info(f"  ✓ Loaded {key}: {raw_data[key].shape}")
            elif path.suffix == '.csv':
                raw_data[key] = np.loadtxt(path, delimiter=',')
                logger.info(f"  ✓ Loaded {key}: {raw_data[key].shape}")
            else:
                logger.warning(f"  ✗ Unsupported format for {key}: {path.suffix}")
        
        return raw_data
    
    def _validate_data(self, raw_data: dict) -> dict:
        
        validation_results = {}
        
        for name, data in raw_data.items():
            quality_report = self.validator.generate_quality_report(data, name=name)
            validation_results[name] = quality_report
            
            if quality_report['quality']['passed']:
                logger.info(f"  ✓ {name}: Quality score {quality_report['quality']['quality_score']:.2f}")
            else:
                logger.warning(f"  ⚠ {name}: Quality issues detected")
        
        return validation_results
    
    def _align_grids(self, raw_data: dict, target_shape: tuple) -> dict:
        
        aligned_data = {}
        
        for name, data in raw_data.items():
            if data.ndim >= 2:
                if data.ndim == 2:
                    aligned = self.geospatial.resample_grid(
                        data, data.shape, target_shape, method='bilinear'
                    )
                elif data.ndim == 3:
                    aligned = np.stack([
                        self.geospatial.resample_grid(
                            data[i], data[i].shape, target_shape, method='bilinear'
                        ) for i in range(data.shape[0])
                    ])
                else:
                    aligned = data
                
                aligned_data[name] = aligned
                logger.info(f"  ✓ {name}: {data.shape} → {aligned.shape}")
            else:
                aligned_data[name] = data
        
        return aligned_data
    
    def _preprocess_datasets(self, aligned_data: dict) -> dict:
        
        processed = {}
        
        for name, data in aligned_data.items():
            data_clean = self.geospatial.fill_missing_values(
                data, method='interpolate'
            )
            
            if 'rainfall' in name.lower():
                data_clean = self.timeseries.handle_missing_values(
                    data_clean, method='interpolate'
                )
                normalized, params = self.timeseries.normalize(
                    data_clean, method='minmax'
                )
                processed[name] = normalized
                processed[f"{name}_params"] = params
            
            elif 'dem' in name.lower() or 'elevation' in name.lower():
                normalized = (data_clean - data_clean.min()) / (data_clean.max() - data_clean.min() + 1e-8)
                processed[name] = normalized
            
            elif 'sar' in name.lower() or 'satellite' in name.lower():
                normalized = self.image.normalize(data_clean, method='minmax')
                processed[name] = normalized
            
            else:
                processed[name] = data_clean
            
            logger.info(f"  ✓ Preprocessed {name}")
        
        return processed
    
    def _engineer_features(self, processed_data: dict) -> dict:
        
        features = {}
        
        rainfall_keys = [k for k in processed_data.keys() if 'rainfall' in k.lower() and 'params' not in k]
        dem_keys = [k for k in processed_data.keys() if 'dem' in k.lower() or 'elevation' in k.lower()]
        
        if rainfall_keys and dem_keys:
            rainfall = processed_data[rainfall_keys[0]]
            dem = processed_data[dem_keys[0]]
            
            slope_keys = [k for k in processed_data.keys() if 'slope' in k.lower()]
            slope = processed_data[slope_keys[0]] if slope_keys else None
            
            land_use_keys = [k for k in processed_data.keys() if 'land_use' in k.lower()]
            land_use = processed_data[land_use_keys[0]] if land_use_keys else None
            
            pop_keys = [k for k in processed_data.keys() if 'population' in k.lower()]
            population = processed_data[pop_keys[0]] if pop_keys else None
            
            flood_features, feature_names = self.feature_engineering.create_flood_features(
                rainfall=rainfall,
                dem=dem,
                slope=slope,
                land_use=land_use,
                population=population
            )
            
            features['flood_features'] = flood_features
            features['feature_names'] = feature_names
            
            logger.info(f"  ✓ Created {len(feature_names)} flood features")
        
        if rainfall_keys:
            rainfall = processed_data[rainfall_keys[0]]
            if rainfall.ndim == 3:
                temporal_features = self.feature_engineering.create_temporal_features(
                    rainfall, window_sizes=[3, 7, 14]
                )
                features['temporal_features'] = temporal_features
                logger.info(f"  ✓ Created {len(temporal_features)} temporal feature sets")
        
        spatial_features = self.feature_engineering.create_spatial_features(
            processed_data[list(processed_data.keys())[0]],
            self.bbox,
            include_gradients=True,
            include_distance=False
        )
        features['spatial_features'] = spatial_features
        logger.info(f"  ✓ Created {len(spatial_features)} spatial features")
        
        return features
    
    def _build_dataset(self, features: dict, processed_data: dict, output_path: Path) -> dict:
        
        flood_mask_keys = [k for k in processed_data.keys() if 'flood_mask' in k.lower() or 'label' in k.lower()]
        
        if flood_mask_keys:
            labels = processed_data[flood_mask_keys[0]]
            if labels.max() > 1:
                labels = (labels > 128).astype(float)
        else:
            rainfall_keys = [k for k in processed_data.keys() if 'rainfall' in k.lower() and 'params' not in k]
            if rainfall_keys:
                rainfall = processed_data[rainfall_keys[0]]
                if rainfall.ndim == 3:
                    labels = (rainfall[-1] > 0.7).astype(float)
                else:
                    labels = (rainfall > 0.7).astype(float)
            else:
                logger.warning("  ⚠ No labels found, creating dummy labels")
                sample_data = processed_data[list(processed_data.keys())[0]]
                labels = np.zeros(sample_data.shape[:2])
        
        if 'flood_features' in features:
            feature_data = {'features': features['flood_features']}
        else:
            feature_data = {k: v for k, v in processed_data.items() if 'params' not in k}
        
        dataset = self.feature_engineering.build_training_dataset(
            data_dict=feature_data,
            labels=labels,
            output_path=output_path,
            train_split=0.7,
            validation_split=0.15
        )
        
        return dataset
    
    def process_sample_data(self, output_path: Path = None) -> dict:
        
        if output_path is None:
            output_path = Path(config.get('paths.processed_data')) / 'flood_dataset'
        
        sample_data_path = Path(config.get('paths.sample_data'))
        
        data_paths = {
            'rainfall_data': sample_data_path / 'rainfall' / 'rainfall_data.npy',
            'dem': sample_data_path / 'dem' / 'dem.npy',
            'slope': sample_data_path / 'dem' / 'slope.npy',
            'sar_post_event': sample_data_path / 'satellite' / 'sar_post_event.npy',
            'flood_mask': sample_data_path / 'satellite' / 'flood_mask.npy',
        }
        
        existing_paths = {k: v for k, v in data_paths.items() if Path(v).exists()}
        
        if not existing_paths:
            logger.error("No sample data found. Run data/sample/generate_all.py first.")
            raise FileNotFoundError("Sample data not found")
        
        logger.info(f"Found {len(existing_paths)} data files")
        
        dataset = self.process_flood_data(
            data_paths=existing_paths,
            output_path=output_path,
            target_shape=(256, 256)
        )
        
        return dataset


if __name__ == "__main__":
    pipeline = PreprocessingPipeline()
    
    output_path = Path("data/processed/flood_dataset")
    
    try:
        dataset = pipeline.process_sample_data(output_path)
        
        print("\n" + "="*60)
        print("Dataset Summary:")
        print("="*60)
        print(f"Training samples: {dataset['X_train'].shape}")
        print(f"Validation samples: {dataset['X_val'].shape}")
        print(f"Test samples: {dataset['X_test'].shape}")
        print(f"Number of features: {dataset['n_features']}")
        print(f"Output path: {output_path}")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        print(f"\nError: {e}")
        print("Make sure to generate sample data first:")
        print("  python data/sample/generate_all.py")
