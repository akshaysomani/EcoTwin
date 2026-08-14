/**
 * EcoTwin Health Calculation Engine
 * Interprets raw sensor readings into machine state and condition alerts.
 * Upgraded in Phase 8 to support Multi-Sensor Fusion and Equipment Health Intelligence.
 */

export function calculateVibrationMagnitude(accelX, accelY, accelZ) {
  const x = Number(accelX) || 0;
  const y = Number(accelY) || 0;
  const z = Number(accelZ) || 0;
  return Math.sqrt(x * x + y * y + z * z);
}

export function calculateVibrationDeviation(accelX, accelY, accelZ) {
  const magnitude = calculateVibrationMagnitude(accelX, accelY, accelZ);
  return Math.abs(magnitude - 9.81);
}

export function getTemperatureStatus(tempC, sensorOk = true) {
  if (sensorOk === false) return "CRITICAL";
  if (tempC === null || tempC === undefined || Number.isNaN(Number(tempC))) {
    return "CRITICAL";
  }
  const val = Number(tempC);
  if (val < 40) return "NORMAL";
  if (val <= 60) return "WARNING";
  return "CRITICAL";
}

export function getVibrationStatus(accelX, accelY, accelZ, sensorOk = true) {
  if (sensorOk === false) return "CRITICAL";
  if (
    accelX === null || accelX === undefined ||
    accelY === null || accelY === undefined ||
    accelZ === null || accelZ === undefined
  ) {
    return "CRITICAL";
  }
  const deviation = calculateVibrationDeviation(accelX, accelY, accelZ);
  if (deviation < 1.0) return "NORMAL";
  if (deviation <= 3.0) return "WARNING";
  return "CRITICAL";
}

export function getElectricalStatus(ina219VoltageValid, sensorOk = true) {
  if (sensorOk === false || ina219VoltageValid !== true) {
    return "UNAVAILABLE";
  }
  return "NORMAL";
}

export function calculateOperationalHealth(reading, isOnline) {
  if (!reading) {
    return {
      score: 0,
      tempStatus: "CRITICAL",
      vibStatus: "CRITICAL",
      elecStatus: "UNAVAILABLE",
      connStatus: "OFFLINE",
      isElecUnavailable: true,
    };
  }

  const isTempOk = reading.sensor_ds18b20_ok !== false;
  const isVibOk = reading.sensor_mpu6050_ok !== false;
  const isElecOk = reading.sensor_ina219_ok !== false;

  const tempStatus = getTemperatureStatus(reading.temperature_c, isTempOk);
  const vibStatus = getVibrationStatus(reading.accel_x, reading.accel_y, reading.accel_z, isVibOk);
  const elecStatus = getElectricalStatus(reading.ina219_voltage_valid, isElecOk);
  const connStatus = isOnline ? "ONLINE" : "OFFLINE";

  // Score mapping helper
  const getStatusScore = (status) => {
    switch (status) {
      case "NORMAL":
        return 100;
      case "WARNING":
        return 50;
      case "CRITICAL":
      default:
        return 0;
    }
  };

  const tempScore = getStatusScore(tempStatus);
  const vibScore = getStatusScore(vibStatus);
  const connScore = connStatus === "ONLINE" ? 100 : 0;

  let score;
  let isElecUnavailable = false;

  if (elecStatus === "UNAVAILABLE") {
    isElecUnavailable = true;
    // Temp (35%), Vib (35%), Conn (10%) = Total 80% weight
    const totalWeightedScore = (tempScore * 0.35) + (vibScore * 0.35) + (connScore * 0.10);
    score = Math.round((totalWeightedScore / 0.80));
  } else {
    const elecScore = getStatusScore(elecStatus);
    // Temp (35%), Vib (35%), Elec (20%), Conn (10%) = Total 100% weight
    score = Math.round((tempScore * 0.35) + (vibScore * 0.35) + (elecScore * 0.20) + (connScore * 0.10));
  }

  return {
    score,
    tempStatus,
    vibStatus,
    elecStatus,
    connStatus,
    isElecUnavailable,
  };
}

