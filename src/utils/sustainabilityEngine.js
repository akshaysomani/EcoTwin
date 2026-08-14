/**
 * EcoTwin Sustainability Intelligence & ESG Analytics Engine
 * Evaluates valid energy assessments to estimate operational CO2 and ESG metrics.
 */

export const sustainabilityEngine = {
  calculateSustainabilityAssessment({
    energyAssessment,
    healthAssessment,
    emissionFactor = null,
    emissionSource = null
  }) {
    // 1. Data Quality Model
    const totalRecords = energyAssessment ? energyAssessment.quality.totalRecords : 0;
    const validRecords = energyAssessment ? energyAssessment.quality.validRecords : 0;
    const coverage = energyAssessment ? energyAssessment.quality.coverage : 0;

    const dataQuality = {
      totalRecords,
      validRecords,
      coverage,
      energyAvailable: energyAssessment ? energyAssessment.available : false,
      emissionFactorAvailable: emissionFactor !== null && emissionFactor !== undefined && !Number.isNaN(Number(emissionFactor)),
      state: energyAssessment ? energyAssessment.quality.state : "UNAVAILABLE"
    };

    // Calculate carbon emissions if energy is available and emission factor exists
    let carbonEmissions = null;
    if (energyAssessment && energyAssessment.available && dataQuality.emissionFactorAvailable) {
      carbonEmissions = energyAssessment.energyKwh * Number(emissionFactor);
    }

    // 2. Efficiency & Intensity Denominator check
    const efficiency = {
      available: false,
      value: null,
      reason: "No validated useful-output metric is currently available."
    };

    const intensity = {
      available: false,
      value: null,
      reason: "No validated production-output denominator is configured."
    };

    // 3. Carbon Avoidance/Savings ( baseline-dependent )
    const carbonSavings = {
      available: false,
      value: null,
      reason: "No validated baseline is configured."
    };

    // 4. Trend Analysis
    const trend = energyAssessment ? energyAssessment.trend : "UNAVAILABLE";

    // 5. Categorical status
    let status = "UNAVAILABLE";
    if (energyAssessment && energyAssessment.available) {
      if (healthAssessment && healthAssessment.status === "CRITICAL") {
        status = "MONITOR";
      } else if (coverage >= 80) {
        status = "GOOD";
      } else {
        status = "LIMITED";
      }
    }

    // 6. Rule-Based Insights
    const insights = [];
    if (energyAssessment && energyAssessment.available) {
      insights.push({
        severity: "INFO",
        title: "Energy Telemetry Available",
        message: "Energy consumption data is available and active for the selected window.",
        evidence: `Calculated draw: ${energyAssessment.energyWh.toFixed(4)} Wh`,
        source: "CALCULATED"
      });
      
      if (trend === "INCREASING") {
        insights.push({
          severity: "WARNING",
          title: "Energy Trend Increasing",
          message: "Power consumption shows a persistent upward trend. Monitor mechanical condition.",
          evidence: "Slope regression line exceeds +1.5% limit.",
          source: "CALCULATED"
        });
      }

      if (energyAssessment.powerStability < 70) {
        insights.push({
          severity: "WARNING",
          title: "High Electrical Volatility",
          message: "Low stability score detected. Equipment is operating under inconsistent loading profiles.",
          evidence: `Stability index is ${energyAssessment.powerStability}/100.`,
          source: "CALCULATED"
        });
      }
    }

    if (!dataQuality.emissionFactorAvailable) {
      insights.push({
        severity: "INFO",
        title: "Carbon Calculation Offline",
        message: "Carbon emissions calculations are disabled. Configure a localized grid emission factor to activate.",
        evidence: "Electricity emission factor = null",
        source: "CONFIGURED"
      });
    } else {
      insights.push({
        severity: "INFO",
        title: "Carbon Tracking Active",
        message: "Real-time carbon emissions estimate is computed using the active emission factor.",
        evidence: `Factor: ${Number(emissionFactor).toFixed(4)} kgCO2e/kWh`,
        source: "CALCULATED"
      });
    }

    if (healthAssessment && healthAssessment.status !== "HEALTHY") {
      insights.push({
        severity: "WARNING",
        title: "Equipment Health Advisory",
        message: "Equipment health indicates increased monitoring requirements which may affect energy performance.",
        evidence: `Fused health score: ${healthAssessment.overallScore}/100 (${healthAssessment.status})`,
        source: "healthEngine"
      });
    }

    return {
      status,
      dataQuality,
      energy: {
        totalWh: energyAssessment ? energyAssessment.energyWh : 0,
        totalKwh: energyAssessment ? energyAssessment.energyKwh : 0,
        avgPower: energyAssessment ? energyAssessment.avgPower : null,
        maxPower: energyAssessment ? energyAssessment.maxPower : null,
        stability: energyAssessment ? energyAssessment.powerStability : null,
        trend,
        coverage
      },
      efficiency,
      intensity,
      carbon: {
        emissions: carbonEmissions,
        emissionFactor,
        emissionSource,
        savings: carbonSavings
      },
      insights
    };
  }
};
