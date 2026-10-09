from .flood import router as flood_router
from .decision import router as decision_router
from .multi_hazard import router as multi_hazard_router
from .llm import router as llm_router
from .gis import router as gis_router
from .gis_services import router as gis_services_router
from .monitoring import router as monitoring_router
from .monitoring_stream import router as monitoring_stream_router

__all__ = [
    "flood_router",
    "decision_router",
    "multi_hazard_router",
    "llm_router",
    "gis_router",
    "gis_services_router",
    "monitoring_router",
    "monitoring_stream_router",
]
