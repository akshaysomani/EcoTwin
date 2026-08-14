# PHASE 9 — SUSTAINABILITY INTELLIGENCE & ESG ANALYTICS

This document details the sustainability metrics, carbon accounting configurations, and ESG data completeness rules implemented in Phase 9.

---

> [!IMPORTANT]
> **Carbon Calculation Configuration constraint**:
> Carbon emissions are **NOT** calculated unless a verified grid electricity emission factor is configured in the ESG parameter section. If none is input, the dashboard will display `CARBON CALCULATION NOT CONFIGURED` with instructions.
>
> **Energy Efficiency Denominator constraint**:
> Energy efficiency and operational intensity are **NOT** calculated unless a validated useful-output denominator exists in the telemetry schema. If no denominator exists, the dashboard displays `NOT AVAILABLE` with clear descriptions.

---

## 1. Sustainability Engine Architecture

The carbon and ESG data pipeline maps mathematically from physical measurements to dashboard widgets:

```
Sliced Readings (10 to 100 frames)
         ↓
energyAssessment (trapezoidal integration)
         ↓
sustainabilityAssessment (calculated emissions, coverage ratios, & data checks)
         ↓
React Components (Overview, Impact Card, ESG Quality Grid, ESG Summary, Insights Panel, Trend Chart)
```

---

## 2. Calculation Methodologies

### A. Carbon Footprint Formula
$$\text{Carbon Emissions } (\text{kgCO}_2\text{e}) = \text{Energy } (\text{kWh}) \times \text{Emission Factor } (\text{kgCO}_2\text{e}/\text{kWh})$$
* **Emission Factor**: Configured by the user in-app (e.g., `0.385` for EPA eGRID average).
* **Baseline Avoidance**: Avoided emissions are reported as `NOT AVAILABLE` due to a lack of baseline comparison periods.

### B. ESG Data Quality Rating
Calculates telemetry validation statistics to score coverage:
* **GOOD**: Coverage $\ge 80\%$, energy calculations available, emission factor configured.
* **LIMITED**: Coverage $< 80\%$, or grid factor missing.
* **UNAVAILABLE**: Valid telemetry feeds are entirely missing.

### C. Measured vs. Calculated vs. Configured Mappings
The UI displays data categorization labels:
* `MEASURED`: Telemetry inputs direct from sensors (e.g. current mA, voltage V).
* `CALCULATED`: Mathematical derivations (e.g. energy Wh, carbon kgCO2e).
* `CONFIGURED`: Static references or inputs (e.g. grid emission factors).

---

## 3. Testing Outcomes

### Automated Verification
* `npm run lint` compiles cleanly with no errors.
* `npm run build` generates the production client in `462ms`.

### Manual Scenarios Verified
1. **No Emission Factor Input**: Recalculates carbon value to `NOT CONFIGURED` and displays warning advisory.
2. **Dynamic Factor Recalculation**: Inputting a factor (e.g. `0.385`) immediately updates emissions cards and plots the red carbon Line in the trajectory ComposedChart.
3. **Invalid Telemetry**: If INA219 validation fails (`ina219_voltage_valid === false`), overall sustainability status changes to `UNAVAILABLE` without throwing runtime calculations exceptions.