export function determineMachineState(healthData) {
  const { tempStatus, vibStatus, connStatus } = healthData;

  if (connStatus === "OFFLINE") {
    return "OFFLINE";
  }

  if (tempStatus === "CRITICAL" || vibStatus === "CRITICAL") {
    return "CRITICAL";
  }

  if (tempStatus === "WARNING" || vibStatus === "WARNING") {
    return "WARNING";
  }

  return "HEALTHY";
}

export function getInterpretationMessages(reading, healthData) {
  const messages = [];

  if (healthData.connStatus === "OFFLINE") {
    messages.push("No recent telemetry received from ECOTWIN-001.");
    return messages;
  }

  // Temperature
  if (healthData.tempStatus === "NORMAL") {
    messages.push("Temperature is within the configured operating range.");
  } else if (healthData.tempStatus === "WARNING") {
    messages.push("Temperature is elevated. Increased thermal stress may be developing.");
  } else if (healthData.tempStatus === "CRITICAL") {
    messages.push("Critical thermal threshold exceeded! Immediate cooling or shutdown recommended.");
  }

  // Vibration
  if (healthData.vibStatus === "NORMAL") {
    messages.push("Vibration levels are currently stable.");
  } else if (healthData.vibStatus === "WARNING") {
    messages.push("Elevated vibration detected. Monitor the machine for abnormal mechanical behavior.");
  } else if (healthData.vibStatus === "CRITICAL") {
    messages.push("Severe vibration anomaly detected. Structural damage or severe misalignment risk.");
  }

  // Electrical
  if (healthData.isElecUnavailable) {
    messages.push("Electrical telemetry is unavailable. Check INA219 wiring or power measurement path.");
  }

  return messages;
}

export function getActiveAlerts(healthData) {
  const alerts = [];

  if (healthData.connStatus === "OFFLINE") {
    alerts.push({
      type: "CRITICAL",
      message: "Device is offline / No recent telemetry",
    });
    return alerts;
  }

  if (healthData.tempStatus === "CRITICAL") {
    alerts.push({
      type: "CRITICAL",
      message: "Critical temperature levels detected",
    });
  } else if (healthData.tempStatus === "WARNING") {
    alerts.push({
      type: "WARNING",
      message: "Elevated temperature",
    });
  }

  if (healthData.vibStatus === "CRITICAL") {
    alerts.push({
      type: "CRITICAL",
      message: "Critical vibration anomalies detected",
    });
  } else if (healthData.vibStatus === "WARNING") {
    alerts.push({
      type: "WARNING",
      message: "Elevated vibration",
    });
  }

  if (healthData.isElecUnavailable) {
    alerts.push({
      type: "INFO",
      message: "INA219 electrical telemetry unavailable",
    });
  }

  return alerts;
}

// ==========================================================================
// PHASE 8: EQUIPMENT HEALTH & MULTI-SENSOR FUSION INTELLIGENCE
// ==========================================================================

