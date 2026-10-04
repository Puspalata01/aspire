# Multi-Hazard ML + AI Blueprint

## AI-Powered Disaster Intelligence & Response Platform

**Tagline:** From Warning to Action  
**Project type:** AI + GIS + Disaster Management + Decision Support System  
**Primary geography for MVP:** Odisha, India  
**MVP modeling focus:** Flood  
**Long-term scope:** Flood, Cyclone, Storm Surge, Heatwave, Landslide, Lightning, Drought and cascading multi-hazard events

---

## 0. What this document is for

This document is the complete technical plan for the machine-learning and AI intelligence layer of the disaster platform.

It is designed to answer, in one place:

- What the ML system is actually going to do.
- How the system will work from raw data to an operational decision.
- What data and datasets are required.
- Which datasets are used for training, which are used only as inputs, and which are used for validation.
- How the system becomes genuinely multi-hazard instead of being a flood model with a multi-hazard label.
- Which parts should use ML, GIS, optimization, simulation, and rule-based logic.
- How the LLM fits into the architecture without being responsible for safety-critical predictions.
- How real-time inference works.
- How explainability, confidence and uncertainty are handled.
- How the models are trained and evaluated without spatial/temporal data leakage.
- How the system can start with one hazard and scale to many hazards.
- What should be built for the hackathon MVP and what should remain a future extension.

The core design principle is:

> **Do not build one giant “Disaster AI” model. Build hazard-specific intelligence models that produce a common hazard state, then use a shared risk, impact, cascade and response layer.**

That makes the architecture technically defensible and genuinely extensible across hazards.

---

# 1. Executive architecture

The complete intelligence pipeline is:

```text
                    MULTI-HAZARD DATA SOURCES
                              |
                              v
                  +-------------------------+
                  | DATA INGESTION & QA      |
                  | APIs / files / sensors   |
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  | DATA FUSION / FEATURE    |
                  | ENGINEERING              |
                  +------------+------------+
                               |
          +--------------------+-----------------------+
          |                    |                       |
          v                    v                       v
   +-------------+      +-------------+       +---------------+
   | FLOOD MODEL |      | CYCLONE     |       | HEATWAVE      |
   |             | ...  | MODEL       |  ...  | MODEL         |
   +------+------+      +------+------+       +-------+-------+
          |                    |                       |
          +--------------------+-----------------------+
                               |
                               v
                  +-------------------------+
                  | COMMON HAZARD STATE     |
                  | probability / intensity |
                  | geometry / time /       |
                  | confidence              |
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  | RISK FUSION ENGINE      |
                  | hazard x exposure x     |
                  | vulnerability           |
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  | IMPACT INTELLIGENCE     |
                  | people / roads / assets |
                  | hospitals / shelters    |
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  | CASCADE ENGINE           |
                  | dependent / secondary    |
                  | impacts                  |
                  +------------+------------+
                               |
                 +-------------+-------------+
                 |                           |
                 v                           v
       +-------------------+       +--------------------+
       | RESOURCE          |       | EVACUATION /       |
       | OPTIMIZER         |       | ROUTING ENGINE     |
       +---------+---------+       +---------+----------+
                 |                           |
                 +-------------+-------------+
                               |
                               v
                  +-------------------------+
                  | DECISION STATE          |
                  | what is happening,      |
                  | what may happen,        |
                  | what should be done     |
                  +------------+------------+
                               |
                 +-------------+-------------+
                 |                           |
                 v                           v
       +-------------------+       +--------------------+
       | EXPLAINABILITY    |       | LLM AI COPILOT     |
       | SHAP / rules /    |       | explanation /      |
       | confidence        |       | queries / briefs   |
       +---------+---------+       +---------+----------+
                 |                           |
                 +-------------+-------------+
                               |
                               v
                    COMMAND CENTER / MAP
                               |
                               v
                       NEW DATA ARRIVES
                               |
                               +----> LOOP
```

This is the architecture that should be shown to a technical partner or evaluator.

---

# 2. The central idea: from warning to action

Traditional warning systems answer questions such as:

> “Is heavy rain expected?”

The proposed system must answer a chain of operational questions:

```text
What is happening?
        ↓
Where is it happening?
        ↓
How intense is it?
        ↓
Where will it move / spread?
        ↓
Who and what is exposed?
        ↓
How severe could the impact be?
        ↓
What secondary effects may occur?
        ↓
What resources are needed?
        ↓
Which routes and shelters remain feasible?
        ↓
What action should the command center consider?
        ↓
What changed after the latest update?
```

The official problem statement specifically calls for a pipeline of **Hazard Detection → Risk Assessment → Impact Prediction → Resource Planning → Evacuation/Response → Real-Time Monitoring**, with real-time heterogeneous data and location-specific decisions. This blueprint keeps that pipeline as the backbone of the ML/AI architecture. fileciteturn0file1L3-L3

---

# 3. What is actually “AI” in this platform?

The system should not pretend that every component needs machine learning.

| Component | Primary technology | Why |
|---|---|---|
| Hazard probability | ML | Learns relationships between environmental signals and hazard occurrence |
| Hazard intensity | ML / physical variables | Predicts severity or estimates hazard intensity |
| Flood extent | ML + remote sensing/GIS | Combines learned signal with spatial mapping |
| Exposure | GIS | Population/assets are geographic facts rather than predictions |
| Vulnerability | Rules + statistics + ML where labels exist | Combines demographic, infrastructure and hazard sensitivity |
| Risk fusion | Transparent scoring / calibrated model | Needs explainability and operational consistency |
| Impact estimation | GIS + statistical/ML models | Overlay hazard with exposed assets; predict outcomes where labels exist |
| Cascade analysis | Graph + rules initially, probabilistic ML later | Captures dependencies between hazards and infrastructure |
| Resource allocation | Optimization / operations research | Allocation is a constrained decision problem, not primarily a classification problem |
| Evacuation | Routing + GIS + optimization | Finds safe feasible paths under changing conditions |
| Citizen reports | NLP embeddings + classifier + clustering | Converts unstructured reports into structured event intelligence |
| Explainability | SHAP + feature contributions + rules | Shows why a prediction happened |
| Natural-language interface | LLM | Explains system state and lets operators query it |
| Scenario simulation | Simulation + model inference | Tests “what-if” conditions |

This separation prevents the project from becoming an “LLM wrapper” or an unrealistic single-model system.

---

# 4. Multi-hazard design from day one

The project should be developed around a **common intelligence contract**.

The models for different hazards can use different features and algorithms, but they must all output the same conceptual structure.

Example:

```json
{
  "hazard_type": "flood",
  "timestamp": "2026-10-03T18:00:00Z",
  "prediction_horizon_hours": 6,
  "probability": 0.87,
  "intensity": 0.74,
  "confidence": 0.83,
  "affected_geometry": "<geojson polygon>",
  "model_version": "flood-xgb-v1"
}
```

A cyclone model may produce the same structure:

```json
{
  "hazard_type": "cyclone",
  "timestamp": "2026-10-03T18:00:00Z",
  "prediction_horizon_hours": 12,
  "probability": 0.91,
  "intensity": 0.82,
  "confidence": 0.89,
  "affected_geometry": "<forecast impact polygon>",
  "model_version": "cyclone-v1"
}
```

The downstream system does not need to know how the prediction was generated.

It only needs to know:

- Hazard type.
- Where.
- When.
- Probability.
- Intensity.
- Confidence.
- Geometry.
- Model/version.

That is what makes the system truly multi-hazard.

---

# 5. Hazards covered by the architecture

## 5.1 Flood

Main signals:

- Rainfall intensity.
- Accumulated rainfall.
- River level.
- River level change.
- River discharge where available.
- Soil moisture.
- Elevation.
- Slope.
- Flow accumulation.
- Distance to river/water body.
- Drainage characteristics.
- Land cover.
- Historical flood occurrence.
- Historical flood severity.
- Urbanization / impervious surface where available.
- Population and infrastructure exposure.

Primary MVP target:

> Probability that a grid cell will experience flood conditions within a defined forecast horizon.

Secondary target:

> Predicted flood extent / severity category.

---

## 5.2 Cyclone

Main signals:

- Cyclone center latitude/longitude.
- Maximum sustained wind.
- Minimum central pressure.
- Wind radius where available.
- Translation speed.
- Direction of movement.
- Historical tracks.
- Sea-surface temperature.
- Atmospheric pressure.
- Rainfall.
- Coastal elevation.
- Distance to coastline.
- Exposure of people and infrastructure.

Primary outputs:

- Probability/intensity of cyclone impact by area.
- Expected wind-risk zone.
- Expected heavy-rain zone.
- Potential affected population/infrastructure.

IBTrACS is an appropriate historical cyclone track source. NOAA describes it as a global best-track dataset combining agency records; the current page identifies version 4r01 and notes regular updates. citeturn681851search1turn681851search3

---

## 5.3 Storm surge

Storm surge is modeled as a hazard layer associated with coastal cyclone events.

Important inputs:

- Cyclone track.
- Central pressure.
- Maximum wind.
- Wind field characteristics.
- Sea level.
- Tide.
- Coastal elevation.
- Bathymetry.
- Coastline geometry.
- Nearshore geometry.
- Historical surge observations/models.

Initial implementation can use a simplified surge-impact model or an externally derived forecast product rather than attempting to develop a complete hydrodynamic model from scratch.

