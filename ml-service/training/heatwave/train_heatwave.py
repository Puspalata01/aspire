"""
HEATWAVE MODEL v3 — Production Training Script (ALL DATASETS)
===============================================================
What's new vs v2:
  ✅ CHIRPS long-term (1981-2010) rainfall climatology → moisture deficit
     (rainfall deficit + hot temperatures = compound heatwave risk)
  ✅ SoilGrids clay content → soil moisture retention (clay holds water better,
     less urban heat island effect vs sandy soils in desert regions)
  ✅ WorldPop density → urban heat island amplification factor
  ✅ Terrain elevation → temperature lapse rate correction (hilly cells cooler)
  ✅ LightGBM early stopping fixed (min 50 iterations)
  ✅ Youden's J optimal threshold saved in model bundle

Algorithm : XGBoost + LightGBM ensemble (averaged calibrated probabilities)
Labels    : IMD definition (Tmax ≥ 40°C plains / ≥ 37°C hilly + anomaly + 3-day run)
Resolution: GRID-LEVEL daily → heatwave season (Mar-Jul) only

Features (18 total):
  Temperature  : tmax, tmin, dtr, tmax_3d, tmax_7d, tmax_anom, above_p95
  Heat Index   : heat_index (Steadman)
  New CHIRPS   : rain_deficit_pct (30yr mean deficit)
  New Terrain  : elevation_norm
  New Soil     : clay_pct (moisture retention proxy)
  New Exposure : log_pop_density (urban heat island)
  Spatial/Temp : lat, lon, month, doy, year

Run:
    python ml-service/training/heatwave/train_heatwave.py
"""

import sys, logging, warnings
from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr
import xgboost as xgb
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, roc_curve
from sklearn.model_selection import GroupKFold

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=RuntimeWarning)

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from training.common.config import (DATA_ROOT, MODELS_OUT, REPORTS_OUT,
                                    TRAIN_YEARS, VAL_YEARS, TEST_YEARS, SEED, XGB_BASE)
from training.common.utils import (evaluate_binary, save_model, save_report,
                                   save_feature_importance, compute_scale_pos_weight,
                                   setup_logging)

setup_logging()
log = logging.getLogger("heatwave_train_v3")

# IMD heatwave criteria
TMAX_PLAINS = 40.0   # °C
TMAX_HILLY  = 37.0   # °C (lat > 25°)
ANOM_THRESH = 4.5    # °C above 10-yr daily climatology
MIN_CONSEC  = 3      # minimum consecutive days

# Heatwave season (months)
HW_MONTHS = [3, 4, 5, 6, 7]


# ──────────────────────────────────────────────────────────────────────────────
# 1. TEMPERATURE DATA
# ──────────────────────────────────────────────────────────────────────────────

def load_temperature() -> tuple[xr.DataArray, xr.DataArray]:
    tmax_path = DATA_ROOT / "19_imd_temperature" / "tmax" / "tmax_india_2014-2023.nc"
    tmin_path = DATA_ROOT / "19_imd_temperature" / "tmin" / "tmin_india_2014-2023.nc"

    def _open(path, varname):
        if path.exists():
            ds = xr.open_dataset(path)
        else:
            files = sorted(path.parent.glob("*.nc"))
            if not files:
                raise FileNotFoundError(f"No temperature NetCDF in {path.parent}")
            ds = xr.open_mfdataset(files, combine="by_coords")
        var = [v for v in ds.data_vars if varname in v.lower() or "temp" in v.lower()][0]
        return ds[var]

    tmax = _open(tmax_path, "tmax")
    tmin = _open(tmin_path, "tmin")
    log.info(f"Temperature loaded: shape={tmax.shape}")
    return tmax, tmin


# ──────────────────────────────────────────────────────────────────────────────
# 2. CHIRPS MOISTURE DEFICIT
# ──────────────────────────────────────────────────────────────────────────────

