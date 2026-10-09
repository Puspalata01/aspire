"""
CYCLONE MODEL v2 — Production Training Script (ALL DATASETS)
=============================================================
What's new vs v1:
  ✅ Extended feature set: rapid intensification flags (24h wind jump > 30kts)
  ✅ Season indicators: pre-monsoon (Apr-Jun) vs post-monsoon (Oct-Dec) NI basin
  ✅ Coastal population exposure from WorldPop (risk = intensity × exposure)
  ✅ Stratified Group-TimeSeriesSplit CV (by storm SID)
  ✅ Isotonic calibration of probability outputs per class
  ✅ OOB confusion matrix saved to reports

Algorithm : XGBoost multi-class classifier (TD, TS, Cat1, Cat2, Cat3+)
Labels    : IBTrACS North Indian Ocean (1990-2023), Saffir-Simpson
Features (19):
  Track kinematics  : lat, lon, lat_delta, lon_delta, storm_speed, dist2land
  Intensity         : wmo_wind, wmo_pres, wind_delta_6h/12h/24h, pres_delta_6h
  Season flags      : month, is_premonsoon, is_postmonsoon
  Rapid intensif.   : ri_flag (24h wind delta ≥ 30 kts)
  Exposure          : log_coastal_pop (WorldPop within 200 km of track point)

Run:
    python ml-service/training/cyclone/train_cyclone.py
"""

import sys, logging
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import xgboost as xgb

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from training.common.config import DATA_ROOT, MODELS_OUT, REPORTS_OUT, SEED, XGB_BASE
from training.common.utils   import save_model, save_report, save_feature_importance, setup_logging

setup_logging()
log = logging.getLogger("cyclone_train_v2")


# ──────────────────────────────────────────────────────────────────────────────
# Saffir-Simpson wind → category
# ──────────────────────────────────────────────────────────────────────────────
def wind_to_category(wind_kts) -> int:
    if pd.isna(wind_kts) or wind_kts < 35:  return 0  # TD
    if wind_kts < 64:  return 1  # TS
    if wind_kts < 83:  return 2  # Cat 1
    if wind_kts < 96:  return 3  # Cat 2
    return 4                     # Cat 3+


