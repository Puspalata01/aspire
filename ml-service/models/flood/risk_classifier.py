import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import IntEnum
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


class RiskLevel(IntEnum):
    NEGLIGIBLE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class RiskThresholds:
    low: float = 0.25
    medium: float = 0.50
    high: float = 0.75
    critical: float = 0.90


RISK_COLORS = {
    RiskLevel.NEGLIGIBLE: '#00FF00',
    RiskLevel.LOW:        '#FFFF00',
    RiskLevel.MEDIUM:     '#FFA500',
    RiskLevel.HIGH:       '#FF4500',
    RiskLevel.CRITICAL:   '#8B0000',
}

RISK_LABELS = {
    RiskLevel.NEGLIGIBLE: 'Negligible',
    RiskLevel.LOW:        'Low',
    RiskLevel.MEDIUM:     'Medium',
    RiskLevel.HIGH:       'High',
    RiskLevel.CRITICAL:   'Critical',
}


class RiskClassifier:

    def __init__(self, thresholds: Optional[RiskThresholds] = None):
        self.thresholds = thresholds or RiskThresholds()
        logger.info(
            f"Initialized RiskClassifier — thresholds: "
            f"low={self.thresholds.low}, medium={self.thresholds.medium}, "
            f"high={self.thresholds.high}, critical={self.thresholds.critical}"
        )

    def compute_risk_score(
        self,
        hazard_map: np.ndarray,
        vulnerability_map: np.ndarray,
        exposure_map: np.ndarray,
        hazard_weight: float = 0.4,
        vulnerability_weight: float = 0.35,
        exposure_weight: float = 0.25,
    ) -> np.ndarray:
        def _norm(arr: np.ndarray) -> np.ndarray:
            mn, mx = arr.min(), arr.max()
            return (arr - mn) / (mx - mn + 1e-8)

        h = _norm(hazard_map)
        v = _norm(vulnerability_map)
        e = _norm(exposure_map)

        risk = hazard_weight * h + vulnerability_weight * v + exposure_weight * e
        return np.clip(risk, 0, 1)

    def classify(self, risk_score: np.ndarray) -> np.ndarray:
        t = self.thresholds
        levels = np.zeros_like(risk_score, dtype=np.int8)
        levels[risk_score >= t.low]      = int(RiskLevel.LOW)
        levels[risk_score >= t.medium]   = int(RiskLevel.MEDIUM)
        levels[risk_score >= t.high]     = int(RiskLevel.HIGH)
        levels[risk_score >= t.critical] = int(RiskLevel.CRITICAL)
        return levels

    def get_risk_map(
        self,
        hazard_map: np.ndarray,
        vulnerability_map: np.ndarray,
        exposure_map: np.ndarray,
        **kwargs
    ) -> Tuple[np.ndarray, np.ndarray]:
        score = self.compute_risk_score(
            hazard_map, vulnerability_map, exposure_map, **kwargs
        )
        classified = self.classify(score)
        return score, classified

    def aggregate_by_admin_unit(
        self,
        risk_score: np.ndarray,
        admin_unit_map: np.ndarray,
        unit_ids: Optional[List[int]] = None
    ) -> Dict[int, Dict]:
        if unit_ids is None:
            unit_ids = list(np.unique(admin_unit_map[admin_unit_map > 0]))

        results = {}
        for uid in unit_ids:
            mask = admin_unit_map == uid
            if not mask.any():
                continue
            zone_scores = risk_score[mask]
            mean_score = float(zone_scores.mean())
            classified = self.classify(np.array([mean_score]))[0]
            results[int(uid)] = {
                'mean_risk_score': mean_score,
                'max_risk_score': float(zone_scores.max()),
                'risk_level': int(classified),
                'risk_label': RISK_LABELS[RiskLevel(classified)],
                'high_risk_fraction': float((zone_scores >= self.thresholds.high).mean()),
            }

        return results

    def temporal_risk_evolution(
        self,
        hazard_series: np.ndarray,
        vulnerability_map: np.ndarray,
        exposure_map: np.ndarray,
    ) -> Dict:
        T = hazard_series.shape[0]
        risk_scores = np.zeros((T,) + hazard_series.shape[1:])
        peak_day = 0
        peak_val = -np.inf

        for t in range(T):
            score, _ = self.get_risk_map(
                hazard_series[t], vulnerability_map, exposure_map
            )
            risk_scores[t] = score
            if score.max() > peak_val:
                peak_val = score.max()
                peak_day = t

        classified_series = np.stack([self.classify(risk_scores[t]) for t in range(T)])

        return {
            'risk_scores': risk_scores,
            'classified_series': classified_series,
            'peak_day': peak_day,
            'peak_risk': float(peak_val),
            'mean_risk_over_time': float(risk_scores.mean()),
            'high_risk_days': int((risk_scores.max(axis=(1, 2)) >= self.thresholds.high).sum()),
        }

    def alert_zones(
        self,
        risk_score: np.ndarray,
        min_level: RiskLevel = RiskLevel.HIGH,
        min_area_fraction: float = 0.01
    ) -> List[Dict]:
        from scipy.ndimage import label

        binary = (risk_score >= self.thresholds.high
                  if min_level >= RiskLevel.HIGH
                  else risk_score >= self.thresholds.medium)

        labeled, num_features = label(binary)
        alerts = []

        for region_id in range(1, num_features + 1):
            region = labeled == region_id
            area_fraction = float(region.mean())
            if area_fraction < min_area_fraction:
                continue
            region_scores = risk_score[region]
            ys, xs = np.where(region)
            alerts.append({
                'region_id': region_id,
                'area_fraction': area_fraction,
                'mean_risk': float(region_scores.mean()),
                'max_risk': float(region_scores.max()),
                'risk_level': RISK_LABELS[self.classify(np.array([region_scores.mean()]))[0]],
                'centroid_y': int(ys.mean()),
                'centroid_x': int(xs.mean()),
                'bounding_box': {
                    'y_min': int(ys.min()), 'y_max': int(ys.max()),
                    'x_min': int(xs.min()), 'x_max': int(xs.max()),
                },
            })

        alerts.sort(key=lambda a: a['mean_risk'], reverse=True)
        logger.info(f"Identified {len(alerts)} alert zones at level >= {RISK_LABELS[min_level]}")
        return alerts

    def generate_summary(
        self,
        risk_score: np.ndarray,
        classified: np.ndarray
    ) -> Dict:
        total = risk_score.size
        summary = {
            'overall': {
                'mean_risk': float(risk_score.mean()),
                'max_risk': float(risk_score.max()),
                'std_risk': float(risk_score.std()),
            },
            'level_distribution': {
                RISK_LABELS[level]: {
                    'count': int((classified == int(level)).sum()),
                    'fraction_pct': float((classified == int(level)).sum() / total * 100),
                }
                for level in RiskLevel
            },
        }
        return summary


