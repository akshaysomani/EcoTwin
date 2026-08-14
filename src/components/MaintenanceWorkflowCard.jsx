import { PlayCircle, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

export default function MaintenanceWorkflowCard({ decision, activeAlertsCount }) {
  const { priority, primaryRisk, recommendation, confidence } = decision;

  // Determine state label
  const getWorkflowState = (prio) => {
    switch (prio) {
      case "URGENT INSPECTION":
        return "URGENT INSPECTION REQUIRED";
      case "SCHEDULE INSPECTION":
        return "INSPECTION RECOMMENDED";
      case "MONITOR":
        return "MONITOR PERFORMANCE";
      case "ROUTINE":
      default:
        return "NO ACTION REQUIRED";
    }
  };

  const getWorkflowStateClass = (prio) => {
    switch (prio) {
      case "URGENT INSPECTION":
        return "workflow-urgent";
      case "SCHEDULE INSPECTION":
        return "workflow-recommended";
      case "MONITOR":
        return "workflow-monitor";
      case "ROUTINE":
      default:
        return "workflow-routine";
    }
  };

  return (
    <div className="panel maintenance-workflow-card">
      <div className="panel-header border-b">
        <div>
          <h2>MAINTENANCE WORKFLOW STATUS</h2>
          <p>Rule-based decision-support and repair pipeline</p>
        </div>
        <div className="panel-icon">
          <PlayCircle size={19} className="text-info" />
        </div>
      </div>

      <div className="workflow-card-content">
        <div className={`workflow-state-banner ${getWorkflowStateClass(priority)}`}>
          <span className="lbl">Current Target Vector</span>
          <strong className="val">{getWorkflowState(priority)}</strong>
        </div>

        <div className="workflow-details-grid">
          <div className="detail-col">
            <span className="lbl">Primary Stressor</span>
            <strong className="val">{primaryRisk === "None" ? "No Active Risk" : primaryRisk}</strong>
          </div>

          <div className="detail-col">
            <span className="lbl">Confidence Rating</span>
            <strong className="val">{confidence}</strong>
          </div>
        </div>

        <div className="workflow-recommendation">
          <strong>Action Plan: </strong>
          <span>{recommendation}</span>
        </div>

        {/* Visual Workflow Steps (Detection -> Decision -> Action -> Resolution) */}
        <div className="workflow-steps-progress">
          <div className="step-item step-completed">
            <CheckCircle2 size={14} className="step-icon" />
            <span className="step-lbl">Detection</span>
          </div>

          <ChevronRight size={12} className="step-arrow" />

          <div className="step-item step-completed">
            <CheckCircle2 size={14} className="step-icon" />
            <span className="step-lbl">Decision</span>
          </div>

          <ChevronRight size={12} className="step-arrow" />

          <div className={`step-item ${activeAlertsCount > 0 ? "step-active" : "step-completed"}`}>
            {activeAlertsCount > 0 ? (
              <span className="step-number-badge">!</span>
            ) : (
              <CheckCircle2 size={14} className="step-icon" />
            )}
            <span className="step-lbl">Action</span>
          </div>

          <ChevronRight size={12} className="step-arrow" />

          <div className={`step-item ${activeAlertsCount > 0 ? "step-pending" : "step-completed"}`}>
            {activeAlertsCount > 0 ? (
              <HelpCircle size={14} className="step-icon-pending" />
            ) : (
              <CheckCircle2 size={14} className="step-icon" />
            )}
            <span className="step-lbl">Resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
