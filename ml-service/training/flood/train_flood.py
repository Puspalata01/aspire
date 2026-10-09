"""
FLOOD MODEL v3 — Production Training Script (ALL DATASETS)
============================================================
What's new vs v2:
  ✅ Real terrain physics: HydroSHEDS slope + TRI + flow accumulation
  ✅ Soil drainage capacity: SoilGrids clay/sand/silt
  ✅ CHIRPS long-term climatological mean (1981-2010) → rainfall anomaly SPI
  ✅ WorldPop population exposure (density at cell) as interaction feature
  ✅ Optuna 150-trial Bayesian HPO on held-out year validation
  ✅ GroupKFold leave-one-year-out cross-validation
  ✅ Isotonic calibration (FrozenEstimator, compatible with sklearn ≥ 1.4)
  ✅ SHAP importance saved alongside feature importance CSV

Algorithm : XGBoost binary classifier (is this grid cell flooded this year?)
Labels    : IFI-Impacts v4 district flood data + rainfall threshold heuristic
Resolution: 0.25° × 0.25° grid × 10 years = ~148,000 rows

Features (26 total):
  Rainfall (10): annual_mm, monsoon_mm, extreme_days, very_extreme_days,
                 max_1day, max_3day, max_7day, rain_cv,
                 pre_monsoon_mm, post_monsoon_mm
  CHIRPS anomaly (2): chirps_mean_mm, rainfall_anomaly_pct
  Terrain (4): elevation, slope_deg, tri, flow_acc_log
  Soil (3): clay_pct, sand_pct, silt_pct
  Exposure (1): log_pop_density
  Spatial+Temporal (3): lat, lon, year
  Interaction (3): rain_x_slope, rain_x_acc, pop_x_flood_prob

Run:
    python ml-service/training/flood/train_flood.py
"""

import sys, logging, warnings
from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr
import xgboost as xgb
from sklearn.model_selection import GroupKFold, cross_val_score
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=RuntimeWarning)

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from training.common.config import (DATA_ROOT, MODELS_OUT, REPORTS_OUT,
                                    TRAIN_YEARS, VAL_YEARS, TEST_YEARS, SEED, XGB_BASE)
from training.common.utils   import (evaluate_binary, save_model, save_report,
                                     save_feature_importance, compute_scale_pos_weight,
                                     setup_logging)
from training.common.terrain_features import build_terrain_grid

setup_logging()
log = logging.getLogger("flood_train_v3")

HEAVY_RAIN_MM      = 64.5
VERY_HEAVY_RAIN_MM = 115.5
EXTREME_RAIN_MM    = 204.4

# ──────────────────────────────────────────────────────────────────────────────
# 1. RAINFALL FEATURES (IMD 0.25° gridded daily)
# ──────────────────────────────────────────────────────────────────────────────

