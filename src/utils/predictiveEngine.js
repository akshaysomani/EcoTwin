/**
 * EcoTwin Predictive Maintenance & Anomaly Engine
 * Statistical, rule-based reasoning engine for early warning detection.
 */

import { calculateAverage, calculateStability, calculateTrend } from "./trendEngine";

export const PREDICTIVE_CONSTANTS = {
  MIN_READINGS_REQUIRED: 5,
  PERSISTENCE_WINDOW: 5,        // N = 5 readings to evaluate persistence
  PERSISTENCE_THRESHOLD: 4,     // 4 out of 5 consecutive directional shifts
  
  // Noise Floors for Z-Score stability
  TEMP_NOISE_FLOOR: 0.25,       // °C
  VIB_NOISE_FLOOR: 0.10,        // m/s²
  ELEC_VOLT_NOISE_FLOOR: 0.05,  // V
  ELEC_CURR_NOISE_FLOOR: 1.0,   // mA
  ELEC_PWR_NOISE_FLOOR: 5.0,    // mW
  
  // Absolute limits for risk calculations
  TEMP_LIMIT_WARNING: 40.0,
  TEMP_LIMIT_CRITICAL: 60.0,
  VIB_LIMIT_WARNING: 1.0,
  VIB_LIMIT_CRITICAL: 3.0,
};

/**
 * Calculates standard Z-score: z = (current - average) / standardDeviation
 */
export function calculateZScore(current, average, stdDev, noiseFloor = 0.1) {
  if (current === null || average === null || current === undefined || average === undefined) return 0;
  const c = Number(current);
  const a = Number(average);
  if (Number.isNaN(c) || Number.isNaN(a)) return 0;
  
  const sd = Math.max(stdDev || 0, noiseFloor);
  return (c - a) / sd;
}

/**
 * Interprets Z-score into anomaly states
 */
export function getAnomalyState(zScore) {
  const absZ = Math.abs(zScore);
  if (absZ < 1.0) return "NORMAL";
  if (absZ < 2.0) return "MILD ANOMALY";
  if (absZ < 3.0) return "SIGNIFICANT ANOMALY";
  return "SEVERE ANOMALY";
}

/**
 * Checks trend persistence over the last N readings
 * Expects chronological readings (oldest first).
 */
export function checkTrendPersistence(readings, valueExtractor, windowSize = 5, threshold = 4) {
  if (!readings || readings.length < windowSize) return { isPersistent: false, direction: "NONE" };
  
  // Take the most recent readings from the chronological list
  const recent = readings.slice(readings.length - windowSize);
  const values = recent.map(valueExtractor).map(Number).filter((v) => !Number.isNaN(v));
  
  if (values.length < windowSize) return { isPersistent: false, direction: "NONE" };

  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff > 0.001) increases++;
    if (diff < -0.001) decreases++;
  }

  if (increases >= threshold - 1) {
    return { isPersistent: true, direction: "INCREASING" };
  }
  if (decreases >= threshold - 1) {
    return { isPersistent: true, direction: "DECREASING" };
  }

  return { isPersistent: false, direction: "NONE" };
}

/**
 * Calculates risk index for Temperature (0-100)
 */
export function calculateTemperatureRisk(currentTemp, trend, isPersistent) {
  if (currentTemp === null || currentTemp === undefined || Number.isNaN(Number(currentTemp))) return 10;
  const temp = Number(currentTemp);

  // Determine absolute state
  let state = "NORMAL";
  if (temp >= PREDICTIVE_CONSTANTS.TEMP_LIMIT_CRITICAL) {
    state = "CRITICAL";
  } else if (temp >= PREDICTIVE_CONSTANTS.TEMP_LIMIT_WARNING) {
    state = "WARNING";
  }

  // Combine state and trend
  if (state === "CRITICAL") return 100;
  if (state === "WARNING") {
    return trend === "INCREASING" || isPersistent ? 80 : 55;
  }
  
  // Normal state
  if (trend === "INCREASING") {
    return isPersistent ? 35 : 20; // Low/Moderate Risk
  }
  return 10; // Low Risk
}

/**
 * Calculates risk index for Vibration (0-100)
 */
