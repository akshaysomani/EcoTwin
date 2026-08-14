# EcoTwin

### Industrial Digital Twin & IoT Intelligence Platform

EcoTwin connects physical equipment telemetry with a digital intelligence layer — transforming raw sensor measurements from edge hardware into structured monitoring, energy analysis, equipment health assessment, sustainability analytics, operational insights, and ESG reporting.

---

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-HiveMQ-660066?style=flat-square&logo=mqtt&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## Overview

EcoTwin is a prototype Industrial IoT / Digital Twin platform built for edge-connected rotary equipment monitoring. A physical sensor node (ESP32 + DS18B20 + MPU6050 + INA219) publishes measurements over MQTT. Those readings are stored in Supabase and polled every 3 seconds by a React/Vite dashboard, which passes the telemetry through a suite of deterministic analytical engines to produce:

- Fused equipment health scores
- Statistical anomaly and trend detection
- Trapezoidal energy integration from validated electrical telemetry
- Rule-based maintenance recommendations
- Carbon footprint estimates (when a grid emission factor is configured)
- Structured ESG reports with explicit data-quality labelling
- Evidence-grounded operational Q&A via the Operations Copilot

---

## Problem Statement

Industrial equipment monitoring has historically relied on periodic inspections, manual log review, and disconnected sensor dashboards. This creates several operational gaps:

- **Visibility gaps** — sensor data is collected but rarely interpreted automatically
- **Reactive maintenance** — faults are discovered after failure, not before
- **Energy opacity** — electrical consumption is difficult to extract from raw measurements
- **Sustainability fragmentation** — carbon data, energy data, and equipment data live in separate systems
- **Telemetry trust issues** — invalid sensor readings can silently corrupt calculations if not validated

EcoTwin addresses these gaps for a single-node prototype environment, providing a unified intelligence layer over raw IoT telemetry.

---

## Solution

EcoTwin's pipeline converts edge telemetry into actionable intelligence:

```
Physical Equipment (5 V Motor)
         |
         v
+---------------------------+
|    ESP32 Sensor Node      |
|                           |
|  DS18B20  -- Temperature  |
|  MPU6050  -- Accel/Gyro   |
|  INA219   -- Voltage /    |
|              Current /    |
|              Power        |
+-----------+---------------+
            |
            |  Wi-Fi / MQTT
            v
+---------------------------+
|   HiveMQ MQTT Broker      |
|   (Cloud-hosted)          |
+-----------+---------------+
            |
            |  MQTT to Supabase Bridge
            |  (External -- not in this repo)
            v
+---------------------------+
|  Supabase (PostgreSQL)    |
|  Table: ecotwin_sensor    |
|         _readings         |
+-----------+---------------+
            |
            |  REST polling every 3 s
            v
+---------------------------+
|  EcoTwin Frontend         |
|  React 19 + Vite 8        |
+-----------+---------------+
            |
            v
+--------------------------------------------------+
|         Analytical Intelligence Layer            |
|                                                  |
|  energyEngine.js        -- Energy integration   |
|  healthEngine.js        -- Fused health score   |
|  predictiveEngine.js    -- Statistical risk     |
|  maintenanceEngine.js   -- Action items         |
|  sustainabilityEngine.js -- ESG analytics       |
|  copilotEngine.js       -- Evidence-based Q&A   |
|  reportEngine.js        -- ESG report payload   |
|  alertEngine.js         -- Alert deduplication  |
|  trendEngine.js         -- Regression/trends    |
|  decisionEngine.js      -- Decision synthesis   |
+--------------------------------------------------+
```

> **Note:** The MQTT-to-Supabase bridge is an external service not included in this repository. This repository contains the React frontend dashboard only.

---

## Key Capabilities

