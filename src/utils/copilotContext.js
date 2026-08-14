/**
 * EcoTwin Operations Copilot Context Builder
 * Assembles a structured, minimal state context payload from dashboard analytical engines.
 */

export function buildCopilotContext({
  telemetry = [],
  energyAssessment = null,
  healthAssessment = null,
  maintenanceAssessment = null,
  sustainabilityAssessment = null,
  alerts = []
}) {
  const latest = telemetry.length > 0 ? telemetry[0] : null;

  return {
    device: {
      deviceId: "ECOTWIN-001"
    },
    telemetry: latest ? {
      temperature: latest.temperature_c,
      mpuTemperature: latest.mpu_temperature_c,
      accelX: latest.accel_x,
      accelY: latest.accel_y,
      accelZ: latest.accel_z,
      gyroX: latest.gyro_x,
      gyroY: latest.gyro_y,
      gyroZ: latest.gyro_z,
      voltage: latest.bus_voltage_v,
      current: latest.current_ma,
      power: latest.power_mw,
      ina219Valid: latest.ina219_voltage_valid
    } : null,
    energy: energyAssessment ? {
      totalWh: energyAssessment.energyWh,
      totalKwh: energyAssessment.energyKwh,
      avgPower: energyAssessment.avgPower,
      peakPower: energyAssessment.maxPower,
      trend: energyAssessment.trend,
      stability: energyAssessment.powerStability,
      coverage: energyAssessment.quality.coverage,
      available: energyAssessment.available
    } : null,
    health: healthAssessment ? {
      status: healthAssessment.status,
      score: healthAssessment.overallScore,
      confidence: healthAssessment.confidence,
      reasons: healthAssessment.reasons,
      sufficiency: healthAssessment.dataSufficiency
    } : null,
    maintenance: maintenanceAssessment ? {
      recommendations: maintenanceAssessment
    } : null,
    sustainability: sustainabilityAssessment ? {
      energy: sustainabilityAssessment.energy,
      carbon: sustainabilityAssessment.carbon,
      dataQuality: sustainabilityAssessment.dataQuality
    } : null,
    alerts: {
      activeCount: alerts.length,
      list: alerts.map((a) => ({
        type: a.alertType,
        severity: a.severity,
        title: a.title,
        message: a.message,
        source: a.source
      }))
    },
    timestamp: new Date().toISOString()
  };
}
