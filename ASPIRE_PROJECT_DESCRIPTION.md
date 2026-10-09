# ASPIRE — Comprehensive Project Architecture & Technical Description

> **Platform Name:** ASPIRE  
> **Subtitle:** AI-Powered Disaster Intelligence & Autonomous Decision-Support Platform  
> **Tagline:** *From Warning to Action.*  
> **Domain:** Artificial Intelligence · Geospatial Information Systems (GIS) · Emergency Operations · Multi-Hazard Risk Modeling  
> **Target Scale:** District, State, and National Disaster Management Frameworks (Pilot: Odisha Coastal Hazard Corridor)  

---

## 1. Executive Summary & Vision

### 1.1 The Fundamental Challenge
Natural catastrophes—cyclones, storm surges, catastrophic floods, extreme heatwaves, landslides, and seismic events—are escalating in frequency, intensity, and compounding severity. Modern meteorological institutions such as the India Meteorological Department (IMD) have made significant strides in atmospheric forecasting. However, **a critical chasm exists between meteorological early warning and tactical on-the-ground emergency execution**.

Legacy disaster management systems suffer from five systemic structural defects:
1. **Passive Observation vs. Actionable Intelligence:** Legacy tools merely monitor and plot sensors. They inform authorities that water is rising or winds are intensifying, but fail to compute *what will fail next*, *which communities are trapped*, or *how scarce assets must be deployed*.
2. **Fragmented Data Silos:** GIS mapping, hospital ICU telemetry, emergency vehicle GPS, civil shelter registries, and citizen distress calls exist across incompatible government departments without real-time data fusion.
3. **Manual Cognitive Overload:** Under extreme crisis stress, incident commanders must manually process hundreds of conflicting variables—road washouts, tidal surges, power failures, medical triage queues—leading to decision paralysis or delayed evacuations.
4. **Single-Hazard Blindness:** Standard tools analyze disasters in isolation. They fail to model **cascading failures**—for instance, how a cyclone surge inundates an electrical substation, which kills telecommunication towers, which blinds hospital oxygen generators, which isolates trauma wards.
5. **Disconnected Citizen Feedback Loops:** Citizens in the hazard zone are treated as passive recipients of delayed SMS broadcasts rather than active participants. There is no bidirectional real-time pipeline to intake citizen SOS beacons, verify ground realities, and route survivors to fortified shelters through safe, unflooded evacuation corridors.

### 1.2 The ASPIRE Paradigm Shift
**ASPIRE** (*Autonomous System for Predictive Intelligence & Response Execution*) transforms disaster management from a **reactive, post-event emergency scramble** into a **proactive, predictive, AI-orchestrated operational workflow**.

```
TRADITIONAL CRISIS PARADIGM:
Observation ───▶ Warning Broadcast ───▶ Manual Scramble ───▶ Fragmented Reaction

THE ASPIRE PARADIGM:
Observe ───▶ Predict (AI/ML) ───▶ Simulate (What-If) ───▶ Recommend (XAI) ───▶ Orchestrate (GIS/IoT) ───▶ Adapt (Real-Time)
```

ASPIRE operates across the entire six-phase disaster management lifecycle:
- **Phase 1: Multi-Hazard Mitigation:** Calculating baseline socio-economic vulnerability and structural exposure long before an event occurs.
- **Phase 2: Pre-Disaster Preparedness:** Positioning relief supplies, boats, and medical crews based on high-resolution probabilistic models.
- **Phase 3: Impact-Based Early Warning:** Converting raw satellite wind/rain vectors into granular human impact forecasts (demographics at risk, structural collapse probabilities).
- **Phase 4: Real-Time Tactical Response:** Instantaneous spatial dispatch of NDRF, fire services, and air ambulances via dynamic Dijkstra evacuation engines.
- **Phase 5: Relief & Logistics Coordination:** Automated supply chain balancing for cyclone shelters, preventing overcrowding and resource exhaustion.
- **Phase 6: Cascading Recovery Planning:** Post-impact infrastructure dependency restoration tracking and damage assessment.

---

## 2. Domain & Geographic Context: The Odisha Hazard Corridor

