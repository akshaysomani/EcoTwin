# EcoTwin — Industrial Digital Twin & Predictive Maintenance Platform

EcoTwin is a digital twin and predictive maintenance platform designed to monitor and diagnose industrial rotary motor nodes in real-time.

---

## Technical Pipeline

```
ESP32 (Edge Sensor Hub)
        ↓
      Wi-Fi
        ↓
   HiveMQ MQTT
        ↓
Node.js MQTT Bridge
        ↓
    Supabase
        ↓
React/Vite Dashboard
```

---

## Implemented Analytical Engines

### 1. Energy Intelligence Engine (`src/utils/energyEngine.js`)
* **Power Conversion**: Converts raw `power_mw` to Watts ($P = P_{mW} / 1000$).
* **Chronological Integration**: Summations of Watt-hours (Wh) via trapezoidal interval calculation:
  $$\Delta\text{Hours} = \frac{T_{curr} - T_{prev}}{3.6 \times 10^6}$$
  $$\Delta\text{Energy} = \frac{P_{prev} + P_{curr}}{2} \times \Delta\text{Hours}$$
* **Stability Scoring**: Power Stability is computed as a clamped percentage using the coefficient of variation (CV):
  $$\text{Stability} = \text{clamp}(100 \times (1 - CV), 0, 100)$$

### 2. Equipment Health Fusion Engine (`src/utils/healthEngine.js`)
* **Fused Health Rating**: Starts at 100 points and applies rule-based deductions for ambient temperatures (DS18B20), dynamic vibrations (MPU6050 gravity-filtered deviations), electrical loadings (INA219), and anomalies.
* **Vibration Deviation**: Dynamically filters static Earth gravity:
  $$\text{Deviation} = | \sqrt{Ax^2 + Ay^2 + Az^2} - 9.81 |$$

### 3. Sustainability & ESG Engine (`src/utils/sustainabilityEngine.js`)
* Calculates carbon footprint emissions:
  $$\text{Carbon Emissions } (\text{kgCO}_2\text{e}) = \text{Energy } (\text{kWh}) \times \text{Emission Factor } (\text{kgCO}_2\text{e}/\text{kWh})$$
* **Grounded Safeguards**: Bypasses efficiency and carbon savings when output denominators or baselines are missing.

### 4. Conversational Copilot Engine (`src/utils/copilotEngine.js`)
* Telemetry-grounded operations assistant classifying natural queries into structured evidence models.

### 5. Automated ESG Reporting Engine (`src/utils/reportEngine.js`)
* Aggregates active assessments and alert life-cycles into exportable CSV datasets and print-friendly PDF templates.

---

## Production Deployment & DevOps

### 1. Environment Configuration
Create a `.env` or `.env.local` file in the project root with the following variables:
```ini
# Public endpoint configuration (Safe for client browser exposure)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
```

### 2. Dependency Audit & Hygiene
* Run `npm audit` to check for security vulnerabilities.
* The codebase uses only necessary packages: `@supabase/supabase-js`, `lucide-react`, `react`, `react-dom`, and `recharts`.

### 3. Local Development & Production Build
To spin up a local hot-reloaded dev server:
```bash
npm run dev
```
To generate optimized production bundle assets under `dist/`:
```bash
npm run build
```

### 4. Security & Hardening Policies
* **Secrets Protection**: Avoid placing server-side tokens (like `SUPABASE_SERVICE_ROLE_KEY` or MQTT database passwords) in client repositories.
* **Database Row Level Security (RLS)**: Row level security rules on `ecotwin_sensor_readings` must be reviewed and verified directly in the Supabase management console.
* **Encryption**: HTTPS must be configured and enforced on the hosting platform (Vercel, Netlify, or AWS).