---

## 5.4 Heatwave

Important inputs:

- Maximum temperature.
- Minimum/night temperature.
- Mean temperature.
- Humidity.
- Dew point.
- Heat index / apparent temperature.
- Wind speed.
- Duration of high-temperature period.
- Historical heatwave events.
- Urbanization / built-up area.
- Vegetation.
- Population density.
- Vulnerable population groups.
- Healthcare facilities.

Possible outputs:

- Probability of heat-stress conditions.
- Heat-risk intensity.
- Population under high/critical heat stress.
- Health-service demand estimate where suitable labels exist.

ERA5 provides long historical hourly meteorological variables suitable for feature engineering and model development. Copernicus currently describes ERA5 as extending from 1940 to present. citeturn681851search5turn681851search9

---

## 5.5 Landslide

Important inputs:

- Rainfall accumulation.
- Rainfall intensity.
- Antecedent rainfall.
- Slope.
- Elevation.
- Aspect.
- Curvature.
- Soil type.
- Soil depth where available.
- Geology.
- Land cover.
- Distance to drainage.
- Distance to roads/cuts.
- Vegetation.
- Historical landslide inventory.
- Ground deformation where available.

Sentinel-1 SAR is particularly useful for all-weather, day/night observations and can also support deformation monitoring. ESA describes Sentinel-1 as a C-band SAR mission capable of imaging through cloud and rain and in darkness. citeturn507344search2turn507344search11

---

## 5.6 Lightning

Important inputs:

- Historical lightning strikes.
- Strike density.
- Recent strike activity.
- Convective weather indicators.
- Rainfall.
- Temperature.
- Humidity.
- Wind/shear variables if available.
- Pressure.
- Historical thunderstorm patterns.

Output:

- Probability of lightning activity in each prediction cell and horizon.
- Intensity/frequency estimate.

Lightning should not be reduced to “rainfall = lightning”; the feature set should include atmospheric instability indicators where data are available.

---

## 5.7 Drought

Important inputs:

- Rainfall deficit.
- Cumulative rainfall anomaly.
- Temperature anomaly.
- Soil moisture.
- Vegetation indices.
- Evapotranspiration.
- Water availability indicators.
- Reservoir levels where available.
- Groundwater indicators where available.
- Historical drought indices.
- Duration.
- Crop/land-use context.

Outputs:

- Drought probability.
- Drought severity.
- Spatial persistence.
- Potential agricultural/resource stress.

---

# 6. The complete data architecture

The platform needs several data categories rather than one giant dataset.

```text
1. Historical hazard data
2. Meteorological data
3. Hydrological data
4. Earth observation / satellite data
5. Terrain and physical geography
6. Land cover / soil / geology
7. Population and demographic exposure
8. Infrastructure and points of interest
9. Road/network data
10. Historical disaster impacts
11. Citizen/crowdsourced observations
12. Resource and shelter state
13. Real-time operational streams
14. Model predictions / forecasts
15. Model validation / ground truth
```

The most important distinction is:

> **Not every dataset is a training label. Some are predictors, some describe exposure, some describe vulnerability, some are operational constraints, and some are used only for validation.**

---

# 7. Master dataset catalogue

## 7.1 Historical hazard labels

| Dataset / source | Main role | Hazards | Typical use |
|---|---|---|---|
| IFI-Impacts | Flood historical labels/impacts | Flood | Primary flood training/validation |
| IBTrACS | Tropical cyclone tracks/intensity | Cyclone | Historical cyclone training/validation |
| Historical landslide inventories | Event labels | Landslide | Landslide classifier |
| Historical lightning strike databases | Event labels | Lightning | Lightning classifier |
| Historical heatwave/event records | Event labels | Heatwave | Heatwave labels |
| Historical drought indices/event records | Event labels | Drought | Drought labels |
| Historical storm/surge records | Event labels/validation | Storm surge | Surge model validation |

### Important flood dataset: IFI-Impacts

The India Flood Inventory with Impacts currently provides flood event data for 1967–2023. The v4 release, published in 2025, includes the District Flood Severity Index. The underlying event data were sourced from IMD and manually digitized/cleaned for computational use. citeturn681851search0

Official dataset page:

https://zenodo.org/records/16994648

Use it as the main historical flood-event foundation for the first model.

---

# 8. Meteorological datasets

## 8.1 IMD gridded rainfall

**Source:** India Meteorological Department (IMD)

The current IMD page provides:

- Daily gridded rainfall.
- 0.25° × 0.25° resolution.
- 1901–2024.
- Millimetres.
- 135 × 129 grid points over India.
- NetCDF and binary formats are listed by IMD.

Source:

https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html

Reference: citeturn507344search0turn507344search1

Use:

- Long-term rainfall climatology.
- Extreme rainfall features.
- Flood model predictors.
- Drought model predictors.
- Heat/storm context.

Derived features:

```text
rain_1d
rain_3d
rain_7d
rain_24h
rain_72h
max_rain_last_7d
rain_anomaly
rain_percentile
extreme_rain_flag
antecedent_rainfall_index
```

### Important limitation

A 0.25° grid is much coarser than a 500 m operational grid. Do not claim that the rainfall dataset itself provides 500 m spatial precision. Reprojecting/resampling a coarse raster does not create new information.

---

## 8.2 IMD real-time rainfall products

IMD lists real-time daily rainfall products at 0.25° resolution and also a merged gauge + GPM rainfall product. The current IMD site lists these under its gridded real-time products. citeturn507344search6turn507344search9

Use for operational inference where access permits.

For hackathon simulation, a replayed historical event stream can be used instead of a live production feed.

---

## 8.3 ERA5

**Source:** Copernicus Climate Data Store / ECMWF

ERA5 provides globally complete hourly reanalysis from 1940 to present.

Potential variables:

- 2 m temperature.
- 2 m dew point.
- 10 m wind components.
- Mean sea-level pressure.
- Total precipitation.
- Surface pressure.
- Radiation-related variables.
- Soil-related variables where appropriate.
- Other atmospheric fields depending on selected product.

Official source:

https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels

Reference: citeturn681851search5turn681851search8

Use:

- Cyclone.
- Heatwave.
- Lightning.
- Drought.
- Flood feature enrichment.
- Backfilling missing observations.
- Historical model training.

---

# 9. Hydrological data

## 9.1 Central Water Commission observations

Use river-level and hydrological observations where data access is available.

Potential fields:

- Station ID.
- River.
- Latitude/longitude.
- Water level.
- Danger level.
- Historical maximum.
- Discharge.
- Rate of change.
- Timestamp.

Derived features:

```text
river_level
river_level_change_1h
river_level_change_3h
river_level_change_6h
river_level_vs_danger_level
river_level_percentile
river_rise_rate
```

CWC publishes information on hydrometeorological observation networks, including river and meteorological observation stations. Availability, access method and historical completeness should be verified for the specific basin used by the team before implementation.

---

# 10. Terrain / geography datasets

## 10.1 SRTM elevation

Use SRTM for:

- Elevation.
- Slope.
- Aspect.
- Curvature.
- Relative elevation.
- Terrain ruggedness.
- Flow accumulation inputs.

USGS documents SRTM 1 Arc-Second Global as approximately 30 m worldwide, with GeoTIFF distribution available. citeturn681851search2turn681851search4

Official source:

https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-shuttle-radar-topography-mission

Derived terrain variables:

```text
elevation
slope
aspect
curvature
roughness
topographic_position
relative_elevation
distance_to_lowest_local_area
flow_direction
flow_accumulation
```

These derived features are especially important for flood and landslide models.

---

# 11. Satellite / remote sensing data

## 11.1 Sentinel-1

Sentinel-1 is a C-band SAR mission providing all-weather and day/night observations. citeturn507344search2turn507344search11

Use cases:

- Flood-water extent detection.
- Post-event mapping.
- Change detection.
- Landslide/deformation signals.
- Validation of predicted hazard extent.

Potential derived features:

```text
sar_backscatter
sar_change
water_probability
change_probability
inundation_mask
pre_event_vs_post_event_difference
```

### ML role

For the first flood MVP, Sentinel-1 does not have to be the primary deep-learning input. It can initially be used to create/validate flood masks or provide a strong post-event validation layer.

Later, a CNN/U-Net style segmentation model can be added for automatic inundation segmentation.

---

# 12. Population exposure data

## 12.1 WorldPop

WorldPop currently provides India population estimates for 2025 at approximately 100 m resolution in GeoTIFF, with a Random Forest-based dasymetric redistribution method. The current R2025A India product is documented as an alpha version and may change. citeturn880106search0turn880106search1

WorldPop also provides age/sex population grids at approximately 100 m resolution. citeturn880106search8turn880106search13

Official source:

https://hub.worldpop.org/

Use:

- Population exposure.
- Affected population calculation.
- Vulnerable-population estimation.
- Evacuation demand.
- Resource demand estimation.

Potential features:

```text
population_total
population_density
children_estimate
elderly_estimate
female_population
population_growth_estimate
```

### Important design rule

Population data should normally be treated as **exposure**, not as an input that the model predicts.

The flood model predicts hazard.

GIS intersects hazard with population.

The result is estimated population exposed.

---

# 13. Buildings and infrastructure

Potential sources:

- OpenStreetMap.
- Official government GIS/open-data sources where available.
- Local administrative datasets.
- Public facility registries.
- Building footprint datasets where licensing/access permits.