| Capability | Status | Description |
|---|---|---|
| **Live Telemetry Display** | Implemented | Polls Supabase every 3 s and renders latest DS18B20, MPU6050, and INA219 readings |
| **Equipment Health Score** | Implemented | Rule-based multi-sensor fusion: thermal + vibration + electrical + energy stability |
| **Statistical Anomaly Detection** | Implemented | Z-score analysis with noise floors and trend persistence tracking |
| **Energy Integration** | Implemented | Trapezoidal Wh integration from validated INA219 telemetry only |
| **Power Stability Scoring** | Implemented | Coefficient of Variation (CV) mapped to a 0-100 stability index |
| **Maintenance Recommendations** | Implemented | Rule-triggered, explainable action items with subsystem evidence |
| **Sustainability Analytics** | Implemented | Energy trend, data quality, and carbon footprint (when configured) |
| **Carbon Calculation** | Configurable | Requires user-input grid emission factor -- not calculated by default |
| **Operations Copilot** | Implemented | Deterministic intent classifier with evidence-grounded Q&A |
| **ESG Report Generation** | Implemented | Structured report payload with methodology notes and limitations |
| **Print / PDF Export** | Implemented | Browser window.print() triggered from Report Center |
| **Alert Deduplication** | Implemented | Alert persistence stored in Supabase with deduplication logic |
| **Energy Efficiency** | Not Available | Requires production-output denominator not present in current schema |
| **Carbon Avoidance/Savings** | Not Available | Requires baseline comparison period -- not configured |
| **Predictive ML Model** | Not Implemented | All risk scoring is statistical/rule-based, not ML-trained |
| **LLM Integration** | Not Implemented | Copilot is deterministic; architecture is described as LLM-ready |
| **CI/CD Pipeline** | Not Configured | No CI/CD workflow files present in repository |
| **Production Deployment** | Not Configured | No cloud deployment configuration exists in repository |

---

## Hardware / IoT Layer

The current prototype uses a single ESP32-based sensor node monitoring a **5 V DC motor**.

### DS18B20 -- Ambient Temperature

- 1-Wire digital temperature sensor
- Reports `temperature_c` in degrees Celsius
- Critical threshold: > 60 C | Monitor threshold: > 40 C

### MPU6050 -- 3-Axis Accelerometer & Gyroscope

- Reports `accel_x`, `accel_y`, `accel_z` (m/s2) and `mpu_temperature_c`
- Vibration deviation is computed by the dashboard by filtering Earth gravity:

```
Deviation = | sqrt(Ax^2 + Ay^2 + Az^2) - 9.81 |
```

- Critical threshold: > 3.0 m/s2 | Monitor threshold: > 1.0 m/s2

### INA219 -- Voltage / Current / Power Monitor

- Reports `bus_voltage_v` (V), `current_ma` (mA), `power_mw` (mW)
- Carries a hardware validation flag: `ina219_voltage_valid`
- The dashboard **only uses INA219 data** when `ina219_voltage_valid === true`

> **GPIO Assignments**: Refer to the hardware implementation source for current wiring. GPIO pin assignments are not documented in this frontend repository.

---

## Data Integrity -- INA219 Prototype Observations

> This section documents a known hardware observation and the platform response to it.

During hardware testing with the current 5 V motor prototype, INA219 readings of approximately:

- ~9.9 V (bus voltage)
- ~73-74 mA (current)
- ~0.73-0.74 W (power)

...were observed. These values exceed the expected operating envelope of a 5 V motor supply.

**EcoTwin intentionally rejects these readings as invalid.** The validation logic in `energyEngine.js` and `healthEngine.js` checks `ina219_voltage_valid` before including any electrical measurement in energy calculations, health scoring, or reporting. When `ina219_voltage_valid === false` and `bus_voltage_v > 6.0 V`, the platform:

- Marks electrical status as `INVALID` (not `UNAVAILABLE`)
- Excludes the readings from trapezoidal energy integration
- Surfaces a `CHECK_POWER_SUPPLY` maintenance recommendation
- Displays `CARBON CALCULATION NOT CONFIGURED` or `ENERGY UNAVAILABLE` in sustainability views
- Reports the raw observed voltage to the Operations Copilot as evidence of an over-voltage condition

