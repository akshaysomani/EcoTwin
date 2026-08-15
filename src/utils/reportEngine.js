/**
 * EcoTwin Automated ESG & Sustainability Report Engine
 * Aggregates in-memory analytics into structured, export-ready ESG report payloads.
 */

export const reportEngine = {
  generateReport({
    telemetry = [],
    energyAssessment = null,
    healthAssessment = null,
    maintenanceAssessment = null,
    sustainabilityAssessment = null,
    alerts = []
  }) {
    const total = telemetry.length;
    const oldestRecord = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
    const latestRecord = telemetry.length > 0 ? telemetry[0] : null;

    // 1. Reporting Period metadata
    const reportingPeriod = {
      recordCount: total,
      oldestTimestamp: oldestRecord ? oldestRecord.created_at : null,
      latestTimestamp: latestRecord ? latestRecord.created_at : null
    };

    // 2. Report Status Classification
    let status = "COMPLETE";
    if (total < 5) {
      status = "INSUFFICIENT_DATA";
    } else if (
      !energyAssessment ||
      !energyAssessment.available ||
      !sustainabilityAssessment ||
      sustainabilityAssessment.carbon.emissions === null
    ) {
      status = "LIMITED";
    }

    // 3. Metadata
    const reportMetadata = {
      title: "EcoTwin Automated Sustainability & ESG Report",
      deviceId: "ECOTWIN-001",
      generationTimestamp: new Date().toISOString(),
      status
    };

    // 4. Energy Section
    const energy = energyAssessment ? {
      totalWh: energyAssessment.energyWh,
      totalKwh: energyAssessment.energyKwh,
      avgPowerMw: energyAssessment.avgPower,
      peakPowerMw: energyAssessment.maxPower,
      trend: energyAssessment.trend,
      stability: energyAssessment.powerStability,
      coverage: energyAssessment.quality.coverage,
      status: energyAssessment.mode === "ESTIMATED" ? "ESTIMATED" : (energyAssessment.available ? "AVAILABLE" : "UNAVAILABLE"),
      mode: energyAssessment.mode || "UNAVAILABLE"
    } : {
      totalWh: 0,
      totalKwh: 0,
      avgPowerMw: null,
      peakPowerMw: null,
      trend: "UNAVAILABLE",
      stability: null,
      coverage: 0,
      status: "UNAVAILABLE",
      mode: "UNAVAILABLE"
    };

    // 5. Electrical Section
    const validCount = energyAssessment ? energyAssessment.quality.validRecords : 0;
    const invalidCount = energyAssessment ? energyAssessment.quality.invalidRecords : 0;
    let electricalStatus = "NORMAL";
    
    if (latestRecord) {
      if (latestRecord.ina219_voltage_valid === false) {
        electricalStatus = Number(latestRecord.bus_voltage_v) > 6.0 ? "INVALID" : "UNAVAILABLE";
      }
    } else {
      electricalStatus = "UNAVAILABLE";
    }

    const electrical = {
      status: electricalStatus,
      validRecords: validCount,
      invalidRecords: invalidCount,
      coverage: energy.coverage,
      voltage: latestRecord ? latestRecord.bus_voltage_v : null,
      current: latestRecord ? latestRecord.current_ma : null,
      power: latestRecord ? latestRecord.power_mw : null
    };

    // 6. Health Section
    const health = healthAssessment ? {
      status: healthAssessment.status,
      score: healthAssessment.overallScore,
      confidence: healthAssessment.confidence,
      thermalStatus: healthAssessment.thermal?.status || "DATA_UNAVAILABLE",
      vibrationStatus: healthAssessment.vibration?.status || "DATA_UNAVAILABLE",
      electricalStatus: healthAssessment.electrical?.status || "DATA_UNAVAILABLE",
      energyStatus: healthAssessment.energy?.status || "DATA_UNAVAILABLE",
      reasons: healthAssessment.reasons
    } : {
      status: "UNAVAILABLE",
      score: null,
      confidence: "LOW",
      thermalStatus: "DATA_UNAVAILABLE",
      vibrationStatus: "DATA_UNAVAILABLE",
      electricalStatus: "DATA_UNAVAILABLE",
      energyStatus: "DATA_UNAVAILABLE",
      reasons: ["No active health assessment context."]
    };

    // 7. Maintenance Section
    const maintenance = {
      recommendations: maintenanceAssessment || [],
      status: (maintenanceAssessment && maintenanceAssessment.length > 0) ? "ACTION_REQUIRED" : "NOMINAL"
    };

    // 8. Sustainability Section
    const sustainability = sustainabilityAssessment ? {
      energyTrend: sustainabilityAssessment.energy.trend,
      carbonStatus: sustainabilityAssessment.carbon.emissions !== null ? "AVAILABLE" : "NOT CONFIGURED",
      emissionFactor: sustainabilityAssessment.carbon.emissionFactor,
      emissionSource: sustainabilityAssessment.carbon.emissionSource,
      emissionsKg: sustainabilityAssessment.carbon.emissions,
      efficiencyStatus: sustainabilityAssessment.efficiency.available ? "AVAILABLE" : "NOT AVAILABLE",
      efficiencyReason: sustainabilityAssessment.efficiency.reason,
      intensityStatus: sustainabilityAssessment.intensity.available ? "AVAILABLE" : "NOT AVAILABLE",
      intensityReason: sustainabilityAssessment.intensity.reason,
      savingsStatus: sustainabilityAssessment.carbon.savings.available ? "AVAILABLE" : "NOT AVAILABLE",
      savingsReason: sustainabilityAssessment.carbon.savings.reason,
      insights: sustainabilityAssessment.insights
    } : {
      energyTrend: "UNAVAILABLE",
      carbonStatus: "NOT CONFIGURED",
      emissionFactor: null,
      emissionSource: null,
      emissionsKg: null,
      efficiencyStatus: "NOT AVAILABLE",
      efficiencyReason: "No active sustainability assessment context.",
      intensityStatus: "NOT AVAILABLE",
      intensityReason: "No active sustainability assessment context.",
      savingsStatus: "NOT AVAILABLE",
      savingsReason: "No active sustainability assessment context.",
      insights: []
    };

    // 9. Methodology Expose
    const methodology = [
      { section: "Energy", text: "Calculated from validated INA219 power telemetry using chronological trapezoidal integration." },
      { section: "Carbon", text: "Calculated by multiplying accumulated kWh energy consumption by the configured electricity grid emission factor." },
      { section: "Efficiency & Intensity", text: "Calculated only when a validated production output denominator is available. Currently disabled." },
      { section: "Data Quality", text: "Determined as the ratio of valid INA219 electrical readings to total telemetry records." }
    ];

    // 10. Data Limitations Builder
    const limitations = [];
    if (total < 5) {
      limitations.push("Insufficient telemetry observations to establish statistical baseline limits.");
    }
    if (electricalStatus === "INVALID" || invalidCount > 0) {
      limitations.push("Electrical telemetry contains invalid records due to voltage validation limits (>6 V motor protection trigger).");
    }
    if (energy.coverage < 80) {
      limitations.push("Electrical telemetry coverage falls below the 80% baseline threshold due to offline edge nodes.");
    }
    if (sustainability.carbonStatus === "NOT CONFIGURED") {
      limitations.push("Carbon footprint estimation is disabled because no grid electricity emission factor is configured.");
    }
    if (sustainability.efficiencyStatus === "NOT AVAILABLE") {
      limitations.push("Energy efficiency and operational intensity calculations are disabled because no production-output denominator exists.");
    }
    if (energyAssessment && energyAssessment.mode === "ESTIMATED") {
      limitations.push("Energy metrics are estimated (nominal 5 V supply, average 74 mA current, " + (energyAssessment.runtimeMinutes || 10) + " min runtime). Not independently verified.");
    }

    return {
      reportMetadata,
      reportingPeriod,
      energy,
      electrical,
      health,
      maintenance,
      sustainability,
      alerts: {
        activeCount: alerts.length,
        list: alerts.map((a) => ({
          type: a.alertType,
          severity: a.severity,
          title: a.title,
          message: a.message
        }))
      },
      methodology,
      limitations
    };
  }
};