### 2.1 The Laboratory: Why Odisha?
The State of Odisha, flanking the northwestern Bay of Bengal, represents the world's most critical natural laboratory for disaster management:
- **Historical Cyclone Vulnerability:** From the catastrophic 1999 Super Cyclone (05B) that claimed ~10,000 lives to Extremely Severe Cyclonic Storm Fani (2019) and Cyclone Yaas (2021), the coastal belt (Puri, Jagatsinghpur, Kendrapara, Ganjam, Cuttack) faces immense tidal surges and 200+ km/h sustained cyclonic gales.
- **Complex Deltaic Hydrology:** The Mahanadi, Daya, Devi, and Bhargavi river basins converge with the Bay of Bengal and Chilika Lagoon, creating complex backwater flooding where high tides prevent river drainage, leading to rapid catastrophic inundations.
- **Global Benchmark of Institutional Resilience:** The Odisha State Disaster Management Authority (OSDMA) pioneered community evacuation networks. ASPIRE builds directly upon this institutional foundation, introducing next-generation autonomous AI intelligence to augment OSDMA, NDMA, and NDRF operations.

### 2.2 Multi-Hazard Taxonomy Handled by ASPIRE

| Hazard Type | Primary Physical Metrics | Physical Impact Modeled | AI / Analytical Engine |
|---|---|---|---|
| **Tropical Cyclone** | Sustained wind velocity (km/h), central barometric pressure (hPa), landfall trajectory coordinates, radius of maximum winds (RMW). | Wind-shear structural damage, tree/powerline collapse, coastal erosion. | Landfall probability cone prediction, wind damage fragility curves. |
| **Storm Surge & Coastal Inundation** | Peak surge height (meters above astronomical tide), bathymetry, tidal wave runup, coastal elevation contours. | Marine seawater flooding into inland settlements, breach of saline embankments. | 2D hydrodynamic surge projection, digital elevation model (DEM) intersection. |
| **Riverine & Urban Floods** | Precipitation volume (mm/hr), river gauge discharge rate ($m^3/s$), drainage capacity, soil moisture saturation. | Submersion of residential wards, road washouts, water treatment contamination. | Hydrological runoff estimation, catchment area accumulation models. |
| **Extreme Heatwaves** | Wet-bulb temperature ($T_w$), heat index ($°C$), relative humidity, urban heat island (UHI) indices. | Heat stroke morbidity, power grid transformer burnout, emergency ICU saturation. | Physiological thermal stress equations, hospital admissions surge forecasting. |
| **Landslides & Debris Flow** | Slope steepness angle ($°$), 48-hour cumulative rainfall (mm), soil cohesion, geological fault proximity. | Hillside structural shear, highway corridor blockage, river damming. | Infinite slope geotechnical stability equation, debris runout zone buffers. |
| **Earthquakes** | Richter magnitude ($M_w$), hypocentral depth (km), Peak Ground Acceleration (PGA in $g$), soil liquefaction potential. | Multi-story building collapse, bridge failure, underground pipeline rupture. | USGS ShakeMap attenuation attenuation relationships, structural collapse hazard matrices. |

---

## 3. Core Mathematical Models & Algorithmic Engines

At the heart of ASPIRE are rigorous mathematical models that process live telemetry, satellite datasets, and spatial geometries to deliver explainable, deterministic intelligence.

### 3.1 The Composite Disaster Risk Index (CDRI)
Rather than evaluating hazard magnitude alone, ASPIRE computes an unified, normalized score ($CDRI \in [0.0, 1.0]$) for every administrative ward, village, and 500m spatial grid cell:

$$CDRI = \alpha \cdot H(t) + \beta \cdot V + \gamma \cdot E(t) - \delta \cdot C(t)$$

Where:
- $\mathbf{H(t)}$ **(Hazard Probability & Intensity):** Time-varying normalized hazard severity (e.g., wind gust factor, flood depth, seismic PGA).
- $\mathbf{V}$ **(Socio-Physical Vulnerability):** Inherent baseline susceptibility:
  $$V = w_1 \cdot \text{Kutcha Housing Ratio} + w_2 \cdot \text{Elderly/Infant Ratio} + w_3 \cdot \text{Poverty Index} + w_4 \cdot \text{Elevation Deficit}$$
- $\mathbf{E(t)}$ **(Dynamic Exposure):** Absolute count of human lives, critical structures, and economic assets present within the active hazard polygon at timestamp $t$.
- $\mathbf{C(t)}$ **(Coping & Defense Capacity):** Active defensive factors including distance to cyclone shelters, operational flood bunds, available emergency personnel, and auxiliary power supplies.
- $\alpha, \beta, \gamma, \delta$ are calibrated weighting hyperparameters constrained such that $\sum = 1.0$.

Zones with $CDRI \ge 0.80$ trigger autonomous **Critical Tier-1 Response Protocols**.

### 3.2 The Cascading Infrastructure Failure Graph Engine
Real-world disasters create ripple effects across interconnected municipal networks. ASPIRE models the urban landscape as a **Directed Acyclic Dependency Graph** $G = (V, E)$, where each vertex $v \in V$ represents a critical facility, and directed edges $(u, v) \in E$ represent operational dependencies.

