/**
 * EcoTwin Alert Engine
 * Evaluates telemetry assessments to generate candidate alerts for the database queue.
 */

export function generateAlerts({
  latestReading,
  healthAssessment,
  trendAssessment,
  predictiveAssessment,
  energyAssessment
}) {
  const alerts = [];
  if (!latestReading || !healthAssessment || !predictiveAssessment || !trendAssessment) {
    return alerts;
  }

  const isOnline = healthAssessment.connStatus === "ONLINE";

  // 1. Connectivity Alert
  if (!isOnline) {
    alerts.push({
      alertType: "DEVICE_OFFLINE",
      severity: "CRITICAL",
      title: "Device Offline Alert",
      message: "ECOTWIN-001 has not transmitted telemetry in the last 15 seconds. Physical communication link is down.",
      source: "CONNECTIVITY",
      dedupeKey: "ECOTWIN-001:DEVICE_OFFLINE",
      metadata: { timestamp: new Date().toISOString() }
    });
    // If device is offline, we omit sensor-level alerts
    return alerts;
  }

  // 2. Data Sufficiency Alerts
  if (healthAssessment.status === "INSUFFICIENT_DATA") {
    alerts.push({
      alertType: "INSUFFICIENT_TELEMETRY",
      severity: "WARNING",
      title: "Calibration Data Incomplete",
      message: "Model calibration requires additional telemetry frames to establish operating bounds.",
      source: "HEALTH_ENGINE",
      dedupeKey: "ECOTWIN-001:INSUFFICIENT_TELEMETRY",
      metadata: { totalRecords: healthAssessment.dataSufficiency?.minimumRecordsMet ? 5 : 0 }
    });
    return alerts;
  }

  // 3. Equipment Health Degradation Alerts
  if (healthAssessment.status === "CRITICAL") {
    alerts.push({
      alertType: "MAINTENANCE_REQUIRED",
      severity: "CRITICAL",
      title: "Urgent Maintenance Action Required",
      message: `Equipment fused health score has dropped to ${healthAssessment.overallScore}/100. Audit mechanical parameters.`,
      source: "DECISION_ENGINE",
      dedupeKey: "ECOTWIN-001:MAINTENANCE_REQUIRED",
      metadata: { score: healthAssessment.overallScore }
    });
  } else if (healthAssessment.status === "DEGRADED" || healthAssessment.overallScore < 90) {
    alerts.push({
      alertType: "EQUIPMENT_DEGRADED",
      severity: "WARNING",
      title: "Equipment Performance Degraded",
      message: `Equipment health indicator has decreased to ${healthAssessment.overallScore}/100. Inspection is recommended.`,
      source: "DECISION_ENGINE",
      dedupeKey: "ECOTWIN-001:EQUIPMENT_DEGRADED",
      metadata: { score: healthAssessment.overallScore }
    });
  }

  // 4. Sensor-Specific Anomalies (Thermal, Vibration, Electrical)
  if (healthAssessment.thermal.status === "CRITICAL") {
    alerts.push({
      alertType: "THERMAL_ANOMALY",
      severity: "CRITICAL",
      title: "Critical Thermal Anomaly",
      message: `DS18B20 reporting critical thermal state of ${healthAssessment.thermal.current?.toFixed(1)}°C. Check ventilation.`,
      source: "HEALTH_ENGINE",
      dedupeKey: "ECOTWIN-001:THERMAL_ANOMALY",
      metadata: { temp: healthAssessment.thermal.current }
    });
  }

  if (healthAssessment.vibration.status === "CRITICAL") {
    alerts.push({
      alertType: "VIBRATION_ANOMALY",
      severity: "CRITICAL",
      title: "Critical Mechanical Vibration",
      message: `MPU6050 reporting critical vibration displacement of ${healthAssessment.vibration.current?.toFixed(2)} m/s². Check structural mounts.`,
      source: "HEALTH_ENGINE",
      dedupeKey: "ECOTWIN-001:VIBRATION_ANOMALY",
      metadata: { dev: healthAssessment.vibration.current }
    });
  }

  if (healthAssessment.electrical.status === "INVALID") {
    alerts.push({
      alertType: "ELECTRICAL_ANOMALY",
      severity: "CRITICAL",
      title: "Invalid Electrical Supply Draw",
      message: `INA219 detected overvoltage supply at ${healthAssessment.electrical.voltage?.toFixed(2)} V. Motor rated for 5 V operation.`,
      source: "PREDICTIVE_ENGINE",
      dedupeKey: "ECOTWIN-001:ELECTRICAL_ANOMALY",
      metadata: { voltage: healthAssessment.electrical.voltage }
    });
  }

  // 5. Existing Phase 7 Alerts (Temperature, Vibration, Electrical, and Predictive baselines)
  const temp = latestReading.temperature_c;
  if (temp !== null && temp !== undefined && !Number.isNaN(Number(temp))) {
    if (healthAssessment.thermal.status === "CRITICAL") {
      alerts.push({
        alertType: "HIGH_TEMPERATURE",
        severity: "CRITICAL",
        title: "Critical Temperature Alert",
        message: `DS18B20 reporting critical temperature at ${Number(temp).toFixed(1)}°C. Immediate thermal load check required.`,
        source: "HEALTH_ENGINE",
        dedupeKey: "ECOTWIN-001:HIGH_TEMPERATURE",
        metadata: { temperature: temp }
      });
    } else if (healthAssessment.thermal.status === "MONITOR") {
      alerts.push({
        alertType: "HIGH_TEMPERATURE",
        severity: "WARNING",
        title: "Elevated Temperature Warning",
        message: `DS18B20 reporting elevated temperature at ${Number(temp).toFixed(1)}°C. Inspect cooling systems.`,
        source: "HEALTH_ENGINE",
        dedupeKey: "ECOTWIN-001:HIGH_TEMPERATURE",
        metadata: { temperature: temp }
      });
    } else if (predictiveAssessment.isTempPersistent) {
      alerts.push({
        alertType: "TEMPERATURE_TREND",
        severity: "INFO",
        title: "Thermal Escalation Indicator",
        message: "DS18B20 temperature remains normal but shows a persistent upward trend across recent readings.",
        source: "TREND_ENGINE",
        dedupeKey: "ECOTWIN-001:TEMPERATURE_TREND",
        metadata: { temperature: temp }
      });
    }
  }

  const dev = healthAssessment.vibration.current;
  if (dev !== null && dev !== undefined && dev >= 0.10) {
    if (healthAssessment.vibration.status === "CRITICAL") {
      alerts.push({
        alertType: "HIGH_VIBRATION",
        severity: "CRITICAL",
        title: "Critical Vibration Alert",
        message: `MPU6050 reporting critical vibration deviation of ${dev.toFixed(2)} m/s². Structural mounts require check.`,
        source: "HEALTH_ENGINE",
        dedupeKey: "ECOTWIN-001:HIGH_VIBRATION",
        metadata: { deviation: dev }
      });
    } else if (healthAssessment.vibration.status === "MONITOR") {
      alerts.push({
        alertType: "HIGH_VIBRATION",
        severity: "WARNING",
        title: "Elevated Vibration Warning",
        message: `MPU6050 reporting warning vibration deviation of ${dev.toFixed(2)} m/s². Schedule mechanical inspection.`,
        source: "HEALTH_ENGINE",
        dedupeKey: "ECOTWIN-001:HIGH_VIBRATION",
        metadata: { deviation: dev }
      });
    } else if (predictiveAssessment.isVibPersistent) {
      alerts.push({
        alertType: "VIBRATION_TREND",
        severity: "INFO",
        title: "Mechanical Wear Indicator",
        message: "MPU6050 vibration deviation remains normal but shows a persistent upward trend across recent readings.",
        source: "TREND_ENGINE",
        dedupeKey: "ECOTWIN-001:VIBRATION_TREND",
        metadata: { deviation: dev }
      });
    }
  }

  const hasValidElec = latestReading.ina219_voltage_valid === true && latestReading.sensor_ina219_ok !== false;

  if (!hasValidElec) {
    alerts.push({
      alertType: "ELECTRICAL_UNAVAILABLE",
      severity: "INFO",
      title: "Electrical Telemetry Unavailable",
      message: "INA219 validity flag is false. Electrical calculations are disabled.",
      source: "HEALTH_ENGINE",
      dedupeKey: "ECOTWIN-001:ELECTRICAL_UNAVAILABLE",
      metadata: {}
    });
  } else if (energyAssessment) {
    const currentPowerW = (Number(latestReading.power_mw) || 0) / 1000;

    if (currentPowerW > 5.0) {
      alerts.push({
        alertType: "HIGH_POWER",
        severity: "CRITICAL",
        title: "Critical Electrical Draw",
        message: `Power consumption is critically high at ${currentPowerW.toFixed(3)} W. Audit motor loadings immediately.`,
        source: "PREDICTIVE_ENGINE",
        dedupeKey: "ECOTWIN-001:HIGH_POWER",
        metadata: { powerW: currentPowerW }
      });
    } else if (currentPowerW > 3.0) {
      alerts.push({
        alertType: "HIGH_POWER",
        severity: "WARNING",
        title: "Elevated Electrical Draw",
        message: `Power consumption is elevated at ${currentPowerW.toFixed(3)} W. Review operating cycles.`,
        source: "PREDICTIVE_ENGINE",
        dedupeKey: "ECOTWIN-001:HIGH_POWER",
        metadata: { powerW: currentPowerW }
      });
    }

    if (energyAssessment.trend === "INCREASING") {
      alerts.push({
        alertType: "POWER_TREND",
        severity: "WARNING",
        title: "Electrical Load Escalation",
        message: "Rule-based analysis identifies a persistent upward trend in operational power demand.",
        source: "TREND_ENGINE",
        dedupeKey: "ECOTWIN-001:POWER_TREND",
        metadata: { trend: energyAssessment.trend }
      });
    }

    if (energyAssessment.trend === "VOLATILE" || energyAssessment.powerStability < 60) {
      alerts.push({
        alertType: "POWER_VOLATILITY",
        severity: "WARNING",
        title: "High Electrical Volatility",
        message: `Electrical stability rating is poor (${energyAssessment.powerStability}/100) indicating inconsistent mechanical loads.`,
        source: "TREND_ENGINE",
        dedupeKey: "ECOTWIN-001:POWER_VOLATILITY",
        metadata: { stability: energyAssessment.powerStability }
      });
    }

    if (energyAssessment.quality.coverage < 80) {
      alerts.push({
        alertType: "ELECTRICAL_DATA_QUALITY",
        severity: "WARNING",
        title: "Limited Telemetry Coverage",
        message: `Electrical telemetry coverage has dropped below the baseline (${energyAssessment.quality.coverage}%).`,
        source: "HEALTH_ENGINE",
        dedupeKey: "ECOTWIN-001:ELECTRICAL_DATA_QUALITY",
        metadata: { coverage: energyAssessment.quality.coverage }
      });
    }
  }

  if (predictiveAssessment.anomalyScore >= 60) {
    alerts.push({
      alertType: "ANOMALY_DETECTED",
      severity: predictiveAssessment.anomalyScore >= 80 ? "CRITICAL" : "WARNING",
      title: "Statistical Anomaly Warning",
      message: `Statistical variance score is abnormal at ${predictiveAssessment.anomalyScore}/100. Inspect sensor alignments.`,
      source: "PREDICTIVE_ENGINE",
      dedupeKey: "ECOTWIN-001:ANOMALY_DETECTED",
      metadata: { anomalyScore: predictiveAssessment.anomalyScore }
    });
  }

  if (predictiveAssessment.maintenanceRisk >= 40) {
    alerts.push({
      alertType: "MAINTENANCE_RISK",
      severity: predictiveAssessment.maintenanceRisk >= 80 ? "CRITICAL" : "WARNING",
      title: "Elevated Maintenance Risk Alert",
      message: `Rule-based risk score indicates ${predictiveAssessment.riskLevel.toLowerCase()} maintenance requirement (${predictiveAssessment.maintenanceRisk}/100).`,
      source: "DECISION_ENGINE",
      dedupeKey: "ECOTWIN-001:MAINTENANCE_RISK",
      metadata: { riskScore: predictiveAssessment.maintenanceRisk }
    });
  }

  return alerts;
}
