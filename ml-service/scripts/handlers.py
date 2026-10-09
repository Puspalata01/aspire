"""One handler per *access method* (see `access:` in config/datasets.yaml).

Every handler: takes a Ctx, logs each file through ctx.rec(), never raises for
expected problems (missing credentials, missing optional package, 404 tile ...).
Unexpected exceptions are caught by the orchestrator so one dataset can never
stop the others (manifest section 15).
"""
from __future__ import annotations

import calendar
import csv
import io
import json
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import quote, urlparse

from common import (OK_STATUSES, Ctx, gdal_available, gdal_clip, http_download,
                    quadkey_bbox, tile_name, tile_origins, utcnow)


# =========================================================================== #
# 1. Zenodo record API  (dataset 01)
# =========================================================================== #
def zenodo_api(ctx: Ctx) -> None:
    p = ctx.params
    rid, base = str(p["record_id"]), p.get("api_base", "https://zenodo.org")
    started = utcnow()
    files: list[tuple[str, str | None]] = []
    try:
        rec = ctx.get_json(f"{base}/api/records/{rid}")
        for f in rec.get("files") or []:
            key = f.get("key") or f.get("filename")
            chk = f.get("checksum", "") or ""
            files.append((key, chk.split(":", 1)[1] if chk.startswith("md5:") else None))
        if not ctx.dry_run:                       # pin the exact metadata we downloaded against
            snap = ctx.out_dir / f"zenodo_record_{rid}_{datetime.now():%Y%m%d}.json"
            if not snap.exists():
                snap.write_text(json.dumps(rec, indent=2), encoding="utf-8")
    except Exception as exc:                      # noqa: BLE001
        ctx.rec(f"{base}/api/records/{rid}", ctx.out_dir, "failed", started,
                notes=f"API unreachable ({exc}); trying fallback file names")
        files = [(n, None) for n in p.get("fallback_files", [])]
    for key, md5 in files:
        http_download(ctx, f"{base}/records/{rid}/files/{quote(key)}?download=1", key, md5=md5)


# =========================================================================== #
# 2. Plain HTTP file lists (HydroSHEDS, OSM, IBTrACS)
# =========================================================================== #
def direct_http(ctx: Ctx, files: list[dict] | None = None) -> None:
    p = ctx.params
    for f in files if files is not None else p["files"]:
        if f.get("optional") and not ctx.include_optional:
            ctx.rec(f["url"], ctx.out_dir / f["name"], "skipped_optional", utcnow(),
                    notes="optional file - use --include-optional")
            continue
        md5 = None
        if f.get("md5_url"):
            try:
                tok = ctx.get_text(f["md5_url"], retries=2).split()[0]
                md5 = tok if re.fullmatch(r"[0-9a-fA-F]{32}", tok) else None
            except Exception:                     # noqa: BLE001
                md5 = None
        for url in [f["url"], *f.get("alternates", [])]:
            if http_download(ctx, url, f["name"], md5=md5, unzip=p.get("unzip", False)) in OK_STATUSES:
                break


