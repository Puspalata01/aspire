from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import Response
from typing import List, Optional, Tuple
from datetime import datetime
from pydantic import BaseModel, Field
import numpy as np
import io
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from pyproj import Transformer, CRS
from shapely.geometry import box, mapping, shape, Point
from shapely.ops import transform as shapely_transform

from api.schemas.requests import (
    BoundingBox,
    GridSpec,
    GeoJSONFeature,
    GeoJSONFeatureCollection,
    HazardType,
)
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/gis", tags=["GIS & GeoJSON Services"])


class CRSTransformRequest(BaseModel):
    source_crs: str = Field("EPSG:4326", description="Source coordinate reference system")
    target_crs: str = Field("EPSG:32645", description="Target coordinate reference system")
    coordinates: List[List[float]] = Field(..., description="List of [lon, lat] or [x, y] pairs")


class CRSTransformResponse(BaseModel):
    source_crs: str
    target_crs: str
    original: List[List[float]]
    transformed: List[List[float]]


class SpatialQueryRequest(BaseModel):
    bbox: BoundingBox
    hazard_type: Optional[HazardType] = None
    min_risk_score: float = Field(0.0, ge=0.0, le=1.0)
    max_results: int = Field(100, ge=1, le=10000)


class TileRequest(BaseModel):
    bbox: BoundingBox
    grid: GridSpec
    layer: str = "flood_risk"
    colormap: str = "RdYlGn_r"
    tile_size: int = Field(256, ge=64, le=1024)


class WMSCapabilities(BaseModel):
    service: str = "WMS"
    version: str = "1.3.0"
    layers: List[dict]
    supported_crs: List[str]
    supported_formats: List[str]
    bbox: dict


class WFSCapabilities(BaseModel):
    service: str = "WFS"
    version: str = "2.0.0"
    feature_types: List[dict]
    supported_crs: List[str]
    supported_formats: List[str]


_SUPPORTED_CRS = [
    "EPSG:4326",
    "EPSG:32645",
    "EPSG:32646",
    "EPSG:3857",
]

_AVAILABLE_LAYERS = [
    {"name": "flood_risk", "title": "Flood Risk Map", "abstract": "Composite flood risk scores"},
    {"name": "flood_mask", "title": "Flood Inundation Mask", "abstract": "Binary flood detection mask"},
    {"name": "population_exposure", "title": "Population Exposure", "abstract": "Population density in hazard zones"},
    {"name": "vulnerability", "title": "Vulnerability Index", "abstract": "Social vulnerability composite score"},
    {"name": "shelter_locations", "title": "Shelter Locations", "abstract": "Emergency shelter point locations"},
]


@router.post("/transform-crs", response_model=CRSTransformResponse)
async def transform_coordinates(request: CRSTransformRequest):
    """Transform coordinates between coordinate reference systems"""
    try:
        transformer = Transformer.from_crs(
            CRS(request.source_crs),
            CRS(request.target_crs),
            always_xy=True,
        )

        transformed = []
        for coord in request.coordinates:
            x, y = transformer.transform(coord[0], coord[1])
            transformed.append([round(x, 6), round(y, 6)])

        return CRSTransformResponse(
            source_crs=request.source_crs,
            target_crs=request.target_crs,
            original=request.coordinates,
            transformed=transformed,
        )
    except Exception as e:
        logger.error(f"CRS transform error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/spatial-query", response_model=GeoJSONFeatureCollection)
