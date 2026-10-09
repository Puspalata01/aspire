import numpy as np
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ExplainabilityConfig:
    max_display_features: int = 15
    shap_background_samples: int = 100
    permutation_repeats: int = 10
    kernel_shap_nsamples: int = 512


class SHAPExplainer:

    def __init__(self, config: Optional[ExplainabilityConfig] = None):
        self.config = config or ExplainabilityConfig()
        self._shap_available = self._check_shap()
        logger.info(f"Initialized SHAPExplainer (SHAP available: {self._shap_available})")

    def _check_shap(self) -> bool:
        try:
            import shap
            return True
        except ImportError:
            logger.warning("shap not installed — using fallback permutation importance")
            return False

    def explain_tree_model(
        self,
        model: Any,
        X: np.ndarray,
        feature_names: List[str],
        background: Optional[np.ndarray] = None,
    ) -> Dict:
        if not self._shap_available:
            return self._fallback_importance(model, X, feature_names)

        import shap

        if background is not None:
            bg = shap.sample(background, min(self.config.shap_background_samples, len(background)))
        else:
            bg = shap.sample(X, min(self.config.shap_background_samples, len(X)))

        explainer = shap.TreeExplainer(model, bg)
        shap_values = explainer.shap_values(X)

        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        importance_order = np.argsort(mean_abs_shap)[::-1]

        top_n = self.config.max_display_features
        top_features = [feature_names[i] for i in importance_order[:top_n]]
        top_importance = mean_abs_shap[importance_order[:top_n]].tolist()

        return {
            "method": "shap_tree",
            "shap_values": shap_values,
            "expected_value": float(explainer.expected_value if not isinstance(explainer.expected_value, list) else explainer.expected_value[1]),
            "feature_importance": dict(zip(top_features, top_importance)),
            "top_features": top_features,
            "top_importance_scores": top_importance,
        }

    def explain_any_model(
        self,
        model: Any,
        X: np.ndarray,
        feature_names: List[str],
        background: Optional[np.ndarray] = None,
    ) -> Dict:
        if not self._shap_available:
            return self._fallback_importance(model, X, feature_names)

        import shap

        bg = background if background is not None else X[:min(50, len(X))]
        bg = shap.sample(bg, min(self.config.shap_background_samples, len(bg)))

        explainer = shap.KernelExplainer(model.predict, bg)
        shap_values = explainer.shap_values(
            X[:min(20, len(X))],
            nsamples=self.config.kernel_shap_nsamples,
        )

        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        importance_order = np.argsort(mean_abs_shap)[::-1]
        top_n = self.config.max_display_features
        top_features = [feature_names[i] for i in importance_order[:top_n]]
        top_importance = mean_abs_shap[importance_order[:top_n]].tolist()

        return {
            "method": "shap_kernel",
            "shap_values": shap_values,
            "expected_value": float(explainer.expected_value),
            "feature_importance": dict(zip(top_features, top_importance)),
            "top_features": top_features,
            "top_importance_scores": top_importance,
        }

    def _fallback_importance(
        self,
        model: Any,
        X: np.ndarray,
        feature_names: List[str],
    ) -> Dict:
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        else:
            importances = np.ones(X.shape[1]) / X.shape[1]

        order = np.argsort(importances)[::-1]
        top_n = min(self.config.max_display_features, len(feature_names))
        top_features = [feature_names[i] for i in order[:top_n]]
        top_importance = importances[order[:top_n]].tolist()

        return {
            "method": "sklearn_feature_importance",
            "shap_values": None,
            "expected_value": None,
            "feature_importance": dict(zip(top_features, top_importance)),
            "top_features": top_features,
            "top_importance_scores": top_importance,
        }

    def explain_single_prediction(
        self,
        model: Any,
        instance: np.ndarray,
        feature_names: List[str],
        background: np.ndarray,
        model_type: str = "tree",
    ) -> Dict:
        if not self._shap_available:
            return {
                "method": "unavailable",
                "feature_contributions": {f: 0.0 for f in feature_names},
                "prediction": float(model.predict(instance.reshape(1, -1))[0]),
            }

        import shap

        if instance.ndim == 1:
            instance = instance.reshape(1, -1)

        if model_type == "tree":
            explainer = shap.TreeExplainer(model, background)
            sv = explainer.shap_values(instance)
            if isinstance(sv, list):
                sv = sv[1]
            expected = explainer.expected_value
            if isinstance(expected, list):
                expected = expected[1]
        else:
            bg = shap.sample(background, min(50, len(background)))
            explainer = shap.KernelExplainer(model.predict, bg)
            sv = explainer.shap_values(instance, nsamples=self.config.kernel_shap_nsamples)
            expected = explainer.expected_value

        shap_row = sv[0] if sv.ndim > 1 else sv
        prediction = float(expected) + float(shap_row.sum())

        contributions = dict(zip(feature_names, shap_row.tolist()))
        sorted_contributions = dict(
            sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)
        )

        top_drivers = [f for f, v in sorted_contributions.items() if v > 0][:5]
        top_reducers = [f for f, v in sorted_contributions.items() if v < 0][:5]

        return {
            "method": f"shap_{model_type}",
            "prediction": prediction,
            "expected_value": float(expected),
            "feature_contributions": sorted_contributions,
            "top_risk_drivers": top_drivers,
            "top_risk_reducers": top_reducers,
        }

    def generate_text_explanation(
        self,
        explanation: Dict,
        prediction_label: str = "risk score",
        threshold: float = 0.5,
    ) -> str:
        top_features = explanation.get("top_features", [])
        top_scores = explanation.get("top_importance_scores", [])
        method = explanation.get("method", "unknown")

        if not top_features:
            return "No explanation available."

        lines = [
            f"Model explanation ({method}):",
            f"The top factors influencing the {prediction_label} are:",
        ]

        for i, (feat, score) in enumerate(zip(top_features[:5], top_scores[:5]), 1):
            feat_readable = feat.replace("_", " ").title()
            lines.append(f"  {i}. {feat_readable} (importance: {score:.4f})")

        contributions = explanation.get("feature_contributions", {})
        if contributions:
            drivers = [f.replace("_", " ").title() for f, v in contributions.items() if v > 0][:3]
            reducers = [f.replace("_", " ").title() for f, v in contributions.items() if v < 0][:3]
            if drivers:
                lines.append(f"\nFactors increasing {prediction_label}: {', '.join(drivers)}")
            if reducers:
                lines.append(f"Factors decreasing {prediction_label}: {', '.join(reducers)}")

        pred = explanation.get("prediction")
        if pred is not None:
            level = "HIGH" if pred >= threshold else "LOW"
            lines.append(f"\nPredicted {prediction_label}: {pred:.3f} ({level})")

        return "\n".join(lines)


