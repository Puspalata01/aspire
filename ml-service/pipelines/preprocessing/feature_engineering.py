import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from utils.logger import get_logger
from pipelines.preprocessing.geospatial_preprocessor import GeospatialPreprocessor
from pipelines.preprocessing.timeseries_preprocessor import TimeSeriesPreprocessor
from pipelines.preprocessing.image_preprocessor import ImagePreprocessor
from pipelines.preprocessing.data_validator import DataValidator

logger = get_logger(__name__)


class FeatureEngineering:
    
    def __init__(self):
        self.geospatial = GeospatialPreprocessor()
        self.timeseries = TimeSeriesPreprocessor()
        self.image = ImagePreprocessor()
        self.validator = DataValidator()
        logger.info("Initialized FeatureEngineering pipeline")
    
    def create_flood_features(
        self,
        rainfall: np.ndarray,
        dem: np.ndarray,
        slope: Optional[np.ndarray] = None,
        land_use: Optional[np.ndarray] = None,
        population: Optional[np.ndarray] = None
    ) -> Tuple[np.ndarray, List[str]]:
        
        features = {}
        
        if rainfall.ndim == 3:
            features['rainfall_current'] = rainfall[-1]
            features['rainfall_7day'] = rainfall[-7:].mean(axis=0)
            features['rainfall_cumulative'] = rainfall.sum(axis=0)
            features['rainfall_max'] = rainfall.max(axis=0)
            
            if len(rainfall) > 1:
                features['rainfall_trend'] = rainfall[-1] - rainfall[-2]
        else:
            features['rainfall_current'] = rainfall
        
        features['elevation'] = dem
        features['elevation_normalized'] = (dem - dem.min()) / (dem.max() - dem.min() + 1e-8)
        
        if slope is None:
            dy, dx = np.gradient(dem)
            slope = np.sqrt(dx**2 + dy**2)
        features['slope'] = slope
        
        low_lying = (dem < np.percentile(dem, 25)).astype(np.float32)
        features['low_lying_area'] = low_lying
        
        if land_use is not None:
            water_bodies = (land_use == 4).astype(np.float32)
            features['water_bodies'] = water_bodies
            
            urban = (land_use == 1).astype(np.float32)
            features['urban_area'] = urban
        
        if population is not None:
            features['population_density'] = population
            pop_norm = (population - population.min()) / (population.max() - population.min() + 1e-8)
            features['population_normalized'] = pop_norm
        
        stacked, feature_names = self.geospatial.stack_features(features)
        
        logger.info(f"Created {len(feature_names)} flood prediction features")
        
        return stacked, feature_names
    
    def create_temporal_features(
        self,
        rainfall_series: np.ndarray,
        window_sizes: List[int] = [3, 7, 14, 30]
    ) -> Dict[str, np.ndarray]:
        
        features = {}
        
        for window in window_sizes:
            if len(rainfall_series) >= window:
                features[f'rainfall_mean_{window}d'] = np.array([
                    rainfall_series[max(0, i-window):i+1].mean(axis=0)
                    for i in range(len(rainfall_series))
                ])
                
                features[f'rainfall_max_{window}d'] = np.array([
                    rainfall_series[max(0, i-window):i+1].max(axis=0)
                    for i in range(len(rainfall_series))
                ])
                
                features[f'rainfall_std_{window}d'] = np.array([
                    rainfall_series[max(0, i-window):i+1].std(axis=0)
                    for i in range(len(rainfall_series))
                ])
        
        if len(rainfall_series) > 1:
            features['rainfall_velocity'] = np.gradient(rainfall_series, axis=0)
        
        if len(rainfall_series) > 2:
            features['rainfall_acceleration'] = np.gradient(
                np.gradient(rainfall_series, axis=0), axis=0
            )
        
        logger.info(f"Created {len(features)} temporal feature sets")
        
        return features
    
    def create_spatial_features(
        self,
        data: np.ndarray,
        bbox: Tuple[float, float, float, float],
        include_gradients: bool = True,
        include_distance: bool = True
    ) -> Dict[str, np.ndarray]:
        
        features = {}
        
        spatial_base = self.geospatial.create_spatial_features(data.shape[:2], bbox)
        features.update(spatial_base)
        
        if include_gradients:
            dy, dx = np.gradient(data)
            features['gradient_y'] = dy
            features['gradient_x'] = dx
            features['gradient_magnitude'] = np.sqrt(dx**2 + dy**2)
        
        if include_distance:
            from scipy.ndimage import distance_transform_edt
            
            if data.ndim == 2:
                binary_mask = data > np.percentile(data, 75)
            else:
                binary_mask = data[:, :, 0] > np.percentile(data[:, :, 0], 75)
            
            features['distance_to_high_values'] = distance_transform_edt(~binary_mask)
        
        logger.info(f"Created {len(features)} spatial features")
        
        return features
    
    def create_interaction_features(
        self,
        features_dict: Dict[str, np.ndarray],
        interaction_pairs: Optional[List[Tuple[str, str]]] = None
    ) -> Dict[str, np.ndarray]:
        
        interactions = {}
        
        if interaction_pairs is None:
            feature_names = list(features_dict.keys())
            interaction_pairs = []
            
            common_pairs = [
                ('rainfall', 'elevation'),
                ('rainfall', 'slope'),
                ('elevation', 'slope'),
                ('population', 'urban')
            ]
            
            for pair in common_pairs:
                matching = [
                    (k1, k2) for k1 in feature_names for k2 in feature_names
                    if pair[0] in k1.lower() and pair[1] in k2.lower() and k1 != k2
                ]
                interaction_pairs.extend(matching)
        
        for feat1_name, feat2_name in interaction_pairs:
            if feat1_name in features_dict and feat2_name in features_dict:
                feat1 = features_dict[feat1_name]
                feat2 = features_dict[feat2_name]
                
                if feat1.shape == feat2.shape:
                    interaction_name = f"{feat1_name}_x_{feat2_name}"
                    interactions[interaction_name] = feat1 * feat2
        
        logger.info(f"Created {len(interactions)} interaction features")
        
        return interactions
    
    def apply_feature_selection(
        self,
        features: np.ndarray,
        labels: np.ndarray,
        feature_names: List[str],
        method: str = 'correlation',
        top_k: Optional[int] = None
    ) -> Tuple[np.ndarray, List[str], np.ndarray]:
        
        if method == 'correlation':
            correlations = []
            
            for i in range(features.shape[-1]):
                feat = features[..., i].flatten()
                lab = labels.flatten()
                
                valid = np.isfinite(feat) & np.isfinite(lab)
                if valid.sum() > 0:
                    corr = np.corrcoef(feat[valid], lab[valid])[0, 1]
                    correlations.append(abs(corr))
                else:
                    correlations.append(0)
            
            correlations = np.array(correlations)
            
        elif method == 'variance':
            correlations = np.var(features.reshape(-1, features.shape[-1]), axis=0)
        
        else:
            correlations = np.ones(features.shape[-1])
        
        if top_k is not None:
            top_indices = np.argsort(correlations)[-top_k:]
        else:
            threshold = np.median(correlations)
            top_indices = np.where(correlations > threshold)[0]
        
        selected_features = features[..., top_indices]
        selected_names = [feature_names[i] for i in top_indices]
        
        logger.info(f"Selected {len(selected_names)} features using {method} method")
        
        return selected_features, selected_names, correlations
    
    def build_training_dataset(
        self,
        data_dict: Dict[str, np.ndarray],
        labels: np.ndarray,
        output_path: Path,
        train_split: float = 0.8,
        validation_split: float = 0.1
    ) -> Dict[str, Any]:
        
        logger.info("Building training dataset...")
        
        all_features = []
        all_feature_names = []
        
        for name, data in data_dict.items():
            if data.ndim == 2:
                all_features.append(data[..., np.newaxis])
                all_feature_names.append(name)
            elif data.ndim == 3:
                all_features.append(data)
                for i in range(data.shape[2]):
                    all_feature_names.append(f"{name}_{i}")
        
        X = np.concatenate(all_features, axis=2)
        y = labels
        
        total_samples = X.shape[0] * X.shape[1]
        X_flat = X.reshape(-1, X.shape[2])
        y_flat = y.reshape(-1)
        
        valid_mask = np.isfinite(X_flat).all(axis=1) & np.isfinite(y_flat)
        X_flat = X_flat[valid_mask]
        y_flat = y_flat[valid_mask]
        
        n_samples = len(X_flat)
        indices = np.random.permutation(n_samples)
        
        train_end = int(n_samples * train_split)
        val_end = int(n_samples * (train_split + validation_split))
        
        train_idx = indices[:train_end]
        val_idx = indices[train_end:val_end]
        test_idx = indices[val_end:]
        
        dataset = {
            'X_train': X_flat[train_idx],
            'y_train': y_flat[train_idx],
            'X_val': X_flat[val_idx],
            'y_val': y_flat[val_idx],
            'X_test': X_flat[test_idx],
            'y_test': y_flat[test_idx],
            'feature_names': all_feature_names,
            'original_shape': X.shape,
            'n_features': X.shape[2]
        }
        
        output_path.mkdir(parents=True, exist_ok=True)
        for key, value in dataset.items():
            if isinstance(value, np.ndarray):
                np.save(output_path / f"{key}.npy", value)
        
        import json
        metadata = {
            'feature_names': all_feature_names,
            'n_features': int(dataset['n_features']),
            'n_train': len(dataset['X_train']),
            'n_val': len(dataset['X_val']),
            'n_test': len(dataset['X_test']),
            'original_shape': list(X.shape),
            'train_split': train_split,
            'validation_split': validation_split
        }
        with open(output_path / 'metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Dataset saved to {output_path}")
        logger.info(f"  Train: {len(dataset['X_train'])} samples")
        logger.info(f"  Validation: {len(dataset['X_val'])} samples")
        logger.info(f"  Test: {len(dataset['X_test'])} samples")
        
        return dataset


if __name__ == "__main__":
    fe = FeatureEngineering()
    
    rainfall = np.random.rand(30, 100, 100) * 50
    dem = np.random.rand(100, 100) * 500
    labels = (rainfall[-1] > 30).astype(float)
    
    features, feature_names = fe.create_flood_features(
        rainfall=rainfall,
        dem=dem
    )
    
    print(f"Created features with shape: {features.shape}")
    print(f"Feature names: {feature_names[:5]}...")
