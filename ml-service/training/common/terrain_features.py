"""
Shared Terrain & Soil Feature Extractor
========================================
Note: cache uses pickle (no pyarrow/fastparquet dependency).
Computes per grid-cell (0.25°) static features from:
  - HydroSHEDS DEM 30s  → elevation, derived slope, terrain ruggedness
  - HydroSHEDS Flow Acc → upstream catchment area (riverine risk)
  - SoilGrids 2.0       → clay%, sand%, silt% (drainage / runoff)

These are expensive to compute, so results are cached in
ml-service/training/common/.terrain_cache_<hash>.pkl
"""
from __future__ import annotations

import hashlib
import logging
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

log = logging.getLogger(__name__)

try:
    import rasterio
    from rasterio.windows import from_bounds
    RASTERIO_OK = True
except ImportError:
    RASTERIO_OK = False
    log.warning("rasterio not available – terrain features will be NaN")


def _read_raster_clipped(path: str | Path, west: float, south: float,
                          east: float, north: float, nodata_override=None) -> np.ndarray:
    """Read raster clipped to AOI bounding box, returns 2-D float array."""
    with rasterio.open(path) as src:
        win = from_bounds(west, south, east, north, src.transform)
        data = src.read(1, window=win).astype(np.float32)
        nd = nodata_override if nodata_override is not None else src.nodata
        if nd is not None:
            data[data == nd] = np.nan
    return data


def _slope_from_dem(dem_arr: np.ndarray, res_deg: float = 30 / 3600) -> np.ndarray:
    """
    Central-difference slope magnitude (°) from DEM array.
    res_deg: cell size in degrees (30 arc-sec = 30/3600 deg)
    """
    mean_lat = 20.0  # rough India centre
    m_per_deg_lat = 111_320.0
    m_per_deg_lon = 111_320.0 * np.cos(np.radians(mean_lat))
    dx = res_deg * m_per_deg_lon
    dy = res_deg * m_per_deg_lat
    dz_dx = np.gradient(dem_arr, dx, axis=1)
    dz_dy = np.gradient(dem_arr, dy, axis=0)
    slope_rad = np.arctan(np.sqrt(dz_dx ** 2 + dz_dy ** 2))
    return np.degrees(slope_rad)


def _terrain_ruggedness(dem_arr: np.ndarray) -> np.ndarray:
    """
    Terrain Ruggedness Index (TRI) = mean |dem_i - dem_centre| in 3x3 window.
    """
    from scipy.ndimage import generic_filter
    def tri_func(vals):
        with np.errstate(all="ignore"):
            return np.nanmean(np.abs(vals - vals[4]))
    return generic_filter(dem_arr, tri_func, size=3, mode="nearest")


def _agg_raster_to_grid(arr: np.ndarray,
                         arr_west: float, arr_north: float,
                         arr_res_deg: float,
                         grid_lats: np.ndarray,
                         grid_lons: np.ndarray,
                         agg: str = "mean") -> np.ndarray:
    """
    Bi-linearly or mean-aggregate a fine-resolution raster to a coarser lat/lon grid.
    Returns 1-D array aligned to grid_lats/grid_lons.
    """
    result = np.full(len(grid_lats), np.nan, dtype=np.float32)
    for i, (lat, lon) in enumerate(zip(grid_lats, grid_lons)):
        # Convert to pixel index (row, col) in the fine raster
        row = (arr_north - lat) / arr_res_deg
        col = (lon - arr_west) / arr_res_deg
        r0, r1 = max(0, int(row) - 1), min(arr.shape[0], int(row) + 2)
        c0, c1 = max(0, int(col) - 1), min(arr.shape[1], int(col) + 2)
        patch = arr[r0:r1, c0:c1]
        if patch.size == 0:
            continue
        valid = patch[~np.isnan(patch)]
        if valid.size == 0:
            continue
        if agg == "mean":
            result[i] = valid.mean()
        elif agg == "max":
            result[i] = valid.max()
        elif agg == "min":
            result[i] = valid.min()
    return result


