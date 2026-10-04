import numpy as np
import torch
import torch.nn as nn
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class CycloneConfig:
    detection_threshold_pressure: float = 990.0
    tracking_max_distance_km: float = 500.0
    min_wind_speed_kmh: float = 62.0
    intensity_categories: Dict[str, Tuple[float, float]] = None
    forecast_horizon_hours: int = 120
    temporal_window: int = 24

    def __post_init__(self):
        if self.intensity_categories is None:
            self.intensity_categories = {
                'depression': (0, 62),
                'cyclonic_storm': (62, 88),
                'severe_cyclonic_storm': (88, 118),
                'very_severe_cyclonic_storm': (118, 166),
                'extremely_severe_cyclonic_storm': (166, 221),
                'super_cyclonic_storm': (221, float('inf')),
            }


class CycloneDetectionCNN(nn.Module):
    def __init__(self, input_channels: int = 4, num_classes: int = 2):
        super().__init__()
        
        self.encoder = nn.Sequential(
            nn.Conv2d(input_channels, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((4, 4)),
            nn.Flatten(),
            nn.Linear(128 * 4 * 4, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes),
        )
    
    def forward(self, x):
        features = self.encoder(x)
        logits = self.classifier(features)
        return logits


class CycloneTracker:
    def __init__(self, config: Optional[CycloneConfig] = None):
        self.config = config or CycloneConfig()
        self.tracks = []
        self.next_track_id = 0
        logger.info("Initialized CycloneTracker")
    
    def detect_centers(
        self,
        pressure_field: np.ndarray,
        wind_speed: np.ndarray,
    ) -> List[Dict]:
        from scipy.ndimage import minimum_filter, label
        
        local_min = minimum_filter(pressure_field, size=15)
        cyclone_mask = (pressure_field == local_min) & (pressure_field < self.config.detection_threshold_pressure)
        
        if wind_speed is not None:
            cyclone_mask = cyclone_mask & (wind_speed > self.config.min_wind_speed_kmh)
        
        labeled, num_features = label(cyclone_mask)
        
        centers = []
        for i in range(1, num_features + 1):
            coords = np.argwhere(labeled == i)
            if len(coords) == 0:
                continue
            
            center_y, center_x = coords.mean(axis=0).astype(int)
            
            center_pressure = float(pressure_field[center_y, center_x])
            center_wind = float(wind_speed[center_y, center_x]) if wind_speed is not None else 0.0
            
            centers.append({
                'x': int(center_x),
                'y': int(center_y),
                'pressure': center_pressure,
                'wind_speed': center_wind,
            })
        
        return centers
    
    def update_tracks(
        self,
        centers: List[Dict],
        timestamp: int,
        pixel_to_km: float = 10.0,
    ):
        if not self.tracks:
            for center in centers:
                self.tracks.append({
                    'id': self.next_track_id,
                    'positions': [(timestamp, center['x'], center['y'])],
                    'intensities': [(timestamp, center['wind_speed'])],
                    'pressures': [(timestamp, center['pressure'])],
                    'status': 'active',
                })
                self.next_track_id += 1
            return
        
        active_tracks = [t for t in self.tracks if t['status'] == 'active']
        
        matched = set()
        for track in active_tracks:
            last_t, last_x, last_y = track['positions'][-1]
            
            best_match = None
            min_dist = float('inf')
            
            for idx, center in enumerate(centers):
                if idx in matched:
                    continue
                
                dist_pixels = np.sqrt((center['x'] - last_x)**2 + (center['y'] - last_y)**2)
                dist_km = dist_pixels * pixel_to_km
                
                if dist_km < self.config.tracking_max_distance_km and dist_km < min_dist:
                    min_dist = dist_km
                    best_match = idx
            
            if best_match is not None:
                center = centers[best_match]
                track['positions'].append((timestamp, center['x'], center['y']))
                track['intensities'].append((timestamp, center['wind_speed']))
                track['pressures'].append((timestamp, center['pressure']))
                matched.add(best_match)
            else:
                track['status'] = 'dissipated'
        
        for idx, center in enumerate(centers):
            if idx not in matched:
                self.tracks.append({
                    'id': self.next_track_id,
                    'positions': [(timestamp, center['x'], center['y'])],
                    'intensities': [(timestamp, center['wind_speed'])],
                    'pressures': [(timestamp, center['pressure'])],
                    'status': 'active',
                })
                self.next_track_id += 1
    
    def classify_intensity(self, wind_speed: float) -> str:
        for category, (min_speed, max_speed) in self.config.intensity_categories.items():
            if min_speed <= wind_speed < max_speed:
                return category
        return 'unknown'
    
    def get_track_summary(self) -> List[Dict]:
        summaries = []
        for track in self.tracks:
            if len(track['positions']) < 2:
                continue
            
            max_intensity = max(t[1] for t in track['intensities'])
            min_pressure = min(t[1] for t in track['pressures'])
            
            summaries.append({
                'id': track['id'],
                'duration_hours': len(track['positions']),
                'max_wind_speed': max_intensity,
                'min_pressure': min_pressure,
                'category': self.classify_intensity(max_intensity),
                'status': track['status'],
                'num_positions': len(track['positions']),
            })
        
        return summaries


class CycloneDetectionTracker:
    def __init__(
        self,
        config: Optional[CycloneConfig] = None,
        device: str = 'cpu',
    ):
        self.config = config or CycloneConfig()
        self.device = device
        self.model = CycloneDetectionCNN(input_channels=4, num_classes=2)
        self.model.to(device)
        self.tracker = CycloneTracker(config)
        logger.info(f"Initialized CycloneDetectionTracker on {device}")
    
    def train_detector(
        self,
        train_data: np.ndarray,
        train_labels: np.ndarray,
        epochs: int = 10,
        batch_size: int = 16,
        learning_rate: float = 0.001,
    ) -> Dict:
        self.model.train()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        criterion = nn.CrossEntropyLoss()
        
        dataset = torch.utils.data.TensorDataset(
            torch.FloatTensor(train_data),
            torch.LongTensor(train_labels)
        )
        dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
        
        history = {'loss': [], 'accuracy': []}
        
        for epoch in range(epochs):
            epoch_loss = 0.0
            correct = 0
            total = 0
            
            for batch_x, batch_y in dataloader:
                batch_x = batch_x.to(self.device)
                batch_y = batch_y.to(self.device)
                
                optimizer.zero_grad()
                outputs = self.model(batch_x)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                
                epoch_loss += loss.item()
                _, predicted = outputs.max(1)
                total += batch_y.size(0)
                correct += predicted.eq(batch_y).sum().item()
            
            avg_loss = epoch_loss / len(dataloader)
            accuracy = correct / total
            history['loss'].append(avg_loss)
            history['accuracy'].append(accuracy)
            
            if (epoch + 1) % 2 == 0:
                logger.info(f"Epoch {epoch+1}/{epochs} - loss: {avg_loss:.4f}, acc: {accuracy:.4f}")
        
        return history
    
    def detect(self, satellite_data: np.ndarray) -> Dict:
        self.model.eval()
        with torch.no_grad():
            x = torch.FloatTensor(satellite_data).unsqueeze(0).to(self.device)
            logits = self.model(x)
            probs = torch.softmax(logits, dim=1)
            prediction = logits.argmax(dim=1).item()
            confidence = probs[0, prediction].item()
        
        return {
            'cyclone_detected': bool(prediction),
            'confidence': confidence,
        }
    
    def run_tracking(
        self,
        pressure_series: np.ndarray,
        wind_speed_series: np.ndarray,
        pixel_to_km: float = 10.0,
    ) -> Dict:
        logger.info(f"Running cyclone tracking on {len(pressure_series)} timesteps...")
        
        for t in range(len(pressure_series)):
            centers = self.tracker.detect_centers(
                pressure_field=pressure_series[t],
                wind_speed=wind_speed_series[t] if wind_speed_series is not None else None,
            )
            self.tracker.update_tracks(centers, timestamp=t, pixel_to_km=pixel_to_km)
        
        summaries = self.tracker.get_track_summary()
        
        active_tracks = [s for s in summaries if s['status'] == 'active']
        
        logger.info(f"Tracking complete: {len(summaries)} total tracks, {len(active_tracks)} active")
        
        return {
            'tracks': summaries,
            'active_tracks': active_tracks,
            'total_tracks': len(summaries),
            'num_active': len(active_tracks),
        }
    
    def save_model(self, path: Path):
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            'model_state': self.model.state_dict(),
            'config': self.config,
        }, path)
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path: Path):
        checkpoint = torch.load(path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state'])
        logger.info(f"Model loaded from {path}")


if __name__ == "__main__":
    np.random.seed(42)
    torch.manual_seed(42)
    
    train_data = np.random.randn(100, 4, 64, 64).astype(np.float32)
    train_labels = np.random.randint(0, 2, 100)
    
    detector = CycloneDetectionTracker(device='cpu')
    history = detector.train_detector(train_data, train_labels, epochs=5, batch_size=16)
    
    print(f"\nTraining complete - final loss: {history['loss'][-1]:.4f}, acc: {history['accuracy'][-1]:.4f}")
    
    pressure_series = np.random.uniform(980, 1010, (24, 100, 100))
    for t in range(24):
        num_cyclones = np.random.randint(0, 3)
        for _ in range(num_cyclones):
            cy, cx = np.random.randint(20, 80, 2)
            y, x = np.ogrid[-cy:100-cy, -cx:100-cx]
            dist = np.sqrt(x*x + y*y)
            pressure_series[t] -= 20 * np.exp(-dist**2 / 200)
    
    wind_speed_series = 1020 - pressure_series
    
    tracking_result = detector.run_tracking(pressure_series, wind_speed_series, pixel_to_km=10.0)
    
    print(f"\nTotal tracks  : {tracking_result['total_tracks']}")
    print(f"Active tracks : {tracking_result['num_active']}")
    for track in tracking_result['tracks'][:5]:
        print(f"  Track {track['id']}: {track['category']}, max wind: {track['max_wind_speed']:.1f} km/h, status: {track['status']}")