# =========================================================================== #
# 3. IMD gridded data via the official-endpoint client `imdlib`  (02, 19)
# =========================================================================== #
def imd_gridded(ctx: Ctx) -> None:
    p = ctx.params
    started = utcnow()
    try:
        import imdlib as imd                      # type: ignore
    except ImportError:
        ctx.rec("imdlib", ctx.out_dir, "not_installed", started, notes="pip install imdlib xarray netCDF4")
        return
    y0, y1 = ctx.years
    for var in p.get("variables", ["rain"]):
        vdir = ctx.out_dir / var
        vdir.mkdir(parents=True, exist_ok=True)
        got = []
        for yr in range(max(y0, 1951 if var != "rain" else 1901), y1 + 1):
            t0 = utcnow()
            existing = list(vdir.rglob(f"{yr}.grd"))
            if existing:
                ctx.rec(f"imdlib:{var}:{yr}", existing[0], "skipped_exists", t0, existing[0].stat().st_size)
                got.append(yr)
                continue
            if ctx.dry_run:
                ctx.rec(f"imdlib:{var}:{yr}", vdir / f"{yr}.grd", "dry_run", t0, notes="would download")
                continue
            try:
                imd.get_data(var, yr, yr, fn_format="yearwise", file_dir=str(vdir))
            except Exception as exc:              # noqa: BLE001
                ctx.rec(f"imdlib:{var}:{yr}", vdir, "failed", t0, notes=str(exc)[:300])
                continue
            made = list(vdir.rglob(f"{yr}.grd"))
            if made:
                ctx.rec(f"imdlib:{var}:{yr}", made[0], "downloaded", t0, made[0].stat().st_size)
                got.append(yr)
            else:
                ctx.rec(f"imdlib:{var}:{yr}", vdir, "failed", t0, notes="imdlib produced no file")
        if p.get("to_netcdf") and got and not ctx.dry_run:
            _imd_to_netcdf(ctx, imd, var, vdir, min(got), max(got))


def _imd_to_netcdf(ctx: Ctx, imd, var: str, vdir: Path, y0: int, y1: int) -> None:
    out = vdir / f"{var}_{ctx.aoi.name}_{y0}-{y1}.nc"
    t0 = utcnow()
    if out.exists():
        return
    try:
        ds = imd.open_data(var, y0, y1, "yearwise", str(vdir)).get_xarray()
        w, s, e, n = ctx.aoi.bbox
        ds.sel(lat=slice(s, n), lon=slice(w, e)).to_netcdf(out)
        ctx.rec("derived:imdlib->netcdf", out, "downloaded", t0, out.stat().st_size,
                notes="AOI-clipped NetCDF converted from IMD binary (derived copy; .grd kept as raw)")
    except Exception as exc:                      # noqa: BLE001
        ctx.rec("derived:imdlib->netcdf", out, "failed", t0, notes=f"NetCDF conversion failed: {str(exc)[:250]}")


# =========================================================================== #
# 4. NASA Earthdata via `earthaccess`  (04, 21, 23, 24, optionally 07)
# =========================================================================== #
def _temporal_windows(ctx: Ctx) -> list[tuple[str, str] | None]:
    p = ctx.params
    if p.get("no_temporal"):
        return [None]
    if p.get("temporal") and not ctx.years_forced:
        return [tuple(p["temporal"])]            # type: ignore[list-item]
    y0, y1 = ctx.years if ctx.years_forced else (p.get("years") or ctx.years)
    months = p.get("months")
    if months:
        m0, m1 = min(months), max(months)
        return [(f"{y}-{m0:02d}-01", f"{y}-{m1:02d}-{calendar.monthrange(y, m1)[1]}")
                for y in range(y0, y1 + 1)]
    return [(f"{y0}-01-01", f"{y1}-12-31")]


