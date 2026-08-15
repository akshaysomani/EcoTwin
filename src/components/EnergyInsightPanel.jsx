import { Eye, Info } from "lucide-react";


export default function EnergyInsightPanel({ insights = [], mode = "VALIDATED", runtimeMinutes = 10, energyWh = 0.0617 }) {
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
        {mode === "ESTIMATED" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="insight-item-li" style={{ borderLeft: "3px solid #f59e0b", paddingLeft: "10px" }}>
              <Info size={14} className="text-warning flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
              <span className="insight-text" style={{ fontWeight: "700", color: "#f59e0b" }}>
                Electrical telemetry is currently not validated. The displayed energy value is an engineering estimate based on nominal 5 V motor voltage and observed INA219 current.
              </span>
            </div>
            <div className="insight-item-li" style={{ borderLeft: "3px solid #f59e0b", paddingLeft: "10px" }}>
              <Info size={14} className="text-warning flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
              <span className="insight-text">
                Estimated consumption is approximately <strong>{Number(energyWh).toFixed(4)} Wh</strong> for the configured {runtimeMinutes}-minute runtime.
              </span>
            </div>
            
            <div style={{ backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px", marginTop: "8px" }}>
              <strong style={{ fontSize: "11px", color: "#f59e0b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Why Estimated?
              </strong>
              <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
                The INA219 is communicating correctly, but its measured bus voltage is currently inconsistent with the configured 5 V motor supply. Therefore EcoTwin does not treat the electrical telemetry as validated. For demonstration purposes, estimated power uses the nominal 5 V motor voltage and the observed average current of approximately 74 mA.
              </p>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", borderTop: "1px solid #334155", paddingTop: "6px" }}>
                Formula: <strong>5 V &times; 0.074 A &approx; 0.37 W</strong><br />
                For {runtimeMinutes} minutes: <strong>0.37 W &times; ({runtimeMinutes}/60) h &approx; {Number(energyWh).toFixed(4)} Wh</strong>
              </div>
            </div>
          </div>
        ) : insights.length === 0 ? (
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
