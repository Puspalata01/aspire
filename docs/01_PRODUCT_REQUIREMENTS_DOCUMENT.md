# ASPIRE — Product Requirements Document (PRD)

> **AI-Powered Disaster Intelligence & Response Platform**
> **Tagline:** *From Warning to Action.*

**Version:** 1.0
**Last Updated:** October 2026
**Product Category:** AI + GIS + Disaster Management + Decision Support System
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Mission](#2-product-vision--mission)
3. [Target Users & Personas](#3-target-users--personas)
4. [Feature Matrix — Complete](#4-feature-matrix--complete)
5. [User Stories & Acceptance Criteria](#5-user-stories--acceptance-criteria)
6. [Priority & Phased Delivery](#6-priority--phased-delivery)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics & KPIs](#8-success-metrics--kpis)
9. [Assumptions & Constraints](#9-assumptions--constraints)
10. [Glossary](#10-glossary)

---

## 1. Executive Summary

ASPIRE is an AI-powered, GIS-enabled disaster intelligence and decision-support platform. It transforms raw disaster data into actionable intelligence for government authorities and citizens. Unlike traditional disaster management systems that only monitor and alert, ASPIRE **predicts, analyzes, recommends, simulates, optimizes, and coordinates** disaster response in real-time.

### Core Value Proposition

> Don't just tell authorities that a disaster is happening. Help them understand **what will happen next** and **what they should do about it**.

### The Shift

| Traditional Systems | ASPIRE |
|---|---|
| Alert → Reaction | Observe → Predict → Decide → Act → Adapt |
| Fragmented data | Unified intelligence |
| Manual decisions | AI-assisted recommendations |
| Static maps | Dynamic GIS + real-time overlays |
| Single hazard view | Multi-hazard + cascading chains |
| No citizen feedback loop | Citizen intelligence integration |

---

## 2. Product Vision & Mission

### Vision
Transform disaster management from a largely **reactive process** into a **proactive, AI-driven decision-support workflow** that helps save lives, reduce damage, and improve emergency response.

### Mission
Build a unified platform that integrates data, artificial intelligence, GIS, predictive analytics, simulation, citizen intelligence, and emergency resource management to provide governments and response agencies with actionable disaster intelligence.

### One-Line Pitch
> An AI-powered Disaster Intelligence & Decision Support Platform that combines real-time data, GIS, and explainable AI to predict risks, optimize emergency resources, and enable faster, smarter disaster response.

---

## 3. Target Users & Personas

### 3.1 Persona: Authority User (Government / Emergency Operations)

| Attribute | Detail |
|---|---|
| **Role** | District Collector, EOC Operator, Fire & Rescue Chief, Medical Response Lead |
| **Goals** | Monitor live conditions, understand risk, allocate resources, plan evacuations, coordinate response |
| **Pain Points** | Fragmented information across systems, manual prioritization under time pressure, limited predictive capability |
| **Key Actions** | View AI risk scores, run what-if scenarios, allocate resources, monitor shelters/hospitals, review AI recommendations |

### 3.2 Persona: Citizen User

| Attribute | Detail |
|---|---|
| **Role** | Resident in disaster-prone area |
| **Goals** | Stay safe, find shelter, get rescued, receive accurate alerts |
| **Pain Points** | Delayed/generic alerts, no nearby shelter info, no safe route guidance, difficulty reporting emergencies |
| **Key Actions** | Check personal risk, find shelters, find safe routes, send SOS, report incidents, read emergency guidance |

### 3.3 Persona: System Administrator

| Attribute | Detail |
|---|---|
| **Role** | Platform admin, data engineer |
| **Goals** | Maintain system health, manage data pipelines, monitor model performance |
| **Key Actions** | Monitor API health, manage users, configure data sources, review model accuracy |

---

## 4. Feature Matrix — Complete

### 4.1 Interactive Disaster Intelligence Map

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| MAP-001 | Base Map Rendering | 2D/3D interactive map with satellite imagery & terrain | P0 |
| MAP-002 | Layer Controls | Toggle hazard layers (flood, cyclone, heatwave, landslide, earthquake) | P0 |
| MAP-003 | Zoom/Pan/Rotate | Full navigation controls with smooth animations | P0 |
| MAP-004 | Risk Heatmaps | Color-coded overlays showing risk intensity by area | P0 |
| MAP-005 | Population Density Layer | Display population density to identify exposure | P1 |
| MAP-006 | Shelter Markers | Show shelter locations with capacity/occupancy info | P0 |
| MAP-007 | Hospital Markers | Show hospitals with accessibility & isolation risk | P0 |
| MAP-008 | Road Network Layer | Roads with blockage status & accessibility indicators | P0 |
| MAP-009 | SOS Hotspot Overlay | Citizen SOS request clustering visualization | P1 |
| MAP-010 | Resource Deployment Layer | Show resource positions and deployment routes | P1 |
| MAP-011 | 2D/3D Toggle | Switch between 2D and 3D visualization modes | P1 |
| MAP-012 | Historical Timeline Slider | Scrub through historical data on map | P2 |
| MAP-013 | Weather Overlay | Real-time weather conditions on map | P1 |
| MAP-014 | Predicted Impact Zones | Show AI-predicted future impact areas | P0 |
| MAP-015 | Disaster Polygon Overlay | Show active disaster boundaries | P0 |
| MAP-016 | Multi-Hazard Overlay | Display overlapping hazards simultaneously | P1 |
| MAP-017 | Location Inspector | Click any location for detailed risk/impact panel | P0 |

### 4.2 Real-Time Disaster Monitoring

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| MON-001 | Weather Data Ingestion | Continuous weather API data collection | P0 |
| MON-002 | Disaster Event Detection | Auto-detect emerging disaster events | P0 |
| MON-003 | Alert Generation | Generate severity-based alerts | P0 |
| MON-004 | Live Status Dashboard | Real-time KPI display (active events, risk levels) | P0 |
| MON-005 | Data Source Health Monitoring | Track health of connected data sources | P2 |
| MON-006 | Sensor Data Integration | IoT/environmental sensor feeds | P3 |
| MON-007 | Satellite Data Processing | Process satellite imagery for damage | P3 |

### 4.3 AI Risk Analysis & Prediction

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| AI-001 | Flood Risk Scoring | ML-based flood risk classification per area | P0 |
| AI-002 | Cyclone Detection & Tracking | Detect and track cyclone patterns | P1 |
| AI-003 | Heatwave Detection | Temperature anomaly detection and alerting | P1 |
| AI-004 | Landslide Risk Assessment | Terrain + weather based landslide risk | P2 |
| AI-005 | Earthquake Impact Estimation | Seismic impact zone estimation | P2 |
| AI-006 | Multi-Hazard Risk Index | Combined risk score across all hazard types | P1 |
| AI-007 | Explainable AI Panel | Show contributing factors for each risk score | P0 |
| AI-008 | Confidence Scores | Display model confidence with each prediction | P0 |
| AI-009 | Feature Importance Visualization | Show which features drive predictions | P1 |
| AI-010 | Risk Trend Analysis | Track risk over time, show increasing/decreasing trends | P1 |

### 4.4 Impact Prediction

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| IMP-001 | Population Impact Estimation | Estimate affected population by area | P0 |
| IMP-002 | Infrastructure Exposure | Buildings/infrastructure at risk | P1 |
| IMP-003 | Road Closure Prediction | Predict which roads may become inaccessible | P0 |
| IMP-004 | Hospital Isolation Risk | Flag hospitals at risk of becoming unreachable | P0 |
| IMP-005 | Shelter Overflow Prediction | Predict shelters nearing/exceeding capacity | P1 |
| IMP-006 | Resource Demand Forecasting | Estimate upcoming resource needs | P1 |
| IMP-007 | Medical Demand Estimation | Predict medical supply and personnel needs | P2 |
| IMP-008 | Critical Infrastructure Exposure | Power, water, telecom risk assessment | P2 |

### 4.5 Disaster Chain Prediction

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| CAS-001 | Primary → Secondary Hazard Mapping | Model cascading disaster sequences | P1 |
| CAS-002 | Infrastructure Failure Chains | Predict infrastructure knock-on effects | P2 |
| CAS-003 | Cascade Visualization | Visual chain diagram of cascading events | P1 |
| CAS-004 | Cascade Risk Scoring | Score likelihood of each cascade step | P2 |
| CAS-005 | Cascade Timeline | Show estimated timing of cascading effects | P2 |

### 4.6 What-If Scenario Simulator

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| SIM-001 | Scenario Configuration | Adjust disaster parameters (rainfall %, wind, etc.) | P1 |
| SIM-002 | Scenario Execution | Run simulation and recalculate all predictions | P1 |
| SIM-003 | Outcome Comparison | Compare baseline vs scenario outcomes | P2 |
| SIM-004 | Resource Impact Analysis | Show how scenario changes affect resource needs | P2 |
| SIM-005 | Multi-Scenario Save & Compare | Save multiple scenarios for side-by-side comparison | P2 |

### 4.7 AI Resource Optimization

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| RES-001 | Resource Inventory Management | Track available resources by type & location | P0 |
| RES-002 | Priority-Based Allocation | AI-recommended resource deployment | P1 |
| RES-003 | Deployment Route Optimization | Optimal routes for resource delivery | P2 |
| RES-004 | Demand-Supply Gap Analysis | Identify resource shortfalls by area | P1 |
| RES-005 | Resource Reallocation Recommendations | Suggest redistribution based on changing conditions | P1 |
| RES-006 | Resource Deployment Tracking | Real-time tracking of deployed resources | P2 |

### 4.8 Evacuation & Safe Routes

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| EVA-001 | Evacuation Route Planning | AI-computed safe evacuation routes | P1 |
| EVA-002 | Route Hazard Assessment | Score routes by current danger level | P1 |
| EVA-003 | Shelter-Aware Routing | Route to shelters with available capacity | P1 |
| EVA-004 | Dynamic Route Updates | Update routes as conditions change | P2 |
| EVA-005 | Evacuation Zone Definition | Define and display evacuation zones | P1 |

### 4.9 Citizen SOS & Intelligence

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| SOS-001 | SOS Request Submission | Citizens submit rescue/food/water/medicine/shelter requests | P0 |
| SOS-002 | Location-Based SOS | Auto-capture citizen location with SOS | P0 |
| SOS-003 | SOS Urgency Scoring | AI-scored urgency level | P1 |
| SOS-004 | Duplicate Detection | Detect and merge duplicate SOS reports | P1 |
| SOS-005 | Geo-Clustering (DBSCAN) | Cluster SOS requests into demand hotspots | P1 |
| SOS-006 | Citizen Incident Reports | Citizens report local conditions (flooding, damage, etc.) | P1 |
| SOS-007 | Report Verification | AI + human verification of citizen reports | P2 |
| SOS-008 | SOS Status Tracking | Citizens track their SOS request status | P1 |

### 4.10 Shelter & Hospital Intelligence

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| SHL-001 | Shelter Inventory | Location, capacity, occupancy, status | P0 |
| SHL-002 | Shelter Accessibility Analysis | Is the shelter reachable from affected areas? | P1 |
| SHL-003 | Shelter Overflow Alerts | Alert when shelters near capacity | P1 |
| SHL-004 | Hospital Status Dashboard | Capacity, accessibility, isolation risk | P0 |
| SHL-005 | Hospital Emergency Demand | Estimated emergency patient load | P2 |
| SHL-006 | Nearest Shelter/Hospital Finder | Citizens find closest available facilities | P0 |

### 4.11 Unified Command Center

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| CMD-001 | KPI Strip | Key metrics: risk level, affected population, SOS count, shelter status, resources | P0 |
| CMD-002 | Active Emergency Feed | Live feed of ongoing incidents and events | P0 |
| CMD-003 | AI Recommendations Panel | AI-generated action recommendations | P0 |
| CMD-004 | Alert Management | View, acknowledge, escalate alerts | P0 |
| CMD-005 | Resource Status Overview | Aggregate resource availability and deployment | P1 |
| CMD-006 | Priority Areas Ranking | Ranked list of areas by priority score | P1 |
| CMD-007 | Historical Analytics View | Trends, comparisons, past events | P2 |

### 4.12 Notification System

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| NOT-001 | In-App Notifications | Real-time dashboard notifications | P0 |
| NOT-002 | Push Notifications | Browser push for critical alerts | P1 |
| NOT-003 | SMS Alerts | SMS gateway for citizen warnings | P2 |
| NOT-004 | Email Alerts | Email notifications for authority users | P2 |
| NOT-005 | Emergency Broadcast | Mass notification for severe events | P2 |

### 4.13 Authentication & Authorization

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| AUTH-001 | User Registration | Email/phone registration for citizens | P0 |
| AUTH-002 | Authority Login | Secure login for government users | P0 |
| AUTH-003 | Role-Based Access Control | Admin, Authority, Citizen roles | P0 |
| AUTH-004 | OAuth / SSO | Google, Government SSO integration | P2 |
| AUTH-005 | Session Management | Secure session handling | P0 |

### 4.14 LLM / AI Assistant

| Feature ID | Feature | Description | Priority |
|---|---|---|---|
| LLM-001 | Natural Language Query | Ask questions in plain English about disaster data | P1 |
| LLM-002 | AI Explanation Generation | LLM-generated explanations of risk scores | P1 |
| LLM-003 | Decision Summary Generation | Auto-generate situation summaries | P1 |
| LLM-004 | Emergency Guidance | LLM-generated safety instructions for citizens | P2 |
| LLM-005 | Scenario Interpretation | LLM explains what-if simulation results | P2 |

---

## 5. User Stories & Acceptance Criteria

### 5.1 Authority User Stories

#### US-A01: View Live Disaster Map
> **As an** authority user, **I want to** view a live interactive disaster map, **so that I can** understand the current disaster situation spatially.

**Acceptance Criteria:**
- [ ] Map renders with base layer (satellite/terrain) within 3 seconds
- [ ] User can toggle at least 5 hazard layers independently
- [ ] Map displays shelter, hospital, and road markers
- [ ] Clicking a location shows a risk detail panel
- [ ] Map supports zoom, pan, and rotation

#### US-A02: View AI Risk Scores
> **As an** authority user, **I want to** see AI-generated risk scores for each area, **so that I can** prioritize my response.

**Acceptance Criteria:**
- [ ] Risk scores are displayed as color-coded heatmap on map
- [ ] Risk panel shows severity level (LOW/MEDIUM/HIGH/CRITICAL)
- [ ] Panel shows contributing factors with percentage weights
- [ ] Panel shows confidence score
- [ ] Panel shows recommended actions

#### US-A03: Run What-If Scenario
> **As an** authority user, **I want to** modify disaster parameters and re-run predictions, **so that I can** prepare for worsening conditions.

**Acceptance Criteria:**
- [ ] User can adjust rainfall, wind speed, road closures, shelter capacity
- [ ] System recalculates risk, impact, and resource needs within 10 seconds
- [ ] Results are displayed side-by-side with current baseline
- [ ] Changed predictions are highlighted visually

#### US-A04: View AI Resource Recommendations
> **As an** authority user, **I want to** receive AI-optimized resource deployment recommendations, **so that I can** deploy resources effectively.

**Acceptance Criteria:**
- [ ] System shows resource type, quantity, recommended destination
- [ ] Priority scoring is visible for each recommendation
- [ ] User can accept/reject/modify recommendations
- [ ] Deployment is reflected on map

#### US-A05: Monitor Citizen SOS
> **As an** authority user, **I want to** see clustered citizen SOS requests, **so that I can** identify demand hotspots.

**Acceptance Criteria:**
- [ ] SOS requests are displayed as clustered markers on map
- [ ] Clicking a cluster shows individual requests with urgency scores
- [ ] Dashboard shows total SOS count, breakdown by type, trending areas
- [ ] Duplicate reports are auto-flagged

#### US-A06: View Disaster Chains
> **As an** authority user, **I want to** see predicted cascading disaster effects, **so that I can** anticipate secondary emergencies.

**Acceptance Criteria:**
- [ ] Chain visualization shows primary → secondary → tertiary effects
- [ ] Each step shows probability/confidence
- [ ] Chain highlights affected infrastructure and services
- [ ] User can inspect each step for details

### 5.2 Citizen User Stories

#### US-C01: Check My Risk
> **As a** citizen, **I want to** check the current risk level at my location, **so that I can** decide if I need to take action.

**Acceptance Criteria:**
- [ ] App detects or accepts user location
- [ ] Displays localized risk level with clear severity indicator
- [ ] Shows relevant hazard types
- [ ] Provides actionable safety guidance

#### US-C02: Find Nearest Shelter
> **As a** citizen, **I want to** find the nearest available shelter, **so that I can** evacuate safely.

**Acceptance Criteria:**
- [ ] Shows list of shelters sorted by distance
- [ ] Each shelter shows capacity, current occupancy, accessibility status
- [ ] Provides navigation directions
- [ ] Filters out full/inaccessible shelters

#### US-C03: Send SOS
> **As a** citizen, **I want to** send an emergency SOS request, **so that I can** receive help.

**Acceptance Criteria:**
- [ ] Form captures: location (auto/manual), request type, urgency, description
- [ ] Submission succeeds even with poor connectivity (queued)
- [ ] User receives confirmation with request ID
- [ ] User can track request status

#### US-C04: Find Safe Route
> **As a** citizen, **I want to** find the safest route to a shelter or hospital, **so that I can** avoid hazard zones.

**Acceptance Criteria:**
- [ ] Shows route on map avoiding blocked/flooded roads
- [ ] Shows estimated travel time
- [ ] Highlights hazard zones along route
- [ ] Updates if conditions change

---

## 6. Priority & Phased Delivery

### Phase 1 — Core Intelligence Demo (MVP)
**Timeline:** Weeks 1-3
**Goal:** Demonstrate the core AI + GIS intelligence concept

| Category | Features |
|---|---|
| Map | MAP-001, MAP-002, MAP-003, MAP-004, MAP-006, MAP-007, MAP-008, MAP-014, MAP-015, MAP-017 |
| Monitoring | MON-001, MON-002, MON-003, MON-004 |
| AI | AI-001, AI-007, AI-008 |
| Impact | IMP-001, IMP-003, IMP-004 |
| Command Center | CMD-001, CMD-002, CMD-003, CMD-004 |
| Auth | AUTH-001, AUTH-002, AUTH-003, AUTH-005 |
| Shelter/Hospital | SHL-001, SHL-004, SHL-006 |
| SOS | SOS-001, SOS-002 |
| Notifications | NOT-001 |

### Phase 2 — Decision Support
**Timeline:** Weeks 4-6
**Goal:** Add AI recommendations, resource optimization, citizen intelligence

| Category | Features |
|---|---|
| Map | MAP-005, MAP-009, MAP-010, MAP-011, MAP-013, MAP-016 |
| AI | AI-002, AI-003, AI-006, AI-009, AI-010 |
| Impact | IMP-002, IMP-005, IMP-006 |
| Cascade | CAS-001, CAS-003 |
| Resources | RES-001, RES-002, RES-004, RES-005 |
| Evacuation | EVA-001, EVA-002, EVA-003, EVA-005 |
| SOS | SOS-003, SOS-004, SOS-005, SOS-006, SOS-008 |
| Shelter | SHL-002, SHL-003 |
| Command | CMD-005, CMD-006 |
| Notifications | NOT-002 |
| LLM | LLM-001, LLM-002, LLM-003 |

### Phase 3 — Advanced Intelligence
**Timeline:** Weeks 7-9
**Goal:** What-if simulation, advanced cascade analysis, historical analytics

| Category | Features |
|---|---|
| Map | MAP-012 |
| AI | AI-004, AI-005 |
| Impact | IMP-007, IMP-008 |
| Cascade | CAS-002, CAS-004, CAS-005 |
| Simulation | SIM-001, SIM-002, SIM-003, SIM-004, SIM-005 |
| Resources | RES-003, RES-006 |
| Evacuation | EVA-004 |
| SOS | SOS-007 |
| Shelter | SHL-005 |
| Command | CMD-007 |
| LLM | LLM-004, LLM-005 |

### Phase 4 — Production & Resilience
**Timeline:** Weeks 10+
**Goal:** Production hardening, integrations, mobile

| Category | Features |
|---|---|
| Monitoring | MON-005, MON-006, MON-007 |
| Auth | AUTH-004 |
| Notifications | NOT-003, NOT-004, NOT-005 |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target |
|---|---|
| Map initial load time | < 3 seconds |
| API response time (95th percentile) | < 500ms |
| Risk recalculation time | < 10 seconds |
| Concurrent users supported | 500+ |
| Real-time data refresh interval | 30 seconds |
| Map rendering FPS | 60 FPS on modern hardware |

### 7.2 Reliability

| Requirement | Target |
|---|---|
| System uptime | 99.5% |
| Data pipeline recovery | < 5 minutes |
| Database backup frequency | Every 6 hours |
| Graceful degradation | System functional even if ML service is down |

### 7.3 Security

| Requirement | Detail |
|---|---|
| Authentication | JWT-based with refresh tokens |
| Authorization | Role-based access control (RBAC) |
| Data encryption | TLS 1.3 in transit, AES-256 at rest |
| API security | Rate limiting, input validation, CORS |
| Audit logging | All critical actions logged with timestamps |

### 7.4 Accessibility

| Requirement | Detail |
|---|---|
| WCAG Level | AA compliance target |
| Keyboard navigation | Full support |
| Screen reader | Semantic HTML + ARIA labels |
| Color contrast | Minimum 4.5:1 ratio |
| Responsive | Desktop, tablet, mobile |

### 7.5 Scalability

| Requirement | Detail |
|---|---|
| Horizontal scaling | Containerized services |
| Database | Connection pooling, read replicas |
| Caching | Redis for frequently accessed data |
| CDN | Static assets via CDN |

---

## 8. Success Metrics & KPIs

### Operational Metrics

| Metric | Target |
|---|---|
| Time to identify high-risk zones | < 2 minutes |
| Time to generate AI recommendations | < 15 seconds |
| Resource allocation decision time | 50% reduction vs manual |
| Alert generation latency | < 30 seconds from data ingestion |

### Predictive Quality

| Metric | Target |
|---|---|
| Risk classification accuracy | > 85% |
| Impact prediction accuracy | > 80% |
| False alert rate | < 10% |
| Model confidence calibration | ECE < 0.1 |

### Citizen Engagement

| Metric | Target |
|---|---|
| SOS processing time | < 5 minutes |
| Duplicate report reduction | > 70% |
| Hotspot detection accuracy | > 85% |
| Alert delivery rate | > 95% |

### System Performance

| Metric | Target |
|---|---|
| API response time (p95) | < 500ms |
| Map rendering time | < 3 seconds |
| Data freshness | < 5 minutes staleness |
| System uptime | 99.5% |

---

## 9. Assumptions & Constraints

### Assumptions
1. Weather API data is available via free/affordable tiers (OpenWeatherMap, IMD)
2. GIS data (OpenStreetMap) is freely available
3. Users have modern browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
4. Internet connectivity is available for initial load (offline caching for degraded scenarios)
5. Gemini API or equivalent is available for LLM features

### Constraints
1. **Budget:** Hackathon/prototype budget — prioritize free/open-source tools
2. **Timeline:** Phased development with MVP in 3 weeks
3. **Data:** Real disaster data may be limited; sample/synthetic data acceptable for demo
4. **GIS Tiles:** Mapbox free tier limits (50,000 map loads/month)
5. **ML Models:** Pre-trained/rule-based models acceptable for initial demo; production models require real training data

---

## 10. Glossary

| Term | Definition |
|---|---|
| **ASPIRE** | AI-Powered Smart Platform for Intelligent Response to Emergencies |
| **Cascade** | A chain of events triggered by a primary disaster |
| **DBSCAN** | Density-Based Spatial Clustering of Applications with Noise |
| **EOC** | Emergency Operations Center |
| **GIS** | Geographic Information System |
| **Heatmap** | Color-coded overlay showing data intensity |
| **KPI** | Key Performance Indicator |
| **PostGIS** | PostgreSQL extension for geospatial data |
| **RBAC** | Role-Based Access Control |
| **SOS** | Emergency help request from a citizen |
| **XAI** | Explainable Artificial Intelligence |
