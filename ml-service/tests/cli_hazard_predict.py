"""
================================================================================
ASPIRE INTERACTIVE HAZARD INFERENCE & SCENARIO TESTER
================================================================================
Run predefined historical disaster scenarios or test custom scenarios across:
  - Flood (v3)
  - Cyclone (v2)
  - Landslide (v2)
  - Heatwave (v3)

Usage:
  python ml-service/tests/cli_hazard_predict.py --all-scenarios
  python ml-service/tests/cli_hazard_predict.py --hazard flood
  python ml-service/tests/cli_hazard_predict.py --hazard cyclone
  python ml-service/tests/cli_hazard_predict.py --hazard landslide
  python ml-service/tests/cli_hazard_predict.py --hazard heatwave
"""

import argparse
from pathlib import Path
import joblib
import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = REPO_ROOT / "ml-service" / "trained_models"

def get_latest_models():
    return {
        "flood": sorted(MODELS_DIR.glob("flood/flood_xgb_v3_*.pkl"))[-1],
        "cyclone": sorted(MODELS_DIR.glob("cyclone/cyclone_xgb_v2_*.pkl"))[-1],
        "landslide": sorted(MODELS_DIR.glob("landslide/landslide_stack_v2_*.pkl"))[-1],
        "heatwave": sorted(MODELS_DIR.glob("heatwave/heatwave_ensemble_v3_*.pkl"))[-1],
    }

SCENARIOS = {
    "flood": [
        {
            "name": "2023 Assam Brahmaputra Inundation (Extreme Monsoon)",
            "location": "Barpeta, Assam (26.3°N, 91.0°E)",
            "vector": [
                3400.0, 2750.0, 280.0, 370.0,   # rain totals
                18.0, 9.0,                      # extreme & very extreme days
                290.0, 540.0, 890.0, 1.85,      # max 1d, 3d, 7d, cv
                2100.0, 0.62,                   # chirps mean, anomaly pct
                42.0, 0.45, 1.8, 12.8,          # elevation, slope, tri, flow_acc
                54.0, 16.0, 30.0,               # clay, sand, silt
                7.8,                            # log_pop_density
                3400.0 * 0.45, 3400.0 * 12.8,   # rain interactions
                26.3, 91.0, 2023                # lat, lon, year
            ],
            "expected": "HIGH RISK / FLOOD ALERT (P ~ 1.00)"
        },
        {
            "name": "Thar Desert Dry Baseline (Calm)",
            "location": "Jaisalmer, Rajasthan (26.9°N, 70.9°E)",
            "vector": [
                180.0, 140.0, 10.0, 30.0,
                0.0, 0.0,
                15.0, 25.0, 30.0, 0.4,
                210.0, -0.15,
                225.0, 1.2, 3.5, 1.8,
                12.0, 78.0, 10.0,
                3.1,
                180.0 * 1.2, 180.0 * 1.8,
                26.9, 70.9, 2023
            ],
            "expected": "NO FLOOD RISK (P ~ 0.00)"
        }
    ],
    "cyclone": [
        {
            "name": "2023 Extremely Severe Cyclonic Storm Biparjoy (Arabian Sea)",
            "location": "Approaching Gujarat Coast (21.5°N, 66.8°E)",
            "vector": [
                21.5, 66.8, 6, 1, 0,            # lat, lon, month, premonsoon=1, postmonsoon=0
                115.0, 938.0,                   # 115 kts wind, 938 hPa pressure
                12.0, 24.0, 38.0,               # wind delta 6h, 12h, 24h
                -14.0, 0.3, 0.4,                # pres delta 6h, lat/lon delta
                110.0, 18.0,                    # dist2land (km), storm speed
                1, 15.8                         # RI flag = 1, coastal pop log density
            ],
            "expected": "VERY SEVERE / EXTREMELY SEVERE (Cat 3+ / Cat 4)"
        },
        {
            "name": "Open Ocean Low Pressure Depression",
            "location": "Central Bay of Bengal (12.0°N, 87.0°E)",
            "vector": [
                12.0, 87.0, 10, 0, 1,
                25.0, 1005.0,
                0.0, 2.0, 3.0,
                -1.0, 0.1, 0.2,
                550.0, 10.0,
                0, 13.0
            ],
            "expected": "TROPICAL DEPRESSION (Cat 0)"
        }
    ],
    "landslide": [
        {
            "name": "2023 Himachal / Uttarakhand Monsoon Slope Failure",
            "location": "Mandi / Kullu, HP (31.7°N, 76.9°E)",
            "vector": [
                1850.0, 46.5, 78.0,             # elevation 1850m, slope 46.5 deg, ruggedness 78
                46.0, 24.0, 30.0,               # high clay, moderate silt
                380.0, 1050.0, 2200.0,          # 7d=380mm, 30d=1050mm, 90d=2200mm antecedent rain
                0, 3, 2,                        # trigger=rain (0), size=large (3), fatalities
                7, 31.7, 76.9                   # month=July, lat, lon
            ],
            "expected": "HIGH RISK / IMMINENT FAILURE (P ~ 1.00)"
        },
        {
            "name": "Southern Deccan Plateau Stable Farmland",
            "location": "Bengaluru Rural (13.1°N, 77.6°E)",
            "vector": [
                820.0, 1.2, 2.5,
                22.0, 58.0, 20.0,
                15.0, 60.0, 180.0,
                2, 0, 0,
                7, 13.1, 77.6
            ],
            "expected": "STABLE / ZERO RISK (P < 0.01)"
        }
    ],
    "heatwave": [
        {
            "name": "May 2023 North India Scorching Heatwave",
            "location": "Delhi-NCR (28.6°N, 77.2°E)",
            "vector": [
                46.8, 33.2, 13.6, 46.2, 45.8, 6.8, # tmax, tmin, dtr, 3d, 7d, anomaly +6.8C
                1, 53.5,                           # above p95=1, heat index 53.5C
                0.88, 320.0,                       # rainfall deficit 88%, CHIRPS mean 320mm
                0.12, 16.0, 10.4,                  # low elevation, clay, ultra-high urban density
                28.6, 77.2, 5, 146, 2023           # May, day of year 146
            ],
            "expected": "SEVERE HEATWAVE ALERT (P > Threshold 0.150)"
        },
        {
            "name": "Pleasant January Winter Day",
            "location": "Pune, Maharashtra (18.5°N, 73.8°E)",
            "vector": [
                28.0, 15.5, 12.5, 27.5, 27.0, -1.8,
                0, 28.5,
                -0.1, 850.0,
                0.55, 30.0, 6.2,
                18.5, 73.8, 1, 15, 2023
            ],
            "expected": "NORMAL / NO ALERT (P < Threshold 0.150)"
        }
    ]
}