def build_terrain_grid(grid_lats: np.ndarray, grid_lons: np.ndarray,
                        data_root: Path,
                        cache_path: Path | None = None,
                        force_rebuild: bool = False) -> pd.DataFrame:
    """
    Build terrain & soil static features for a grid of (lat, lon) pairs.

    Parameters
    ----------
    grid_lats, grid_lons : 1-D arrays of floats, same length (the grid cell centres)
    data_root            : path to multi_hazard_downloader/data/raw/
    cache_path           : if given, cache/load from parquet
    force_rebuild        : ignore cache even if it exists

    Returns
    -------
    DataFrame with columns:
        elevation, slope_deg, tri, flow_acc_log,
        clay_pct, sand_pct, silt_pct
    All indexed 0..N-1 aligned to input arrays.
    """
    # Cache keyed by grid hash
    # Build a unique cache filename per grid hash to avoid stale hits
    grid_hash = hashlib.md5(
        np.concatenate([grid_lats, grid_lons]).tobytes()
    ).hexdigest()[:12]
    if cache_path is not None:
        pkl_path = cache_path.parent / f".terrain_cache_{grid_hash}.pkl"
        if pkl_path.exists() and not force_rebuild:
            log.info(f"Loading terrain features from cache ({pkl_path})")
            with open(pkl_path, "rb") as f:
                return pickle.load(f)

    if not RASTERIO_OK:
        log.warning("rasterio missing – returning NaN terrain frame")
        return pd.DataFrame({
            "elevation": np.nan, "slope_deg": np.nan, "tri": np.nan,
            "flow_acc_log": np.nan, "clay_pct": np.nan,
            "sand_pct": np.nan, "silt_pct": np.nan
        }, index=range(len(grid_lats)))

    WEST, SOUTH, EAST, NORTH = 68.0, 6.5, 97.5, 37.5
    DEM_RES = 30 / 3600  # 30 arc-sec

    # ── 1. HydroSHEDS Elevation ───────────────────────────────────────────────
    dem_path = data_root / "08_hydrosheds" / "dem_void_filled_30s" / "hyd_as_dem_30s" / "hyd_as_dem_30s.tif"
    if dem_path.exists():
        log.info("Reading HydroSHEDS DEM...")
        try:
            import scipy
            dem_arr = _read_raster_clipped(dem_path, WEST, SOUTH, EAST, NORTH, nodata_override=32767)
            elev_grid = _agg_raster_to_grid(dem_arr, WEST, NORTH, DEM_RES, grid_lats, grid_lons, "mean")
            log.info("Computing slope...")
            slope_arr = _slope_from_dem(dem_arr, DEM_RES)
            slope_grid = _agg_raster_to_grid(slope_arr, WEST, NORTH, DEM_RES, grid_lats, grid_lons, "mean")
            log.info("Computing TRI...")
            tri_arr = _terrain_ruggedness(dem_arr)
            tri_grid = _agg_raster_to_grid(tri_arr, WEST, NORTH, DEM_RES, grid_lats, grid_lons, "mean")
        except Exception as e:
            log.warning(f"DEM processing failed ({e}), using NaN")
            elev_grid = slope_grid = tri_grid = np.full(len(grid_lats), np.nan)
    else:
        log.warning(f"DEM not found at {dem_path}, using NaN elevation")
        elev_grid = slope_grid = tri_grid = np.full(len(grid_lats), np.nan)

    # ── 2. HydroSHEDS Flow Accumulation ──────────────────────────────────────
    acc_path = data_root / "08_hydrosheds" / "flow_accumulation_30s" / "hyd_as_acc_30s" / "hyd_as_acc_30s.tif"
    if acc_path.exists():
        log.info("Reading flow accumulation...")
        try:
            acc_arr = _read_raster_clipped(acc_path, WEST, SOUTH, EAST, NORTH, nodata_override=-1)
            acc_arr = np.where(acc_arr < 0, np.nan, acc_arr)
            acc_grid = _agg_raster_to_grid(acc_arr, WEST, NORTH, DEM_RES, grid_lats, grid_lons, "max")
            flow_acc_log = np.log1p(acc_grid)
        except Exception as e:
            log.warning(f"Flow accumulation failed ({e})")
            flow_acc_log = np.full(len(grid_lats), np.nan)
    else:
        log.warning("Flow accumulation not found, using NaN")
        flow_acc_log = np.full(len(grid_lats), np.nan)

    # ── 3. SoilGrids: clay, sand, silt ───────────────────────────────────────
    SOIL_RES = 0.009
    soil_vars = {}
    for var in ("clay", "sand", "silt"):
        soil_paths = list((data_root / "09_soilgrids" / var).glob("*.tif"))
        if soil_paths:
            try:
                s_arr = _read_raster_clipped(soil_paths[0], WEST, SOUTH, EAST, NORTH, nodata_override=-32768)
                s_arr = np.where(s_arr <= 0, np.nan, s_arr / 10.0)  # g/kg → %
                soil_vars[f"{var}_pct"] = _agg_raster_to_grid(
                    s_arr, WEST, NORTH, SOIL_RES, grid_lats, grid_lons, "mean"
                )
            except Exception as e:
                log.warning(f"Soil {var} failed ({e})")
                soil_vars[f"{var}_pct"] = np.full(len(grid_lats), np.nan)
        else:
            log.warning(f"Soil {var} not found")
            soil_vars[f"{var}_pct"] = np.full(len(grid_lats), np.nan)

    # ── Assemble ──────────────────────────────────────────────────────────────
    df = pd.DataFrame({
        "elevation"    : elev_grid.astype(np.float32),
        "slope_deg"    : slope_grid.astype(np.float32),
        "tri"          : tri_grid.astype(np.float32),
        "flow_acc_log" : flow_acc_log.astype(np.float32),
        **{k: v.astype(np.float32) for k, v in soil_vars.items()},
    })

    # Cache result (pickle, no extra deps)
    if cache_path is not None:
        pkl_path = cache_path.parent / f".terrain_cache_{grid_hash}.pkl"
        pkl_path.parent.mkdir(parents=True, exist_ok=True)
        with open(pkl_path, "wb") as f:
            pickle.dump(df, f, protocol=pickle.HIGHEST_PROTOCOL)
        log.info(f"Terrain features cached → {pkl_path}")

    return df
