#!/usr/bin/env python3
"""Multi-Hazard dataset downloader - orchestrator.

    python scripts/download/run_downloads.py init                 # create folder tree only
    python scripts/download/run_downloads.py list                 # show all 24 datasets
    python scripts/download/run_downloads.py run --phase mvp --dry-run
    python scripts/download/run_downloads.py run --phase flood_core --yes
    python scripts/download/run_downloads.py run --only 1 5 16 --yes
    python scripts/download/run_downloads.py status

Datasets always run in ascending number order (01 ... 24). Each dataset is
independent: a failure, missing login or missing optional package is logged to
data/download_manifest.csv and the run continues (manifest section 15).
"""
from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import sys
import traceback
from collections import Counter
from datetime import datetime
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from common import AOI, OK_STATUSES, Ctx, ManifestLog, human, load_env, utcnow  # noqa: E402
from handlers import HANDLERS                                                   # noqa: E402

ROOT = HERE.parents[1]

PROCESSED_DIRS = ["spatial_grid", "rainfall_features", "terrain_features", "hydrology_features",
                  "landcover_features", "exposure_features", "labels"]
MODEL_DIRS = ["flood_xgb", "cyclone", "storm_surge", "heatwave", "landslide", "lightning", "drought"]
SCRIPT_DIRS = ["download", "preprocess", "feature_engineering", "training"]


# --------------------------------------------------------------------------- #
# config / selection
# --------------------------------------------------------------------------- #
def load_config(path: Path) -> dict:
    with open(path, encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh)
    nums = [d["number"] for d in cfg["datasets"]]
    if len(set(nums)) != len(nums):
        raise SystemExit("config error: duplicate dataset numbers")
    return cfg


def folder_of(ds: dict) -> str:
    return f"{ds['number']:02d}_{ds['id']}"


def expand_phase(cfg: dict, name: str, seen: set | None = None) -> set[int]:
    seen = seen or set()
    if name in seen:
        return set()
    seen.add(name)
    out: set[int] = set()
    for item in cfg["phases"][name]:
        out |= expand_phase(cfg, item, seen) if isinstance(item, str) else {item}
    return out


def select(cfg: dict, args: argparse.Namespace) -> list[dict]:
    by_num = {d["number"]: d for d in cfg["datasets"]}
    by_id = {d["id"]: d for d in cfg["datasets"]}
    chosen: set[int] = set()
    for ph in args.phase or []:
        if ph not in cfg["phases"]:
            raise SystemExit(f"unknown phase '{ph}'. Available: {', '.join(cfg['phases'])}")
        chosen |= expand_phase(cfg, ph)
    for tok in args.only or []:
        if tok.isdigit() and int(tok) in by_num:
            chosen.add(int(tok))
        elif tok in by_id:
            chosen.add(by_id[tok]["number"])
        else:
            raise SystemExit(f"unknown dataset '{tok}' (use number 1-24 or id; see `list`)")
    for tok in args.exclude or []:
        chosen.discard(int(tok) if tok.isdigit() else by_id.get(tok, {}).get("number", -1))
    return [by_num[n] for n in sorted(chosen)]


# --------------------------------------------------------------------------- #
# folder tree  (manifest section 13)
# --------------------------------------------------------------------------- #
def init_tree(cfg: dict, data_root: Path) -> None:
    for ds in cfg["datasets"]:
        (data_root / "raw" / folder_of(ds)).mkdir(parents=True, exist_ok=True)
    for sub in PROCESSED_DIRS:
        (data_root / "processed" / sub).mkdir(parents=True, exist_ok=True)
    (data_root / "final").mkdir(parents=True, exist_ok=True)
    for sub in MODEL_DIRS:
        (ROOT / "models" / sub).mkdir(parents=True, exist_ok=True)
    for sub in SCRIPT_DIRS:
        (ROOT / "scripts" / sub).mkdir(parents=True, exist_ok=True)
    (ROOT / "logs").mkdir(exist_ok=True)
    for d in [*(data_root / "processed").iterdir(), data_root / "final", *(ROOT / "models").iterdir(),
              ROOT / "scripts" / "preprocess", ROOT / "scripts" / "feature_engineering",
              ROOT / "scripts" / "training"]:
        if d.is_dir() and not any(d.iterdir()):
            (d / ".gitkeep").touch()
    write_index(cfg, data_root)