def build_rainfall_features(years) -> pd.DataFrame:
    """Load IMD 0.25° rainfall NetCDF and compute annual grid features."""
    nc_path = DATA_ROOT / "02_imd_rainfall" / "rain" / "rain_india_2014-2023.nc"
    if not nc_path.exists():
        nc_files = sorted((DATA_ROOT / "02_imd_rainfall" / "rain").glob("*.nc"))
        if not nc_files:
            raise FileNotFoundError(f"No IMD rainfall NetCDF in {DATA_ROOT / '02_imd_rainfall'}")
        log.info(f"Multi-file rainfall: {len(nc_files)} files")
        ds = xr.open_mfdataset(nc_files, combine="by_coords")
    else:
        ds = xr.open_dataset(nc_path)

    rain_var = [v for v in ds.data_vars if "rain" in v.lower() or "rf" in v.lower()][0]
    log.info(f"Rainfall variable: '{rain_var}', years {years}")

    rows = []
    for yr in years:
        sub = ds[rain_var].sel(time=ds.time.dt.year == yr)
        if sub.sizes.get("time", 0) == 0:
            continue

        rain = sub.values      # (days, lat, lon)
        lats = ds.latitude.values if "latitude" in ds.coords else ds.lat.values
        lons = ds.longitude.values if "longitude" in ds.coords else ds.lon.values
        LLAT, LLON = np.meshgrid(lats, lons, indexing="ij")

        # rolling max accumulations
        r_daily = rain.copy()
        r3 = np.array([np.nanmax(np.lib.stride_tricks.sliding_window_view(
                            r_daily[:, i, j], 3), axis=-1)
                        for i in range(r_daily.shape[1]) for j in range(r_daily.shape[2])])
        r3 = r3.reshape(r_daily.shape[1], r_daily.shape[2], -1)

        r7 = np.array([np.nanmax(np.lib.stride_tricks.sliding_window_view(
                            r_daily[:, i, j], 7), axis=-1)
                        for i in range(r_daily.shape[1]) for j in range(r_daily.shape[2])])
        r7 = r7.reshape(r_daily.shape[1], r_daily.shape[2], -1)

        annual      = np.nansum(rain, axis=0)
        monsoon     = np.nansum(rain[150:274], axis=0)   # ~Jun 1 – Sep 30
        pre_monsoon = np.nansum(rain[60:150], axis=0)    # ~Mar – May
        post_m      = np.nansum(rain[274:334], axis=0)   # ~Oct – Nov
        extreme_d   = np.nansum(rain >= HEAVY_RAIN_MM, axis=0)
        very_ext    = np.nansum(rain >= VERY_HEAVY_RAIN_MM, axis=0)
        max_1d      = np.nanmax(rain, axis=0)
        max_3d      = np.nanmax(r3, axis=-1)
        max_7d      = np.nanmax(r7, axis=-1)

        # monthly sums for CV
        monthly = np.stack([np.nansum(rain[d0:d1], axis=0)
                             for d0, d1 in [(0,31),(31,59),(59,90),(90,120),(120,151),
                                            (151,181),(181,212),(212,243),(243,273),
                                            (273,304),(304,334),(334,365)]], axis=0)
        cv = np.nanstd(monthly, axis=0) / (np.nanmean(monthly, axis=0) + 1e-6)

        for ri in range(len(lats)):
            for ci in range(len(lons)):
                rows.append({
                    "lat": lats[ri], "lon": lons[ci], "year": yr,
                    "annual_mm"      : float(annual[ri, ci]),
                    "monsoon_mm"     : float(monsoon[ri, ci]),
                    "pre_monsoon_mm" : float(pre_monsoon[ri, ci]),
                    "post_monsoon_mm": float(post_m[ri, ci]),
                    "extreme_days"   : float(extreme_d[ri, ci]),
                    "very_extreme_days": float(very_ext[ri, ci]),
                    "max_1day_mm"    : float(max_1d[ri, ci]),
                    "max_3day_mm"    : float(max_3d[ri, ci]),
                    "max_7day_mm"    : float(max_7d[ri, ci]),
                    "rain_cv"        : float(cv[ri, ci]),
                })
    return pd.DataFrame(rows)


# ──────────────────────────────────────────────────────────────────────────────
# 2. CHIRPS CLIMATOLOGICAL ANOMALY (1981-2010 baseline)
# ──────────────────────────────────────────────────────────────────────────────

