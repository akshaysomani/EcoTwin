import { BrainCircuit } from "lucide-react";

export default function AIDecisionPanel({ decision }) {
  const {
    machineCondition,
    recommendation,
    priority,
    confidence,
    explanation,
    reasons
  } = decision;

  const getConditionColorClass = (cond) => {
    switch (cond) {
      case "HEALTHY":
        return "cond-healthy";
      case "MONITOR":
        return "cond-monitor";
      case "WARNING":
        return "cond-warning";
      case "CRITICAL":
      case "OFFLINE":
      default:
        return "cond-critical";
    }
  };

  const getPriorityColorClass = (prio) => {
    switch (prio) {
      case "ROUTINE":
        return "prio-routine";
      case "MONITOR":
        return "prio-monitor";
      case "SCHEDULE INSPECTION":
        return "prio-schedule";
      case "URGENT INSPECTION":
      default:
        return "prio-urgent";
    }
  };

  const getConfidenceColorClass = (conf) => {
    switch (conf) {
      case "HIGH":
      case "GOOD":
        return "status-normal";
      case "MODERATE":
        return "status-warning";
      case "LOW":
      default:
        return "status-critical";
    }
  };

  return (
    <div className="panel ai-decision-panel">
      <div className="panel-header border-b">
        <div>
          <h2>AI DECISION SUPPORT</h2>
          <p>RULE-BASED DECISION ANALYSIS</p>
        </div>
        <div className="panel-icon">
          <BrainCircuit size={19} className="text-vib" />
        </div>
      </div>

      <div className="decision-panel-content">
        <div className="decision-header-badges">
          <div className="badge-item">
            <span className="b-lbl">Machine Condition</span>
            <strong className={`b-val cond-badge ${getConditionColorClass(machineCondition)}`}>
              {machineCondition}
            </strong>
          </div>

          <div className="badge-item">
            <span className="b-lbl">Assessment Confidence</span>
            <strong className={`b-val confidence-badge ${getConfidenceColorClass(confidence)}`}>
              {confidence}
            </strong>
          </div>
        </div>

        <div className="observation-block">
          <h3>Primary Observation</h3>
          <p className="obs-text">{explanation}</p>
        </div>

        <div className="action-priority-split">
          <div className="split-col">
            <span className="lbl">Recommended Action</span>
            <strong className="val">{recommendation}</strong>
          </div>
          <div className="split-col">
            <span className="lbl">Action Priority</span>
            <strong className={`priority-pill ${getPriorityColorClass(priority)}`}>
              {priority}
            </strong>
          </div>
        </div>

        <div className="decision-why-section">
          <h3>Why this decision?</h3>
          <ul className="why-bullets-list">
            {reasons.map((reason, idx) => (
              <li key={idx}>
                <span className="bullet-node" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
