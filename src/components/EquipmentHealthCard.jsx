import { ShieldCheck, ShieldAlert, Shield, Heart } from "lucide-react";

export default function EquipmentHealthCard({ healthAssessment }) {
  const { overallScore, status, confidence, dataSufficiency, reasons } = healthAssessment;

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case "HEALTHY":
        return "status-normal";
      case "DEGRADED":
        return "status-warning";
      case "MONITOR":
        return "status-warning";
      case "CRITICAL":
        return "status-critical";
      case "INSUFFICIENT_DATA":
      default:
        return "status-neutral";
    }
  };

  const getConfidenceClass = (c) => {
    switch (c) {
      case "HIGH":
        return "text-normal font-bold";
      case "MEDIUM":
        return "text-warning font-semibold";
      case "LOW":
      default:
        return "text-critical font-semibold";
    }
  };

  if (status === "INSUFFICIENT_DATA") {
    return (
      <div className="panel equipment-health-card border-warning-heavy">
        <div className="panel-header border-b">
          <div>
            <h2>EQUIPMENT HEALTH</h2>
            <p>RULE-BASED EQUIPMENT HEALTH ASSESSMENT</p>
          </div>
          <Heart size={19} className="text-warning" />
        </div>

        <div className="health-insufficient-state">
          <Shield size={36} className="text-warning" />
          <h3>INSUFFICIENT DATA FOR HEALTH ASSESSMENT</h3>
          <p>Additional validated telemetry is required to configure baseline thresholds.</p>
          <div className="sufficiency-checklist">
            <div className="check-row">
              <span className={`bullet ${dataSufficiency.minimumRecordsMet ? "checked" : "pending"}`} />
              <span>Min Records Met: {dataSufficiency.minimumRecordsMet ? "YES" : "NO (Awaiting 5 Readings)"}</span>
            </div>
            <div className="check-row">
              <span className={`bullet ${dataSufficiency.temperatureAvailable ? "checked" : "pending"}`} />
              <span>Thermal Sensor (DS18B20): {dataSufficiency.temperatureAvailable ? "OK" : "NO TELEMETRY"}</span>
            </div>
            <div className="check-row">
              <span className={`bullet ${dataSufficiency.vibrationAvailable ? "checked" : "pending"}`} />
              <span>Vibration Sensor (MPU6050): {dataSufficiency.vibrationAvailable ? "OK" : "NO TELEMETRY"}</span>
            </div>
            <div className="check-row">
              <span className={`bullet ${dataSufficiency.electricalAvailable ? "checked" : "pending"}`} />
              <span>Electrical Sensor (INA219): {dataSufficiency.electricalAvailable ? "OK" : "NO TELEMETRY"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel equipment-health-card">
      <div className="panel-header border-b">
        <div>
          <h2>EQUIPMENT HEALTH</h2>
          <p>RULE-BASED EQUIPMENT HEALTH ASSESSMENT</p>
        </div>
        <Heart size={19} className="text-normal" />
      </div>

      <div className="health-card-body">
        <div className="health-score-showcase">
          <div className="score-ring">
            <span className="score-num">{overallScore}</span>
            <span className="score-denom">/ 100</span>
          </div>

          <div className="status-badge-container">
            <span className={`status-pill ${getStatusBadgeClass(status)}`}>
              {status === "CRITICAL" ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
              {status}
            </span>
            <div className="confidence-label">
              Confidence: <span className={getConfidenceClass(confidence)}>{confidence}</span>
            </div>
          </div>
        </div>

        <div className="health-justifications border-t">
          <h3>Assessment Justifications</h3>
          <ul className="reasons-list">
            {reasons.map((reason, idx) => (
              <li key={idx} className="reason-item">
                <span className="bullet-indicator" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
