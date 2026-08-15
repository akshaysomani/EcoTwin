/**
 * Centralized utility for computing dynamic estimated motor energy parameters
 * when raw INA219 electrical voltage telemetry is unverified.
 * Sourced from real INA219 current telemetry and nominal 5.0 V voltage basis.
 */

export const ESTIMATION_CONFIG = {
  enabled: true,
  nominalVoltageV: 5.0
};

export function formatDuration(ms) {
  if (!ms || ms < 0) return "0s";
  const totalSecs = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function calculateDynamicEstimatedEnergy(readings = [], nominalVoltageV = ESTIMATION_CONFIG.nominalVoltageV) {
  if (!readings || readings.length === 0) {
    return {
      mode: "ESTIMATED",
      nominalVoltageV,
      currentPowerW: null,
      cumulativeEnergyWh: 0,
      cumulativeEnergyKwh: 0,
      validCurrentRecords: 0,
      ignoredRecords: 0,
      integratedIntervals: 0,
      lastTimestamp: null,
      durationMs: 0,
      formattedDuration: "0s",
      dataSource: "REAL_INA219_CURRENT",
      voltageSource: "NOMINAL_MOTOR_VOLTAGE",
      verified: false
    };
  }

  let ignoredRecords = 0;
  const processed = [];

  for (const r of readings) {
    const rawVal = r.current_ma;
    if (rawVal === null || rawVal === undefined || Number.isNaN(Number(rawVal)) || !Number.isFinite(Number(rawVal))) {
      ignoredRecords++;
      continue;
    }
    const currentMa = Math.max(0, Number(rawVal)); // Clamp negative noise to 0.0
    const timeMs = new Date(r.created_at).getTime();

    if (Number.isNaN(timeMs)) {
      ignoredRecords++;
      continue;
    }

    processed.push({
      currentMa,
      timeMs,
      created_at: r.created_at
    });
  }

  // Sort chronologically (oldest to newest)
  processed.sort((a, b) => a.timeMs - b.timeMs);

  const validCurrentRecords = processed.length;

  if (validCurrentRecords === 0) {
    return {
      mode: "ESTIMATED",
      nominalVoltageV,
      currentPowerW: null,
      cumulativeEnergyWh: 0,
      cumulativeEnergyKwh: 0,
      validCurrentRecords: 0,
      ignoredRecords,
      integratedIntervals: 0,
      lastTimestamp: null,
      durationMs: 0,
      formattedDuration: "0s",
      dataSource: "REAL_INA219_CURRENT",
      voltageSource: "NOMINAL_MOTOR_VOLTAGE",
      verified: false
    };
  }

  // Latest usable current record (last index after chronological sorting)
  const latestRecord = processed[processed.length - 1];
  const latestCurrentMa = latestRecord.currentMa;
  const currentPowerW = nominalVoltageV * (latestCurrentMa / 1000);

  // Dynamic Integration
  let cumulativeEnergyWh = 0;
  let integratedIntervals = 0;
  let durationMs = 0;

  for (let i = 1; i < processed.length; i++) {
    const prev = processed[i - 1];
    const curr = processed[i];

    const deltaMs = curr.timeMs - prev.timeMs;
    const deltaHours = deltaMs / 3600000;

    // Gap protection: ignore if delta is negative or > 1 hour (3600000 ms)
    if (deltaMs > 0 && deltaMs <= 3600000) {
      const powerPrevious = nominalVoltageV * (prev.currentMa / 1000);
      const powerCurrent = nominalVoltageV * (curr.currentMa / 1000);

      const deltaEnergyWh = ((powerPrevious + powerCurrent) / 2) * deltaHours;
      cumulativeEnergyWh += deltaEnergyWh;
      durationMs += deltaMs;
      integratedIntervals++;
    }
  }

  const cumulativeEnergyKwh = cumulativeEnergyWh / 1000;
  const formattedDuration = formatDuration(durationMs);
  const avgCurrentMa = processed.reduce((sum, r) => sum + r.currentMa, 0) / processed.length;

  return {
    mode: "ESTIMATED",
    nominalVoltageV,
    currentPowerW,
    cumulativeEnergyWh,
    cumulativeEnergyKwh,
    validCurrentRecords,
    ignoredRecords,
    integratedIntervals,
    lastTimestamp: latestRecord.created_at,
    durationMs,
    formattedDuration,
    avgCurrentMa,
    latestCurrentMa,
    dataSource: "REAL_INA219_CURRENT",
    voltageSource: "NOMINAL_MOTOR_VOLTAGE",
    verified: false
  };
}