def write_index(cfg: dict, data_root: Path) -> None:
    phase_of = {}
    for ph in ("flood_core", "flood_extras", "exposure", "optional", "later"):
        for n in expand_phase(cfg, ph):
            phase_of[n] = ph
    lines = ["# data/raw index (generated - do not edit)\n",
             "| # | Folder | Dataset | Hazards | Access | Login | Phase | ~Size |",
             "|---|---|---|---|---|---|---|---|"]
    for ds in sorted(cfg["datasets"], key=lambda d: d["number"]):
        lines.append(f"| {ds['number']:02d} | `{folder_of(ds)}/` | {ds['name']} | {', '.join(ds['hazards'])} | "
                     f"{ds['access']} | {ds['auth']} | {phase_of.get(ds['number'], '-')} | {ds['approx_size']} |")
    (data_root / "raw" / "INDEX.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def aoi_from(block: dict) -> AOI:
    return AOI(block["west"], block["south"], block["east"], block["north"], block.get("name", "aoi"))


def cred_warnings(sel: list[dict]) -> list[str]:
    msgs = []
    auths = {d["auth"] for d in sel}
    if "earthdata" in auths and not (os.getenv("EARTHDATA_USERNAME") or (Path.home() / ".netrc").exists()):
        msgs.append("NASA Earthdata login missing (datasets " + ", ".join(
            f"{d['number']:02d}" for d in sel if d["auth"] == "earthdata") + ") -> set EARTHDATA_USERNAME/PASSWORD")
    if "cds" in auths and not (os.getenv("CDSAPI_KEY") or (Path.home() / ".cdsapirc").exists()):
        msgs.append("Copernicus CDS key missing (dataset 05) -> set CDSAPI_KEY or create ~/.cdsapirc")
    if "cdse" in auths and not os.getenv("CDSE_USERNAME"):
        msgs.append("Copernicus Data Space login missing (dataset 11) -> catalogue works; downloads need CDSE_USERNAME/PASSWORD")
    return msgs


def summarise(statuses: list[str]) -> str:
    if not statuses:
        return "no_files"
    c = Counter(statuses)
    bad = c["failed"] + c["auth_required"] + c["not_found"]
    good = sum(v for k, v in c.items() if k in OK_STATUSES)
    for blocker in ("needs_credentials", "not_installed"):
        if c[blocker] and not good:
            return blocker
    if c["manual_required"] and not good:
        return "manual_required"
    if bad and not good:
        return "failed"
    if bad or c["needs_credentials"] or c["not_installed"]:
        return "partial"
    for s in ("downloaded", "manual_present", "listed", "skipped_exists", "dry_run", "skipped_optional"):
        if c[s]:
            return s
    return "unknown"


def write_source_json(ctx: Ctx, ds: dict, cfg: dict) -> None:
    meta = {"dataset": folder_of(ds), "name": ds["name"], "source_url": ds["source_url"],
            "version": ds["version"], "license": ds["license"], "hazards": ds["hazards"],
            "access_method": ds["access"], "access_date_utc": utcnow(),
            "aoi": ctx.aoi.__dict__, "years": list(ctx.years), "notes": " ".join(str(ds.get("notes", "")).split()),
            "params": ds.get("params", {})}
    (ctx.out_dir / "_SOURCE.json").write_text(json.dumps(meta, indent=2, default=str), encoding="utf-8")


# --------------------------------------------------------------------------- #
# commands
# --------------------------------------------------------------------------- #
def cmd_list(cfg: dict, _args) -> None:
    print(f"{'#':>2}  {'folder':<28} {'access':<12} {'login':<9} {'size':<44} name")
    for ds in sorted(cfg["datasets"], key=lambda d: d["number"]):
        print(f"{ds['number']:>2}  {folder_of(ds):<28} {ds['access']:<12} {ds['auth']:<9} "
              f"{ds['approx_size'][:43]:<44} {ds['name']}")
    print("\nPhases:", ", ".join(f"{k}={sorted(expand_phase(cfg, k))}" for k in cfg["phases"] if k in
                                ("flood_core", "flood_extras", "exposure", "optional", "later")))


def cmd_init(cfg: dict, args, data_root: Path) -> None:
    init_tree(cfg, data_root)
    print(f"Folder tree ready under {data_root} (24 numbered raw folders + processed/ final/ models/ scripts/).")


def cmd_run(cfg: dict, args, data_root: Path) -> int:
    sel = select(cfg, args)
    if not sel:
        print("Nothing selected. Use --phase (mvp, flood_core, exposure, later, all ...) or --only 1 5 16.")
        return 2
    init_tree(cfg, data_root)
    logs = ROOT / "logs"
    log_file = logs / f"download_{datetime.now():%Y%m%d_%H%M%S}.log"
    logging.basicConfig(filename=log_file, level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    log = logging.getLogger("mhd")

    aoi, coastal = aoi_from(cfg["aoi"]), aoi_from(cfg["coastal_aoi"])
    if args.aoi:
        w, s, e, n = args.aoi
        aoi = AOI(w, s, e, n, "custom_aoi")
    years = tuple(args.years) if args.years else (cfg["time_range"]["start_year"], cfg["time_range"]["end_year"])

    print(f"\nAOI {aoi.name}: W{aoi.west} S{aoi.south} E{aoi.east} N{aoi.north} | years {years[0]}-{years[1]}"
          f" | {'DRY RUN' if args.dry_run else 'LIVE'} | optional files: {'on' if args.include_optional else 'off'}")
    print(f"\n{'#':>2}  {'folder':<26} {'login':<9} approx size")
    for ds in sel:
        print(f"{ds['number']:>2}  {folder_of(ds):<26} {ds['auth']:<9} {ds['approx_size']}")
    for m in cred_warnings(sel):
        print(f"  ! {m}")
    if not args.dry_run and not args.yes:
        if not sys.stdin.isatty():
            print("\nRefusing to start a live download non-interactively without --yes.")
            return 2
        if input("\nProceed with the downloads above? [y/N] ").strip().lower() != "y":
            print("Aborted.")
            return 1

    manifest = ManifestLog(data_root / "download_manifest.csv")
    summary: list[tuple[str, str, int, int]] = []
    for ds in sel:
        print(f"\n[{ds['number']:02d}/24] {ds['name']}  ({ds['access']})")
        ctx = Ctx(number=ds["number"], ds_id=ds["id"], name=ds["name"], version=ds["version"],
                  source_url=ds["source_url"], params=dict(ds.get("params") or {}),
                  out_dir=data_root / "raw" / folder_of(ds), aoi=aoi, coastal_aoi=coastal,
                  years=years, manifest=manifest, root=ROOT, dry_run=args.dry_run,
                  include_optional=args.include_optional, years_forced=bool(args.years))
        handler = HANDLERS.get(ds["access"])
        t0 = utcnow()
        try:
            if handler is None:
                raise RuntimeError(f"no handler for access '{ds['access']}'")
            write_source_json(ctx, ds, cfg)
            handler(ctx)
        except KeyboardInterrupt:
            print("\nInterrupted - partial files are kept and will resume on the next run.")
            ctx.rec("-", ctx.out_dir, "failed", t0, notes="interrupted by user")
            break
        except Exception as exc:                  # noqa: BLE001 - one dataset must not stop the rest
            log.error("dataset %s crashed:\n%s", ds["id"], traceback.format_exc())
            ctx.rec("-", ctx.out_dir, "failed", t0, notes=f"unhandled error: {exc}")
        overall = summarise(ctx.statuses)
        c = Counter(ctx.statuses)
        detail = ", ".join(f"{v} {k}" for k, v in sorted(c.items()))
        print(f"    -> {overall.upper()}  ({detail or 'no files'})")
        log.info("%s -> %s (%s)", folder_of(ds), overall, detail)
        summary.append((folder_of(ds), overall, c["downloaded"], c["failed"] + c["auth_required"]))

    print("\n" + "=" * 70 + "\nSUMMARY")
    for folder, overall, n_ok, n_bad in summary:
        print(f"  {folder:<28} {overall:<18} new files: {n_ok:<5} problems: {n_bad}")
    print(f"\nLog file : {log_file}\nManifest : {data_root / 'download_manifest.csv'}")
    return 0


def cmd_status(cfg: dict, _args, data_root: Path) -> None:
    path = data_root / "download_manifest.csv"
    if not path.exists():
        print("No manifest yet - nothing has been run.")
        return
    latest: dict[str, Counter] = {}
    nbytes: Counter = Counter()
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    last_ts: dict[str, str] = {}
    for r in rows:                                    # keep only the most recent run per dataset
        last_ts[r["dataset"]] = max(last_ts.get(r["dataset"], ""), r["started_at"][:10])
    for r in rows:
        if r["started_at"][:10] == last_ts[r["dataset"]]:
            latest.setdefault(r["dataset"], Counter())[r["status"]] += 1
            if r["status"] in ("downloaded", "skipped_exists"):
                nbytes[r["dataset"]] += int(r["bytes"] or 0)
    print(f"{'dataset':<28} {'last run':<11} {'on disk':>10}  statuses")
    for ds in sorted(cfg["datasets"], key=lambda d: d["number"]):
        key = folder_of(ds)
        if key in latest:
            print(f"{key:<28} {last_ts[key]:<11} {human(nbytes[key]):>10}  "
                  f"{', '.join(f'{v} {k}' for k, v in sorted(latest[key].items()))}")
        else:
            print(f"{key:<28} {'-':<11} {'-':>10}  not run")


# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=str(ROOT / "config" / "datasets.yaml"))
    ap.add_argument("--data-root", help="override project.data_root from the config")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init", help="create the numbered folder tree and exit")
    sub.add_parser("list", help="list all datasets")
    sub.add_parser("status", help="summarise download_manifest.csv per dataset")
    r = sub.add_parser("run", help="download datasets (sequential, independent)")
    r.add_argument("--phase", nargs="+", metavar="PHASE", help="flood_core flood_extras exposure mvp optional later all")
    r.add_argument("--only", nargs="+", metavar="N", help="dataset numbers or ids, e.g. 1 5 era5")
    r.add_argument("--exclude", nargs="+", metavar="N")
    r.add_argument("--years", nargs=2, type=int, metavar=("START", "END"), help="override every dataset's year range")
    r.add_argument("--aoi", nargs=4, type=float, metavar=("W", "S", "E", "N"), help="override the AOI bounding box")
    r.add_argument("--dry-run", action="store_true", help="plan only; no files are downloaded")
    r.add_argument("--include-optional", action="store_true", help="also fetch files flagged optional (large)")
    r.add_argument("--yes", "-y", action="store_true", help="do not ask for confirmation")
    args = ap.parse_args()

    load_env(ROOT / ".env")
    cfg = load_config(Path(args.config))
    data_root = Path(args.data_root) if args.data_root else ROOT / cfg["project"]["data_root"]
    if args.cmd == "list":
        cmd_list(cfg, args)
    elif args.cmd == "init":
        cmd_init(cfg, args, data_root)
    elif args.cmd == "status":
        cmd_status(cfg, args, data_root)
    else:
        return cmd_run(cfg, args, data_root)
    return 0


if __name__ == "__main__":
    sys.exit(main())