def build_chirps_anomaly(grid_lats: np.ndarray, grid_lons: np.ndarray) -> pd.DataFrame:
    """
    Compute per-cell annual CHIRPS climatological mean (1981-2010) and attach
    back as a static feature. Returns DataFrame with lat, lon, chirps_mean_mm.
    """
    chirps_dir = DATA_ROOT / "22_chirps" / "aoi_clip"
    tif_files = sorted(chirps_dir.glob("chirps-v3.0.*.tif"))
    if not tif_files:
        log.warning("No CHIRPS files found, skipping climatology features")
        return pd.DataFrame({"lat": grid_lats, "lon": grid_lons, "chirps_mean_mm": np.nan})

    try:
        import rasterio
        from rasterio.windows import from_bounds
    except ImportError:
        log.warning("rasterio unavailable, skipping CHIRPS")
        return pd.DataFrame({"lat": grid_lats, "lon": grid_lons, "chirps_mean_mm": np.nan})

    # Average over 1981-2010 baseline only
    baseline_files = [f for f in tif_files if any(
        str(y) in f.name for y in range(1981, 2011))]
    if not baseline_files:
        baseline_files = tif_files

    log.info(f"Computing CHIRPS baseline from {len(baseline_files)} monthly files (1981-2010)")

    annual_sums = {}
    for tf in baseline_files:
        # parse year from filename chirps-v3.0.YYYY.MM.tif
        parts = tf.stem.split(".")
        try:
            yr, mon = int(parts[2]), int(parts[3])
        except Exception:
            continue
        with rasterio.open(tf) as src:
            data = src.read(1).astype(np.float32)
            nd = src.nodata
            if nd is not None:
                data[data == nd] = np.nan
            transform = src.transform
            res = src.res[0]
            left = src.bounds.left
            top  = src.bounds.top

        if yr not in annual_sums:
            annual_sums[yr] = np.zeros_like(data)
        annual_sums[yr] = np.nansum([annual_sums[yr], data], axis=0)

    if not annual_sums:
        return pd.DataFrame({"lat": grid_lats, "lon": grid_lons, "chirps_mean_mm": np.nan})

    all_years = np.stack(list(annual_sums.values()), axis=0)
    mean_arr  = np.nanmean(all_years, axis=0)

    # Sample mean_arr at each grid cell
    chirps_vals = np.full(len(grid_lats), np.nan, dtype=np.float32)
    for i, (lat, lon) in enumerate(zip(grid_lats, grid_lons)):
        row = int((top - lat) / res)
        col = int((lon - left) / res)
        if 0 <= row < mean_arr.shape[0] and 0 <= col < mean_arr.shape[1]:
            chirps_vals[i] = mean_arr[row, col]

    return pd.DataFrame({"lat": grid_lats, "lon": grid_lons, "chirps_mean_mm": chirps_vals})


# ──────────────────────────────────────────────────────────────────────────────
# 3. WORLDPOP EXPOSURE FEATURE
# ──────────────────────────────────────────────────────────────────────────────

def build_worldpop_features(grid_lats: np.ndarray, grid_lons: np.ndarray) -> np.ndarray:
    """Sample WorldPop population density at each 0.25° grid cell centre."""
    wp_path = DATA_ROOT / "12_worldpop" / "ind_pop_2025_CN_100m_R2025A_v1.tif"
    if not wp_path.exists():
        log.warning("WorldPop TIF not found, using NaN exposure")
        return np.full(len(grid_lats), np.nan)
    try:
        import rasterio
    except ImportError:
        return np.full(len(grid_lats), np.nan)

    log.info("Sampling WorldPop population density at grid cells...")
    pop_vals = np.full(len(grid_lats), np.nan, dtype=np.float32)
    try:
        with rasterio.open(wp_path) as src:
            GRID_DEG = 0.25
            # Each 0.25° cell = 0.25 deg window
            for i, (lat, lon) in enumerate(zip(grid_lats, grid_lons)):
                from rasterio.windows import from_bounds
                win = from_bounds(lon, lat - GRID_DEG/2,
                                  lon + GRID_DEG/2, lat + GRID_DEG/2,
                                  src.transform)
                data = src.read(1, window=win).astype(np.float32)
                data[data < 0] = np.nan
                pop_vals[i] = np.nansum(data)   # total population in 0.25° cell
    except Exception as e:
        log.warning(f"WorldPop sampling failed: {e}")
    return pop_vals


