import { Eye, Info } from "lucide-react";

export default function EnergyInsightPanel({ insights = [] }) {
  return (
    <div className="panel energy-insight-panel">
      <div className="panel-header border-b">
        <div>
          <h2>RULE-BASED ENERGY ANALYSIS</h2>
          <p>Explainable operational efficiency observations and findings</p>
        </div>
        <div className="panel-icon">
          <Eye size={19} className="text-info" />
        </div>
      </div>

      <div className="insights-content">
        {insights.length === 0 ? (
          <div className="insights-empty">No insights available. Ensure telemetry feed is active.</div>
        ) : (
          <ul className="insights-list-ul">
            {insights.map((insight, idx) => (
              <li key={idx} className="insight-item-li">
                <Info size={14} className="text-info flex-shrink-0 mt-0.5" />
                <span className="insight-text">{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