export function calculateVibrationRisk(currentDev, trend, isPersistent) {
  if (currentDev === null || currentDev === undefined || Number.isNaN(Number(currentDev))) return 10;
  const dev = Number(currentDev);

  // Vibration Noise Protection: If the deviation is extremely small, force low risk
  if (dev < PREDICTIVE_CONSTANTS.VIB_NOISE_FLOOR) {
    return 10; // Low Risk
  }

  // Determine absolute state
  let state = "NORMAL";
  if (dev >= PREDICTIVE_CONSTANTS.VIB_LIMIT_CRITICAL) {
    state = "CRITICAL";
  } else if (dev >= PREDICTIVE_CONSTANTS.VIB_LIMIT_WARNING) {
    state = "WARNING";
  }

  // Combine state and trend
  if (state === "CRITICAL") return 100;
  if (state === "WARNING") {
    return trend === "INCREASING" || isPersistent ? 85 : 50;
  }

  // Normal state
  if (trend === "INCREASING") {
    return isPersistent ? 40 : 25; // Moderate Risk
  }
  return 10; // Low Risk
}

/**
 * Calculates risk index for Electrical (0-100)
 */
export function calculateElectricalRisk(isVoltValid, currentVolt, zScoreVolt, trendVolt) {
  if (!isVoltValid || currentVolt === null || currentVolt === undefined) {
    return null; // Excluded from calculation
  }
  
  const absZ = Math.abs(zScoreVolt);
  let risk = 10; // default low

  if (absZ >= 3.0) {
    risk = 90;
  } else if (absZ >= 2.0) {
    risk = trendVolt === "INCREASING" || trendVolt === "DECREASING" ? 65 : 45;
  } else if (absZ >= 1.0) {
    risk = trendVolt !== "STABLE" ? 30 : 20;
  }

  return risk;
}

/**
 * Normalizes risk score and maps to a name
 */
export function getRiskLevelName(score) {
  if (score <= 20) return "LOW";
  if (score <= 40) return "MODERATE";
  if (score <= 60) return "ELEVATED";
  if (score <= 80) return "HIGH";
  return "CRITICAL";
}

/**
 * Confidence indicator
 */
export function calculatePredictionConfidence(readingsCount, isVolatile, isElecUnavailable) {
  let tier;
  
  if (readingsCount >= 30) {
    tier = "HIGH";
  } else if (readingsCount >= 15) {
    tier = "GOOD";
  } else if (readingsCount >= 5) {
    tier = "MODERATE";
  } else {
    tier = "LOW";
  }

  // Reduce confidence if volatile or missing telemetry
  const tiers = ["LOW", "MODERATE", "GOOD", "HIGH"];
  let index = tiers.indexOf(tier);

  if (isVolatile && index > 0) index--;
  if (isElecUnavailable && index > 0) index--;

  return tiers[index];
}

/**
 * Generates explainable maintenance recommendation
 */
export function generateMaintenanceRecommendation(assessment) {
  const { riskLevel, tempRisk, vibRisk, isElecUnavailable } = assessment;

  if (riskLevel === "CRITICAL") {
    return "Critical machine condition detected. Immediate inspection is recommended.";
  }

  if (riskLevel === "HIGH") {
    let recs = "Persistent abnormal behavior detected. Schedule maintenance inspection and investigate ";
    if (vibRisk > tempRisk) {
      recs += "vibration mounting and bearings.";
    } else {
      recs += "cooling systems and lubrication.";
    }
    return recs;
  }

  if (riskLevel === "ELEVATED") {
    return "Machine telemetry shows an emerging abnormal trend. Consider scheduling an inspection.";
  }

  if (riskLevel === "MODERATE") {
    return "Minor changes detected in machine telemetry. Continue monitoring recent trends.";
  }

  // Low Risk
  if (isElecUnavailable) {
    return "Machine condition is stable. Connect or verify INA219 hardware before evaluating electrical condition.";
  }

  return "Machine condition is stable. Continue normal operation and monitoring.";
}

/**
 * Main Assessment Function
 * Expects chronological readings (oldest first).
 */
