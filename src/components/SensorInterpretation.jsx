import { Terminal, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { getInterpretationMessages, determineMachineState } from "../utils/healthEngine";

export default function SensorInterpretation({ reading, healthData }) {
  const messages = getInterpretationMessages(reading, healthData);
  const state = determineMachineState(healthData);

  const getSystemStatusHeader = () => {
    switch (state) {
      case "CRITICAL":
        return { text: "Anomaly Detected", color: "text-critical" };
      case "WARNING":
        return { text: "Maintenance Warning", color: "text-warning" };
      case "OFFLINE":
        return { text: "Connection Fault", color: "text-critical" };
      case "HEALTHY":
      default:
        return { text: "All Systems Operational", color: "text-normal" };
    }
  };

  const statusHeader = getSystemStatusHeader();

  return (
    <div className="panel interpretation-panel">
      <div className="panel-header">
        <div>
          <h2>WHAT THE SENSORS SAY</h2>
          <p>Deterministic diagnostic reasoning engine</p>
        </div>
        <div className="panel-icon">
          <Terminal size={19} />
        </div>
      </div>

      <div className="interpretation-content">
        <div className={`status-summary-header ${statusHeader.color}`}>
          <strong>System Status: {statusHeader.text}</strong>
        </div>

        <div className="messages-list">
          {messages.map((msg, index) => {
            let Icon = CheckCircle2;
            let rowClass = "msg-normal";

            if (msg.includes("elevated") || msg.includes("unavailable") || msg.includes("Elevated")) {
              Icon = AlertTriangle;
              rowClass = "msg-warning";
            }
            if (msg.includes("Critical") || msg.includes("No recent telemetry") || msg.includes("shutdown")) {
              Icon = AlertCircle;
              rowClass = "msg-critical";
            }

            return (
              <div className={`message-row ${rowClass}`} key={index}>
                <Icon size={16} className="msg-icon" />
                <span className="msg-text">{msg}</span>
              </div>
            );
          })}
        </div>
        
        <div className="engine-disclaimer">
          * Diagnostic determinations are produced by the local rules engine; these are not AI predictions.
        </div>
      </div>
    </div>
  );
}
