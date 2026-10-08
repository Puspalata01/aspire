# ASPIRE — API Specification & Integration Contract Document

> **AI-Powered Disaster Intelligence & Response Platform**
> **Tagline:** *From Warning to Action.*

**Version:** 1.0  
**Last Updated:** October 2026  
**Document Type:** REST API & Real-Time WebSocket Interface Specification  
**Protocols:** HTTP/2 (REST JSON), WebSocket (WSS, Socket.IO / ASGI WebSocket)  
**Security Standard:** Bearer JWT (RFC 7519), Role-Based Access Control (RBAC), API Key Authentication  

---

## Table of Contents

1. [API Architecture & Design Standards](#1-api-architecture--design-standards)
2. [Authentication & Authorization API](#2-authentication--authorization-api)
3. [Disaster & Event Management API](#3-disaster--event-management-api)
4. [Hazards & Multi-Hazard Analysis API](#4-hazards--multi-hazard-analysis-api)
5. [AI Predictive & Risk Assessment API](#5-ai-predictive--risk-assessment-api)
6. [Cascading Hazard & What-If Simulation API](#6-cascading-hazard--what-if-simulation-api)
7. [GIS, Mapping & Road Network API](#7-gis-mapping--road-network-api)
8. [Shelters, Hospitals & Infrastructure API](#8-shelters-hospitals--infrastructure-api)
9. [Resource Allocation & Fleet Deployment API](#9-resource-allocation--fleet-deployment-api)
10. [Evacuation Routing & Corridor Optimization API](#10-evacuation-routing--corridor-optimization-api)
11. [Citizen SOS & Crowdsource Intelligence API](#11-citizen-sos--crowdsource-intelligence-api)
12. [Public Alerts & Broadcast Communication API](#12-public-alerts--broadcast-communication-api)
13. [LLM Emergency Intelligence & Copilot API](#13-llm-emergency-intelligence--copilot-api)
14. [Real-Time WebSocket Protocol Specification](#14-real-time-websocket-protocol-specification)
15. [Error Codes & Standard Envelope Format](#15-error-codes--standard-envelope-format)

---

## 1. API Architecture & Design Standards

### 1.1 Base URLs & Gateway Topology

| Target Service | Base URL (Development) | Base URL (Production) | Description |
|---|---|---|---|
| **Next.js Core API (Route Handlers)** | `http://localhost:3000/api/v1` | `https://aspire.gov.in/api/v1` | Business logic, PostGIS spatial queries, DB transactions, auth |
| **FastAPI ML Service** | `http://localhost:8001/api/v1` | `https://ml.aspire.gov.in/v1` | Deep learning inference, XGBoost models, LLM copilot |
| **WebSocket Hub** | `ws://localhost:3000/ws` | `wss://aspire.gov.in/ws` | Real-time push for SOS, alerts, and live risk layers |

### 1.2 Common HTTP Request Headers

```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
Accept: application/json
X-Request-ID: c9bf9e57-1685-4c89-bafb-ff5af830be8a
X-Client-Role: authority_commander
X-Client-Version: 1.0.0
```

### 1.3 Uniform Envelope Format

#### Success Envelope (Single Entity)
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-07T12:00:00.000Z",
    "request_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
    "processing_time_ms": 34.2
  }
}
```

#### Success Envelope (Paginated List)
```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_records": 184,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2026-10-07T12:00:00.000Z",
    "request_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a"
  }
}
```

#### Error Envelope
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_INSUFFICIENT_CAPACITY",
    "message": "Shelter Puri-Town-Hall currently has zero remaining capacity (500/500 occupied).",
    "details": [
      {
        "field": "shelter_id",
        "issue": "Cannot assign 45 evacuees to filled shelter"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-07T12:00:00.000Z",
    "request_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a"
  }
}
```

---

## 2. Authentication & Authorization API

### 2.1 Register User
- **Method:** `POST`
- **Route:** `/auth/register`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "dr.patnaik@odisha.gov.in",
  "password": "SecurePassword#2026",
  "full_name": "Dr. Rajesh Patnaik",
  "phone": "+919876543210",
  "role": "authority_commander",
  "agency": "ODRAF",
  "jurisdiction_region_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```
- **Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "dr.patnaik@odisha.gov.in",
    "role": "authority_commander",
    "status": "pending_verification",
    "created_at": "2026-10-07T12:00:00Z"
  }
}
```

### 2.2 Login & Token Exchange
- **Method:** `POST`
- **Route:** `/auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "commander@odraf.gov.in",
  "password": "SecurePassword#2026"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "refresh_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "Rajesh Patnaik",
      "email": "commander@odraf.gov.in",
      "role": "authority_commander",
      "agency": "ODRAF",
      "permissions": [
        "disaster:write",
        "alert:broadcast",
        "resource:dispatch",
        "simulation:run"
      ]
    }
  }
}
```

### 2.3 Refresh Token
- **Method:** `POST`
- **Route:** `/auth/refresh`
- **Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1Ni..."
}
```

---

## 3. Disaster & Event Management API

### 3.1 List Active & Historical Disasters
- **Method:** `GET`
- **Route:** `/disasters`
- **Query Parameters:**
  - `status`: `active` | `monitoring` | `resolved` (default: `active`)
  - `hazard_type`: `cyclone` | `flood` | `earthquake` | `heatwave` | `landslide`
  - `severity`: `critical` | `high` | `medium` | `low`
  - `region_id`: UUID
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20)
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "disaster-uuid-1",
      "title": "Severe Cyclone Remal & Coastal Surge",
      "status": "active",
      "severity": "critical",
      "hazard_types": ["cyclone", "flood", "landslide"],
      "primary_region": "Odisha Coastal Belt (Puri, Khordha, Ganjam)",
      "impact_summary": {
        "population_at_risk": 320000,
        "active_shelters": 48,
        "critical_sos_count": 87,
        "flooded_road_km": 114.5
      },
      "started_at": "2026-10-06T04:30:00Z",
      "centroid": { "lat": 19.8135, "lng": 85.8312 }
    }
  ]
}
```

### 3.2 Create or Declare Disaster Event
- **Method:** `POST`
- **Route:** `/disasters`
- **Required Role:** `admin`, `authority_commander`
- **Request Body:**
```json
{
  "title": "Flash Flood Inundation - Mahanadi Basin",
  "hazard_type": "flood",
  "severity": "high",
  "region_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "boundary_geojson": {
    "type": "Polygon",
    "coordinates": [[[85.75, 20.40], [85.95, 20.40], [85.95, 20.60], [85.75, 20.60], [85.75, 20.40]]]
  },
  "metadata": {
    "water_level_gauge_m": 8.4,
    "danger_mark_m": 7.5,
    "rainfall_24h_mm": 210.4
  }
}
```

---

## 4. Hazards & Multi-Hazard Analysis API

### 4.1 Get Active Hazard Overlays (GeoJSON)
- **Method:** `GET`
- **Route:** `/hazards/spatial-layers`
- **Query Parameters:**
  - `hazard_type`: comma-separated string (`flood,cyclone,heatwave`)
  - `min_severity`: `low` | `medium` | `high` | `critical`
  - `bbox`: `minLng,minLat,maxLng,maxLat` (Bounding box filter)
- **Response (200 OK - FeatureCollection):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "haz-flood-01",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[85.80, 20.45], [85.88, 20.45], [85.88, 20.52], [85.80, 20.52], [85.80, 20.45]]]
      },
      "properties": {
        "hazard_type": "flood",
        "severity": "critical",
        "water_depth_cm": 140,
        "flow_velocity_ms": 2.1,
        "peak_time_utc": "2026-10-07T18:00:00Z",
        "affected_structures": 1420
      }
    }
  ]
}
```

---

## 5. AI Predictive & Risk Assessment API

### 5.1 Real-Time Geospatial Risk Assessment
- **Method:** `POST`
- **Route:** `/risk/assess`
- **Request Body:**
```json
{
  "latitude": 20.4625,
  "longitude": 85.8830,
  "radius_km": 15.0,
  "hazard_types": ["flood", "cyclone", "landslide"],
  "include_explanation": true
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "risk_score": 0.894,
    "risk_category": "CRITICAL",
    "confidence": 0.94,
    "component_scores": {
      "flood_inundation_risk": 0.92,
      "structural_vulnerability": 0.85,
      "population_exposure": 0.91,
      "evacuation_impedance": 0.88
    },
    "feature_attributions": [
      { "feature": "rainfall_rate_last_6h", "weight": 0.35, "raw_value": "115 mm" },
      { "feature": "river_discharge_cusecs", "weight": 0.28, "raw_value": "950,000" },
      { "feature": "elevation_asl_meters", "weight": 0.22, "raw_value": "4.2 m" },
      { "feature": "coastal_surge_tide_height", "weight": 0.15, "raw_value": "2.8 m" }
    ],
    "predicted_trajectory": [
      { "hours_ahead": 3, "projected_score": 0.91 },
      { "hours_ahead": 6, "projected_score": 0.96 },
      { "hours_ahead": 12, "projected_score": 0.82 }
    ],
    "actionable_protocols": [
      "Order mandatory evacuation of Ward 12 & 14 within 90 minutes",
      "Deploy 4 NDRF B-type motorized inflatable rafts to Sector West",
      "Close National Highway NH-16 culvert bridge due to overflow threshold breach"
    ]
  }
}
```

---

## 6. Cascading Hazard & What-If Simulation API

### 6.1 Predict Cascading Failure Chain
- **Method:** `POST`
- **Route:** `/cascade/simulate`
- **Request Body:**
```json
{
  "primary_event": {
    "hazard_type": "cyclone",
    "wind_speed_kmh": 165,
    "landfall_lat": 19.82,
    "landfall_lng": 85.85,
    "duration_hours": 18
  },
  "max_cascade_depth": 3
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "cascade_graph": {
      "nodes": [
        { "id": "n1", "label": "Cyclone Landfall Category 4", "probability": 1.0, "time_offset_hrs": 0 },
        { "id": "n2", "label": "Storm Surge (3.5m Inundation)", "probability": 0.92, "time_offset_hrs": 2 },
        { "id": "n3", "label": "Grid Blackout (Substation S-4 Submerged)", "probability": 0.86, "time_offset_hrs": 4 },
        { "id": "n4", "label": "Hospital Backup Generator Fuel Cutoff", "probability": 0.74, "time_offset_hrs": 8 },
        { "id": "n5", "label": "Water Purification Plant Stoppage", "probability": 0.79, "time_offset_hrs": 12 },
        { "id": "n6", "label": "Waterborne Epidemic Outbreak (Cholera/Lepto)", "probability": 0.61, "time_offset_hrs": 72 }
      ],
      "edges": [
        { "from": "n1", "to": "n2", "causality": "tidal_forcing" },
        { "from": "n2", "to": "n3", "causality": "electrical_submersion" },
        { "from": "n3", "to": "n4", "causality": "fuel_pump_loss" },
        { "from": "n2", "to": "n5", "causality": "turbidity_overflow" },
        { "from": "n5", "to": "n6", "causality": "potable_supply_failure" }
      ]
    },
    "critical_interventions": [
      {
        "intervention": "Deploy diesel mobile pumps to Substation S-4",
        "mitigation_target": "n3",
        "cascade_risk_reduction": "48%"
      }
    ]
  }
}
```

---

## 7. GIS, Mapping & Road Network API

### 7.1 Dynamic Road Passability Status
- **Method:** `GET`
- **Route:** `/gis/roads`
- **Query Parameters:**
  - `status`: `passable` | `caution` | `flooded` | `blocked`
  - `bbox`: coordinates
- **Response (200 OK):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "road-seg-882",
      "geometry": {
        "type": "LineString",
        "coordinates": [[85.812, 20.451], [85.834, 20.472], [85.850, 20.485]]
      },
      "properties": {
        "road_name": "Grand Road / State Highway 60",
        "condition": "flooded",
        "water_depth_cm": 65,
        "is_evacuation_corridor": true,
        "passable_by": ["heavy_rescue_truck", "amphibious_apc"],
        "blocked_for": ["sedan", "suv", "ambulance"]
      }
    }
  ]
}
```

---

## 8. Shelters, Hospitals & Infrastructure API

### 8.1 Query Nearest Safe Shelters
- **Method:** `GET`
- **Route:** `/shelters/safe-search`
- **Query Parameters:**
  - `lat`: float
  - `lng`: float
  - `required_capacity`: integer (default: 1)
  - `max_distance_km`: float (default: 25.0)
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "shelter-uuid-01",
      "name": "Biju Patnaik High School Cyclone Center",
      "coordinates": { "lat": 20.481, "lng": 85.862 },
      "distance_km": 3.4,
      "total_capacity": 800,
      "occupied_capacity": 520,
      "available_capacity": 280,
      "occupancy_rate": 0.65,
      "elevation_meters": 12.4,
      "hazard_status": "SAFE",
      "supplies": {
        "food_packets_days": 4,
        "potable_water_liters": 12000,
        "generator_fuel_hours": 36,
        "medical_staff_on_duty": 4
      },
      "contact_phone": "+91-674-2391001"
    }
  ]
}
```