**This is a deliberate data-integrity feature, not a bug.**

---

## Feature Modules

### Energy Intelligence

**Engine:** `src/utils/energyEngine.js`

Energy is calculated **exclusively from validated INA219 telemetry** (where `ina219_voltage_valid === true` and `sensor_ina219_ok !== false`).

**Power conversion:**
```
P(W) = power_mw / 1000
```

**Trapezoidal energy integration** (chronological valid readings):
```
Delta_Hours  = (T_curr - T_prev) / 3,600,000
Delta_Energy = ((P_prev + P_curr) / 2) * Delta_Hours
```

Intervals exceeding 1 hour are skipped to prevent error accumulation from network gaps.

**Power Stability Index** (Coefficient of Variation):
```
CV        = std_dev(power_mw) / mean(power_mw)
Stability = clamp(round((1 - CV) * 100), 0, 100)
```

**Power Trend** (linear regression over 5 or more valid readings):
- `INCREASING` -- relative slope > +1.5%
- `DECREASING` -- relative slope < -1.5%
- `VOLATILE`   -- stability < 60 and slope within bounds
- `STABLE`     -- otherwise

> If no valid INA219 readings exist, energy metrics are unavailable and no values are fabricated.

---

### Equipment Health

**Engines:** `src/utils/healthEngine.js` + `src/utils/predictiveEngine.js`

The fused health score starts at **100** and applies rule-based deductions:

| Signal | Condition | Deduction |
|---|---|---|
| Thermal | DS18B20 > 60 C (CRITICAL) | -30 pts |
| Thermal | DS18B20 40-60 C (MONITOR) | -10 pts |
| Thermal | Increasing trend | -5 pts |
| Vibration | Deviation > 3.0 m/s2 (CRITICAL) | -30 pts |
| Vibration | Deviation 1.0-3.0 m/s2 (MONITOR) | -15 pts |
| Vibration | Increasing trend | -5 pts |
| Electrical | Voltage invalid and > 6.0 V | -20 pts |
| Electrical | Active power > 5.0 W (HIGH_LOAD) | -20 pts |
| Electrical | Active power > 3.0 W (MONITOR) | -10 pts |
| Energy | Power stability < 70% | -10 pts |
| Anomaly | Anomaly score >= 60% | -10 pts |

**Minimum data threshold:** 5 telemetry records required before a fused score is calculated. Below this threshold, status is forced to `INSUFFICIENT_DATA`.

**Statistical anomaly detection** uses Z-scores with sensor-specific noise floors:

| Sensor | Noise Floor |
|---|---|
| Temperature | 0.25 C |
| Vibration | 0.10 m/s2 |
| Voltage | 0.05 V |

> **This is not a machine-learning model.** No neural networks or trained classifiers exist. Risk scoring is deterministic and rule-based.

---

### Maintenance Recommendations

**Engine:** `src/utils/maintenanceEngine.js`

Rule-triggered maintenance action items with subsystem attribution:

| Trigger Condition | Recommendation |
|---|---|
| Electrical status INVALID (voltage > 6.0 V on 5 V motor) | CHECK_POWER_SUPPLY |
| Vibration deviation CRITICAL (> 3.0 m/s2) | INSPECT_MOTOR |
| Vibration deviation MONITOR (1.0-3.0 m/s2) | MONITOR_VIBRATION |
| Temperature MONITOR or CRITICAL | MONITOR_TEMPERATURE |
| Electrical draws HIGH_LOAD (> 5.0 W) | CHECK_MOTOR_LOAD |
| Overall score >= 90 | NO_ACTION_REQUIRED |

Each recommendation includes: priority, subsystem, human-readable message, and evidence string.

---

### Sustainability & ESG Analytics