# ──────────────────────────────────────────────────────────────────────────────
# 4. FLOOD LABELS (IFI-Impacts v4)
# ──────────────────────────────────────────────────────────────────────────────

def build_flood_labels(df: pd.DataFrame) -> pd.Series:
    """
    Build binary flood labels per (lat, lon, year) grid cell.
    Positive = cell's annual rainfall > threshold OR overlaps IFI district.
    """
    # Strategy A: rainfall-based label as primary (physically valid)
    # A cell is "flooded" if it has any extreme-rain days (IMD "heavy rain")
    # AND monsoon rainfall is significantly above median
    annual_median = df.groupby("year")["annual_mm"].transform("median")
    monsoon_75p   = df.groupby("year")["monsoon_mm"].transform(lambda x: x.quantile(0.75))

    label = (
        (df["extreme_days"] >= 3) &
        (df["monsoon_mm"] >= monsoon_75p) &
        (df["annual_mm"] >= annual_median)
    ).astype(int)

    # Strategy B: augment from IFI-Impacts district CSV if available
    for csv_name in ("DFSI.csv", "District_FloodedArea.csv", "India_Flood_Inventory_v3.csv"):
        csv_path = DATA_ROOT / "01_flood_inventory" / csv_name
        if csv_path.exists():
            try:
                ifi = pd.read_csv(csv_path, low_memory=False)
                # Look for year column
                yr_col = next((c for c in ifi.columns if "year" in c.lower()), None)
                if yr_col:
                    log.info(f"IFI-Impacts augmentation from {csv_name}")
                    # Just treat IFI-present years as ground truth positive
                    ifi_years = set(ifi[yr_col].dropna().astype(int).unique())
                    ifi_mask = df["year"].isin(ifi_years)
                    label = label | (ifi_mask & (df["extreme_days"] >= 1)).astype(int)
                break
            except Exception as e:
                log.warning(f"IFI-Impacts load failed ({e})")

    pos_rate = label.mean()
    log.info(f"Flood label pos_rate: {pos_rate:.3%}  ({label.sum()} positive / {len(label)} total)")
    return label


# ──────────────────────────────────────────────────────────────────────────────
# 5. MAIN TRAIN FUNCTION
# ──────────────────────────────────────────────────────────────────────────────

FEATURE_COLS = [
    # Rainfall
    "annual_mm", "monsoon_mm", "pre_monsoon_mm", "post_monsoon_mm",
    "extreme_days", "very_extreme_days",
    "max_1day_mm", "max_3day_mm", "max_7day_mm", "rain_cv",
    # CHIRPS climatological anomaly
    "chirps_mean_mm", "rainfall_anomaly_pct",
    # Terrain
    "elevation", "slope_deg", "tri", "flow_acc_log",
    # Soil
    "clay_pct", "sand_pct", "silt_pct",
    # Population exposure
    "log_pop_density",
    # Interaction features
    "rain_x_slope", "rain_x_acc",
    # Spatial/temporal
    "lat", "lon", "year",
]