---

## 9. Resource Allocation & Fleet Deployment API

### 9.1 AI-Optimized Resource Dispatch
- **Method:** `POST`
- **Route:** `/resources/dispatch/optimize`
- **Required Role:** `authority_commander`
- **Request Body:**
```json
{
  "incident_cluster_id": "cluster-puri-coastal-4",
  "requested_capabilities": ["inflatable_boat", "paramedic_unit", "drinking_water_tanker"],
  "max_response_time_minutes": 45
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "optimization_algorithm": "Mixed-Integer Linear Programming (MILP)",
    "recommended_assignments": [
      {
        "resource_id": "res-boat-odraf-07",
        "resource_name": "ODRAF Inflatable Raft Unit 7",
        "current_depot": "Depot Bhubaneswar South",
        "assigned_cluster": "cluster-puri-coastal-4",
        "distance_km": 18.2,
        "estimated_travel_time_min": 24,
        "safe_route_id": "route-evac-991",
        "confidence_score": 0.96
      }
    ],
    "unmet_needs": []
  }
}
```

---

## 10. Evacuation Routing & Corridor Optimization API

### 10.1 Safe Multi-Hazard Evacuation Route Computation
- **Method:** `POST`
- **Route:** `/evacuation/route`
- **Request Body:**
```json
{
  "origin": { "lat": 20.450, "lng": 85.820 },
  "destination_shelter_id": "shelter-uuid-01",
  "vehicle_type": "standard_car",
  "avoid_hazards": ["flood", "landslide", "blocked_bridges"]
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "route_geojson": {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [85.820, 20.450],
          [85.825, 20.458],
          [85.845, 20.472],
          [85.862, 20.481]
        ]
      }
    },
    "distance_meters": 5420,
    "estimated_time_minutes": 14,
    "risk_index": 0.08,
    "elevation_profile": [4.2, 5.8, 9.1, 12.4],
    "hazard_crossings": 0,
    "turn_by_turn_instructions": [
      { "step": 1, "instruction": "Head northeast on Station Road toward High Ground", "distance_m": 800 },
      { "step": 2, "instruction": "Turn right at Ring Bypass (Avoid Canal Overpass)", "distance_m": 2200 },
      { "step": 3, "instruction": "Arrive at Biju Patnaik High School Cyclone Center", "distance_m": 420 }
    ],
    "alternatives": [
      { "label": "Secondary Ridge Route", "time_min": 19, "risk_index": 0.12 }
    ]
  }
}
```

