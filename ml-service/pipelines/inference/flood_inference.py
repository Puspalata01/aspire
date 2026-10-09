import torch
import numpy as np
from pathlib import Path
from typing import Optional, Union, Tuple
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from models.flood.flood_segmentation_model import get_flood_segmentation_model
from utils.logger import get_logger

logger = get_logger(__name__)


class FloodSegmentationInference:
    
    def __init__(
        self,
        model_path: Path,
        model_type: str = 'unet',
        in_channels: int = 4,
        out_channels: int = 1,
        device: Optional[str] = None
    ):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        self.model = get_flood_segmentation_model(
            model_type=model_type,
            in_channels=in_channels,
            out_channels=out_channels
        ).to(self.device)
        
        self.load_model(model_path)
        self.model.eval()
        
        logger.info(f"Initialized FloodSegmentationInference on {self.device}")
    
    def load_model(self, model_path: Path):
        
        checkpoint = torch.load(model_path, map_location=self.device)
        
        if 'model_state_dict' in checkpoint:
            self.model.load_state_dict(checkpoint['model_state_dict'])
        else:
            self.model.load_state_dict(checkpoint)
        
        logger.info(f"Loaded model from {model_path}")
    
    def predict(
        self,
        image: Union[np.ndarray, torch.Tensor],
        threshold: float = 0.5,
        return_probability: bool = False
    ) -> Union[np.ndarray, Tuple[np.ndarray, np.ndarray]]:
        
        if isinstance(image, np.ndarray):
            if image.ndim == 2:
                image = np.expand_dims(image, axis=0)
            elif image.ndim == 3 and image.shape[2] < image.shape[0]:
                image = np.transpose(image, (2, 0, 1))
            
            image = torch.FloatTensor(image).unsqueeze(0)
        
        elif isinstance(image, torch.Tensor):
            if image.ndim == 2:
                image = image.unsqueeze(0).unsqueeze(0)
            elif image.ndim == 3:
                image = image.unsqueeze(0)
        
        image = image.to(self.device)
        
        with torch.no_grad():
            probability_map = self.model(image)
        
        probability_map = probability_map.squeeze().cpu().numpy()
        
        binary_mask = (probability_map > threshold).astype(np.uint8)
        
        if return_probability:
            return binary_mask, probability_map
        
        return binary_mask
    
    def predict_batch(
        self,
        images: np.ndarray,
        threshold: float = 0.5,
        batch_size: int = 8
    ) -> Tuple[np.ndarray, np.ndarray]:
        
        num_images = len(images)
        all_masks = []
        all_probabilities = []
        
        for i in range(0, num_images, batch_size):
            batch = images[i:i + batch_size]
            
            batch_tensor = []
            for img in batch:
                if img.ndim == 2:
                    img = np.expand_dims(img, axis=0)
                elif img.ndim == 3 and img.shape[2] < img.shape[0]:
                    img = np.transpose(img, (2, 0, 1))
                batch_tensor.append(img)
            
            batch_tensor = torch.FloatTensor(np.array(batch_tensor)).to(self.device)
            
            with torch.no_grad():
                probability_maps = self.model(batch_tensor)
            
            probability_maps = probability_maps.squeeze(1).cpu().numpy()
            binary_masks = (probability_maps > threshold).astype(np.uint8)
            
            all_masks.append(binary_masks)
            all_probabilities.append(probability_maps)
        
        all_masks = np.concatenate(all_masks, axis=0)
        all_probabilities = np.concatenate(all_probabilities, axis=0)
        
        return all_masks, all_probabilities
    
    def calculate_flood_extent(self, mask: np.ndarray, pixel_size_m2: float = 100.0) -> dict:
        
        flooded_pixels = np.sum(mask > 0)
        total_pixels = mask.size
        
        flooded_area_m2 = flooded_pixels * pixel_size_m2
        flooded_area_km2 = flooded_area_m2 / 1_000_000
        
        flooded_percentage = (flooded_pixels / total_pixels) * 100
        
        return {
            'flooded_pixels': int(flooded_pixels),
            'total_pixels': int(total_pixels),
            'flooded_area_m2': float(flooded_area_m2),
            'flooded_area_km2': float(flooded_area_km2),
            'flooded_percentage': float(flooded_percentage)
        }
    
    def get_flood_severity(
        self,
        probability_map: np.ndarray,
        thresholds: dict = None
    ) -> np.ndarray:
        
        if thresholds is None:
            thresholds = {
                'low': 0.3,
                'medium': 0.5,
                'high': 0.7,
                'critical': 0.9
            }
        
        severity_map = np.zeros_like(probability_map, dtype=np.uint8)
        
        severity_map[probability_map >= thresholds['low']] = 1
        severity_map[probability_map >= thresholds['medium']] = 2
        severity_map[probability_map >= thresholds['high']] = 3
        severity_map[probability_map >= thresholds['critical']] = 4
        
        return severity_map


