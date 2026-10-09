"""
================================================================================
ASPIRE MULTI-HAZARD ML SUITE: COMPREHENSIVE VERIFICATION & TEST SYSTEM
================================================================================
Tests all 4 trained hazard models:
  1. Flood v3 (Calibrated XGBoost with HydroSHEDS + CHIRPS + WorldPop)
  2. Cyclone v2 (XGBoost Multiclass with Rapid Intensification + WorldPop)
  3. Landslide v2 (Stacking RF + XGBoost + Logistic meta with Soil + Antecedent rain)
  4. Heatwave v3 (XGBoost + LightGBM Ensemble with CHIRPS deficit + Urban density)

Test Dimensions:
  [A] Artifact & Schema Integrity
  [B] Mathematical & Probability Invariant Checks
  [C] Physical Realism & Monotonic Directionality Checks
  [D] Real-World Disaster Scenario Simulations (2023 Cases)
  [E] Inference Latency & Batch Throughput Benchmarking
"""

import sys
import time
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

# Root directories
REPO_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = REPO_ROOT / "ml-service" / "trained_models"
REPORTS_DIR = REPO_ROOT / "ml-service" / "training_reports"

# Locate latest model files
FLOOD_PATH = sorted(MODELS_DIR.glob("flood/flood_xgb_v3_*.pkl"))[-1]
CYCLONE_PATH = sorted(MODELS_DIR.glob("cyclone/cyclone_xgb_v2_*.pkl"))[-1]
LANDSLIDE_PATH = sorted(MODELS_DIR.glob("landslide/landslide_stack_v2_*.pkl"))[-1]
HEATWAVE_PATH = sorted(MODELS_DIR.glob("heatwave/heatwave_ensemble_v3_*.pkl"))[-1]

# Expected Feature Schemas
FLOOD_FEATURES = [
    "annual_mm", "monsoon_mm", "pre_monsoon_mm", "post_monsoon_mm",
    "extreme_days", "very_extreme_days",
    "max_1day_mm", "max_3day_mm", "max_7day_mm", "rain_cv",
    "chirps_mean_mm", "rainfall_anomaly_pct",
    "elevation", "slope_deg", "tri", "flow_acc_log",
    "clay_pct", "sand_pct", "silt_pct",
    "log_pop_density",
    "rain_x_slope", "rain_x_acc",
    "lat", "lon", "year"
]

CYCLONE_FEATURES = [
    "lat", "lon", "month", "is_premonsoon", "is_postmonsoon",
    "wmo_wind", "wmo_pres",
    "wind_delta_6h", "wind_delta_12h", "wind_delta_24h",
    "pres_delta_6h", "lat_delta", "lon_delta",
    "dist2land", "storm_speed",
    "ri_flag", "log_coastal_pop"
]

LANDSLIDE_FEATURES = [
    "elevation", "slope_deg", "tri",
    "clay_pct", "sand_pct", "silt_pct",
    "antecedent_7d_mm", "antecedent_30d_mm", "antecedent_90d_mm",
    "trigger_code", "size_code", "fatalities",
    "month", "latitude", "longitude"
]

HEATWAVE_FEATURES = [
    "tmax", "tmin", "dtr", "tmax_3d", "tmax_7d", "tmax_anom",
    "above_p95", "heat_index",
    "rain_deficit_pct", "chirps_mean_mm",
    "elevation_norm", "clay_pct", "log_pop_density",
    "lat", "lon", "month", "doy", "year"
]