OpenStreetMap models geographic features such as roads, buildings and boundaries using nodes, ways and relations with tags. citeturn681851search12

Source:

https://www.openstreetmap.org/

https://wiki.openstreetmap.org/wiki/Map_features

Important layers:

### Critical infrastructure

- Hospitals.
- Primary health centres.
- Ambulance stations.
- Police stations.
- Fire stations.
- Schools.
- Government buildings.
- Shelters.
- Bridges.
- Water facilities.
- Electrical substations where available.
- Communication towers where available.
- Fuel depots where available.

### Transport

- Roads.
- Road class.
- Bridges.
- Intersections.
- Access points.
- Road geometry.
- Approximate capacity where available.

Derived features:

```text
road_density
nearest_hospital_distance
nearest_shelter_distance
critical_asset_count
bridge_count
infrastructure_density
population_to_shelter_capacity_ratio
```

---

# 14. Land-cover, soil and environmental data

These datasets support several hazard models.

## Land cover

Possible sources include:

- ESA/Copernicus land-cover products.
- Dynamic World.
- MODIS-derived land cover.
- National land-use/land-cover products where available.

Features:

```text
built_up_fraction
vegetation_fraction
water_fraction
cropland_fraction
forest_fraction
urban_fraction
```

## Soil

Potential variables:

- Soil texture.
- Sand fraction.
- Clay fraction.
- Organic matter.
- Soil depth.
- Drainage-related characteristics.
- Water-holding characteristics.

Uses:

- Flood infiltration.
- Landslide susceptibility.
- Drought.

## Geology

Important mainly for:

- Landslide.
- Ground stability.
- Soil/terrain susceptibility.

These layers may not be required for the first flood MVP but should be part of the multi-hazard data architecture.

---

# 15. Historical disaster impact data

Hazard occurrence is not the same as impact.

The system should maintain separate historical records for:

```text
hazard_event
    ↓
spatial_extent
    ↓
people_affected
    ↓
roads_affected
    ↓
properties/buildings_affected
    ↓
hospitals/facilities_affected
    ↓
response_demand
    ↓
damage / losses where available
```

This data is needed for impact models.

Example:

A flood model can predict where flooding may occur.

An impact model can then estimate:

> “Approximately X people, Y km of roads and Z critical facilities fall inside the predicted impact area.”

Where historical impact labels exist, ML can be used to learn more accurate demand or damage estimates.

---

# 16. Real-time operational data

The platform should support data that changes during a disaster.

Core streams:

```text
Weather updates
Rainfall updates
River level updates
Cyclone track updates
Satellite imagery availability
Road status
Shelter capacity
Hospital capacity
Emergency-resource availability
Vehicle GPS
Citizen reports
Field-team reports
```

The official problem statement allows simulated real-time streams for rainfall, river level, GPS, citizen reports, shelter capacity and road status. fileciteturn0file1L3-L3

For the hackathon, simulation is acceptable as long as the architecture behaves like a real streaming system.

---

# 17. The master feature store

All normalized data should eventually become a common spatial-temporal feature table.

Recommended key:

```text
grid_id + timestamp
```

Example schema:

| Feature group | Example fields |
|---|---|
| Identity | `grid_id`, `timestamp`, `lat`, `lon`, `geometry` |
| Rainfall | `rain_1h`, `rain_6h`, `rain_24h`, `rain_72h`, `rain_7d` |
| Rainfall anomalies | `rain_anomaly_24h`, `rain_percentile_24h` |
| Temperature | `temp_2m`, `temp_max`, `temp_min` |
| Humidity | `dewpoint`, `relative_humidity` |
| Wind | `wind_u`, `wind_v`, `wind_speed`, `wind_direction` |
| Pressure | `surface_pressure`, `mslp` |
| Hydrology | `river_level`, `river_change`, `discharge` |
| Terrain | `elevation`, `slope`, `aspect`, `curvature` |
| Hydrologic terrain | `flow_accumulation`, `distance_to_river` |
| Land cover | `built_fraction`, `vegetation_fraction`, `water_fraction` |
| Soil | soil-related fields |
| Population | `population`, `population_density` |
| Demographics | age-group fields where available |
| Infrastructure | facility counts, critical assets |
| Roads | road density, bridge count, road status |
| History | historical hazard frequency/severity |
| Satellite | SAR/change/inundation features |
| Cyclone | distance to center, wind, pressure, track direction |
| Drought | rainfall anomaly, soil moisture, vegetation stress |
| Labels | hazard occurrence, extent, impact labels |

The actual model feature set should be hazard-specific; the master store simply makes the platform coherent.

---

# 18. Spatial design

## Recommended operational grid

Start with:

> **500 m × 500 m cells** for the operational risk map.

Why:

- Easier to process than extremely fine grids.
- Appropriate compromise for multiple heterogeneous data sources.
- Easier for demo-scale inference.
- Easier to aggregate population and infrastructure.
- Supports consistent comparison between hazard layers.

Potential future resolution:

- 250 m for selected hazards/regions.
- Finer resolution only when source data actually support it.

### Critical caveat

Do not create “fake precision” by resampling coarse data to small cells and then presenting the result as equally precise.

For example:

- IMD historical rainfall is 0.25°.
- WorldPop is about 100 m.
- SRTM is about 30 m.

These source resolutions are different. The model needs to account for that uncertainty.

---

# 19. Temporal design

Use multiple temporal resolutions:

| Data | Typical role |
|---|---|
| Historical rainfall | Daily / aggregated |
| ERA5 | Hourly |
| River observations | Hourly or station-dependent |
| Cyclone observations | Track updates |
| Satellite | Event/revisit dependent |
| Citizen reports | Near real-time |
| Shelter status | Near real-time |
| Road status | Near real-time |
| GPS | Near real-time |

Operational system:

> Run the decision pipeline whenever meaningful new data arrives, rather than pretending every source updates at the same frequency.

A 5–15 minute simulated event loop can be used for the demo, while real source update rates remain metadata on each feed.

---

# 20. Training data construction

This is one of the most important parts of the ML system.

We should not simply download a dataset and call it training data.

The pipeline should be:

```text
Raw datasets
    ↓
Quality control
    ↓
Spatial alignment
    ↓
Temporal alignment
    ↓
Feature engineering
    ↓
Historical event matching
    ↓
Label generation
    ↓
Training samples
    ↓
Temporal/spatial split
    ↓
Model training
```

---

# 21. Flood training dataset design

For the MVP, the flood model should be the first fully implemented hazard model.

## 21.1 Training unit

Each training example can represent:

```text
grid cell + timestamp + forecast horizon
```

Example:

```text
Grid: Odisha_500m_018392
Reference time: 2024-08-10 06:00
Horizon: next 6 hours
```

Features might include:

```text
rain_1h
rain_6h
rain_24h
rain_72h
rain_7d
rain_anomaly
river_level
river_rise_rate
elevation
slope
flow_accumulation
distance_to_river
soil_features
land_cover_features
historical_flood_frequency
```

Label:

```text
flood_next_6h = 0 or 1
```

The label must come from real historical event/flood observations or derived flood masks, not from the same formula used to create the input features.

---

# 22. Avoiding circular ML

Do **not** do this:

```text
rainfall + elevation + population
        ↓
hand-made risk score
        ↓
train ML model to predict risk score
```

That teaches the model to imitate our own formula rather than discover a real-world relationship.

Prefer:

```text
weather + hydrology + terrain
        ↓
ML model
        ↓
probability of observed/labelled flood
        ↓
GIS + exposure + vulnerability
        ↓
risk
```

This produces a much cleaner separation between prediction and decision logic.

---

# 23. Flood model choice

## MVP model: XGBoost classifier

Recommended first model:

> **XGBoost / gradient-boosted decision trees**

Why:

- Excellent for heterogeneous tabular data.
- Works well with nonlinear relationships.
- Handles feature interactions.
- Fast enough for frequent inference.
- Easier to explain than a large neural network.
- Requires much less training complexity than a full spatio-temporal deep network.

Model output:

```text
P(flood within forecast horizon)
```

Example:

```text
Grid A: 0.06
Grid B: 0.39
Grid C: 0.87
```

Do not automatically call 0.87 “critical risk.”

Probability of hazard is one input to the risk engine.

---

# 24. Flood segmentation model: later stage

After the classification model works, add a segmentation model.

Possible architecture:

> U-Net / CNN-based segmentation using satellite imagery + contextual features.

Input:

- Sentinel-1 SAR imagery.
- Optional optical imagery where cloud conditions allow.
- Terrain/context layers.

Output:

```text
pixel-level flood probability / inundation mask
```

This model is useful for:

- Event mapping.
- Post-event verification.
- Improving flood-extent polygons.

For the hackathon, this is optional; a strong tabular model + GIS pipeline is easier to make reliable.

---

# 25. Cyclone ML model

Cyclone modeling should not attempt to replace operational meteorological forecasting.

Use historical tracks to learn impact-related patterns.

Possible model targets:

```text
impact_probability(grid, horizon)
wind_risk(grid, horizon)
heavy_rain_probability(grid, horizon)
```

Features:

```text
cyclone_lat
cyclone_lon
max_wind
central_pressure
translation_speed
movement_direction
distance_to_grid
bearing_to_grid
wind_radius
sea_surface_temperature
rainfall
coastal_elevation
```