async def spatial_query(request: SpatialQueryRequest):
    """
    Spatial query: return synthetic features within the given bounding box
    filtered by hazard type and minimum risk score
    """
    try:
        query_box = box(
            request.bbox.min_lon,
            request.bbox.min_lat,
            request.bbox.max_lon,
            request.bbox.max_lat,
        )

        np.random.seed(42)
        n_points = min(request.max_results, 200)
        features: List[GeoJSONFeature] = []

        for i in range(n_points):
            lon = np.random.uniform(request.bbox.min_lon, request.bbox.max_lon)
            lat = np.random.uniform(request.bbox.min_lat, request.bbox.max_lat)
            risk = round(np.random.uniform(0.0, 1.0), 3)

            if risk < request.min_risk_score:
                continue

            hazard = request.hazard_type.value if request.hazard_type else np.random.choice(
                ["flood", "cyclone", "heatwave"]
            )

            features.append(
                GeoJSONFeature(
                    type="Feature",
                    geometry={"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
                    properties={
                        "id": i + 1,
                        "hazard_type": hazard,
                        "risk_score": risk,
                        "population_exposed": int(np.random.uniform(100, 50000)),
                    },
                )
            )

            if len(features) >= request.max_results:
                break

        return GeoJSONFeatureCollection(type="FeatureCollection", features=features)
    except Exception as e:
        logger.error(f"Spatial query error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-tile")
async def generate_tile(request: TileRequest):
    """
    Generate a raster tile (PNG) for the given bounding box and layer
    """
    try:
        size = request.tile_size
        grid = np.random.rand(size, size).astype(np.float32)

        import matplotlib.pyplot as plt
        cmap = plt.colormaps[request.colormap]
        rgba = (cmap(grid) * 255).astype(np.uint8)

        from PIL import Image
        img = Image.fromarray(rgba, mode="RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return Response(
            content=buf.getvalue(),
            media_type="image/png",
            headers={
                "X-Tile-Layer": request.layer,
                "X-Tile-Size": str(size),
                "X-Tile-BBox": f"{request.bbox.min_lon},{request.bbox.min_lat},{request.bbox.max_lon},{request.bbox.max_lat}",
            },
        )
    except Exception as e:
        logger.error(f"Tile generation error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/wms/capabilities", response_model=WMSCapabilities)
async def wms_get_capabilities():
    """
    WMS GetCapabilities: returns available layers, CRS, and formats
    """
    return WMSCapabilities(
        service="WMS",
        version="1.3.0",
        layers=_AVAILABLE_LAYERS,
        supported_crs=_SUPPORTED_CRS,
        supported_formats=["image/png", "image/jpeg", "image/tiff"],
        bbox={
            "min_lat": 17.78,
            "max_lat": 22.57,
            "min_lon": 81.37,
            "max_lon": 87.53,
            "crs": "EPSG:4326",
        },
    )


@router.get("/wms/map")
async def wms_get_map(
    layers: str = Query("flood_risk", description="Comma-separated layer names"),
    crs: str = Query("EPSG:4326"),
    bbox: str = Query("81.37,17.78,87.53,22.57", description="minlon,minlat,maxlon,maxlat"),
    width: int = Query(256, ge=64, le=2048),
    height: int = Query(256, ge=64, le=2048),
    format: str = Query("image/png"),
):
    """
    WMS GetMap: return a raster image for the requested layers and bbox
    """
    try:
        parts = [float(x) for x in bbox.split(",")]
        if len(parts) != 4:
            raise ValueError("bbox must have 4 comma-separated values")

        grid = np.random.rand(height, width).astype(np.float32)

        import matplotlib.pyplot as plt
        cmap = plt.colormaps["RdYlGn_r"]
        rgba = (cmap(grid) * 255).astype(np.uint8)

        from PIL import Image
        img = Image.fromarray(rgba, mode="RGBA")
        buf = io.BytesIO()

        if "jpeg" in format or "jpg" in format:
            img = img.convert("RGB")
            img.save(buf, format="JPEG")
            media = "image/jpeg"
        else:
            img.save(buf, format="PNG")
            media = "image/png"

        buf.seek(0)
        return Response(content=buf.getvalue(), media_type=media)
    except Exception as e:
        logger.error(f"WMS GetMap error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/wfs/capabilities", response_model=WFSCapabilities)
async def wfs_get_capabilities():
    """
    WFS GetCapabilities: returns available feature types, CRS, and formats
    """
    return WFSCapabilities(
        service="WFS",
        version="2.0.0",
        feature_types=[
            {"name": "shelter_locations", "title": "Shelter Locations", "geometry": "Point"},
            {"name": "evacuation_routes", "title": "Evacuation Routes", "geometry": "LineString"},
            {"name": "risk_zones", "title": "Risk Zones", "geometry": "Polygon"},
        ],
        supported_crs=_SUPPORTED_CRS,
        supported_formats=["application/json", "application/geo+json", "text/xml"],
    )


@router.get("/wfs/features", response_model=GeoJSONFeatureCollection)
async def wfs_get_features(
    type_name: str = Query("shelter_locations"),
    crs: str = Query("EPSG:4326"),
    bbox: str = Query("81.37,17.78,87.53,22.57"),
    max_features: int = Query(50, ge=1, le=1000),
):
    """
    WFS GetFeature: return vector features as GeoJSON for the requested feature type
    """
    try:
        parts = [float(x) for x in bbox.split(",")]
        min_lon, min_lat, max_lon, max_lat = parts

        np.random.seed(hash(type_name) % 2**31)
        features: List[GeoJSONFeature] = []

        if type_name == "shelter_locations":
            for i in range(min(max_features, 30)):
                lon = round(np.random.uniform(min_lon, max_lon), 6)
                lat = round(np.random.uniform(min_lat, max_lat), 6)
                features.append(GeoJSONFeature(
                    geometry={"type": "Point", "coordinates": [lon, lat]},
                    properties={
                        "id": f"shelter_{i+1}",
                        "name": f"Shelter {i+1}",
                        "capacity": int(np.random.uniform(500, 5000)),
                        "type": np.random.choice(["school", "community_center", "stadium"]),
                    },
                ))
        elif type_name == "risk_zones":
            cell_w = (max_lon - min_lon) / 5
            cell_h = (max_lat - min_lat) / 5
            fid = 1
            for r in range(5):
                for c in range(5):
                    risk = round(np.random.uniform(0, 1), 3)
                    cmin_lon = round(min_lon + c * cell_w, 6)
                    cmin_lat = round(min_lat + r * cell_h, 6)
                    cmax_lon = round(cmin_lon + cell_w, 6)
                    cmax_lat = round(cmin_lat + cell_h, 6)
                    features.append(GeoJSONFeature(
                        geometry={
                            "type": "Polygon",
                            "coordinates": [[
                                [cmin_lon, cmin_lat],
                                [cmax_lon, cmin_lat],
                                [cmax_lon, cmax_lat],
                                [cmin_lon, cmax_lat],
                                [cmin_lon, cmin_lat],
                            ]]
                        },
                        properties={"id": fid, "risk_score": risk, "risk_level": "high" if risk > 0.7 else "medium" if risk > 0.4 else "low"},
                    ))
                    fid += 1
                    if fid > max_features:
                        break
                if fid > max_features:
                    break
        else:
            for i in range(min(max_features, 15)):
                start_lon = round(np.random.uniform(min_lon, max_lon), 6)
                start_lat = round(np.random.uniform(min_lat, max_lat), 6)
                end_lon = round(start_lon + np.random.uniform(-0.1, 0.1), 6)
                end_lat = round(start_lat + np.random.uniform(-0.1, 0.1), 6)
                features.append(GeoJSONFeature(
                    geometry={"type": "LineString", "coordinates": [[start_lon, start_lat], [end_lon, end_lat]]},
                    properties={"id": f"route_{i+1}", "distance_km": round(np.random.uniform(1, 20), 1)},
                ))

        return GeoJSONFeatureCollection(type="FeatureCollection", features=features)
    except Exception as e:
        logger.error(f"WFS GetFeature error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