class RiskEngine:

    def __init__(
        self,
        thresholds: Optional[RiskThresholds] = None,
        bbox: Optional[Tuple[float, float, float, float]] = None
    ):
        self.classifier = RiskClassifier(thresholds)
        self.bbox = bbox or (17.78, 22.57, 81.37, 87.53)
        logger.info("Initialized RiskEngine")

    def run(
        self,
        hazard_map: np.ndarray,
        vulnerability_map: np.ndarray,
        exposure_map: np.ndarray,
        admin_unit_map: Optional[np.ndarray] = None,
        output_path: Optional[Path] = None
    ) -> Dict:
        logger.info("Running risk assessment...")

        risk_score, classified = self.classifier.get_risk_map(
            hazard_map, vulnerability_map, exposure_map
        )

        summary = self.classifier.generate_summary(risk_score, classified)

        alerts = self.classifier.alert_zones(risk_score, min_level=RiskLevel.HIGH)

        admin_risk = {}
        if admin_unit_map is not None:
            admin_risk = self.classifier.aggregate_by_admin_unit(
                risk_score, admin_unit_map
            )

        result = {
            'risk_score': risk_score,
            'risk_classified': classified,
            'summary': summary,
            'alert_zones': alerts,
            'admin_unit_risk': admin_risk,
        }

        if output_path:
            output_path = Path(output_path)
            output_path.mkdir(parents=True, exist_ok=True)
            np.save(output_path / 'risk_score.npy', risk_score)
            np.save(output_path / 'risk_classified.npy', classified)

            import json
            export = {k: v for k, v in result.items() if not isinstance(v, np.ndarray)}
            with open(output_path / 'risk_summary.json', 'w') as f:
                json.dump(export, f, indent=2)
            logger.info(f"Risk assessment saved to {output_path}")

        logger.info(
            f"Risk complete — mean: {summary['overall']['mean_risk']:.3f}, "
            f"max: {summary['overall']['max_risk']:.3f}, "
            f"alerts: {len(alerts)}"
        )
        return result


if __name__ == "__main__":
    np.random.seed(42)
    shape = (100, 100)

    hazard    = np.random.beta(2, 5, shape)
    vuln      = np.random.beta(3, 4, shape)
    exposure  = np.random.exponential(0.3, shape).clip(0, 1)

    engine = RiskEngine()
    result = engine.run(
        hazard_map=hazard,
        vulnerability_map=vuln,
        exposure_map=exposure,
        output_path=Path('data/processed/risk_output')
    )

    print(f"Mean risk score : {result['summary']['overall']['mean_risk']:.3f}")
    print(f"Max risk score  : {result['summary']['overall']['max_risk']:.3f}")
    print(f"Alert zones     : {len(result['alert_zones'])}")
    print("\nLevel distribution:")
    for lbl, vals in result['summary']['level_distribution'].items():
        print(f"  {lbl:12s}: {vals['fraction_pct']:.1f}%")