IBTrACS provides historical track/location/intensity data suitable for historical feature construction. citeturn681851search1turn681851search3

---

# 26. Heatwave model

Possible target:

```text
heatwave_or_heatstress_next_24h = 0/1
```

Features:

```text
temp_max
temp_min
temp_mean
humidity
dewpoint
heat_index
duration_of_heat
temperature_anomaly
nighttime_temperature
wind
urban_fraction
population_density
vulnerability_features
```

Potential model:

- XGBoost for tabular prediction.
- Logistic regression as baseline.
- Time-series model only if the dataset justifies the added complexity.

---

# 27. Landslide model

Possible target:

```text
landslide_probability(grid, horizon)
```

Features:

```text
rain_1h
rain_24h
rain_72h
antecedent_rainfall
slope
aspect
curvature
elevation
soil
geology
land_cover
distance_to_stream
distance_to_road
historical_landslide_frequency
SAR_deformation_signal
```

Model:

- XGBoost / Random Forest initially.
- Deep segmentation or spatio-temporal model later if labels and imagery justify it.

---

# 28. Lightning model

Possible target:

```text
lightning_probability(grid, horizon)
```

Features:

```text
recent_strike_density
storm_cell_activity
rainfall
temperature
humidity
pressure
wind
atmospheric_instability_features
historical_strike_density
```

Output should include uncertainty because lightning is highly variable in space and time.

---

# 29. Drought model

Drought is fundamentally different from an acute flood event because it develops over longer periods.

Possible target:

```text
drought_state
```

or

```text
future_drought_severity
```

Features:

```text
rainfall_deficit
SPI/SPEI-like indices
soil_moisture
temperature_anomaly
vegetation_anomaly
ET
duration
reservoir/water indicators
```

The model may operate on weekly/monthly windows rather than 5–15 minute event updates.

---

# 30. Storm surge model

For the first system, use a hybrid approach.

Inputs:

```text
cyclone_track
max_wind
central_pressure
wind_field
sea_level
tide
coastal_elevation
bathymetry
coastline_geometry
```

Output:

```text
surge_height / surge_probability / affected coastal geometry
```

A full hydrodynamic storm-surge simulator is outside the reasonable MVP scope. The architecture should reserve an adapter for a more advanced model later.

---

# 31. Common risk engine

The hazard model produces hazard state.

The risk engine converts hazard state + exposure + vulnerability into actionable spatial risk.

Conceptually:

```text
Risk = f(Hazard, Exposure, Vulnerability)
```

A transparent MVP implementation can normalize factors to [0,1]:

```text
hazard_score
exposure_score
vulnerability_score
        ↓
weighted / calibrated risk function
        ↓
Low / Moderate / High / Critical
```

### Important

The weights and thresholds must be documented.

Do not hide them inside an opaque “AI risk score.”

The system should be able to answer:

> Why is this location Critical?

Example explanation:

```text
Risk level: CRITICAL

Primary drivers:
- High predicted flood probability: 0.87
- Rapid river rise
- Low local elevation
- High population exposure
- Major road corridor inside predicted impact area
- Nearby shelter capacity is insufficient
```

This directly supports the problem statement's emphasis on explainability of risk classification. fileciteturn0file1L3-L3

---

# 32. Exposure engine

Exposure is calculated geographically.

Example:

```text
Predicted flood polygon
          ×
Population raster
          ↓
Affected population
```

Similarly:

```text
Flood polygon × road network
Flood polygon × hospitals
Flood polygon × schools
Flood polygon × bridges
Flood polygon × shelters
```

Outputs:

```json
{
  "affected_population": 18420,
  "affected_roads_km": 37.4,
  "affected_hospitals": 2,
  "affected_shelters": 3,
  "affected_bridges": 4
}
```

This is much more defensible than asking one ML model to learn all of these quantities simultaneously.

---

# 33. Vulnerability engine

Vulnerability answers:

> “Given exposure to this hazard, how difficult is recovery/response likely to be?”

Potential features:

- Population density.
- Children/elderly exposure.
- Healthcare accessibility.
- Distance to shelter.
- Road accessibility.
- Housing/infrastructure characteristics where available.
- Historical impact severity.
- Social vulnerability indicators where ethically and legally appropriate.
- Isolation/access constraints.

Important design principle:

> Vulnerability indicators should be interpretable and documented. Avoid inventing individual-level vulnerability scores without trustworthy data and governance.

---

# 34. Impact Intelligence Engine

The impact engine answers:

> “What could this hazard actually affect?”

Potential outputs:

```text
Population affected
Roads blocked
Bridges at risk
Hospitals affected
Shelters affected
Schools affected
Emergency demand
Power/utility risk where data exist
```

Some impacts are deterministic GIS calculations.

Some can be learned with ML when historical labels exist.

Example ML target:

```text
medical_demand_next_6h
```

or

```text
food_water_demand_next_12h
```

Features might include:

```text
population_exposed
hazard_intensity
historical_demand
facility_density
severity
accessibility
```

---

# 35. Cascading Impact Engine

This is the system's cross-hazard intelligence layer.

Instead of claiming that an opaque neural network “predicts the future,” represent known disaster dependencies explicitly.

Example:

```text
Cyclone
   ↓
Heavy rainfall
   ↓
Urban / river flooding
   ↓
Road blockage
   ↓
Route failure
   ↓
Reduced hospital accessibility
   ↓
Medical response demand rises
```

Another:

```text
Cyclone
   ↓
Storm surge
   ↓
Coastal inundation
   ↓
Road / shelter exposure
   ↓
Evacuation bottleneck
```

### MVP implementation

Use a dependency graph containing:

- Hazard nodes.
- Infrastructure nodes.
- Operational nodes.
- Impact relationships.
- Confidence/probability values.

### Future implementation

Historical data can be used to estimate conditional transition probabilities:

```text
P(road_blockage | flood_intensity, road_type)
```

```text
P(medical_demand_increase | flood_population_exposure)
```

That creates an increasingly data-driven cascade engine without forcing everything into a single black-box model.

---

# 36. Citizen intelligence ML

Citizen reports are a secondary but valuable input source.

Example report:

> “Water has entered houses near the market. Children are stuck and the main road is blocked.”

The NLP pipeline should convert this into:

```json
{
  "category": ["flood", "rescue", "road_blockage"],
  "severity": "high",
  "location": "market area",
  "people_affected": "unknown",
  "confidence": 0.88,
  "timestamp": "..."
}
```

Pipeline:

```text
Citizen report
      ↓
Language detection / normalization
      ↓
Embedding
      ↓
Text classifier
      ↓
Entity extraction
      ↓
Geolocation
      ↓
Spatial clustering
      ↓
Hotspot generation
      ↓
Risk / impact layer
```

Useful categories:

```text
rescue
medical
food
water
shelter
road blockage
power outage
flooding
landslide
fire
missing person
infrastructure damage
```

For spatial clustering, DBSCAN/HDBSCAN is appropriate because emergency reports form irregular geographic clusters.

Citizen intelligence must feed the core intelligence engine; it should not become a separate social-media feature.

---

# 37. Resource optimization engine

Resource allocation is not primarily an ML task.

Suppose there are:

```text
10 ambulances
6 rescue teams
4 boats
8 medical teams
5 supply vehicles
```

and:

```text
Zone A: medical demand 80
Zone B: rescue demand 120
Zone C: food/water demand 150
```

The system must allocate limited resources.

Use:

- Linear programming.
- Integer programming.
- Constraint optimization.
- Greedy/heuristic methods for rapid fallback.

Objective examples:

```text
maximize people served
minimize response time
minimize route risk
respect resource capacity
respect shelter capacity
respect vehicle availability
```

The optimizer receives predictions from ML and returns decisions.

---

# 38. Evacuation engine

The system should not simply choose the nearest shelter.

It should select the **safest feasible shelter**.

Inputs:

```text
current location
predicted hazard map
road network
road status
shelter capacity
shelter status
travel time
route risk
```

Example decision:

```text
Shelter A: 2.1 km away, route crosses high-risk flood cell
Shelter B: 3.4 km away, route remains low-risk, capacity available
```

The engine should prefer the feasible route/shelter based on the configured objective and constraints.

Recommended approach:

- Dijkstra / A* for routing.
- Risk-aware edge costs.
- Capacity constraints.
- Dynamic road closures.
- Recalculation after hazard updates.

---

# 39. What-if simulation engine

The system should allow an operator to modify assumptions.

Example:

> “What happens if rainfall increases by 50 mm?”

Pipeline:

```text
Operator input
      ↓
Scenario feature modification
      ↓
Run hazard model
      ↓
Recalculate risk
      ↓
Recalculate exposure/impact
      ↓
Update cascades
      ↓
Re-run resource optimizer
      ↓
Recalculate evacuation routes
      ↓
Compare with baseline
```

Output:

```text
Baseline:
12 high-risk zones
18,000 people exposed

Scenario:
19 high-risk zones
27,500 people exposed
+52.8% affected population
```

This is one of the strongest demonstration features because it shows that the platform is a decision-support system rather than a static map.

---

# 40. LLM integration

## The LLM is not the prediction engine

The LLM should **not** be trusted to:

- Predict flood probability directly from prose.
- Invent geographic values.
- Allocate emergency resources from text alone.
- Choose evacuation routes by itself.
- Override safety rules.
- Generate unsupported risk values.

