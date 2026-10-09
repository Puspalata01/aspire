#!/usr/bin/env python3
"""
MASTER TRAINING RUNNER v2
===========================
Trains all 4 hazard models with new datasets:
  - Flood     v3: terrain + CHIRPS anomaly + WorldPop exposure
  - Cyclone   v2: RI flag + WorldPop coastal exposure + calibration
  - Landslide v2: HydroSHEDS slope/TRI + SoilGrids + antecedent rainfall
  - Heatwave  v3: CHIRPS moisture deficit + urban heat island + elevation

Usage:
    python ml-service/training/train_all.py              # Train all
    python ml-service/training/train_all.py --only flood cyclone
    python ml-service/training/train_all.py --only heatwave
"""

import sys, argparse, logging, json, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from training.common.utils import setup_logging

setup_logging()
log = logging.getLogger("train_all")

MODELS = ["flood", "cyclone", "landslide", "heatwave"]


def run_model(name: str) -> dict:
    log.info(f"\n{'='*70}\n  TRAINING: {name.upper()}\n{'='*70}")
    t0 = time.time()
    try:
        if name == "flood":
            from training.flood.train_flood import train
        elif name == "cyclone":
            from training.cyclone.train_cyclone import train
        elif name == "landslide":
            from training.landslide.train_landslide import train
        elif name == "heatwave":
            from training.heatwave.train_heatwave import train
        else:
            raise ValueError(f"Unknown model: {name}")

        _, results = train()
        elapsed = time.time() - t0
        log.info(f"✅ {name} done in {elapsed:.1f}s")
        return {"status": "success", "elapsed_s": round(elapsed, 1), "metrics": results}
    except Exception as e:
        elapsed = time.time() - t0
        log.error(f"❌ {name} FAILED after {elapsed:.1f}s: {e}", exc_info=True)
        return {"status": "failed", "error": str(e), "elapsed_s": round(elapsed, 1)}


def main():
    parser = argparse.ArgumentParser(description="Train hazard ML models")
    parser.add_argument("--only", nargs="+", choices=MODELS,
                        help="Train only these models")
    args = parser.parse_args()

    to_train = args.only if args.only else MODELS
    log.info(f"Will train: {to_train}")

    summary = {}
    for model_name in to_train:
        summary[model_name] = run_model(model_name)

    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    for name, result in summary.items():
        status = "✅" if result["status"] == "success" else "❌"
        print(f"  {status} {name:12s}  {result['status']:8s}  {result['elapsed_s']}s")
        if result["status"] == "success" and "metrics" in result:
            m = result["metrics"]
            # Binary models
            if "test" in m and isinstance(m["test"], dict):
                t = m["test"]
                print(f"       AUC={t.get('auc_roc','?')}  F1={t.get('f1','?')}  "
                      f"Precision={t.get('precision','?')}  Recall={t.get('recall','?')}")
            # Cyclone multi-class
            if "cv_accuracy_mean" in m:
                print(f"       CV-Accuracy={m['cv_accuracy_mean']:.4f}")
            if "cv_auc_mean" in m:
                print(f"       CV-AUC={m['cv_auc_mean']:.4f} ± {m.get('cv_auc_std',0):.4f}")
    print("=" * 60)

    from pathlib import Path
    from training.common.config import REPORTS_OUT
    REPORTS_OUT.mkdir(parents=True, exist_ok=True)
    with open(REPORTS_OUT / "training_summary.json", "w") as f:
        json.dump(summary, f, indent=2, default=str)
    log.info(f"Summary saved to {REPORTS_OUT / 'training_summary.json'}")


if __name__ == "__main__":
    main()
