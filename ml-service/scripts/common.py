"""Shared building blocks for the multi-hazard dataset downloader.

Implements the manifest's rules:
  Rule 1 clip early        -> AOI helpers, tile selection, GDAL windowing
  Rule 2 pin versions      -> version + source URL written to every log row
  Rule 3 never overwrite   -> existing raw files are skipped / saved alongside
  Rule 4 log every file    -> data/download_manifest.csv (append-only)
  Rule 5 credentials       -> read from environment / .env only
"""
from __future__ import annotations

import csv
import gzip
import hashlib
import math
import os
import shutil
import subprocess
import time
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import requests

USER_AGENT = "multi-hazard-downloader/1.0 (research; set MHD_CONTACT in .env)"

# Exactly the columns proposed in manifest section 16.
MANIFEST_COLUMNS = [
    "dataset", "source_url", "file_url", "local_path", "status",
    "started_at", "finished_at", "bytes", "checksum", "version", "notes",
]

# Statuses that mean "nothing is wrong".
OK_STATUSES = {"downloaded", "skipped_exists", "dry_run", "listed",
               "skipped_optional", "manual_present"}


# --------------------------------------------------------------------------- #
# small utilities
# --------------------------------------------------------------------------- #
def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def human(n: float) -> str:
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if abs(n) < 1024 or unit == "TB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def load_env(path: Path) -> None:
    """Minimal .env loader (KEY=VALUE). Never overrides variables already set."""
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def digests(path: Path) -> tuple[str, str]:
    md5, sha = hashlib.md5(), hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            md5.update(block)
            sha.update(block)
    return md5.hexdigest(), sha.hexdigest()


# --------------------------------------------------------------------------- #
# geography
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class AOI:
    west: float
    south: float
    east: float
    north: float
    name: str = "aoi"

    @property
    def bbox(self) -> tuple[float, float, float, float]:
        return (self.west, self.south, self.east, self.north)

    @property
    def cds_area(self) -> list[float]:          # CDS order: N, W, S, E
        return [self.north, self.west, self.south, self.east]

    def wkt(self) -> str:
        w, s, e, n = self.bbox
        return f"POLYGON(({w} {s},{e} {s},{e} {n},{w} {n},{w} {s}))"

    def intersects(self, other: tuple[float, float, float, float]) -> bool:
        w, s, e, n = other
        return not (e < self.west or w > self.east or n < self.south or s > self.north)


def tile_origins(aoi: AOI, step: int) -> list[tuple[int, int]]:
    """Lower-left (lat, lon) corners of `step`-degree tiles that cover the AOI."""
    lat0 = math.floor(aoi.south / step) * step
    lon0 = math.floor(aoi.west / step) * step
    out = []
    lat = lat0
    while lat < aoi.north:
        lon = lon0
        while lon < aoi.east:
            out.append((lat, lon))
            lon += step
        lat += step
    return out


def tile_name(lat: int, lon: int) -> str:
    """N18E084 style (used by ESA WorldCover and the AWS 'skadi' SRTM tiles)."""
    return f"{'N' if lat >= 0 else 'S'}{abs(lat):02d}{'E' if lon >= 0 else 'W'}{abs(lon):03d}"


def quadkey_bbox(qk: str) -> tuple[float, float, float, float]:
    """Bing quadkey -> (west, south, east, north) in degrees."""
    x = y = 0
    z = len(qk)
    for i, ch in enumerate(qk):
        mask = 1 << (z - i - 1)
        d = int(ch)
        if d & 1:
            x |= mask
        if d & 2:
            y |= mask
    n = 2 ** z

    def lat(ty: int) -> float:
        return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * ty / n))))

    return (x / n * 360 - 180, lat(y + 1), (x + 1) / n * 360 - 180, lat(y))


# --------------------------------------------------------------------------- #
# status log  (data/download_manifest.csv - append only)
# --------------------------------------------------------------------------- #
class ManifestLog:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            with open(path, "w", newline="", encoding="utf-8") as fh:
                csv.writer(fh).writerow(MANIFEST_COLUMNS)

    def write(self, row: dict[str, Any]) -> None:
        with open(self.path, "a", newline="", encoding="utf-8") as fh:
            csv.DictWriter(fh, fieldnames=MANIFEST_COLUMNS, extrasaction="ignore").writerow(row)