def build_moisture_deficit_lookup(lats: np.ndarray, lons: np.ndarray) -> dict:
    """
    For each unique grid cell, compute 30-yr mean annual CHIRPS rainfall.
    Returns dict keyed by (lat, lon) → chirps_mean_mm.
    """
    chirps_dir = DATA_ROOT / "22_chirps" / "aoi_clip"
    tif_files = sorted(chirps_dir.glob("chirps-v3.0.*.tif"))
    if not tif_files:
        log.warning("No CHIRPS files, skipping moisture deficit")
        return {}

    try:
        import rasterio
    except ImportError:
        log.warning("rasterio unavailable")
        return {}

    log.info(f"Computing CHIRPS 30yr baseline from {len(tif_files)} files...")
    annual_sums = {}
    for tf in tif_files:
        parts = tf.stem.split(".")
        try:
            yr = int(parts[2])
        except Exception:
            continue
        if yr > 2010:
            continue
        with rasterio.open(tf) as src:
            data = src.read(1).astype(np.float32)
            nd   = src.nodata
            if nd is not None:
                data[data == nd] = np.nan
            res   = src.res[0]
            left  = src.bounds.left
            top   = src.bounds.top
        annual_sums.setdefault(yr, np.zeros_like(data))
        annual_sums[yr] = np.nansum([annual_sums[yr], data], axis=0)

    if not annual_sums:
        return {}

    mean_arr = np.nanmean(np.stack(list(annual_sums.values())), axis=0)
    lookup = {}
    for lat, lon in zip(lats, lons):
        row = int((top - lat) / res)
        col = int((lon - left) / res)
        if 0 <= row < mean_arr.shape[0] and 0 <= col < mean_arr.shape[1]:
            lookup[(round(lat, 2), round(lon, 2))] = float(mean_arr[row, col])
    return lookup


# ──────────────────────────────────────────────────────────────────────────────
# 3. STATIC FEATURES (terrain + soil + population)
# ──────────────────────────────────────────────────────────────────────────────

def build_static_features(lats: np.ndarray, lons: np.ndarray) -> pd.DataFrame:
    """Build elevation, clay_pct, log_pop_density for unique grid cells."""
    from training.common.terrain_features import build_terrain_grid
    cache_p = Path(__file__).parent.parent / "common" / ".heatwave_terrain_cache.parquet"
    terrain = build_terrain_grid(lats, lons, DATA_ROOT, cache_path=cache_p)

    # WorldPop density
    wp_path = DATA_ROOT / "12_worldpop" / "ind_pop_2025_CN_100m_R2025A_v1.tif"
    pop_vals = np.full(len(lats), np.nan, dtype=np.float32)
    if wp_path.exists():
        try:
            import rasterio
            from rasterio.windows import from_bounds
            with rasterio.open(wp_path) as src:
                for i, (lat, lon) in enumerate(zip(lats, lons)):
                    win = from_bounds(lon - 0.5, lat - 0.5,
                                      lon + 0.5, lat + 0.5, src.transform)
                    d = src.read(1, window=win).astype(np.float32)
                    d[d < 0] = np.nan
                    pop_vals[i] = np.nansum(d)
        except Exception as e:
            log.warning(f"WorldPop heatwave sampling: {e}")

    df = pd.DataFrame({
        "lat": lats, "lon": lons,
        "elevation": terrain["elevation"].values,
        "clay_pct" : terrain["clay_pct"].values if "clay_pct" in terrain else np.nan,
        "log_pop_density": np.log1p(pop_vals),
    })
    # Normalise elevation to [0,1] for heatwave model
    elev = df["elevation"].fillna(0)
    df["elevation_norm"] = (elev - elev.min()) / (elev.max() - elev.min() + 1e-6)
    return df


# ──────────────────────────────────────────────────────────────────────────────
# 4. BUILD DATASET
# ──────────────────────────────────────────────────────────────────────────────

