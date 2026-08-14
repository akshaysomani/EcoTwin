import { Thermometer, Activity, Zap, Server } from "lucide-react";
import { determineMachineState } from "../utils/healthEngine";

export default function MachineHealthCard({ healthData }) {
  const { score, tempStatus, vibStatus, elecStatus, connStatus, isElecUnavailable } = healthData;
  const machineState = determineMachineState(healthData);

  const getStatusColorClass = (status) => {
    switch (status) {
      case "NORMAL":
      case "ONLINE":
      case "HEALTHY":
        return "status-normal";
      case "WARNING":
        return "status-warning";
      case "CRITICAL":
      case "OFFLINE":
        return "status-critical";
      case "UNAVAILABLE":
      default:
        return "status-unavailable";
    }
  };

  const getMachineStateBadge = (state) => {
    switch (state) {
      case "HEALTHY":
        return { text: "HEALTHY", class: "badge-normal" };
      case "WARNING":
        return { text: "WARNING", class: "badge-warning" };
      case "CRITICAL":
        return { text: "CRITICAL", class: "badge-critical" };
      case "OFFLINE":
      default:
        return { text: "OFFLINE", class: "badge-critical" };
    }
  };

  const stateBadge = getMachineStateBadge(machineState);

  return (
    <div className="panel machine-health-card">
      <div className="panel-header">
        <div>
          <h2>MACHINE HEALTH</h2>
          <p>Overall operational readiness index</p>
        </div>
        <span className={`state-badge ${stateBadge.class}`}>{stateBadge.text}</span>
      </div>

      <div className="health-score-container">
        <div className="health-score-ring">
          <div className="health-score-val">{score}%</div>
          <div className="health-score-label">Operational Health</div>
        </div>

        {isElecUnavailable && (
          <div className="elec-notice">
            Electrical telemetry unavailable
          </div>
        )}
      </div>

      <div className="health-breakdown">
        <h3>Sub-System Classification</h3>
        
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="item-left">
              <Thermometer size={16} />
              <span>Temperature</span>
            </div>
            <span className={`status-pill ${getStatusColorClass(tempStatus)}`}>
              {tempStatus}
            </span>
          </div>

          <div className="breakdown-item">
            <div className="item-left">
              <Activity size={16} />
              <span>Vibration</span>
            </div>
            <span className={`status-pill ${getStatusColorClass(vibStatus)}`}>
              {vibStatus}
            </span>
          </div>

          <div className="breakdown-item">
            <div className="item-left">
              <Zap size={16} />
              <span>Electrical</span>
            </div>
            <span className={`status-pill ${getStatusColorClass(elecStatus)}`}>
              {elecStatus}
            </span>
          </div>

          <div className="breakdown-item">
            <div className="item-left">
              <Server size={16} />
              <span>Connectivity</span>
            </div>
            <span className={`status-pill ${getStatusColorClass(connStatus)}`}>
              {connStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
