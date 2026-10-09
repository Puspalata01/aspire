"""
Shared configuration for all hazard training scripts.
"""
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_ROOT    = PROJECT_ROOT / "multi_hazard_downloader" / "data" / "raw"
MODELS_OUT   = PROJECT_ROOT / "ml-service" / "trained_models"
REPORTS_OUT  = PROJECT_ROOT / "ml-service" / "training_reports"

# ── AOI ───────────────────────────────────────────────────────────────────────
AOI = dict(west=68.0, south=6.5, east=97.5, north=37.5)

# ── Training window ───────────────────────────────────────────────────────────
TRAIN_YEARS = list(range(2014, 2022))   # 2014-2021 → train (8 years)
VAL_YEARS   = [2022]                    # 2022       → val
TEST_YEARS  = [2023]                    # 2023       → held-out test

# ── Random seed ───────────────────────────────────────────────────────────────
SEED = 42

# ── XGBoost — production-grade hyperparameters ────────────────────────────────
XGB_BASE = dict(
    n_estimators          = 2000,
    learning_rate         = 0.02,      # low LR + many trees = better generalisation
    max_depth             = 7,
    min_child_weight      = 10,        # reduces overfitting on sparse data
    subsample             = 0.75,
    colsample_bytree      = 0.75,
    colsample_bylevel     = 0.75,
    reg_alpha             = 0.5,       # L1
    reg_lambda            = 2.0,       # L2
    gamma                 = 0.1,       # min gain to split
    random_state          = SEED,
    n_jobs                = -1,
    early_stopping_rounds = 50,
    tree_method           = "hist",    # fast histogram method
)

# ── Random Forest — production-grade ─────────────────────────────────────────
RF_BASE = dict(
    n_estimators     = 500,
    max_depth        = None,
    min_samples_leaf = 3,
    max_features     = "sqrt",
    class_weight     = "balanced_subsample",
    random_state     = SEED,
    n_jobs           = -1,
)