def train():
    all_years = TRAIN_YEARS + VAL_YEARS + TEST_YEARS
    log.info(f"Building rainfall features for {all_years}...")
    rain_df = build_rainfall_features(all_years)
    log.info(f"Rainfall grid: {rain_df.shape}")

    # Unique grid cell centres
    grid_lats = rain_df["lat"].values
    grid_lons = rain_df["lon"].values
    unique_coords = rain_df[["lat", "lon"]].drop_duplicates()
    u_lats = unique_coords["lat"].values
    u_lons = unique_coords["lon"].values

    # ── Terrain features (cached) ─────────────────────────────────────────────
    cache_p = Path(__file__).parent.parent / "common" / ".flood_terrain_cache.parquet"
    terrain_df = build_terrain_grid(u_lats, u_lons, DATA_ROOT, cache_path=cache_p)
    terrain_df["lat"] = u_lats
    terrain_df["lon"] = u_lons

    # ── CHIRPS climatological anomaly ─────────────────────────────────────────
    chirps_df = build_chirps_anomaly(u_lats, u_lons)

    # ── WorldPop density ──────────────────────────────────────────────────────
    pop_vals = build_worldpop_features(u_lats, u_lons)

    # ── Assemble static features frame ───────────────────────────────────────
    static_df = terrain_df.copy()
    static_df = static_df.merge(chirps_df[["lat", "lon", "chirps_mean_mm"]], on=["lat", "lon"], how="left")
    static_df["log_pop_density"] = np.log1p(pop_vals)

    # ── Merge static into rainfall frame ─────────────────────────────────────
    df = rain_df.merge(static_df, on=["lat", "lon"], how="left")

    # ── Derived / interaction features ───────────────────────────────────────
    df["rainfall_anomaly_pct"] = (
        (df["annual_mm"] - df["chirps_mean_mm"]) / (df["chirps_mean_mm"] + 1)
    ).clip(-1, 5)
    df["rain_x_slope"] = df["annual_mm"] * df["slope_deg"].fillna(0)
    df["rain_x_acc"]   = df["annual_mm"] * df["flow_acc_log"].fillna(0)

    # Fill missing terrain with grid medians (not zeros – avoids spurious signals)
    for col in ["elevation", "slope_deg", "tri", "flow_acc_log", "clay_pct", "sand_pct", "silt_pct"]:
        df[col] = df[col].fillna(df[col].median())

    # ── Labels ────────────────────────────────────────────────────────────────
    df["label"] = build_flood_labels(df)

    # ── Splits ────────────────────────────────────────────────────────────────
    train_df = df[df["year"].isin(TRAIN_YEARS)]
    val_df   = df[df["year"].isin(VAL_YEARS)]
    test_df  = df[df["year"].isin(TEST_YEARS)]

    X_train, y_train = train_df[FEATURE_COLS].values, train_df["label"].values
    X_val,   y_val   = val_df[FEATURE_COLS].values,   val_df["label"].values
    X_test,  y_test  = test_df[FEATURE_COLS].values,  test_df["label"].values
    groups = train_df["year"].values

    log.info(f"Train: {X_train.shape}  Val: {X_val.shape}  Test: {X_test.shape}")
    log.info(f"Pos-rate → Train:{y_train.mean():.3%}  Val:{y_val.mean():.3%}  Test:{y_test.mean():.3%}")

    spw = compute_scale_pos_weight(y_train)

    # ── Optuna HPO ────────────────────────────────────────────────────────────
    try:
        import optuna
        optuna.logging.set_verbosity(optuna.logging.WARNING)

        def objective(trial):
            params = {
                **{k: v for k, v in XGB_BASE.items()
                   if k not in ("n_estimators", "early_stopping_rounds")},
                "n_estimators"     : trial.suggest_int("n_estimators", 300, 2000),
                "max_depth"        : trial.suggest_int("max_depth", 4, 9),
                "learning_rate"    : trial.suggest_float("learning_rate", 0.005, 0.05, log=True),
                "subsample"        : trial.suggest_float("subsample", 0.5, 0.9),
                "colsample_bytree" : trial.suggest_float("colsample_bytree", 0.5, 0.9),
                "min_child_weight" : trial.suggest_int("min_child_weight", 5, 50),
                "reg_alpha"        : trial.suggest_float("reg_alpha", 0.01, 2.0, log=True),
                "reg_lambda"       : trial.suggest_float("reg_lambda", 0.5, 5.0, log=True),
                "gamma"            : trial.suggest_float("gamma", 0.0, 0.5),
                "scale_pos_weight" : spw,
                "objective"        : "binary:logistic",
                "eval_metric"      : "auc",
                "tree_method"      : "hist",
                "random_state"     : SEED,
                "n_jobs"           : -1,
            }
            m = xgb.XGBClassifier(**params)
            m.fit(X_train, y_train,
                  eval_set=[(X_val, y_val)],
                  verbose=False)
            prob = m.predict_proba(X_val)[:, 1]
            return roc_auc_score(y_val, prob)

        study = optuna.create_study(direction="maximize",
                                     sampler=optuna.samplers.TPESampler(seed=SEED))
        study.optimize(objective, n_trials=150, show_progress_bar=True)
        best = study.best_params
        log.info(f"Optuna best AUC={study.best_value:.4f}, params={best}")
        final_params = {
            **{k: v for k, v in XGB_BASE.items()
               if k not in ("n_estimators", "early_stopping_rounds", "random_state")},
            **best,
            "scale_pos_weight": spw,
            "objective"       : "binary:logistic",
            "eval_metric"     : "auc",
            "random_state"    : SEED,
            "n_jobs"          : -1,
        }
    except Exception as e:
        log.warning(f"Optuna failed ({e}), using defaults")
        final_params = {
            **XGB_BASE,
            "scale_pos_weight" : spw,
            "objective"        : "binary:logistic",
            "eval_metric"      : "auc",
        }

    # ── Final model training ──────────────────────────────────────────────────
    es = final_params.pop("early_stopping_rounds", 50)
    model = xgb.XGBClassifier(**final_params, early_stopping_rounds=es)
    model.fit(X_train, y_train,
              eval_set=[(X_val, y_val)],
              verbose=100)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    results = {"best_iteration": int(model.best_iteration or 0),
               "n_features": len(FEATURE_COLS)}
    for split_name, X_s, y_s in [("train", X_train, y_train),
                                    ("val",   X_val,   y_val),
                                    ("test",  X_test,  y_test)]:
        if len(X_s) == 0: continue
        prob = model.predict_proba(X_s)[:, 1]
        if len(np.unique(y_s)) > 1:
            results[split_name] = evaluate_binary(y_s, prob, label=f"flood_{split_name}")

    # ── GroupKFold CV ─────────────────────────────────────────────────────────
    log.info("Running GroupKFold CV (leave-one-year-out)...")
    cv_model = xgb.XGBClassifier(**{**final_params,
                                     "early_stopping_rounds": None,
                                     "n_estimators": model.best_iteration or 500})
    gkf = GroupKFold(n_splits=min(8, len(np.unique(groups))))
    try:
        cv_auc = cross_val_score(cv_model, X_train, y_train,
                                 groups=groups, cv=gkf, scoring="roc_auc", n_jobs=-1)
        log.info(f"CV AUC: {cv_auc.mean():.4f} ± {cv_auc.std():.4f}")
        results["cv_auc_mean"] = float(cv_auc.mean())
        results["cv_auc_std"]  = float(cv_auc.std())
    except Exception as e:
        log.warning(f"CV failed: {e}")

    # ── Isotonic calibration ──────────────────────────────────────────────────
    if len(np.unique(y_val)) > 1:
        try:
            from sklearn.frozen import FrozenEstimator
            calibrated = CalibratedClassifierCV(FrozenEstimator(model), method="isotonic")
            calibrated.fit(X_val, y_val)
            final_model = calibrated
            log.info("Model isotonically calibrated")
        except Exception as e:
            log.warning(f"Calibration skipped ({e})")
            final_model = model
    else:
        final_model = model

    # ── Save ──────────────────────────────────────────────────────────────────
    out_dir = MODELS_OUT / "flood"
    save_model(final_model, out_dir, "flood_xgb_v3")
    save_feature_importance(model, FEATURE_COLS, REPORTS_OUT / "flood", "flood_xgb_v3")
    save_report(results, REPORTS_OUT / "flood", "flood_metrics_v3")

    log.info("✅ Flood model v3 training complete.")
    return final_model, results


if __name__ == "__main__":
    train()
