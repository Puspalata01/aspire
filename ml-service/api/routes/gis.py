from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import numpy as np
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.schemas.requests import (
    FloodDetectionRequest,
    GeoJSONFeatureCollection,
    GeoJSONFeature,
)
from models.flood.flood_segmentation_model import UNet as FloodSegmentationModel
import torch
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/gis", tags=["GIS & GeoJSON Services"])


@router.post("/export-geojson", response_model=GeoJSONFeatureCollection)
async def export_flood_geojson(request: FloodDetectionRequest):
    """
    Export flood mask predictions as GeoJSON polygon features
    """
    try:
        model = FloodSegmentationModel(
            in_channels=len(request.channel_order),
            out_channels=2,
            features=[64, 128, 256, 512],
        )
        model.eval()
        
        input_data = np.zeros((1, len(request.channel_order), request.grid.rows, request.grid.cols), dtype=np.float32)
        input_tensor = torch.from_numpy(input_data).float()
        
        with torch.no_grad():
            output = model(input_tensor)
        
        flood_mask = (output[0].argmax(dim=0).numpy()).astype(int)
        
        lat_step = (request.bbox.max_lat - request.bbox.min_lat) / request.grid.rows
        lon_step = (request.bbox.max_lon - request.bbox.min_lon) / request.grid.cols
        
        features = []
        feature_id = 1
        
        for r in range(request.grid.rows):
            for c in range(request.grid.cols):
                if flood_mask[r, c] == 1:
                    min_lat = request.bbox.min_lat + r * lat_step
                    max_lat = min_lat + lat_step
                    min_lon = request.bbox.min_lon + c * lon_step
                    max_lon = min_lon + lon_step
                    
                    polygon = [
                        [
                            [round(min_lon, 6), round(min_lat, 6)],
                            [round(max_lon, 6), round(min_lat, 6)],
                            [round(max_lon, 6), round(max_lat, 6)],
                            [round(min_lon, 6), round(max_lat, 6)],
                            [round(min_lon, 6), round(min_lat, 6)],
                        ]
                    ]
                    
                    features.append(GeoJSONFeature(
                        type="Feature",
                        geometry={"type": "Polygon", "coordinates": polygon},
                        properties={
                            "id": feature_id,
                            "hazard_type": "flood",
                            "grid_row": r,
                            "grid_col": c,
                            "inundated": True,
                        }
                    ))
                    feature_id += 1
        
        return GeoJSONFeatureCollection(
            type="FeatureCollection",
            features=features
        )
    
    except Exception as e:
        logger.error(f"GeoJSON export error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"GeoJSON export failed: {str(e)}"
        )
