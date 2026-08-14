/**
 * EcoTwin Maintenance Recommendation Engine
 * Analyzes Equipment Health Assessments to generate prioritized, explainable action plans.
 */

export const maintenanceEngine = {
  generateRecommendations(healthAssessment) {
    const recommendations = [];

    if (!healthAssessment || healthAssessment.status === "INSUFFICIENT_DATA") {
      recommendations.push({
        priority: "MONITOR",
        type: "INSUFFICIENT_DATA",
        title: "Model Baseline Calibration",
        message: "EcoTwin model is gathering initial telemetry records to configure statistical thresholds.",
        subsystem: "Orchestration",
        evidence: "Telemetry readings count is lower than the configured 5-record minimum.",
        confidence: "INSUFFICIENT",
        timestamp: new Date().toISOString()
      });
      return recommendations;
    }

    const { thermal, vibration, electrical, overallScore, confidence } = healthAssessment;

    // Rule 1: Safe motor supply validation (Check voltage ranges)
    if (electrical.status === "INVALID") {
      recommendations.push({
        priority: "URGENT INSPECTION",
        type: "CHECK_POWER_SUPPLY",
        title: "Overvoltage Power Supply Check",
        message: "Measured voltage exceeds motor specifications. Inspect supply sags and regulators.",
        subsystem: "Electrical",
        evidence: `INA219 reported bus voltage is ${electrical.voltage?.toFixed(2) || "--"} V, exceeding the safe limit for a 5 V motor.`,
        confidence: "HIGH",
        timestamp: new Date().toISOString()
      });
    }

    // Rule 2: Vibration deviations
    if (vibration.status === "CRITICAL") {
      recommendations.push({
        priority: "URGENT INSPECTION",
        type: "INSPECT_MOTOR",
        title: "Bearing & Mechanical Alignment",
        message: "High mechanical stress deviation detected. Check physical motor mounts immediately.",
        subsystem: "Vibration",
        evidence: `MPU6050 vibration deviation is critical at ${vibration.current?.toFixed(2) || "--"} m/s² (peak: ${vibration.peak?.toFixed(2) || "--"} m/s²).`,
        confidence: confidence,
        timestamp: new Date().toISOString()
      });
    } else if (vibration.status === "MONITOR") {
      recommendations.push({
        priority: "MONITOR",
        type: "MONITOR_VIBRATION",
        title: "Rotational Volatility Inspection",
        message: "Slight mechanical stress offset. Schedule a bearing audit during next downtime.",
        subsystem: "Vibration",
        evidence: `MPU6050 vibration deviation is elevated at ${vibration.current?.toFixed(2) || "--"} m/s² with an ${vibration.trend.toLowerCase()} trend.`,
        confidence: confidence,
        timestamp: new Date().toISOString()
      });
    }

    // Rule 3: Thermal boundaries
    if (thermal.status === "CRITICAL") {
      recommendations.push({
        priority: "URGENT INSPECTION",
        type: "MONITOR_TEMPERATURE",
        title: "Thermal Overload Audit",
        message: "Critical temperature levels detected. Check heat dissipation paths and cooling fans.",
        subsystem: "Thermal",
        evidence: `DS18B20 reporting critical temperature at ${thermal.current?.toFixed(1) || "--"}°C (peak: ${thermal.peak?.toFixed(1) || "--"}°C).`,
        confidence: "HIGH",
        timestamp: new Date().toISOString()
      });
    } else if (thermal.status === "MONITOR") {
      recommendations.push({
        priority: "MONITOR",
        type: "MONITOR_TEMPERATURE",
        title: "Elevated Operating Temperature",
        message: "Monitor thermal baselines. Increased loading or poor ventilation may be developing.",
        subsystem: "Thermal",
        evidence: `DS18B20 temperature is elevated at ${thermal.current?.toFixed(1) || "--"}°C.`,
        confidence: "HIGH",
        timestamp: new Date().toISOString()
      });
    }

    // Rule 4: High current loading (electrical)
    if (electrical.status === "HIGH_LOAD") {
      recommendations.push({
        priority: "SCHEDULE INSPECTION",
        type: "CHECK_MOTOR_LOAD",
        title: "Excessive Mechanical Loading",
        message: "Measured electrical draws indicate the motor is working under high load. Check shaft friction.",
        subsystem: "Electrical",
        evidence: `INA219 active power is ${electrical.power?.toFixed(3) || "--"} W with currents averaging ${electrical.current?.toFixed(1) || "--"} mA.`,
        confidence: confidence,
        timestamp: new Date().toISOString()
      });
    }

    // Default: healthy state
    if (recommendations.length === 0 && overallScore >= 90) {
      recommendations.push({
        priority: "ROUTINE",
        type: "NO_ACTION_REQUIRED",
        title: "Nominal System Operating State",
        message: "Equipment is operating within safety thresholds. No manual maintenance actions are required.",
        subsystem: "Orchestration",
        evidence: `Overall fused score is stable at ${overallScore}/100.`,
        confidence: confidence,
        timestamp: new Date().toISOString()
      });
    }

    return recommendations;
  }
};
