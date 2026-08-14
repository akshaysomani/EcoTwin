/**
 * EcoTwin AI Explanation Engine
 * Generates natural language condition descriptions based on telemetry and engine results.
 */

function formatNumber(value, digits = 2, fallback = "--") {
  if (value === null || value === undefined) return fallback;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return numericValue.toFixed(digits);
}

export const EXPLANATION_ENGINE = {
  // Generate temperature status explanation
  getTemperatureExplanation(temp, status, trend, isPersistent) {
    if (temp === null || temp === undefined) return "Temperature data is currently unavailable.";
    
    if (status === "CRITICAL") {
      return `Critical thermal state detected (${formatNumber(temp, 2)}°C). Lubrication levels, friction, and environmental loading must be audited immediately.`;
    }
    
    if (status === "WARNING") {
      return `Temperature is elevated (${formatNumber(temp, 2)}°C) and ${trend === "INCREASING" ? "trending upward" : "remains high"}. Cooling pathways and venting systems should be inspected soon.`;
    }

    if (trend === "INCREASING") {
      return `Temperature is within the normal operating range (${formatNumber(temp, 2)}°C) but is showing a ${isPersistent ? "persistent upward trend" : "slight increasing movement"} across recent logs.`;
    }

    return `Temperature (${formatNumber(temp, 2)}°C) remains stable near the historical operating baseline with no persistent thermal deterioration detected.`;
  },

  // Generate vibration status explanation
  getVibrationExplanation(dev, status, trend, isPersistent) {
    if (dev === null || dev === undefined || Number.isNaN(Number(dev))) return "Vibration data is currently unavailable.";
    
    // Vibration safety noise floor check
    if (dev < 0.10) {
      return "Vibration remains close to the expected baseline with negligible mechanical deviation detected.";
    }

    if (status === "CRITICAL") {
      return `Critical vibration deviation detected (${formatNumber(dev, 2)} m/s²). Mounts, couplings, and bearings are under extreme stress and require emergency inspection.`;
    }

    if (status === "WARNING") {
      return `Vibration deviation is elevated (${formatNumber(dev, 2)} m/s²) and ${trend === "INCREASING" ? "trending upward" : "remains elevated"}. Rotating mechanical components should be scheduled for review.`;
    }

    if (trend === "INCREASING") {
      return `Vibration remains within the normal range (${formatNumber(dev, 2)} m/s²) but is showing a ${isPersistent ? "persistent increasing trend" : "temporary upward change"} over recent logs.`;
    }

    return `Vibration is stable and remains close to the expected baseline, indicating no active mechanical stress.`;
  },

  // Generate electrical status explanation
  getElectricalExplanation(isVoltValid, volt, current, status) {
    if (!isVoltValid || volt === null || volt === undefined) {
      return "Electrical telemetry is unavailable because the INA219 validity flag is false. No electrical fault is inferred from the missing measurement.";
    }

    if (status === "SEVERE ANOMALY" || status === "SIGNIFICANT ANOMALY") {
      return `Electrical parameters indicate abnormal variance (${formatNumber(volt, 2)}V, ${formatNumber(current, 2)}mA). Inspect motor loads, wiring connections, and power distribution paths.`;
    }

    if (status === "MILD ANOMALY") {
      return `Electrical telemetry reports mild outliers (${formatNumber(volt, 2)}V, ${formatNumber(current, 2)}mA) from historical baselines. Continue normal monitoring.`;
    }

    return `Electrical draws (${formatNumber(volt, 2)}V, ${formatNumber(current, 2)}mA) are stable and close to the historical operational baseline.`;
  },

  // Generate connectivity explanation
  getConnectivityExplanation(isOnline) {
    if (!isOnline) {
      return "No recent telemetry has been received within the configured connectivity window. Device connectivity should be checked.";
    }
    return "Communication link is active and transmitting telemetry continuously.";
  }
};