**Engine:** `src/utils/sustainabilityEngine.js`

**Carbon Footprint:**
```
Carbon (kgCO2e) = Energy (kWh) x Emission Factor (kgCO2e/kWh)
```

> **Carbon calculation requires:**
> 1. Valid energy data from INA219 (`energyAssessment.available === true`)
> 2. A user-configured grid emission factor entered in-app
>
> If either is absent, carbon is null and displayed as `NOT CONFIGURED`.
> No emission factor is hard-coded in the application.

**ESG Data Quality:**

| State | Condition |
|---|---|
| GOOD | Electrical coverage >= 80% |
| LIMITED | Coverage > 0% and < 80% |
| UNAVAILABLE | No valid electrical records |

**Metrics explicitly marked NOT AVAILABLE:**
- Energy efficiency (requires validated production-output denominator -- not in current schema)
- Carbon avoidance/savings (requires configured baseline -- not configured)
- Operational intensity (requires production-output denominator -- not configured)

---

### Operations Copilot

**Engine:** `src/utils/copilotEngine.js`

> **This is not a generative AI agent. No LLM, GPT, or external AI API is integrated.** The Copilot is a deterministic intent classifier grounded in live telemetry and calculated assessments already present in the dashboard.

The Copilot maps natural-language operator questions to structured evidence responses:

```
User Question (text input)
         |
         v
Intent Classification (keyword matching)
         |
         v
Context Retrieval (copilotContext.js -- live assessment payload)
         |
         v
Evidence Selection (telemetry values, engine outputs)
         |
         v
Structured Response (answer + evidence array + recommendations + confidence)
```

**Supported intent categories:**

| Intent | Example Trigger Keywords |
|---|---|
| EQUIPMENT_STATUS | health, status, condition, machine |
| ENERGY | energy, kwh, consumption, electricity |
| ELECTRICAL | power, voltage, current, ina219 |
| VIBRATION | vibration, accel, gyro, bearing |
| TEMPERATURE | temp, temperature, heat, ds18b20 |
| MAINTENANCE | maintenance, inspect, repair, action |
| SUSTAINABILITY | sustainability, carbon, co2, esg |
| ALERTS | alert, warning, critical, alarm |
| DATA_QUALITY | quality, coverage, missing, telemetry |

All responses carry: `answer`, `evidence[]`, `recommendations[]`, `confidence`, `dataAvailability`, and `timestamp`.

---

### ESG Reporting

**Engine:** `src/utils/reportEngine.js` | **Component:** `src/components/ReportCenter.jsx`

Aggregates all active assessment outputs into a structured ESG report payload.

**Report sections:**
- Report metadata (device ID, generation timestamp, status)
- Reporting period (record count, oldest and latest timestamp)
- Energy (total Wh/kWh, avg power, trend, stability, coverage)
- Electrical (validation status, valid/invalid record counts, latest readings)
- Equipment health (fused score, confidence, subsystem breakdown, reasons)
- Maintenance (active recommendations with priorities and evidence)
- Sustainability (carbon status, emission factor, insights)
- Active alerts (count and list)
- Methodology notes (energy integration method, carbon calculation method, data quality method)
- Data limitations (auto-generated from actual assessment state)

**Report status classifications:**

| Status | Condition |
|---|---|
| COMPLETE | >= 5 records, energy available, carbon configured |
| LIMITED | Missing energy data or unconfigured emission factor |
| INSUFFICIENT_DATA | Fewer than 5 telemetry records |

**Export:** Browser `window.print()` (print-to-PDF). CSV export is not currently implemented.

> Unavailable metrics are explicitly labelled `NOT CONFIGURED`, `NOT AVAILABLE`, or `UNAVAILABLE` -- they are never fabricated or zeroed.

---

## Dashboard Architecture

The dashboard uses hash-based client-side routing (`window.location.hash`) with six primary views:

| Route | Tab | Contents |
|---|---|---|
| `#/` | Overview | Device header, machine health card, sensor status, vibration, alerts panel, trend charts, analytics summary, AI decision panel |
| `#/health` | Health | Equipment health card, health breakdown, maintenance recommendation panel, maintenance timeline |
| `#/energy` | Energy | Energy overview, electrical quality, energy trend chart, energy insight panel |
| `#/sustainability` | Sustainability | Sustainability overview, carbon impact card, ESG data quality, sustainability trend chart, ESG summary, insights |
| `#/copilot` | AI Copilot | Operations Copilot chat interface, suggested actions |
| `#/reports` | Reports | Report center, report preview with print/PDF export |

Data is refreshed every **3,000 ms** from Supabase. Device online status is determined by checking whether the latest record timestamp is less than 15 seconds old.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| Language | JavaScript (ES Modules) | ES2022 |
| Data Layer | Supabase (PostgreSQL) | @supabase/supabase-js 2.x |
| Visualization | Recharts | 3.x |
| Icon Library | Lucide React | 1.x |
| Linting | ESLint | 10.x |
| Hardware (Edge) | ESP32 + DS18B20 + MPU6050 + INA219 | -- |
| Messaging (Edge) | MQTT via HiveMQ (cloud broker) | -- |

No additional UI framework (Tailwind, Material UI, Bootstrap, etc.) is used. All styling is vanilla CSS in `src/App.css`.

---

## Project Structure

```
ecotwin-frontend/
+-- index.html                   # Vite HTML entry point
+-- vite.config.js               # Vite configuration
+-- eslint.config.js             # ESLint configuration
+-- package.json                 # Dependencies and scripts
+-- .env.example                 # Environment variable template
+-- PHASE_8_IMPLEMENTATION.md    # Health & maintenance architecture notes
+-- PHASE_9_IMPLEMENTATION.md    # Sustainability & ESG architecture notes
+-- PHASE_10_IMPLEMENTATION.md   # Copilot architecture notes
+-- src/
    +-- main.jsx                 # React root render
    +-- App.jsx                  # Root component, data fetching, tab routing
    +-- App.css                  # Global styles (vanilla CSS)
    +-- index.css                # Base resets
    +-- supabase.js              # Supabase client initialisation
    +-- assets/                  # Static assets
    +-- services/
    |   +-- alertService.js      # Supabase alert persistence & deduplication
    +-- utils/
    |   +-- energyEngine.js      # Energy integration & power stability
    |   +-- healthEngine.js      # Multi-sensor fused health scoring
    |   +-- predictiveEngine.js  # Z-score anomaly & statistical risk
    |   +-- maintenanceEngine.js # Rule-based maintenance recommendations
    |   +-- sustainabilityEngine.js  # Carbon, ESG quality, insights
    |   +-- copilotEngine.js     # Deterministic intent classifier & Q&A
    |   +-- copilotContext.js    # Context payload builder for Copilot
    |   +-- reportEngine.js      # ESG report payload aggregator
    |   +-- alertEngine.js       # Alert generation rules
    |   +-- trendEngine.js       # Statistical trends & regression
    |   +-- decisionEngine.js    # Decision synthesis for overview
    |   +-- decisionRules.js     # Decision rule constants
    |   +-- explanationEngine.js # Explanation text generation
    +-- components/
        +-- DeviceHeader.jsx
        +-- SensorStatusCard.jsx
        +-- MachineHealthCard.jsx
        +-- VibrationCard.jsx
        +-- AlertsPanel.jsx
        +-- AlertCenter.jsx
        +-- AlertHistory.jsx
        +-- TrendChart.jsx
        +-- AnalyticsSummary.jsx
        +-- AnomalyDetectionCard.jsx
        +-- PredictiveMaintenanceCard.jsx
        +-- PredictiveTrendChart.jsx
        +-- AIDecisionPanel.jsx
        +-- DecisionTimeline.jsx
        +-- MachineConditionSummary.jsx
        +-- EquipmentHealthCard.jsx
        +-- HealthBreakdownCard.jsx
        +-- MaintenanceRecommendation.jsx
        +-- MaintenanceRecommendationPanel.jsx
        +-- MaintenanceTimeline.jsx
        +-- MaintenanceWorkflowCard.jsx
        +-- MaintenanceActivity.jsx
        +-- EnergyOverviewCard.jsx
        +-- EnergyTrendChart.jsx
        +-- ElectricalQualityCard.jsx
        +-- EnergyInsightPanel.jsx
        +-- SustainabilityOverviewCard.jsx
        +-- CarbonImpactCard.jsx
        +-- SustainabilityTrendChart.jsx
        +-- ESGDataQualityCard.jsx
        +-- ESGSummaryCard.jsx
        +-- SustainabilityInsightPanel.jsx
        +-- OperationsCopilot.jsx
        +-- CopilotEvidence.jsx
        +-- CopilotSuggestedActions.jsx
        +-- ReportCenter.jsx
        +-- ReportPreview.jsx
        +-- ReportMetric.jsx
        +-- SensorInterpretation.jsx
        +-- ErrorBoundary.jsx
```

