from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.schemas.requests import QueryRequest, QueryResponse
from llm.nl_query_interface import NaturalLanguageQueryInterface
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/llm", tags=["LLM Query Interface"])

interface = NaturalLanguageQueryInterface()


@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process natural language queries about disaster scenarios
    """
    try:
        result = interface.query(
            user_query=request.query,
            session_id=request.session_id,
            context=request.context,
        )
        
        return QueryResponse(
            response=result["response"],
            intent=result["intent"],
            intent_confidence=result["intent_confidence"],
            entities_extracted=result["entities_extracted"],
            tools_used=result["tools_used"],
            session_id=request.session_id,
        )
    
    except Exception as e:
        logger.error(f"Query processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query processing failed: {str(e)}"
        )


@router.get("/session/{session_id}/summary")
async def get_session_summary(session_id: str):
    """
    Retrieve summary of a conversation session
    """
    try:
        summary = interface.get_session_summary(session_id)
        return summary
    
    except Exception as e:
        logger.error(f"Session summary error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}"
        )


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """
    Clear a conversation session
    """
    try:
        interface.clear_session(session_id)
        return {"status": "success", "message": f"Session {session_id} cleared"}
    
    except Exception as e:
        logger.error(f"Session clear error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear session: {str(e)}"
        )