def earthaccess_search(ctx: Ctx) -> None:
    p = ctx.params
    started = utcnow()
    try:
        import earthaccess                        # type: ignore
    except ImportError:
        ctx.rec("earthaccess", ctx.out_dir, "not_installed", started, notes="pip install earthaccess")
        return
    if not ctx.dry_run:                           # CMR search is public; only download needs login
        authed = False
        for strategy in ("environment", "netrc"):
            try:
                authed = bool(getattr(earthaccess.login(strategy=strategy), "authenticated", False))
            except Exception:                     # noqa: BLE001
                authed = False
            if authed:
                break
        if not authed:
            ctx.rec("earthaccess", ctx.out_dir, "needs_credentials", started,
                    notes="set EARTHDATA_USERNAME / EARTHDATA_PASSWORD in .env (free account: urs.earthdata.nasa.gov)")
            return
    results = []
    for win in _temporal_windows(ctx):
        kw: dict = {"bounding_box": ctx.aoi.bbox}
        if win:
            kw["temporal"] = win
        for k in ("short_name", "version", "concept_id"):
            if p.get(k):
                kw[k] = p[k]
        try:
            results += earthaccess.search_data(**kw)
        except Exception as exc:                  # noqa: BLE001
            ctx.rec("cmr:search", ctx.out_dir, "failed", started, notes=f"CMR search failed: {str(exc)[:250]}")
            return
    if p.get("latest_version_only") and results:
        def ver(g):
            return str(g["umm"].get("CollectionReference", {}).get("Version", ""))
        newest = max(ver(g) for g in results)
        results = [g for g in results if ver(g) == newest]
    found = len(results)
    cap = p.get("max_granules")
    if cap and found > cap:
        results = results[:cap]
    try:
        total_mb = sum(g.size() for g in results)
    except Exception:                             # noqa: BLE001
        total_mb = 0.0
    index = ctx.out_dir / "granule_index.csv"
    if not ctx.dry_run or not index.exists():
        with open(index, "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(["granule", "size_mb", "links"])
            for g in results:
                try:
                    w.writerow([g["umm"]["GranuleUR"], f"{g.size():.1f}", ";".join(g.data_links())])
                except Exception:                 # noqa: BLE001
                    pass
    note = f"{found} granules found, {len(results)} selected (cap={cap}), ~{total_mb / 1024:.2f} GB"
    if ctx.dry_run:
        ctx.rec("cmr:search", index, "dry_run", started, notes=note)
        return
    todo = []
    for g in results:
        names = [Path(urlparse(u).path).name for u in g.data_links()]
        if names and all((ctx.out_dir / n).exists() for n in names):
            continue
        todo.append(g)
    skipped = len(results) - len(todo)
    if not todo:
        ctx.rec("cmr:search", index, "skipped_exists", started, notes=f"{note}; all already present")
        return
    try:
        paths = earthaccess.download(todo, str(ctx.out_dir))
    except Exception as exc:                      # noqa: BLE001
        ctx.rec("earthaccess.download", ctx.out_dir, "failed", started, notes=str(exc)[:300])
        return
    n_ok = 0
    for fp in paths:
        if isinstance(fp, (str, Path)) and Path(fp).exists():
            n_ok += 1
            ctx.rec("earthaccess", Path(fp), "downloaded", started, Path(fp).stat().st_size)
    if n_ok < len(todo):
        ctx.rec("earthaccess", ctx.out_dir, "failed", started, notes=f"only {n_ok}/{len(todo)} granules downloaded")
    if skipped:
        ctx.rec("earthaccess", ctx.out_dir, "skipped_exists", started, notes=f"{skipped} granules already present")


# =========================================================================== #
# 5. ERA5 via CDS API  (05)
# =========================================================================== #
def cds_era5(ctx: Ctx) -> None:
    p = ctx.params
    started = utcnow()
    try:
        import cdsapi                             # type: ignore
    except ImportError:
        ctx.rec("cdsapi", ctx.out_dir, "not_installed", started, notes="pip install cdsapi")
        return
    have_key = os.getenv("CDSAPI_KEY") or (Path.home() / ".cdsapirc").exists()
    if not have_key and not ctx.dry_run:
        ctx.rec("cdsapi", ctx.out_dir, "needs_credentials", started,
                notes="set CDSAPI_KEY (and accept the dataset licence) or create ~/.cdsapirc")
        return
    y0, y1 = ctx.years
    hours = [f"{h:02d}:00" for h in range(24)] if p.get("hours", "all") == "all" else p["hours"]
    monthly = p.get("chunk", "year") == "month"
    client = None
    for year in range(y0, y1 + 1):
        for month in (range(1, 13) if monthly else [None]):
            tag = f"{year}{month:02d}" if month else str(year)
            target = ctx.out_dir / f"era5_single_levels_{tag}.nc"
            t0 = utcnow()
            url = f"cds:{p['dataset']}:{tag}"
            if target.exists() or target.with_suffix("").is_dir():
                ctx.rec(url, target, "skipped_exists", t0, target.stat().st_size if target.exists() else 0)
                continue
            if ctx.dry_run:
                ctx.rec(url, target, "dry_run", t0, notes="would request")
                continue
            if client is None:
                client = cdsapi.Client(url=os.getenv("CDSAPI_URL") or None,
                                       key=os.getenv("CDSAPI_KEY") or None, quiet=True)
            req = {"product_type": ["reanalysis"], "variable": p["variables"], "year": [str(year)],
                   "month": [f"{month:02d}"] if month else [f"{m:02d}" for m in range(1, 13)],
                   "day": [f"{d:02d}" for d in range(1, 32)], "time": hours,
                   "data_format": "netcdf", "download_format": "unarchived",
                   "area": ctx.aoi.cds_area}
            try:
                client.retrieve(p["dataset"], req, str(target))
            except Exception as exc:              # noqa: BLE001
                ctx.rec(url, target, "failed", t0, notes=str(exc)[:300])
                continue
            with open(target, "rb") as fh:       # CDS may still wrap multi-stream output in a zip
                is_zip = fh.read(2) == b"PK"
            if is_zip:
                from common import safe_extract_zip
                zp = target.with_suffix(".zip")
                target.rename(zp)
                safe_extract_zip(zp, target.with_suffix(""))
                target = zp
            ctx.rec(url, target, "downloaded", t0, target.stat().st_size, notes=f"area N,W,S,E={ctx.aoi.cds_area}")


# =========================================================================== #
# 6. Tiled public HTTP buckets (WorldCover 10, SRTM/AWS 07)
# =========================================================================== #
def tiled_http(ctx: Ctx, params: dict | None = None) -> None:
    p = params or ctx.params
    step = 3 if p["scheme"] == "esa3deg" else 1
    for lat, lon in tile_origins(ctx.aoi, step):
        tile = tile_name(lat, lon)
        url = p["url_template"].format(tile=tile, lat_dir=tile[:3])
        http_download(ctx, url, f"tiles/{Path(urlparse(url).path).name}",
                      gunzip=p.get("gunzip", False), allow_missing=p.get("allow_missing", True))


# =========================================================================== #
# 7. SRTM (07): aws_skadi | earthaccess | gee
# =========================================================================== #
def srtm(ctx: Ctx) -> None:
    p = ctx.params
    method = p.get("method", "aws_skadi")
    if method == "aws_skadi":
        tiled_http(ctx, {"scheme": "skadi1deg", "url_template": p["url_template"],
                         "gunzip": True, "allow_missing": True})
    elif method == "earthaccess":
        ctx.params = {"short_name": "SRTMGL1", "version": "003", "no_temporal": True,
                      "max_granules": None}
        earthaccess_search(ctx)
    elif method == "gee":
        w, s, e, n = ctx.aoi.bbox
        script = ctx.out_dir / "gee_export_srtm.py"
        started = utcnow()
        if not script.exists():
            script.write_text(
                "# Run once:  earthengine authenticate   then   python gee_export_srtm.py\n"
                "import ee\nee.Initialize()  # or ee.Initialize(project='YOUR_PROJECT')\n"
                f"region = ee.Geometry.Rectangle([{w}, {s}, {e}, {n}])\n"
                f"dem = ee.Image('{p.get('gee_asset', 'USGS/SRTMGL1_003')}').clip(region)\n"
                "layers = {'elevation': dem.select('elevation'),\n"
                "          'slope': ee.Terrain.slope(dem),\n"
                "          'aspect': ee.Terrain.aspect(dem)}\n"
                "for name, img in layers.items():\n"
                "    task = ee.batch.Export.image.toDrive(image=img, description=f'srtm_{name}_odisha',\n"
                "        folder='mhd_srtm', region=region, scale=30, crs='EPSG:4326', maxPixels=1e10)\n"
                "    task.start(); print('started', name)\n", encoding="utf-8")
        ctx.rec("earthengine:" + p.get("gee_asset", ""), script, "manual_required", started,
                notes="Earth Engine exports to Drive: run gee_export_srtm.py, then copy the GeoTIFFs here")
    else:
        ctx.rec("srtm", ctx.out_dir, "failed", utcnow(), notes=f"unknown method '{method}'")


# =========================================================================== #
# 8. SoilGrids windowed over HTTPS with GDAL  (09)
# =========================================================================== #
def soilgrids(ctx: Ctx) -> None:
    p = ctx.params
    for var in p["variables"]:
        for depth in p["depths"]:
            src = f"{p['base_url']}/{var}/{var}_{depth}_{p.get('stat', 'mean')}.vrt"
            dest = ctx.out_dir / var / f"{var}_{depth}_{p.get('stat', 'mean')}_{ctx.aoi.name}.tif"
            t0 = utcnow()
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists():
                ctx.rec(src, dest, "skipped_exists", t0, dest.stat().st_size)
            elif ctx.dry_run:
                ctx.rec(src, dest, "dry_run", t0, notes="would clip with gdalwarp")
            elif not gdal_available(warp=True):
                ctx.rec(src, dest, "not_installed", t0,
                        notes="GDAL missing: conda install -c conda-forge gdal  (or apt install gdal-bin)")
                return
            else:
                ok, note = gdal_clip(src, dest, ctx.aoi, warp=True, pixel_deg=p.get("pixel_deg"))
                ctx.rec(src, dest, "downloaded" if ok else "failed", t0,
                        dest.stat().st_size if ok else 0, notes=note)


# =========================================================================== #
# 9. Big GeoTIFFs: window with GDAL, else fall back to full download (12, 13)
# =========================================================================== #
def gdal_remote(ctx: Ctx) -> None:
    p = ctx.params
    for f in p["files"]:
        url, name = f["url"], f["name"]
        full = ctx.out_dir / name
        clipped = ctx.out_dir / "aoi_clip" / f"{Path(name).stem}_{ctx.aoi.name}.tif"
        t0 = utcnow()
        for existing in (clipped, full):
            if existing.exists():
                ctx.rec(url, existing, "skipped_exists", t0, existing.stat().st_size)
                break
        else:
            if p.get("clip", True) and gdal_available():
                if ctx.dry_run:
                    ctx.rec(url, clipped, "dry_run", t0, notes="would window with gdal_translate")
                    continue
                clipped.parent.mkdir(parents=True, exist_ok=True)
                ok, note = gdal_clip(url, clipped, ctx.aoi)
                if ok:
                    ctx.rec(url, clipped, "downloaded", t0, clipped.stat().st_size, notes=note)
                    continue
                note += "; falling back to full download"
            else:
                note = "GDAL not available" if p.get("clip", True) else "clip disabled"
            if p.get("fallback_full", True):
                if note:
                    print(f"    [{name}] {note}")
                http_download(ctx, url, name)
            else:
                ctx.rec(url, full, "failed", t0, notes=note)


# =========================================================================== #
# 10. Copernicus Data Space - Sentinel-1  (11)
# =========================================================================== #
CDSE_CATALOGUE = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
CDSE_TOKEN = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
CDSE_DOWNLOAD = "https://download.dataspace.copernicus.eu/odata/v1/Products({id})/$value"


def _cdse_token(ctx: Ctx) -> str | None:
    user, pwd = os.getenv("CDSE_USERNAME"), os.getenv("CDSE_PASSWORD")
    if not (user and pwd):
        return None
    r = ctx.session.post(CDSE_TOKEN, data={"client_id": "cdse-public", "username": user,
                                           "password": pwd, "grant_type": "password"}, timeout=60)
    r.raise_for_status()
    return r.json()["access_token"]


def sentinel1(ctx: Ctx) -> None:
    p = ctx.params
    ptype = p.get("product_type", "IW_GRDH_1S")
    rows: list[dict] = []
    started = utcnow()
    for start, end in p.get("date_windows", []):
        flt = ("Collection/Name eq 'SENTINEL-1' and "
               f"OData.CSC.Intersects(area=geography'SRID=4326;{ctx.aoi.wkt()}') and "
               f"ContentDate/Start gt {start}T00:00:00.000Z and ContentDate/Start lt {end}T23:59:59.999Z and "
               "Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and "
               f"att/OData.CSC.StringAttribute/Value eq '{ptype}')")
        try:
            js = ctx.get_json(CDSE_CATALOGUE, params={"$filter": flt, "$orderby": "ContentDate/Start asc",
                                                      "$top": 1000}, timeout=120)
        except Exception as exc:                  # noqa: BLE001
            ctx.rec(CDSE_CATALOGUE, ctx.out_dir, "failed", started, notes=f"catalogue query failed: {str(exc)[:250]}")
            return
        for it in js.get("value", []):
            rows.append({"id": it["Id"], "name": it["Name"], "start": it["ContentDate"]["Start"],
                         "end": it["ContentDate"]["End"], "size_bytes": it.get("ContentLength", 0),
                         "window": f"{start}..{end}"})
    index = ctx.out_dir / f"s1_catalogue_{ptype}.csv"
    if not index.exists() and not ctx.dry_run:
        with open(index, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=["id", "name", "start", "end", "size_bytes", "window"])
            w.writeheader()
            w.writerows(rows)
    total = sum(int(r["size_bytes"] or 0) for r in rows)
    ctx.rec(CDSE_CATALOGUE, index, "dry_run" if ctx.dry_run else "listed", started, total,
            notes=f"{len(rows)} scenes match the AOI/date windows (~{total / 1e9:.1f} GB)")
    if not p.get("download") or ctx.dry_run:
        return
    if not (os.getenv("CDSE_USERNAME") and os.getenv("CDSE_PASSWORD")):
        ctx.rec(CDSE_DOWNLOAD, ctx.out_dir, "needs_credentials", started,
                notes="set CDSE_USERNAME / CDSE_PASSWORD (free account: dataspace.copernicus.eu)")
        return
    for row in rows[: int(p.get("max_downloads", 5))]:
        try:
            token = _cdse_token(ctx)
        except Exception as exc:                  # noqa: BLE001
            ctx.rec(CDSE_TOKEN, ctx.out_dir, "failed", started, notes=f"token request failed: {str(exc)[:200]}")
            return
        http_download(ctx, CDSE_DOWNLOAD.format(id=row["id"]), f"scenes/{row['name']}.zip",
                      headers={"Authorization": f"Bearer {token}"}, manual_redirect=True, timeout=300)


# =========================================================================== #
# 11. Microsoft building footprints: tile manifest -> AOI tiles only  (15)
# =========================================================================== #
def ms_buildings(ctx: Ctx) -> None:
    p = ctx.params
    started = utcnow()
    candidates = list(p.get("links_urls", []))
    try:
        readme = ctx.get_text(p["readme_url"], retries=2)
        candidates += [u.replace("$web", "%24web") for u in
                       re.findall(r"https://[^\s)\"'<>]*dataset-links\.csv", readme)]
    except Exception:                             # noqa: BLE001
        pass
    text, used = None, None
    for url in dict.fromkeys(candidates):
        try:
            body = ctx.get_text(url, retries=2, timeout=120)
            if "quadkey" in body[:300].lower():
                text, used = body, url
                break
        except Exception:                         # noqa: BLE001
            continue
    if text is None:
        ctx.rec(";".join(candidates[:3]), ctx.out_dir, "failed", started,
                notes="could not download a dataset-links.csv (check the GitHub README for the current URL)")
        return
    saved = ctx.out_dir / "_tile_manifest" / f"dataset-links_{datetime.now():%Y%m%d}.csv"
    if not ctx.dry_run and not saved.exists():
        saved.parent.mkdir(parents=True, exist_ok=True)
        saved.write_text(text, encoding="utf-8")
    reader = csv.DictReader(io.StringIO(text))
    cols = {c.lower(): c for c in (reader.fieldnames or [])}
    loc_c, qk_c, url_c = cols.get("location"), cols.get("quadkey"), cols.get("url")
    if not (loc_c and qk_c and url_c):
        ctx.rec(used or "", saved, "failed", started, notes=f"unexpected columns: {reader.fieldnames}")
        return
    tiles = [(r[qk_c], r[url_c]) for r in reader
             if r[loc_c] == p.get("location", "India") and ctx.aoi.intersects(quadkey_bbox(r[qk_c]))]
    ctx.rec(used or "", saved, "listed", started, notes=f"{len(tiles)} {p.get('location', 'India')} tiles intersect the AOI")
    for qk, url in tiles[: p.get("max_files") or None]:
        name = Path(urlparse(url).path).name
        http_download(ctx, url, f"{p.get('location', 'India')}/{qk}_{name}", timeout=180)


# =========================================================================== #
# 12. CHIRPS v3: discover files from the directory listing  (22)
# =========================================================================== #
def _list_index(ctx: Ctx, url: str) -> list[str]:
    html = ctx.get_text(url, retries=2)
    return [h for h in re.findall(r'href="([^"?#]+)"', html) if not h.startswith(("/", "..", "http", "?"))]


def _crawl(ctx: Ctx, url: str, depth: int) -> list[str]:
    out: list[str] = []
    try:
        for h in _list_index(ctx, url):
            if h.endswith("/") and depth > 0:
                out += _crawl(ctx, url + h, depth - 1)
            elif h.lower().endswith((".tif", ".tiff")):
                out.append(url + h)
    except Exception:                             # noqa: BLE001
        pass
    return out


def chirps(ctx: Ctx) -> None:
    p = ctx.params
    started = utcnow()
    urls = _crawl(ctx, p["start_url"], 0) or _crawl(ctx, p["fallback_url"], 3)
    if not urls:
        ctx.rec(p["start_url"], ctx.out_dir, "failed", started,
                notes="could not list the CHIRPS repository (layout changed?). Open the URL in a browser and update params.start_url")
        return
    y0, y1 = ctx.years if ctx.years_forced else (p.get("years") or ctx.years)
    wanted = []
    for u in sorted(set(urls)):
        m = re.search(r"\.((?:19|20)\d{2})\.", Path(urlparse(u).path).name)
        if m and y0 <= int(m.group(1)) <= y1:
            wanted.append(u)
    ctx.rec(p["start_url"], ctx.out_dir, "listed", started, notes=f"{len(wanted)} files for {y0}-{y1}")
    use_gdal = p.get("clip", True) and gdal_available()
    if p.get("clip", True) and not use_gdal:
        print("    [chirps] GDAL not found -> downloading full global files")
    for u in wanted:
        name = Path(urlparse(u).path).name
        if not use_gdal:
            http_download(ctx, u, f"global/{name}")
            continue
        dest = ctx.out_dir / "aoi_clip" / name
        t0 = utcnow()
        if dest.exists():
            ctx.rec(u, dest, "skipped_exists", t0, dest.stat().st_size)
        elif ctx.dry_run:
            ctx.rec(u, dest, "dry_run", t0, notes="would window with gdal_translate")
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            ok, note = gdal_clip(u, dest, ctx.aoi)
            ctx.rec(u, dest, "downloaded" if ok else "failed", t0, dest.stat().st_size if ok else 0, notes=note)


# =========================================================================== #
# 13. GEBCO (18): OPeNDAP subset if a URL is supplied, else guided manual step
# =========================================================================== #
def gebco(ctx: Ctx) -> None:
    p = ctx.params
    url = p.get("opendap_url") or os.getenv("GEBCO_OPENDAP_URL")
    if not url:
        manual(ctx, ctx.coastal_aoi)
        return
    out = ctx.out_dir / f"gebco_2025_{ctx.coastal_aoi.name}.nc"
    t0 = utcnow()
    if out.exists():
        ctx.rec(url, out, "skipped_exists", t0, out.stat().st_size)
        return
    if ctx.dry_run:
        ctx.rec(url, out, "dry_run", t0, notes="would subset via OPeNDAP")
        return
    try:
        import xarray as xr                       # type: ignore
        w, s, e, n = ctx.coastal_aoi.bbox
        ds = xr.open_dataset(url)
        ds[[p.get("variable", "elevation")]].sel(lat=slice(s, n), lon=slice(w, e)).to_netcdf(out)
        ctx.rec(url, out, "downloaded", t0, out.stat().st_size, notes="OPeNDAP subset of coastal AOI")
    except Exception as exc:                      # noqa: BLE001
        ctx.rec(url, out, "failed", t0, notes=f"OPeNDAP subset failed: {str(exc)[:250]}")


# =========================================================================== #
# 14. NASA Global Landslide Catalog  (20)
# =========================================================================== #
def landslide(ctx: Ctx) -> None:
    p = ctx.params
    direct_http(ctx, p["files"])
    live = p.get("live_service")
    if not live:
        return
    t0 = utcnow()
    out = ctx.out_dir / f"glc_live_{ctx.aoi.name}_{datetime.now():%Y%m%d}.geojson"
    if ctx.dry_run or out.exists():
        ctx.rec(live, out, "skipped_exists" if out.exists() else "dry_run", t0)
        return
    w, s, e, n = ctx.aoi.bbox
    q = {"where": "1=1", "geometry": f"{w},{s},{e},{n}", "geometryType": "esriGeometryEnvelope",
         "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "f": "geojson",
         "resultRecordCount": 2000}
    try:
        js = ctx.get_json(live, params=q, retries=2, timeout=90)
        if "features" not in js:
            raise ValueError(str(js)[:200])
        out.write_text(json.dumps(js), encoding="utf-8")
        ctx.rec(live, out, "downloaded", t0, out.stat().st_size, notes=f"{len(js['features'])} live GLC features in AOI")
    except Exception as exc:                      # noqa: BLE001
        ctx.rec(live, out, "failed", t0, notes=f"live GLC service not usable (best-effort): {str(exc)[:200]}")


# =========================================================================== #
# 15. Portal / manual datasets (03, 06, 14, 18)
# =========================================================================== #
def manual(ctx: Ctx, aoi=None) -> None:
    aoi = aoi or ctx.aoi
    w, s, e, n = aoi.bbox
    steps = "\n".join(f"{i}. {t}" for i, t in enumerate(ctx.params.get("steps", []), 1))
    doc = ctx.out_dir / "MANUAL_STEPS.md"
    doc.write_text(
        f"# {ctx.number:02d} - {ctx.name}\n\n"
        f"- Source: {ctx.source_url}\n- Version: {ctx.version}\n"
        f"- Area of interest ({aoi.name}): west={w}, south={s}, east={e}, north={n}\n"
        f"- Years: {ctx.years[0]}-{ctx.years[1]}\n\n## Steps\n{steps}\n\n"
        "After saving files in this folder, re-run the downloader to record them in\n"
        "`data/download_manifest.csv`.\n", encoding="utf-8")
    mine = [f for f in ctx.out_dir.rglob("*")
            if f.is_file() and f.name not in {"MANUAL_STEPS.md", "_SOURCE.json"} and not f.name.startswith(".")]
    t0 = utcnow()
    if mine:
        ctx.rec(ctx.source_url, ctx.out_dir, "manual_present", t0, sum(f.stat().st_size for f in mine),
                notes=f"{len(mine)} user-supplied file(s) found")
    else:
        ctx.rec(ctx.source_url, doc, "manual_required", t0, notes="portal download - see MANUAL_STEPS.md")


# --------------------------------------------------------------------------- #
HANDLERS = {
    "zenodo_api": zenodo_api,
    "direct_http": direct_http,
    "imdlib": imd_gridded,
    "earthaccess": earthaccess_search,
    "cdsapi": cds_era5,
    "tiled_http": tiled_http,
    "srtm": srtm,
    "soilgrids": soilgrids,
    "gdal_remote": gdal_remote,
    "sentinel1": sentinel1,
    "ms_buildings": ms_buildings,
    "chirps": chirps,
    "gebco": gebco,
    "landslide": landslide,
    "manual": manual,
}