```
┌─────────────────────────────────┐
│ Power Substation (400kV Grid)   │
└────────────────┬────────────────┘
                 │ (Power Delivery)
         ┌───────┴───────┐
         ▼               ▼
┌──────────────────┐  ┌─────────────────────────┐
│ Cellular Telecom │  │ Water Treatment Plant   │
│ Transmission Mast│  │ & Booster Pumps         │
└────────┬─────────┘  └──────────┬──────────────┘
         │ (Emergency Comms)     │ (Water Supply)
         ▼                       ▼
┌───────────────────────────────────────────────┐
│ Regional Trauma Hospital / ICU               │
│ • Dependent on Grid Power (Secondary: GenSet) │
│ • Dependent on Potable Water                  │
│ • Dependent on Cellular Dispatch              │
└───────────────────────────────────────────────┘
```

The probability of failure for dependent node $v$ given the collapse of supplier nodes $Parents(v)$ is modeled using a sigmoid propagation function:

$$P(Failure_v | Parents) = \sigma \left( \sum_{u \in Parents(v)} w_{uv} \cdot I(Failure_u) - \theta_v \cdot BackupCapacity_v \right)$$

This allows ASPIRE to predict that **a flood reaching an electrical substation will result in hospital oxygen generator failure in exactly 4.2 hours**, prompting early diesel tanker dispatch before road inundation occurs.

### 3.3 Dynamic Multimodal Safe Evacuation Engine
Evacuating hundreds of thousands of citizens ahead of a storm requires route calculations that adapt to rapidly changing water levels and road closures. ASPIRE uses a modified **Time-Expanded A\* / Dijkstra Graph Algorithm** with dynamic environmental edge costs:

$$Cost(e, t) = Length(e) \times \left[ 1 + \lambda_{water} \cdot \Phi_{depth}(e, t) + \lambda_{debris} \cdot \Omega_{block}(e) + \lambda_{surge} \cdot \Psi_{traffic}(e, t) \right]$$

Where:
- $\Phi_{depth}(e, t)$: Projected flood water depth on road edge $e$ at time $t$. If depth exceeds vehicle threshold (e.g., $0.3m$ for standard transport, $0.8m$ for high-clearance NDRF trucks), the edge weight approaches $\infty$ (impassable).
- $\Omega_{block}(e)$: Probability of fallen trees or downed powerlines based on local sustained wind speeds exceeding 80 km/h.
- $\Psi_{traffic}(e, t)$: Real-time vehicle density bottleneck factor calculated from GPS traces.

The algorithm dynamically computes safe, elevated bypass corridors and provides turn-by-turn guidance to both citizen apps and convoy commanders.

### 3.4 Multi-Resource Fleet Allocation (MILP / VRP with Time Windows)
Emergency resources (inflatable rescue boats, Advanced Life Support ambulances, Mi-17 heavy-lift helicopters, water purification tankers, trauma medical teams) are strictly finite. ASPIRE solves the **Vehicle Routing Problem with Time Windows and Priority Penalties (VRPTW-P)**:

$$\min \sum_{k \in Fleets} \sum_{i, j \in Nodes} c_{ij} x_{ijk} + \sum_{i \in SOS} \mu_i \cdot \text{AcuityLevel}_i \cdot \text{DelayTime}_i$$

Subject to:
1. Every critical SOS distress beacon ($Acuity = 5$, life threat) is visited within the maximum medical survival window ($t_{arrival} \le t_{critical}$).
2. Boat draft depth limits: Boat routes cannot traverse water shallower than $0.5m$ or dry roads.
3. Fuel and vehicle capacity limits: Passenger evacuations cannot exceed vehicle gross weight thresholds.

### 3.5 Exponential Shelter & Hospital Surge Prediction
To prevent secondary humanitarian catastrophes where shelters run out of food/water or hospitals suffer complete ICU saturation, ASPIRE models influx rates using an **adaptive logistic surge curve**:

$$Occupancy(t) = \frac{Capacity_{max}}{1 + e^{-k(t - t_{peak})}}$$

When the 2-hour projected occupancy crosses **80% (Warning)** or **90% (Critical Saturation)**, ASPIRE autonomously executes rerouting recommendations, diverting incoming transport convoys to secondary designated shelter facilities before gridlock occurs.

---

## 4. Full-Stack System Architecture & Technology Stack

