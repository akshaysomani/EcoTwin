import { AlertCircle, Info, ShieldAlert } from "lucide-react";

export default function SustainabilityInsightPanel({ insights = [] }) {
  const getSeverityIcon = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return <ShieldAlert className="insight-icon text-critical" size={16} />;
      case "WARNING":
        return <AlertCircle className="insight-icon text-warning" size={16} />;
      case "INFO":
      default:
        return <Info className="insight-icon text-info" size={16} />;
    }
  };

  return (
    <div className="panel sustainability-insight-panel">
      <div className="panel-header border-b">
        <div>
          <h2>SUSTAINABILITY OBSERVER</h2>
          <p>Explainable energy, carbon footprint, and grid loading insights</p>
        </div>
      </div>

      <div className="insights-content">
        {insights.length === 0 ? (
          <div className="insights-empty">No sustainability insights registered.</div>
        ) : (
          <ul className="insights-list-ul">
            {insights.map((ins, idx) => (
              <li key={idx} className="insight-item-li border-b">
                {getSeverityIcon(ins.severity)}
                <div className="insight-text">
                  <strong className="title">{ins.title}</strong>
                  <p className="message">{ins.message}</p>
                  <div className="evidence-badge-row">
                    <span className="evidence">Evidence: <strong className="font-semibold">{ins.evidence}</strong></span>
                    <span className="dot-sep">•</span>
                    <span className="source">Source: <strong className="font-semibold">{ins.source}</strong></span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