export function calculatePredictiveAssessment(chronoReadings, deviceOnline) {
  const readingsCount = chronoReadings.length;

  if (readingsCount < PREDICTIVE_CONSTANTS.MIN_READINGS_REQUIRED || !deviceOnline) {
    return {
      anomalyScore: 0,
      maintenanceRisk: 0,
      riskLevel: deviceOnline ? "LOW" : "CRITICAL",
      confidence: "LOW",
      dominantRisk: "NONE",
      tempStatus: "NORMAL",
      vibStatus: "NORMAL",
      elecStatus: "UNAVAILABLE",
      recommendation: deviceOnline
        ? "Trend confidence is limited because only " + readingsCount + " readings are available."
        : "No recent telemetry received from ECOTWIN-001.",
      explanation: "Diagnostics offline. Awaiting historical records to model statistical limits.",
      tempZ: 0,
      vibZ: 0,
      isElecUnavailable: true,
      tempRisk: 10,
      vibRisk: 10,
      elecRisk: null,
      isTempPersistent: false,
      isVibPersistent: false,
    };
  }

  const latest = chronoReadings[chronoReadings.length - 1];

  // 1. Calculate baselines (Averages & Standard Deviations)
  const tempValues = chronoReadings.map((r) => r.temperature_c);
  const tempAvg = calculateAverage(tempValues) || 0;
  const tempStd = calculateStability(tempValues) || 0;

  const vibValues = chronoReadings.map((r) => {
    const x = Number(r.accel_x) || 0;
    const y = Number(r.accel_y) || 0;
    const z = Number(r.accel_z) || 0;
    const mag = Math.sqrt(x * x + y * y + z * z);
    return Math.abs(mag - 9.81);
  });
  const vibAvg = calculateAverage(vibValues) || 0;
  const vibStd = calculateStability(vibValues) || 0;

  const isElecUnavailable = latest.ina219_voltage_valid !== true;
  const validElec = chronoReadings.filter((r) => r.ina219_voltage_valid === true);
  const hasValidElec = validElec.length >= 5 && !isElecUnavailable;

  let voltAvg = 0;
  let voltStd = 0;
  if (hasValidElec) {
    const voltValues = validElec.map((r) => r.bus_voltage_v);
    voltAvg = calculateAverage(voltValues) || 0;
    voltStd = calculateStability(voltValues) || 0;
  }

  // 2. Compute current metrics
  const currentTemp = Number(latest.temperature_c) || 0;
  const currentVib = vibValues[vibValues.length - 1] || 0;
  const currentVolt = hasValidElec ? Number(latest.bus_voltage_v) : null;

  // Z-Scores with Noise Floors
  const tempZ = calculateZScore(currentTemp, tempAvg, tempStd, PREDICTIVE_CONSTANTS.TEMP_NOISE_FLOOR);
  const vibZ = calculateZScore(currentVib, vibAvg, vibStd, PREDICTIVE_CONSTANTS.VIB_NOISE_FLOOR);
  const voltZ = hasValidElec ? calculateZScore(currentVolt, voltAvg, voltStd, PREDICTIVE_CONSTANTS.ELEC_VOLT_NOISE_FLOOR) : 0;

  // 3. Evaluate persistence
  const tempPersistence = checkTrendPersistence(chronoReadings, (r) => r.temperature_c);
  const vibPersistence = checkTrendPersistence(chronoReadings, (r) => {
    const x = Number(r.accel_x) || 0;
    const y = Number(r.accel_y) || 0;
    const z = Number(r.accel_z) || 0;
    const mag = Math.sqrt(x * x + y * y + z * z);
    return Math.abs(mag - 9.81);
  });

  const isTempPersistent = tempPersistence.isPersistent && tempPersistence.direction === "INCREASING";
  const isVibPersistent = vibPersistence.isPersistent && vibPersistence.direction === "INCREASING";

  // Trends from trendEngine
  const tempTrend = calculateTrend(tempValues, "temperature");
  const vibTrend = calculateTrend(vibValues, "vibration");
  const voltTrend = hasValidElec ? calculateTrend(validElec.map((r) => r.bus_voltage_v), "voltage") : "STABLE";

  // 4. Calculate individual risks
  const tempRisk = calculateTemperatureRisk(currentTemp, tempTrend, isTempPersistent);
  const vibRisk = calculateVibrationRisk(currentVib, vibTrend, isVibPersistent);
  const elecRisk = calculateElectricalRisk(hasValidElec, currentVolt, voltZ, voltTrend);

  // 5. Calculate Anomaly Score (0-100)
  // Combine z-scores, absolute limits, and trend persistence
  const maxAbsZ = Math.max(Math.abs(tempZ), Math.abs(vibZ), hasValidElec ? Math.abs(voltZ) : 0);
  let anomalyScore = Math.min(100, Math.round(maxAbsZ * 20)); // scale Z=4 to 80+
  
  // Boost score based on warnings or persistence
  const isWarningState = currentTemp >= PREDICTIVE_CONSTANTS.TEMP_LIMIT_WARNING || currentVib >= PREDICTIVE_CONSTANTS.VIB_LIMIT_WARNING;
  const isCriticalState = currentTemp >= PREDICTIVE_CONSTANTS.TEMP_LIMIT_CRITICAL || currentVib >= PREDICTIVE_CONSTANTS.VIB_LIMIT_CRITICAL;

  if (isCriticalState) {
    anomalyScore = Math.max(anomalyScore, 85);
  } else if (isWarningState) {
    anomalyScore = Math.max(anomalyScore, 45);
  }

  if (isTempPersistent || isVibPersistent) {
    anomalyScore = Math.min(100, anomalyScore + 15);
  }

  // 6. Calculate Weighted Maintenance Risk
  let maintenanceRisk;
  const trendRiskVal = isTempPersistent || isVibPersistent ? 80 : 10;

  if (isElecUnavailable || elecRisk === null) {
    // Exclude electrical: Temp (35), Vib (45), Trend (10) = 90 total
    const weightedSum = (tempRisk * 0.35) + (vibRisk * 0.45) + (trendRiskVal * 0.10);
    maintenanceRisk = Math.round(weightedSum / 0.90);
  } else {
    // Normal: Temp (35), Vib (45), Elec (10), Trend (10) = 100 total
    maintenanceRisk = Math.round((tempRisk * 0.35) + (vibRisk * 0.45) + (elecRisk * 0.10) + (trendRiskVal * 0.10));
  }

  // Vibration Safety overrides
  if (currentVib < PREDICTIVE_CONSTANTS.VIB_NOISE_FLOOR) {
    // Avoid marking high risk if vibration is tiny
    maintenanceRisk = Math.min(maintenanceRisk, 30);
    anomalyScore = Math.min(anomalyScore, 30);
  }

  const riskLevel = getRiskLevelName(maintenanceRisk);

  // Confidence calculations
  const tempCoeff = tempStd / (Math.abs(tempAvg) || 1);
  const vibCoeff = vibStd / (Math.abs(vibAvg) || 1);
  const isVolatile = tempCoeff > 0.15 || vibCoeff > 0.40;

  const confidence = calculatePredictionConfidence(readingsCount, isVolatile, isElecUnavailable);

  // Determine dominant risk
  let dominantRisk = "NONE";
  if (maintenanceRisk > 20) {
    if (vibRisk > tempRisk && (elecRisk === null || vibRisk > elecRisk)) {
      dominantRisk = "Vibration";
    } else if (tempRisk >= vibRisk && (elecRisk === null || tempRisk > elecRisk)) {
      dominantRisk = "Temperature";
    } else if (elecRisk !== null) {
      dominantRisk = "Electrical";
    }
  }

  // Dynamic assessment text
  let explanation;
  if (maintenanceRisk <= 20) {
    explanation = "All indicators are stable. No abnormal mechanical or thermal trends are currently active.";
  } else {
    explanation = `Telemetry shows emerging concerns. Dominant stressor: ${dominantRisk.toLowerCase()}. `;
    if (isTempPersistent) {
      explanation += "Persistent temperature escalation detected. ";
    }
    if (isVibPersistent) {
      explanation += "Vibration shows continuous upward deviation. ";
    }
    if (isElecUnavailable) {
      explanation += "Electrical telemetry remains offline.";
    }
  }

  const assessment = {
    anomalyScore,
    maintenanceRisk,
    riskLevel,
    confidence,
    dominantRisk,
    tempStatus: getAnomalyState(tempZ),
    vibStatus: getAnomalyState(vibZ),
    elecStatus: hasValidElec ? getAnomalyState(voltZ) : "UNAVAILABLE",
    recommendation: "",
    explanation,
    tempZ,
    vibZ,
    isElecUnavailable,
    tempRisk,
    vibRisk,
    elecRisk,
    isTempPersistent,
    isVibPersistent,
  };

  assessment.recommendation = generateMaintenanceRecommendation(assessment);
  return assessment;
}