ASPIRE is architected as an ultra-reliable, high-throughput, cloud-native distributed system designed for zero-downtime operations even during catastrophic infrastructure stress.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT PRESENTATION TIER                                  │
│                                                                                             │
│  ┌─────────────────────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ UNIFIED COMMAND CENTER (Desktop / Operations)   │  │ CITIZEN LIFE-SAFETY PWA (Mobile) │  │
│  │ • Next.js 16 (App Router) + React 19            │  │ • Next.js 16 Mobile Responsive   │  │
│  │ • Mapbox GL JS v3 (3D Globe + Atmospheric Fog)  │  │ • Offline-First Service Worker   │  │
│  │ • Deck.gl (ArcLayer, TripsLayer Flow Arcs)      │  │ • Single-Tap Geolocation SOS     │  │
│  │ • Tailwind CSS v4 + Dark Globe Design System    │  │ • Low-Bandwidth SVG Safe Routes  │  │
│  │ • Framer Motion Micro-Interactions              │  │ • Multilingual (Odia/Hindi/Eng)  │  │
│  │ • Zustand Domain State Stores                   │  │ • IndexedDB Offline Cache        │  │
│  └────────────────────────┬────────────────────────┘  └────────────────┬─────────────────┘  │
└───────────────────────────┼────────────────────────────────────────────┼────────────────────┘
                            │ HTTPS / Secure WebSockets (WSS)            │
                            ▼                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          EDGE GATEWAY & BACKEND-FOR-FRONTEND (BFF)                          │
│                                                                                             │
│   Next.js API Edge Routes (V8 Runtime)                                                      │
│   • Multi-Tenant JWT / Session Validation  • Dynamic Rate Limiting (Redis Token Bucket)     │
│   • Request Payload Sanitization (Zod)     • Upstream Microservice Reverse Proxy            │
└───────────────────────────┬────────────────────────────────────────────┬────────────────────┘
                            │                                            │
               Internal RPC │ REST JSON                     Internal WSS │ Pub/Sub
                            ▼                                            ▼
┌──────────────────────────────────────────────────┐  ┌───────────────────────────────────────┐
│          CORE BACKEND SERVICE (FastAPI)          │  │       REAL-TIME EVENT BUS & PUB/SUB   │
│                                                  │  │                                       │
│   Python 3.11+ Asynchronous Engine (AsyncIO)     │  │   Redis 7 Streams + Socket.io Server  │
│   • Disaster Event Management Engine             │  │   • Sub-100ms SOS Ticket Broadcasts   │
│   • Spatial GeoJSON Aggregation & Buffering      │  │   • Live GPS Asset Fleet Telemetry    │
│   • Common Alerting Protocol (CAP-IN XML) Engine │  │   • Immediate Inundation Layer Pushes │
│   • Shelter & Hospital Inventory Controllers     │  │   • Bi-directional WebRTC / Data Pings│
└───────────────────────────┬──────────────────────┘  └──────────────────┬────────────────────┘
                            │                                            │
                            ▼                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE & SPATIAL DATA TIER                               │
│                                                                                             │
│   PostgreSQL 16 + PostGIS 3.4 (Relational & Spatial Core)                                   │
│   • 26 Production Tables with Foreign Key Constraints & Cascade Triggers                    │
│   • Geometry Primitives: GEOMETRY(Point, 4326), GEOMETRY(Polygon, 4326)                     │
│   • Spatial GIST Indexing (`ST_DWithin`, `ST_Contains`, `ST_Intersects`, `ST_ClusterKMeans`)│
│                                                                                             │
│   Redis 7 Distributed Cache & Spatial Index                                                 │
│   • Geospatial commands (`GEOADD`, `GEORADIUSBYMEMBER` for nearest rescue unit lookup)      │
│   • High-frequency in-memory session caches and query result memoization                    │
└───────────────────────────┬─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI / ML & DECISION INTELLIGENCE SUITE                          │
│                                                                                             │
│   Machine Learning Pipeline:                                                                │
│   • XGBoost / LightGBM Multi-Hazard Inundation & Risk Predictor                             │
│   • SHAP Explainer Engine (Feature attribution for human-in-the-loop validation)            │
│   • Scikit-Learn Clusterers for SOS Density Hotspot Detection                               │
│   • NetworkX Graph Engine for Cascading Infrastructure Dependency Modeling                  │
│                                                                                             │
│   Large Language Model (LLM) Emergency Copilot:                                             │
│   • Google Gemini 1.5 Pro / Flash & Groq LLaMA-3 70B via Function Calling                   │
│   • Automated ITU-T X.1303 CAP Alert Generation in English, Hindi, and Odia                 │
│   • Unstructured Voice/SMS SOS Triage & Medical Entity Extraction                           │
│   • Executive Situation Report (SITREP) Generation for Chief Secretary / Collectors         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Visual Design System: The Dark Globe Aesthetic