class VulnerabilityExplainer:

    def __init__(self, config: Optional[ExplainabilityConfig] = None):
        self.config = config or ExplainabilityConfig()
        self.shap_explainer = SHAPExplainer(config)

    FEATURE_NAMES = [
        "population_density",
        "poverty_index",
        "children_fraction",
        "elderly_fraction",
        "distance_to_hospital",
        "distance_to_shelter",
        "building_age",
        "housing_quality",
        "road_density",
    ]

    def explain_vulnerability(
        self,
        scores: Dict[str, np.ndarray],
        pixel_index: Optional[tuple] = None,
    ) -> Dict:
        component_contributions = {}
        total = sum(v.mean() if isinstance(v, np.ndarray) else v
                    for k, v in scores.items() if k != "composite_vulnerability")

        for component, values in scores.items():
            if component == "composite_vulnerability":
                continue
            mean_val = float(values.mean()) if isinstance(values, np.ndarray) else float(values)
            contribution = mean_val / (total + 1e-8)
            component_contributions[component] = {
                "mean_value": mean_val,
                "contribution_fraction": contribution,
            }

        composite = scores.get("composite_vulnerability")
        mean_composite = float(composite.mean()) if isinstance(composite, np.ndarray) else 0.0

        sorted_components = sorted(
            component_contributions.items(),
            key=lambda x: x[1]["contribution_fraction"],
            reverse=True,
        )

        explanation = {
            "mean_vulnerability_score": mean_composite,
            "component_contributions": component_contributions,
            "top_drivers": [k for k, _ in sorted_components[:3]],
            "narrative": self._generate_vulnerability_narrative(
                mean_composite, sorted_components
            ),
        }

        return explanation

    def _generate_vulnerability_narrative(
        self,
        score: float,
        sorted_components: List,
    ) -> str:
        if score >= 0.75:
            level = "very high"
        elif score >= 0.50:
            level = "high"
        elif score >= 0.25:
            level = "moderate"
        else:
            level = "low"

        top = [k.replace("_", " ") for k, _ in sorted_components[:3]]
        narrative = (
            f"The area has {level} vulnerability (score: {score:.2f}). "
            f"The primary drivers are: {', '.join(top)}."
        )
        return narrative


if __name__ == "__main__":
    from sklearn.ensemble import RandomForestRegressor

    np.random.seed(42)

    feature_names = [
        "flood_depth", "population_density", "poverty_index",
        "building_age", "distance_to_road", "rainfall_mm",
        "slope_degrees", "soil_moisture", "vegetation_index",
    ]

    X = np.random.rand(500, len(feature_names))
    y = (
        0.4 * X[:, 0] +
        0.2 * X[:, 1] +
        0.2 * X[:, 2] +
        0.1 * X[:, 3] +
        0.1 * X[:, 5] +
        np.random.rand(500) * 0.1
    )

    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)

    explainer = SHAPExplainer()

    global_exp = explainer.explain_tree_model(model, X[:100], feature_names, background=X[:100])
    print("Global feature importance:")
    for feat, score in zip(global_exp["top_features"][:5], global_exp["top_importance_scores"][:5]):
        print(f"  {feat}: {score:.4f}")

    single_exp = explainer.explain_single_prediction(
        model, X[0], feature_names, background=X[:100], model_type="tree"
    )
    print(f"\nSingle prediction explanation:")
    print(explainer.generate_text_explanation(single_exp, prediction_label="damage score"))