Instead:

```text
ML + GIS + Optimization + Simulation
                ↓
          Structured State
                ↓
               LLM
                ↓
 Explanations / summaries / queries
```

The LLM is the **AI copilot and reasoning interface over verified system outputs**.

---

# 41. LLM tool-calling architecture

The LLM should have access to controlled backend tools.

Suggested tools:

```text
get_zone_risk(zone_id)
get_impact_prediction(zone_id)
get_hazard_state(hazard_type, area)
get_shelters(area)
get_resource_status()
get_citizen_hotspots(area)
calculate_evacuation_route(origin, constraints)
optimize_resources(event_id)
simulate_scenario(parameters)
get_recent_updates(area)
get_model_explanation(zone_id)
```

Example:

Operator asks:

> “Why is Zone B critical?”

LLM flow:

```text
User question
    ↓
LLM interprets request
    ↓
get_zone_risk("Zone B")
    ↓
Backend returns structured JSON
    ↓
LLM explains result
```

The LLM should never invent the answer when the backend has a tool for retrieving it.

---

# 42. Example LLM interaction

### User

> Why is the coastal ward high risk?

### Tool output

```json
{
  "hazard": "flood",
  "probability": 0.84,
  "river_rise_rate": 0.21,
  "population_exposed": 12800,
  "shelter_capacity_gap": 3400,
  "road_risk": "high",
  "drivers": [
    "high 24h rainfall",
    "rapid river rise",
    "low elevation",
    "high population exposure"
  ]
}
```

### LLM answer

> The ward is classified as high risk mainly because the predicted flood probability is 84%, the river is rising rapidly, and the area has low elevation and high population exposure. The current shelter network has an estimated capacity gap of about 3,400 people, while a major road corridor is also at elevated risk.

The answer is generated from structured system data rather than guessed by the LLM.

---

# 43. LLM and natural-language simulation

Operator:

> What if rainfall increases by 50 mm over the next 6 hours?

LLM:

```text
simulate_scenario(
    rainfall_delta=50,
    horizon=6h,
    region="target region"
)
```

Simulation backend:

```text
new features
    ↓
flood model
    ↓
risk engine
    ↓
impact engine
    ↓
cascade engine
    ↓
resource optimizer
```

LLM then summarizes the result.

This gives the platform an advanced natural-language decision interface without pretending the LLM itself is doing geospatial forecasting.

---

# 44. LLM and incident briefing

The LLM can generate:

- Situation reports.
- Shift handover notes.
- Executive summaries.
- Zone summaries.
- Resource shortfalls.
- Evacuation warnings.
- “What changed?” summaries.

Example:

> **Current situation:** Flood probability increased across 14 grid zones after the latest rainfall and river-level update. Three roads have moved to restricted status. Estimated exposed population increased by approximately 18%. Shelter capacity is below projected demand in two zones.

Every generated statement should be grounded in current structured data.

---

# 45. LLM architecture with safeguards

```text
                  OPERATOR
                      |
                      v
                 +---------+
                 |   LLM   |
                 +----+----+
                      |
              Tool-calling only
                      |
    +-----------------+-------------------+
    |          |          |       |       |
    v          v          v       v       v
  Risk       Impact     Route   Resource  Sim
  Tool       Tool       Tool     Tool    Tool
    |          |          |       |       |
    +----------+----------+-------+-------+
                       |
                       v
                 VERIFIED STATE
                       |
                       v
                 LLM RESPONSE
```

Safety rules:

1. Numerical values come from backend tools.
2. Geography comes from GIS services.
3. Risk classifications come from the risk engine.
4. Routes come from the routing engine.
5. Resource allocations come from the optimizer.
6. The LLM explains and coordinates interaction; it does not silently change system state.

---

# 46. Explainable AI

For tree-based models, use SHAP or equivalent feature-attribution techniques.

For each prediction provide:

```text
prediction
confidence
model version
top contributing features
feature values
```

Example:

```text
Flood probability: 0.87
Confidence: 0.83

Top factors:
+ high 24h rainfall
+ rapidly rising river level
+ low elevation
+ high flow accumulation
- moderate slope
```

The interface should allow the operator to inspect these drivers.

This is consistent with the problem statement's emphasis on explaining why an area received a particular risk classification. fileciteturn0file1L3-L3

---

# 47. Confidence and uncertainty

Every model should return more than one number.

Minimum:

```text
probability
confidence
prediction horizon
data freshness
model version
```

Example:

```json
{
  "probability": 0.87,
  "confidence": 0.83,
  "horizon_hours": 6,
  "data_age_minutes": 8,
  "model_version": "flood-xgb-v1"
}
```

Uncertainty should increase when:

- Sensors are missing.
- Inputs are stale.
- The prediction is outside training distribution.
- Historical labels are sparse.
- Source resolutions are coarse.

---

# 48. Out-of-distribution and data quality checks

Before using new data in inference:

```text
schema validation
    ↓
range validation
    ↓
missing-data check
    ↓
timestamp freshness
    ↓
spatial validity
    ↓
outlier detection
    ↓
feature distribution monitoring
```

Examples:

```text
rainfall < 0 → invalid
river level physically impossible → flag
GPS outside expected region → flag
missing critical sensor → reduce confidence
```

The platform should degrade gracefully rather than fail silently.

---

# 49. Real-time ML inference loop

The operational cycle is:

```text
NEW DATA
  ↓
INGEST
  ↓
VALIDATE
  ↓
UPDATE FEATURE STORE
  ↓
RUN HAZARD MODELS
  ↓
CALCULATE HAZARD STATE
  ↓
UPDATE RISK
  ↓
UPDATE IMPACT
  ↓
CHECK CASCADES
  ↓
RE-OPTIMIZE RESOURCES
  ↓
RECALCULATE ROUTES
  ↓
UPDATE DASHBOARD
  ↓
LLM CONTEXT REFRESH
  ↓
WAIT FOR NEXT UPDATE
```

Important:

> Training happens offline. Inference happens online.

Do not retrain the entire model every 5–15 minutes.

---

# 50. Model retraining strategy

Recommended:

```text
Offline historical training
        ↓
Model evaluation
        ↓
Model registry
        ↓
Staging
        ↓
Validation
        ↓
Production
```

Retraining can happen:

- Periodically.
- After sufficient new labels accumulate.
- When monitoring detects degradation.
- After major data-source changes.

For hackathon implementation, a simple manual retraining pipeline is sufficient.

---

# 51. Training / validation / testing split

## Do NOT use a random row split

Disaster data are spatially and temporally correlated.

Random train/test splitting can cause leakage because neighboring cells or adjacent timestamps from the same disaster event can appear in both sets.

Recommended:

### Temporal split

```text
Older events → training
Middle period → validation
Recent events → test
```

### Spatial holdout

```text
Several districts/basins → train
Different district/basin → test
```

The strongest evaluation setup can combine both:

```text
train = historical periods + selected regions
validation = later period + selected regions
test = future period + held-out region
```

This provides a more realistic estimate of generalization.

---

# 52. Model evaluation metrics

## Classification

Use:

- Precision.
- Recall.
- F1.
- PR-AUC.
- ROC-AUC.
- Calibration / Brier-style measures.

For rare disaster events, PR-AUC and recall are particularly useful.

## Regression

Use:

- MAE.
- RMSE.
- R².

## Spatial segmentation

Use:

- IoU.
- Precision.
- Recall.
- F1/Dice.

## Operational decision quality

Measure:

```text
response time
population served
unmet demand
route safety / risk
resource utilization
shelter utilization
false alarm burden
```

The last group matters because the project is a decision-support system, not merely a model leaderboard.

---

# 53. Multi-hazard feature strategy

The master feature store is shared, but every model gets a feature subset.

## Flood

```text
rain + river + terrain + soil + land cover + historical floods
```

## Cyclone

```text
track + wind + pressure + rainfall + coastal geography
```

## Storm surge

```text
cyclone + sea level + tide + coastal elevation + bathymetry
```

## Heatwave

```text
temperature + humidity + duration + nighttime heat + urbanization
```

## Landslide

```text
rainfall + slope + soil + geology + land cover + drainage + deformation
```

## Lightning

```text
storm activity + atmospheric conditions + recent strikes + rainfall
```

## Drought

```text
rainfall deficit + temperature + soil moisture + vegetation + duration
```

That is the actual multi-hazard ML structure.

---

# 54. Cross-hazard interactions

The system should also support combined events.

Examples:

```text
Cyclone → Flood
Cyclone → Storm Surge
Cyclone → Lightning
Cyclone → Landslide in saturated terrain
Heavy Rain → Flood + Landslide
Heatwave → Water stress + health demand
Drought → Agricultural stress + water shortage
```

The cross-hazard layer should not force one ML model to predict every event.

Instead:

```text
Hazard A state
      +
Hazard B state
      +
Spatial dependencies
      ↓
Cascading impact analysis
```

---

# 55. Data dependency table