class PrecipitationInference:
    
    def __init__(
        self,
        model_path: Path,
        model_type: str = 'lstm',
        input_size: int = 1,
        hidden_size: int = 128,
        num_layers: int = 2,
        device: Optional[str] = None,
        **kwargs
    ):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        from models.flood.precipitation_forecasting_model import get_precipitation_model
        
        self.model = get_precipitation_model(
            model_type=model_type,
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            **kwargs
        ).to(self.device)
        
        self.load_model(model_path)
        self.model.eval()
        
        logger.info(f"Initialized PrecipitationInference on {self.device}")
    
    def load_model(self, model_path: Path):
        
        checkpoint = torch.load(model_path, map_location=self.device)
        
        if 'model_state_dict' in checkpoint:
            self.model.load_state_dict(checkpoint['model_state_dict'])
        else:
            self.model.load_state_dict(checkpoint)
        
        logger.info(f"Loaded model from {model_path}")
    
    def predict(
        self,
        sequence: Union[np.ndarray, torch.Tensor],
        forecast_horizon: int = 1
    ) -> np.ndarray:
        
        if isinstance(sequence, np.ndarray):
            if sequence.ndim == 2:
                sequence = np.expand_dims(sequence, axis=0)
            sequence = torch.FloatTensor(sequence)
        
        sequence = sequence.to(self.device)
        
        with torch.no_grad():
            if hasattr(self.model, 'predict_sequence'):
                predictions = self.model.predict_sequence(sequence, forecast_horizon)
                predictions = predictions.squeeze().cpu().numpy()
            else:
                predictions = []
                current_sequence = sequence
                
                for _ in range(forecast_horizon):
                    if hasattr(self.model, 'forward') and 'attention' in str(type(self.model)).lower():
                        pred, _ = self.model(current_sequence)
                    else:
                        pred, _ = self.model(current_sequence)
                    
                    predictions.append(pred.cpu().numpy())
                    
                    pred_expanded = pred.unsqueeze(1)
                    if current_sequence.size(2) == 1:
                        pred_expanded = pred_expanded
                    else:
                        pred_expanded = torch.cat([
                            pred_expanded,
                            torch.zeros(pred.size(0), 1, current_sequence.size(2) - 1).to(self.device)
                        ], dim=2)
                    
                    current_sequence = torch.cat([current_sequence[:, 1:, :], pred_expanded], dim=1)
                
                predictions = np.array(predictions).squeeze()
        
        return predictions


class DischargeInference:
    
    def __init__(
        self,
        model_path: Path,
        model_type: str = 'lstm',
        input_size: int = 5,
        hidden_size: int = 128,
        num_layers: int = 2,
        device: Optional[str] = None,
        **kwargs
    ):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        from models.flood.river_discharge_model import get_discharge_model
        
        self.model_type = model_type
        self.model = get_discharge_model(
            model_type=model_type,
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            **kwargs
        ).to(self.device)
        
        self.load_model(model_path)
        self.model.eval()
        
        logger.info(f"Initialized DischargeInference on {self.device}")
    
    def load_model(self, model_path: Path):
        
        checkpoint = torch.load(model_path, map_location=self.device)
        
        if 'model_state_dict' in checkpoint:
            self.model.load_state_dict(checkpoint['model_state_dict'])
        else:
            self.model.load_state_dict(checkpoint)
        
        logger.info(f"Loaded model from {model_path}")
    
    def predict(
        self,
        temporal_sequence: Union[np.ndarray, torch.Tensor],
        spatial_features: Optional[Union[np.ndarray, torch.Tensor]] = None
    ) -> np.ndarray:
        
        if isinstance(temporal_sequence, np.ndarray):
            if temporal_sequence.ndim == 2:
                temporal_sequence = np.expand_dims(temporal_sequence, axis=0)
            temporal_sequence = torch.FloatTensor(temporal_sequence)
        
        temporal_sequence = temporal_sequence.to(self.device)
        
        if spatial_features is not None:
            if isinstance(spatial_features, np.ndarray):
                if spatial_features.ndim == 1:
                    spatial_features = np.expand_dims(spatial_features, axis=0)
                spatial_features = torch.FloatTensor(spatial_features)
            spatial_features = spatial_features.to(self.device)
        
        with torch.no_grad():
            if self.model_type == 'hybrid':
                prediction = self.model(temporal_sequence, spatial_features)
            elif self.model_type == 'multi_step':
                prediction = self.model(temporal_sequence)
            else:
                prediction, _ = self.model(temporal_sequence)
        
        prediction = prediction.squeeze().cpu().numpy()
        
        return prediction


if __name__ == "__main__":
    print("Testing Flood Segmentation Inference...")
    
    test_image = np.random.rand(256, 256, 4).astype(np.float32)
    
    print(f"Test image shape: {test_image.shape}")
    print("\nInference components ready for deployment.")
