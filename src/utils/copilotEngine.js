/**
 * EcoTwin Operations Copilot Intelligence Engine
 * Deterministic intent classifier and context retriever providing evidence-grounded responses.
 */

export const copilotEngine = {
  generateCopilotResponse(context, question) {
    if (!question || !context) {
      return {
        intent: "UNKNOWN",
        answer: "I am unable to process empty queries or empty context. Please ask an operational question.",
        evidence: [],
        recommendations: [],
        confidence: "INSUFFICIENT",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const q = question.toLowerCase().trim();
    let intent = "UNKNOWN";

    // Intent Classification
    if (q.includes("health") || q.includes("status") || q.includes("condition") || q.includes("operating") || q.includes("machine")) {
      intent = "EQUIPMENT_STATUS";
    } else if (q.includes("energy") || q.includes("wh") || q.includes("kwh") || q.includes("consumption") || q.includes("electricity")) {
      intent = "ENERGY";
    } else if (q.includes("power") || q.includes("voltage") || q.includes("current") || q.includes("draw") || q.includes("volt") || q.includes("amp") || q.includes("ina219") || q.includes("electrical")) {
      intent = "ELECTRICAL";
    } else if (q.includes("vibration") || q.includes("accel") || q.includes("gyro") || q.includes("mpu6050") || q.includes("shaking") || q.includes("bearing")) {
      intent = "VIBRATION";
    } else if (q.includes("temp") || q.includes("temperature") || q.includes("heat") || q.includes("ds18b20") || q.includes("hot") || q.includes("cooling")) {
      intent = "TEMPERATURE";
    } else if (q.includes("maintenance") || q.includes("inspect") || q.includes("repair") || q.includes("action") || q.includes("what should i do")) {
      intent = "MAINTENANCE";
    } else if (q.includes("sustainability") || q.includes("carbon") || q.includes("co2") || q.includes("emission") || q.includes("esg") || q.includes("saving") || q.includes("avoid")) {
      intent = "SUSTAINABILITY";
    } else if (q.includes("alert") || q.includes("warning") || q.includes("critical") || q.includes("alarm") || q.includes("active")) {
      intent = "ALERTS";
    } else if (q.includes("quality") || q.includes("coverage") || q.includes("missing") || q.includes("telemetry") || q.includes("records") || q.includes("valid")) {
      intent = "DATA_QUALITY";
    } else if (q.includes("hello") || q.includes("hi") || q.includes("help") || q.includes("who are you") || q.includes("what can you do")) {
      intent = "GENERAL";
    }

    // Response Generation Router
    switch (intent) {
      case "EQUIPMENT_STATUS":
        return this.handleEquipmentStatus(context);
      case "ENERGY":
        return this.handleEnergy(context);
      case "ELECTRICAL":
        return this.handleElectrical(context);
      case "VIBRATION":
        return this.handleVibration(context);
      case "TEMPERATURE":
        return this.handleTemperature(context);
      case "MAINTENANCE":
        return this.handleMaintenance(context);
      case "SUSTAINABILITY":
        return this.handleSustainability(context);
      case "ALERTS":
        return this.handleAlerts(context);
      case "DATA_QUALITY":
        return this.handleDataQuality(context);
      case "GENERAL":
        return this.handleGeneral(context);
      case "UNKNOWN":
      default:
        return this.handleUnknown(context, question);
    }
  },

  handleEquipmentStatus(ctx) {
    if (!ctx.health || ctx.health.status === "INSUFFICIENT_DATA") {
      return {
        intent: "EQUIPMENT_STATUS",
        answer: "Equipment health status is currently INSUFFICIENT_DATA. Fused analytics require at least 5 telemetry records.",
        evidence: [
          { source: "HEALTH ENGINE", metric: "Minimum Records", value: ctx.health?.sufficiency?.minimumRecordsMet ? "YES" : "NO", unit: "", interpretation: "Baseline calibration requires more records." }
        ],
        recommendations: ["Collect additional edge telemetry readings."],
        confidence: "INSUFFICIENT",
        dataAvailability: "INSUFFICIENT",
        timestamp: new Date().toISOString()
      };
    }

    const { status, score, confidence, reasons } = ctx.health;
    const answer = `Equipment health is currently classified as ${status} with a fused operating rating of ${score}/100.`;
    const evidence = reasons.map((r) => ({
      source: "HEALTH ENGINE",
      metric: "Condition Factor",
      value: status,
      unit: "",
      interpretation: r
    }));

    const recommendations = ctx.maintenance?.recommendations?.map((r) => r.title) || ["No immediate actions required."];

    return {
      intent: "EQUIPMENT_STATUS",
      answer,
      evidence,
      recommendations,
      confidence,
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleEnergy(ctx) {
    if (ctx.energy && ctx.energy.mode === "ESTIMATED") {
      const totalWh = ctx.energy.totalWh || 0.0617;
      const totalKwh = ctx.energy.totalKwh || 0.0000617;
      const avgPower = ctx.energy.avgPower || 0.37;
      const answer = `Validated electrical telemetry is currently unavailable. The displayed energy value is an engineering estimate of approximately ${totalWh.toFixed(4)} Wh (${totalKwh.toFixed(7)} kWh) for the configured runtime, based on a nominal 5 V supply and observed current of approximately 74 mA (estimated power: ${avgPower.toFixed(2)} W).`;
      return {
        intent: "ENERGY",
        answer,
        evidence: [
          { source: "ENERGY ESTIMATOR", metric: "Estimated Energy Wh", value: totalWh.toFixed(4), unit: "Wh", interpretation: "Engineering estimate based on configured runtime." },
          { source: "ENERGY ESTIMATOR", metric: "Estimated Power", value: avgPower.toFixed(2), unit: "W", interpretation: "Nominal 5 V * observed 74 mA current." },
          { source: "ENERGY ESTIMATOR", metric: "Validation Status", value: "UNVERIFIED", unit: "", interpretation: "Physical voltage readings are unverified." }
        ],
        recommendations: [
          "Verify the physical motor supply voltage with a multimeter to enable validated measurement mode.",
          "Check if the INA219 sensor is operating normally."
        ],
        confidence: "MEDIUM",
        dataAvailability: "ESTIMATED",
        timestamp: new Date().toISOString()
      };
    }

    if (!ctx.energy || !ctx.energy.available) {
      return {
        intent: "ENERGY",
        answer: "Calculated energy metrics are unavailable. Review electrical connection status.",
        evidence: [
          { source: "ENERGY ENGINE", metric: "Active Energy", value: "UNAVAILABLE", unit: "", interpretation: "No valid electrical telemetry could be integrated." }
        ],
        recommendations: ["Check INA219 telemetry validation flags."],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const { totalWh, totalKwh, avgPower, trend, coverage } = ctx.energy;
    const answer = `Accumulated energy consumption is ${totalWh.toFixed(4)} Wh (${totalKwh.toFixed(6)} kWh) with an average power draw of ${(avgPower || 0).toFixed(1)} mW during the current window.`;

    const evidence = [
      { source: "ENERGY ENGINE", metric: "Total Wh", value: totalWh.toFixed(4), unit: "Wh", interpretation: "Trapezoidal interval integration of active power." },
      { source: "ENERGY ENGINE", metric: "Average Power", value: (avgPower || 0).toFixed(1), unit: "mW", interpretation: "Average raw telemetry draw." },
      { source: "ENERGY ENGINE", metric: "Trend", value: trend, unit: "", interpretation: `Energy trajectory is ${trend.toLowerCase()}.` }
    ];

    return {
      intent: "ENERGY",
      answer,
      evidence,
      recommendations: trend === "INCREASING" ? ["Investigate machine load variations."] : ["Nominal operating consumption."],
      confidence: coverage >= 80 ? "HIGH" : "MEDIUM",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleElectrical(ctx) {
    if (!ctx.telemetry) {
      return {
        intent: "ELECTRICAL",
        answer: "No telemetry data exists in the current dashboard context.",
        evidence: [],
        recommendations: [],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const { voltage, current, power, ina219Valid } = ctx.telemetry;

    if (ina219Valid !== true) {
      const v = Number(voltage) || 0;
      if (ctx.energy && ctx.energy.mode === "ESTIMATED") {
        return {
          intent: "ELECTRICAL",
          answer: `Validated electrical telemetry is currently unavailable because the INA219 is reporting an unverified voltage of ${v.toFixed(2)} V (exceeding the safety threshold for a 5 V motor). However, energy estimation is active using a nominal 5 V supply and observed average current of approximately 74 mA, giving an estimated power of 0.37 W.`,
          evidence: [
            { source: "LIVE TELEMETRY", metric: "Measured Voltage", value: v.toFixed(2), unit: "V", interpretation: "Unverified voltage readings." },
            { source: "ENERGY ESTIMATOR", metric: "Nominal Voltage", value: "5.0", unit: "V", interpretation: "Using nominal motor supply for estimation." },
            { source: "ENERGY ESTIMATOR", metric: "Observed Current", value: "74", unit: "mA", interpretation: "Observed average current draw." }
          ],
          recommendations: ["Perform independent multimeter verification on the motor supply.", "Ensure the INA219 sensor has a shared ground with the ESP32 and motor driver."],
          confidence: "MEDIUM",
          dataAvailability: "ESTIMATED",
          timestamp: new Date().toISOString()
        };
      }
      if (v > 6.0) {
        return {
          intent: "ELECTRICAL",
          answer: `Electrical data is invalid. The INA219 is reporting a voltage of ${v.toFixed(2)} V, which exceeds the configured safety operating limits of the 5 V motor.`,
          evidence: [
            { source: "LIVE TELEMETRY", metric: "Measured Voltage", value: v.toFixed(2), unit: "V", interpretation: "Overvoltage condition detected." },
            { source: "LIVE TELEMETRY", metric: "Validation Flag", value: "FALSE", unit: "", interpretation: "Telemetry rejected as invalid." }
          ],
          recommendations: ["Check motor power supply regulators immediately.", "Inspect INA219 physical divider lines."],
          confidence: "HIGH",
          dataAvailability: "INVALID",
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          intent: "ELECTRICAL",
          answer: "Electrical telemetry is unavailable. The INA219 valid flag is currently false, indicating sensor offline or invalid configurations.",
          evidence: [
            { source: "LIVE TELEMETRY", metric: "Validation Flag", value: "FALSE", unit: "", interpretation: "Telemetry invalid." }
          ],
          recommendations: ["Verify INA219 wire connections and edge configurations."],
          confidence: "HIGH",
          dataAvailability: "UNAVAILABLE",
          timestamp: new Date().toISOString()
        };
      }
    }

    const voltVal = Number(voltage) || 0;
    const currVal = Number(current) || 0;
    const pwrVal = (Number(power) || 0) / 1000;

    const answer = `Electrical parameters are normal. The motor is operating at ${voltVal.toFixed(2)} V, drawing ${currVal.toFixed(1)} mA with active consumption of ${pwrVal.toFixed(3)} W.`;

    const evidence = [
      { source: "LIVE TELEMETRY", metric: "Voltage", value: voltVal.toFixed(2), unit: "V", interpretation: "Bus operating voltage." },
      { source: "LIVE TELEMETRY", metric: "Current", value: currVal.toFixed(1), unit: "mA", interpretation: "Active motor draw." },
      { source: "LIVE TELEMETRY", metric: "Power", value: pwrVal.toFixed(3), unit: "W", interpretation: "Calculated active power load." }
    ];

    return {
      intent: "ELECTRICAL",
      answer,
      evidence,
      recommendations: pwrVal > 3.0 ? ["Audit motor loadings."] : ["Operating within nominal electrical load."],
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleVibration(ctx) {
    if (!ctx.telemetry || !ctx.health || !ctx.health.sufficiency?.vibrationAvailable) {
      return {
        intent: "VIBRATION",
        answer: "Mechanical vibration telemetry from the MPU6050 sensor is unavailable.",
        evidence: [],
        recommendations: ["Verify MPU6050 edge wiring connections."],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const { accelX, accelY, accelZ } = ctx.telemetry;
    const x = Number(accelX) || 0;
    const y = Number(accelY) || 0;
    const z = Number(accelZ) || 0;
    const mag = Math.sqrt(x * x + y * y + z * z);
    const dev = Math.abs(mag - 9.81);

    const isVibCritical = dev > 3.0;
    const isVibMonitor = dev > 1.0;
    let status = "NORMAL";
    if (isVibCritical) status = "CRITICAL";
    else if (isVibMonitor) status = "MONITOR";

    const answer = `MPU6050 vibration deviation is currently ${dev.toFixed(2)} m/s² (Total mag: ${mag.toFixed(2)} m/s²), indicating a ${status} vibration state. Gravity offsets have been filtered.`;

    const evidence = [
      { source: "LIVE TELEMETRY", metric: "Vibration Deviation", value: dev.toFixed(2), unit: "m/s²", interpretation: `Dynamic gravity deviation is ${status.toLowerCase()}.` }
    ];

    const recommendations = isVibCritical 
      ? ["Audit motor mounting brackets.", "Check shaft alignments and couplings."]
      : isVibMonitor 
      ? ["Schedule bearings audits during upcoming down cycles."]
      : ["System vibration is within safe operating ranges."];

    return {
      intent: "VIBRATION",
      answer,
      evidence,
      recommendations,
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleTemperature(ctx) {
    if (!ctx.telemetry || !ctx.health || !ctx.health.sufficiency?.temperatureAvailable) {
      return {
        intent: "TEMPERATURE",
        answer: "Thermal telemetry from the DS18B20 ambient sensor is unavailable.",
        evidence: [],
        recommendations: ["Verify DS18B20 edge sensor connection."],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const temp = Number(ctx.telemetry.temperature);
    const mpuTemp = Number(ctx.telemetry.mpuTemperature);

    const isTempCritical = temp > 60;
    const isTempMonitor = temp > 40;
    let status = "NORMAL";
    if (isTempCritical) status = "CRITICAL";
    else if (isTempMonitor) status = "MONITOR";

    const answer = `DS18B20 ambient temperature is ${temp.toFixed(1)}°C with MPU6050 internal temperature at ${mpuTemp.toFixed(1)}°C. The thermal state is ${status}.`;

    const evidence = [
      { source: "LIVE TELEMETRY", metric: "Ambient Temp", value: temp.toFixed(1), unit: "°C", interpretation: `Thermal reading is ${status.toLowerCase()}.` },
      { source: "LIVE TELEMETRY", metric: "MPU Internal Temp", value: mpuTemp.toFixed(1), unit: "°C", interpretation: "Sensor microchip core temperature." }
    ];

    const recommendations = isTempCritical 
      ? ["Stop operations and inspect ventilation.", "Verify cooling fans and active dissipation."]
      : isTempMonitor
      ? ["Monitor thermal build-ups under current loading."]
      : ["Operational temperature is stable."];

    return {
      intent: "TEMPERATURE",
      answer,
      evidence,
      recommendations,
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleMaintenance(ctx) {
    if (!ctx.maintenance || !ctx.maintenance.recommendations || ctx.maintenance.recommendations.length === 0) {
      return {
        intent: "MAINTENANCE",
        answer: "No maintenance action items have been registered by the rule-based decision engines.",
        evidence: [],
        recommendations: [],
        confidence: "HIGH",
        dataAvailability: "AVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const recs = ctx.maintenance.recommendations;
    const answer = `The maintenance diagnostics engine advises ${recs.length} operator actions. Major priority item: "${recs[0].title}".`;

    const evidence = recs.map((r) => ({
      source: "MAINTENANCE ENGINE",
      metric: r.priority,
      value: r.subsystem,
      unit: "",
      interpretation: `${r.message} Evidence: ${r.evidence}`
    }));

    return {
      intent: "MAINTENANCE",
      answer,
      evidence,
      recommendations: recs.map((r) => r.message),
      confidence: ctx.health?.confidence || "MEDIUM",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleSustainability(ctx) {
    if (!ctx.sustainability) {
      return {
        intent: "SUSTAINABILITY",
        answer: "Sustainability metrics are currently unavailable.",
        evidence: [],
        recommendations: [],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const { energy, carbon } = ctx.sustainability;

    if (!energy.coverage) {
      return {
        intent: "SUSTAINABILITY",
        answer: "ESG metrics are disabled due to missing telemetry coverage.",
        evidence: [],
        recommendations: ["Check INA219 edge nodes."],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    if (carbon.emissions === null) {
      return {
        intent: "SUSTAINABILITY",
        answer: `Integrated energy draw is ${energy.totalKwh.toFixed(6)} kWh, but carbon emissions cannot be calculated because no grid emission factor is configured.`,
        evidence: [
          { source: "SUSTAINABILITY ENGINE", metric: "Grid Emission Factor", value: "NOT CONFIGURED", unit: "", interpretation: "Input a factor (kgCO2e/kWh) to start tracking." }
        ],
        recommendations: ["Configure grid emission factor coefficients in the parameters section."],
        confidence: "HIGH",
        dataAvailability: "LIMITED",
        timestamp: new Date().toISOString()
      };
    }

    const answer = `ESG status is good. Total energy integrated is ${energy.totalWh.toFixed(4)} Wh, yielding a calculated carbon footprint of ${carbon.emissions.toFixed(6)} kgCO₂e.`;

    const evidence = [
      { source: "SUSTAINABILITY ENGINE", metric: "Energy Draw", value: energy.totalKwh.toFixed(6), unit: "kWh", interpretation: "Calculated Wh totals." },
      { source: "SUSTAINABILITY ENGINE", metric: "Carbon emissions", value: carbon.emissions.toFixed(6), unit: "kgCO2e", interpretation: "Grid calculated footprints." },
      { source: "SUSTAINABILITY ENGINE", metric: "Emission Factor", value: Number(carbon.emissionFactor).toFixed(4), unit: "kg/kWh", interpretation: `Source: ${carbon.emissionSource || "Custom"}` }
    ];

    return {
      intent: "SUSTAINABILITY",
      answer,
      evidence,
      recommendations: ["Nominal ESG metrics tracking."],
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleAlerts(ctx) {
    const list = ctx.alerts?.list || [];

    if (list.length === 0) {
      return {
        intent: "ALERTS",
        answer: "There are currently no active warnings or critical alerts in the Supabase deduplication queue.",
        evidence: [],
        recommendations: ["System operating normally."],
        confidence: "HIGH",
        dataAvailability: "AVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const answer = `There are ${list.length} active alarms triggered in the alerts manager.`;

    const evidence = list.map((a) => ({
      source: "ALERT ENGINE",
      metric: a.severity,
      value: a.type,
      unit: "",
      interpretation: `${a.title}: ${a.message}`
    }));

    return {
      intent: "ALERTS",
      answer,
      evidence,
      recommendations: list.map((a) => `Address alert: ${a.title}`),
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleDataQuality(ctx) {
    if (!ctx.sustainability?.dataQuality) {
      return {
        intent: "DATA_QUALITY",
        answer: "Data quality analysis is currently unavailable.",
        evidence: [],
        recommendations: [],
        confidence: "LOW",
        dataAvailability: "UNAVAILABLE",
        timestamp: new Date().toISOString()
      };
    }

    const { totalRecords, validRecords, coverage, state } = ctx.sustainability.dataQuality;
    const answer = `ESG data quality is rated ${state}. Valid electrical records comprise ${validRecords}/${totalRecords} readings, yielding a coverage ratio of ${coverage}%.`;

    const evidence = [
      { source: "SUSTAINABILITY ENGINE", metric: "Total Records", value: totalRecords, unit: "", interpretation: "Record count in memory." },
      { source: "SUSTAINABILITY ENGINE", metric: "Electrical Coverage", value: `${coverage}%`, unit: "", interpretation: "Telemetry completeness ratio." }
    ];

    return {
      intent: "DATA_QUALITY",
      answer,
      evidence,
      recommendations: coverage < 80 ? ["Verify WiFi connectivity and MQTT bridge buffers."] : ["Nominal telemetry transmission."],
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleGeneral() {
    return {
      intent: "GENERAL",
      answer: "I am the EcoTwin Operations Copilot. Ask me about ambient temperatures, mechanical vibration, electrical draws, carbon configuration factors, active warnings, or diagnostics.",
      evidence: [],
      recommendations: ["Ask an equipment question above."],
      confidence: "HIGH",
      dataAvailability: "AVAILABLE",
      timestamp: new Date().toISOString()
    };
  },

  handleUnknown(ctx, question) {
    return {
      intent: "UNKNOWN",
      answer: `I am unable to answer "${question}" using the available telemetry. The EcoTwin Operations Copilot is strictly grounded in the physical measurements and calculated indicators of the digital twin.`,
      evidence: [],
      recommendations: ["Try asking: 'What is the equipment status?' or 'What maintenance is recommended?'"],
      confidence: "LOW",
      dataAvailability: "UNAVAILABLE",
      timestamp: new Date().toISOString()
    };
  }
};