| Data | Flood | Cyclone | Surge | Heatwave | Landslide | Lightning | Drought |
|---|---:|---:|---:|---:|---:|---:|---:|
| Rainfall | ✅ | ✅ | ✅ | ◐ | ✅ | ✅ | ✅ |
| Temperature | ◐ | ✅ | ◐ | ✅ | ◐ | ✅ | ✅ |
| Humidity | ◐ | ✅ | ◐ | ✅ | ◐ | ✅ | ◐ |
| Wind | ◐ | ✅ | ✅ | ✅ | ◐ | ✅ | ◐ |
| Pressure | ◐ | ✅ | ✅ | ✅ | ◐ | ✅ | ◐ |
| River level | ✅ | ◐ | ◐ | — | ◐ | — | ◐ |
| Elevation | ✅ | ◐ | ✅ | ◐ | ✅ | — | ◐ |
| Slope | ✅ | — | — | — | ✅ | — | ◐ |
| Soil | ✅ | — | — | — | ✅ | — | ✅ |
| Land cover | ✅ | ◐ | ◐ | ✅ | ✅ | ◐ | ✅ |
| Cyclone track | ◐ | ✅ | ✅ | — | ◐ | — | — |
| Sea level/tide | — | ◐ | ✅ | — | — | — | — |
| Population | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Roads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Historical events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Satellite | ✅ | ✅ | ✅ | ✅ | ✅ | ◐ | ✅ |

Legend:

- ✅ important
- ◐ useful/contextual
- — not normally required for the core model

---

# 56. Dataset classification: what gets trained?

## Direct training labels

These are the most important for model training:

```text
Flood event / flood extent labels
Cyclone impact/event labels
Heatwave event labels
Landslide event labels
Lightning strike labels
Drought labels
Storm surge labels
Historical impact/demand labels where available
```

## Predictive features

These explain the hazard:

```text
Rainfall
Temperature
Humidity
Wind
Pressure
River levels
Soil moisture
Elevation
Slope
Land cover
Satellite-derived features
Cyclone track variables
```

## Exposure data

```text
Population
Buildings
Roads
Hospitals
Schools
Shelters
Bridges
Critical infrastructure
```

## Operational state

```text
Road status
Shelter capacity
Hospital capacity
Vehicle GPS
Resource inventory
Citizen reports
```

The model should not confuse these four categories.

---

# 57. Minimum data required for flood MVP

The first working flood system does not need every dataset in this document.

### Must-have

```text
1. Historical flood labels
2. IMD rainfall
3. Elevation
4. River data where available
5. Population
6. Roads
7. Critical facilities/shelters
```

### Strongly recommended

```text
8. Land cover
9. Soil
10. Sentinel-1 flood validation
11. Historical flood severity/impact
```

### Later

```text
12. High-resolution hydrologic modeling
13. Deep satellite segmentation
14. Advanced spatio-temporal neural networks
15. Learned cascade probabilities
```

---

# 58. Minimum data required for each future hazard

## Cyclone

```text
IBTrACS
ERA5 / weather variables
coastal elevation
population
roads/infrastructure
sea-surface / coastal variables where needed
```

## Storm surge

```text
cyclone track/intensity
sea level/tide
coastal elevation
bathymetry
population/infrastructure
```

## Heatwave

```text
temperature
humidity/dew point
population
urbanization/land cover
health facility layer
historical heatwave labels
```

## Landslide

```text
rainfall
SRTM terrain
soil
geology
land cover
historical landslide inventory
Sentinel-1 where useful
roads/population
```

## Lightning

```text
lightning strike history
weather variables
atmospheric instability indicators
historical storm activity
population/infrastructure
```

## Drought

```text
rainfall history
soil moisture
temperature
vegetation indices
land cover
water-resource indicators
historical drought labels
```

---

# 59. Data acquisition priority

| Priority | Dataset | Purpose |
|---|---|---|
| P0 | IFI-Impacts | Flood labels |
| P0 | IMD rainfall | Flood/weather features |
| P0 | SRTM | Terrain |
| P0 | WorldPop | Exposure |
| P0 | OSM | Roads/facilities |
| P0 | Historical event replay | Real-time demo |
| P1 | River levels | Flood improvements |
| P1 | ERA5 | Weather enrichment |
| P1 | Sentinel-1 | Flood validation |
| P1 | Land cover | Flood/heat/landslide context |
| P1 | Soil | Flood/landslide/drought |
| P2 | IBTrACS | Cyclone model |
| P2 | Lightning inventory | Lightning model |
| P2 | Landslide inventory | Landslide model |
| P2 | Heatwave labels | Heat model |
| P2 | Drought labels/indices | Drought model |
| P2 | Surge data | Storm-surge module |

---

# 60. What the data engineering layer has to do

The data pipeline should perform:

```text
Download / ingest
      ↓
Parse
      ↓
Normalize units
      ↓
Convert coordinate systems
      ↓
Clip to AOI
      ↓
Spatially align
      ↓
Temporally align
      ↓
Handle missing values
      ↓
Validate ranges
      ↓
Create derived features
      ↓
Store standardized features
```

Every record should maintain metadata such as:

```text
source
source_version
retrieval_time
observation_time
spatial_resolution
temporal_resolution
units
license
quality_flag
```

This will make the project far more defensible during judging.

---

# 61. Data lineage

Every model prediction should be traceable.

Example:

```text
Risk for Grid 18392 at 18:00
        ↓
Flood model v1
        ↓
Features generated at 17:52
        ↓
IMD rainfall
CWC river level
SRTM terrain
WorldPop exposure
        ↓
Risk engine v1
        ↓
Final risk = High
```

The UI does not need to show all of this by default, but the backend should retain it.

---

# 62. Database design

A geospatial database such as PostgreSQL + PostGIS is suitable for:

- Hazard polygons.
- Grid cells.
- Risk scores.
- Assets.
- Roads.
- Shelters.
- Resource locations.
- Citizen reports.
- Model outputs.

Time-series data can be stored efficiently with a dedicated time-series strategy if necessary.

Raster products can remain in object/file storage and be represented by references/derived features in the main database.

---

# 63. Recommended ML backend stack

A practical stack:

```text
Python
├── pandas / polars
├── NumPy
├── scikit-learn
├── XGBoost
├── SHAP
├── GeoPandas
├── Rasterio
├── GDAL tools
├── Shapely
├── PyProj
└── NetworkX / optimization libraries
```

Potential later additions:

```text
PyTorch
TorchGeo
raster / deep-learning libraries
MLflow
DVC
Airflow / Prefect
Kafka / Redpanda
```

Do not introduce every technology just because it is available.

The hackathon version should remain manageable.

---

# 64. Suggested service architecture

```text
Frontend / Command Center
          |
          v
API Gateway
          |
  +-------+----------------------------------+
  |       |           |          |            |
  v       v           v          v            v
Hazard  Risk       Impact     Routing      Resource
API     API        API        API          API
  |       |           |          |            |
  +-------+-----------+----------+------------+
                      |
                      v
                Decision State
                      |
                      v
                  LLM Service
                      |
                      v
                 AI Copilot
```

ML services can be exposed through FastAPI.

---

# 65. Suggested model-service contract

Example endpoint concept:

```http
POST /predict/flood
```

Input:

```json
{
  "timestamp": "2026-10-03T18:00:00Z",
  "grid_ids": ["g1", "g2", "g3"],
  "horizon_hours": 6
}
```

Output:

```json
{
  "model_version": "flood-xgb-v1",
  "predictions": [
    {
      "grid_id": "g1",
      "probability": 0.22,
      "confidence": 0.81
    },
    {
      "grid_id": "g2",
      "probability": 0.87,
      "confidence": 0.83
    }
  ]
}
```

This contract lets the rest of the system remain independent of the ML implementation.

---

# 66. Decision-state object

After all downstream engines run, create one normalized operational state.

Example:

```json
{
  "event_id": "OD-FLOOD-001",
  "timestamp": "2026-10-03T18:00:00Z",
  "hazards": [
    {
      "type": "flood",
      "probability": 0.87,
      "severity": "high"
    }
  ],
  "impact": {
    "population_exposed": 18420,
    "roads_at_risk_km": 37.4,
    "critical_facilities": 6
  },
  "resources": {
    "ambulance_shortfall": 3,
    "rescue_team_shortfall": 2
  },
  "evacuation": {
    "zones_needing_action": 4
  },
  "cascades": [
    "flood -> road blockage -> route disruption"
  ]
}
```

This is the main context the LLM should consume.

---

# 67. The “brain” of the system

The platform's intelligence is distributed:

```text
Hazard models
   = predict what the environment is doing

GIS
   = understand what is geographically exposed

Risk engine
   = combine hazard/exposure/vulnerability

Impact engine
   = estimate operational consequences

Cascade engine
   = reason over dependencies

Optimizer
   = decide how limited resources can be allocated

Routing
   = determine feasible movement

LLM
   = communicate, explain, query and orchestrate
```

That is more realistic than calling the LLM the brain of everything.

---

# 68. What should be genuinely ML vs deterministic

## ML

Use ML when the system needs to learn from historical examples:

```text
flood probability
heatwave probability
landslide probability
lightning probability
cyclone impact patterns
impact demand
citizen-text classification
```

## Deterministic / GIS

Use deterministic computation when the answer is directly calculable:

```text
population inside polygon
road length inside hazard area
distance to shelter
number of nearby hospitals
area flooded
spatial joins
```

## Optimization

Use optimization when choices must be made under constraints:

```text
resource allocation
shelter assignment
vehicle assignment
routing objective selection
```

## Simulation

Use simulation for scenarios:

```text
rainfall +50 mm
river level +0.5 m
road closure
shelter capacity reduction
resource loss
```

---

# 69. Multi-hazard event orchestration