function getSafeNumber(val) {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

export function calculateEquipmentHealthAssessment(readings = [], energyAssessment = null, predictiveAssessment = null) {
  const total = readings.length;
  
  // 1. Data Sufficiency Model
  const minRecords = 5;
  const tempAvail = readings.some(r => r.temperature_c !== null && r.temperature_c !== undefined);
  const vibAvail = readings.some(r => r.accel_x !== null && r.accel_y !== null && r.accel_z !== null);
  const elecAvail = readings.some(r => r.ina219_voltage_valid === true);

  const sufficiency = {
    temperatureAvailable: tempAvail,
    vibrationAvailable: vibAvail,
    electricalAvailable: elecAvail,
    energyAvailable: energyAssessment ? energyAssessment.available : false,
    minimumRecordsMet: total >= minRecords,
    confidence: total >= 15 ? "HIGH" : (total >= 5 ? "MEDIUM" : "INSUFFICIENT")
  };

  if (total < minRecords) {
    return {
      overallScore: null,
      status: "INSUFFICIENT_DATA",
      confidence: "INSUFFICIENT",
      dataSufficiency: sufficiency,
      thermal: { status: "DATA_UNAVAILABLE", current: null, avg: null, peak: null, trend: "UNAVAILABLE" },
      vibration: { status: "DATA_UNAVAILABLE", current: null, avg: null, peak: null, trend: "UNAVAILABLE" },
      electrical: { status: "DATA_UNAVAILABLE", current: null, avg: null, trend: "UNAVAILABLE" },
      energy: { status: "DATA_UNAVAILABLE", stability: null, Wh: 0 },
      reasons: ["Insufficient telemetry records to build baseline statistical limits."]
    };
  }

  const latest = readings[0];
  const chrono = [...readings].reverse(); // oldest to newest

  // 2. Thermal Assessment
  const temps = chrono.map(r => Number(r.temperature_c)).filter(t => !Number.isNaN(t));
  const currentTemp = Number(latest.temperature_c);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  
  let tempTrend = "STABLE";
  if (temps.length >= 5) {
    const n = temps.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += temps[i];
      sumXY += i * temps[i];
      sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    if (slope > 0.05) tempTrend = "INCREASING";
    else if (slope < -0.05) tempTrend = "DECREASING";
  }

  let thermalStatus = "NORMAL_RANGE";
  if (currentTemp > 60) {
    thermalStatus = "CRITICAL";
  } else if (currentTemp > 40) {
    thermalStatus = "MONITOR";
  }

  const thermalAssessment = {
    status: thermalStatus,
    current: currentTemp,
    avg: avgTemp,
    peak: maxTemp,
    trend: tempTrend
  };

  // 3. Vibration Assessment
  const vibDevs = chrono.map(r => {
    const x = Number(r.accel_x) || 0;
    const y = Number(r.accel_y) || 0;
    const z = Number(r.accel_z) || 0;
    const mag = Math.sqrt(x * x + y * y + z * z);
    return Math.abs(mag - 9.81);
  });

  const gyros = chrono.map(r => {
    const gx = Number(r.gyro_x) || 0;
    const gy = Number(r.gyro_y) || 0;
    const gz = Number(r.gyro_z) || 0;
    return Math.sqrt(gx * gx + gy * gy + gz * gz);
  });

  const currentVib = vibDevs[vibDevs.length - 1];
  const avgVib = vibDevs.reduce((a, b) => a + b, 0) / vibDevs.length;
  const maxVib = Math.max(...vibDevs);

  let vibTrend = "STABLE";
  if (vibDevs.length >= 5) {
    const n = vibDevs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += vibDevs[i];
      sumXY += i * vibDevs[i];
      sumXX += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    if (slope > 0.02) vibTrend = "INCREASING";
    else if (slope < -0.02) vibTrend = "DECREASING";
  }

  let vibStatus = "NORMAL_RANGE";
  if (currentVib > 3.0) {
    vibStatus = "CRITICAL";
  } else if (currentVib > 1.0) {
    vibStatus = "MONITOR";
  }

  const vibrationAssessment = {
    status: vibStatus,
    current: currentVib,
    avg: avgVib,
    peak: maxVib,
    trend: vibTrend,
    gyroCurrent: gyros[gyros.length - 1]
  };

  // 4. Electrical Assessment
  const isVoltValid = latest.ina219_voltage_valid === true && latest.sensor_ina219_ok !== false;
  let elecStatus = "NORMAL";
  let elecReason = "Electrical parameters are operating within safe bounds.";

  if (latest.ina219_voltage_valid === false && Number(latest.bus_voltage_v) > 6.0) {
    elecStatus = "INVALID";
    elecReason = "INA219 bus voltage is outside the configured safe operating range for a 5 V motor.";
  } else if (!isVoltValid) {
    elecStatus = "DATA_UNAVAILABLE";
    elecReason = "INA219 electrical validation flag is currently false.";
  } else {
    const currentW = (Number(latest.power_mw) || 0) / 1000;
    if (currentW > 5.0) {
      elecStatus = "HIGH_LOAD";
      elecReason = "Power consumption is critically high, indicating excessive motor load.";
    } else if (currentW > 3.0) {
      elecStatus = "MONITOR";
      elecReason = "Power consumption is elevated above normal operating baselines.";
    }
  }

  const electricalAssessment = {
    status: elecStatus,
    voltage: getSafeNumber(latest.bus_voltage_v),
    current: getSafeNumber(latest.current_ma),
    power: getSafeNumber(latest.power_mw) !== null ? getSafeNumber(latest.power_mw) / 1000 : null,
    reason: elecReason
  };

  // 5. Energy Health (consuming Phase 7)
  const energyAssessmentDetail = {
    status: energyAssessment ? energyAssessment.trend : "UNAVAILABLE",
    stability: energyAssessment ? energyAssessment.powerStability : null,
    Wh: energyAssessment ? energyAssessment.energyWh : 0,
    coverage: energyAssessment ? energyAssessment.quality.coverage : 0
  };

  // 6. Multi-Sensor Fusion Core scoring
  let score = 100;
  const reasons = [];

  // Thermal deductions
  if (thermalStatus === "CRITICAL") {
    score -= 30;
    reasons.push(`Thermal critical: current temperature (${currentTemp.toFixed(1)}°C) exceeds safety limits.`);
  } else if (thermalStatus === "MONITOR") {
    score -= 10;
    reasons.push(`Thermal elevated: current temperature (${currentTemp.toFixed(1)}°C) is in monitor range.`);
  } else if (tempTrend === "INCREASING") {
    score -= 5;
    reasons.push("Thermal trend: slight upward rate of temperature change observed.");
  }

  // Vibration deductions
  if (vibStatus === "CRITICAL") {
    score -= 30;
    reasons.push(`Mechanical critical: vibration deviation (${currentVib.toFixed(2)} m/s²) exceeds limits.`);
  } else if (vibStatus === "MONITOR") {
    score -= 15;
    reasons.push(`Mechanical elevated: vibration deviation (${currentVib.toFixed(2)} m/s²) in monitor range.`);
  } else if (vibTrend === "INCREASING") {
    score -= 5;
    reasons.push("Vibration trend: mechanical wear slope trending upward.");
  }

  // Electrical deductions
  if (elecStatus === "INVALID") {
    score -= 20;
    reasons.push("Electrical invalid: measured bus voltage exceeds the safe limits of the 5 V motor.");
  } else if (elecStatus === "HIGH_LOAD") {
    score -= 20;
    reasons.push("Electrical critical: excessive power draws detected.");
  } else if (elecStatus === "MONITOR") {
    score -= 10;
    reasons.push("Electrical elevated: power draw is above the normal baseline.");
  }

  // Energy stability deductions
  if (energyAssessment && energyAssessment.available) {
    if (energyAssessment.powerStability < 70) {
      score -= 10;
      reasons.push(`Energy stability is poor (${energyAssessment.powerStability}/100).`);
    }
  }

  // Statistical anomalies from Phase 4
  if (predictiveAssessment && predictiveAssessment.anomalyScore >= 60) {
    score -= 10;
    reasons.push(`Anomaly warning: statistical variance score is elevated (${predictiveAssessment.anomalyScore}/100).`);
  }

  // Cap score between 0 and 100
  const overallScore = Math.max(0, Math.min(100, score));

  // Determine overall status
  let overallStatus = "HEALTHY";
  if (overallScore < 50 || thermalStatus === "CRITICAL" || vibStatus === "CRITICAL" || elecStatus === "INVALID") {
    overallStatus = "CRITICAL";
  } else if (overallScore < 75 || thermalStatus === "MONITOR" || vibStatus === "MONITOR" || elecStatus === "MONITOR") {
    overallStatus = "MONITOR";
  } else if (overallScore < 90) {
    overallStatus = "DEGRADED";
  }

  if (reasons.length === 0) {
    reasons.push("All primary and secondary sensors are reporting within expected parameters.");
  }

  // Set confidence level based on quality coverage
  let confidence = "MEDIUM";
  if (sufficiency.confidence === "HIGH" && (!energyAssessment || energyAssessment.quality.coverage >= 80)) {
    confidence = "HIGH";
  } else if (sufficiency.confidence === "INSUFFICIENT") {
    confidence = "LOW";
  }

  return {
    overallScore,
    status: overallStatus,
    confidence,
    dataSufficiency: sufficiency,
    thermal: thermalAssessment,
    vibration: vibrationAssessment,
    electrical: electricalAssessment,
    energy: energyAssessmentDetail,
    reasons
  };
}
