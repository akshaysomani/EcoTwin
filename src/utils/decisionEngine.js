/**
 * EcoTwin AI Decision Synthesis Engine
 * Synthesizes health indicators, trends, and anomalies into actionable operator decisions.
 */

import { DECISION_RULES } from "./decisionRules";
import { EXPLANATION_ENGINE } from "./explanationEngine";

function formatNumber(value, digits = 2, fallback = "--") {
  if (value === null || value === undefined) return fallback;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return numericValue.toFixed(digits);
}

export function synthesizeDecisionAssessment({
  healthData,
  trendData,
  predictiveData,
  latestReading
}) {
  try {
    if (!healthData || !predictiveData || !trendData) {
      return {
        machineCondition: "MONITOR",
        primaryRisk: "None",
        severity: "LOW",
        contributingFactors: [],
        recommendation: "Continue monitoring available telemetry.",
        priority: "MONITOR",
        confidence: "LOW",
        explanation: "Telemetry is incomplete; the system is using the available measurements.",
        reasons: [
          "Some telemetry values are unavailable."
        ]
      };
    }

    const isOnline = healthData.connStatus === "ONLINE";
    
    // 1. Evaluate overall machine condition and action priority
    const machineCondition = DECISION_RULES.evaluateMachineCondition({
      tempStatus: healthData.tempStatus,
      vibStatus: healthData.vibStatus,
      connStatus: healthData.connStatus,
      anomalyScore: predictiveData.anomalyScore,
      maintenanceRisk: predictiveData.maintenanceRisk
    });

    const priority = DECISION_RULES.evaluateActionPriority({
      machineCondition,
      maintenanceRisk: predictiveData.maintenanceRisk,
      isTempPersistent: predictiveData.isTempPersistent,
      isVibPersistent: predictiveData.isVibPersistent
    });

    // 2. Map risk parameters
    const primaryRisk = !isOnline 
      ? "Network" 
      : (predictiveData.dominantRisk === "NONE" ? "None" : predictiveData.dominantRisk);
    
    const severity = predictiveData.riskLevel;
    const confidence = predictiveData.confidence;
    const recommendation = predictiveData.recommendation;

    // 3. Calculate current vibration deviation safely from latestReading
    let currentVibDev = null;
    if (latestReading) {
      const x = Number(latestReading.accel_x) || 0;
      const y = Number(latestReading.accel_y) || 0;
      const z = Number(latestReading.accel_z) || 0;
      currentVibDev = Math.abs(Math.sqrt(x * x + y * y + z * z) - 9.81);
    }

    // 4. Assemble explanation text (human-readable paragraph)
    const connExp = EXPLANATION_ENGINE.getConnectivityExplanation(isOnline);
    const tempExp = isOnline 
      ? EXPLANATION_ENGINE.getTemperatureExplanation(
          latestReading?.temperature_c,
          healthData.tempStatus,
          trendData.temp.trend,
          predictiveData.isTempPersistent
        )
      : "";
    
    const vibExp = isOnline 
      ? EXPLANATION_ENGINE.getVibrationExplanation(
          currentVibDev,
          healthData.vibStatus,
          trendData.vib.trend,
          predictiveData.isVibPersistent
        )
      : "";
    
    const elecExp = EXPLANATION_ENGINE.getElectricalExplanation(
      latestReading?.ina219_voltage_valid === true,
      latestReading?.bus_voltage_v,
      latestReading?.current_ma,
      predictiveData.elecStatus
    );

    const explanation = [connExp, tempExp, vibExp, elecExp].filter(Boolean).join(" ");

    // 5. Build bullet points ("Why this decision?")
    const reasons = [];
    
    if (!isOnline) {
      reasons.push("EcoTwin edge device is currently OFFLINE.");
      reasons.push("Last received telemetry is older than the 15-second connectivity limit.");
      reasons.push("Check physical power to the ESP32 chip and local Wi-Fi connectivity.");
    } else {
      // Temperature reason
      if (latestReading?.temperature_c === null || latestReading?.temperature_c === undefined) {
        reasons.push("Temperature data is currently unavailable.");
      } else if (healthData.tempStatus === "NORMAL") {
        reasons.push(`Temperature is normal (${formatNumber(latestReading?.temperature_c, 2)}°C) and operating within limits.`);
      } else {
        reasons.push(`Temperature is elevated (${formatNumber(latestReading?.temperature_c, 2)}°C) in the ${healthData.tempStatus} state.`);
      }

      // Vibration reason
      if (currentVibDev === null) {
        reasons.push("Vibration data is currently unavailable.");
      } else if (currentVibDev < 0.10) {
        reasons.push("Vibration deviation is minimal, indicating zero active mechanical stress.");
      } else if (healthData.vibStatus === "NORMAL") {
        reasons.push(`Vibration is within limits (deviation: ${formatNumber(currentVibDev, 2)} m/s²).`);
      } else {
        reasons.push(`Vibration deviation is abnormal at ${formatNumber(currentVibDev, 2)} m/s² (${healthData.vibStatus}).`);
      }

      // Outliers reason
      if (predictiveData.anomalyScore <= 20) {
        reasons.push("No significant statistical anomaly has been detected in recent cycles.");
      } else {
        reasons.push(`Statistical outlier score is elevated at ${predictiveData.anomalyScore}/100.`);
      }

      // Trends reason
      if (predictiveData.isTempPersistent || predictiveData.isVibPersistent) {
        const activeTrends = [];
        if (predictiveData.isTempPersistent) activeTrends.push("temperature");
        if (predictiveData.isVibPersistent) activeTrends.push("vibration");
        reasons.push(`Persistent upward trend detected on the ${activeTrends.join(" & ")} channel.`);
      } else {
        reasons.push("Telemetry trends remain stable across the selected time horizon.");
      }

      // Electrical context
      if (latestReading?.ina219_voltage_valid !== true) {
        reasons.push("Electrical sensor (INA219) is unavailable; excluded from baseline calculations.");
      }
    }

    // 6. Build contributing factors
    const contributingFactors = [];
    if (healthData.tempStatus !== "NORMAL") contributingFactors.push(`Temperature: ${healthData.tempStatus}`);
    if (healthData.vibStatus !== "NORMAL") contributingFactors.push(`Vibration: ${healthData.vibStatus}`);
    if (predictiveData.isTempPersistent) contributingFactors.push("Thermal Escalation Trend");
    if (predictiveData.isVibPersistent) contributingFactors.push("Mechanical Stress Trend");
    if (predictiveData.anomalyScore > 30) contributingFactors.push(`Variance Outliers (${predictiveData.anomalyScore})`);

    return {
      machineCondition,
      primaryRisk,
      severity,
      contributingFactors,
      recommendation,
      priority,
      confidence,
      explanation,
      reasons
    };
  } catch (error) {
    console.error("AI Decision synthesis error caught:", error);
    return {
      machineCondition: "MONITOR",
      primaryRisk: "None",
      severity: "LOW",
      contributingFactors: [],
      recommendation: "Continue monitoring available telemetry.",
      priority: "MONITOR",
      confidence: "LOW",
      explanation: "Telemetry is incomplete; the system is using the available measurements.",
      reasons: [
        "Some telemetry values are unavailable."
      ]
    };
  }
}
