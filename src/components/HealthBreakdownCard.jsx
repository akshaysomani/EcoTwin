import { Thermometer, Activity, Zap, BarChart2, Shield } from "lucide-react";

export default function HealthBreakdownCard({ healthAssessment }) {
  const { thermal, vibration, electrical, energy, status } = healthAssessment;

  const getSubsystemStatusClass = (s) => {
    switch (s) {
      case "CRITICAL":
      case "INVALID":
        return "badge-critical";
      case "WARNING":
      case "MONITOR":
      case "HIGH_LOAD":
      case "UNSTABLE":
        return "badge-warning";
      case "NORMAL":
      case "NORMAL_RANGE":
      case "GOOD":
      case "STABLE":
        return "badge-normal";
      case "DATA_UNAVAILABLE":
      default:
        return "badge-info";
    }
  };

  const formatVal = (v, dec = 2, unit = "") => {
    if (v === null || v === undefined) return "--";
    return `${Number(v).toFixed(dec)} ${unit}`;
  };

  if (status === "INSUFFICIENT_DATA") {
    return (
      <div className="panel health-breakdown-card border-dashed">
        <div className="panel-header border-b">
          <div>
            <h2>SUB-SYSTEM BREAKDOWN</h2>
            <p>Component-level telemetry health logs</p>
          </div>
        </div>
        <div className="breakdown-empty-state">
          <Shield size={32} className="text-info" />
          <p>Subsystem breakdown is unavailable. Connect hardware to populate baselines.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel health-breakdown-card">
      <div className="panel-header border-b">
        <div>
          <h2>SUB-SYSTEM BREAKDOWN</h2>
          <p>Component-level telemetry health logs</p>
        </div>
      </div>

      <div className="breakdown-grid">
        {/* Thermal Breakdown */}
        <div className="breakdown-row border-b">
          <div className="row-left">
            <Thermometer size={16} className="text-info" />
            <div className="sub-details">
              <strong className="name">Thermal Subsystem</strong>
              <span className="meta">
                Avg: {formatVal(thermal.avg, 1, "°C")} | Peak: {formatVal(thermal.peak, 1, "°C")}
              </span>
            </div>
          </div>
          <div className="row-right">
            <span className="trend-lbl">Trend: {thermal.trend}</span>
            <span className={`status-badge-mini ${getSubsystemStatusClass(thermal.status)}`}>
              {thermal.status}
            </span>
          </div>
        </div>

        {/* Vibration Breakdown */}
        <div className="breakdown-row border-b">
          <div className="row-left">
            <Activity size={16} className="text-info" />
            <div className="sub-details">
              <strong className="name">Mechanical Vibration</strong>
              <span className="meta">
                Dev: {formatVal(vibration.current, 2, "m/s²")} | Peak: {formatVal(vibration.peak, 2, "m/s²")}
              </span>
            </div>
          </div>
          <div className="row-right">
            <span className="trend-lbl">Trend: {vibration.trend}</span>
            <span className={`status-badge-mini ${getSubsystemStatusClass(vibration.status)}`}>
              {vibration.status}
            </span>
          </div>
        </div>

        {/* Electrical Breakdown */}
        <div className="breakdown-row border-b">
          <div className="row-left">
            <Zap size={16} className="text-info" />
            <div className="sub-details">
              <strong className="name">Electrical Loading</strong>
              <span className="meta">
                {electrical.status === "DATA_UNAVAILABLE" 
                  ? "Telemetry Unavailable" 
                  : `${formatVal(electrical.voltage, 2, "V")} | ${formatVal(electrical.power, 3, "W")}`}
              </span>
            </div>
          </div>
          <div className="row-right">
            <span className={`status-badge-mini ${getSubsystemStatusClass(electrical.status)}`}>
              {electrical.status}
            </span>
          </div>
        </div>

        {/* Energy Integration Breakdown */}
        <div className="breakdown-row">
          <div className="row-left">
            <BarChart2 size={16} className="text-info" />
            <div className="sub-details">
              <strong className="name">Energy Integration</strong>
              <span className="meta">
                Stability: {energy.stability !== null ? `${energy.stability}%` : "--"} | Wh: {formatVal(energy.Wh, 4)}
              </span>
            </div>
          </div>
          <div className="row-right">
            <span className="trend-lbl">Coverage: {energy.coverage}%</span>
            <span className={`status-badge-mini ${getSubsystemStatusClass(energy.status)}`}>
              {energy.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
