import { Wrench, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function MaintenanceRecommendationPanel({ recommendations = [] }) {
  const getPriorityClass = (prio) => {
    switch (prio) {
      case "URGENT INSPECTION":
        return "prio-urgent";
      case "SCHEDULE INSPECTION":
        return "prio-schedule";
      case "MONITOR":
        return "prio-monitor";
      case "ROUTINE":
      default:
        return "prio-routine";
    }
  };

  const getPriorityIcon = (prio) => {
    switch (prio) {
      case "URGENT INSPECTION":
        return <ShieldAlert className="prio-icon text-critical" size={16} />;
      case "SCHEDULE INSPECTION":
        return <Wrench className="prio-icon text-warning" size={16} />;
      case "MONITOR":
      case "ROUTINE":
      default:
        return <CheckCircle2 className="prio-icon text-normal" size={16} />;
    }
  };

  return (
    <div className="panel maintenance-recommendations-panel">
      <div className="panel-header border-b">
        <div>
          <h2>MAINTENANCE ACTION ITEMS</h2>
          <p>Rule-based decision-support and repair suggestions</p>
        </div>
      </div>

      <div className="recommendations-content">
        {recommendations.length === 0 ? (
          <div className="recommendations-empty">No maintenance recommendations generated.</div>
        ) : (
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-card-row ${getPriorityClass(rec.priority)}`}>
                <div className="card-top-row">
                  <div className="title-left">
                    {getPriorityIcon(rec.priority)}
                    <strong className="title">{rec.title}</strong>
                  </div>
                  <span className="prio-pill">{rec.priority}</span>
                </div>

                <p className="message">{rec.message}</p>

                <div className="evidence-box">
                  <strong>Assessment Evidence: </strong>
                  <span>{rec.evidence}</span>
                </div>

                <div className="card-footer border-t">
                  <div className="footer-left">
                    <span>Subsystem: <strong className="font-semibold">{rec.subsystem}</strong></span>
                    <span className="dot-sep">•</span>
                    <span>Confidence: <strong className="font-semibold">{rec.confidence}</strong></span>
                  </div>
                  <span className="timestamp">
                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
