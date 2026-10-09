import numpy as np
from typing import Tuple, Optional, Union
from pathlib import Path
from scipy.ndimage import zoom
import rasterio
from rasterio.transform import from_bounds
from utils.logger import get_logger

logger = get_logger(__name__)


class GeospatialPreprocessor:
    
    def __init__(self, target_crs: str = "EPSG:4326"):
        self.target_crs = target_crs
        logger.info(f"Initialized GeospatialPreprocessor with CRS: {target_crs}")
    
    def resample_grid(
        self,
        data: np.ndarray,
        source_shape: Tuple[int, int],
        target_shape: Tuple[int, int],
        method: str = 'bilinear'
    ) -> np.ndarray:
        
        if source_shape == target_shape:
            return data
        
        zoom_factors = (
            target_shape[0] / source_shape[0],
            target_shape[1] / source_shape[1]
        )
        
        if method == 'bilinear':
            order = 1
        elif method == 'cubic':
            order = 3
        elif method == 'nearest':
            order = 0
        else:
            order = 1
        
        resampled = zoom(data, zoom_factors, order=order)
        
        logger.debug(f"Resampled from {source_shape} to {target_shape} using {method}")
        
        return resampled
    
    def align_grids(
        self,
        grids: list,
        target_shape: Tuple[int, int],
        method: str = 'bilinear'
    ) -> list:
        
        aligned_grids = []
        
        for i, grid in enumerate(grids):
            if grid.shape[:2] != target_shape:
                if grid.ndim == 2:
                    aligned = self.resample_grid(grid, grid.shape, target_shape, method)
                elif grid.ndim == 3:
                    aligned = np.stack([
                        self.resample_grid(grid[:, :, c], grid.shape[:2], target_shape, method)
                        for c in range(grid.shape[2])
                    ], axis=2)
                else:
                    raise ValueError(f"Unsupported grid dimensions: {grid.ndim}")
                
                aligned_grids.append(aligned)
            else:
                aligned_grids.append(grid)
        
        logger.info(f"Aligned {len(grids)} grids to shape {target_shape}")
        
        return aligned_grids
    
    def crop_to_bbox(
        self,
        data: np.ndarray,
        source_bbox: Tuple[float, float, float, float],
        target_bbox: Tuple[float, float, float, float]
    ) -> np.ndarray:
        
        src_min_lat, src_max_lat, src_min_lon, src_max_lon = source_bbox
        tgt_min_lat, tgt_max_lat, tgt_min_lon, tgt_max_lon = target_bbox
        
        lat_resolution = (src_max_lat - src_min_lat) / data.shape[0]
        lon_resolution = (src_max_lon - src_min_lon) / data.shape[1]
        
        start_row = int((tgt_min_lat - src_min_lat) / lat_resolution)
        end_row = int((tgt_max_lat - src_min_lat) / lat_resolution)
        start_col = int((tgt_min_lon - src_min_lon) / lon_resolution)
        end_col = int((tgt_max_lon - src_min_lon) / lon_resolution)
        
        start_row = max(0, start_row)
        end_row = min(data.shape[0], end_row)
        start_col = max(0, start_col)
        end_col = min(data.shape[1], end_col)
        
        cropped = data[start_row:end_row, start_col:end_col]
        
        logger.info(f"Cropped data from {data.shape} to {cropped.shape}")
        
        return cropped
    
    def fill_missing_values(
        self,
        data: np.ndarray,
        method: str = 'interpolate',
        fill_value: Optional[float] = None
    ) -> np.ndarray:
        
        mask = np.isnan(data) | np.isinf(data)
        
        if not mask.any():
            return data
        
        filled = data.copy()
        
        if method == 'zero':
            filled[mask] = 0
        elif method == 'mean':
            filled[mask] = np.nanmean(data)
        elif method == 'median':
            filled[mask] = np.nanmedian(data)
        elif method == 'interpolate':
            from scipy.interpolate import griddata
            
            valid_points = np.argwhere(~mask)
            valid_values = data[~mask]
            missing_points = np.argwhere(mask)
            
            if len(valid_points) > 0 and len(missing_points) > 0:
                interpolated = griddata(
                    valid_points,
                    valid_values,
                    missing_points,
                    method='nearest'
                )
                filled[mask] = interpolated
        elif method == 'constant' and fill_value is not None:
            filled[mask] = fill_value
        else:
            filled[mask] = 0
        
        logger.info(f"Filled {mask.sum()} missing values using {method}")
        
        return filled
    
    def normalize_coordinates(
        self,
        lat: np.ndarray,
        lon: np.ndarray,
        bbox: Tuple[float, float, float, float]
    ) -> Tuple[np.ndarray, np.ndarray]:
        
        min_lat, max_lat, min_lon, max_lon = bbox
        
        lat_norm = (lat - min_lat) / (max_lat - min_lat)
        lon_norm = (lon - min_lon) / (max_lon - min_lon)
        
        return lat_norm, lon_norm
    
    def create_spatial_features(
        self,
        shape: Tuple[int, int],
        bbox: Tuple[float, float, float, float]
    ) -> dict:
        
        min_lat, max_lat, min_lon, max_lon = bbox
        
        lats = np.linspace(min_lat, max_lat, shape[0])
        lons = np.linspace(min_lon, max_lon, shape[1])
        
        lat_grid, lon_grid = np.meshgrid(lats, lons, indexing='ij')
        
        lat_norm, lon_norm = self.normalize_coordinates(lat_grid, lon_grid, bbox)
        
        center_lat = (min_lat + max_lat) / 2
        center_lon = (min_lon + max_lon) / 2
        
        distance_from_center = np.sqrt(
            (lat_grid - center_lat)**2 + (lon_grid - center_lon)**2
        )
        
        return {
            'latitude': lat_grid,
            'longitude': lon_grid,
            'latitude_normalized': lat_norm,
            'longitude_normalized': lon_norm,
            'distance_from_center': distance_from_center
        }
    
    def stack_features(
        self,
        feature_dict: dict,
        feature_names: Optional[list] = None
    ) -> Tuple[np.ndarray, list]:
        
        if feature_names is None:
            feature_names = list(feature_dict.keys())
        
        features = []
        used_names = []
        
        for name in feature_names:
            if name in feature_dict:
                data = feature_dict[name]
                
                if data.ndim == 2:
                    features.append(data[..., np.newaxis])
                    used_names.append(name)
                elif data.ndim == 3:
                    features.append(data)
                    for i in range(data.shape[2]):
                        used_names.append(f"{name}_{i}")
        
        stacked = np.concatenate(features, axis=2)
        
        logger.info(f"Stacked {len(used_names)} features into shape {stacked.shape}")
        
        return stacked, used_names
    
    def save_preprocessed(
        self,
        data: np.ndarray,
        output_path: Path,
        metadata: Optional[dict] = None
    ):
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        np.save(output_path, data)
        
        if metadata:
            import json
            metadata_path = output_path.with_suffix('.json')
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        logger.info(f"Saved preprocessed data to {output_path}")
    
    def load_preprocessed(
        self,
        input_path: Path
    ) -> Tuple[np.ndarray, Optional[dict]]:
        
        data = np.load(input_path)
        
        metadata = None
        metadata_path = input_path.with_suffix('.json')
        if metadata_path.exists():
            import json
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        
        logger.info(f"Loaded preprocessed data from {input_path}")
        
        return data, metadata


if __name__ == "__main__":
    bbox = (17.78, 22.57, 81.37, 87.53)
    
    preprocessor = GeospatialPreprocessor()
    
    grid1 = np.random.rand(100, 100)
    grid2 = np.random.rand(200, 200)
    
    aligned = preprocessor.align_grids([grid1, grid2], target_shape=(256, 256))
    
    spatial_features = preprocessor.create_spatial_features((256, 256), bbox)
    
    print(f"Aligned grids: {[g.shape for g in aligned]}")
    print(f"Spatial features: {list(spatial_features.keys())}")
