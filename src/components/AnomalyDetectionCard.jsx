import { AlertCircle, Thermometer, Activity, Zap, Server } from "lucide-react";

export default function AnomalyDetectionCard({ assessment }) {
  const { anomalyScore, tempStatus, vibStatus, elecStatus, connStatus } = assessment;

  // Determine overall anomaly severity state name
  let overallState = "NORMAL";
  let stateClass = "anomaly-normal";

  if (anomalyScore >= 80) {
    overallState = "SEVERE ANOMALY";
    stateClass = "anomaly-severe";
  } else if (anomalyScore >= 60) {
    overallState = "SIGNIFICANT ANOMALY";
    stateClass = "anomaly-significant";
  } else if (anomalyScore >= 30) {
    overallState = "MILD ANOMALY";
    stateClass = "anomaly-mild";
  }

  // Handle case of offline or no data
  if (connStatus === "OFFLINE") {
    overallState = "DEVICE OFFLINE";
    stateClass = "anomaly-severe";
  }

  const getSensorStatusClass = (s) => {
    switch (s) {
      case "NORMAL":
      case "ONLINE":
        return "status-normal";
      case "MILD ANOMALY":
      case "WARNING":
        return "status-warning";
      case "SIGNIFICANT ANOMALY":
      case "SEVERE ANOMALY":
      case "CRITICAL":
      case "OFFLINE":
        return "status-critical";
      case "UNAVAILABLE":
      default:
        return "status-unavailable";
    }
  };

  return (
    <div className="panel anomaly-detection-card">
      <div className="panel-header border-b">
        <div>
          <h2>ANOMALY INTELLIGENCE</h2>
          <p>Real-time statistical variance & outlier mapping</p>
        </div>
        <div className="panel-icon">
          <AlertCircle size={19} />
        </div>
      </div>

      <div className="anomaly-card-content">
        <div className="anomaly-header-box">
          <div className="score-badge">
            <span className="num">{anomalyScore}</span>
            <span className="lbl">/100 Anomaly Score</span>
          </div>

          <div className={`severity-banner ${stateClass}`}>
            <strong>{overallState}</strong>
          </div>
        </div>

        <div className="sensor-anomaly-breakdown">
          <h3>Outlier Verification per Channel</h3>

          <div className="sensor-anomaly-list">
            <div className="anomaly-row-item">
              <div className="row-left">
                <Thermometer size={15} />
                <span>Temperature Anomaly</span>
              </div>
              <span className={`status-pill ${getSensorStatusClass(tempStatus)}`}>
                {tempStatus}
              </span>
            </div>

            <div className="anomaly-row-item">
              <div className="row-left">
                <Activity size={15} />
                <span>Vibration Anomaly</span>
              </div>
              <span className={`status-pill ${getSensorStatusClass(vibStatus)}`}>
                {vibStatus}
              </span>
            </div>

            <div className="anomaly-row-item">
              <div className="row-left">
                <Zap size={15} />
                <span>Electrical Anomaly</span>
              </div>
              <span className={`status-pill ${getSensorStatusClass(elecStatus)}`}>
                {elecStatus}
              </span>
            </div>

            <div className="anomaly-row-item">
              <div className="row-left">
                <Server size={15} />
                <span>Network Node Anomaly</span>
              </div>
              <span className={`status-pill ${getSensorStatusClass(connStatus)}`}>
                {connStatus === "ONLINE" ? "NORMAL" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
