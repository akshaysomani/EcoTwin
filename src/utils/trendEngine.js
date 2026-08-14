/**
 * EcoTwin Trend Calculation Engine
 * Interprets historical telemetry and classifies directional trend vectors.
 */

export const TREND_CONSTANTS = {
  PERCENT_THRESHOLD: 2.0,      // 2% threshold for stable vs trend
  VOLATILITY_LIMIT: 0.15,      // 15% Coeff of Variation for volatility
  TEMP_NOISE_FLOOR: 0.25,      // °C
  VIB_NOISE_FLOOR: 0.10,       // m/s²
  ELEC_VOLT_NOISE_FLOOR: 0.05,  // V
  ELEC_CURR_NOISE_FLOOR: 1.0,   // mA
  ELEC_PWR_NOISE_FLOOR: 5.0,    // mW
};

export function calculateAverage(values) {
  if (!values || values.length === 0) return null;
  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)));
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, val) => acc + Number(val), 0);
  return sum / valid.length;
}

export function calculateMinimum(values) {
  if (!values || values.length === 0) return null;
  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number);
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

export function calculateMaximum(values) {
  if (!values || values.length === 0) return null;
  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

export function calculateRange(values) {
  if (!values || values.length === 0) return 0;
  const min = calculateMinimum(values);
  const max = calculateMaximum(values);
  if (min === null || max === null) return 0;
  return max - min;
}

/**
 * Calculates slope using linear regression chronologically.
 * Assumes the input `values` array is in chronological order (oldest first).
 */
export function calculateSlope(values) {
  if (!values || values.length < 2) return 0;
  const valid = values.map(Number).filter((v) => !Number.isNaN(v));
  const N = valid.length;
  if (N < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < N; i++) {
    sumX += i;
    sumY += valid[i];
    sumXY += i * valid[i];
    sumXX += i * i;
  }

  const denominator = (N * sumXX) - (sumX * sumX);
  if (denominator === 0) return 0;

  return (N * sumXY - sumX * sumY) / denominator;
}

export function calculatePercentChange(firstValue, lastValue) {
  if (firstValue === null || lastValue === null || firstValue === undefined || lastValue === undefined) return 0;
  const f = Number(firstValue);
  const l = Number(lastValue);
  if (Number.isNaN(f) || Number.isNaN(l)) return 0;
  if (f === 0) return l === 0 ? 0 : 100;
  return ((l - f) / Math.abs(f)) * 100;
}

/**
 * Calculates standard deviation (stability measure).
 */
export function calculateStability(values) {
  if (!values || values.length < 2) return 0;
  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number);
  const N = valid.length;
  if (N < 2) return 0;

  const avg = calculateAverage(valid);
  if (avg === null) return 0;

  const sqDiffSum = valid.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0);
  return Math.sqrt(sqDiffSum / N);
}

/**
 * Classifies trend state for a sensor history.
 * Values must be in chronological order (oldest first).
 */
export function calculateTrend(values, sensorType = "temperature") {
  if (!values || values.length < 5) {
    return "STABLE"; // Insufficient data to conclude a trend safely
  }

  const valid = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v))).map(Number);
  if (valid.length < 5) return "STABLE";

  const mean = calculateAverage(valid);
  const stdDev = calculateStability(valid);
  const range = calculateRange(valid);
  const slope = calculateSlope(valid);

  const coeffOfVariation = mean !== 0 ? stdDev / Math.abs(mean) : 0;

  // Window sizes for oldest vs newest comparisons
  const W = Math.max(1, Math.floor(valid.length * 0.20));
  const oldestSub = valid.slice(0, W);
  const newestSub = valid.slice(valid.length - W);

  const oldestAvg = calculateAverage(oldestSub);
  const newestAvg = calculateAverage(newestSub);

  const percentChange = calculatePercentChange(oldestAvg, newestAvg);
  const absoluteChange = Math.abs(newestAvg - oldestAvg);

  // Set sensor-specific noise floors and volatility limits
  let noiseFloor = TREND_CONSTANTS.TEMP_NOISE_FLOOR;
  let volatilityLimit = TREND_CONSTANTS.VOLATILITY_LIMIT; // 15%
  let percentLimit = TREND_CONSTANTS.PERCENT_THRESHOLD;   // 2%

  if (sensorType === "vibration") {
    noiseFloor = TREND_CONSTANTS.VIB_NOISE_FLOOR;
    volatilityLimit = 0.40; // Vibration is inherently dynamic
    percentLimit = 5.0;     // Higher threshold for vibration trends
  } else if (sensorType === "voltage") {
    noiseFloor = TREND_CONSTANTS.ELEC_VOLT_NOISE_FLOOR;
    volatilityLimit = 0.08; // Voltage should be extremely steady
    percentLimit = 1.0;
  } else if (sensorType === "current") {
    noiseFloor = TREND_CONSTANTS.ELEC_CURR_NOISE_FLOOR;
    volatilityLimit = 0.35;
    percentLimit = 5.0;
  } else if (sensorType === "power") {
    noiseFloor = TREND_CONSTANTS.ELEC_PWR_NOISE_FLOOR;
    volatilityLimit = 0.35;
    percentLimit = 5.0;
  }

  // 1. Check for Volatility (High short term variance compared to the overall trend slope)
  // If standard deviation is high and range is high, but the slope is flat relative to fluctuations
  if (coeffOfVariation > volatilityLimit) {
    // If it's bouncing around a lot relative to the absolute change, classify as VOLATILE
    if (range > stdDev * 1.5 && absoluteChange < stdDev * 1.0) {
      return "VOLATILE";
    }
  }

  // 2. Classify Increasing/Decreasing trends
  if (absoluteChange > noiseFloor) {
    if (percentChange > percentLimit && slope > 0) {
      return "INCREASING";
    }
    if (percentChange < -percentLimit && slope < 0) {
      return "DECREASING";
    }
  }

  return "STABLE";
}

