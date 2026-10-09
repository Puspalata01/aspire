"""
Test API Endpoints using FastAPI TestClient
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

print("=" * 70)
print("TESTING FASTAPI ENDPOINTS VIA TESTCLIENT")
print("=" * 70)

# 1. Health check
print("\n[1] GET /health")
res = client.get("/health")
print(f"Status: {res.status_code}")
print(f"Response: {res.json()}")
assert res.status_code == 200

# 2. Flood Detection
print("\n[2] POST /flood/detect")
payload = {
    "grid": {"rows": 32, "cols": 32},
    "bbox": {"min_lat": 20.0, "max_lat": 21.0, "min_lon": 85.0, "max_lon": 86.0},
    "pixel_size_m": 90.0,
    "channel_order": ["dem", "rainfall"],
    "return_probability": True
}
res = client.post("/flood/detect", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Flood Area: {data.get('flood_area_km2')} km2, Inference time: {data.get('inference_time_ms'):.1f}ms")
assert res.status_code == 200

# 3. Risk Assessment
print("\n[3] POST /flood/assess-risk")
payload = {
    "grid": {"rows": 16, "cols": 16},
    "bbox": {"min_lat": 20.0, "max_lat": 21.0, "min_lon": 85.0, "max_lon": 86.0},
    "population_density": [[100.0]*16]*16,
}
res = client.post("/flood/assess-risk", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Risk Level: {data.get('risk_level')}, High risk pixels: {data.get('summary', {}).get('high_risk_pixels')}")
assert res.status_code == 200

# 4. Impact Prediction
print("\n[4] POST /flood/predict-impact")
payload = {
    "grid": {"rows": 16, "cols": 16},
    "bbox": {"min_lat": 20.0, "max_lat": 21.0, "min_lon": 85.0, "max_lon": 86.0},
    "flood_depth": [[0.5]*16]*16,
    "hazard_mask": [[1]*16]*16,
    "risk_score": [[0.8]*16]*16,
    "risk_classified": [[3]*16]*16,
    "population_density": [[500.0]*16]*16,
    "include_economic": True
}
res = client.post("/flood/predict-impact", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Total Affected Pop: {data.get('population', {}).get('total_affected')}")
print(f"Economic Loss: {data.get('economic', {}).get('total_economic_loss')} INR")
assert res.status_code == 200

# 5. Decision Support
print("\n[5] POST /decision/optimize")
payload = {
    "road_segments": [
        {"id": "r1", "source": "z1", "target": "s1", "distance_km": 5.0, "capacity_vph": 1000, "flood_depth_m": 0.0}
    ],
    "shelters": [
        {"id": "s1", "name": "Shelter A", "capacity": 5000, "current_occupancy": 500, "lat": 20.1, "lon": 85.1}
    ],
    "population_zones": [
        {"id": "z1", "population": 2000, "vulnerability_score": 0.8, "lat": 20.0, "lon": 85.0}
    ],
    "displaced_population": 1500.0,
}
res = client.post("/decision/optimize", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Evacuees: {data.get('evacuation', {}).get('total_evacuees')}")
assert res.status_code == 200

# 6. Heatwave Analysis
print("\n[6] POST /multi-hazard/heatwave/analyze")
payload = {
    "grid": {"rows": 8, "cols": 8},
    "bbox": {"min_lat": 20.0, "max_lat": 21.0, "min_lon": 85.0, "max_lon": 86.0},
    "temperature": [[[42.0]*8]*8]*5,
    "population_density": [[300.0]*8]*8
}
res = client.post("/multi-hazard/heatwave/analyze", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Detected Events: {len(data.get('events', []))}")
assert res.status_code == 200

# 7. Cascade Analysis
print("\n[7] POST /multi-hazard/cascade/analyze")
payload = {
    "initial_hazards": {"cyclone": 0.9, "flood": 0.4},
    "time_horizon_hours": 48.0
}
res = client.post("/multi-hazard/cascade/analyze", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Max Compound Risk: {data.get('max_compound_risk')}")
assert res.status_code == 200

# 8. LLM Query Interface
print("\n[8] POST /llm/query")
payload = {
    "query": "What is the flood risk in Puri district?",
    "session_id": "api_test_session"
}
res = client.post("/llm/query", json=payload)
print(f"Status: {res.status_code}")
data = res.json()
print(f"Intent: {data.get('intent')}")
print(f"Response: {data.get('response')[:80]}...")
assert res.status_code == 200

print("\n" + "=" * 70)
print("ALL 8 FASTAPI ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY ✅")
print("=" * 70)