---

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended -- no specific version is enforced in package.json)
- **npm** (bundled with Node.js)
- **Git**
- A configured **Supabase** project with the `ecotwin_sensor_readings` table
- An external **MQTT to Supabase bridge** (not in this repository) to ingest ESP32 telemetry

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd ecotwin-frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

Create `.env` or `.env.local` in the project root:

```ini
# Supabase project URL (safe for client-side exposure)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anon/publishable key (safe for client-side exposure)
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
```

> Never commit real credentials to the repository. Both keys above are the anon/public keys intended for browser use. Do not use the Supabase `service_role` key in this frontend.

### Development

```bash
npm run dev
```

Opens a local development server (default: http://localhost:5173) with hot module replacement.

### Production Build

```bash
npm run build
```

Generates optimised static assets to `dist/`. Preview the production build locally:

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Real Hardware Setup

> This section applies only if you are connecting a physical ESP32 sensor node.

The expected Supabase table schema (`ecotwin_sensor_readings`) should include at minimum:

| Column | Type | Description |
|---|---|---|
| `id` | uuid / serial | Row identifier |
| `device_id` | text | Must equal `ECOTWIN-001` to appear in dashboard |
| `created_at` | timestamptz | Timestamp of sensor reading |
| `temperature_c` | float | DS18B20 ambient temperature (C) |
| `accel_x` | float | MPU6050 X-axis acceleration (m/s2) |
| `accel_y` | float | MPU6050 Y-axis acceleration (m/s2) |
| `accel_z` | float | MPU6050 Z-axis acceleration (m/s2) |
| `mpu_temperature_c` | float | MPU6050 internal temperature (C) |
| `bus_voltage_v` | float | INA219 bus voltage (V) |
| `current_ma` | float | INA219 current draw (mA) |
| `power_mw` | float | INA219 calculated power (mW) |
| `ina219_voltage_valid` | boolean | Validation flag set by edge firmware or bridge |
| `sensor_ina219_ok` | boolean | INA219 sensor health flag |

The device ID is hardcoded in `App.jsx`:

```js
const DEVICE_ID = "ECOTWIN-001";
```

Change this constant if your hardware reports a different device identifier.

---

## Data Integrity & Validation

EcoTwin treats telemetry validation as a first-class responsibility:

1. **Electrical gating** -- INA219 readings are only consumed when `ina219_voltage_valid === true` AND `sensor_ina219_ok !== false`
2. **Overvoltage detection** -- if `bus_voltage_v > 6.0 V` on a 5 V motor circuit, the reading is marked `INVALID` and a maintenance action is triggered
3. **Time-gap filtering** -- energy integration skips intervals >= 1 hour to prevent accumulation errors from network outages
4. **Minimum record threshold** -- health and anomaly scoring require at least 5 readings; below this, status is `INSUFFICIENT_DATA`
5. **Null-safe arithmetic** -- all engines guard against `null`, `undefined`, and `NaN` before performing calculations
6. **Explicit unavailability** -- metrics that cannot be computed are explicitly labelled rather than defaulted to zero

---

## Security Notes

- Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are the public/anon keys. They are safe for browser exposure but protect row-level access through Supabase Row Level Security (RLS).
- **Review and enable RLS** on the `ecotwin_sensor_readings` table in your Supabase management console before exposing this dashboard publicly.
- **Never add** `SUPABASE_SERVICE_ROLE_KEY` or any MQTT credentials to this frontend repository.
- HTTPS must be configured and enforced at the hosting level (Vercel, Netlify, Cloudflare Pages, etc.).

---

## Known Limitations

| Limitation | Detail |
|---|---|
| Single device only | Dashboard is hardcoded to `ECOTWIN-001`. Multi-device support not implemented. |
| No authentication | No user login or role-based access control exists in the frontend. |
| INA219 voltage invalid in prototype | Hardware readings (~9.9 V) exceed the 5 V motor spec; electrical data is correctly rejected. |
| Energy unavailable when INA219 invalid | When electrical telemetry is flagged invalid, energy and carbon metrics are unavailable. |
| Carbon requires manual configuration | No default emission factor is set; carbon is disabled until the user inputs a factor. |
| Efficiency and intensity not calculable | No production-output denominator exists in the current schema. |
| No ML/AI model | Risk and anomaly scoring is purely statistical and rule-based. |
| No LLM integration | Copilot is deterministic; no generative AI backend is connected. |
| MQTT bridge is external | The bridge between MQTT and Supabase is not included in this repository. |
| No CSV export | Reports are print/PDF only via browser window.print(). |
| No automated tests | No unit tests or integration test suite exists at present. |

---

## Future Scope

> Items listed here are not implemented in the current repository.

- [ ] Multi-device support (device selector, per-device routing)
- [ ] User authentication and role-based access (operator / admin)
- [ ] CSV export for report data
- [ ] Configurable alert thresholds (currently hardcoded constants)
- [ ] Production-output denominator for energy efficiency and intensity calculations
- [ ] Carbon baseline and avoidance tracking
- [ ] MQTT-to-Supabase bridge included in this repository
- [ ] Automated unit and integration testing suite
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] LLM integration for the Operations Copilot
- [ ] Real-time WebSocket subscription to Supabase (replacing polling)
- [ ] Mobile-responsive layout improvements
- [ ] Multi-sensor node aggregation

---

## Demo Flow

If running against a live Supabase instance with an active ESP32 node:

1. **Start the dev server**: `npm run dev`
2. **Overview tab** -- observe the device online indicator, real-time sensor readings, health score, and active alerts
3. **Health tab** -- review the fused equipment health card, breakdown by subsystem, and maintenance recommendations
4. **Energy tab** -- if INA219 is returning valid readings, observe Wh integration and power stability; if invalid, note the explicit unavailability warning
5. **Sustainability tab** -- input a grid emission factor (e.g. `0.385` for US EPA eGRID average) to activate carbon tracking
6. **AI Copilot tab** -- ask operational questions such as:
   - "What is the equipment health status?"
   - "What maintenance is recommended?"
   - "Why is electrical data unavailable?"
   - "What is the energy consumption?"
7. **Reports tab** -- generate an ESG report and use the print button to export as PDF

---

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with descriptive messages
4. Open a Pull Request with a clear description of what was changed and why

Ensure `npm run lint` passes before opening a PR.

---

## License

This project is licensed under the **MIT License**.

---

*EcoTwin -- Industrial Digital Twin & IoT Intelligence Platform*  
*Built as a prototype for edge-connected equipment monitoring and sustainability analytics.*
