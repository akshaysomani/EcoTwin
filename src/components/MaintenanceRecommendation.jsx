import { Wrench } from "lucide-react";

export default function MaintenanceRecommendation({ assessment, trendData }) {
  const { maintenanceRisk, riskLevel, recommendation, tempStatus, vibStatus, elecStatus, explanation } = assessment;

  // Determine priority classification
  let priority = "ROUTINE";
  let priorityClass = "priority-routine";

  if (maintenanceRisk >= 80 || riskLevel === "CRITICAL") {
    priority = "URGENT INSPECTION";
    priorityClass = "priority-urgent";
  } else if (maintenanceRisk >= 40) {
    priority = "SCHEDULE INSPECTION";
    priorityClass = "priority-schedule";
  } else if (maintenanceRisk >= 20) {
    priority = "MONITOR";
    priorityClass = "priority-monitor";
  }

  // Get descriptive trend state
  const tempTrend = trendData?.temp?.trend || "STABLE";
  const vibTrend = trendData?.vib?.trend || "STABLE";

  return (
    <div className="panel maintenance-recommendations-panel">
      <div className="panel-header border-b">
        <div>
          <h2>RECOMMENDED ACTION</h2>
          <p>Rule-based corrective maintenance workflow</p>
        </div>
        <div className="panel-icon">
          <Wrench size={19} />
        </div>
      </div>

      <div className="recommendation-content">
        <div className="rec-hero-block">
          <div className="rec-action-text">
            <strong>Action Target:</strong>
            <p>{recommendation}</p>
          </div>

          <div className={`priority-badge-box ${priorityClass}`}>
            <span className="p-lbl">RECOMMENDED PRIORITY</span>
            <strong className="p-val">{priority}</strong>
          </div>
        </div>

        <div className="reasoning-split">
          <div className="reasoning-block">
            <h3>Diagnostic Reasoning Matrix</h3>
            
            <ul className="reasoning-list">
              <li>
                <span className="dot-bullet" />
                <span><strong>Thermal Condition:</strong> Temperature is {tempStatus.toLowerCase()} (Trend: {tempTrend.toLowerCase()}).</span>
              </li>
              <li>
                <span className="dot-bullet" />
                <span><strong>Mechanical Strain:</strong> Vibration deviation is {vibStatus.toLowerCase()} (Trend: {vibTrend.toLowerCase()}).</span>
              </li>
              <li>
                <span className="dot-bullet" />
                <span><strong>Electrical Condition:</strong> Power monitoring is {elecStatus.toLowerCase()}.</span>
              </li>
              <li>
                <span className="dot-bullet" />
                <span><strong>Operational Context:</strong> {explanation}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
