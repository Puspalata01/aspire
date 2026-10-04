from fastapi import APIRouter, HTTPException, status
from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.routes.monitoring import _active_alerts, _alert_history
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/monitoring/stream", tags=["Real-time Monitoring & Alerting"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.alert_subscribers: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        for alert_type, subscribers in self.alert_subscribers.items():
            if websocket in subscribers:
                subscribers.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)
    
    def subscribe_to_alerts(self, websocket: WebSocket, alert_type: str):
        if alert_type not in self.alert_subscribers:
            self.alert_subscribers[alert_type] = set()
        self.alert_subscribers[alert_type].add(websocket)

manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time alert streaming
    """
    await manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            
            if action == "subscribe":
                alert_type = data.get("alert_type", "*")
                manager.subscribe_to_alerts(websocket, alert_type)
                await websocket.send_json({
                    "type": "subscribed",
                    "alert_type": alert_type,
                    "message": f"Subscribed to {alert_type} alerts"
                })
            
            elif action == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
            
            elif action == "get_active":
                await websocket.send_json({
                    "type": "active_alerts",
                    "alerts": [a.dict() for a in _active_alerts]
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@router.get("/connections")
async def get_connection_info():
    """Get current WebSocket connection info"""
    return {
        "total_connections": len(manager.active_connections),
        "subscriptions": {
            alert_type: len(subscribers)
            for alert_type, subscribers in manager.alert_subscribers.items()
        }
    }


@router.post("/broadcast-test")
async def broadcast_test(message: str = "Test alert broadcast"):
    """
    Broadcast a test message to all connected WebSocket clients
    """
    test_message = {
        "type": "broadcast_test",
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast(test_message)
    
    return {
        "status": "broadcasted",
        "message": message,
        "recipients": len(manager.active_connections)
    }