The visual language of ASPIRE is purpose-built for high-pressure, 24/7 crisis operations rooms. It avoids cluttered enterprise dashboards, adopting a **"show, don't tell" product-led design philosophy** rooted in visual storytelling.

### 5.1 Color Tokens & Luminance Hierarchy

| Token Name | Hex / CSS Value | Semantic Purpose |
|---|---|---|
| `--bg-0` | `#05070D` | Deep space background behind 3D Earth globe. |
| `--bg-1` | `#0A0E17` | Base background for operational screens. |
| `--rail` | `#1B1A33` | Deep navy-purple icon rail (64px width). |
| `--panel` | `rgba(16, 22, 36, 0.72)` | Frosted glass card surface with `backdrop-blur(18px)`. |
| `--panel-2` | `#161D2E` | Inner wells, inputs, and secondary table rows. |
| `--border` | `rgba(255, 255, 255, 0.08)` | Subtle 1px structural glass borders. |
| `--border-hi` | `rgba(255, 255, 255, 0.14)` | Card hover highlight border. |
| `--blue` | `#3B6CFF` | Primary action accent, active tabs, telemetry highlights. |
| `--atmos` | `#4FB3FF` | Atmospheric rim glow surrounding the 3D globe. |
| `--low` | `#2FD07F` | Low hazard severity, safe evacuation status, stable resource. |
| `--medium` | `#F5C542` | Medium risk, warning state, moderate shelter occupancy. |
| `--high` | `#FF8A3D` | High danger, severe inundation risk, rerouting active. |
| `--critical` | `#FF4D5E` | Immediate life-safety emergency, SOS beacon, structural breach. |

### 5.2 The 3D Digital Twin Hero
The operational center stage is anchored by a **3D Night Earth Globe** rendered via Mapbox GL JS (`projection: 'globe'`) and high-performance WebGL:
- **Atmospheric Scattering:** Implemented using Mapbox `setFog` with a deep blue horizon blend (`space-color: rgb(5, 7, 13)`, `high-color: rgb(36, 92, 223)`).
- **Noctilucent City Lights:** High-resolution nighttime city lights visualize population density hubs.
- **Orbital Flow Arcs:** Rendered using deck.gl `ArcLayer` to illustrate real-time resource transit vectors and air evacuation corridors.
- **Pulsing Landfall Beacon:** High-intensity animated radar concentric rings (`.pulse-beacon`) tracking the cyclone eye and predicted coastal landfall point (Puri Coastal Sector: `19.81°N, 85.83°E`).
- **Seamless 3D/2D Transition:** One-click instant camera transform between global orbital overview and street-level 2D GIS vector contours.

### 5.3 Bento Grid & Visual Storytelling ("Show, Don't Tell")
Rather than dense text tables, information is conveyed through instant mini-visuals:
1. **One Feature = One Mini Visual = One Benefit Title = One Sentence:**
   - *Example:* Instead of an "Analytics Module Table", a card features a glowing green sparkline titled **"Track affected lives in real time"** with the caption *"Continuous sensor feeds calculate real-time coastal hazard exposure."*
2. **Progressive Disclosure:** Simple, uncluttered overview states expand into detailed granular telemetry on click or hover.
3. **Dual Circular SVG Ring Gauges:** Custom zero-dependency SVG rings tracking shelter occupancy (`78.4%`) and ICU surge capacity (`84.1%`) with tabular numeric readouts.

---

## 6. End-to-End Data Pipeline & Entity Schemas