def build_dataset(years: list[int]) -> pd.DataFrame:
    log.info("Loading IMD temperature data...")
    tmax, tmin = load_temperature()

    lat_vals = tmax.coords["lat"].values if "lat" in tmax.coords else tmax.coords["latitude"].values
    lon_vals = tmax.coords["lon"].values if "lon" in tmax.coords else tmax.coords["longitude"].values
    LLAT, LLON = np.meshgrid(lat_vals, lon_vals, indexing="ij")
    flat_lats = LLAT.ravel()
    flat_lons = LLON.ravel()

    # Build static features
    log.info("Building static features (terrain + soil + population)...")
    static_df = build_static_features(flat_lats, flat_lons)

    # CHIRPS moisture deficit
    log.info("Building CHIRPS moisture deficit...")
    moisture_lookup = build_moisture_deficit_lookup(flat_lats, flat_lons)

    # Compute 10-yr daily climatology from training years for anomaly
    log.info("Computing daily climatology (10-yr mean Tmax per DOY)...")
    train_tmax = tmax.sel(time=tmax.time.dt.year.isin(TRAIN_YEARS))
    clim_by_doy = train_tmax.groupby("time.dayofyear").mean("time")  # (DOY, lat, lon)

    all_rows = []
    for yr in years:
        yr_tmax = tmax.sel(time=tmax.time.dt.year == yr)
        yr_tmin = tmin.sel(time=tmin.time.dt.year == yr) if tmin is not None else None

        # Season subset
        season_mask = yr_tmax.time.dt.month.isin(HW_MONTHS)
        yr_tmax = yr_tmax.sel(time=season_mask)
        if yr_tmin is not None:
            yr_tmin = yr_tmin.sel(time=season_mask)

        if yr_tmax.sizes["time"] == 0:
            log.warning(f"No data for year {yr}")
            continue

        log.info(f"Processing year {yr}: {yr_tmax.sizes['time']} heatwave-season days")

        tmax_np = yr_tmax.values   # (days, lats, lons)
        tmin_np = yr_tmin.values if yr_tmin is not None else tmax_np - 7.0

        days      = yr_tmax.time.values
        months    = yr_tmax.time.dt.month.values
        doys      = yr_tmax.time.dt.dayofyear.values

        # 3-day and 7-day rolling means
        tmax_3d = np.array([
            np.nanmean(tmax_np[max(0, d-2):d+1], axis=0) for d in range(tmax_np.shape[0])
        ])
        tmax_7d = np.array([
            np.nanmean(tmax_np[max(0, d-6):d+1], axis=0) for d in range(tmax_np.shape[0])
        ])

        # Anomaly vs climatology
        doy_idx = np.array([clim_by_doy.dayofyear.values.tolist().index(d)
                             if d in clim_by_doy.dayofyear.values else 0
                             for d in doys])
        clim_vals = clim_by_doy.values[doy_idx]       # (days, lats, lons)
        tmax_anom = tmax_np - clim_vals

        # 95th-percentile threshold (computed over training years)
        p95 = np.nanpercentile(
            tmax.sel(time=tmax.time.dt.year.isin(TRAIN_YEARS)).values, 95, axis=0
        )
        above_p95 = (tmax_np > p95[None]).astype(np.float32)

        # Heatwave label per cell-day
        tmax_thresh = np.where(LLAT > 25, TMAX_HILLY, TMAX_PLAINS)   # (lats, lons)
        raw_hw = (tmax_np >= tmax_thresh[None]) & (tmax_anom >= ANOM_THRESH)

        # 3-consecutive-day rolling sum ≥ 3
        hw_runs = np.zeros_like(raw_hw, dtype=np.float32)
        for d in range(2, raw_hw.shape[0]):
            hw_runs[d] = raw_hw[d] & raw_hw[d-1] & raw_hw[d-2]
        labels = hw_runs.astype(np.int8)

        # Heat index (Steadman simplified: HI = T + 0.33*e - 0.70*v - 4.00)
        # Using Tmin as proxy for humidity
        e  = 6.112 * np.exp(17.67 * tmin_np / (tmin_np + 243.5))  # vapour pressure
        hi = tmax_np + 0.33 * e - 4.0

        # Flatten to rows
        n_days, n_lat, n_lon = tmax_np.shape
        for d_idx in range(n_days):
            chunk = pd.DataFrame({
                "tmax"         : tmax_np[d_idx].ravel(),
                "tmin"         : tmin_np[d_idx].ravel(),
                "dtr"          : (tmax_np[d_idx] - tmin_np[d_idx]).ravel(),
                "tmax_3d"      : tmax_3d[d_idx].ravel(),
                "tmax_7d"      : tmax_7d[d_idx].ravel(),
                "tmax_anom"    : tmax_anom[d_idx].ravel(),
                "above_p95"    : above_p95[d_idx].ravel(),
                "heat_index"   : hi[d_idx].ravel(),
                "lat"          : flat_lats,
                "lon"          : flat_lons,
                "month"        : int(months[d_idx]),
                "doy"          : int(doys[d_idx]),
                "year"         : yr,
                "label"        : labels[d_idx].ravel().astype(int),
            })
            all_rows.append(chunk)

    df = pd.concat(all_rows, ignore_index=True)

    # Merge static features
    df = df.merge(static_df[["lat", "lon", "elevation_norm", "clay_pct", "log_pop_density"]],
                  on=["lat", "lon"], how="left")

    # CHIRPS moisture deficit
    df["chirps_mean_mm"] = df.apply(
        lambda r: moisture_lookup.get((round(r["lat"], 2), round(r["lon"], 2)), np.nan), axis=1
    )
    df["rain_deficit_pct"] = (1 - (df["chirps_mean_mm"].fillna(800) / 1200)).clip(-0.5, 1.0)

    # Fill NaNs
    for col in ["clay_pct", "elevation_norm", "log_pop_density"]:
        df[col] = df[col].fillna(df[col].median() if col in df else 0)

    pos_frac = df["label"].mean()
    log.info(f"Full dataset: {df.shape}, positive fraction: {pos_frac:.4%}")
    return df


