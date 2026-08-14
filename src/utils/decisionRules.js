/**
 * EcoTwin AI Decision Rules System
 * Centralized, explainable rule engine that maps telemetry states to condition levels and action priorities.
 */

export const DECISION_RULES = {
  // Map deterministic states to overall machine conditions
  evaluateMachineCondition({ tempStatus, vibStatus, connStatus, anomalyScore, maintenanceRisk }) {
    if (connStatus === "OFFLINE") {
      return "OFFLINE";
    }

    // Critical conditions
    if (tempStatus === "CRITICAL" || vibStatus === "CRITICAL" || maintenanceRisk >= 80) {
      return "CRITICAL";
    }

    // Warning conditions
    if (tempStatus === "WARNING" || vibStatus === "WARNING" || anomalyScore >= 60 || maintenanceRisk >= 40) {
      return "WARNING";
    }

    // Monitor conditions (elevated variance or early warning trends)
    if (anomalyScore >= 30 || maintenanceRisk >= 20) {
      return "MONITOR";
    }

    // Default healthy
    return "HEALTHY";
  },

  // Map machine states to recommended priorities
  evaluateActionPriority({ machineCondition, maintenanceRisk, isTempPersistent, isVibPersistent }) {
    if (machineCondition === "OFFLINE") {
      return "URGENT INSPECTION";
    }

    if (machineCondition === "CRITICAL" || maintenanceRisk >= 80) {
      return "URGENT INSPECTION";
    }

    if (machineCondition === "WARNING" || maintenanceRisk >= 40) {
      return "SCHEDULE INSPECTION";
    }

    if (machineCondition === "MONITOR" || isTempPersistent || isVibPersistent) {
      return "MONITOR";
    }

    return "ROUTINE";
  }
};