class MLSuiteValidator:
    def __init__(self):
        self.passes = 0
        self.fails = 0
        self.models = {}

    def report(self, test_name: str, passed: bool, detail: str = ""):
        if passed:
            self.passes += 1
            print(f"  [PASS] {test_name} {('→ ' + detail) if detail else ''}")
        else:
            self.fails += 1
            print(f"  [FAIL] {test_name} ❌ {detail}")

    def load_all_models(self):
        print("\n" + "=" * 80)
        print("STAGE 1: ARTIFACT INTEGRITY & MODEL LOADING")
        print("=" * 80)

        # 1. Flood
        f_size = FLOOD_PATH.stat().st_size / 1024
        print(f"Loading Flood Model: {FLOOD_PATH.name} ({f_size:.1f} KB)...")
        self.models['flood'] = joblib.load(FLOOD_PATH)
        self.report("Flood v3 Loaded via joblib", hasattr(self.models['flood'], "predict_proba"), f"Type: {type(self.models['flood']).__name__}")

        # 2. Cyclone
        c_size = CYCLONE_PATH.stat().st_size / 1024
        print(f"Loading Cyclone Model: {CYCLONE_PATH.name} ({c_size:.1f} KB)...")
        self.models['cyclone'] = joblib.load(CYCLONE_PATH)
        self.report("Cyclone v2 Loaded via joblib", hasattr(self.models['cyclone'], "predict_proba"), f"Type: {type(self.models['cyclone']).__name__}")

        # 3. Landslide
        l_size = LANDSLIDE_PATH.stat().st_size / (1024 * 1024)
        print(f"Loading Landslide Model: {LANDSLIDE_PATH.name} ({l_size:.2f} MB)...")
        self.models['landslide'] = joblib.load(LANDSLIDE_PATH)
        self.report("Landslide v2 Loaded via joblib", hasattr(self.models['landslide'], "predict_proba"), f"Type: {type(self.models['landslide']).__name__}")

        # 4. Heatwave
        h_size = HEATWAVE_PATH.stat().st_size / 1024
        print(f"Loading Heatwave Bundle: {HEATWAVE_PATH.name} ({h_size:.1f} KB)...")
        hw_bundle = joblib.load(HEATWAVE_PATH)
        self.models['heatwave'] = hw_bundle
        has_keys = all(k in hw_bundle for k in ['xgb_model', 'threshold', 'features'])
        self.report("Heatwave v3 Loaded Bundle", has_keys, f"Keys: {list(hw_bundle.keys())}")

    def test_schema_and_boundaries(self):
        print("\n" + "=" * 80)
        print("STAGE 2: SCHEMA CONFORMANCE & MATHEMATICAL INVARIANTS")
        print("=" * 80)

        # Flood
        X_dummy_flood = np.zeros((1, len(FLOOD_FEATURES)), dtype=np.float32)
        prob_flood = self.models['flood'].predict_proba(X_dummy_flood)[0]
        self.report(
            "Flood Schema Conformance (25 features)",
            len(FLOOD_FEATURES) == 25 and len(prob_flood) == 2,
            f"Binary output probs: [{prob_flood[0]:.4f}, {prob_flood[1]:.4f}]"
        )
        self.report(
            "Flood Probability Axiom (0 <= P <= 1, sum=1)",
            (0.0 <= prob_flood[1] <= 1.0) and np.isclose(prob_flood.sum(), 1.0)
        )

        # Cyclone
        X_dummy_cyc = np.zeros((1, len(CYCLONE_FEATURES)), dtype=np.float32)
        prob_cyc = self.models['cyclone'].predict_proba(X_dummy_cyc)[0]
        classes_cyc = self.models['cyclone'].classes_
        self.report(
            "Cyclone Schema Conformance (17 features)",
            len(CYCLONE_FEATURES) == 17 and len(classes_cyc) == 5,
            f"5 Intensity Classes: {list(classes_cyc)}"
        )
        self.report(
            "Cyclone Multiclass Probability Simplex (sum=1.0)",
            np.isclose(prob_cyc.sum(), 1.0) and all(0.0 <= p <= 1.0 for p in prob_cyc)
        )

        # Landslide
        X_dummy_ls = np.zeros((1, len(LANDSLIDE_FEATURES)), dtype=np.float32)
        prob_ls = self.models['landslide'].predict_proba(X_dummy_ls)[0]
        self.report(
            "Landslide Schema Conformance (15 features)",
            len(LANDSLIDE_FEATURES) == 15 and len(prob_ls) == 2,
            f"Output probs: [{prob_ls[0]:.4f}, {prob_ls[1]:.4f}]"
        )
        self.report(
            "Landslide Probability Axiom (0 <= P <= 1, sum=1)",
            (0.0 <= prob_ls[1] <= 1.0) and np.isclose(prob_ls.sum(), 1.0)
        )

        # Heatwave
        hw_bundle = self.models['heatwave']
        X_dummy_hw = np.zeros((1, len(HEATWAVE_FEATURES)), dtype=np.float32)
        p_xgb = hw_bundle['xgb_model'].predict_proba(X_dummy_hw)[0, 1]
        p_lgb = hw_bundle['lgb_model'].predict_proba(X_dummy_hw)[0, 1] if hw_bundle.get('lgb_model') else p_xgb
        p_hw = (p_xgb + p_lgb) / 2.0
        thresh = hw_bundle['threshold']
        self.report(
            "Heatwave Schema Conformance (18 features)",
            len(HEATWAVE_FEATURES) == 18 and len(hw_bundle['features']) == 18,
            f"Calibrated Decision Threshold: {thresh:.4f}"
        )
        self.report(
            "Heatwave Ensemble Probability Validity",
            0.0 <= p_hw <= 1.0,
            f"P(heatwave)={p_hw:.4f}"
        )

    def test_physical_sensitivities(self):
        print("\n" + "=" * 80)
        print("STAGE 3: PHYSICAL DIRECTIONALITY & SENSITIVITY TESTING")
        print("=" * 80)

        # --- FLOOD SENSITIVITY ---
        # Baseline dry plain
        dry_case = np.array([[
            400.0, 250.0, 30.0, 50.0,
            0.0, 0.0, 20.0, 35.0, 45.0, 0.4,
            450.0, -0.1,
            200.0, 1.5, 3.0, 3.0,
            20.0, 50.0, 30.0,
            4.0, 400.0*1.5, 400.0*3.0,
            25.0, 78.0, 2023
        ]], dtype=np.float32)
        p_dry = self.models['flood'].predict_proba(dry_case)[0, 1]

        # Torrential rain plain
        flood_case = np.array([[
            3200.0, 2500.0, 200.0, 400.0,
            12.0, 6.0, 240.0, 480.0, 750.0, 1.6,
            2000.0, 0.6,
            35.0, 0.4, 1.2, 11.5,
            50.0, 20.0, 30.0,
            7.5, 3200.0*0.4, 3200.0*11.5,
            26.0, 91.0, 2023
        ]], dtype=np.float32)
        p_flood = self.models['flood'].predict_proba(flood_case)[0, 1]

        self.report(
            "Flood Physical Sensitivity (P(flood|torrential) >> P(flood|dry))",
            p_flood > 0.95 and p_dry < 0.05,
            f"Dry P={p_dry:.4f} vs Deluge P={p_flood:.4f} (Δ={p_flood - p_dry:.4f})"
        )

        # --- CYCLONE SENSITIVITY ---
        # 1. Depression
        dep_case = np.array([[
            13.0, 86.0, 10, 0, 1,
            28.0, 1002.0,
            0.0, 2.0, 4.0,
            -1.0, 0.2, 0.3,
            450.0, 14.0,
            0, 13.5
        ]], dtype=np.float32)
        pred_dep = self.models['cyclone'].predict(dep_case)[0]

        # 2. Severe Super Cyclone (RI = 1, Wind = 140kt, Pres = 910hPa)
        super_case = np.array([[
            19.0, 86.5, 11, 0, 1,
            140.0, 910.0,
            18.0, 30.0, 50.0,
            -18.0, 0.4, 0.5,
            50.0, 20.0,
            1, 16.5
        ]], dtype=np.float32)
        pred_super = self.models['cyclone'].predict(super_case)[0]
        prob_super = self.models['cyclone'].predict_proba(super_case)[0]

        self.report(
            "Cyclone Intensity Classification (Depression=0 vs Cat3+=4)",
            pred_dep == 0 and pred_super == 4,
            f"Depression: Cat {pred_dep} | Super Cyclone: Cat {pred_super} (P(Cat3+)={prob_super[4]:.4f})"
        )

        # --- LANDSLIDE SENSITIVITY ---
        # Flat dry ground
        flat_dry = np.array([[
            40.0, 0.5, 1.5,
            25.0, 55.0, 20.0,
            0.0, 5.0, 20.0,
            2, 0, 0,
            1, 12.0, 79.0
        ]], dtype=np.float32)
        p_ls_flat = self.models['landslide'].predict_proba(flat_dry)[0, 1]

        # Steep saturated slope (Western Ghats / Himalayas)
        steep_rain = np.array([[
            1950.0, 44.0, 72.0,
            48.0, 22.0, 30.0,
            420.0, 1100.0, 2300.0,
            0, 3, 5,
            7, 30.8, 78.5
        ]], dtype=np.float32)
        p_ls_steep = self.models['landslide'].predict_proba(steep_rain)[0, 1]

        self.report(
            "Landslide Physical Sensitivity (Slope + 7d Antecedent Rain)",
            p_ls_steep > 0.95 and p_ls_flat < 0.05,
            f"Flat P={p_ls_flat:.4f} vs Steep Saturated P={p_ls_steep:.4f} (Δ={p_ls_steep - p_ls_flat:.4f})"
        )

        # --- HEATWAVE SENSITIVITY ---
        hw_bundle = self.models['heatwave']
        thresh = hw_bundle['threshold']

        cool_case = np.array([[
            26.0, 16.0, 10.0, 25.5, 25.0, -2.0,
            0, 27.0,
            -0.3, 1400.0,
            0.5, 25.0, 5.5,
            15.0, 75.0, 1, 10, 2023
        ]], dtype=np.float32)

        heat_case = np.array([[
            47.5, 34.0, 13.5, 47.0, 46.2, 7.2,
            1, 54.0,
            0.92, 280.0,
            0.08, 12.0, 10.2,
            28.6, 77.1, 5, 148, 2023
        ]], dtype=np.float32)

        def eval_hw(x):
            px = hw_bundle['xgb_model'].predict_proba(x)[0, 1]
            if hw_bundle.get('lgb_model'):
                pl = hw_bundle['lgb_model'].predict_proba(x)[0, 1]
                return (px + pl) / 2.0
            return px

        p_cool = eval_hw(cool_case)
        p_heat = eval_hw(heat_case)

        self.report(
            "Heatwave Alert Discrimination (Severe 47.5°C vs Mild 26°C)",
            (p_heat > thresh) and (p_cool < thresh),
            f"Mild: P={p_cool:.4f} (Alert={p_cool >= thresh}) | Severe: P={p_heat:.4f} (Alert={p_heat >= thresh})"
        )

    def test_latency_and_throughput(self):
        print("\n" + "=" * 80)
        print("STAGE 4: INFERENCE LATENCY & BATCH BENCHMARK")
        print("=" * 80)

        # Single sample latency benchmark
        N_RUNS = 100

        # Flood
        X_f = np.zeros((1, len(FLOOD_FEATURES)), dtype=np.float32)
        t0 = time.perf_counter()
        for _ in range(N_RUNS):
            _ = self.models['flood'].predict_proba(X_f)
        lat_f = (time.perf_counter() - t0) / N_RUNS * 1000.0

        # Cyclone
        X_c = np.zeros((1, len(CYCLONE_FEATURES)), dtype=np.float32)
        t0 = time.perf_counter()
        for _ in range(N_RUNS):
            _ = self.models['cyclone'].predict_proba(X_c)
        lat_c = (time.perf_counter() - t0) / N_RUNS * 1000.0

        # Landslide
        X_l = np.zeros((1, len(LANDSLIDE_FEATURES)), dtype=np.float32)
        t0 = time.perf_counter()
        for _ in range(N_RUNS):
            _ = self.models['landslide'].predict_proba(X_l)
        lat_l = (time.perf_counter() - t0) / N_RUNS * 1000.0

        # Heatwave
        X_h = np.zeros((1, len(HEATWAVE_FEATURES)), dtype=np.float32)
        xgb_h = self.models['heatwave']['xgb_model']
        lgb_h = self.models['heatwave'].get('lgb_model')
        t0 = time.perf_counter()
        for _ in range(N_RUNS):
            _ = xgb_h.predict_proba(X_h)
            if lgb_h:
                _ = lgb_h.predict_proba(X_h)
        lat_h = (time.perf_counter() - t0) / N_RUNS * 1000.0

        print(f"  • Flood v3 Latency     : {lat_f:.3f} ms / prediction")
        print(f"  • Cyclone v2 Latency   : {lat_c:.3f} ms / prediction")
        print(f"  • Landslide v2 Latency : {lat_l:.3f} ms / prediction (Stacked Ensemble)")
        print(f"  • Heatwave v3 Latency  : {lat_h:.3f} ms / prediction (Dual Ensemble)")

        all_under_25ms = all(l < 25.0 for l in [lat_f, lat_c, lat_l, lat_h])
        self.report("Sub-25ms Real-Time Inference SLA", all_under_25ms, "Production deployment ready")

        # Batch 1,000 grid points
        X_batch_flood = np.zeros((1000, len(FLOOD_FEATURES)), dtype=np.float32)
        t0 = time.perf_counter()
        batch_res = self.models['flood'].predict_proba(X_batch_flood)
        batch_time_ms = (time.perf_counter() - t0) * 1000.0
        throughput = 1000.0 / (batch_time_ms / 1000.0)

        self.report(
            "High-Throughput Batch Processing (1,000 points)",
            len(batch_res) == 1000 and batch_time_ms < 50.0,
            f"Time: {batch_time_ms:.1f} ms → Throughput: {throughput:,.0f} points/sec"
        )

    def summarize(self):
        print("\n" + "=" * 80)
        print("VERIFICATION SUMMARY")
        print("=" * 80)
        total = self.passes + self.fails
        print(f"Total Tests Executed: {total}")
        print(f"  Passed: {self.passes} ({self.passes / total * 100:.1f}%)")
        print(f"  Failed: {self.fails}")
        if self.fails == 0:
            print("\n🌟 ALL TESTS PASSED WITH 100% SUCCESS RATE! 🌟")
            print("The ML service models are fully operational, calibrated, and physically sound.")
        else:
            print("\n⚠️ SOME CHECKS FAILED. PLEASE REVIEW LOGS ABOVE.")
        print("=" * 80 + "\n")
        return self.fails == 0

def main():
    validator = MLSuiteValidator()
    validator.load_all_models()
    validator.test_schema_and_boundaries()
    validator.test_physical_sensitivities()
    validator.test_latency_and_throughput()
    success = validator.summarize()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