---

## 11. Citizen SOS & Crowdsource Intelligence API

### 11.1 Create Emergency SOS Report
- **Method:** `POST`
- **Route:** `/sos`
- **Request Body (Multipart or JSON):**
```json
{
  "latitude": 20.4518,
  "longitude": 85.8340,
  "request_type": "medical_evac",
  "urgency": "critical",
  "people_count": 6,
  "special_needs": ["infant", "elderly_oxygen_dependent"],
  "contact_phone": "+919876500000",
  "description": "Ground floor submerged up to chest level. Oxygen concentrator running out of battery.",
  "media_urls": [
    "https://storage.aspire.gov.in/evidence/sos_img_88291.jpg"
  ]
}
```
- **Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "sos_id": "SOS-2026-9921",
    "status": "queued_priority",
    "priority_weight": 0.985,
    "assigned_cluster": "cluster-puri-urban-03",
    "nearest_rescue_depot_km": 1.8,
    "live_tracking_token": "trk_sec_89df1a03",
    "estimated_contact_min": 15
  }
}
```

### 11.2 Citizen Incident Reporting (Crowdsourced Verification)
- **Method:** `POST`
- **Route:** `/citizen-reports`
- **Request Body:**
```json
{
  "report_type": "bridge_damage",
  "latitude": 20.4601,
  "longitude": 85.8450,
  "severity_observed": "critical",
  "description": "Right pier of Old Mahanadi Bridge cracked; water surging through gap",
  "media_url": "https://storage.aspire.gov.in/reports/rep_4401.jpg"
}
```

---

## 12. Public Alerts & Broadcast Communication API

### 12.1 Broadcast Multi-Channel Emergency Alert
- **Method:** `POST`
- **Route:** `/alerts/broadcast`
- **Required Role:** `authority_commander`
- **Request Body:**
```json
{
  "disaster_id": "disaster-uuid-1",
  "title": "IMMEDIATE EVACUATION NOTICE - COASTAL PURi",
  "severity": "critical",
  "channels": ["sms", "whatsapp", "in_app_push", "siren"],
  "target_geofence": {
    "type": "Polygon",
    "coordinates": [[[85.78, 19.78], [85.92, 19.78], [85.92, 19.90], [85.78, 19.90], [85.78, 19.78]]]
  },
  "message_templates": {
    "en": "CRITICAL: Severe storm surge expected within 2 hours. Move immediately to nearest Cyclone Center.",
    "or": "ଜରୁରୀ ସୂଚନା: ଆଗାମୀ ୨ ଘଣ୍ଟା ମଧ୍ୟରେ ସାମୁଦ୍ରିକ ଜୁଆର ମାଡ଼ିଆସିବ। ତୁରନ୍ତ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ।"
  }
}
```

---

## 13. LLM Emergency Intelligence & Copilot API

### 13.1 AI Copilot Conversational Query
- **Method:** `POST`
- **Route:** `/llm/copilot`
- **Request Body:**
```json
{
  "prompt": "What are the 3 most critical bottlenecks for evacuation in Puri Sector 4 right now?",
  "context_scope": {
    "region_id": "region-puri",
    "time_window_minutes": 60,
    "include_telemetry": true
  }
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "answer": "Based on real-time PostGIS sensor feeds and 42 active SOS calls in Puri Sector 4:\n1. **Grand Road Flooding**: Inundation reached 65cm at Station Square, cutting off access for standard ambulances to District Hospital.\n2. **Town Hall Shelter Near Capacity**: Currently at 94% occupancy (470/500). Remaining evacuees must be diverted to SCS College Shelter (1.8 km North).\n3. **Power Outage at Marine Drive**: Feeder line tripped at 14:15 UTC, impairing street lighting and pumping station diesel starters.",
    "citations": [
      { "source": "Road Sensor RS-44", "value": "Water depth: 65cm" },
      { "source": "PostgreSQL Shelters Table", "value": "Puri Town Hall: 470/500" }
    ],
    "suggested_actions": [
      { "action": "Issue route diversion to SCS College Shelter", "endpoint": "POST /evacuation/corridors/redirect" },
      { "action": "Dispatch auxiliary power gen-set to Marine Drive", "endpoint": "POST /resources/dispatch" }
    ]
  }
}
```

---

## 14. Real-Time WebSocket Protocol Specification

### 14.1 Connection Handshake & Authentication
- **Endpoint:** `wss://api.aspire.gov.in/ws`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Query Params:** `?client_id=web_client_9918&channel=command_center`