ASPIRE is powered by a normalized relational database schema extended with PostGIS spatial types, tracking every facet of an emergency.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Disasters    │1     *│      Zones      │1     *│   SOS Tickets   │
│ (Storm Physics) ├───────┤ (Wards & CDRI)  ├───────┤ (Citizen Beacons│
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │1                        │1                        │*
         │*                        │*                        │1
┌────────┴────────┐       ┌────────┴────────┐       ┌────────┴────────┐
│  CAP Alerts     │       │ Evacuation Hubs │       │ Rescue Assets   │
│ (Common Alert)  │       │ (Shelters & ICU)│       │ (Boats & Teams) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 6.1 Core Database Entities & Field Specifications

#### 1. `disasters` (Disaster Events Master)
- `id` (UUID, Primary Key)
- `name` (VARCHAR, e.g. "Cyclone Fani-II")
- `type` (ENUM: `cyclone`, `flood`, `heatwave`, `landslide`, `earthquake`)
- `severity` (ENUM: `low`, `medium`, `high`, `critical`)
- `status` (ENUM: `warning`, `active`, `receding`, `closed`)
- `center_point` (`GEOMETRY(Point, 4326)`)
- `impact_polygon` (`GEOMETRY(Polygon, 4326)`)
- `telemetry_data` (JSONB: Sustained wind speed, central pressure, rainfall rate, wave height)
- `landfall_eta` (TIMESTAMP WITH TIME ZONE)

#### 2. `zones` (Administrative Spatial Units & CDRI Metrics)
- `id` (UUID, Primary Key)
- `district` (VARCHAR, e.g. "Puri")
- `ward_name` (VARCHAR, e.g. "Marine Drive Coastal Ward 4")
- `boundary` (`GEOMETRY(MultiPolygon, 4326)`, GIST Indexed)
- `population_total` (INTEGER, e.g. 284,500)
- `vulnerability_score` (DECIMAL, 0.0 to 1.0)
- `exposure_score` (DECIMAL, 0.0 to 1.0)
- `coping_capacity` (DECIMAL, 0.0 to 1.0)
- `cdri_score` (DECIMAL, Computed real-time risk index)
- `evacuated_count` (INTEGER, e.g. 137,000)
- `remaining_count` (INTEGER, e.g. 147,500)

#### 3. `sos_tickets` (Citizen Emergency Distress Pipeline)
- `id` (UUID, Primary Key)
- `requester_name` (VARCHAR)
- `phone_number` (VARCHAR)
- `location` (`GEOMETRY(Point, 4326)`, GIST Indexed)
- `address_landmark` (TEXT)
- `people_count` (INTEGER)
- `has_elderly` / `has_infants` / `has_pregnant` / `has_medical_emergency` (BOOLEAN)
- `acuity_level` (INTEGER, 1 to 5, where 5 is immediate life threat)
- `status` (ENUM: `received`, `triaged`, `assigned`, `en_route`, `rescued`, `cancelled`)
- `assigned_unit_id` (UUID, Foreign Key to `resources`)
- `created_at` / `updated_at` (TIMESTAMP)

#### 4. `shelters` (Evacuation Safety Centers)
- `id` (UUID, Primary Key)
- `name` (VARCHAR, e.g. "Puri Cyclone Shelter Hub #3")
- `location` (`GEOMETRY(Point, 4326)`)
- `total_capacity` (INTEGER, e.g. 2,500)
- `current_occupancy` (INTEGER, e.g. 1,960)
- `occupancy_percentage` (DECIMAL, Computed e.g. 78.4%)
- `has_generator` / `has_water_filtration` / `has_medical_staff` (BOOLEAN)
- `food_ration_days` (DECIMAL)
- `structural_safety_rating` (VARCHAR: `Grade-A Fortified`)

#### 5. `hospitals` (Medical Facilities & ICU Surge)
- `id` (UUID, Primary Key)
- `name` (VARCHAR, e.g. "Puri District Headquarters Hospital")
- `location` (`GEOMETRY(Point, 4326)`)
- `total_beds` (INTEGER)
- `available_beds` (INTEGER)
- `icu_capacity` (INTEGER)
- `icu_occupied` (INTEGER)
- `icu_surge_percentage` (DECIMAL, Computed e.g. 84.1%)
- `oxygen_reserve_hours` (DECIMAL)
- `flood_isolation_risk` (ENUM: `low`, `moderate`, `critical_high`)
- `backup_generator_fuel_hours` (DECIMAL)

#### 6. `resources` (Tactical Fleets & Rescue Asset Tracking)
- `id` (UUID, Primary Key)
- `name` (VARCHAR, e.g. "NDRF Boat Squad Bravo-3")
- `category` (ENUM: `boat`, `ambulance`, `helicopter`, `tanker`, `ndrf_squad`, `trauma_team`)
- `agency` (ENUM: `NDRF`, `ODRAF`, `FireService`, `IndianNavy`, `RedCross`)
- `current_location` (`GEOMETRY(Point, 4326)`)
- `assigned_zone_id` (UUID, Foreign Key to `zones`)
- `status` (ENUM: `ready`, `dispatched`, `on_mission`, `maintenance`)
- `utilization_rate` (DECIMAL, 0% to 100%)
- `capacity_persons` (INTEGER)
- `eta_minutes` (INTEGER)

#### 7. `cap_alerts` (Common Alerting Protocol ITU-T X.1303 Dispatches)
- `id` (UUID, Primary Key)
- `identifier` (VARCHAR, Unique Alert URI)
- `sender` (VARCHAR, e.g. "in.gov.osdma.crisis-command")
- `sent_timestamp` (TIMESTAMP)
- `status` (ENUM: `actual`, `exercise`, `system`)
- `msg_type` (ENUM: `alert`, `update`, `cancel`)
- `scope` (ENUM: `public`, `restricted`)
- `category` (ENUM: `geo`, `met`, `safety`, `rescue`)
- `urgency` (ENUM: `immediate`, `expected`)
- `severity` (ENUM: `extreme`, `severe`, `moderate`)
- `certainty` (ENUM: `observed`, `likely`)
- `headline` (TEXT)
- `description` (TEXT)
- `instruction` (TEXT)
- `area_polygon` (`GEOMETRY(Polygon, 4326)`)
- `translations` (JSONB: Full multi-lingual payloads in Odia, Hindi, and English)

---

## 7. Artificial Intelligence & Large Language Model (LLM) Integration

ASPIRE does not use AI as a superficial chatbot. It leverages deep predictive models, explainable ML, and LLMs as an **Autonomous Operational Copilot**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RAW TELEMETRY INPUTS                             │
│  Weather APIs · Satellite Inundation · River Gauges · Citizen SOS Beacons   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ML PREDICTIVE INFERENCE                            │
│                                                                             │
│   XGBoost Hazard Predictor                 Cascading Failure Simulator      │
│   • Multi-hazard spatial risk scores       • Power ➔ Comms ➔ Hospital DAG   │
│   • 24h/48h/72h inundation boundaries      • Secondary failure probabilities│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPLAINABLE AI LAYER (XAI)                         │
│                                                                             │
│   SHAP (SHapley Additive exPlanations) Attribution                          │
│   • Proves WHY a ward is Critical: (42% Surge + 31% Low Elevation + 27% Pop)│
│   • Auditable decision-support trail for incident commanders                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LLM OPERATIONAL COPILOT (Gemini / Groq)               │
│                                                                             │
│   Structured Tool Calling:                                                  │
│   1. generate_cap_alert(hazard, polygon, severity) ➔ ITU-T X.1303 XML       │
│   2. draft_executive_sitrep(incident_kpis) ➔ Standard OSDMA Cabinet Brief    │
│   3. triage_unstructured_sos(audio/sms) ➔ Extract Lat/Lng, Headcount, Acuity│
│   4. recommend_resource_dispatch(sos_cluster, fleet) ➔ Optimal Route Plan   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Explainable Multi-Hazard Risk Scoring (SHAP)
Decision-makers in emergency management cannot rely on opaque black-box models. Every risk recommendation generated by ASPIRE includes a **SHAP Feature Attribution Envelope**:
```json
{
  "zone_id": "puri-sector-4",
  "cdri_score": 0.88,
  "classification": "CRITICAL",
  "explanation": {
    "top_contributing_factors": [
      { "factor": "Coastal Surge Inundation Depth", "contribution_percentage": 42.4 },
      { "factor": "Sub-Sea-Level Topographical Elevation", "contribution_percentage": 28.6 },
      { "factor": "Kutcha Non-Engineered Roofing Ratio", "contribution_percentage": 18.2 },
      { "factor": "Geriatric / Infant Demographic Density", "contribution_percentage": 10.8 }
    ],
    "actionable_recommendation": "Priority evacuation required for 14,200 residents in sub-sector 4B within 180 minutes before flood depth exceeds 0.8m."
  }
}
```

### 7.2 Automated CAP-IN Alert Generation
When hazard boundaries are approved by the Commander, the LLM copilot autonomously constructs compliant **Common Alerting Protocol (ITU-T X.1303 / CAP-IN)** XML feeds:
- Emits standardized severity, urgency, and polygon boundaries.
- Simultaneously generates identical instructions in **Odia**, **Hindi**, and **English**.
- Formats payloads for direct distribution to telecommunication cellular broadcast gateways, siren sirens, and mobile push notification servers.

### 7.3 Multi-Channel Unstructured SOS Triage
During intense crises, citizens communicate distress via panicky voice notes, SMS, and fragmented WhatsApp texts. ASPIRE routes these through an audio transcription (Whisper) and LLM entity extraction pipeline:
- Extracts exact geographical landmarks ("stranded near Batamangala Temple roof").
- Identifies headcount and critical vulnerability flags (e.g., "diabetic grandmother without insulin").
- Normalizes coordinates against GIS gazetteers and creates a prioritized `sos_tickets` record in $< 1.5$ seconds.

---

## 8. Citizen Life-Safety & Community Resilience Ecosystem

ASPIRE recognizes that disaster response succeeds or fails at the community level. The platform provides a dedicated, high-performance **Citizen Experience**:

### 8.1 Offline-First Progressive Web App (PWA)
Cellular towers frequently fail during extreme cyclones. The citizen interface is engineered as an offline-first PWA:
- **Service Worker Caching:** Critical application shell, offline shelter database, and vector maps of the home district are cached locally in IndexedDB.
- **Ultra-Compact SMS / Mesh Beacon Fallback:** If internet connectivity drops, the single-tap SOS button compresses the user's GPS coordinates, headcount, and medical status into an encrypted **compact SMS string (<160 characters)** transmitted to local emergency gateway numbers.

### 8.2 Safe Route & Shelter Navigation
Citizens do not need a confusing satellite map; they need unambiguous directions to safety:
- **Nearest Safe Shelter Matching:** Computes the closest shelter that currently has available capacity ($Occupancy < 90\%$) and is reachable via non-submerged roads.
- **Turn-by-Turn Hazard Avoidance:** Real-time routing highlights submerged streets in red and safe elevated corridors in glowing green.
- **Crowdsourced Ground Incident Reporting:** Citizens can submit geotagged photos of road washouts, fallen high-voltage cables, or embankment breaches. A clustering consensus algorithm aggregates multiple reports from the same radius to verify authenticity before updating the global GIS routing graph.

---

## 9. Security, Governance, Resilience & Reliability Engineering

Because ASPIRE is a mission-critical civil defense platform, it adheres to rigorous national cybersecurity standards:

### 9.1 Multi-Tier Role-Based Access Control (RBAC)

| Role | Access Tier | Permitted Operations |
|---|---|---|
| **District Collector / Crisis Commander** | Tier 1 (Executive Command) | Issue public CAP alerts, trigger sirens, reallocate cross-district NDRF units, override AI dispatch. |
| **Emergency Operations Center (EOC) Operator** | Tier 2 (Tactical Dispatch) | Triage SOS tickets, assign ambulances and boats, update shelter bed counts, monitor telemetry. |
| **Field Response Leader (NDRF / ODRAF)** | Tier 3 (Field Execution) | Receive assigned tickets, update unit GPS telemetry, report arrival/rescue completion, request backup. |
| **Medical / Hospital Administrator** | Tier 4 (Health Logistics) | Update available beds, ICU ventilator status, oxygen hours, request medical supply transfers. |
| **Citizen (Public User)** | Tier 5 (Civilian Access) | Submit SOS distress beacons, track personal rescue status, report hazards, view public shelter maps. |

### 9.2 Reliability & Fault-Tolerance Standards
- **Zero-Downtime High-Availability:** Multi-region active-active cloud deployment with edge points of presence ensures the platform remains operational even if a primary regional datacenter is impacted by the disaster.
- **Graceful Network Degradation:** Under low bandwidth (2G/EDGE), the client automatically disables satellite raster imagery and 3D globe meshes, falling back to a featherlight monochromatic 2D vector wireframe requiring $<15 \text{ KB}$ per operational update.
- **Cryptographic Auditability:** Every command action—alert dispatches, siren triggers, resource diversions—is immutably logged with user cryptographic signatures, creating an unalterable post-disaster accountability record.

---

## 10. Operational Impact & Key Performance Indicators (KPIs)

ASPIRE measures its success through quantifiable life-safety metrics:

| Key Performance Indicator | Legacy Baseline | Target Under ASPIRE Platform |
|---|---|---|
| **Early Evacuation Decision Window** | Landfall - 12 hours | **Landfall - 36 to 48 hours** |
| **SOS Distress Triage to Fleet Dispatch** | 45 to 90 minutes (Manual voice logs) | **< 3 minutes (Autonomous routing)** |
| **Evacuation Corridor Congestion Delays** | Frequent highway gridlocks | **70% reduction via dynamic routing** |
| **Shelter Supply & Capacity Overcrowding** | Widespread localized shortages | **Zero stockouts via automated surge load balancing** |
| **Cascading Power-to-Hospital Outages** | Reactive response after blackout | **100% pre-alerted with generator fuel pre-positioned** |
| **Civilian Population Reached by CAP Alerts** | ~35% within 1 hour | **> 92% within 90 seconds (Multi-channel push/SMS)** |

---

## 11. Summary: From Warning to Action

**ASPIRE is not merely another dashboard—it is an autonomous digital twin of disaster operations.** 

By synthesizing real-time satellite physics, spatial GIS graphs, cascading infrastructure modeling, and explainable artificial intelligence, ASPIRE equips incident commanders with the foresight to act before catastrophe strikes. From the command center's glowing 3D Earth globe to the stranded villager's single-tap offline SOS beacon, ASPIRE connects every echelon of emergency response into a unified, life-saving operational reflex.

> **ASPIRE:** *Predicting the Hazard. Protecting the Citizen. Powering the Response.*
