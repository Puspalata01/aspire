# ASPIRE — Implementation Roadmap, Sprint Plan & Execution Guide

> **AI-Powered Disaster Intelligence & Response Platform**  
> **Tagline:** *From Warning to Action.*

**Version:** 1.0  
**Last Updated:** October 2026  
**Document Type:** Phased Development Roadmap, Sprint Backlog & Hackathon Execution Playbook  
**Target Delivery Window:** 4-Day Rapid Hackathon Build / 4-Week Production MVP  

---

## Table of Contents

1. [Executive Roadmap & Milestones](#1-executive-roadmap--milestones)
2. [Target Monorepo Architecture & Directory Scaffolding](#2-target-monorepo-architecture--directory-scaffolding)
3. [Phase 1: Foundation & Data Plumbing (Hours 0–12)](#3-phase-1-foundation--data-plumbing-hours-012)
4. [Phase 2: Core Backend & ML Integration (Hours 12–24)](#4-phase-2-core-backend--ml-integration-hours-1224)
5. [Phase 3: Next.js 16 + Tailwind CSS v4 Frontend (Hours 24–36)](#5-phase-3-nextjs-16--tailwind-css-v4-frontend-hours-2436)
6. [Phase 4: Real-Time Intelligence & Decision Support (Hours 36–44)](#6-phase-4-real-time-intelligence--decision-support-hours-3644)
7. [Phase 5: Polish, Demo Scenarios & Presentation (Hours 44–48)](#7-phase-5-polish-demo-scenarios--presentation-hours-4448)
8. [Comprehensive Copy-Paste Commands for Setup](#8-comprehensive-copy-paste-commands-for-setup)
9. [Hackathon Demo Script & Judge Pitch Strategy](#9-hackathon-demo-script--judge-pitch-strategy)
10. [Risk Mitigation & Fallback Matrix](#10-risk-mitigation--fallback-matrix)

---

## 1. Executive Roadmap & Milestones

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                ASPIRE 48-HOUR TIMELINE                            │
├───────────────────┬───────────────────┬───────────────────┬───────────────────────┤
│  HOURS 00 - 12    │  HOURS 12 - 24    │  HOURS 24 - 36    │  HOURS 36 - 48        │
│  FOUNDATION & DB  │  BACKEND & ML     │  FRONTEND (NEXT16)│  POLISH & DEMO PITCH  │
├───────────────────┼───────────────────┼───────────────────┼───────────────────────┤
│ • PostGIS Docker  │ • FastAPI routes  │ • Next.js 16 init │ • Live simulation run │
│ • 26 DB Migrations│ • ML inference API│ • Tailwind v4 css │ • Odisha flood scenario│
│ • Synthetic Seeds │ • Cascade graph   │ • Mapbox GL canvas│ • Video recording     │
│ • JWT Auth logic  │ • Shelter routing │ • Dark GIS UI kit │ • Slide deck / pitch  │
└───────────────────┴───────────────────┴───────────────────┴───────────────────────┘
```

---

## 2. Target Monorepo Architecture & Directory Scaffolding

```
aspire/
├── README.md
├── docs/                                    # Master architecture documentation
│   ├── 01_PRODUCT_REQUIREMENTS_DOCUMENT.md
│   ├── 02_TECHNICAL_REQUIREMENTS_DOCUMENT.md
│   ├── 03_BACKEND_SCHEMA_DOCUMENT.md
│   ├── 04_FRONTEND_FEATURE_DOCUMENT.md
│   ├── 05_API_SPECIFICATION_DOCUMENT.md
│   └── 06_IMPLEMENTATION_ROADMAP_AND_SPRINT_PLAN.md
│
├── frontend/                                # Next.js 16 App Router Frontend
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── app/
│   │   ├── layout.tsx                       # Root layout (Inter font, Dark theme)
│   │   ├── globals.css                      # Tailwind CSS v4 CSS variables
│   │   ├── page.tsx                         # High-impact Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/                     # Authority Command Center
│   │   │   ├── layout.tsx                   # Command center sidebar & topbar
│   │   │   ├── command/page.tsx             # Interactive War Room GIS Map
│   │   │   ├── risk/page.tsx                # Predictive Risk & Heatmaps
│   │   │   ├── simulation/page.tsx          # Cascading Hazard Simulator
│   │   │   ├── evacuation/page.tsx          # Evacuation & Corridor Manager
│   │   │   ├── resources/page.tsx           # Fleet Dispatch & Shelter Ops
│   │   │   └── alerts/page.tsx              # Multi-channel Broadcast Studio
│   │   └── citizen/                         # Citizen Mobile-First Portal
│   │       ├── page.tsx                     # Citizen Quick SOS & Safe Shelters
│   │       ├── map/page.tsx                 # Simple safe route viewer
│   │       └── sos/page.tsx                 # High-contrast SOS beacon trigger
│   ├── components/
│   │   ├── map/                             # Mapbox GL JS custom interactive layers
│   │   │   ├── MapboxViewer.tsx
│   │   │   ├── HazardHeatmapLayer.tsx
│   │   │   ├── EvacuationRouteLayer.tsx
│   │   │   └── LiveFleetMarkers.tsx
│   │   ├── ui/                              # shadcn/ui components
│   │   └── copilot/                         # Emergency AI Copilot chat drawer
│   └── lib/
│       ├── api.ts                           # Axios / TanStack query clients
│       ├── socket.ts                        # WebSocket singleton listener
│       └── store.ts                         # Zustand state store
│
├── backend/                                 # Python FastAPI Core Server
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/                             # Database migrations
│   └── app/
│       ├── main.py                          # FastAPI gateway & CORS
│       ├── config.py                        # Pydantic Settings
│       ├── database.py                      # SQLAlchemy + PostGIS async engine
│       ├── models/                          # 26 SQLAlchemy DB models
│       ├── schemas/                         # Pydantic v2 validation schemas
│       ├── api/v1/                          # REST route controllers
│       ├── websocket/                       # WebSocket real-time connection hub
│       └── services/                        # Optimization, routing & PostGIS queries
│
├── ml-service/                              # Python Machine Learning & AI Engine
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── api/                                 # ML FastAPI inference endpoints
│   ├── models/                              # Pre-trained / Mock multi-hazard models
│   ├── pipelines/                           # Spatial feature engineering
│   ├── llm/                                 # Gemini / Groq Copilot agents
│   └── data/                                # GeoJSON boundaries & historical datasets
│
└── docker-compose.yml                       # Unified local orchestration
```

---

## 3. Phase 1: Foundation & Data Plumbing (Hours 0–12)

### Sprint Goal
Establish a running database with PostGIS spatial extensions, run all table schemas, seed realistic Odisha multi-hazard disaster datasets, and verify basic auth tokens.

### Action Items
- [ ] Spin up PostgreSQL 16 + PostGIS 3.4 in Docker container.
- [ ] Initialize Python backend with FastAPI and SQLAlchemy 2.0.
- [ ] Create all database models (26 tables specified in `03_BACKEND_SCHEMA_DOCUMENT.md`).
- [ ] Run initial migration script or automatic table creation on startup.
- [ ] Create synthetic seed script (`seed_odisha.py`) containing:
  - 1 Active Cyclone event (*Cyclone Remal*).
  - 10 Designated Shelters with real Lat/Lng in Puri & Bhubaneswar.
  - 4 Hospitals with ICU and ambulance capacities.
  - 25 Critical Road segments with passability statuses.
  - 50 Realistic Citizen SOS reports clustered across low-lying flood zones.
  - 12 Ready Resource units (ODRAF motorized boats, NDRF trucks, water tankers).

---

## 4. Phase 2: Core Backend & ML Integration (Hours 12–24)

### Sprint Goal
Connect FastAPI business logic with the ML service inference pipeline, PostGIS geospatial functions, and real-time WebSocket broadcasting.

### Action Items
- [ ] Implement REST endpoints:
  - `/disasters`, `/hazards/spatial-layers`, `/shelters`, `/roads`, `/sos`.
- [ ] Implement PostGIS spatial queries:
  - `ST_DWithin` for nearest shelters and hospitals within radius.
  - `ST_Intersects` to compute flooded road intersections with flood polygons.
- [ ] Connect FastAPI backend to ML Service:
  - `/risk/assess` endpoint calculating ensemble risk scores.
  - `/cascade/simulate` generating cascading failure graphs.
- [ ] Implement AI Evacuation Router using Dijkstra / A* weighted by flood depths.
- [ ] Build WebSocket push hub emitting events for incoming SOS beacons.

---

## 5. Phase 3: Next.js 16 + Tailwind CSS v4 Frontend (Hours 24–36)

### Sprint Goal
Create a command center UI with a dark aesthetic, Mapbox GL JS spatial overlays, and responsive mobile citizen views.

### Action Items
- [ ] Initialize Next.js 16 app with React 19 and Tailwind CSS v4.
- [ ] Set up design tokens in `globals.css` (dark backgrounds `#0B0F19`, glass cards, severity colors).
- [ ] Build the **Authority Command Center**:
  - Full-screen Mapbox GL JS map container with theme styling (`mapbox://styles/mapbox/dark-v11`).
  - Interactive layer toggle panel (Flood Heatmap, Shelters, Active Fleet, Evacuation Corridors).
  - KPI Stat Cards across top (Active Hazards, People at Risk, Shelters at Capacity, Unresolved SOS).
  - Live incident feed sidebar with auto-scrolling alerts.
- [ ] Build the **Cascading Disaster Simulator**:
  - Interactive slider controls (Rainfall mm, Wind Speed km/h, River Discharge).
  - Dynamic cascade node graph showing secondary/tertiary impacts.
- [ ] Build the **Citizen Mobile Portal**:
  - High-contrast, single-tap SOS button.
  - Nearest Shelter locator with walk/drive directions and remaining capacity.
  - Safety advisory feed with multi-language support (English & Odia).

---

## 6. Phase 4: Real-Time Intelligence & Decision Support (Hours 36–44)

### Sprint Goal
Integrate live interactive features, AI Copilot chat drawer, and what-if simulation execution.

### Action Items
- [ ] Integrate LLM Assistant (Gemini / Groq) with RAG context from PostGIS database.
- [ ] Wire WebSocket client in Next.js to dynamically place new SOS markers on the map with red pulse animations.
- [ ] Implement "One-Click AI Dispatch" modal:
  - When clicking an SOS cluster, show the nearest available rescue boat, calculated travel time, and click "Dispatch Now".
- [ ] Implement Evacuation Route Inspector:
  - Display green safe corridors vs red flooded roads.
  - Click any road to simulate barrier/blockage and watch routes automatically recalculate.

---

## 7. Phase 5: Polish, Demo Scenarios & Presentation (Hours 44–48)

### Sprint Goal
Harden the demo script, prepare pristine synthetic walkthrough data, create a 3-minute pitch video, and verify all judges' criteria.

### Action Items
- [ ] Pre-configure **The Cyclone Remal Demo Scenario**:
  - Hour 0: High winds, cyclone warning issued, evacuation corridors opened.
  - Hour 6: Flash flood hits Puri coastal plain; road NH-16 culvert flooded.
  - Hour 12: SOS cluster of 15 elderly citizens trapped at Station Square.
  - Hour 14: ASPIRE AI detects bottleneck, reroutes rescue boats via canal ridge, dispatches ODRAF Unit 7.
- [ ] Test mobile responsiveness on phone screens for the Citizen Portal.
- [ ] Ensure all mock and fallback data works offline in case of venue Wi-Fi interruption.
- [ ] Prepare slide deck highlighting:
  1. The Problem: Static alerts kill; decision-makers lack actionable intelligence.
  2. The Solution: ASPIRE's Observe → Predict → Decide → Act workflow.
  3. The Technical Depth: Next.js 16 + PostGIS + XGBoost + LLM Copilot.

---

## 8. Comprehensive Copy-Paste Commands for Setup

*(Note: In accordance with developer instructions, execute these in your terminal.)*

### 8.1 Docker PostgreSQL + PostGIS Startup
```bash
docker run -d \
  --name aspire-postgis \
  -e POSTGRES_USER=aspire \
  -e POSTGRES_PASSWORD=aspire_secret \
  -e POSTGRES_DB=aspire_db \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

### 8.2 Backend FastAPI Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # (On Windows PowerShell)

# Install required backend dependencies
pip install fastapi uvicorn[standard] sqlalchemy asyncpg psycopg2-binary geoalchemy2 pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] python-multipart httpx websockets

# Run development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 8.3 ML Service Setup
```bash
# Navigate to ml-service directory
cd ml-service

# Create and activate python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # (On Windows PowerShell)

# Install machine learning dependencies
pip install -r requirements.txt

# Run ML inference server
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

### 8.4 Frontend Next.js 16 Setup
```bash
# Initialize Next.js 16 with TypeScript and Tailwind CSS
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Navigate to frontend
cd frontend

# Install UI and map visualization dependencies
npm install mapbox-gl @types/mapbox-gl lucide-react recharts framer-motion zustand @tanstack/react-query clsx tailwind-merge sonner socket.io-client date-fns @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs

# Run frontend development server
npm run dev
```

---

## 9. Hackathon Demo Script & Judge Pitch Strategy

### Pitch Opening (30 Seconds)
> "Judges, during Cyclone Fani and the recent floods in Eastern India, authorities had satellite weather warnings hours in advance. Yet hundreds of citizens remained trapped because current systems stop at **observation**. They tell you it's raining, but not which road will submerge in 4 hours, which shelter has room, or which rescue boat should go where.
>
> We built **ASPIRE: From Warning to Action**. An AI-driven disaster intelligence command center that transforms real-time GIS, predictive machine learning, and citizen SOS feeds into automated, life-saving response decisions."

### Interactive Walkthrough Flow (2.5 Minutes)
1. **The War Room (Minute 1:00):** Show the dark-mode command center. Toggle the real-time flood inundation layer. Show how ASPIRE highlights 3 critical bridges at risk of collapse within the next 4 hours.
2. **Citizen SOS & Clustering (Minute 1:45):** Open the mobile Citizen Portal. Trigger an SOS beacon for 6 trapped citizens. Watch the Authority dashboard light up instantly via WebSockets, clustering the beacon with 8 others using spatial DBSCAN.
3. **AI Copilot & Autonomous Dispatch (Minute 2:15):** Ask the Copilot: *"What is the safest evacuation route to Town Hall Shelter?"* Show the AI reroute around inundated sectors and recommend dispatching ODRAF Unit 7.
4. **Cascading Simulator (Minute 2:45):** Slide rainfall from 100mm to 250mm. Watch the graph predict power substation submersion and hospital generator failure, demonstrating multi-hazard awareness.

---

## 10. Risk Mitigation & Fallback Matrix

| Potential Failure Point | Likelihood | Impact | Built-In Fallback Strategy |
|---|---|---|---|
| **No Internet at Venue** | Medium | Critical | Pre-cache Mapbox vector tiles or use OpenStreetMap raster fallback; run all ML models locally with pre-saved weights. |
| **Mapbox API Token Quota** | Low | High | Use open-source Leaflet / OSM tiles toggle in `MapboxViewer.tsx`. |
| **LLM Rate Limits (Gemini/Groq)** | Medium | Medium | Seed a deterministic local rule-based response dictionary for the demo queries. |
| **Database Connection Error** | Low | Critical | Seed JSON fixture files (`mock_disasters.json`, `mock_shelters.json`) that the API automatically reads if DB connection fails. |