# --------------------------------------------------------------------------- #
# run context handed to every handler
# --------------------------------------------------------------------------- #
@dataclass
class Ctx:
    number: int
    ds_id: str
    name: str
    version: str
    source_url: str
    params: dict
    out_dir: Path
    aoi: AOI
    coastal_aoi: AOI
    years: tuple[int, int]
    manifest: ManifestLog
    root: Path
    dry_run: bool = False
    include_optional: bool = False
    years_forced: bool = False          # True when the user passed --years
    statuses: list[str] = field(default_factory=list)
    session: requests.Session = field(default_factory=requests.Session)

    def __post_init__(self) -> None:
        self.session.headers.update({"User-Agent": USER_AGENT})
        self.out_dir.mkdir(parents=True, exist_ok=True)

    # -- logging ----------------------------------------------------------- #
    def rec(self, file_url: str, local: Path | str, status: str, started: str,
            nbytes: int = 0, checksum: str = "", notes: str = "") -> str:
        try:
            local_str = str(Path(local).relative_to(self.root))
        except ValueError:
            local_str = str(local)
        self.manifest.write(dict(
            dataset=f"{self.number:02d}_{self.ds_id}", source_url=self.source_url,
            file_url=file_url, local_path=local_str, status=status,
            started_at=started, finished_at=utcnow(), bytes=nbytes,
            checksum=checksum, version=self.version, notes=notes))
        self.statuses.append(status)
        return status

    # -- small HTTP helpers ------------------------------------------------- #
    def get(self, url: str, retries: int = 3, **kw) -> requests.Response:
        kw.setdefault("timeout", 60)
        last: Exception | None = None
        for attempt in range(1, retries + 1):
            try:
                r = self.session.get(url, **kw)
                r.raise_for_status()
                return r
            except requests.RequestException as exc:      # noqa: PERF203
                last = exc
                time.sleep(min(2 ** attempt, 20))
        raise last  # type: ignore[misc]

    def get_json(self, url: str, **kw) -> Any:
        return self.get(url, **kw).json()

    def get_text(self, url: str, **kw) -> str:
        return self.get(url, **kw).text


# --------------------------------------------------------------------------- #
# resumable, verified, non-overwriting download
# --------------------------------------------------------------------------- #
def _remote_size(ctx: Ctx, url: str, headers, auth, timeout) -> int | None:
    try:
        h = ctx.session.head(url, allow_redirects=True, headers=headers, auth=auth, timeout=timeout)
        if h.ok and h.headers.get("content-length", "").isdigit():
            return int(h.headers["content-length"])
    except requests.RequestException:
        pass
    return None


def _resolve_redirects(ctx: Ctx, url: str, headers: dict, hops: int = 6) -> str:
    """Follow redirects manually, re-sending the auth header on every hop (needed by CDSE)."""
    for _ in range(hops):
        r = ctx.session.get(url, headers=headers, allow_redirects=False, stream=True, timeout=60)
        r.close()
        if r.status_code in (301, 302, 303, 307, 308) and r.headers.get("Location"):
            url = requests.compat.urljoin(url, r.headers["Location"])
        else:
            break
    return url


