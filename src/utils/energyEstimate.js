/**
 * Centralized utility for computing estimated motor energy parameters
 * when raw INA219 electrical telemetry is unverified.
 */

export const ESTIMATION_CONFIG = {
  enabled: true,
  nominalVoltageV: 5,
  observedCurrentMa: 74,
  runtimeMinutes: 10
};

export function calculateEstimatedEnergy({
  nominalVoltageV = ESTIMATION_CONFIG.nominalVoltageV,
  observedCurrentMa = ESTIMATION_CONFIG.observedCurrentMa,
  runtimeMinutes = ESTIMATION_CONFIG.runtimeMinutes
} = {}) {
  // P = V * I (converted current from mA to A)
  const powerW = nominalVoltageV * (observedCurrentMa / 1000);
  
  // E = P * hours (converted runtime minutes to hours)
  const energyWh = powerW * (runtimeMinutes / 60);
  const energyKwh = energyWh / 1000;

  return {
    powerW,
    energyWh,
    energyKwh,
    runtimeMinutes,
    nominalVoltageV,
    observedCurrentMa,
    mode: "ESTIMATED",
    verified: false
  };
}
