# PHASE 8 — EQUIPMENT HEALTH & PREDICTIVE MAINTENANCE INTELLIGENCE

This document outlines the architecture, calculations, sufficiency models, and testing outcomes of the explainable Equipment Health and Predictive Maintenance layer implemented in Phase 8.

---

> [!IMPORTANT]
> **AI/ML Model Disclaimer**:
> Phase 8 implements an **explainable, statistical, and rule-based equipment health assessment system**.
> It is **NOT** a trained machine-learning model (such as neural networks or random forest algorithms) and does not predict exact failure timestamps or remaining useful life (RUL).

---

## 1. System Architecture

The health assessment pipeline is deterministic and flows in memory from database polling to layout display:

```
Sliced Readings (10 to 100 frames)
         ↓
energyAssessment (coverage & Wh calculations)
         ↓
healthAssessment (thermal, vibration, electrical, CV stability)
         ↓
maintenanceRecommendations (explainable action logs)
         ↓
generateAlerts (persistence and deduplication updates)
         ↓
React Components (EquipmentHealthCard, HealthBreakdownCard, MaintenanceRecommendationPanel, MaintenanceTimeline)
```

---

## 2. Health Calculations & Multi-Sensor Fusion

The multi-sensor fusion model starts with a baseline score of **100** points and applies deductions based on anomalous sensor states:

### A. Thermal Assessment
* **Variables**: `temperature_c` (DS18B20) and `mpu_temperature_c` (MPU6050).
* **Thresholds**:
  * `CRITICAL` ($>60$°C): Deduct **30 points** (fused state drops to CRITICAL).
  * `MONITOR` ($40$°C–$60$°C): Deduct **10 points** (fused state drops to MONITOR).
  * Trend `INCREASING`: Deduct **5 points**.

### B. Vibration Assessment
* **Variables**: 3-axis MPU6050 accelerations and gyroscopes.
* **Math**: Dynamically computes vibration deviation by subtracting the earth's gravity offset:
  $$\text{Deviation} = | \sqrt{Ax^2 + Ay^2 + Az^2} - 9.81 |$$
* **Thresholds**:
  * `CRITICAL` ($>3.0$ m/s²): Deduct **30 points** (fused state drops to CRITICAL).
  * `MONITOR` ($1.0$–$3.0$ m/s²): Deduct **15 points** (fused state drops to MONITOR).
  * Trend `INCREASING`: Deduct **5 points**.

### C. Electrical Assessment
* **Variables**: `bus_voltage_v`, `current_ma`, `power_mw` (INA219).
* **Thresholds**:
  * `INVALID` (`ina219_voltage_valid === false` and `bus_voltage_v > 6.0 V`): Deduct **20 points** (fused state drops to CRITICAL).
  * `HIGH_LOAD` ($P > 5.0$ W): Deduct **20 points**.
  * `MONITOR` ($P > 3.0$ W): Deduct **10 points**.
  * `DATA_UNAVAILABLE` when `ina219_voltage_valid === false`: Excluded from scoring.

### D. Energy & Anomaly Integration
* Consumes Phase 7 `energyAssessment`. If `powerStability` $< 70\%$, deduct **10 points**.
* If Phase 4 `predictiveAssessment.anomalyScore` $\ge 60\%$, deduct **10 points**.

---

## 3. Data Sufficiency Model

To prevent misleading diagnostic scores when telemetry streams are initial or sparse:
* Minimum frame count threshold: **5 records**.
* If telemetry frames $< 5$, the overall status is forced to `"INSUFFICIENT_DATA"`.
* The card displays an explicit checklist indicating which sensors have successfully registered frames.

---

## 4. Confidence Model

Exposes overall assessment confidence calculated from data coverage and observation volume:
* **HIGH**: $\ge 15$ records, and data coverage $\ge 80\%$.
* **MEDIUM**: $5$ to $14$ records, or minor data coverage sags.
* **LOW**: Significant missing frames or offline indicators.

---

## 5. Maintenance Recommendations

Exposes explainable action plan recommendations:
* `CHECK_POWER_SUPPLY`: Triggered if electrical status is `INVALID` (voltage exceeds 6.0 V on a 5 V motor).
* `INSPECT_MOTOR`: Triggered if vibration is `CRITICAL`.
* `MONITOR_VIBRATION`: Triggered if vibration is `MONITOR`.
* `MONITOR_TEMPERATURE`: Triggered if temperature is `MONITOR` or `CRITICAL`.
* `CHECK_MOTOR_LOAD`: Triggered if electrical draws are `HIGH_LOAD`.
* `NO_ACTION_REQUIRED`: Triggered when overall score is $\ge 90\%$.

---

## 6. Testing Outcomes

### Automated Verification
* `npm run lint` passes without warnings or errors.
* `npm run build` completes successfully.

### Manual Scenarios Tested
1. **Valid Telemetry**: Health score merges and explains current thermal and vibration profiles.
2. **Missing Voltage (`ina219_voltage_valid = false`)**: Electrical status reports `DATA_UNAVAILABLE` or `INVALID` without throwing type crashes or blanking Recharts.
3. **Fewer than 5 Records**: Fused score is bypassed; checklist prompts operator that data is insufficient.
