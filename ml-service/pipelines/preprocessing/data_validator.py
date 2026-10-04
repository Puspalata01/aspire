import numpy as np
from typing import Tuple, Optional, Dict, Any
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)


class DataValidator:
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        logger.info("Initialized DataValidator")
    
    def validate_shape(
        self,
        data: np.ndarray,
        expected_shape: Optional[Tuple[int, ...]] = None,
        min_dims: Optional[int] = None,
        max_dims: Optional[int] = None
    ) -> Tuple[bool, str]:
        
        if expected_shape is not None:
            if data.shape != expected_shape:
                return False, f"Shape mismatch: expected {expected_shape}, got {data.shape}"
        
        if min_dims is not None and len(data.shape) < min_dims:
            return False, f"Insufficient dimensions: expected at least {min_dims}, got {len(data.shape)}"
        
        if max_dims is not None and len(data.shape) > max_dims:
            return False, f"Too many dimensions: expected at most {max_dims}, got {len(data.shape)}"
        
        return True, "Shape validation passed"
    
    def validate_range(
        self,
        data: np.ndarray,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        allow_nan: bool = False,
        allow_inf: bool = False
    ) -> Tuple[bool, str]:
        
        if not allow_nan and np.isnan(data).any():
            nan_count = np.isnan(data).sum()
            return False, f"Data contains {nan_count} NaN values"
        
        if not allow_inf and np.isinf(data).any():
            inf_count = np.isinf(data).sum()
            return False, f"Data contains {inf_count} infinite values"
        
        finite_data = data[np.isfinite(data)]
        
        if len(finite_data) > 0:
            if min_value is not None and finite_data.min() < min_value:
                return False, f"Data minimum {finite_data.min()} below threshold {min_value}"
            
            if max_value is not None and finite_data.max() > max_value:
                return False, f"Data maximum {finite_data.max()} above threshold {max_value}"
        
        return True, "Range validation passed"
    
    def validate_geospatial(
        self,
        data: np.ndarray,
        bbox: Tuple[float, float, float, float],
        resolution: float,
        tolerance: float = 0.01
    ) -> Tuple[bool, str]:
        
        min_lat, max_lat, min_lon, max_lon = bbox
        
        expected_lat_points = int((max_lat - min_lat) / resolution)
        expected_lon_points = int((max_lon - min_lon) / resolution)
        
        if data.shape[0] < expected_lat_points * (1 - tolerance) or \
           data.shape[0] > expected_lat_points * (1 + tolerance):
            return False, f"Latitude dimension mismatch: expected ~{expected_lat_points}, got {data.shape[0]}"
        
        if data.shape[1] < expected_lon_points * (1 - tolerance) or \
           data.shape[1] > expected_lon_points * (1 + tolerance):
            return False, f"Longitude dimension mismatch: expected ~{expected_lon_points}, got {data.shape[1]}"
        
        return True, "Geospatial validation passed"
    
    def validate_timeseries(
        self,
        data: np.ndarray,
        expected_length: Optional[int] = None,
        min_length: Optional[int] = None,
        check_monotonic: bool = False,
        timestamps: Optional[np.ndarray] = None
    ) -> Tuple[bool, str]:
        
        if expected_length is not None and len(data) != expected_length:
            return False, f"Length mismatch: expected {expected_length}, got {len(data)}"
        
        if min_length is not None and len(data) < min_length:
            return False, f"Insufficient length: expected at least {min_length}, got {len(data)}"
        
        if check_monotonic and timestamps is not None:
            if not np.all(timestamps[1:] > timestamps[:-1]):
                return False, "Timestamps are not monotonically increasing"
        
        return True, "Time series validation passed"
    
    def check_data_quality(
        self,
        data: np.ndarray,
        max_missing_percentage: float = 0.1,
        max_outlier_percentage: float = 0.05,
        outlier_threshold: float = 3.0
    ) -> Dict[str, Any]:
        
        total_elements = data.size
        
        missing_mask = np.isnan(data) | np.isinf(data)
        missing_count = missing_mask.sum()
        missing_percentage = missing_count / total_elements
        
        finite_data = data[np.isfinite(data)]
        if len(finite_data) > 0:
            z_scores = np.abs((finite_data - finite_data.mean()) / (finite_data.std() + 1e-8))
            outliers = z_scores > outlier_threshold
            outlier_count = outliers.sum()
            outlier_percentage = outlier_count / len(finite_data)
        else:
            outlier_count = 0
            outlier_percentage = 0
        
        quality_score = 1.0 - (missing_percentage + outlier_percentage) / 2
        
        quality_report = {
            'total_elements': total_elements,
            'missing_count': int(missing_count),
            'missing_percentage': float(missing_percentage),
            'outlier_count': int(outlier_count),
            'outlier_percentage': float(outlier_percentage),
            'quality_score': float(quality_score),
            'passed': missing_percentage <= max_missing_percentage and 
                     outlier_percentage <= max_outlier_percentage
        }
        
        logger.info(f"Data quality check: score={quality_score:.2f}, "
                   f"missing={missing_percentage:.2%}, outliers={outlier_percentage:.2%}")
        
        return quality_report
    
    def validate_dataset(
        self,
        dataset: Dict[str, np.ndarray],
        schema: Dict[str, Dict[str, Any]]
    ) -> Tuple[bool, Dict[str, str]]:
        
        results = {}
        all_passed = True
        
        for name, requirements in schema.items():
            if name not in dataset:
                results[name] = "Missing from dataset"
                all_passed = False
                continue
            
            data = dataset[name]
            
            if 'shape' in requirements:
                passed, msg = self.validate_shape(data, expected_shape=requirements['shape'])
                if not passed:
                    results[name] = msg
                    all_passed = False
                    continue
            
            if 'min_value' in requirements or 'max_value' in requirements:
                passed, msg = self.validate_range(
                    data,
                    min_value=requirements.get('min_value'),
                    max_value=requirements.get('max_value'),
                    allow_nan=requirements.get('allow_nan', False)
                )
                if not passed:
                    results[name] = msg
                    all_passed = False
                    continue
            
            if 'bbox' in requirements and 'resolution' in requirements:
                passed, msg = self.validate_geospatial(
                    data,
                    bbox=requirements['bbox'],
                    resolution=requirements['resolution']
                )
                if not passed:
                    results[name] = msg
                    all_passed = False
                    continue
            
            results[name] = "Validation passed"
        
        logger.info(f"Dataset validation: {sum(1 for v in results.values() if v == 'Validation passed')}/{len(schema)} passed")
        
        return all_passed, results
    
    def generate_quality_report(
        self,
        data: np.ndarray,
        name: str = "dataset"
    ) -> Dict[str, Any]:
        
        report = {
            'name': name,
            'shape': data.shape,
            'dtype': str(data.dtype),
            'size': data.size,
            'memory_mb': data.nbytes / (1024 * 1024)
        }
        
        finite_data = data[np.isfinite(data)]
        
        if len(finite_data) > 0:
            report.update({
                'min': float(finite_data.min()),
                'max': float(finite_data.max()),
                'mean': float(finite_data.mean()),
                'median': float(np.median(finite_data)),
                'std': float(finite_data.std()),
                'percentile_25': float(np.percentile(finite_data, 25)),
                'percentile_75': float(np.percentile(finite_data, 75))
            })
        
        report.update({
            'nan_count': int(np.isnan(data).sum()),
            'inf_count': int(np.isinf(data).sum()),
            'zero_count': int((data == 0).sum()),
            'unique_values': len(np.unique(data[np.isfinite(data)])) if len(finite_data) > 0 else 0
        })
        
        quality = self.check_data_quality(data)
        report['quality'] = quality
        
        return report


if __name__ == "__main__":
    validator = DataValidator()
    
    data = np.random.randn(100, 100) * 50 + 100
    data[10:15, 10:15] = np.nan
    
    passed, msg = validator.validate_shape(data, expected_shape=(100, 100))
    print(f"Shape validation: {passed} - {msg}")
    
    passed, msg = validator.validate_range(data, min_value=0, max_value=200, allow_nan=True)
    print(f"Range validation: {passed} - {msg}")
    
    quality = validator.check_data_quality(data)
    print(f"Quality score: {quality['quality_score']:.2f}")
    
    report = validator.generate_quality_report(data, name="test_data")
    print(f"\nQuality report:")
    for key, value in report.items():
        if key != 'quality':
            print(f"  {key}: {value}")