def safe_extract_zip(zip_path: Path, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    base = dest.resolve()
    with zipfile.ZipFile(zip_path) as zf:
        for member in zf.namelist():
            target = (dest / member).resolve()
            if base not in target.parents and target != base:
                raise RuntimeError(f"unsafe path in archive: {member}")
        zf.extractall(dest)


def http_download(ctx: Ctx, url: str, rel: str | Path, *, headers: dict | None = None,
                  auth=None, md5: str | None = None, unzip: bool = False,
                  gunzip: bool = False, keep_archive: bool = False, retries: int = 4,
                  timeout: int = 90, allow_missing: bool = False,
                  manual_redirect: bool = False) -> str:
    """Download `url` to ctx.out_dir/rel. Returns the status string (also logged)."""
    dest = ctx.out_dir / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    started = utcnow()

    # Already extracted / decompressed on a previous run?
    if unzip and dest.suffix == ".zip":
        folder = dest.with_suffix("")
        if folder.is_dir() and any(folder.iterdir()):
            return ctx.rec(url, folder, "skipped_exists", started, notes="archive already extracted")
    if gunzip and dest.suffix == ".gz" and dest.with_suffix("").exists():
        done = dest.with_suffix("")
        return ctx.rec(url, done, "skipped_exists", started, done.stat().st_size, notes="already decompressed")

    remote = _remote_size(ctx, url, headers, auth, timeout)
    note = ""
    if dest.exists():
        if remote is None or dest.stat().st_size == remote:      # Rule 3: never overwrite
            return ctx.rec(url, dest, "skipped_exists", started, dest.stat().st_size)
        stamp = datetime.now().strftime("%Y%m%d")
        dest = dest.with_name(f"{dest.stem}.updated-{stamp}{dest.suffix}")
        note = "remote size differs from existing file; saved alongside as a new version"

    if ctx.dry_run:
        return ctx.rec(url, dest, "dry_run", started, remote or 0, notes="would download")

    eff_url = url
    if manual_redirect and headers:
        eff_url = _resolve_redirects(ctx, url, headers)

    part = dest.with_name(dest.name + ".part")
    last_err = ""
    ok = False
    for attempt in range(1, retries + 1):
        try:
            pos = part.stat().st_size if part.exists() else 0
            hdr = dict(headers or {})
            if pos:
                hdr["Range"] = f"bytes={pos}-"
            with ctx.session.get(eff_url, stream=True, headers=hdr, auth=auth,
                                 timeout=timeout, allow_redirects=True) as r:
                if r.status_code == 404:
                    extra = " (expected: tile without data)" if allow_missing else ""
                    return ctx.rec(url, dest, "not_found", started, notes=f"HTTP 404{extra}")
                if r.status_code in (401, 403):
                    return ctx.rec(url, dest, "auth_required", started, notes=f"HTTP {r.status_code}")
                if r.status_code != 416:                       # 416 = .part already complete
                    r.raise_for_status()
                    if pos and r.status_code != 206:
                        pos = 0                                # server ignored Range
                    with open(part, "ab" if pos else "wb") as fh:
                        for chunk in r.iter_content(1 << 20):
                            if chunk:
                                fh.write(chunk)
            ok = True
            break
        except (requests.RequestException, OSError) as exc:
            last_err = str(exc)
            time.sleep(min(2 ** attempt, 30))
    if not ok:
        return ctx.rec(url, dest, "failed", started,
                       notes=f"after {retries} attempts: {last_err} (partial file kept for resume)")

    md5_hex, sha_hex = digests(part)
    if md5 and md5.lower() != md5_hex:
        bad = dest.with_name(dest.name + ".badchecksum")
        part.replace(bad)
        return ctx.rec(url, bad, "failed", started, bad.stat().st_size,
                       notes=f"md5 mismatch: expected {md5}, got {md5_hex}")
    if md5:
        note = (note + " md5 verified").strip()
    part.replace(dest)

    if unzip and dest.suffix == ".zip":
        try:
            safe_extract_zip(dest, dest.with_suffix(""))
            note = (note + " extracted").strip()
            if not keep_archive:
                dest.unlink()
                dest = dest.with_suffix("")
        except (zipfile.BadZipFile, RuntimeError) as exc:
            return ctx.rec(url, dest, "failed", started, dest.stat().st_size, notes=f"unzip failed: {exc}")
    if gunzip and dest.suffix == ".gz":
        try:
            raw = dest.with_suffix("")
            with gzip.open(dest, "rb") as src, open(raw, "wb") as out:
                shutil.copyfileobj(src, out)
            if not keep_archive:
                dest.unlink()
            dest = raw
            note = (note + " decompressed").strip()
        except OSError as exc:
            return ctx.rec(url, dest, "failed", started, notes=f"gunzip failed: {exc}")

    size = dest.stat().st_size if dest.is_file() else sum(
        f.stat().st_size for f in dest.rglob("*") if f.is_file())
    return ctx.rec(url, dest, "downloaded", started, size, f"sha256:{sha_hex}", note)


# --------------------------------------------------------------------------- #
# GDAL helpers (remote windowing: "clip early" without downloading everything)
# --------------------------------------------------------------------------- #
def gdal_available(warp: bool = False) -> bool:
    return shutil.which("gdalwarp" if warp else "gdal_translate") is not None


def gdal_clip(src_url: str, dest: Path, aoi: AOI, *, warp: bool = False,
              pixel_deg: float | None = None, resample: str = "near") -> tuple[bool, str]:
    """Window a remote raster over HTTPS with GDAL. Returns (ok, note)."""
    exe = shutil.which("gdalwarp" if warp else "gdal_translate")
    if not exe:
        return False, "GDAL command-line tools not found"
    w, s, e, n = aoi.bbox
    src = f"/vsicurl/{src_url}" if src_url.startswith("http") else src_url
    tmp = dest.with_name(dest.stem + ".part.tif")
    co = ["-co", "COMPRESS=DEFLATE", "-co", "TILED=YES", "-co", "BIGTIFF=IF_SAFER"]
    if warp:
        cmd = [exe, "-overwrite", "-te", str(w), str(s), str(e), str(n), "-te_srs", "EPSG:4326",
               "-t_srs", "EPSG:4326", "-r", resample, *co]
        if pixel_deg:
            cmd += ["-tr", str(pixel_deg), str(pixel_deg)]
        cmd += [src, str(tmp)]
    else:
        cmd = [exe, "-projwin", str(w), str(n), str(e), str(s), *co, src, str(tmp)]
    env = os.environ.copy()
    env.update({"GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
                "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".tif,.tiff,.vrt",
                "GDAL_HTTP_MAX_RETRY": "5", "GDAL_HTTP_RETRY_DELAY": "5",
                "GDAL_HTTP_USERAGENT": USER_AGENT})
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=3600)
    except (subprocess.SubprocessError, OSError) as exc:
        return False, f"GDAL error: {exc}"
    if res.returncode != 0 or not tmp.exists():
        tmp.unlink(missing_ok=True)
        return False, f"GDAL failed: {(res.stderr or res.stdout).strip()[-300:]}"
    tmp.replace(dest)
    return True, "clipped to AOI with GDAL"


def iter_chunks(seq: list, size: int) -> Iterable[list]:
    for i in range(0, len(seq), size):
        yield seq[i:i + size]
