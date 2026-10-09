"""
Common utilities: metrics, saving, cross-validation helpers.
"""
import json, joblib, logging
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.metrics import (
    roc_auc_score, average_precision_score, classification_report,
    confusion_matrix, f1_score, precision_score, recall_score,
)

log = logging.getLogger(__name__)


# ── Evaluation ────────────────────────────────────────────────────────────────

def evaluate_binary(y_true, y_prob, threshold: float = 0.5, label: str = "") -> dict:
    """Full binary-classification metric suite."""
    y_pred = (y_prob >= threshold).astype(int)
    auc    = roc_auc_score(y_true, y_prob)
    ap     = average_precision_score(y_true, y_prob)
    f1     = f1_score(y_true, y_pred, zero_division=0)
    prec   = precision_score(y_true, y_pred, zero_division=0)
    rec    = recall_score(y_true, y_pred, zero_division=0)
    cm     = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, cm[0, 0])

    metrics = dict(
        label      = label,
        threshold  = threshold,
        auc_roc    = round(auc,  4),
        avg_prec   = round(ap,   4),
        f1         = round(f1,   4),
        precision  = round(prec, 4),
        recall     = round(rec,  4),
        tp=int(tp), fp=int(fp), fn=int(fn), tn=int(tn),
        n_positive = int(y_true.sum()),
        n_negative = int((1 - y_true).sum()),
    )
    log.info(
        f"[{label}] AUC={auc:.4f}  AP={ap:.4f}  F1={f1:.4f}  "
        f"P={prec:.4f}  R={rec:.4f}  |  TP={tp} FP={fp} FN={fn} TN={tn}"
    )
    return metrics


def evaluate_multiclass(y_true, y_pred, classes=None, label: str = "") -> dict:
    report = classification_report(y_true, y_pred, target_names=classes, output_dict=True)
    log.info(f"[{label}] Classification report:\n{classification_report(y_true, y_pred, target_names=classes)}")
    return report


# ── Persistence ───────────────────────────────────────────────────────────────

def save_model(model, out_dir: Path, name: str) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    ts   = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    path = out_dir / f"{name}_{ts}.pkl"
    joblib.dump(model, path)
    log.info(f"Model saved → {path}")
    return path


def save_report(metrics: dict, out_dir: Path, name: str) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    ts   = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    path = out_dir / f"{name}_{ts}.json"
    with open(path, "w") as f:
        json.dump(metrics, f, indent=2, default=str)
    log.info(f"Report saved → {path}")
    return path


def save_feature_importance(model, feature_names, out_dir: Path, name: str):
    """Works for XGBoost, RandomForest, any sklearn estimator with feature_importances_."""
    if not hasattr(model, "feature_importances_"):
        return
    fi = pd.Series(model.feature_importances_, index=feature_names).sort_values(ascending=False)
    out_dir.mkdir(parents=True, exist_ok=True)
    fi.to_csv(out_dir / f"{name}_feature_importance.csv")
    log.info(f"Top-10 features:\n{fi.head(10).to_string()}")


# ── Class imbalance ───────────────────────────────────────────────────────────

def compute_scale_pos_weight(y: np.ndarray) -> float:
    """XGBoost scale_pos_weight for imbalanced binary labels."""
    neg = (y == 0).sum()
    pos = (y == 1).sum()
    spw = neg / (pos + 1e-9)
    log.info(f"Class balance → neg={neg}  pos={pos}  scale_pos_weight={spw:.2f}")
    return float(spw)


# ── Logging setup ─────────────────────────────────────────────────────────────

def setup_logging(level=logging.INFO):
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
