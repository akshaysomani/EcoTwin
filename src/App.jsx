import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
import { AlertTriangle, Server, Heart, HelpCircle, ChevronRight } from "lucide-react";
import { supabase } from "./supabase";
import "./App.css";

// Health, Trend & Predictive Intelligence Imports
import { calculateOperationalHealth, getActiveAlerts, calculateEquipmentHealthAssessment } from "./utils/healthEngine";
import { calculateTrendSummary } from "./utils/trendEngine";
import { calculatePredictiveAssessment } from "./utils/predictiveEngine";
import { synthesizeDecisionAssessment } from "./utils/decisionEngine";

// Phase 6 Alert Engine & Service Imports
import { generateAlerts } from "./utils/alertEngine";
import { alertService } from "./services/alertService";

// Phase 7 Energy Engine Import
import { energyEngine } from "./utils/energyEngine";
import { ESTIMATION_CONFIG, calculateDynamicEstimatedEnergy, EMISSION_FACTOR_CONFIG } from "./utils/energyEstimate";

// Phase 8 Maintenance Engine Import
import { maintenanceEngine } from "./utils/maintenanceEngine";

// Phase 9 Sustainability Engine Import
import { sustainabilityEngine } from "./utils/sustainabilityEngine";

// Phase 11 Report Engine Import
import { reportEngine } from "./utils/reportEngine";

import DeviceHeader from "./components/DeviceHeader";
import MachineHealthCard from "./components/MachineHealthCard";
import SensorStatusCard from "./components/SensorStatusCard";
import VibrationCard from "./components/VibrationCard";
import AlertsPanel from "./components/AlertsPanel";
import SensorInterpretation from "./components/SensorInterpretation";
import TrendChart from "./components/TrendChart";
import AnalyticsSummary from "./components/AnalyticsSummary";

// Phase 4 Imports
import AnomalyDetectionCard from "./components/AnomalyDetectionCard";
import PredictiveMaintenanceCard from "./components/PredictiveMaintenanceCard";
import MaintenanceRecommendation from "./components/MaintenanceRecommendation";
import PredictiveTrendChart from "./components/PredictiveTrendChart";

// Phase 5 Imports
import AIDecisionPanel from "./components/AIDecisionPanel";
import MachineConditionSummary from "./components/MachineConditionSummary";
import DecisionTimeline from "./components/DecisionTimeline";

// Phase 6 Component Imports
import AlertCenter from "./components/AlertCenter";
import AlertHistory from "./components/AlertHistory";
import MaintenanceActivity from "./components/MaintenanceActivity";
import MaintenanceWorkflowCard from "./components/MaintenanceWorkflowCard";

// Phase 7 Component Imports
import EnergyOverviewCard from "./components/EnergyOverviewCard";
import EnergyTrendChart from "./components/EnergyTrendChart";
import ElectricalQualityCard from "./components/ElectricalQualityCard";
import EnergyInsightPanel from "./components/EnergyInsightPanel";

// Phase 8 Component Imports
import EquipmentHealthCard from "./components/EquipmentHealthCard";
import HealthBreakdownCard from "./components/HealthBreakdownCard";
import MaintenanceRecommendationPanel from "./components/MaintenanceRecommendationPanel";
import MaintenanceTimeline from "./components/MaintenanceTimeline";

// Phase 9 Component Imports
import SustainabilityOverviewCard from "./components/SustainabilityOverviewCard";
import CarbonImpactCard from "./components/CarbonImpactCard";
import SustainabilityTrendChart from "./components/SustainabilityTrendChart";
import ESGDataQualityCard from "./components/ESGDataQualityCard";
import SustainabilityInsightPanel from "./components/SustainabilityInsightPanel";
import ESGSummaryCard from "./components/ESGSummaryCard";

// Phase 11 Component Import
import ReportPreview from "./components/ReportPreview";

// Phase 10 & 11 Lazy Component Imports
const OperationsCopilot = lazy(() => import("./components/OperationsCopilot"));
const ReportCenter = lazy(() => import("./components/ReportCenter"));

const DEVICE_ID = "ECOTWIN-001";
const REFRESH_INTERVAL = 3000;

function formatTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function App() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [rangeLimit, setRangeLimit] = useState(30);

  // Phase 14 Energy Estimation Config State
  const [estimationConfig, setEstimationConfig] = useState(ESTIMATION_CONFIG);

  // Phase 13 Tab routing state
  const [currentTab, setCurrentTab] = useState(() => {
    const hash = window.location.hash;
    if (hash === "#/health") return "health";
    if (hash === "#/energy") return "energy";
    if (hash === "#/sustainability") return "sustainability";
    if (hash === "#/copilot") return "copilot";
    if (hash === "#/reports") return "reports";
    return "overview";
  });

  // Track hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/health") setCurrentTab("health");
      else if (hash === "#/energy") setCurrentTab("energy");
      else if (hash === "#/sustainability") setCurrentTab("sustainability");
      else if (hash === "#/copilot") setCurrentTab("copilot");
      else if (hash === "#/reports") setCurrentTab("reports");
      else setCurrentTab("overview");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (tab) => {
    window.location.hash = `#/${tab}`;
  };

  // Phase 6 Database Alerts State
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);

  // Phase 9 Configuration States
  const [emissionFactorInput, setEmissionFactorInput] = useState(EMISSION_FACTOR_CONFIG.value.toString());
  const [emissionSourceInput, setEmissionSourceInput] = useState(EMISSION_FACTOR_CONFIG.source);

  const loadReadings = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("ecotwin_sensor_readings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .order("created_at", { ascending: false })
      .limit(100);

    if (queryError) {
      console.error("Supabase error:", queryError);
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const fetchedReadings = data || [];
    setReadings(fetchedReadings);
    setLastUpdated(new Date());
    setError(null);
    setLoading(false);

    if (fetchedReadings.length > 0 && fetchedReadings[0].created_at) {
      const age = Date.now() - new Date(fetchedReadings[0].created_at).getTime();
      setDeviceOnline(age < 15000);
    } else {
      setDeviceOnline(false);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const active = await alertService.fetchActiveAlerts();
      const history = await alertService.fetchAlertHistory();
      setActiveAlerts(active);
      setHistoryAlerts(history);
    } catch (err) {
      console.error("Failed to sync alerts from Supabase:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReadings();
      loadAlerts();
    }, 0);

    const interval = setInterval(() => {
      loadReadings();
      loadAlerts();
    }, REFRESH_INTERVAL);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadReadings, loadAlerts]);

  const slicedReadings = useMemo(() => {
    return readings.slice(0, rangeLimit);
  }, [readings, rangeLimit]);

  const latest = readings[0];

  const trendData = useMemo(() => {
    return calculateTrendSummary(slicedReadings, deviceOnline);
  }, [slicedReadings, deviceOnline]);

  const healthData = useMemo(() => {
    return calculateOperationalHealth(latest, deviceOnline);
  }, [latest, deviceOnline]);

  const predictiveData = useMemo(() => {
    const chrono = [...slicedReadings].reverse();
    return calculatePredictiveAssessment(chrono, deviceOnline);
  }, [slicedReadings, deviceOnline]);

  const energyAssessment = useMemo(() => {
    const rawAssessment = energyEngine.calculateEnergyAssessment(slicedReadings);

    if (!rawAssessment.available && estimationConfig.enabled) {
      const estimate = calculateDynamicEstimatedEnergy(slicedReadings, estimationConfig.nominalVoltageV);

      return {
        ...rawAssessment,
        mode: "ESTIMATED",
        available: false,
        estimatedAvailable: true,
        avgVoltage: estimate.nominalVoltageV,
        avgCurrent: estimate.avgCurrentMa !== null && estimate.avgCurrentMa !== undefined ? estimate.avgCurrentMa : null,
        latestCurrent: estimate.latestCurrentMa !== null && estimate.latestCurrentMa !== undefined ? estimate.latestCurrentMa : null,
        avgPower: estimate.currentPowerW,
        maxPower: estimate.currentPowerW,
        energyWh: estimate.cumulativeEnergyWh,
        energyKwh: estimate.cumulativeEnergyKwh,
        durationMs: estimate.durationMs,
        formattedDuration: estimate.formattedDuration,
        runtimeMinutes: estimate.durationMs ? Math.round(estimate.durationMs / 60000) : 0,
        trend: "STABLE",
        insights: [
          "Electrical telemetry is currently not validated. The displayed energy value is an engineering estimate based on nominal 5 V motor voltage and observed INA219 current."
        ]
      };
    } else {
      return {
        ...rawAssessment,
        mode: rawAssessment.available ? "VALIDATED" : "UNAVAILABLE",
        estimatedAvailable: false,
        runtimeMinutes: null
      };
    }
  }, [slicedReadings, estimationConfig]);

  const healthAssessment = useMemo(() => {
    return calculateEquipmentHealthAssessment(slicedReadings, energyAssessment, predictiveData);
  }, [slicedReadings, energyAssessment, predictiveData]);

  const maintenanceRecommendations = useMemo(() => {
    return maintenanceEngine.generateRecommendations(healthAssessment);
  }, [healthAssessment]);

  // Phase 9 Sustainability Assessment
  const sustainabilityAssessment = useMemo(() => {
    const factor = emissionFactorInput ? parseFloat(emissionFactorInput) : null;
    const source = emissionSourceInput || null;
    return sustainabilityEngine.calculateSustainabilityAssessment({
      energyAssessment,
      healthAssessment,
      emissionFactor: factor,
      emissionSource: source
    });
  }, [energyAssessment, healthAssessment, emissionFactorInput, emissionSourceInput]);

  const alertsList = useMemo(() => {
    const active = getActiveAlerts(healthData);
    if (!latest || !deviceOnline) return active;

    const { tempStatus, vibStatus } = healthData;
    const tempTrend = trendData.temp.trend;
    const vibTrend = trendData.vib.trend;

    if (tempStatus === "NORMAL" && tempTrend === "INCREASING") {
      active.push({
        type: "INFO",
        message: "Temperature is currently normal but showing an increasing trend.",
      });
    } else if (tempStatus === "WARNING" && tempTrend === "INCREASING") {
      active.push({
        type: "WARNING",
        message: "Temperature is elevated and continuing to increase.",
      });
    }

    if (vibStatus === "NORMAL" && vibTrend === "INCREASING") {
      active.push({
        type: "INFO",
        message: "Vibration remains within normal limits but is trending upward.",
      });
    } else if (vibStatus === "WARNING" && vibTrend === "INCREASING") {
      active.push({
        type: "WARNING",
        message: "Vibration is elevated and increasing. Monitor mechanical condition.",
      });
    }

    if (predictiveData.maintenanceRisk >= 40 && predictiveData.maintenanceRisk < 80 && !active.some(a => a.type === "WARNING")) {
      active.push({
        type: "INFO",
        message: `Predictive Engine: Elevated maintenance risk detected on ${predictiveData.dominantRisk.toLowerCase()} channel.`,
      });
    }

    return active;
  }, [healthData, trendData, predictiveData, latest, deviceOnline]);

  const decisionAssessment = useMemo(() => {
    const chrono = [...slicedReadings].reverse();
    return synthesizeDecisionAssessment({
      healthData,
      trendData,
      predictiveData,
      latestReading: latest,
      chronoReadings: chrono,
      alerts: alertsList,
    });
  }, [healthData, trendData, predictiveData, latest, slicedReadings, alertsList]);

  const chartData = useMemo(() => {
    return [...slicedReadings]
      .reverse()
      .map((r) => {
        const x = Number(r.accel_x) || 0;
        const y = Number(r.accel_y) || 0;
        const z = Number(r.accel_z) || 0;
        const mag = Math.sqrt(x * x + y * y + z * z);
        const vibDev = Math.abs(mag - 9.81);

        const histHealth = calculateOperationalHealth(r, true);

        return {
          time: formatTime(r.created_at),
          temperature: Number(r.temperature_c) || 0,
          vibration: vibDev,
          voltage: r.ina219_voltage_valid ? Number(r.bus_voltage_v) : null,
          power: r.ina219_voltage_valid ? Number(r.power_mw) : null,
          health: histHealth.score,
        };
      });
  }, [slicedReadings]);

  const energyChartPoints = useMemo(() => {
    const isEstimated = energyAssessment.mode === "ESTIMATED";

    const validSorted = [...slicedReadings]
      .filter((r) => {
        if (isEstimated) {
          const cur = r.current_ma;
          return cur !== null && cur !== undefined && !Number.isNaN(Number(cur)) && Number.isFinite(Number(cur));
        } else {
          return r.ina219_voltage_valid === true && r.sensor_ina219_ok !== false;
        }
      })
      .reverse();

    let currentWh = 0;
    const points = [];
    const factor = emissionFactorInput ? parseFloat(emissionFactorInput) : null;

    for (let i = 0; i < validSorted.length; i++) {
      const curr = validSorted[i];
      const powerW = isEstimated
        ? 5.0 * (Math.max(0, Number(curr.current_ma)) / 1000)
        : (Number(curr.power_mw) || 0) / 1000;

      if (i > 0) {
        const prev = validSorted[i - 1];
        const prevTime = new Date(prev.created_at).getTime();
        const currTime = new Date(curr.created_at).getTime();
        const deltaMs = currTime - prevTime;
        if (deltaMs > 0 && deltaMs < 3600000) {
          const deltaHours = deltaMs / 3600000;
          const prevPowerW = isEstimated
            ? 5.0 * (Math.max(0, Number(prev.current_ma)) / 1000)
            : (Number(prev.power_mw) || 0) / 1000;
          const avgIntervalPowerW = (prevPowerW + powerW) / 2;
          currentWh += avgIntervalPowerW * deltaHours;
        }
      }

      const energyKwh = currentWh / 1000;
      const carbonKg = factor !== null ? energyKwh * factor : null;

      points.push({
        time: formatTime(curr.created_at),
        powerW,
        energyWh: currentWh,
        carbonKg
      });
    }

    return points;
  }, [slicedReadings, emissionFactorInput, energyAssessment.mode]);

  const historicalRiskTrajectory = useMemo(() => {
    return [...slicedReadings]
      .reverse()
      .map((r, index, arr) => {
        const subHistory = arr.slice(0, index + 1);
        const assessment = calculatePredictiveAssessment(subHistory, true);
        return {
          time: formatTime(r.created_at),
          risk: assessment.maintenanceRisk,
        };
      });
  }, [slicedReadings]);

  const timelineEvents = useMemo(() => {
    return readings.slice(0, 5).map((r, idx) => {
      const subHistory = [...readings.slice(idx)].reverse();
      const isOnlineAtTime = idx === 0 ? deviceOnline : true;
      const health = calculateOperationalHealth(r, isOnlineAtTime);
      const assessment = calculatePredictiveAssessment(subHistory, isOnlineAtTime);

      const x = Number(r.accel_x) || 0;
      const y = Number(r.accel_y) || 0;
      const z = Number(r.accel_z) || 0;
      const mag = Math.sqrt(x * x + y * y + z * z);
      const vibDev = Math.abs(mag - 9.81);

      return {
        id: r.id || idx,
        time: formatTime(r.created_at),
        temperature: r.temperature_c,
        tempStatus: health.tempStatus,
        vibration: vibDev,
        vibStatus: health.vibStatus,
        riskScore: assessment.maintenanceRisk,
        riskLevel: assessment.riskLevel,
        isElecUnavailable: r.ina219_voltage_valid !== true,
        voltage: r.ina219_voltage_valid ? r.bus_voltage_v : null,
      };
    });
  }, [readings, deviceOnline]);

  const synchronizeGeneratedAlerts = useCallback(async (
    latestReading,
    currentHealthAssessment,
    trendAssessment,
    predictiveAssessment,
    currentActiveAlerts,
    currentEnergyAssessment
  ) => {
    if (!latestReading || !currentHealthAssessment || !predictiveAssessment || !trendAssessment) return;

    try {
      const candidates = generateAlerts({
        latestReading,
        healthAssessment: currentHealthAssessment,
        trendAssessment,
        predictiveAssessment,
        energyAssessment: currentEnergyAssessment
      });

      const activeKeys = new Set(currentActiveAlerts.map((a) => a.dedupeKey));

      for (const candidate of candidates) {
        if (!activeKeys.has(candidate.dedupeKey)) {
          console.log("Persisting new alert to database:", candidate.dedupeKey);
          await alertService.createAlert(candidate);
        }
      }
    } catch (err) {
      console.error("Alert synchronization calculation failed:", err);
    }
  }, []);

  useEffect(() => {
    if (!latest || loading) return;

    const syncAlerts = async () => {
      await synchronizeGeneratedAlerts(
        latest,
        healthAssessment,
        trendData,
        predictiveData,
        activeAlerts,
        energyAssessment
      );
      await loadAlerts();
    };

    syncAlerts();
  }, [latest, healthAssessment, trendData, predictiveData, activeAlerts, synchronizeGeneratedAlerts, loadAlerts, loading, energyAssessment]);

  const handleAcknowledgeAlert = async (id, alert) => {
    try {
      await alertService.acknowledgeAlert(id, alert);
      await loadAlerts();
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  const handleResolveAlert = async (id, alert) => {
    try {
      await alertService.resolveAlert(id, alert);
      await loadAlerts();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  // Compile report object for printing
  const reportData = useMemo(() => {
    return reportEngine.generateReport({
      telemetry: slicedReadings,
      energyAssessment,
      healthAssessment,
      maintenanceAssessment: maintenanceRecommendations,
      sustainabilityAssessment,
      alerts: activeAlerts
    });
  }, [slicedReadings, energyAssessment, healthAssessment, maintenanceRecommendations, sustainabilityAssessment, activeAlerts]);

  // Executive KPI values
  const healthStatusClass = healthAssessment.status === "HEALTHY" ? "status-healthy" : (healthAssessment.status === "WARNING" ? "status-warning" : "status-critical");
  const currentPowerW = (latest && latest.ina219_voltage_valid && latest.sensor_ina219_ok !== false) ? (Number(latest.power_mw) / 1000).toFixed(4) + " W" : "UNAVAILABLE";
  const accumulatedEnergy = energyAssessment.available ? energyAssessment.energyWh.toFixed(4) + " Wh" : "UNAVAILABLE";

  return (
    <div className="app-shell">
      <DeviceHeader
        deviceId={DEVICE_ID}
        deviceOnline={deviceOnline}
        onRefresh={loadReadings}
        loading={loading}
        activeAlertsCount={activeAlerts.length}
        currentTab={currentTab}
        onNavigate={navigateTo}
      />

      <main className="dashboard">
        <section className="hero no-print">
          <div>
            <div className="eyebrow">
              <Server size={15} />
              ECOTWIN MOTOR DIGITAL TWIN
            </div>
            <h1>Factory Intelligence Dashboard</h1>
            <p>
              Monitor machine conditions, trend intelligence, and active alerts 
              streamed directly from your EcoTwin edge device.
            </p>
          </div>
        </section>

        {error && (
          <div className="error-banner no-print">
            <AlertTriangle size={20} />
            <div>
              <strong>Telemetry query failed</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Global Filter Bar */}
        <section className="dashboard-controls-bar no-print">
          <div className="range-selector-box">
            <span className="selector-lbl">Time Horizon:</span>
            <div className="range-buttons">
              <button
                className={rangeLimit === 10 ? "active" : ""}
                onClick={() => setRangeLimit(10)}
              >
                10 Readings
              </button>
              <button
                className={rangeLimit === 30 ? "active" : ""}
                onClick={() => setRangeLimit(30)}
              >
                30 Readings
              </button>
              <button
                className={rangeLimit === 100 ? "active" : ""}
                onClick={() => setRangeLimit(100)}
              >
                100 Readings
              </button>
            </div>
          </div>

          <div className="data-quality-badge">
            <div className="quality-item">
              <span className="lbl">Records Analyzed:</span>
              <strong className="val">{slicedReadings.length}</strong>
            </div>
            <div className="quality-item">
              <span className="lbl">Completeness:</span>
              <span className={`status-pill ${slicedReadings.length >= 5 ? "status-normal" : "status-warning"}`}>
                {slicedReadings.length >= 5 ? "GOOD" : "LIMITED DATA"}
              </span>
            </div>
            {slicedReadings.length < 5 && (
              <span className="quality-warning">
                * Trend confidence is limited because only {slicedReadings.length} readings are available.
              </span>
            )}
          </div>
        </section>

        {/* Dynamic Tab Views */}
        <div className="tab-contents-container no-print">
          
          {/* TAB 1: OVERVIEW */}
          {currentTab === "overview" && (
            <div className="tab-view-panel">
              {/* Executive KPI Row */}
              <div className="executive-kpi-row">
                <div className="kpi-card">
                  <span className="lbl">Equipment Status</span>
                  <strong className={`val ${healthStatusClass}`}>{healthAssessment.status}</strong>
                </div>
                <div className="kpi-card">
                  <span className="lbl">Temperature</span>
                  <strong className="val">{latest ? latest.temperature_c + " °C" : "UNAVAILABLE"}</strong>
                </div>
                <div className="kpi-card">
                  <span className="lbl">{energyAssessment.mode === "ESTIMATED" ? "Estimated Power" : "Current Power"}</span>
                  <strong className="val">
                    {energyAssessment.mode === "ESTIMATED"
                      ? (energyAssessment.avgPower !== null && energyAssessment.avgPower !== undefined ? `${energyAssessment.avgPower.toFixed(2)} W` : "UNAVAILABLE")
                      : currentPowerW}
                  </strong>
                  {energyAssessment.mode === "ESTIMATED" && (
                    <span className="trend-badge-pill trend-volatile" style={{ fontSize: '9px', display: 'inline-block', marginTop: '4px' }}>
                      ESTIMATED
                    </span>
                  )}
                </div>
                <div className="kpi-card">
                  <span className="lbl">{energyAssessment.mode === "ESTIMATED" ? "Estimated Energy" : "Energy"}</span>
                  <strong className="val">
                    {energyAssessment.mode === "ESTIMATED"
                      ? (energyAssessment.energyWh !== null && energyAssessment.energyWh !== undefined ? `${energyAssessment.energyWh.toFixed(4)} Wh` : "0.0000 Wh")
                      : accumulatedEnergy}
                  </strong>
                  {energyAssessment.mode === "ESTIMATED" && (
                    <span className="trend-badge-pill trend-volatile" style={{ fontSize: '9px', display: 'inline-block', marginTop: '4px' }}>
                      ESTIMATED
                    </span>
                  )}
                </div>
                <div className="kpi-card">
                  <span className="lbl">Active Alerts</span>
                  <strong className="val">{activeAlerts.length} ACTIVE</strong>
                </div>
              </div>

              {/* Core Live Sensor Telemetry */}
              <section className="overview-grid mt-6" style={{ margin: "20px 0" }}>
                <SensorStatusCard
                  type="temperature"
                  reading={latest}
                  status={healthData.tempStatus}
                />
                <SensorStatusCard
                  type="vibration"
                  reading={latest}
                  status={healthData.vibStatus}
                />
                <SensorStatusCard
                  type="electrical"
                  reading={latest}
                  status={healthData.elecStatus}
                />
                <SensorStatusCard
                  type="connectivity"
                  reading={latest}
                  status={healthData.connStatus}
                  isOnline={deviceOnline}
                />
              </section>

              {/* Two-Column Grid Layout */}
              <div className="overview-grid-columns">
                <div className="overview-column">
                  
                  {/* Equipment health sub-panel */}
                  <div className="panel">
                    <div className="panel-header border-b">
                      <div>
                        <h2>Equipment Health Summary</h2>
                        <p>Real-time subsystem telemetry evaluation</p>
                      </div>
                      <Heart size={18} className="text-normal" />
                    </div>
                    <div className="panel-body">
                      <div className="system-info-new">
                        <div className="info-row">
                          <span className="lbl">Overall rating:</span>
                          <span className={`val font-bold ${healthStatusClass}`}>{healthAssessment.overallScore} / 100</span>
                        </div>
                        <div className="info-row">
                          <span className="lbl">Thermal subsystem:</span>
                          <span className="val">{healthAssessment.thermal?.status}</span>
                        </div>
                        <div className="info-row">
                          <span className="lbl">Vibration subsystem:</span>
                          <span className="val">{healthAssessment.vibration?.status}</span>
                        </div>
                        <div className="info-row">
                          <span className="lbl">Electrical subsystem:</span>
                          <span className="val">{healthAssessment.electrical?.status}</span>
                        </div>
                        <div className="info-row">
                          <span className="lbl">Telemetry Confidence:</span>
                          <span className="val">{healthAssessment.confidence}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High priority alert center queue */}
                  <AlertCenter
                    activeAlerts={activeAlerts.slice(0, 3)}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                  />
                </div>

                <div className="overview-column">
                  {/* Recent Evidence Insights */}
                  <div className="panel">
                    <div className="panel-header border-b">
                      <div>
                        <h2>Evidence-Based Insights</h2>
                        <p>Latest observation logs</p>
                      </div>
                      <HelpCircle size={18} className="text-normal" />
                    </div>
                    <div className="panel-body">
                      <div className="overview-insights-list">
                        {healthAssessment.reasons.slice(0, 2).map((r, idx) => (
                          <div key={idx} className="overview-insight-item">
                            <span>{r}</span>
                          </div>
                        ))}
                        {sustainabilityAssessment.insights.slice(0, 2).map((ins, idx) => (
                          <div key={idx} className="overview-insight-item" style={{ borderLeftColor: "#10b981" }}>
                            <span><strong>{ins.title}:</strong> {ins.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Shortcuts panel */}
                  <div className="panel">
                    <div className="panel-header border-b">
                      <div>
                        <h2>Navigation Shortcuts</h2>
                        <p>Jump to specialized dashboard workspaces</p>
                      </div>
                      <ChevronRight size={18} className="text-normal" />
                    </div>
                    <div className="panel-body">
                      <div className="overview-shortcuts-row">
                        <button onClick={() => navigateTo("health")} className="shortcut-btn">
                          <span>View Health Detailed Analytics</span>
                        </button>
                        <button onClick={() => navigateTo("energy")} className="shortcut-btn" style={{ backgroundColor: "#f59e0b" }}>
                          <span>View Energy Performance</span>
                        </button>
                        <button onClick={() => navigateTo("copilot")} className="shortcut-btn" style={{ backgroundColor: "#10b981" }}>
                          <span>Ask AI Operations Copilot</span>
                        </button>
                        <button onClick={() => navigateTo("reports")} className="shortcut-btn" style={{ backgroundColor: "#6366f1" }}>
                          <span>Generate ESG Compliance Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH */}
          {currentTab === "health" && (
            <div className="tab-view-panel">
              <section className="predictive-metrics-grid">
                <EquipmentHealthCard healthAssessment={healthAssessment} />
                <HealthBreakdownCard healthAssessment={healthAssessment} />
              </section>

              <section className="predictive-chart-section mt-6">
                <MaintenanceRecommendationPanel recommendations={maintenanceRecommendations} />
              </section>

              <section className="predictive-chart-section mt-6">
                <MaintenanceTimeline historyAlerts={historyAlerts} />
              </section>

              <section className="predictive-metrics-grid mt-6">
                <AnomalyDetectionCard assessment={predictiveData} />
                <PredictiveMaintenanceCard assessment={predictiveData} trendData={trendData} />
              </section>

              <section className="predictive-chart-section mt-6">
                <MaintenanceRecommendation assessment={predictiveData} trendData={trendData} />
              </section>

              <section className="predictive-chart-section mt-6">
                <PredictiveTrendChart data={historicalRiskTrajectory} />
              </section>

              <section className="predictive-metrics-grid mt-6">
                <MaintenanceWorkflowCard
                  decision={decisionAssessment}
                  activeAlertsCount={activeAlerts.length}
                />
              </section>

              <section className="twin-main-layout mt-6">
                <div className="twin-left-col">
                  <MachineHealthCard healthData={healthData} />
                  <AlertsPanel alerts={alertsList} />
                  <SensorInterpretation reading={latest} healthData={healthData} />
                  <VibrationCard reading={latest} status={healthData.vibStatus} />
                </div>
                <div className="twin-right-col">
                  <AnalyticsSummary trendData={trendData} />
                  <TrendChart
                    title="Operational Health History"
                    subtitle="Calculated machine health rating (0-100%)"
                    data={chartData}
                    dataKey="health"
                    unit="%"
                    color="#10b981"
                  />
                  <TrendChart
                    title="Temperature History"
                    subtitle="DS18B20 ambient logs"
                    data={chartData}
                    dataKey="temperature"
                    unit="°C"
                    color="#ef4444"
                  />
                  <TrendChart
                    title="Vibration Deviation History"
                    subtitle="Computed gravity offset logs"
                    data={chartData}
                    dataKey="vibration"
                    unit="m/s²"
                    color="#8b5cf6"
                  />
                </div>
              </section>

              <section className="predictive-metrics-grid mt-6">
                <AlertHistory historyAlerts={historyAlerts} />
                <MaintenanceActivity historyAlerts={historyAlerts} />
              </section>
            </div>
          )}

          {/* TAB 3: ENERGY */}
          {currentTab === "energy" && (
            <div className="tab-view-panel">
              <section className="predictive-metrics-grid">
                <EnergyOverviewCard assessment={energyAssessment} />
                <ElectricalQualityCard
                  quality={energyAssessment.quality}
                  latestReading={latest}
                  estimationConfig={estimationConfig}
                />
              </section>

              {/* Energy Fallback settings configuration panel */}
              <section className="mt-6 no-print">
                <div className="panel estimation-config-card">
                  <div className="panel-header border-b">
                    <div>
                      <h2>ENERGY FALLBACK SETTINGS</h2>
                      <p>Configure engineering estimation parameters when electrical telemetry is unverified</p>
                    </div>
                  </div>
                  <div className="panel-body mt-4">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="lbl" style={{ margin: 0, fontWeight: 'bold' }}>Estimation Mode:</span>
                        <button
                          className={`shortcut-btn ${estimationConfig.enabled ? 'active' : ''}`}
                          style={{
                            margin: 0,
                            padding: '6px 12px',
                            backgroundColor: estimationConfig.enabled ? '#10b981' : '#475569',
                            color: '#fff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}
                          onClick={() => setEstimationConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                        >
                          {estimationConfig.enabled ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>

                      {estimationConfig.enabled && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="lbl" style={{ margin: 0 }}>Voltage Basis:</span>
                            <strong style={{ fontSize: '14px', color: '#10b981' }}>{estimationConfig.nominalVoltageV.toFixed(1)} V (Nominal)</strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="lbl" style={{ margin: 0 }}>Latest Telemetry Current:</span>
                            <strong style={{ fontSize: '14px', color: '#3b82f6' }}>
                              {energyAssessment.latestCurrent !== null ? `${energyAssessment.latestCurrent.toFixed(1)} mA` : "-- mA"}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="lbl" style={{ margin: 0 }}>Avg Telemetry Current:</span>
                            <strong style={{ fontSize: '14px', color: '#a855f7' }}>
                              {energyAssessment.avgCurrent !== null ? `${energyAssessment.avgCurrent.toFixed(1)} mA` : "-- mA"}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="lbl" style={{ margin: 0 }}>Active Runtime:</span>
                            <strong style={{ fontSize: '14px', color: '#fff' }}>
                              {energyAssessment.formattedDuration || "0s"}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="predictive-chart-section mt-6">
                <EnergyTrendChart
                  data={energyChartPoints}
                  available={energyAssessment.available}
                  mode={energyAssessment.mode}
                  energyWh={energyAssessment.energyWh}
                  runtimeMinutes={energyAssessment.runtimeMinutes}
                  formattedDuration={energyAssessment.formattedDuration}
                  avgPower={energyAssessment.avgPower}
                />
              </section>

              <section className="predictive-chart-section mt-6">
                <EnergyInsightPanel
                  insights={energyAssessment.insights}
                  mode={energyAssessment.mode}
                  runtimeMinutes={energyAssessment.runtimeMinutes}
                  energyWh={energyAssessment.energyWh}
                  formattedDuration={energyAssessment.formattedDuration}
                  latestCurrent={energyAssessment.latestCurrent}
                />
              </section>

              {trendData.elec.status === "AVAILABLE" ? (
                <section className="twin-main-layout mt-6">
                  <div className="twin-left-col" style={{ width: "100%" }}>
                    <TrendChart
                      title="Electrical Voltage History"
                      subtitle="INA219 bus measurements"
                      data={chartData}
                      dataKey="voltage"
                      unit="V"
                      color="#3b82f6"
                    />
                    <TrendChart
                      title="Power History"
                      subtitle="INA219 wattage measurements"
                      data={chartData}
                      dataKey="power"
                      unit="mW"
                      color="#f59e0b"
                    />
                  </div>
                </section>
              ) : (
                <div className="panel chart-disabled-panel mt-6">
                  <div className="panel-header">
                    <h3>Electrical Trends Disabled</h3>
                    <p>Electrical telemetry is unavailable. Historical charts cannot be built.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUSTAINABILITY */}
          {currentTab === "sustainability" && (
            <div className="tab-view-panel">
              <section className="predictive-metrics-grid">
                <SustainabilityOverviewCard assessment={sustainabilityAssessment} />
                <CarbonImpactCard
                  assessment={sustainabilityAssessment}
                  emissionFactorInput={emissionFactorInput}
                  onFactorChange={setEmissionFactorInput}
                  emissionSourceInput={emissionSourceInput}
                  onSourceChange={setEmissionSourceInput}
                />
                <ESGDataQualityCard assessment={sustainabilityAssessment} />
              </section>

              <section className="predictive-metrics-grid mt-6">
                <ESGSummaryCard assessment={sustainabilityAssessment} />
                <SustainabilityInsightPanel insights={sustainabilityAssessment.insights} />
              </section>

              <section className="predictive-chart-section mt-6">
                <SustainabilityTrendChart
                  data={energyChartPoints}
                  available={energyAssessment.available}
                  emissionFactorAvailable={sustainabilityAssessment.dataQuality.emissionFactorAvailable}
                />
              </section>
            </div>
          )}

          {/* TAB 5: AI COPILOT */}
          {currentTab === "copilot" && (
            <div className="tab-view-panel">
              <section className="predictive-metrics-grid">
                <AIDecisionPanel decision={decisionAssessment} />
                <MachineConditionSummary decision={decisionAssessment} />
              </section>

              <section className="predictive-chart-section mt-6">
                <DecisionTimeline timelineEvents={timelineEvents} />
              </section>

              <div className="mt-6">
                <Suspense fallback={<div className="panel">Loading AI Operations Copilot...</div>}>
                  <OperationsCopilot
                    telemetry={slicedReadings}
                    energyAssessment={energyAssessment}
                    healthAssessment={healthAssessment}
                    maintenanceAssessment={maintenanceRecommendations}
                    sustainabilityAssessment={sustainabilityAssessment}
                    alerts={activeAlerts}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {currentTab === "reports" && (
            <div className="tab-view-panel">
              <Suspense fallback={<div className="panel">Loading ESG Reporting Center...</div>}>
                <ReportCenter
                  telemetry={slicedReadings}
                  energyAssessment={energyAssessment}
                  healthAssessment={healthAssessment}
                  maintenanceAssessment={maintenanceRecommendations}
                  sustainabilityAssessment={sustainabilityAssessment}
                  alerts={activeAlerts}
                />
              </Suspense>
            </div>
          )}

        </div>

        {/* Dedicated print-safe report container always present in DOM */}
        <div className="print-report no-screen">
          <ReportPreview report={reportData} />
        </div>

        <footer className="dashboard-footer mt-12 no-print">
          <span>EcoTwin Industrial Digital Twin Platform</span>
          <span>
            {loading
              ? "Synchronizing telemetry..."
              : `Last sync: ${formatTime(lastUpdated)}`}
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;