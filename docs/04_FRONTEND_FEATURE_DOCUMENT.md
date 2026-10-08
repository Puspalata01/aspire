# ASPIRE — Frontend Feature Document

> **AI-Powered Disaster Intelligence & Response Platform**
> **Tagline:** *From Warning to Action.*

**Version:** 1.0
**Last Updated:** October 2026
**Document Type:** Frontend Features, Screens, Components & UI/UX Specification
**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Mapbox GL JS

---

## Table of Contents

1. [Design System & Theme](#1-design-system--theme)
2. [Page-by-Page Feature Breakdown](#2-page-by-page-feature-breakdown)
3. [Authority Dashboard Features](#3-authority-dashboard-features)
4. [Citizen Portal Features](#4-citizen-portal-features)
5. [Shared & Global Features](#5-shared--global-features)
6. [Component Library](#6-component-library)
7. [Real-Time Features](#7-real-time-features)
8. [Responsive Design Requirements](#8-responsive-design-requirements)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Performance Targets](#10-performance-targets)
11. [Third-Party Integrations](#11-third-party-integrations)

---

## 1. Design System & Theme

### 1.1 Design Philosophy

| Principle | Description |
|---|---|
| **Dark-First** | Dark mode as default for command-center aesthetics. Light mode optional. |
| **Map-Centric** | The map is the primary interface. Everything else is overlay or sidebar. |
| **Information Dense** | Authority dashboard is data-rich without feeling cluttered. |
| **Severity-Driven Color** | Colors instantly communicate danger levels (green → yellow → orange → red). |
| **Glassmorphism** | Frosted glass panels over map for premium feel. |
| **Micro-Animations** | Smooth transitions, pulse effects on alerts, breathing hazard zones. |
| **Mobile-First Citizens** | Citizen portal optimized for mobile; Authority dashboard for desktop. |

### 1.2 Color Palette

```
┌─────────────────────────────────────────────────────────────┐
│                    COLOR SYSTEM                              │
│                                                              │
│  BRAND                                                       │
│  ■ Primary         #2563EB  (Royal Blue)                     │
│  ■ Primary Light   #60A5FA                                   │
│  ■ Primary Dark    #1D4ED8                                   │
│  ■ Accent          #06B6D4  (Cyan)                           │
│                                                              │
│  SEVERITY                                                    │
│  ■ Low             #22C55E  (Green)                          │
│  ■ Medium          #EAB308  (Yellow)                         │
│  ■ High            #F97316  (Orange)                         │
│  ■ Critical        #EF4444  (Red)                            │
│                                                              │
│  HAZARD                                                      │
│  ■ Flood           #3B82F6  (Blue)                           │
│  ■ Cyclone         #8B5CF6  (Purple)                         │
│  ■ Heatwave        #F59E0B  (Amber)                          │
│  ■ Landslide       #A16207  (Brown)                          │
│  ■ Earthquake      #DC2626  (Dark Red)                       │
│                                                              │
│  DARK MODE SURFACES                                          │
│  ■ Background      #0A0E1A  (Near Black)                     │
│  ■ Surface 1       #111827  (Card)                           │
│  ■ Surface 2       #1F2937  (Elevated)                       │
│  ■ Surface 3       #374151  (Hover)                          │
│  ■ Border          #4B5563                                   │
│  ■ Text Primary    #F9FAFB                                   │
│  ■ Text Secondary  #9CA3AF                                   │
│  ■ Text Muted      #6B7280                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Headings | **Inter** | 24-36px | 700 (Bold) |
| Subheadings | Inter | 18-20px | 600 (Semibold) |
| Body | Inter | 14-16px | 400 (Regular) |
| Labels | Inter | 12-13px | 500 (Medium) |
| Data/Numbers | **JetBrains Mono** | 14-28px | 600 |
| Map Labels | Inter | 11-14px | 500 |
| KPI Values | JetBrains Mono | 28-36px | 700 |

### 1.4 Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Tight spacing |
| `--space-sm` | 8px | Element padding |
| `--space-md` | 16px | Card padding |
| `--space-lg` | 24px | Section spacing |
| `--space-xl` | 32px | Page sections |
| `--space-2xl` | 48px | Major separations |
| `--radius-sm` | 6px | Buttons, inputs |
| `--radius-md` | 10px | Cards |
| `--radius-lg` | 16px | Modals, panels |
| `--radius-full` | 999px | Badges, pills |

### 1.5 Elevation & Shadows

| Level | Shadow | Usage |
|---|---|---|
| Level 0 | None | Background |
| Level 1 | `0 1px 3px rgba(0,0,0,0.3)` | Cards |
| Level 2 | `0 4px 12px rgba(0,0,0,0.4)` | Elevated cards, dropdowns |
| Level 3 | `0 8px 24px rgba(0,0,0,0.5)` | Modals, floating panels |
| Glass | `backdrop-blur-xl bg-surface-1/80` | Map overlays |

---

## 2. Page-by-Page Feature Breakdown

### Complete Page Map

```
ASPIRE Platform
│
├── / (Landing Page)
│
├── /login
├── /register
│
├── /authority/ (Protected — Authority Role)
│   ├── /dashboard         ← Command Center
│   ├── /map               ← Full-Screen Disaster Map
│   ├── /risk              ← AI Risk Dashboard
│   ├── /impact            ← Impact Analysis
│   ├── /resources         ← Resource Management
│   ├── /shelters          ← Shelter Intelligence
│   ├── /hospitals         ← Hospital Intelligence
│   ├── /sos               ← SOS Management
│   ├── /simulation        ← What-If Simulator
│   ├── /cascade           ← Disaster Chain View
│   ├── /analytics         ← Historical Analytics
│   ├── /evacuation        ← Evacuation Planning
│   └── /settings          ← System Settings
│
├── /citizen/ (Protected — Citizen Role)
│   ├── /home              ← Personal Risk Check
│   ├── /map               ← Simplified Disaster Map
│   ├── /shelters          ← Find Shelters
│   ├── /safe-routes       ← Safe Route Finder
│   ├── /sos               ← Submit SOS
│   ├── /reports           ← Submit Report
│   ├── /alerts            ← View Alerts
│   └── /guidance          ← Emergency Guidance
│
└── /api/ (Next.js API Routes — BFF)
    ├── /auth/
    ├── /proxy/
    └── /websocket/
```

---

## 3. Authority Dashboard Features

### 3.1 Command Center (`/authority/dashboard`)

**Purpose:** The unified operational command center — single view of the entire disaster situation.

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                         │
│ Logo • Region Selector • Time • Disaster Status • Notifications │
├─────┬───────────────────────────────────────────────┬───────────┤
│     │                                               │           │
│ S   │              MINI MAP                         │  AI       │
│ I   │              (interactive, 40% width)          │  INSIGHTS │
│ D   │                                               │  PANEL    │
│ E   │                                               │           │
│ B   │                                               │  • Top    │
│ A   │                                               │    Risks  │
│ R   │                                               │  • Recs   │
│     │                                               │  • Alerts │
├─────┴───────────────────────────────────────────────┴───────────┤
│ KPI STRIP                                                        │
│ ■ Risk Level  ■ Population  ■ Active SOS  ■ Shelters  ■ Roads   │
├─────────────────────────────┬───────────────────────────────────┤
│  ACTIVE EMERGENCIES         │  PRIORITY AREAS + RECOMMENDATIONS │
│  (scrollable feed)          │  (ranked list)                    │
├─────────────────────────────┼───────────────────────────────────┤
│  RESOURCE STATUS            │  RECENT ALERTS                    │
│  (by type, with gauges)     │  (alert cards with actions)       │
└─────────────────────────────┴───────────────────────────────────┘
```

#### Features & Components

| Component | Description | Real-Time? |
|---|---|---|
| **Region Selector** | Dropdown to select state/district/zone | No |
| **Disaster Status Indicator** | Current active disaster type + severity badge | ✅ WebSocket |
| **Notification Bell** | Unread count badge + dropdown | ✅ WebSocket |
| **Mini Map** | Embedded Mapbox map with risk heatmap + key markers | ✅ 30s refresh |
| **KPI Strip** | 5-7 key metrics as large cards with trend arrows | ✅ 60s refresh |
| **AI Insights Panel** | Top 3 risks, recommended actions, confidence bars | ✅ 5min |
| **Active Emergencies Feed** | Scrollable list of ongoing incidents | ✅ WebSocket |
| **Priority Areas Table** | Ranked areas by composite risk score | ✅ 5min |
| **AI Recommendations** | Actionable cards (accept/reject/modify) | ✅ 5min |
| **Resource Status** | Bar charts by resource type: available vs deployed | ✅ 60s |
| **Alert Panel** | Recent alerts with severity badges and acknowledge button | ✅ WebSocket |
| **Quick Actions** | Buttons: Send Alert, Deploy Resources, Run Scenario | No |

#### KPI Metrics Displayed

| KPI | Display | Color Logic |
|---|---|---|
| Overall Risk Level | Large badge (LOW/MED/HIGH/CRIT) | Severity color |
| Affected Population | Number with trend arrow | — |
| Active SOS Requests | Count with urgency breakdown | Red if > threshold |
| Shelter Utilization | X / Y capacity, percentage bar | Red if > 80% |
| Roads Blocked | Count out of total | Orange if > 3 |
| Hospital Access Risk | Count at risk | Red if any |
| Resources Deployed | Count with type breakdown | — |

---

### 3.2 Full-Screen Disaster Map (`/authority/map`)

**Purpose:** The primary spatial intelligence interface. Google Earth-style immersive map.

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                     ┌────────────┐ │
│ │ LAYER   │         FULL-SCREEN MAP              │ INSPECTOR  │ │
│ │ PANEL   │                                     │ PANEL      │ │
│ │         │    ┌──────────────────────────┐     │            │ │
│ │ □ Flood │    │                          │     │ [Location] │ │
│ │ □ Cyclone│   │     MAPBOX GL JS         │     │ Risk: HIGH │ │
│ │ □ Heat  │    │     2D / 3D              │     │ Score: 0.87│ │
│ │ □ Slide │    │                          │     │ Factors:   │ │
│ │ □ Roads │    │     Click to inspect     │     │ ■ Rain 30% │ │
│ │ □ Shelter│   │                          │     │ ■ River 25%│ │
│ │ □ Hosp  │    └──────────────────────────┘     │ ■ Elev 20% │ │
│ │ □ SOS   │                                     │            │ │
│ │ □ Resrc │    ┌──────────────────────────┐     │ Actions:   │ │
│ │ □ Pop   │    │ MAP CONTROLS             │     │ [Deploy]   │ │
│ │ □ Impact│    │ 🔍 + - 🧭 2D/3D ⛶      │     │ [Evacuate] │ │
│ │         │    └──────────────────────────┘     │ [Simulate] │ │
│ └─────────┘                                     └────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TIMELINE SLIDER                      ◀ ●──────────── ▶     │ │
│ │ Historical ← Current → Forecast                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ LEGEND                                                      │ │
│ │ ■ Low  ■ Medium  ■ High  ■ Critical  🔴 SOS  🏥 Hospital  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Map Layer Controls

| Layer | Icon | Type | Toggle |
|---|---|---|---|
| Flood Risk | 🌊 | Fill/Heatmap | ✅ |
| Cyclone Track | 🌀 | Line + Symbol | ✅ |
| Heatwave Zones | 🌡️ | Fill | ✅ |
| Landslide Risk | ⛰️ | Fill | ✅ |
| Earthquake | 📍 | Circle | ✅ |
| Shelters | 🏠 | Symbol | ✅ |
| Hospitals | 🏥 | Symbol | ✅ |
| Roads | 🛣️ | Line (color-coded) | ✅ |
| SOS Clusters | 🆘 | Circle/Heatmap | ✅ |
| Resources | 📦 | Symbol | ✅ |
| Population | 👥 | Heatmap | ✅ |
| Predicted Impact | 🎯 | Fill (dashed border) | ✅ |
| Weather | ☁️ | Raster overlay | ✅ |
| Disaster Boundaries | ⚠️ | Polygon outline | ✅ |

#### Map Interactions

| Interaction | Action |
|---|---|
| Click on location | Open Location Inspector panel with risk details |
| Click on shelter marker | Show shelter popup (name, capacity, occupancy, status) |
| Click on hospital marker | Show hospital popup (name, beds, isolation risk) |
| Click on SOS cluster | Show cluster details (count, urgency, types) |
| Click on road segment | Show road status (open/blocked, reason) |
| Hover on heatmap | Show tooltip with risk score value |
| Draw polygon | Select area for batch analysis |
| Right-click | Context menu: Analyze, Deploy, Simulate |

#### Location Inspector Panel (Slide-out)

When user clicks any map location:

```
┌────────────────────────────┐
│ 📍 Zone B, Puri District   │
│ Lat: 19.8135, Lng: 85.8312 │
├────────────────────────────┤
│ FLOOD RISK                 │
│ ████████████████░░░  HIGH  │
│ Score: 0.87  Confidence: 92%│
│                            │
│ Contributing Factors       │
│ ▪ Rainfall: Very High  30% │
│ ▪ River Level: Rising  25% │
│ ▪ Elevation: Low       20% │
│ ▪ History: High        15% │
│ ▪ Population: High     10% │
│                            │
│ IMPACT ESTIMATE            │
│ 👥 42,000 people at risk   │
│ 🛣️ 7 roads may close       │
│ 🏥 2 hospitals at risk     │
│ 🏠 3 shelters near capacity│
│                            │
│ AI RECOMMENDATIONS         │
│ 1. Prepare evacuation      │
│    for Zone A              │
│ 2. Monitor Road R12        │
│ 3. Pre-position boats      │
│    in Sector 3             │
│                            │
│ 🤖 AI Explanation          │
│ "Heavy rainfall exceeding  │
│  80mm/hr combined with     │
│  rising river levels and   │
│  low elevation makes this  │
│  area highly vulnerable..."│
│                            │
│ [Deploy Resources] [Sim]   │
└────────────────────────────┘
```

---

### 3.3 AI Risk Dashboard (`/authority/risk`)

**Purpose:** Comprehensive risk analysis across all regions and hazard types.

#### Features

| Feature | Description |
|---|---|
| **Risk Matrix Grid** | Regions × Hazard types with color-coded cells |
| **Risk Trend Charts** | Line charts showing risk score over time per region |
| **Top Risk Areas** | Ranked table of highest-risk regions |
| **Factor Analysis** | Radar chart showing factor contributions |
| **Confidence Heatmap** | Model confidence across regions |
| **Risk Comparison** | Compare 2 regions side-by-side |
| **Explainability Panel** | Click any risk cell → see AI explanation |
| **Model Performance** | Accuracy metrics, calibration curve |

#### Risk Matrix Visualization

```
          │ Flood │ Cyclone │ Heatwave │ Landslide │ Earthquake │
──────────┼───────┼─────────┼──────────┼───────────┼────────────│
Puri      │ 🔴 91 │  🟠 65  │  🟡 40   │  🟢 12    │   🟢 8     │
Cuttack   │ 🟠 72 │  🟡 45  │  🟡 38   │  🟢 15    │   🟢 10    │
Khurda    │ 🟠 68 │  🟡 42  │  🟠 55   │  🟡 35    │   🟢 12    │
Jagatsingh│ 🔴 88 │  🟠 70  │  🟡 30   │  🟢 18    │   🟢 7     │
Kendrapara│ 🔴 85 │  🟠 62  │  🟡 35   │  🟢 20    │   🟢 9     │
```

---

### 3.4 Impact Analysis Dashboard (`/authority/impact`)

**Purpose:** View estimated disaster impact across population, infrastructure, and services.

#### Features

| Feature | Description |
|---|---|
| **Impact Summary Cards** | Population affected, buildings at risk, roads blocked, etc. |
| **Impact Map** | Map view with impact intensity overlay |
| **Population Exposure Chart** | Bar chart by region |
| **Infrastructure Risk Table** | Roads, bridges, power lines at risk |
| **Hospital Accessibility Matrix** | Which hospitals are reachable from which zones |
| **Shelter Pressure Gauge** | Visual capacity gauges per shelter |
| **Timeline Impact Forecast** | How impact is expected to evolve over 24/48/72 hours |

---

### 3.5 Resource Management (`/authority/resources`)

**Purpose:** Track, allocate, and optimize emergency resources.

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ RESOURCE MANAGEMENT                                              │
├──────────────────────┬──────────────────────────────────────────┤
│ RESOURCE INVENTORY   │  RESOURCE MAP                            │
│                      │  (map with resource + demand markers)    │
│ 🚣 Boats: 45 / 80   │                                          │
│ 🚑 Ambulance: 12/20 │  🔴 Demand hotspots                     │
│ 🚁 Heli: 3 / 5      │  🟢 Available resources                 │
│ 🍞 Food: 2000 packs │  ➡️ Deployment routes                   │
│ 💊 Medicine: 500 kits│                                          │
│ ⛺ Tents: 150 / 300  │                                          │
│                      │                                          │
├──────────────────────┼──────────────────────────────────────────┤
│ AI RECOMMENDATIONS   │  DEPLOYMENT HISTORY                     │
│                      │                                          │
│ 🤖 Deploy 10 boats   │  ID    Resource  To         Status      │
│    to Zone A          │  D-001  Boats    Zone A     In Transit │
│    Priority: CRITICAL │  D-002  Ambulance Hosp B   Delivered   │
│    [Accept] [Modify]  │  D-003  Food     Shelter C  Delivered  │
│                      │  D-004  Medicine  Zone D    Planned     │
│ 🤖 Redirect ambulance│                                          │
│    from Sector 2 → 5 │                                          │
│    [Accept] [Reject]  │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

#### Features

| Feature | Description |
|---|---|
| **Inventory Dashboard** | Resource type, total, available, deployed, in-transit |
| **Resource Map** | Resources + demand hotspots on map |
| **AI Allocation Engine** | Receive and manage AI recommendations |
| **Demand-Supply Gap** | Charts showing resource gaps by area |
| **Deployment Form** | Deploy resources with destination, quantity, priority |
| **Deployment Tracking** | Live status of ongoing deployments |
| **Resource History** | Audit trail of all resource movements |

---

### 3.6 Shelter Intelligence (`/authority/shelters`)

#### Features

| Feature | Description |
|---|---|
| **Shelter List** | All shelters with capacity, occupancy, status, accessibility |
| **Shelter Map** | Shelters on map with color by occupancy % |
| **Capacity Gauges** | Visual gauge per shelter (green → yellow → red) |
| **Overflow Prediction** | AI prediction of when shelters will reach capacity |
| **Nearest Hospital Distance** | Each shelter's proximity to medical care |
| **Accessibility Analysis** | Which shelters are still reachable |
| **Shelter Allocation** | AI recommended citizen → shelter routing |

---

### 3.7 Hospital Intelligence (`/authority/hospitals`)

#### Features

| Feature | Description |
|---|---|
| **Hospital List** | All hospitals with beds, ICU, occupancy, status |
| **Hospital Map** | Hospitals on map colored by emergency status |
| **Isolation Risk Panel** | Hospitals at risk of becoming unreachable |
| **Road Accessibility** | Which roads connect to each hospital |
| **Emergency Demand Forecast** | AI predicted patient load |
| **Ambulance Tracking** | Ambulance positions and ETAs |

---

### 3.8 SOS Management (`/authority/sos`)

#### Features

| Feature | Description |
|---|---|
| **SOS Feed** | Real-time feed of incoming SOS requests |
| **SOS Map** | Clustered SOS markers + hotspot heatmap |
| **Hotspot Panel** | DBSCAN clusters with priority scores |
| **SOS Detail View** | Individual report with location, urgency, description, media |
| **Assignment Panel** | Assign resources to SOS requests |
| **Status Management** | Update SOS status (received → verified → assigned → resolved) |
| **Duplicate Detection** | Auto-flagged duplicates with merge option |
| **Analytics** | SOS trends, types, urgency distribution, response times |

---

### 3.9 What-If Simulator (`/authority/simulation`)

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ WHAT-IF SCENARIO SIMULATOR                                       │
├──────────────────────┬──────────────────────────────────────────┤
│ PARAMETER CONTROLS   │  RESULTS MAP                            │
│                      │                                          │
│ Rainfall:            │  ┌────────────────────────────────────┐ │
│ [────●─────] +30%    │  │  Mapbox Map                        │ │
│                      │  │  Before ←→ After toggle             │ │
│ Wind Speed:          │  │                                    │ │
│ [───●──────] +15%    │  │  Original risk vs simulated risk   │ │
│                      │  │                                    │ │
│ Roads Closed:        │  └────────────────────────────────────┘ │
│ [──●───────] +2      │                                          │
│                      ├──────────────────────────────────────────┤
│ Shelter Capacity:    │  COMPARISON TABLE                       │
│ [─────●────] -20%    │                                          │
│                      │  Metric      Baseline  Simulated Change │
│ [Run Simulation]     │  Risk Score   0.65     0.87      +34%  │
│ [Reset to Baseline]  │  Population   25K      42K       +68%  │
│ [Save Scenario]      │  Roads at Risk  3       7        +133% │
│                      │  Hosp at Risk   0       2        +200% │
│                      │  Shelter Load  55%      92%      +67%  │
│                      │  Resource Need  Med     Critical  ↑↑    │
└──────────────────────┴──────────────────────────────────────────┘
```

#### Features

| Feature | Description |
|---|---|
| **Parameter Sliders** | Adjust rainfall, wind, temperature, roads closed, shelter capacity |
| **Run Simulation** | Execute and get recalculated predictions |
| **Results Comparison** | Side-by-side baseline vs scenario |
| **Map Toggle** | Switch map between baseline and simulated state |
| **LLM Interpretation** | AI-generated narrative explaining scenario results |
| **Save & Compare** | Save multiple scenarios for comparison |
| **Export** | Download simulation report as PDF |

---

### 3.10 Disaster Chain View (`/authority/cascade`)

#### Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ DISASTER CHAIN PREDICTION                                        │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ Heavy    │───▶│ River    │───▶│ Urban    │───▶│ Road     │ │
│  │ Rainfall │    │ Overflow │    │ Flooding │    │ Closure  │ │
│  │ P: 95%   │    │ P: 85%   │    │ P: 80%   │    │ P: 72%   │ │
│  │ ■■■■■■■■ │    │ ■■■■■■■■ │    │ ■■■■■■■  │    │ ■■■■■■   │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                       │         │
│                                               ┌───────┼───────┐ │
│                                               ▼       ▼       │ │
│                                        ┌──────────┐ ┌────────┐│ │
│                                        │ Hospital │ │ Supply ││ │
│                                        │ Isolation│ │ Disrupt││ │
│                                        │ P: 45%   │ │ P: 38% ││ │
│                                        │ ■■■■     │ │ ■■■    ││ │
│                                        └──────────┘ └────────┘│ │
│                                                                │ │
│  TIMELINE: [0h] ──── [4h] ──── [8h] ──── [12h] ──── [24h]    │
│                                                                  │
│  Legend: P = Probability | ■ = Confidence Bar                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Features

| Feature | Description |
|---|---|
| **Chain Diagram** | Visual flow diagram of cascading events |
| **Probability Bars** | Each step shows likelihood |
| **Timeline** | Estimated hours until each cascade step |
| **Step Inspector** | Click step for details, affected areas, recommended actions |
| **Multiple Chains** | View chains for different primary hazards |
| **Impact Highlight** | Highlight most dangerous cascade paths |

---

### 3.11 Analytics Dashboard (`/authority/analytics`)

#### Features

| Feature | Description |
|---|---|
| **Historical Event Timeline** | Calendar/timeline of past disasters |
| **Disaster Comparison** | Compare 2+ historical events |
| **Risk Trends** | Multi-year risk score trends per region |
| **Response Metrics** | Average response time, resolution rate |
| **Resource Utilization** | Historical resource deployment efficiency |
| **SOS Analytics** | Request volumes, types, response times over time |
| **Model Performance** | Prediction accuracy retrospective |
| **Export Reports** | Generate PDF/CSV reports |

---

### 3.12 Evacuation Planning (`/authority/evacuation`)

#### Features

| Feature | Description |
|---|---|
| **Evacuation Zone Map** | Define/view evacuation zones on map |
| **Route Planner** | AI-computed safe evacuation routes |
| **Route Comparison** | Compare multiple route options |
| **Shelter Routing** | Auto-route to shelters with capacity |
| **Population Estimation** | Estimated people to evacuate per zone |
| **Traffic Flow** | Expected traffic on evacuation routes |
| **Corridor Management** | Open/close evacuation corridors |

---

## 4. Citizen Portal Features

### 4.1 Citizen Home (`/citizen/home`)

**Purpose:** Personal risk awareness and quick actions.

#### Layout (Mobile-First)

```
┌──────────────────────────────┐
│         ASPIRE               │
│     ⚠️ YOUR AREA RISK        │
│                              │
│  ┌────────────────────────┐  │
│  │     FLOOD RISK         │  │
│  │                        │  │
│  │    ████████████████    │  │
│  │       HIGH (0.78)      │  │
│  │                        │  │
│  │  ☔ Heavy rain warning  │  │
│  │  📍 Zone B, Puri       │  │
│  └────────────────────────┘  │
│                              │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🏠 Find  │ │ 🛣️ Safe  │  │
│  │ Shelter  │ │ Routes   │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🆘 Send  │ │ 📢 Report│  │
│  │ SOS      │ │ Incident │  │
│  └──────────┘ └──────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📋 SAFETY GUIDANCE     │  │
│  │ • Move to higher ground│  │
│  │ • Avoid flooded roads  │  │
│  │ • Keep emergency kit   │  │
│  │ [Read Full Guide →]    │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🔔 RECENT ALERTS       │  │
│  │ ⚠️ Flood warning issued │  │
│  │   15 min ago            │  │
│  │ 📍 Road R12 blocked     │  │
│  │   1 hour ago            │  │
│  └────────────────────────┘  │
│                              │
│ [Map] [Shelters] [SOS] [Me] │
└──────────────────────────────┘
```

#### Features

| Feature | Description |
|---|---|
| **Personal Risk Card** | Risk level at user's location with severity colors |
| **Quick Action Buttons** | Find Shelter, Safe Routes, Send SOS, Report |
| **Safety Guidance** | Context-aware safety tips based on current hazards |
| **Recent Alerts** | Latest emergency alerts for user's area |
| **Location Detection** | Auto-detect or manual location input |

---

### 4.2 Citizen Map (`/citizen/map`)

**Purpose:** Simplified disaster map for citizens.

#### Features (subset of authority map)

| Feature | Description |
|---|---|
| **Risk Heatmap** | Simplified risk overlay |
| **Shelter Markers** | Shelters with capacity info |
| **Safe Route Lines** | Highlighted safe routes |
| **Hazard Zones** | Active hazard boundaries |
| **User Location** | Show user's current position |
| **Nearest Facilities** | Distance to nearest shelter/hospital |

---

### 4.3 Shelter Finder (`/citizen/shelters`)

#### Features

| Feature | Description |
|---|---|
| **Shelter List** | Sorted by distance from user |
| **Availability Filter** | Show only shelters with capacity |
| **Map View** | Shelters on map with routes |
| **Shelter Card** | Name, distance, capacity bar, amenities, directions |
| **Navigate Button** | Open directions in Google Maps / in-app routing |
| **Amenities Icons** | 🚿 Water, 🍞 Food, 💊 Medical, 🔌 Power |

---

### 4.4 SOS Form (`/citizen/sos`)

#### Form Fields

| Field | Type | Required | Description |
|---|---|---|---|
| Location | Map picker + GPS auto-detect | ✅ | SOS location |
| Request Type | Select (rescue/food/water/medicine/shelter) | ✅ | Type of help |
| Urgency | Toggle (moderate/high/critical) | ✅ | Urgency level |
| People Count | Number input | ✅ | Number of people |
| Description | Textarea | ❌ | Additional details |
| Photo/Video | File upload (max 3) | ❌ | Visual evidence |
| Contact Phone | Phone input | ❌ | Contact number |

#### Post-Submission

```
┌────────────────────────────┐
│ ✅ SOS REQUEST SENT         │
│                            │
│ Request ID: SOS-7829       │
│ Status: Received           │
│ Priority: HIGH             │
│                            │
│ Estimated Response: 15-30m │
│                            │
│ Nearest Resources:         │
│ 🚣 Rescue Boat — 2.3 km   │
│    ETA: ~12 minutes        │
│                            │
│ [Track My Request]         │
│ [Send Another SOS]         │
└────────────────────────────┘
```

---

### 4.5 Safe Route Finder (`/citizen/safe-routes`)

#### Features

| Feature | Description |
|---|---|
| **Origin Input** | Current location (auto) or manual input |
| **Destination Input** | Shelter name, hospital, or address |
| **Route Display** | Route on map with hazard zones highlighted |
| **Danger Markers** | Points along route with risk indicators |
| **Alternative Routes** | Show 2-3 route options with risk comparison |
| **Turn-by-Turn** | Basic text directions |
| **ETA** | Estimated travel time |

---

### 4.6 Emergency Guidance (`/citizen/guidance`)

#### Content (generated by LLM based on active hazards)

| Section | Content |
|---|---|
| **Before Disaster** | Preparation checklist, emergency kit, evacuation plan |
| **During Disaster** | Immediate actions per hazard type |
| **After Disaster** | Recovery steps, reporting, avoiding secondary hazards |
| **Emergency Numbers** | NDRF, Police, Fire, Ambulance, District Control Room |
| **FAQ** | Common citizen questions during disasters |

---

## 5. Shared & Global Features

### 5.1 Landing Page (`/`)

**Purpose:** Introduce the platform, communicate the mission, direct users to dashboard or citizen portal.

#### Sections

| Section | Description |
|---|---|
| **Hero** | Bold tagline "From Warning to Action" + animated globe with hazard visualization |
| **Problem Statement** | 3 pain points with icons |
| **Solution Overview** | Platform capabilities with animated cards |
| **Feature Highlights** | 6 key features with icons and descriptions |
| **Architecture Visual** | Animated data flow diagram |
| **Tech Stack Badges** | Technology logos |
| **CTA Buttons** | "Authority Login" + "Citizen Portal" |
| **Demo Video** | Embedded walkthrough video |
| **Footer** | Links, credits, hackathon info |

### 5.2 Authentication Pages (`/login`, `/register`)

#### Login Page

| Feature | Description |
|---|---|
| **Email/Password** | Standard login form |
| **Role Selection** | Authority vs Citizen toggle |
| **Remember Me** | Persistent session option |
| **Forgot Password** | Password reset flow |
| **Demo Accounts** | Quick login buttons for demo |

#### Register Page

| Feature | Description |
|---|---|
| **Full Name** | Text input |
| **Email** | Email input |
| **Phone** | Phone input with country code |
| **Password** | Password with strength indicator |
| **Role** | Citizen (default) or Authority (requires approval) |
| **Location** | Optional — auto-detect or manual |

### 5.3 Notification System

#### Types & Behavior

| Type | Channel | Sound | Priority |
|---|---|---|---|
| Critical Alert | Toast + Push + Badge | 🔔 Alert sound | Highest |
| SOS Update | Toast + Badge | No | High |
| Risk Change | Badge only | No | Medium |
| System | Badge only | No | Low |

#### Toast Design

```
┌────────────────────────────────────────┐
│ 🔴 CRITICAL ALERT                      │
│ Flood risk escalated to CRITICAL in    │
│ Zone B, Puri District.                 │
│ AI recommends immediate evacuation.    │
│                        [View] [Dismiss]│
└────────────────────────────────────────┘
```

---

## 6. Component Library

### 6.1 shadcn/ui Components Used

| Component | Usage |
|---|---|
| `Button` | All buttons with variants (default, destructive, outline, ghost) |
| `Card` | KPI cards, info panels, list items |
| `Dialog` | Confirmations, detail views, forms |
| `DropdownMenu` | Layer controls, actions, filters |
| `Input` | Form inputs |
| `Select` | Region selector, filters |
| `Sheet` | Side panels (map inspector, details) |
| `Skeleton` | Loading states |
| `Slider` | Simulation parameters |
| `Table` | Data tables (SOS list, resources, shelters) |
| `Tabs` | Dashboard sections, hazard type switching |
| `Toast` | Notifications (using Sonner) |
| `Tooltip` | Icon tooltips, map element tooltips |
| `Badge` | Severity badges, status indicators |
| `Progress` | Capacity bars, loading |
| `Switch` | Layer toggles |
| `Avatar` | User avatars |
| `Command` | Search/command palette |
| `Popover` | Map marker popups |
| `ScrollArea` | Scrollable panels |
| `Separator` | Section dividers |
| `HoverCard` | Preview cards on hover |

### 6.2 Custom Components

| Component | Description |
|---|---|
| `SeverityBadge` | Color-coded severity indicator (LOW/MED/HIGH/CRIT) |
| `RiskGauge` | Circular gauge showing risk score 0-100 |
| `CapacityBar` | Horizontal bar showing utilization with color transitions |
| `TrendArrow` | Up/down/stable arrow with percentage |
| `MapContainer` | Mapbox GL JS wrapper with all layers |
| `LayerControl` | Collapsible layer toggle panel |
| `TimelineSlider` | Custom range slider for historical data |
| `CascadeChain` | SVG flow diagram for disaster chains |
| `KPICard` | Large number + label + trend + sparkline |
| `AlertCard` | Severity-colored alert with actions |
| `SOSCard` | SOS request card with urgency and status |
| `ResourceGauge` | Resource type + available vs total |
| `SearchCommand` | Global search with Cmd+K shortcut |

---

## 7. Real-Time Features

### 7.1 WebSocket Events → UI Updates

| Event | UI Update |
|---|---|
| `disaster:update` | Refresh map layers, update KPIs |
| `risk:update` | Animate heatmap color change, update risk cards |
| `sos:new` | Add marker to map, increment SOS counter, show toast |
| `alert:new` | Show toast notification, add to alert feed |
| `resource:deployed` | Animate resource marker on map |
| `shelter:status_change` | Update shelter marker color + capacity bar |
| `road:status_change` | Animate road color change on map |
| `weather:update` | Refresh weather overlay |

### 7.2 Auto-Refresh Intervals

| Data | Interval | Method |
|---|---|---|
| KPI metrics | 60 seconds | TanStack Query refetch |
| Risk heatmap | 5 minutes | TanStack Query + map source reload |
| Weather overlay | 30 minutes | Map source reload |
| SOS feed | Real-time | WebSocket |
| Alert feed | Real-time | WebSocket |
| Resource positions | 30 seconds | TanStack Query refetch |

---

## 8. Responsive Design Requirements

### 8.1 Breakpoints

| Breakpoint | Width | Target |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop / Ultra-wide |

### 8.2 Layout Adaptations

| Screen | Authority Dashboard | Citizen Portal |
|---|---|---|
| Desktop (xl+) | Full layout with sidebar + map + panels | Full desktop experience |
| Tablet (md-lg) | Collapsible sidebar, stacked panels | Responsive grid |
| Mobile (< md) | ⚠️ Limited (show mobile warning + key actions) | **Primary target** — bottom nav |

### 8.3 Mobile Navigation (Citizen)

```
┌──────────────────────────────────────┐
│                                      │
│          [Page Content]              │
│                                      │
├──────────────────────────────────────┤
│  🗺️ Map  │  🏠 Shelter │ 🆘 SOS │ 👤 Me │
└──────────────────────────────────────┘
```

---

## 9. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Keyboard Navigation | All interactive elements focusable with Tab |
| Screen Reader | Semantic HTML + ARIA labels |
| Color Contrast | Min 4.5:1 for text, 3:1 for large text |
| Focus Indicators | Visible focus ring on all interactive elements |
| Alt Text | All images and icons have alt text |
| Error Messages | Associated with form fields via `aria-describedby` |
| Skip Links | Skip to main content link |
| Reduced Motion | Respect `prefers-reduced-motion` media query |
| Map Alternatives | Data table view available for all map data |

---

## 10. Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| First Input Delay (FID) | < 100ms | Web Vitals |
| Bundle Size (initial) | < 200KB gzipped | Build analysis |
| Map Load Time | < 3s | Custom metric |
| API Response Display | < 500ms after fetch | Custom metric |

---

## 11. Third-Party Integrations

### 11.1 Frontend Dependencies

| Library | Version | Purpose | Bundle Impact |
|---|---|---|---|
| Mapbox GL JS | 3.x | Map rendering | ~200KB |
| Recharts | 2.x | Charts | ~80KB |
| Framer Motion | 11.x | Animations | ~50KB |
| Zustand | 5.x | State | ~5KB |
| TanStack Query | 5.x | Data fetching | ~30KB |
| Socket.io Client | 4.x | WebSocket | ~20KB |
| Turf.js | 7.x | Geo analysis | ~60KB (tree-shaken) |
| Lucide Icons | Latest | Icons | ~5KB (per icon) |
| date-fns | 3.x | Dates | ~10KB (tree-shaken) |

### 11.2 External Services

| Service | Purpose | Required Key |
|---|---|---|
| Mapbox | Map tiles, geocoding | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Google Fonts | Typography (Inter) | None (CDN) |
| Sentry | Error tracking | `NEXT_PUBLIC_SENTRY_DSN` |