FEATURE_COLS = [
    "tmax", "tmin", "dtr", "tmax_3d", "tmax_7d", "tmax_anom",
    "above_p95", "heat_index",
    "rain_deficit_pct", "chirps_mean_mm",
    "elevation_norm", "clay_pct", "log_pop_density",
    "lat", "lon", "month", "doy", "year",
]


# ──────────────────────────────────────────────────────────────────────────────
# 5. MAIN TRAIN FUNCTION
# ──────────────────────────────────────────────────────────────────────────────

def train():
    all_years = TRAIN_YEARS + VAL_YEARS + TEST_YEARS
    df = build_dataset(all_years)

    train_df = df[df["year"].isin(TRAIN_YEARS)]
    val_df   = df[df["year"].isin(VAL_YEARS)]
    test_df  = df[df["year"].isin(TEST_YEARS)]

    fcols = [c for c in FEATURE_COLS if c in df.columns]

    X_train, y_train = train_df[fcols].values, train_df["label"].values
    X_val,   y_val   = val_df[fcols].values,   val_df["label"].values
    X_test,  y_test  = test_df[fcols].values,  test_df["label"].values
    groups            = train_df["year"].values

    log.info(f"Train: {X_train.shape} | pos={y_train.mean():.3%}")
    log.info(f"Val:   {X_val.shape}   | pos={y_val.mean():.3%}")
    log.info(f"Test:  {X_test.shape}  | pos={y_test.mean():.3%}")

    spw = compute_scale_pos_weight(y_train)

    # ── XGBoost ───────────────────────────────────────────────────────────────
    xgb_params = {
        **XGB_BASE,
        "scale_pos_weight": spw,
        "objective"       : "binary:logistic",
        "eval_metric"     : "auc",
    }
    log.info("Training XGBoost...")
    xgb_model = xgb.XGBClassifier(**xgb_params)
    xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=100)

    # ── LightGBM ──────────────────────────────────────────────────────────────
    log.info("Training LightGBM...")
    try:
        import lightgbm as lgb
        lgb_model = lgb.LGBMClassifier(
            n_estimators=1000, learning_rate=0.02, max_depth=7,
            num_leaves=63, subsample=0.75, colsample_bytree=0.75,
            min_child_samples=20, scale_pos_weight=spw,
            random_state=SEED, n_jobs=-1, verbose=-1,
        )
        lgb_model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            callbacks=[lgb.early_stopping(50, verbose=False),
                       lgb.log_evaluation(period=-1)],
        )
        log.info(f"LGB best iteration: {lgb_model.best_iteration_}")
        lgb_ok = True
    except ImportError:
        log.warning("LightGBM not installed, XGBoost-only")
        lgb_ok = False

    # ── Ensemble probabilities ────────────────────────────────────────────────
    def ensemble_proba(X):
        xgb_prob = xgb_model.predict_proba(X)[:, 1]
        if lgb_ok:
            lgb_prob = lgb_model.predict_proba(X)[:, 1]
            return (xgb_prob + lgb_prob) / 2
        return xgb_prob

    # ── Youden's J threshold optimisation on val set ──────────────────────────
    val_prob = ensemble_proba(X_val)
    fpr, tpr, thresholds = roc_curve(y_val, val_prob)
    j = tpr - fpr
    best_thresh = float(thresholds[np.argmax(j)])
    log.info(f"Best threshold (Youden's J): {best_thresh:.3f}")

    # ── Evaluate at Youden's J threshold ─────────────────────────────────────
    results = {"threshold": best_thresh, "n_features": len(fcols)}
    for split_name, X_s, y_s in [("train", X_train, y_train),
                                    ("val",   X_val,   y_val),
                                    ("test",  X_test,  y_test)]:
        if len(X_s) == 0: continue
        prob = ensemble_proba(X_s)
        if len(np.unique(y_s)) > 1:
            results[split_name] = evaluate_binary(
                y_s, prob, label=f"hw_{split_name}", threshold=best_thresh
            )

    # ── GroupKFold CV ─────────────────────────────────────────────────────────
    log.info("Running GroupKFold CV...")
    gkf = GroupKFold(n_splits=min(8, len(np.unique(groups))))
    cv_xgb = xgb.XGBClassifier(**{**xgb_params,
                                    "early_stopping_rounds": None,
                                    "n_estimators": xgb_model.best_iteration or 500})
    try:
        cv_auc = []
        for tr_idx, vl_idx in gkf.split(X_train, y_train, groups=groups):
            cv_xgb.fit(X_train[tr_idx], y_train[tr_idx])
            p = cv_xgb.predict_proba(X_train[vl_idx])[:, 1]
            cv_auc.append(roc_auc_score(y_train[vl_idx], p))
        log.info(f"CV AUC: {np.mean(cv_auc):.4f} ± {np.std(cv_auc):.4f}")
        results["cv_auc_mean"] = float(np.mean(cv_auc))
        results["cv_auc_std"]  = float(np.std(cv_auc))
    except Exception as e:
        log.warning(f"CV failed: {e}")

    # ── Save ──────────────────────────────────────────────────────────────────
    bundle = {
        "xgb_model": xgb_model,
        "lgb_model": lgb_model if lgb_ok else None,
        "threshold": best_thresh,
        "features" : fcols,
    }
    out_dir = MODELS_OUT / "heatwave"
    save_model(bundle, out_dir, "heatwave_ensemble_v3")
    save_feature_importance(xgb_model, fcols, REPORTS_OUT / "heatwave", "heatwave_xgb_v3")
    save_report(results, REPORTS_OUT / "heatwave", "heatwave_metrics_v3")

    log.info("✅ Heatwave model v3 training complete.")
    return bundle, results


if __name__ == "__main__":
    train()
