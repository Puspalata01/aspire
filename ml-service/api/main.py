from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import time
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from api.middleware.middleware import (
    RequestTimingMiddleware,
    RequestLoggingMiddleware,
    ErrorHandlingMiddleware,
    RateLimitMiddleware,
)
from api.routes import flood, decision, multi_hazard, llm, gis, gis_services, monitoring, monitoring_stream
from api.schemas.requests import HealthResponse
from utils.logger import get_logger
from utils.config_loader import Config

logger = get_logger(__name__)
config_obj = Config()
config = config_obj._config

start_time = time.time()
models_loaded = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ML Service API...")
    logger.info(f"Environment: {config['app']['environment']}")
    logger.info(f"Version: {config['app']['version']}")
    
    models_loaded.extend([
        "flood_segmentation_v1.0",
        "risk_engine_v1.0",
        "impact_engine_v1.0",
        "decision_support_v1.0",
        "heatwave_v1.0",
        "cascade_v1.0",
    ])
    
    logger.info(f"Loaded {len(models_loaded)} model versions")
    
    yield
    
    logger.info("Shutting down ML Service API...")


app = FastAPI(
    title=config["app"]["name"],
    version=config["app"]["version"],
    description="Multi-Hazard Disaster Risk ML Service API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, requests_per_minute=100, burst=20)
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RequestTimingMiddleware)

app.include_router(flood.router)
app.include_router(decision.router)
app.include_router(multi_hazard.router)
app.include_router(llm.router)
app.include_router(gis.router)
app.include_router(gis_services.router)
app.include_router(monitoring.router)
app.include_router(monitoring_stream.router)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": config["app"]["name"],
        "version": config["app"]["version"],
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    uptime = time.time() - start_time
    
    return HealthResponse(
        status="healthy",
        service=config["app"]["name"],
        version=config["app"]["version"],
        uptime_seconds=uptime,
        models_loaded=models_loaded,
        timestamp=datetime.utcnow(),
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "not_found",
            "message": f"Path {request.url.path} not found",
            "available_endpoints": ["/health", "/docs", "/flood", "/decision", "/multi-hazard", "/llm"],
        },
    )


if __name__ == "__main__":
    import uvicorn
    
    port = 8000
    host = "0.0.0.0"
    
    logger.info(f"Starting server on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=config["app"]["debug"],
        log_level="info",
    )