### 14.2 Channel Subscriptions
Upon connection, the client sends a subscribe message:
```json
{
  "action": "subscribe",
  "channels": [
    "disasters:active",
    "sos:live_stream",
    "risk:updates:region_puri",
    "fleet:telemetry"
  ]
}
```

### 14.3 Server Push Events

#### Event: `sos:new` (Critical citizen beacon)
```json
{
  "event": "sos:new",
  "channel": "sos:live_stream",
  "payload": {
    "id": "SOS-2026-9921",
    "coordinates": [85.8340, 20.4518],
    "urgency": "critical",
    "people_count": 6,
    "request_type": "medical_evac",
    "timestamp": "2026-10-07T12:04:12Z"
  }
}
```

#### Event: `risk:heatmap:updated`
```json
{
  "event": "risk:heatmap:updated",
  "channel": "risk:updates:region_puri",
  "payload": {
    "hazard_type": "flood",
    "peak_risk_score": 0.94,
    "tile_url": "https://api.aspire.gov.in/v1/gis/tiles/{z}/{x}/{y}.mvt?version=1728302652"
  }
}
```

#### Event: `fleet:location` (GPS Heartbeat)
```json
{
  "event": "fleet:location",
  "channel": "fleet:telemetry",
  "payload": {
    "vehicle_id": "res-boat-odraf-07",
    "coordinates": [85.824, 20.461],
    "speed_kmh": 22.4,
    "battery_fuel_pct": 78,
    "status": "en_route_to_sos"
  }
}
```