/**
 * Summarizes the trends for all sensors
 */
export function calculateTrendSummary(readings, deviceOnline) {
  if (!readings || readings.length === 0 || !deviceOnline) {
    return {
      temp: { trend: "STABLE", current: null, avg: null, min: null, max: null, percentChange: 0 },
      vib: { trend: "STABLE", current: null, avg: null, min: null, max: null, percentChange: 0 },
      elec: { status: "UNAVAILABLE", voltTrend: "STABLE", voltAvg: null, currAvg: null, pwrAvg: null },
      overall: "OFFLINE",
      message: "No recent telemetry received from ECOTWIN-001.",
    };
  }

  // Chronological order (oldest first)
  const chronoReadings = [...readings].reverse();

  // Extract Temperature Array
  const tempValues = chronoReadings.map((r) => r.temperature_c);
  const tempTrend = calculateTrend(tempValues, "temperature");
  const tempAvg = calculateAverage(tempValues);
  const tempMin = calculateMinimum(tempValues);
  const tempMax = calculateMaximum(tempValues);
  const tempCurrent = Number(chronoReadings[chronoReadings.length - 1]?.temperature_c);
  const tempPercentChange = calculatePercentChange(tempValues[0], tempCurrent);

  // Extract Vibration Array (computed deviation)
  const vibValues = chronoReadings.map((r) => {
    const x = Number(r.accel_x) || 0;
    const y = Number(r.accel_y) || 0;
    const z = Number(r.accel_z) || 0;
    const mag = Math.sqrt(x * x + y * y + z * z);
    return Math.abs(mag - 9.81);
  });
  const vibTrend = calculateTrend(vibValues, "vibration");
  const vibAvg = calculateAverage(vibValues);
  const vibMin = calculateMinimum(vibValues);
  const vibMax = calculateMaximum(vibValues);
  const vibCurrent = vibValues[vibValues.length - 1];
  const vibPercentChange = calculatePercentChange(vibValues[0], vibCurrent);

  // Extract Electrical Array (Filter where ina219_voltage_valid === true)
  const validElecReadings = chronoReadings.filter((r) => r.ina219_voltage_valid === true);
  const hasValidElec = validElecReadings.length >= 5;

  let elecSummary = { status: "UNAVAILABLE" };

  if (hasValidElec) {
    const voltValues = validElecReadings.map((r) => r.bus_voltage_v);
    const currValues = validElecReadings.map((r) => r.current_ma);
    const pwrValues = validElecReadings.map((r) => r.power_mw);

    elecSummary = {
      status: "AVAILABLE",
      voltTrend: calculateTrend(voltValues, "voltage"),
      voltAvg: calculateAverage(voltValues),
      voltMin: calculateMinimum(voltValues),
      voltMax: calculateMaximum(voltValues),
      voltCurrent: Number(validElecReadings[validElecReadings.length - 1]?.bus_voltage_v),
      currAvg: calculateAverage(currValues),
      currMin: calculateMinimum(currValues),
      currMax: calculateMaximum(currValues),
      currCurrent: Number(validElecReadings[validElecReadings.length - 1]?.current_ma),
      pwrAvg: calculateAverage(pwrValues),
      pwrMin: calculateMinimum(pwrValues),
      pwrMax: calculateMaximum(pwrValues),
      pwrCurrent: Number(validElecReadings[validElecReadings.length - 1]?.power_mw),
    };
  }

  // Determine overall machine condition trend
  // If any sensor is deteriorating, reflect that
  let overall = "MONITORING";
  if (tempTrend === "STABLE" && vibTrend === "STABLE" && (elecSummary.status === "UNAVAILABLE" || elecSummary.voltTrend === "STABLE")) {
    overall = "STABLE";
  }

  // Create explanation message
  let message = "";
  if (tempTrend === "INCREASING") {
    message += "Temperature shows an increasing trend. ";
  } else if (tempTrend === "DECREASING") {
    message += "Temperature shows a decreasing trend. ";
  } else {
    message += "Temperature is stable. ";
  }

  if (vibTrend === "INCREASING") {
    message += "Vibration shows an upward trend. ";
  } else if (vibTrend === "DECREASING") {
    message += "Vibration is decreasing. ";
  } else {
    message += "Vibration levels remain stable. ";
  }

  if (elecSummary.status === "UNAVAILABLE") {
    message += "Electrical metrics are currently unavailable.";
  } else {
    if (elecSummary.voltTrend === "INCREASING") {
      message += "Voltage is trending upward.";
    } else if (elecSummary.voltTrend === "DECREASING") {
      message += "Voltage is trending downward.";
    } else {
      message += "Voltage is stable.";
    }
  }

  return {
    temp: { trend: tempTrend, current: tempCurrent, avg: tempAvg, min: tempMin, max: tempMax, percentChange: tempPercentChange },
    vib: { trend: vibTrend, current: vibCurrent, avg: vibAvg, min: vibMin, max: vibMax, percentChange: vibPercentChange },
    elec: elecSummary,
    overall,
    message: message.trim(),
  };
}