def run_flood_test(model):
    print("\n" + "=" * 70)
    print("FLOOD MODEL v3: INFERENCE & SCENARIO TESTING")
    print("=" * 70)
    for sc in SCENARIOS["flood"]:
        x = np.array([sc["vector"]], dtype=np.float32)
        prob = model.predict_proba(x)[0]
        alert = prob[1] >= 0.5
        print(f"\nScenario: {sc['name']}")
        print(f"Location: {sc['location']}")
        print(f"Expected: {sc['expected']}")
        print(f"Model Output → P(Flood): {prob[1]:.4f} | Alert Status: {'🚨 DANGER' if alert else '✅ SAFE'}")

def run_cyclone_test(model):
    print("\n" + "=" * 70)
    print("CYCLONE MODEL v2: INFERENCE & SCENARIO TESTING")
    print("=" * 70)
    cat_names = {0: "Depression (TD)", 1: "Deep Depression / TS", 2: "Cyclonic Storm (Cat 1)", 3: "Severe CS (Cat 2)", 4: "Very/Extremely Severe CS (Cat 3+)"}
    for sc in SCENARIOS["cyclone"]:
        x = np.array([sc["vector"]], dtype=np.float32)
        pred = model.predict(x)[0]
        probs = model.predict_proba(x)[0]
        print(f"\nScenario: {sc['name']}")
        print(f"Location: {sc['location']}")
        print(f"Expected: {sc['expected']}")
        print(f"Model Output → Predicted: {cat_names.get(pred, f'Cat {pred}')} (Class {pred})")
        print(f"Category Probabilities: {', '.join([f'Cat{i}: {p:.1%}' for i, p in enumerate(probs)])}")

def run_landslide_test(model):
    print("\n" + "=" * 70)
    print("LANDSLIDE MODEL v2: INFERENCE & SCENARIO TESTING")
    print("=" * 70)
    for sc in SCENARIOS["landslide"]:
        x = np.array([sc["vector"]], dtype=np.float32)
        prob = model.predict_proba(x)[0]
        alert = prob[1] >= 0.5
        print(f"\nScenario: {sc['name']}")
        print(f"Location: {sc['location']}")
        print(f"Expected: {sc['expected']}")
        print(f"Model Output → P(Landslide): {prob[1]:.4f} | Status: {'🚨 HIGH RISK' if alert else '✅ STABLE'}")

def run_heatwave_test(bundle):
    print("\n" + "=" * 70)
    print("HEATWAVE MODEL v3: INFERENCE & SCENARIO TESTING")
    print("=" * 70)
    xgb_m = bundle["xgb_model"]
    lgb_m = bundle.get("lgb_model")
    thresh = bundle["threshold"]
    print(f"Calibrated Optimal Youden Threshold: {thresh:.4f}")
    for sc in SCENARIOS["heatwave"]:
        x = np.array([sc["vector"]], dtype=np.float32)
        p_xgb = xgb_m.predict_proba(x)[0, 1]
        p_lgb = lgb_m.predict_proba(x)[0, 1] if lgb_m else p_xgb
        p_avg = (p_xgb + p_lgb) / 2.0
        alert = p_avg >= thresh
        print(f"\nScenario: {sc['name']}")
        print(f"Location: {sc['location']}")
        print(f"Expected: {sc['expected']}")
        print(f"Model Output → P(Heatwave): {p_avg:.4f} (XGB: {p_xgb:.4f}, LGB: {p_lgb:.4f})")
        print(f"Alert Status: {'🔥 HEATWAVE WARNING' if alert else '✅ NORMAL'}")

def main():
    parser = argparse.ArgumentParser(description="Multi-Hazard ML Inference Tester")
    parser.add_argument("--hazard", choices=["flood", "cyclone", "landslide", "heatwave"], help="Specific hazard to test")
    parser.add_argument("--all-scenarios", action="store_true", help="Run all scenario tests across all hazards")
    args = parser.parse_args()

    models = get_latest_models()

    if args.hazard == "flood" or args.all_scenarios or not args.hazard:
        m = joblib.load(models["flood"])
        run_flood_test(m)

    if args.hazard == "cyclone" or args.all_scenarios or not args.hazard:
        m = joblib.load(models["cyclone"])
        run_cyclone_test(m)

    if args.hazard == "landslide" or args.all_scenarios or not args.hazard:
        m = joblib.load(models["landslide"])
        run_landslide_test(m)

    if args.hazard == "heatwave" or args.all_scenarios or not args.hazard:
        bundle = joblib.load(models["heatwave"])
        run_heatwave_test(bundle)

    print("\n" + "=" * 70)
    print("ALL SCENARIO SIMULATIONS COMPLETED SUCCESSFULLY.")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