---

## 15. Error Codes & Standard Envelope Format

| HTTP Status | Error Code | Description | Corrective Action |
|---|---|---|---|
| 400 | `INVALID_PAYLOAD` | Schema validation error in request body | Check field data types and mandatory properties |
| 401 | `UNAUTHORIZED` | Missing or expired JWT access token | Call `/auth/refresh` or re-authenticate |
| 403 | `FORBIDDEN_ROLE` | User lack RBAC permission (e.g., citizen calling broadcast) | Elevate privileges or use authorized account |
| 404 | `ENTITY_NOT_FOUND` | Shelter, Disaster, or SOS ID does not exist | Verify UUID parameter |
| 409 | `RESOURCE_CONFLICT` | Resource already deployed to active incident | Select alternative standby fleet unit |
| 422 | `POSTGIS_INVALID_GEOMETRY` | Polygon coordinates not closed or self-intersecting | Ensure first and last coordinate matches |
| 429 | `RATE_LIMIT_EXCEEDED` | Request threshold exceeded (120 req/min) | Implement exponential backoff |
| 500 | `INTERNAL_ML_INFERENCE_ERROR` | XGBoost/PyTorch inference failed | Fallback to heuristic risk scoring engine |
| 503 | `SERVICE_DEGRADED` | Database or Redis cache temporary failure | Read from local edge cache |
