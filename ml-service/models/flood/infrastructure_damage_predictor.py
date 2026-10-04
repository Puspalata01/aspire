import numpy as np
from typing import Dict, List, Optional, Tuple, Literal
from dataclasses import dataclass
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class InfrastructureDamageConfig:
    building_damage_thresholds: Dict[str, Tuple[float, float, float]] = None
    road_damage_thresholds: Dict[str, Tuple[float, float, float]] = None
    bridge_vulnerability_factor: float = 1.8
    power_grid_vulnerability_factor: float = 1.5
    random_state: int = 42

    def __post_init__(self):
        if self.building_damage_thresholds is None:
            self.building_damage_thresholds = {
                'concrete': (0.5, 1.5, 3.0),
                'brick': (0.3, 1.0, 2.0),
                'wood': (0.2, 0.8, 1.5),
                'informal': (0.1, 0.5, 1.0),
            }
        if self.road_damage_thresholds is None:
            self.road_damage_thresholds = {
                'highway': (0.8, 2.0, 4.0),
                'major': (0.5, 1.5, 3.0),
                'minor': (0.3, 1.0, 2.0),
            }


class InfrastructureDamagePredictor:

    def __init__(
        self,
        config: Optional[InfrastructureDamageConfig] = None,
        model_type: Literal['random_forest', 'gradient_boosting'] = 'random_forest'
    ):
        self.config = config or InfrastructureDamageConfig()
        self.model_type = model_type
        self.model = None
        logger.info(f"Initialized InfrastructureDamagePredictor (model: {model_type})")

    def _create_fragility_curve(
        self,
        flood_depth: np.ndarray,
        thresholds: Tuple[float, float, float]
    ) -> np.ndarray:
        minor, moderate, severe = thresholds
        damage = np.zeros_like(flood_depth, dtype=float)

        damage += 0.15 * (flood_depth >= minor)
        damage += 0.30 * (flood_depth >= moderate)
        damage += 0.55 * (flood_depth >= severe)

        return np.clip(damage, 0, 1)

    def predict_building_damage(
        self,
        flood_depth: np.ndarray,
        building_type: np.ndarray,
        building_age: Optional[np.ndarray] = None,
    ) -> Dict:
        type_mapping = {0: 'concrete', 1: 'brick', 2: 'wood', 3: 'informal'}

        damage_map = np.zeros_like(flood_depth, dtype=float)

        for type_idx, type_name in type_mapping.items():
            mask = (building_type == type_idx)
            thresholds = self.config.building_damage_thresholds[type_name]
            damage_map[mask] = self._create_fragility_curve(flood_depth[mask], thresholds)

        if building_age is not None:
            if building_age.shape != damage_map.shape:
                from scipy.ndimage import zoom
                f = (damage_map.shape[0] / building_age.shape[0],
                     damage_map.shape[1] / building_age.shape[1])
                building_age = zoom(building_age, f, order=1)
            age_factor = 1.0 + 0.5 * building_age
            damage_map = np.clip(damage_map * age_factor, 0, 1)

        total_buildings = int((building_type >= 0).sum())
        damaged = int((damage_map > 0.1).sum())
        severely_damaged = int((damage_map > 0.7).sum())

        return {
            'damage_map': damage_map,
            'total_buildings': total_buildings,
            'damaged_buildings': damaged,
            'severely_damaged_buildings': severely_damaged,
            'mean_damage_ratio': float(damage_map[building_type >= 0].mean()),
            'damage_by_type': {
                type_name: float(damage_map[building_type == idx].mean())
                for idx, type_name in type_mapping.items()
                if (building_type == idx).sum() > 0
            }
        }

    def predict_road_damage(
        self,
        flood_depth: np.ndarray,
        road_network: np.ndarray,
    ) -> Dict:
        road_mapping = {1: 'minor', 2: 'major', 3: 'highway'}

        damage_map = np.zeros_like(flood_depth, dtype=float)

        for road_idx, road_type in road_mapping.items():
            mask = (road_network == road_idx)
            if mask.sum() == 0:
                continue
            thresholds = self.config.road_damage_thresholds[road_type]
            damage_map[mask] = self._create_fragility_curve(flood_depth[mask], thresholds)

        total_road_km = int((road_network > 0).sum())
        damaged_road_km = int((damage_map > 0.1).sum())
        severely_damaged_km = int((damage_map > 0.7).sum())

        return {
            'damage_map': damage_map,
            'total_road_km': total_road_km,
            'damaged_road_km': damaged_road_km,
            'severely_damaged_road_km': severely_damaged_km,
            'mean_damage_ratio': float(damage_map[road_network > 0].mean()) if total_road_km > 0 else 0.0,
            'damage_by_type': {
                road_type: float(damage_map[road_network == idx].mean())
                for idx, road_type in road_mapping.items()
                if (road_network == idx).sum() > 0
            }
        }

    def predict_bridge_damage(
        self,
        flood_depth: np.ndarray,
        bridge_locations: np.ndarray,
        flow_velocity: Optional[np.ndarray] = None,
    ) -> Dict:
        cfg = self.config
        damage = self._create_fragility_curve(flood_depth, (0.5, 1.5, 3.0))
        damage = np.clip(damage * cfg.bridge_vulnerability_factor, 0, 1)

        if flow_velocity is not None:
            if flow_velocity.shape != damage.shape:
                from scipy.ndimage import zoom
                f = (damage.shape[0] / flow_velocity.shape[0],
                     damage.shape[1] / flow_velocity.shape[1])
                flow_velocity = zoom(flow_velocity, f, order=1)
            velocity_factor = 1.0 + 0.3 * np.clip(flow_velocity / 5.0, 0, 1)
            damage = np.clip(damage * velocity_factor, 0, 1)

        bridge_damage = damage * (bridge_locations > 0)

        total_bridges = int((bridge_locations > 0).sum())
        damaged_bridges = int((bridge_damage > 0.2).sum())
        collapsed_bridges = int((bridge_damage > 0.8).sum())

        return {
            'damage_map': bridge_damage,
            'total_bridges': total_bridges,
            'damaged_bridges': damaged_bridges,
            'collapsed_bridges': collapsed_bridges,
            'mean_damage_ratio': float(bridge_damage[bridge_locations > 0].mean()) if total_bridges > 0 else 0.0,
        }

    def train_ml_model(
        self,
        features: np.ndarray,
        targets: np.ndarray,
        validation_split: float = 0.2,
    ) -> Dict:
        X_train, X_val, y_train, y_val = train_test_split(
            features, targets,
            test_size=validation_split,
            random_state=self.config.random_state
        )

        if self.model_type == 'random_forest':
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=10,
                random_state=self.config.random_state,
                n_jobs=-1
            )
        else:
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=8,
                learning_rate=0.05,
                random_state=self.config.random_state
            )

        logger.info(f"Training {self.model_type} model...")
        self.model.fit(X_train, y_train)

        y_pred_train = self.model.predict(X_train)
        y_pred_val = self.model.predict(X_val)

        metrics = {
            'train_mae': mean_absolute_error(y_train, y_pred_train),
            'val_mae': mean_absolute_error(y_val, y_pred_val),
            'train_r2': r2_score(y_train, y_pred_train),
            'val_r2': r2_score(y_val, y_pred_val),
        }

        logger.info(f"Training complete — val_mae: {metrics['val_mae']:.4f}, val_r2: {metrics['val_r2']:.4f}")
        return metrics

    def predict_with_ml(self, features: np.ndarray) -> np.ndarray:
        if self.model is None:
            raise ValueError("Model not trained. Call train_ml_model first.")
        return self.model.predict(features)

    def save_model(self, path: Path):
        if self.model is None:
            raise ValueError("No model to save")
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, path)
        logger.info(f"Model saved to {path}")

    def load_model(self, path: Path):
        self.model = joblib.load(path)
        logger.info(f"Model loaded from {path}")

    def run(
        self,
        flood_depth: np.ndarray,
        building_type: Optional[np.ndarray] = None,
        building_age: Optional[np.ndarray] = None,
        road_network: Optional[np.ndarray] = None,
        bridge_locations: Optional[np.ndarray] = None,
        output_path: Optional[Path] = None,
    ) -> Dict:
        logger.info("Running infrastructure damage prediction...")

        result = {'rasters': {}}

        if building_type is not None:
            building_dmg = self.predict_building_damage(flood_depth, building_type, building_age)
            result['buildings'] = {k: v for k, v in building_dmg.items() if not isinstance(v, np.ndarray)}
            result['rasters']['building_damage'] = building_dmg['damage_map']

        if road_network is not None:
            road_dmg = self.predict_road_damage(flood_depth, road_network)
            result['roads'] = {k: v for k, v in road_dmg.items() if not isinstance(v, np.ndarray)}
            result['rasters']['road_damage'] = road_dmg['damage_map']

        if bridge_locations is not None:
            bridge_dmg = self.predict_bridge_damage(flood_depth, bridge_locations)
            result['bridges'] = {k: v for k, v in bridge_dmg.items() if not isinstance(v, np.ndarray)}
            result['rasters']['bridge_damage'] = bridge_dmg['damage_map']

        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            for name, arr in result['rasters'].items():
                np.save(output_path / f'{name}.npy', arr)
            import json
            report = {k: v for k, v in result.items() if k != 'rasters'}
            with open(output_path / 'infrastructure_damage.json', 'w') as f:
                json.dump(report, f, indent=2, default=str)

        logger.info("Infrastructure damage prediction complete")
        return result


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)

    depth = np.random.uniform(0, 3, shape)
    bld_type = np.random.choice([0, 1, 2, 3], shape, p=[0.3, 0.4, 0.2, 0.1])
    bld_age = np.random.uniform(0, 1, shape)
    roads = np.random.choice([0, 1, 2, 3], shape, p=[0.90, 0.06, 0.03, 0.01])
    bridges = np.random.choice([0, 1], shape, p=[0.995, 0.005])

    predictor = InfrastructureDamagePredictor()
    result = predictor.run(depth, bld_type, bld_age, roads, bridges)

    print(f"Buildings damaged        : {result['buildings']['damaged_buildings']:,}")
    print(f"Buildings severely dmg   : {result['buildings']['severely_damaged_buildings']:,}")
    print(f"Roads damaged (km)       : {result['roads']['damaged_road_km']:,}")
    print(f"Bridges damaged          : {result['bridges']['damaged_bridges']:,}")