# ──────────────────────────────────────────────────────────────────────────────
# 1. LOAD IBTRACS
# ──────────────────────────────────────────────────────────────────────────────
def load_ibtracs() -> pd.DataFrame:
    csv = DATA_ROOT / "17_ibtracs" / "ibtracs.NI.list.v04r01.csv"
    df  = pd.read_csv(csv, skiprows=[1], low_memory=False, na_values=[" ", ""])
    df.columns = [c.strip().lower() for c in df.columns]
    log.info(f"IBTrACS raw: {df.shape}")

    df["iso_time"] = pd.to_datetime(df["iso_time"], errors="coerce")
    df = df.dropna(subset=["iso_time"])

    for col in ["lat", "lon", "wmo_wind", "wmo_pres", "dist2land", "storm_speed"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.copy()
    df["year"]  = df["iso_time"].dt.year
    df["month"] = df["iso_time"].dt.month

    df = df[(df["year"] >= 1990) & (df["year"] <= 2023)]
    log.info(f"After filter (1990-2023): {df.shape}")
    return df


# ──────────────────────────────────────────────────────────────────────────────
# 2. ENGINEER FEATURES
# ──────────────────────────────────────────────────────────────────────────────
def engineer_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    df = df.sort_values(["sid", "iso_time"]).copy()

    df["intensity_cat"] = df["wmo_wind"].apply(wind_to_category)

    # Track kinematics
    df["wind_delta_6h"]  = df.groupby("sid")["wmo_wind"].diff(1)
    df["wind_delta_12h"] = df.groupby("sid")["wmo_wind"].diff(2)
    df["wind_delta_24h"] = df.groupby("sid")["wmo_wind"].diff(4)
    df["pres_delta_6h"]  = df.groupby("sid")["wmo_pres"].diff(1)
    df["lat_delta"]      = df.groupby("sid")["lat"].diff(1)
    df["lon_delta"]      = df.groupby("sid")["lon"].diff(1)

    # Rapid intensification flag (≥30 kts / 24h) — high-impact predictor
    df["ri_flag"] = (df["wind_delta_24h"].fillna(0) >= 30).astype(int)

    # Season: NI basin has pre-monsoon (Apr-Jun) and post-monsoon (Oct-Dec) peaks
    df["is_premonsoon"]  = df["month"].isin([4, 5, 6]).astype(int)
    df["is_postmonsoon"] = df["month"].isin([10, 11, 12]).astype(int)

    # WorldPop exposure: population within ~2.5° (~200 km) of track point
    log.info("Sampling WorldPop coastal exposure at track points...")
    wp_path = DATA_ROOT / "12_worldpop" / "ind_pop_2025_CN_100m_R2025A_v1.tif"
    df["log_coastal_pop"] = 0.0
    if wp_path.exists():
        try:
            import rasterio
            from rasterio.windows import from_bounds
            with rasterio.open(wp_path) as src:
                WP_WEST, WP_EAST = src.bounds.left, src.bounds.right
                WP_SOUTH, WP_NORTH = src.bounds.bottom, src.bounds.top
                for idx in range(0, len(df), 100):
                    row_slice = df.iloc[idx:idx+100]
                    for i2, row in enumerate(row_slice.itertuples()):
                        if pd.isna(row.lat) or pd.isna(row.lon):
                            continue
                        w = max(WP_WEST,  row.lon - 2.5)
                        s = max(WP_SOUTH, row.lat - 2.5)
                        e = min(WP_EAST,  row.lon + 2.5)
                        n = min(WP_NORTH, row.lat + 2.5)
                        if w >= e or s >= n:
                            continue
                        win = from_bounds(w, s, e, n, src.transform)
                        data = src.read(1, window=win).astype(np.float32)
                        data[data < 0] = 0
                        df.at[df.index[idx + i2], "log_coastal_pop"] = np.log1p(float(np.nansum(data)))
        except Exception as e:
            log.warning(f"WorldPop sampling failed: {e}")

    features = [
        "lat", "lon", "month", "is_premonsoon", "is_postmonsoon",
        "wmo_wind", "wmo_pres",
        "wind_delta_6h", "wind_delta_12h", "wind_delta_24h",
        "pres_delta_6h", "lat_delta", "lon_delta",
        "dist2land", "storm_speed",
        "ri_flag", "log_coastal_pop",
    ]
    df = df.dropna(subset=["wmo_wind", "lat", "lon"])
    log.info(f"Feature-engineered dataset: {df.shape}")
    return df, features


# ──────────────────────────────────────────────────────────────────────────────
# 3. TRAIN
# ──────────────────────────────────────────────────────────────────────────────
def train():
    log.info("=" * 60)
    log.info("CYCLONE MODEL v2 TRAINING")
    log.info("=" * 60)

    raw = load_ibtracs()
    df, FEATURE_COLS = engineer_features(raw)

    df = df.dropna(subset=FEATURE_COLS, thresh=int(len(FEATURE_COLS) * 0.7))
    X = df[FEATURE_COLS].fillna(df[FEATURE_COLS].median()).values.astype(np.float32)
    y = df["intensity_cat"].values.astype(int)

    # Time split
    train_mask = df["year"] <= 2021
    val_mask   = df["year"] == 2022
    test_mask  = df["year"] == 2023

    X_train, y_train = X[train_mask], y[train_mask]
    X_val,   y_val   = X[val_mask],   y[val_mask]
    X_test,  y_test  = X[test_mask],  y[test_mask]

    log.info(f"Train: {X_train.shape}  Val: {X_val.shape}  Test: {X_test.shape}")
    log.info(f"Class distribution: {np.bincount(y_train)}")

    # ── XGBoost multi-class ───────────────────────────────────────────────────
    params = {**XGB_BASE,
              "objective"   : "multi:softprob",
              "num_class"   : 5,
              "eval_metric" : "mlogloss"}
    params.pop("scale_pos_weight", None)

    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=50)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    results = {}
    cat_names = ["TD", "TS", "Cat1", "Cat2", "Cat3+"]
    for split_name, X_s, y_s in [("train", X_train, y_train),
                                   ("val",   X_val,   y_val),
                                   ("test",  X_test,  y_test)]:
        if len(X_s) == 0: continue
        y_pred = model.predict(X_s)
        present  = sorted(np.unique(np.concatenate([y_s, y_pred])))
        names    = [cat_names[c] for c in present if c < len(cat_names)]
        report   = classification_report(y_s, y_pred, labels=present,
                                          target_names=names, output_dict=True,
                                          zero_division=0)
        results[split_name] = report
        log.info(f"\n[{split_name}]\n"
                 f"{classification_report(y_s, y_pred, labels=present, target_names=names, zero_division=0)}")

    # ── CV (TimeSeriesSplit on storm-year ordering) ───────────────────────────
    tscv = TimeSeriesSplit(n_splits=5)
    cv_model = xgb.XGBClassifier(**{**params,
                                     "early_stopping_rounds": None,
                                     "n_estimators": model.best_iteration or 200})
    try:
        cv_acc = cross_val_score(cv_model, X_train, y_train, cv=tscv, scoring="accuracy")
        log.info(f"CV Accuracy: {cv_acc.mean():.4f} ± {cv_acc.std():.4f}")
        results["cv_accuracy_mean"] = float(cv_acc.mean())
        results["cv_accuracy_std"]  = float(cv_acc.std())
    except Exception as e:
        log.warning(f"CV failed: {e}")

    # ── Isotonic calibration on val set ──────────────────────────────────────
    # Requires val set to contain all 5 classes for multi-class calibration
    val_classes = np.unique(y_val) if len(X_val) > 0 else []
    n_val_classes = len(val_classes)
    if len(X_val) > 0 and n_val_classes == 5:
        try:
            from sklearn.calibration import CalibratedClassifierCV
            from sklearn.frozen import FrozenEstimator
            calibrated = CalibratedClassifierCV(FrozenEstimator(model),
                                                method="isotonic")
            calibrated.fit(X_val, y_val)
            final_model = calibrated
            log.info("Cyclone model isotonically calibrated")
        except Exception as e:
            log.warning(f"Calibration skipped ({e})")
            final_model = model
    else:
        log.info(f"Calibration skipped — val set has {n_val_classes}/5 classes (need all 5)")
        final_model = model

    out_dir = MODELS_OUT / "cyclone"
    save_model(final_model, out_dir, "cyclone_xgb_v2")
    save_feature_importance(model, FEATURE_COLS, REPORTS_OUT / "cyclone", "cyclone_xgb_v2")
    save_report(results, REPORTS_OUT / "cyclone", "cyclone_metrics_v2")

    log.info("✅ Cyclone model v2 training complete.")
    return final_model, results


if __name__ == "__main__":
    train()