Suppose the system receives a cyclone update.

```text
Cyclone track update
        ↓
Cyclone model
        ↓
Cyclone hazard state
        |
        +--> storm-surge module
        |
        +--> rainfall/flood module
        |
        +--> wind-impact module
        |
        +--> infrastructure exposure
        ↓
Combined risk map
        ↓
Cascade analysis
        ↓
Resource optimization
        ↓
Evacuation planning
```

This is the point of the multi-hazard architecture.

A single event can activate multiple hazard models.

---

# 70. Example end-to-end scenario

## Scenario

A severe weather system is approaching coastal Odisha.

### Step 1 — Sensor/weather update

Rainfall increases and cyclone track shifts toward the coast.

### Step 2 — Hazard models

Cyclone model updates impact probability.

Flood model receives updated rainfall conditions.

Storm surge module receives updated cyclone intensity.

### Step 3 — Risk engine

Three zones move from Moderate → High risk.

Two zones move High → Critical because population exposure and shelter constraints are high.

### Step 4 — Impact engine

System estimates:

```text
18,420 people exposed
37.4 km roads at risk
6 critical facilities affected
```

### Step 5 — Cascade engine

```text
flood → road blockage → reduced hospital access
```

### Step 6 — Resource optimization

Resources are redistributed toward zones with greatest unmet demand and feasible access.

### Step 7 — Evacuation

The routing engine removes unsafe road segments and chooses available shelters.

### Step 8 — LLM

The operator asks:

> “What changed in the last update?”

The LLM retrieves the change summary from the backend and explains it.

### Step 9 — New data

Another rainfall/river update arrives.

The entire loop runs again.

This is the intended **Sense → Understand → Predict → Decide → Act → Reassess** loop.

---

# 71. Model registry

Every production model should have:

```text
model_name
model_version
training_dataset_version
feature_version
training_period
training_regions
metrics
calibration
created_at
deployed_at
```

Example:

```text
flood-xgb-v1
training_data: flood_features_2026_01
training_period: 2000-2023
test_period: 2024
AOI: Odisha
F1: ...
PR-AUC: ...
```

Metrics should be real measured values; never insert placeholder numbers into the pitch.

---

# 72. Model monitoring

Monitor:

### Data drift

```text
rainfall distribution changed
river observations missing
feature distributions shift
```

### Prediction drift

```text
risk distribution changes significantly
```

### Performance drift

When future labels become available:

```text
precision
recall
F1
calibration
spatial error
```

This is a later-stage capability, not an MVP requirement.

---

# 73. Failure handling

The system should have graceful fallbacks.

Example:

```text
CWC river feed unavailable
        ↓
use last valid observation
        ↓
mark data as stale
        ↓
decrease confidence
```

If satellite data are unavailable:

```text
continue with weather + terrain + hydrology
```

If the LLM service fails:

```text
core ML/GIS/optimization system continues
```

This is important:

> The platform must not become unusable because the LLM is down.

---

# 74. Offline / degraded mode

A disaster platform should assume connectivity can become unreliable.

Core cached data:

```text
terrain
roads
shelters
hospitals
administrative boundaries
population
base maps
latest known hazard state
```

When connectivity returns:

```text
sync updates
recalculate
resolve conflicts
refresh state
```

The system should still be able to show the last trusted situation state in degraded mode.

---

# 75. Data licenses and responsible use

Every dataset needs a license/terms record in the metadata catalog.

Examples:

- WorldPop documents CC BY 4.0 for its datasets and notes additional ODbL considerations for datasets derived from OpenStreetMap or similar sources. citeturn880106search0
- ERA5 is distributed under CC-BY according to the current Copernicus catalogue. citeturn681851search9

For every source, the final implementation should record:

```text
source
license
attribution requirement
commercial use status
redistribution restrictions
API/access restrictions
```

Do not assume that “publicly downloadable” automatically means “unrestricted commercial redistribution.”

---

# 76. Data limitations that should be explicitly acknowledged

## Spatial mismatch

Different sources have very different resolution.

## Missing observations

Disaster-time sensors may fail or become unavailable.

## Label quality

Historical disaster inventories can contain reporting and digitization uncertainties.

## Class imbalance

Normal periods vastly outnumber disaster periods.

## Location bias

Some regions have better monitoring than others.

## Temporal leakage

Nearby times from the same event can make results look unrealistically strong.

## Simulated real-time data

Hackathon streams are demonstrations, not evidence of live operational deployment.

## Model uncertainty

Predictions should never be presented as guaranteed outcomes.

These limitations should increase credibility, not reduce it.

---

# 77. Data and model ethics

The system handles sensitive operational information.

Important principles:

- Minimize personally identifiable information in citizen reports.
- Aggregate citizen-demand signals spatially where possible.
- Avoid exposing individual locations unnecessarily.
- Keep operational access controlled.
- Log automated decisions and human overrides.
- Never treat a model prediction as an unquestionable command.
- Provide confidence and source provenance.

The goal is decision support for human operators, not autonomous command over emergency operations.

---

# 78. Recommended folder structure

```text
disaster-intelligence/
│
├── data/
│   ├── raw/
│   │   ├── rainfall/
│   │   ├── river/
│   │   ├── cyclone/
│   │   ├── satellite/
│   │   ├── terrain/
│   │   ├── population/
│   │   ├── infrastructure/
│   │   └── historical_events/
│   │
│   ├── processed/
│   ├── features/
│   └── labels/
│
├── models/
│   ├── flood/
│   ├── cyclone/
│   ├── heatwave/
│   ├── landslide/
│   ├── lightning/
│   └── drought/
│
├── services/
│   ├── ingestion/
│   ├── feature_engine/
│   ├── hazard_api/
│   ├── risk_engine/
│   ├── impact_engine/
│   ├── cascade_engine/
│   ├── routing_engine/
│   ├── optimizer/
│   └── llm_copilot/
│
├── notebooks/
├── evaluation/
├── configs/
├── scripts/
└── docs/
```

---

# 79. Development phases

## Phase 1 — Data foundation

Build:

```text
Odisha AOI
500m grid
IMD rainfall
SRTM terrain
WorldPop population
OSM roads/facilities
historical flood labels
```

Deliverable:

> One clean spatial-temporal feature dataset.

---

## Phase 2 — Flood ML

Build:

```text
feature engineering
label generation
XGBoost model
validation
SHAP explanations
prediction service
```

Deliverable:

> Flood probability map.

---

## Phase 3 — Risk + Impact

Build:

```text
risk fusion
population exposure
road exposure
critical asset exposure
Low/Moderate/High/Critical map
```

Deliverable:

> Explainable impact-based risk map.

---

## Phase 4 — Response intelligence

Build:

```text
shelter capacity
road status
routing
resource optimization
```

Deliverable:

> Action recommendations rather than only warnings.

---

## Phase 5 — Cascades

Build:

```text
hazard dependency graph
road failure dependencies
hospital accessibility impact
secondary event reasoning
```

Deliverable:

> Cascading impact view.

---

## Phase 6 — LLM copilot

Add:

```text
backend tools
structured decision state
natural-language queries
why-risk explanations
what-if commands
incident briefing
```

Deliverable:

> Operator AI copilot.

---

## Phase 7 — Multi-hazard expansion

Add models in this order as data becomes available:

```text
Flood
   ↓
Cyclone
   ↓
Storm Surge
   ↓
Heatwave
   ↓
Landslide
   ↓
Lightning
   ↓
Drought
```

The order can change based on data availability and hackathon priorities.

---

# 80. Hackathon MVP definition

The full vision is multi-hazard, but the first working implementation should be narrower.

## Build completely

```text
Flood hazard model
        ↓
Explainable risk map
        ↓
Impact estimation
        ↓
Cascade example
        ↓
Resource allocation
        ↓
Risk-aware evacuation
        ↓
What-if simulator
        ↓
LLM copilot
```

## Demonstrate architecturally

```text
Cyclone adapter
Heatwave adapter
Landslide adapter
Lightning adapter
Drought adapter
Storm-surge adapter
```

The architecture should make it obvious that these are separate hazard modules with a shared downstream layer.

---

# 81. How to explain this to a technical partner

Use the following explanation:

> We are not building one AI model that predicts disasters. We are building a multi-hazard intelligence pipeline. Each hazard gets its own prediction model because the physical drivers are different. Flood uses rainfall, river levels and terrain; cyclone uses track, wind and pressure; landslide uses rainfall, slope, soil and geology; heatwave uses temperature, humidity and duration; and so on.
>
> 
> Every hazard model outputs a standardized hazard state containing probability, intensity, affected geometry, time horizon and confidence. A common GIS risk engine then combines that with exposure and vulnerability. The impact engine calculates who and what is affected. A cascade engine models secondary consequences. Optimization allocates resources and the routing engine finds feasible evacuation paths.
>
> 
> The LLM sits on top of this verified state as an AI copilot. It can explain predictions, answer operator questions, call simulation tools and generate situation reports. It does not invent hazard probabilities, routes or resource allocations.
>
> 
> We will fully implement flood first because it gives us the strongest end-to-end demonstration. But the data model, model interface and downstream intelligence layer are multi-hazard from the beginning.

---

# 82. What the judges should see

The ideal demo should not start with a login screen or a generic dashboard.

Start with the event.

Example:

```text
CYCLONE / HEAVY RAIN EVENT
        ↓
Flood probability rises
        ↓
Risk map changes
        ↓
Population exposure appears
        ↓
Roads become unsafe
        ↓
Shelters show capacity gaps
        ↓
Resource optimizer reallocates teams
        ↓
Evacuation route changes
        ↓
Operator asks the LLM:
“Why did Zone B become critical?”
        ↓
LLM explains with actual model drivers
        ↓
Operator asks:
“What if rainfall increases by 50 mm?”
        ↓
Scenario result appears
```

That demonstrates the full:

> **Sense → Understand → Predict → Decide → Act → Reassess** loop.

---

# 83. The most important engineering decisions

## Decision 1

Use hazard-specific models.

## Decision 2

Use a common Hazard State interface.

## Decision 3

Separate hazard prediction from risk classification.

## Decision 4

Use GIS for exposure calculations rather than forcing everything into ML.

## Decision 5

Use optimization for resource allocation.

## Decision 6

Use routing algorithms for evacuation.

## Decision 7

Use a graph/rule-based cascade engine first.

## Decision 8

Use ML to learn impact relationships only where good labels exist.

## Decision 9

Use the LLM as an explanation/orchestration layer, not as the safety-critical prediction engine.

## Decision 10

Build multi-hazard interfaces now but implement one hazard end-to-end first.

---

# 84. Complete data checklist

## Core atmospheric

- [ ] Rainfall
- [ ] Temperature
- [ ] Humidity/dew point
- [ ] Wind speed/direction
- [ ] Pressure
- [ ] Other relevant atmospheric variables

## Hydrology

- [ ] River levels
- [ ] River discharge
- [ ] River station metadata
- [ ] Danger levels
- [ ] Historical hydrographs
- [ ] Soil moisture

## Terrain

- [ ] DEM
- [ ] Elevation
- [ ] Slope
- [ ] Aspect
- [ ] Curvature
- [ ] Flow accumulation
- [ ] Distance to water

## Environment

- [ ] Land cover
- [ ] Soil
- [ ] Geology
- [ ] Vegetation
- [ ] Water bodies

## Hazard history

- [ ] Flood inventory
- [ ] Cyclone tracks
- [ ] Heatwave records
- [ ] Landslide inventory
- [ ] Lightning records
- [ ] Drought records
- [ ] Storm surge records

## Exposure

- [ ] Population
- [ ] Age groups
- [ ] Buildings
- [ ] Roads
- [ ] Bridges
- [ ] Hospitals
- [ ] Schools
- [ ] Shelters
- [ ] Fire stations
- [ ] Police stations
- [ ] Utilities where available

## Real-time

- [ ] Rainfall stream
- [ ] River stream
- [ ] Cyclone updates
- [ ] Satellite updates
- [ ] Road status
- [ ] Shelter capacity
- [ ] Hospital capacity
- [ ] Vehicle GPS
- [ ] Citizen reports
- [ ] Field-team reports

## Model metadata

- [ ] Source version
- [ ] Dataset version
- [ ] Retrieval time
- [ ] Data freshness
- [ ] Spatial resolution
- [ ] Temporal resolution
- [ ] Units
- [ ] License
- [ ] Quality flags

---

# 85. Complete model checklist

## Hazard models

- [ ] Flood probability model
- [ ] Cyclone impact model
- [ ] Storm surge model
- [ ] Heatwave model
- [ ] Landslide model
- [ ] Lightning model
- [ ] Drought model

## Intelligence engines

- [ ] Hazard State standardization
- [ ] Risk fusion
- [ ] Exposure calculation
- [ ] Vulnerability scoring
- [ ] Impact prediction
- [ ] Cascade analysis
- [ ] Citizen intelligence
- [ ] Resource optimization
- [ ] Evacuation routing
- [ ] What-if simulation

## AI interface

- [ ] Tool calling
- [ ] Risk explanation
- [ ] Zone Q&A
- [ ] Incident briefing
- [ ] What-if queries
- [ ] Change summaries
- [ ] Provenance/grounding

## MLOps

- [ ] Feature versioning
- [ ] Model versioning
- [ ] Dataset versioning
- [ ] Evaluation reports
- [ ] Data quality checks
- [ ] Prediction monitoring
- [ ] Audit trail

---

# 86. Recommended first implementation in concrete technical terms

If development begins now, build this exact chain first:

```text
IMD rainfall
      +
SRTM DEM
      +
CWC river data where available
      +
IFI-Impacts flood history
      ↓
Feature engineering
      ↓
500m grid dataset
      ↓
XGBoost flood probability model
      ↓
SHAP explanations
      ↓
Hazard state
      ↓
WorldPop exposure overlay
      ↓
OSM roads + hospitals + shelters
      ↓
Risk engine
      ↓
Impact engine
      ↓
Cascade graph
      ↓
Resource optimizer
      ↓
Risk-aware route planner
      ↓
Decision state
      ↓
LLM copilot
```

This is the smallest version that still demonstrates the project's core thesis.

---

# 87. Final system architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCE LAYER                       │
│                                                             │
│ IMD | CWC | ERA5 | IBTrACS | Sentinel | SRTM | WorldPop   │
│ OSM | Historical Inventories | Sensors | Citizen Reports  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATA FUSION + FEATURE STORE                │
└────────────────────────────┬────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
     FLOOD ML          CYCLONE ML          HEATWAVE ML
          │                  │                  │
          ├────────── LANDSLIDE ML ────────────┤
          ├────────── LIGHTNING ML ────────────┤
          ├────────── DROUGHT ML ──────────────┤
          └────────── STORM SURGE ─────────────┘
                             │
                             ▼
                    COMMON HAZARD STATE
                             │
                             ▼
                     RISK FUSION ENGINE
                             │
                             ▼
                    IMPACT INTELLIGENCE
                             │
                             ▼
                     CASCADE ENGINE
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        RESOURCE OPTIMIZER        EVACUATION ENGINE
                │                         │
                └────────────┬────────────┘
                             ▼
                      DECISION STATE
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        EXPLAINABLE AI               LLM COPILOT
                │                         │
                └────────────┬────────────┘
                             ▼
                     COMMAND CENTER
                             │
                             ▼
                        NEW DATA
                             │
                             └────────── LOOP
```

---

# 88. Bottom line

The project should be thought of as a **multi-hazard decision intelligence platform**, not just an ML model.

The core intelligence path is:

> **Hazard prediction → spatial risk → impact → cascading consequences → resource/evacuation decisions → human-readable explanation → continuous reassessment.**

The ML layer is the predictive foundation, but ML alone does not solve the disaster-management problem.

The complete system combines:

```text
ML
+ GIS
+ Remote Sensing
+ Optimization
+ Simulation
+ Explainable AI
+ LLM
```

The most practical development strategy is:

> **Design for all hazards now. Fully implement flood first. Keep the downstream architecture common. Add additional hazard models as independent modules.**

That gives the project both a credible MVP and a technically coherent path toward the full multi-hazard platform described by the problem statement.

---

# 89. Primary source references

## Official / authoritative datasets

1. **India Meteorological Department — 0.25° daily gridded rainfall (1901–2024)**  
   https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html

2. **India Meteorological Department — Climate Research & Services / real-time gridded products**  
   https://www.imdpune.gov.in/lrfindex.php

3. **ERA5 — Copernicus Climate Data Store**  
   https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels

4. **India Flood Inventory with Impacts (IFI-Impacts), v4**  
   https://zenodo.org/records/16994648

5. **USGS SRTM / global elevation data**  
   https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-shuttle-radar-topography-mission

6. **WorldPop**  
   https://hub.worldpop.org/

7. **WorldPop India population 2025 product**  
   https://hub.worldpop.org/geodata/summary?id=73807

8. **WorldPop India age/sex 2025 product**  
   https://hub.worldpop.org/geodata/summary?id=104815

9. **NOAA IBTrACS**  
   https://www.ncei.noaa.gov/products/international-best-track-archive

10. **ESA Sentinel-1**  
    https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Introducing_the_Sentinel-1_mission

11. **OpenStreetMap map features**  
    https://wiki.openstreetmap.org/wiki/Map_features

## Project requirement source

12. **Official problem statement: Intelligent Multi-Hazard Disaster Management & Response System**  
    See the provided problem statement document, especially the requirements for hazard detection, risk assessment, impact prediction, resource planning, evacuation/response, real-time monitoring, explainability, data integration, and multi-hazard generalisability. fileciteturn0file1L3-L3

---

# 90. Source notes and verification status

The dataset facts in this document that are time-sensitive were checked against current source pages during preparation.

Verified examples include:

- IMD's current 0.25° daily gridded rainfall archive extending through 2024. citeturn507344search0turn507344search1
- ERA5 availability from 1940 to present and current catalogue metadata. citeturn681851search5turn681851search9
- IFI-Impacts v4 covering 1967–2023. citeturn681851search0
- SRTM 1 Arc-Second Global at approximately 30 m. citeturn681851search2turn681851search4
- WorldPop India 2025 population and age/sex products at approximately 100 m. citeturn880106search0turn880106search8
- IBTrACS v4r01 and its regular update schedule. citeturn681851search1
- Sentinel-1's all-weather, day/night C-band SAR capability. citeturn507344search2turn507344search11

Where a dataset's exact operational access depends on permissions, APIs or local availability, the architecture treats it as an integration point rather than assuming unrestricted live access.
