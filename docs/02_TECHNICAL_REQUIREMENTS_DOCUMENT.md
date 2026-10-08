# ASPIRE — Technical Requirements Document (TRD)

> **AI-Powered Disaster Intelligence & Response Platform**
> **Tagline:** *From Warning to Action.*

**Version:** 1.0
**Last Updated:** October 2026
**Document Type:** Technical Architecture & Implementation Specification

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack — Detailed](#2-technology-stack--detailed)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [ML Service Architecture](#5-ml-service-architecture)
6. [Database Architecture](#6-database-architecture)
7. [API Design & Contracts](#7-api-design--contracts)
8. [GIS & Mapping Architecture](#8-gis--mapping-architecture)
9. [Real-Time Data Pipeline](#9-real-time-data-pipeline)
10. [LLM Integration Architecture](#10-llm-integration-architecture)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [DevOps & Infrastructure](#12-devops--infrastructure)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Integration Points](#14-integration-points)
15. [Error Handling & Resilience](#15-error-handling--resilience)
16. [Monitoring & Observability](#16-monitoring--observability)
17. [Security Architecture](#17-security-architecture)
18. [Performance Optimization](#18-performance-optimization)

---

## 1. System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
│                                                                             │
│   ┌─────────────────────────┐    ┌──────────────────────────────────┐       │
│   │   Authority Dashboard   │    │       Citizen Portal             │       │
│   │   (Next.js 16 + React)  │    │   (Next.js 16 + React)          │       │
│   │   + Mapbox GL JS        │    │   + Mapbox GL JS                │       │
│   │   + Tailwind CSS v4     │    │   + Tailwind CSS v4             │       │
│   │   + shadcn/ui           │    │   + shadcn/ui                   │       │
│   └───────────┬─────────────┘    └───────────────┬──────────────────┘       │
│               │                                  │                          │
└───────────────┼──────────────────────────────────┼──────────────────────────┘
                │              HTTPS/WSS           │
                ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                     Next.js API Routes                          │       │
│   │           (Server-Side Proxy + BFF Pattern)                     │       │
│   │   ┌──────────┬──────────┬───────────┬──────────┬──────────┐    │       │
│   │   │   Auth   │   Map    │   Risk    │   SOS    │ Resource │    │       │
│   │   │  Routes  │  Routes  │  Routes   │ Routes   │  Routes  │    │       │
│   │   └──────────┴──────────┴───────────┴──────────┴──────────┘    │       │
│   └───────────────────────────┬─────────────────────────────────────┘       │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌───────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│   BACKEND API     │ │   ML SERVICE     │ │   LLM SERVICE        │
│                   │ │                  │ │                      │
│   FastAPI         │ │   FastAPI        │ │   Gemini/OpenAI API  │
│   Python 3.11+    │ │   Python 3.11+   │ │   Tool Calling       │
│                   │ │                  │ │   NL Query Interface │
│   • Auth          │ │   • Flood Model  │ │                      │
│   • CRUD          │ │   • Cyclone      │ │   • Explanations     │
│   • GIS Queries   │ │   • Heatwave     │ │   • Summaries        │
│   • Notifications │ │   • Multi-Hazard │ │   • Emergency Guide  │
│   • SOS Pipeline  │ │   • Decision     │ │   • NL Queries       │
│   • Resources     │ │   • Cascade      │ │                      │
│                   │ │   • Risk Engine  │ │                      │
│                   │ │   • Inference    │ │                      │
└────────┬──────────┘ └────────┬─────────┘ └──────────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                          │
│                                                                             │
│   ┌─────────────────────┐  ┌──────────────┐  ┌─────────────────────┐       │
│   │  PostgreSQL 16       │  │   Redis 7    │  │   File Storage      │       │
│   │  + PostGIS 3.4       │  │              │  │                     │       │
│   │                      │  │  • Cache     │  │  • Model artifacts  │       │
│   │  • Spatial data      │  │  • Sessions  │  │  • GeoJSON files    │       │
│   │  • Disaster events   │  │  • Rate limit│  │  • Satellite imgs   │       │
│   │  • Users/Auth        │  │  • Pub/Sub   │  │  • Training data    │       │
│   │  • SOS reports       │  │  • Job queue │  │                     │       │
│   │  • Resources         │  │              │  │                     │       │
│   │  • Predictions       │  │              │  │                     │       │
│   └─────────────────────┘  └──────────────┘  └─────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL DATA SOURCES                                   │
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │  Weather APIs │  │  GIS/OSM     │  │  Satellite   │  │  Govt APIs   │   │
│   │  OpenWeather  │  │  Mapbox      │  │  Copernicus  │  │  IMD/NDMA    │   │
│   │  IMD API      │  │  CARTO       │  │  Sentinel    │  │  Census      │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Service-Oriented Architecture (SOA)** — Separate services for Frontend, Backend API, ML Service, LLM Service
2. **Backend-for-Frontend (BFF)** — Next.js API routes act as a proxy layer between client and backend services
3. **Microservice-Ready** — Each service is containerized and independently deployable
4. **Event-Driven** — Real-time data flows via Redis Pub/Sub + WebSocket
5. **GIS-First** — PostGIS for all spatial queries, Mapbox for visualization
6. **AI-Human Collaboration** — AI recommends, humans decide

---

## 2. Technology Stack — Detailed

### 2.1 Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16 (App Router) | Full-stack React framework, SSR, API routes |
| **React** | 19 | UI component library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | v4 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Component library (Radix UI primitives) |
| **Mapbox GL JS** | 3.x | 2D interactive map rendering |
| **CesiumJS** | 1.x (optional) | 3D globe visualization |
| **Recharts** | 2.x | Data visualization charts |
| **D3.js** | 7.x | Custom data visualizations |
| **Framer Motion** | 11.x | Animations & transitions |
| **Zustand** | 5.x | Lightweight state management |
| **TanStack Query** | 5.x | Server state management & caching |
| **Zod** | 3.x | Schema validation |
| **next-auth** | 5.x | Authentication |
| **Socket.io Client** | 4.x | Real-time WebSocket communication |
| **Turf.js** | 7.x | Client-side geospatial analysis |
| **date-fns** | 3.x | Date manipulation |

### 2.2 Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.115+ | High-performance Python API framework |
| **Python** | 3.11+ | Backend programming language |
| **Uvicorn** | Latest | ASGI server |
| **SQLAlchemy** | 2.x | ORM with async support |
| **GeoAlchemy2** | Latest | PostGIS integration for SQLAlchemy |
| **Alembic** | Latest | Database migrations |
| **Pydantic** | 2.x | Data validation & serialization |
| **Celery** | 5.x | Async task queue |
| **Redis** | 7.x | Caching, sessions, Pub/Sub, task broker |
| **PostgreSQL** | 16 | Primary relational database |
| **PostGIS** | 3.4 | Geospatial extension |
| **JWT** | PyJWT | Token-based authentication |
| **Passlib** | Latest | Password hashing (bcrypt) |
| **httpx** | Latest | Async HTTP client for external APIs |
| **WebSocket** | fastapi websocket | Real-time bidirectional communication |

### 2.3 ML Service Stack

| Technology | Version | Purpose |
|---|---|---|
| **Scikit-learn** | 1.x | Classic ML models (Random Forest, classifiers) |
| **XGBoost** | 2.x | Gradient boosting for risk classification |
| **LightGBM** | 4.x | Fast gradient boosting |
| **PyTorch** | 2.x | Deep learning (segmentation, detection) |
| **NumPy** | 1.x | Numerical computing |
| **Pandas** | 2.x | Data manipulation |
| **GeoPandas** | 0.14+ | Geospatial data analysis |
| **Shapely** | 2.x | Geometric operations |
| **SHAP** | 0.44+ | Explainable AI |
| **DBSCAN** | (scikit-learn) | Spatial clustering |
| **Rasterio** | 1.x | Raster/satellite data processing |
| **Fiona** | 1.x | Vector data I/O |

### 2.4 LLM Integration Stack

| Technology | Purpose |
|---|---|
| **Google Gemini API** | Primary LLM provider |
| **OpenAI API** (fallback) | Backup LLM provider |
| **LangChain** (optional) | LLM orchestration |
| **Tool Calling** | Function calling for structured AI actions |

### 2.5 DevOps & Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Local multi-service orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **Vercel** | Frontend deployment |
| **Railway / Render / Fly.io** | Backend service deployment |
| **Supabase** (option) | Managed PostgreSQL + PostGIS |
| **Upstash** (option) | Serverless Redis |
| **Cloudflare** | CDN + DDoS protection |

---

## 3. Frontend Architecture

### 3.1 Next.js 16 App Router Structure

```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, providers, metadata)
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Tailwind v4 + global styles
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Register page
│   │   └── layout.tsx                # Auth layout
│   │
│   ├── (authority)/
│   │   ├── layout.tsx                # Authority dashboard layout (sidebar + nav)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Command center / main dashboard
│   │   ├── map/
│   │   │   └── page.tsx              # Full-screen interactive disaster map
│   │   ├── risk/
│   │   │   └── page.tsx              # AI risk analysis dashboard
│   │   ├── impact/
│   │   │   └── page.tsx              # Impact prediction dashboard
│   │   ├── resources/
│   │   │   └── page.tsx              # Resource management & optimization
│   │   ├── shelters/
│   │   │   └── page.tsx              # Shelter intelligence
│   │   ├── hospitals/
│   │   │   └── page.tsx              # Hospital intelligence
│   │   ├── sos/
│   │   │   └── page.tsx              # SOS management & hotspots
│   │   ├── simulation/
│   │   │   └── page.tsx              # What-if scenario simulator
│   │   ├── cascade/
│   │   │   └── page.tsx              # Disaster chain prediction
│   │   ├── analytics/
│   │   │   └── page.tsx              # Historical analytics
│   │   ├── evacuation/
│   │   │   └── page.tsx              # Evacuation planning
│   │   └── settings/
│   │       └── page.tsx              # System settings
│   │
│   ├── (citizen)/
│   │   ├── layout.tsx                # Citizen portal layout
│   │   ├── home/
│   │   │   └── page.tsx              # Citizen home — risk check
│   │   ├── map/
│   │   │   └── page.tsx              # Citizen disaster map (simplified)
│   │   ├── shelters/
│   │   │   └── page.tsx              # Find shelters
│   │   ├── safe-routes/
│   │   │   └── page.tsx              # Safe route finder
│   │   ├── sos/
│   │   │   └── page.tsx              # Submit SOS request
│   │   ├── reports/
│   │   │   └── page.tsx              # Submit incident report
│   │   ├── alerts/
│   │   │   └── page.tsx              # View emergency alerts
│   │   └── guidance/
│   │       └── page.tsx              # Emergency guidance
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   │   └── route.ts          # NextAuth configuration
│       │   └── register/
│       │       └── route.ts          # User registration
│       ├── proxy/
│       │   └── [...path]/
│       │       └── route.ts          # BFF proxy to FastAPI backend
│       └── websocket/
│           └── route.ts              # WebSocket relay
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                # Top navigation bar
│   │   ├── Sidebar.tsx               # Authority sidebar navigation
│   │   ├── Footer.tsx                # Footer
│   │   ├── MobileNav.tsx             # Mobile responsive nav
│   │   └── KPIStrip.tsx              # Key metrics strip
│   │
│   ├── map/
│   │   ├── MapContainer.tsx          # Main Mapbox map wrapper
│   │   ├── MapControls.tsx           # Zoom, rotation, layer toggle
│   │   ├── HazardLayers.tsx          # Hazard layer rendering
│   │   ├── RiskHeatmap.tsx           # Risk heatmap overlay
│   │   ├── ShelterMarkers.tsx        # Shelter pins
│   │   ├── HospitalMarkers.tsx       # Hospital pins
│   │   ├── RoadLayer.tsx             # Road network with status
│   │   ├── SOSClusters.tsx           # SOS request clusters
│   │   ├── ResourceMarkers.tsx       # Resource deployment markers
│   │   ├── DisasterPolygons.tsx      # Active disaster boundaries
│   │   ├── WeatherOverlay.tsx        # Weather data layer
│   │   ├── LocationInspector.tsx     # Click-to-inspect panel
│   │   ├── TimelineSlider.tsx        # Historical timeline scrubber
│   │   └── MapLegend.tsx             # Legend panel
│   │
│   ├── risk/
│   │   ├── RiskScoreCard.tsx         # Individual area risk card
│   │   ├── RiskFactorsPanel.tsx      # Contributing factors breakdown
│   │   ├── ConfidenceIndicator.tsx   # Model confidence display
│   │   ├── RiskTrendChart.tsx        # Risk over time chart
│   │   └── ExplainabilityPanel.tsx   # XAI explanation panel
│   │
│   ├── command/
│   │   ├── ActiveEmergencies.tsx     # Live emergency feed
│   │   ├── AlertPanel.tsx            # Alert management
│   │   ├── AIRecommendations.tsx     # AI action recommendations
│   │   ├── PriorityAreas.tsx         # Ranked priority areas
│   │   └── QuickActions.tsx          # Quick action buttons
│   │
│   ├── resources/
│   │   ├── ResourceInventory.tsx     # Resource listing
│   │   ├── AllocationPanel.tsx       # Resource allocation UI
│   │   ├── DemandGapChart.tsx        # Demand vs supply visualization
│   │   └── DeploymentMap.tsx         # Resource deployment on map
│   │
│   ├── sos/
│   │   ├── SOSForm.tsx               # SOS submission form
│   │   ├── SOSList.tsx               # SOS request list
│   │   ├── SOSHotspots.tsx           # Hotspot visualization
│   │   ├── SOSStatusTracker.tsx      # Request status tracking
│   │   └── DemandClusterPanel.tsx    # DBSCAN cluster display
│   │
│   ├── simulation/
│   │   ├── ScenarioBuilder.tsx       # Parameter adjustment UI
│   │   ├── SimulationResults.tsx     # Results display
│   │   ├── ComparisonView.tsx        # Side-by-side comparison
│   │   └── ScenarioHistory.tsx       # Saved scenarios
│   │
│   ├── cascade/
│   │   ├── CascadeChain.tsx          # Visual cascade chain diagram
│   │   ├── CascadeTimeline.tsx       # Timeline of cascading events
│   │   └── CascadeDetailPanel.tsx    # Step detail inspector
│   │
│   ├── citizen/
│   │   ├── RiskCheck.tsx             # Personal risk checker
│   │   ├── ShelterFinder.tsx         # Nearest shelter finder
│   │   ├── SafeRouteMap.tsx          # Safe route visualization
│   │   ├── EmergencyGuidance.tsx     # Safety instructions
│   │   └── AlertBanner.tsx           # Citizen alert banner
│   │
│   ├── charts/
│   │   ├── BarChart.tsx              # Reusable bar chart
│   │   ├── LineChart.tsx             # Reusable line chart
│   │   ├── PieChart.tsx              # Reusable pie chart
│   │   ├── AreaChart.tsx             # Reusable area chart
│   │   ├── RadarChart.tsx            # Multi-factor radar
│   │   └── GaugeChart.tsx            # Severity gauge
│   │
│   └── shared/
│       ├── LoadingSpinner.tsx        # Loading state
│       ├── ErrorBoundary.tsx         # Error handling
│       ├── EmptyState.tsx            # Empty state placeholder
│       ├── SeverityBadge.tsx         # LOW/MED/HIGH/CRITICAL badge
│       ├── NotificationToast.tsx     # Toast notification
│       └── SearchBar.tsx             # Global search
│
├── hooks/
│   ├── useMap.ts                     # Map instance management
│   ├── useRiskData.ts               # Risk data fetching
│   ├── useSOSData.ts                # SOS data management
│   ├── useResources.ts              # Resource data hooks
│   ├── useWebSocket.ts              # WebSocket connection
│   ├── useGeolocation.ts            # Browser geolocation
│   ├── useNotifications.ts          # Notification system
│   └── useAuth.ts                   # Authentication state
│
├── lib/
│   ├── api.ts                       # API client (TanStack Query + fetch)
│   ├── mapbox.ts                    # Mapbox configuration
│   ├── auth.ts                      # Auth configuration
│   ├── websocket.ts                 # WebSocket client
│   ├── constants.ts                 # App constants
│   ├── utils.ts                     # Utility functions
│   ├── validators.ts                # Zod schemas
│   └── types.ts                     # TypeScript type definitions
│
├── stores/
│   ├── mapStore.ts                  # Map state (layers, viewport)
│   ├── riskStore.ts                 # Risk data state
│   ├── sosStore.ts                  # SOS state
│   ├── resourceStore.ts            # Resource state
│   ├── simulationStore.ts          # Simulation state
│   ├── notificationStore.ts        # Notification state
│   └── authStore.ts                # Auth state
│
├── styles/
│   └── mapbox-overrides.css         # Mapbox custom styling
│
├── public/
│   ├── icons/                       # App icons & PWA
│   ├── images/                      # Static images
│   └── data/                        # Static GeoJSON for demo
│
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS v4 config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
└── .env.local                       # Environment variables
```

### 3.2 State Management Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   STATE ARCHITECTURE                     │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  SERVER STATE (TanStack Query v5)                │   │
│   │  • API data caching                              │   │
│   │  • Auto-refetching                               │   │
│   │  • Optimistic updates                            │   │
│   │  • Background sync                               │   │
│   │  • Stale-while-revalidate                        │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  CLIENT STATE (Zustand)                          │   │
│   │  • Map viewport & layers                         │   │
│   │  • UI state (sidebars, modals)                   │   │
│   │  • Simulation parameters                         │   │
│   │  • Selected filters                              │   │
│   │  • Notification queue                            │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  REAL-TIME STATE (WebSocket + Zustand)           │   │
│   │  • Live disaster updates                         │   │
│   │  • SOS feed                                      │   │
│   │  • Alert stream                                  │   │
│   │  • Resource position updates                     │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Tailwind CSS v4 Configuration

```css
/* app/globals.css */
@import "tailwindcss";

/* Design Tokens */
@theme {
  /* Brand Colors */
  --color-primary: oklch(0.6 0.2 250);        /* Deep blue */
  --color-primary-light: oklch(0.75 0.15 250);
  --color-primary-dark: oklch(0.45 0.25 250);

  /* Severity Colors */
  --color-severity-low: oklch(0.75 0.18 145);       /* Green */
  --color-severity-medium: oklch(0.8 0.18 85);      /* Yellow */
  --color-severity-high: oklch(0.65 0.22 30);       /* Orange */
  --color-severity-critical: oklch(0.55 0.25 15);   /* Red */

  /* Hazard Colors */
  --color-hazard-flood: oklch(0.6 0.18 240);        /* Blue */
  --color-hazard-cyclone: oklch(0.55 0.2 280);      /* Purple */
  --color-hazard-heatwave: oklch(0.7 0.2 50);       /* Orange-Red */
  --color-hazard-landslide: oklch(0.55 0.12 60);    /* Brown */
  --color-hazard-earthquake: oklch(0.5 0.15 25);    /* Dark Red */

  /* Dark Mode Surface Colors */
  --color-surface-0: oklch(0.15 0.01 250);    /* Darkest background */
  --color-surface-1: oklch(0.18 0.01 250);    /* Card background */
  --color-surface-2: oklch(0.22 0.01 250);    /* Elevated card */
  --color-surface-3: oklch(0.26 0.015 250);   /* Hover state */

  /* Typography */
  --font-sans: "Inter", "system-ui", "sans-serif";
  --font-mono: "JetBrains Mono", "monospace";

  /* Spacing Scale */
  --spacing-section: 2rem;
  --spacing-card: 1.5rem;

  /* Border Radius */
  --radius-card: 0.75rem;
  --radius-button: 0.5rem;

  /* Shadows */
  --shadow-card: 0 4px 6px -1px oklch(0 0 0 / 0.2), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-elevated: 0 10px 15px -3px oklch(0 0 0 / 0.3), 0 4px 6px -4px oklch(0 0 0 / 0.1);
}
```

### 3.4 Key Frontend Packages

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "mapbox-gl": "^3.8.0",
    "@mapbox/mapbox-gl-geocoder": "^5.0.0",
    "@turf/turf": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "zod": "^3.23.0",
    "next-auth": "^5.0.0",
    "recharts": "^2.12.0",
    "framer-motion": "^11.5.0",
    "socket.io-client": "^4.7.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "sonner": "^1.5.0"
  }
}
```

---

## 4. Backend Architecture

### 4.1 FastAPI Service Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry
│   ├── config.py                    # Configuration (Pydantic Settings)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                  # Dependency injection (DB sessions, auth)
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py            # Main v1 router
│   │   │   ├── auth.py              # Auth endpoints
│   │   │   ├── disasters.py         # Disaster CRUD
│   │   │   ├── hazards.py           # Hazard data endpoints
│   │   │   ├── risk.py              # Risk scoring endpoints
│   │   │   ├── predictions.py       # Prediction endpoints
│   │   │   ├── impact.py            # Impact analysis endpoints
│   │   │   ├── map.py               # GIS/map data endpoints
│   │   │   ├── roads.py             # Road network endpoints
│   │   │   ├── shelters.py          # Shelter management
│   │   │   ├── hospitals.py         # Hospital management
│   │   │   ├── resources.py         # Resource management
│   │   │   ├── sos.py               # SOS request endpoints
│   │   │   ├── citizen_reports.py   # Citizen report endpoints
│   │   │   ├── simulation.py        # What-if simulation
│   │   │   ├── cascade.py           # Cascade prediction endpoints
│   │   │   ├── analytics.py         # Historical analytics
│   │   │   ├── notifications.py     # Notification endpoints
│   │   │   ├── evacuation.py        # Evacuation planning
│   │   │   └── llm.py               # LLM query endpoints
│   │   └── websocket/
│   │       ├── __init__.py
│   │       └── handler.py           # WebSocket connection manager
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                  # User SQLAlchemy model
│   │   ├── disaster.py              # Disaster event model
│   │   ├── hazard.py                # Hazard data model
│   │   ├── risk_assessment.py       # Risk assessment model
│   │   ├── prediction.py            # Prediction model
│   │   ├── shelter.py               # Shelter model
│   │   ├── hospital.py              # Hospital model
│   │   ├── resource.py              # Resource model
│   │   ├── sos_report.py            # SOS report model
│   │   ├── citizen_report.py        # Citizen report model
│   │   ├── road.py                  # Road model
│   │   ├── notification.py          # Notification model
│   │   └── simulation.py            # Simulation model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                  # Auth request/response schemas
│   │   ├── disaster.py              # Disaster schemas
│   │   ├── risk.py                  # Risk schemas
│   │   ├── shelter.py               # Shelter schemas
│   │   ├── hospital.py              # Hospital schemas
│   │   ├── resource.py              # Resource schemas
│   │   ├── sos.py                   # SOS schemas
│   │   ├── simulation.py            # Simulation schemas
│   │   └── common.py                # Shared schemas (pagination, errors)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py          # Auth business logic
│   │   ├── disaster_service.py      # Disaster management logic
│   │   ├── risk_service.py          # Risk calculation orchestration
│   │   ├── gis_service.py           # GIS queries and spatial analysis
│   │   ├── notification_service.py  # Notification delivery
│   │   ├── sos_service.py           # SOS processing pipeline
│   │   ├── resource_service.py      # Resource allocation logic
│   │   ├── weather_service.py       # Weather data ingestion
│   │   ├── simulation_service.py    # Simulation orchestration
│   │   └── ml_client.py             # Client to call ML microservice
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py              # JWT, password hashing, CORS
│   │   ├── database.py              # AsyncSession, engine setup
│   │   ├── redis.py                 # Redis connection
│   │   ├── middleware.py            # Rate limiting, logging, error handling
│   │   └── exceptions.py           # Custom exceptions
│   │
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── celery_app.py            # Celery configuration
│   │   ├── weather_tasks.py         # Periodic weather data fetch
│   │   ├── risk_tasks.py            # Periodic risk recalculation
│   │   └── notification_tasks.py    # Async notification delivery
│   │
│   └── utils/
│       ├── __init__.py
│       ├── geo_utils.py             # Geospatial utility functions
│       ├── date_utils.py            # Date/time utilities
│       └── validators.py            # Custom validators
│
├── alembic/
│   ├── versions/                    # Migration scripts
│   ├── env.py                       # Alembic environment
│   └── alembic.ini                  # Alembic config
│
├── tests/
│   ├── conftest.py                  # Test fixtures
│   ├── test_auth.py
│   ├── test_disasters.py
│   ├── test_risk.py
│   ├── test_sos.py
│   └── test_resources.py
│
├── Dockerfile                       # Backend Docker image
├── docker-compose.yml               # Full stack local dev
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variable template
└── pyproject.toml                   # Project metadata
```

### 4.2 Backend API Groups

| API Group | Base Path | Methods | Description |
|---|---|---|---|
| **Auth** | `/api/v1/auth` | POST, GET | Login, register, refresh, profile |
| **Disasters** | `/api/v1/disasters` | CRUD | Active disaster management |
| **Hazards** | `/api/v1/hazards` | GET, POST | Hazard data by type and region |
| **Risk** | `/api/v1/risk` | GET, POST | Risk scores, assessments |
| **Predictions** | `/api/v1/predictions` | GET, POST | ML model predictions |
| **Impact** | `/api/v1/impact` | GET, POST | Impact estimations |
| **Map** | `/api/v1/map` | GET | GeoJSON layers, spatial queries |
| **Roads** | `/api/v1/roads` | GET, PATCH | Road network status |
| **Shelters** | `/api/v1/shelters` | CRUD | Shelter management |
| **Hospitals** | `/api/v1/hospitals` | CRUD | Hospital management |
| **Resources** | `/api/v1/resources` | CRUD | Resource inventory & allocation |
| **SOS** | `/api/v1/sos` | CRUD | SOS request pipeline |
| **Citizen Reports** | `/api/v1/reports` | CRUD | Citizen incident reports |
| **Simulation** | `/api/v1/simulation` | POST, GET | What-if scenario engine |
| **Cascade** | `/api/v1/cascade` | GET, POST | Disaster chain analysis |
| **Analytics** | `/api/v1/analytics` | GET | Historical analytics data |
| **Notifications** | `/api/v1/notifications` | GET, POST | Notification management |
| **Evacuation** | `/api/v1/evacuation` | GET, POST | Evacuation routes & zones |
| **LLM** | `/api/v1/llm` | POST | Natural language queries |
| **Health** | `/api/v1/health` | GET | System health check |

---

## 5. ML Service Architecture

### 5.1 ML Service Modules (Already Implemented)

The ML service is already built as a FastAPI microservice with the following structure:

| Module | Models | Status |
|---|---|---|
| **Flood** | FloodSegmentationModel, PrecipitationForecastingModel, RiverDischargeModel, VulnerabilityScorer, ExposureModel, RiskClassifier, RiskAssessmentEngine, ImpactPredictionEngine | ✅ Implemented |
| **Cyclone** | CycloneDetector | ✅ Implemented |
| **Heatwave** | HeatwaveDetector | ✅ Implemented |
| **Multi-Hazard** | CascadeAnalyzer, HeatwaveDetector | ✅ Implemented |
| **Hazard** | CascadingHazardModel | ✅ Implemented |
| **Decision Support** | DecisionSupportEngine, EvacuationPlanner, ResourceOptimizer, ShelterAllocator | ✅ Implemented |
| **LLM** | LLMClient, ToolRegistry, NLQueryInterface, ExplainabilityModule | ✅ Implemented |
| **Pipelines** | FloodInference, PreprocessingPipeline, FloodSegmentationTrainer | ✅ Implemented |

### 5.2 ML Service API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/flood/analyze` | POST | Full flood risk analysis |
| `/api/v1/flood/segment` | POST | Satellite flood segmentation |
| `/api/v1/flood/precipitation` | POST | Precipitation forecasting |
| `/api/v1/flood/risk` | POST | Flood risk classification |
| `/api/v1/flood/impact` | POST | Flood impact prediction |
| `/api/v1/multi-hazard/assess` | POST | Multi-hazard risk assessment |
| `/api/v1/multi-hazard/cascade` | POST | Cascade hazard analysis |
| `/api/v1/decision/recommendations` | POST | Decision support recommendations |
| `/api/v1/decision/evacuation` | POST | Evacuation route planning |
| `/api/v1/decision/resources` | POST | Resource optimization |
| `/api/v1/decision/shelters` | POST | Shelter allocation |
| `/api/v1/llm/query` | POST | Natural language query |
| `/api/v1/llm/explain` | POST | AI explanation generation |
| `/api/v1/monitoring/stream` | WebSocket | Real-time monitoring data |
| `/api/v1/health` | GET | Service health check |

---

## 6. Database Architecture

See **Backend Schema Document** (separate document) for complete database schema.

### 6.1 Database Technology

| Component | Technology | Purpose |
|---|---|---|
| Primary DB | PostgreSQL 16 | Relational data storage |
| Spatial Extension | PostGIS 3.4 | Geospatial queries |
| Cache | Redis 7 | Caching, sessions, pub/sub |
| ORM | SQLAlchemy 2.x + GeoAlchemy2 | Database abstraction |
| Migrations | Alembic | Schema versioning |

### 6.2 Core Tables Overview

- `users` — User accounts and roles
- `disasters` — Active and historical disaster events
- `risk_assessments` — Per-area risk scores with factors
- `predictions` — ML model predictions
- `shelters` — Shelter inventory
- `hospitals` — Hospital data
- `resources` — Resource inventory
- `resource_deployments` — Resource deployment records
- `sos_reports` — Citizen SOS requests
- `citizen_reports` — Citizen incident reports
- `roads` — Road network with status
- `notifications` — Notification records
- `simulations` — Saved scenarios
- `cascade_analyses` — Cascade chain records
- `audit_logs` — System audit trail

---

## 7. API Design & Contracts

### 7.1 API Design Principles

1. **RESTful** — Standard HTTP methods and status codes
2. **Versioned** — `/api/v1/` prefix
3. **Paginated** — Cursor-based pagination for list endpoints
4. **Filterable** — Query parameters for filtering
5. **Consistent Error Format** — Standardized error responses
6. **GeoJSON Compliant** — Spatial data in GeoJSON format

### 7.2 Standard Response Format

```typescript
// Success Response
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-07T12:00:00Z",
    "request_id": "uuid",
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}

// Error Response
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Shelter with ID 42 not found",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-10-07T12:00:00Z",
    "request_id": "uuid"
  }
}
```

### 7.3 Key API Contracts

#### Risk Assessment
```
POST /api/v1/risk/assess
Request:
{
  "location": { "lat": 20.5, "lng": 85.8 },
  "radius_km": 10,
  "hazard_types": ["flood", "cyclone"]
}

Response:
{
  "status": "success",
  "data": {
    "overall_risk": "HIGH",
    "overall_score": 0.87,
    "confidence": 0.92,
    "hazards": [
      {
        "type": "flood",
        "risk_level": "HIGH",
        "score": 0.91,
        "factors": [
          { "name": "rainfall_intensity", "value": "very_high", "weight": 0.3 },
          { "name": "river_level", "value": "rising", "weight": 0.25 },
          { "name": "elevation", "value": "low", "weight": 0.2 },
          { "name": "historical_frequency", "value": "high", "weight": 0.15 },
          { "name": "population_exposure", "value": "high", "weight": 0.1 }
        ],
        "recommended_actions": [
          "Prepare evacuation for Zone A",
          "Monitor Road R12 for closure",
          "Pre-position boats in Sector 3"
        ]
      }
    ],
    "impact_estimate": {
      "population_affected": 42000,
      "roads_at_risk": 7,
      "hospitals_at_risk": 2,
      "shelters_nearing_capacity": 3
    }
  }
}
```

#### SOS Submission
```
POST /api/v1/sos
Request:
{
  "location": { "lat": 20.5, "lng": 85.8 },
  "request_type": "rescue",
  "urgency": "critical",
  "description": "Water level rising rapidly, family trapped on rooftop",
  "people_count": 5,
  "media_urls": []
}

Response:
{
  "status": "success",
  "data": {
    "id": "sos-uuid",
    "status": "received",
    "priority_score": 0.95,
    "estimated_response_time": "15-30 minutes",
    "nearest_resources": [
      { "type": "rescue_boat", "distance_km": 2.3, "eta_min": 12 }
    ]
  }
}
```

---

## 8. GIS & Mapping Architecture

### 8.1 Map Technology Selection

| Feature | Mapbox GL JS | CesiumJS |
|---|---|---|
| 2D Maps | ✅ Primary | ❌ |
| 3D Globe | ❌ | ✅ Optional |
| Heatmaps | ✅ Built-in | ⚠️ Plugin |
| Vector Tiles | ✅ Excellent | ⚠️ Limited |
| Performance | ✅ Excellent | ⚠️ Heavier |
| Cost | Free 50K loads/mo | Free & open source |

**Decision:** Mapbox GL JS as primary map engine. CesiumJS optional for 3D globe view.

### 8.2 Map Layers Configuration

| Layer ID | Type | Data Source | Update Frequency |
|---|---|---|---|
| `flood-risk` | Fill/Heatmap | PostGIS + ML Service | 5 min |
| `cyclone-track` | Line | Weather API + ML | 15 min |
| `heatwave-zones` | Fill | ML Service | 1 hour |
| `landslide-risk` | Fill | ML Service | 1 hour |
| `earthquake-zones` | Circle | Seismic API | Real-time |
| `shelters` | Symbol | PostgreSQL | On change |
| `hospitals` | Symbol | PostgreSQL | On change |
| `roads` | Line | PostGIS | 5 min |
| `sos-clusters` | Circle/Heatmap | DBSCAN + PostGIS | 1 min |
| `resources` | Symbol | PostgreSQL | Real-time |
| `population-density` | Fill | Census/Static | Static |
| `weather` | Raster | Weather API | 30 min |
| `disaster-polygons` | Fill | PostGIS | 5 min |
| `predicted-impact` | Fill | ML Service | 5 min |

### 8.3 GeoJSON Data Format

All spatial data served in GeoJSON `FeatureCollection` format:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [85.8, 20.5]
      },
      "properties": {
        "id": "shelter-001",
        "name": "Community Hall A",
        "type": "shelter",
        "capacity": 500,
        "occupancy": 320,
        "status": "open",
        "accessibility": "accessible"
      }
    }
  ]
}
```

---

## 9. Real-Time Data Pipeline

### 9.1 Data Flow Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Weather APIs    │────▶│  Data Ingestion  │────▶│   PostgreSQL    │
│  (OpenWeather,   │     │  Service (Celery) │     │   + PostGIS     │
│   IMD)           │     │                  │     │                 │
└─────────────────┘     │  • Validate      │     └────────┬────────┘
                         │  • Clean         │              │
┌─────────────────┐     │  • Normalize     │              ▼
│  GIS Data       │────▶│  • Geo-transform │     ┌─────────────────┐
│  (OpenStreetMap) │     │                  │     │   Redis Cache   │
└─────────────────┘     └──────────────────┘     │   + Pub/Sub     │
                                                  └────────┬────────┘
┌─────────────────┐     ┌──────────────────┐              │
│  Citizen Reports │────▶│  SOS Pipeline    │              ▼
│  + SOS           │     │  • Dedup         │     ┌─────────────────┐
└─────────────────┘     │  • Validate      │     │   ML Service    │
                         │  • Cluster       │     │   • Risk calc   │
                         │  • Score         │     │   • Predictions │
                         └──────────────────┘     │   • Cascade     │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   WebSocket     │
                                                  │   Broadcast     │
                                                  │   (to clients)  │
                                                  └─────────────────┘
```

### 9.2 WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `disaster:update` | Server → Client | Disaster status change |
| `risk:update` | Server → Client | Risk score recalculation |
| `sos:new` | Server → Client | New SOS request received |
| `sos:cluster_update` | Server → Client | SOS cluster update |
| `alert:new` | Server → Client | New alert generated |
| `resource:deployed` | Server → Client | Resource deployment |
| `shelter:status_change` | Server → Client | Shelter capacity change |
| `road:status_change` | Server → Client | Road blockage update |
| `weather:update` | Server → Client | Weather data refresh |

---

## 10. LLM Integration Architecture

### 10.1 LLM Service Design

```
┌───────────────────────────────────────────────────────────┐
│                    LLM Integration Layer                    │
│                                                            │
│   ┌───────────────┐    ┌──────────────────────────────┐   │
│   │ NL Query      │    │   Tool Registry               │   │
│   │ Interface     │───▶│                               │   │
│   │               │    │   • get_risk_score()           │   │
│   │ "What is the  │    │   • get_shelter_status()       │   │
│   │  flood risk   │    │   • get_road_conditions()      │   │
│   │  in Zone A?"  │    │   • get_resource_status()      │   │
│   └───────────────┘    │   • get_sos_summary()          │   │
│                         │   • run_cascade_analysis()     │   │
│   ┌───────────────┐    │   • get_weather_data()         │   │
│   │ Explainability│    │   • get_evacuation_routes()    │   │
│   │ Module        │    └──────────────────────────────┘   │
│   │               │                                       │
│   │ • Feature     │    ┌──────────────────────────────┐   │
│   │   importance  │    │   LLM Client                  │   │
│   │ • Reasoning   │───▶│   (Gemini API)                │   │
│   │   chains      │    │                               │   │
│   │ • Confidence  │    │   • Structured output         │   │
│   │   explanation │    │   • Function calling          │   │
│   └───────────────┘    │   • Streaming responses       │   │
│                         └──────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### 10.2 LLM Usage Patterns

| Use Case | Input | Output | Model |
|---|---|---|---|
| Risk Explanation | Risk scores + factors | Human-readable explanation paragraph | Gemini |
| Decision Summary | Multiple risk/impact data | Situational briefing | Gemini |
| NL Query | "Which areas are most at risk?" | Structured response + data | Gemini (Function Calling) |
| Emergency Guidance | Hazard type + severity | Safety instructions for citizens | Gemini |
| Scenario Interpretation | Simulation results | Narrative interpretation | Gemini |

---

## 11. Authentication & Authorization

### 11.1 Auth Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Client   │────▶│  Next.js      │────▶│  FastAPI      │
│           │     │  NextAuth.js  │     │  /auth/login  │
│           │     │               │     │               │
│  Login    │     │  JWT Cookie   │     │  Verify creds │
│  Form     │     │  Management   │     │  Issue JWT    │
│           │◀────│               │◀────│  Return token │
└──────────┘     └──────────────┘     └──────────────┘
```

### 11.2 Role-Based Access Control

| Role | Access Level | Capabilities |
|---|---|---|
| `CITIZEN` | Basic | View map, check risk, SOS, find shelters |
| `AUTHORITY` | Full Dashboard | All citizen + command center, resources, analytics |
| `ADMIN` | System | All authority + user management, system config |
| `SUPER_ADMIN` | Root | Full system access |

### 11.3 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authority",
  "permissions": ["read:risk", "write:resources", "manage:sos"],
  "region_id": "district-001",
  "iat": 1696694400,
  "exp": 1696780800
}
```

---

## 12. DevOps & Infrastructure

### 12.1 Docker Compose (Local Development)

```yaml
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_MAPBOX_TOKEN=${MAPBOX_TOKEN}
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/aspire
      - REDIS_URL=redis://redis:6379/0
      - ML_SERVICE_URL=http://ml-service:8001
    depends_on: [db, redis, ml-service]

  ml-service:
    build: ./ml-service
    ports: ["8001:8001"]
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}

  db:
    image: postgis/postgis:16-3.4
    ports: ["5432:5432"]
    environment:
      - POSTGRES_DB=aspire
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  celery-worker:
    build: ./backend
    command: celery -A app.tasks.celery_app worker -l info
    depends_on: [redis, db]

  celery-beat:
    build: ./backend
    command: celery -A app.tasks.celery_app beat -l info
    depends_on: [redis, db]

volumes:
  pgdata:
```

### 12.2 Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Vercel      │     │  Railway /    │     │  Supabase /      │
│               │     │  Render       │     │  Managed PG      │
│  Frontend     │────▶│  Backend      │────▶│  PostgreSQL      │
│  Next.js      │     │  FastAPI +    │     │  + PostGIS       │
│               │     │  ML Service   │     │                  │
└──────────────┘     └──────────────┘     └──────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Upstash /    │
                     │  Managed      │
                     │  Redis        │
                     └──────────────┘
```

---

## 13. Data Flow Diagrams

### 13.1 Flood Risk Analysis Flow

```
Weather API ──▶ Data Ingestion ──▶ Preprocessing
                                        │
                    ┌───────────────────┤
                    ▼                    ▼
        Precipitation Model    River Discharge Model
                    │                    │
                    ▼                    ▼
               Flood Risk Classifier ◀──┘
                    │
                    ├──▶ Vulnerability Scorer
                    ├──▶ Exposure Model
                    ▼
           Risk Assessment Engine
                    │
                    ├──▶ Impact Prediction Engine
                    ├──▶ Explainability Module (LLM)
                    ▼
           Response (Risk + Impact + Explanation)
                    │
                    ├──▶ WebSocket Broadcast
                    ├──▶ Redis Cache
                    └──▶ PostgreSQL Store
```

### 13.2 SOS Processing Pipeline

```
Citizen SOS ──▶ API Endpoint ──▶ Validation
                                     │
                                     ▼
                              Duplicate Detection
                                     │
                                     ▼
                              DBSCAN Clustering
                                     │
                                     ▼
                              Priority Scoring
                                     │
                              ┌──────┴──────┐
                              ▼              ▼
                     Authority Dashboard   Resource
                     (WebSocket push)    Recommendation
                                              │
                                              ▼
                                     Nearest Resources
                                     ETA Calculation
```

---

## 14. Integration Points

### 14.1 External API Integrations

| Service | API | Purpose | Rate Limit |
|---|---|---|---|
| OpenWeatherMap | REST | Weather data, forecasts | 1000 calls/day (free) |
| India Meteorological Dept (IMD) | REST | Indian weather data | Varies |
| Mapbox | REST + Tiles | Map tiles, geocoding, routing | 50K loads/mo (free) |
| OpenStreetMap / Overpass | REST | Road network, POI data | Fair use |
| Google Gemini | REST | LLM queries, explanations | 60 QPM (free) |
| USGS Earthquake | REST | Seismic data | Open |
| Copernicus | REST | Satellite imagery | Registration |

### 14.2 Internal Service Communication

| From | To | Protocol | Purpose |
|---|---|---|---|
| Frontend | Backend API | HTTPS REST | All CRUD operations |
| Frontend | Backend | WebSocket (WSS) | Real-time updates |
| Backend | ML Service | HTTP REST | Model predictions |
| Backend | Redis | TCP | Caching, pub/sub |
| Backend | PostgreSQL | TCP | Data persistence |
| Celery Worker | Redis | TCP | Task queue |
| Celery Worker | External APIs | HTTPS | Data ingestion |

---

## 15. Error Handling & Resilience

### 15.1 Error Handling Strategy

| Layer | Strategy |
|---|---|
| Frontend | Error boundaries, toast notifications, retry logic |
| API Gateway | Rate limiting, request validation, timeout |
| Backend | Try/catch with logging, graceful degradation |
| ML Service | Fallback to rule-based predictions if model fails |
| Database | Connection pooling, retry on transient failures |
| External APIs | Circuit breaker, cache fallback, retry with backoff |

### 15.2 Graceful Degradation

| Failure | Fallback |
|---|---|
| ML Service down | Use cached predictions + rule-based scoring |
| Weather API down | Use last known data + staleness indicator |
| LLM API down | Show structured data without narrative |
| Database down | Serve from Redis cache (read-only mode) |
| WebSocket disconnected | Auto-reconnect + HTTP polling fallback |

---

## 16. Monitoring & Observability

### 16.1 Monitoring Stack

| Tool | Purpose |
|---|---|
| Prometheus | Metrics collection |
| Grafana | Dashboard visualization |
| Sentry | Error tracking (Frontend + Backend) |
| Structured Logging (JSON) | Log aggregation |
| Health Check Endpoints | Service availability |

### 16.2 Key Metrics

| Metric | Type | Alert Threshold |
|---|---|---|
| API response time (p95) | Latency | > 1s |
| Error rate | Percentage | > 5% |
| ML inference time | Latency | > 10s |
| Database connection pool | Gauge | > 80% utilized |
| Redis memory usage | Gauge | > 80% |
| WebSocket connections | Gauge | > 1000 |
| Data pipeline lag | Latency | > 5 min |

---

## 17. Security Architecture

### 17.1 Security Layers

```
                    ┌─────────────────────────┐
                    │   Cloudflare / CDN       │  DDoS protection
                    │   WAF                    │  Web Application Firewall
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   TLS 1.3               │  Encryption in transit
                    │   HTTPS Only            │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Rate Limiting          │  API abuse prevention
                    │   CORS Policy            │  Origin restriction
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   JWT Authentication     │  Identity verification
                    │   RBAC Authorization     │  Access control
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Input Validation       │  Pydantic + Zod
                    │   SQL Injection Prev.    │  SQLAlchemy ORM
                    │   XSS Prevention         │  React auto-escaping
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Audit Logging          │  All critical actions
                    │   Data Encryption (rest) │  AES-256
                    └─────────────────────────┘
```

---

## 18. Performance Optimization

### 18.1 Frontend Performance

| Optimization | Technique |
|---|---|
| Code splitting | Next.js automatic page-level splitting |
| Lazy loading | Dynamic imports for heavy components (Map, Charts) |
| Image optimization | Next.js Image component + WebP |
| Map tile caching | Mapbox GL built-in tile cache |
| State management | TanStack Query caching + stale-while-revalidate |
| Bundle size | Tree-shaking, minimal dependencies |
| CSS | Tailwind v4 JIT (zero unused CSS) |

### 18.2 Backend Performance

| Optimization | Technique |
|---|---|
| Async I/O | FastAPI + asyncpg (fully async) |
| Connection pooling | SQLAlchemy async pool |
| Caching | Redis (risk scores, GeoJSON, session) |
| Spatial indexing | PostGIS GiST indexes |
| Query optimization | Materialized views for analytics |
| Pagination | Cursor-based pagination |
| Compression | Gzip middleware |

### 18.3 ML Service Performance

| Optimization | Technique |
|---|---|
| Model caching | Load models once on startup |
| Batch inference | Process multiple locations in one call |
| Result caching | Redis cache with TTL |
| Async processing | Background tasks for heavy computations |
| Model compression | ONNX export for faster inference |
