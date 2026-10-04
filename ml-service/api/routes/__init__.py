from .flood import router as flood_router
from .decision import router as decision_router
from .multi_hazard import router as multi_hazard_router
from .llm import router as llm_router

__all__ = [
    "flood_router",
    "decision_router",
    "multi_hazard_router",
    "llm_router",
]
