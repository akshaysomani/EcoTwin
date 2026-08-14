/**
 * EcoTwin Energy Intelligence & Sustainability Engine
 * Interprets valid INA219 electrical telemetry to estimate energy metrics.
 */

// Safe numeric formatter helper
function getSafeNumber(val) {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

export const energyEngine = {
  // 1. Calculate Data Quality
  calculateElectricalQuality(readings = []) {
    const total = readings.length;
    if (total === 0) {
      return {
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        coverage: 0,
        state: "UNAVAILABLE"
      };
    }

    const validRecords = readings.filter(
      (r) => r.ina219_voltage_valid === true && r.sensor_ina219_ok !== false
    ).length;

    const invalidRecords = total - validRecords;
    const coverage = Math.round((validRecords / total) * 100);

    let state = "UNAVAILABLE";
    if (coverage >= 80) {
      state = "GOOD";
    } else if (coverage > 0) {
      state = "LIMITED";
    }

    return {
      totalRecords: total,
      validRecords,
      invalidRecords,
      coverage,
      state
    };
  },

  // 2. Main Orchestrator for Energy Calculations
  calculateEnergyAssessment(readings = []) {
    const quality = this.calculateElectricalQuality(readings);
    
    // Filter valid records and sort chronologically (oldest to newest) for proper integration
    const validReadings = readings
      .filter((r) => r.ina219_voltage_valid === true && r.sensor_ina219_ok !== false)
      .slice()
      .reverse();

    if (validReadings.length === 0) {
      return {
        quality,
        available: false,
        avgVoltage: null,
        avgCurrent: null,
        avgPower: null,
        minPower: null,
        maxPower: null,
        powerStability: null,
        energyWh: 0,
        energyKwh: 0,
        trend: "UNAVAILABLE",
        performanceIndicator: "--",
        performanceScore: null,
        insights: ["INA219 telemetry is unavailable; energy calculations cannot currently be performed."]
      };
    }

    // Averages
    const voltages = validReadings.map((r) => getSafeNumber(r.bus_voltage_v)).filter((v) => v !== null);
    const currents = validReadings.map((r) => getSafeNumber(r.current_ma)).filter((c) => c !== null);
    const powersMw = validReadings.map((r) => getSafeNumber(r.power_mw)).filter((p) => p !== null);

    const avgVoltage = voltages.length ? voltages.reduce((a, b) => a + b, 0) / voltages.length : null;
    const avgCurrent = currents.length ? currents.reduce((a, b) => a + b, 0) / currents.length : null;
    const avgPowerMw = powersMw.length ? powersMw.reduce((a, b) => a + b, 0) / powersMw.length : null;
    
    const minPowerMw = powersMw.length ? Math.min(...powersMw) : null;
    const maxPowerMw = powersMw.length ? Math.max(...powersMw) : null;

    // Convert power to Watts
    const avgPowerW = avgPowerMw !== null ? avgPowerMw / 1000 : null;
    const minPowerW = minPowerMw !== null ? minPowerMw / 1000 : null;
    const maxPowerW = maxPowerMw !== null ? maxPowerMw / 1000 : null;

    // 3. Trapezoidal Integration of Wh
    let energyWh = 0;
    for (let i = 1; i < validReadings.length; i++) {
      const prev = validReadings[i - 1];
      const curr = validReadings[i];
      const prevTime = new Date(prev.created_at).getTime();
      const currTime = new Date(curr.created_at).getTime();
      const deltaMs = currTime - prevTime;

      // Filter extreme gaps (e.g., limit delta to max 1 hour to prevent massive error accumulation during network outages)
      if (deltaMs > 0 && deltaMs < 3600000) {
        const deltaHours = deltaMs / 3600000;
        const prevPowerW = (getSafeNumber(prev.power_mw) || 0) / 1000;
        const currPowerW = (getSafeNumber(curr.power_mw) || 0) / 1000;
        const avgIntervalPowerW = (prevPowerW + currPowerW) / 2;
        energyWh += avgIntervalPowerW * deltaHours;
      }
    }

    const energyKwh = energyWh / 1000;

    // 4. Power Stability index (Coefficient of variation: CV = standard_deviation / mean)
    let powerStability = 100;
    if (powersMw.length > 1 && avgPowerMw > 0) {
      const variance = powersMw.reduce((a, b) => a + Math.pow(b - avgPowerMw, 2), 0) / (powersMw.length - 1);
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / avgPowerMw;
      // High CV = low stability. Map CV <= 0.5 to 100-0% scale
      powerStability = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
    }

    // 5. Power Trend Regression
    let trend = "STABLE";
    if (powersMw.length >= 5) {
      const n = powersMw.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += powersMw[i];
        sumXY += i * powersMw[i];
        sumXX += i * i;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      // Slope thresholds (relative to average power)
      const relativeSlope = slope / avgPowerMw;
      if (relativeSlope > 0.015) {
        trend = "INCREASING";
      } else if (relativeSlope < -0.015) {
        trend = "DECREASING";
      } else if (powerStability < 60) {
        trend = "VOLATILE";
      }
    }

    // 6. Energy Performance Score (weighted between stability, data coverage, and typical baselines)
    // Map stability (50% weight) + coverage (50% weight)
    const performanceScore = Math.round((powerStability * 0.5) + (quality.coverage * 0.5));
    
    let performanceIndicator = "OPTIMAL";
    if (performanceScore < 50) {
      performanceIndicator = "EVALUATE LOAD";
    } else if (performanceScore < 75) {
      performanceIndicator = "STABLE OPERATING";
    }

    // 7. Rule-Based Insights Generation
    const insights = [];
    if (quality.coverage < 80) {
      insights.push("Electrical telemetry coverage is limited, reducing confidence in energy analysis.");
    }
    if (trend === "INCREASING") {
      insights.push("Power consumption is increasing consistently and rotating mechanical components should be audited.");
    } else if (trend === "VOLATILE") {
      insights.push("High volatility detected in electrical draws. Verify bearing friction or supply voltage sag.");
    } else if (trend === "STABLE") {
      insights.push("Power consumption remains stable and close to the historical operational baseline.");
    }
    if (powerStability > 85) {
      insights.push("Excellent energy performance stability indicates smooth motor operations.");
    }

    return {
      quality,
      available: true,
      avgVoltage,
      avgCurrent,
      avgPower: avgPowerW,
      minPower: minPowerW,
      maxPower: maxPowerW,
      powerStability,
      energyWh,
      energyKwh,
      trend,
      performanceIndicator,
      performanceScore,
      insights
    };
  }
};
