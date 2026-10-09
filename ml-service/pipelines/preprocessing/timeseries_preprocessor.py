import numpy as np
from typing import Tuple, Optional, Union
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)


class TimeSeriesPreprocessor:
    
    def __init__(self):
        logger.info("Initialized TimeSeriesPreprocessor")
    
    def normalize(
        self,
        data: np.ndarray,
        method: str = 'zscore',
        axis: Optional[int] = None,
        epsilon: float = 1e-8
    ) -> Tuple[np.ndarray, dict]:
        
        if method == 'zscore':
            mean = np.mean(data, axis=axis, keepdims=True)
            std = np.std(data, axis=axis, keepdims=True)
            normalized = (data - mean) / (std + epsilon)
            params = {'mean': mean, 'std': std, 'method': 'zscore'}
        
        elif method == 'minmax':
            min_val = np.min(data, axis=axis, keepdims=True)
            max_val = np.max(data, axis=axis, keepdims=True)
            normalized = (data - min_val) / (max_val - min_val + epsilon)
            params = {'min': min_val, 'max': max_val, 'method': 'minmax'}
        
        elif method == 'robust':
            median = np.median(data, axis=axis, keepdims=True)
            q75, q25 = np.percentile(data, [75, 25], axis=axis, keepdims=True)
            iqr = q75 - q25
            normalized = (data - median) / (iqr + epsilon)
            params = {'median': median, 'iqr': iqr, 'method': 'robust'}
        
        else:
            raise ValueError(f"Unknown normalization method: {method}")
        
        logger.info(f"Normalized data using {method} method")
        
        return normalized, params
    
    def denormalize(
        self,
        data: np.ndarray,
        params: dict
    ) -> np.ndarray:
        
        method = params['method']
        
        if method == 'zscore':
            denormalized = data * params['std'] + params['mean']
        elif method == 'minmax':
            denormalized = data * (params['max'] - params['min']) + params['min']
        elif method == 'robust':
            denormalized = data * params['iqr'] + params['median']
        else:
            raise ValueError(f"Unknown normalization method: {method}")
        
        return denormalized
    
    def create_sequences(
        self,
        data: np.ndarray,
        sequence_length: int,
        forecast_horizon: int = 1,
        stride: int = 1
    ) -> Tuple[np.ndarray, np.ndarray]:
        
        X, y = [], []
        
        for i in range(0, len(data) - sequence_length - forecast_horizon + 1, stride):
            X.append(data[i:i + sequence_length])
            y.append(data[i + sequence_length:i + sequence_length + forecast_horizon])
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Created {len(X)} sequences with length {sequence_length}, horizon {forecast_horizon}")
        
        return X, y
    
    def create_sequences_multivariate(
        self,
        data: np.ndarray,
        sequence_length: int,
        forecast_horizon: int = 1,
        target_features: Optional[list] = None,
        stride: int = 1
    ) -> Tuple[np.ndarray, np.ndarray]:
        
        X, y = [], []
        
        for i in range(0, len(data) - sequence_length - forecast_horizon + 1, stride):
            X.append(data[i:i + sequence_length])
            
            if target_features is not None:
                y.append(data[i + sequence_length:i + sequence_length + forecast_horizon, target_features])
            else:
                y.append(data[i + sequence_length:i + sequence_length + forecast_horizon])
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Created {len(X)} multivariate sequences: X shape {X.shape}, y shape {y.shape}")
        
        return X, y
    
    def add_temporal_features(
        self,
        data: np.ndarray,
        timestamps: Optional[np.ndarray] = None,
        add_day_of_year: bool = True,
        add_day_of_week: bool = False,
        add_month: bool = True
    ) -> np.ndarray:
        
        if timestamps is None:
            timestamps = np.arange(len(data))
        
        features = []
        
        if data.ndim == 2:
            features.append(data)
        elif data.ndim == 3:
            features.append(data)
        
        temporal_feats = []
        
        if add_day_of_year:
            day_of_year = (timestamps % 365) / 365.0
            if data.ndim == 3:
                day_of_year = np.repeat(day_of_year[:, np.newaxis, np.newaxis], data.shape[1], axis=1)
                day_of_year = np.repeat(day_of_year, 1, axis=2)
            temporal_feats.append(day_of_year)
        
        if add_day_of_week:
            day_of_week = (timestamps % 7) / 7.0
            if data.ndim == 3:
                day_of_week = np.repeat(day_of_week[:, np.newaxis, np.newaxis], data.shape[1], axis=1)
                day_of_week = np.repeat(day_of_week, 1, axis=2)
            temporal_feats.append(day_of_week)
        
        if add_month:
            month = ((timestamps // 30) % 12) / 12.0
            if data.ndim == 3:
                month = np.repeat(month[:, np.newaxis, np.newaxis], data.shape[1], axis=1)
                month = np.repeat(month, 1, axis=2)
            temporal_feats.append(month)
        
        if temporal_feats:
            if data.ndim == 2:
                temporal_feats_stacked = np.column_stack(temporal_feats)
                augmented = np.column_stack([data, temporal_feats_stacked])
            elif data.ndim == 3:
                temporal_feats_stacked = np.concatenate(temporal_feats, axis=2)
                augmented = np.concatenate([data, temporal_feats_stacked], axis=2)
            else:
                augmented = data
        else:
            augmented = data
        
        logger.info(f"Added temporal features: {augmented.shape}")
        
        return augmented
    
    def handle_missing_values(
        self,
        data: np.ndarray,
        method: str = 'forward_fill',
        max_gap: Optional[int] = None
    ) -> np.ndarray:
        
        filled = data.copy()
        mask = np.isnan(filled)
        
        if not mask.any():
            return filled
        
        if method == 'forward_fill':
            for i in range(1, len(filled)):
                if mask[i].any():
                    filled[i][mask[i]] = filled[i-1][mask[i]]
        
        elif method == 'backward_fill':
            for i in range(len(filled) - 2, -1, -1):
                if mask[i].any():
                    filled[i][mask[i]] = filled[i+1][mask[i]]
        
        elif method == 'interpolate':
            for col in range(filled.shape[1] if filled.ndim > 1 else 1):
                if filled.ndim == 1:
                    series = filled
                else:
                    series = filled[:, col]
                
                valid_idx = np.where(~np.isnan(series))[0]
                if len(valid_idx) > 1:
                    filled_series = np.interp(
                        np.arange(len(series)),
                        valid_idx,
                        series[valid_idx]
                    )
                    if filled.ndim == 1:
                        filled = filled_series
                    else:
                        filled[:, col] = filled_series
        
        elif method == 'zero':
            filled[mask] = 0
        
        elif method == 'mean':
            if filled.ndim == 1:
                filled[mask] = np.nanmean(filled)
            else:
                col_means = np.nanmean(filled, axis=0)
                for col in range(filled.shape[1]):
                    filled[mask[:, col], col] = col_means[col]
        
        logger.info(f"Filled {mask.sum()} missing values using {method}")
        
        return filled
    
    def smooth_series(
        self,
        data: np.ndarray,
        window_size: int = 3,
        method: str = 'moving_average'
    ) -> np.ndarray:
        
        if method == 'moving_average':
            smoothed = np.convolve(data.flatten(), np.ones(window_size)/window_size, mode='same')
            smoothed = smoothed.reshape(data.shape)
        
        elif method == 'exponential':
            from scipy.ndimage import gaussian_filter1d
            smoothed = gaussian_filter1d(data, sigma=window_size, axis=0)
        
        else:
            raise ValueError(f"Unknown smoothing method: {method}")
        
        logger.info(f"Smoothed time series using {method} with window {window_size}")
        
        return smoothed
    
    def detect_outliers(
        self,
        data: np.ndarray,
        method: str = 'zscore',
        threshold: float = 3.0
    ) -> np.ndarray:
        
        if method == 'zscore':
            z_scores = np.abs((data - np.mean(data, axis=0)) / np.std(data, axis=0))
            outliers = z_scores > threshold
        
        elif method == 'iqr':
            q75, q25 = np.percentile(data, [75, 25], axis=0)
            iqr = q75 - q25
            lower_bound = q25 - threshold * iqr
            upper_bound = q75 + threshold * iqr
            outliers = (data < lower_bound) | (data > upper_bound)
        
        else:
            raise ValueError(f"Unknown outlier detection method: {method}")
        
        logger.info(f"Detected {outliers.sum()} outliers using {method}")
        
        return outliers
    
    def remove_outliers(
        self,
        data: np.ndarray,
        method: str = 'zscore',
        threshold: float = 3.0,
        replacement: str = 'nan'
    ) -> np.ndarray:
        
        outliers = self.detect_outliers(data, method, threshold)
        cleaned = data.copy()
        
        if replacement == 'nan':
            cleaned[outliers] = np.nan
        elif replacement == 'median':
            median_val = np.median(data[~outliers])
            cleaned[outliers] = median_val
        elif replacement == 'mean':
            mean_val = np.mean(data[~outliers])
            cleaned[outliers] = mean_val
        
        return cleaned


if __name__ == "__main__":
    preprocessor = TimeSeriesPreprocessor()
    
    data = np.random.randn(100, 5) * 10 + 50
    data[10:15, 0] = np.nan
    
    normalized, params = preprocessor.normalize(data, method='zscore')
    
    filled = preprocessor.handle_missing_values(data, method='interpolate')
    
    X, y = preprocessor.create_sequences_multivariate(
        filled,
        sequence_length=10,
        forecast_horizon=3,
        stride=1
    )
    
    print(f"Original data shape: {data.shape}")
    print(f"Normalized data shape: {normalized.shape}")
    print(f"Sequences X shape: {X.shape}, y shape: {y.shape}")
