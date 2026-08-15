import { Eye, Info } from "lucide-react";


export default function EnergyInsightPanel({
  insights = [],
  mode = "VALIDATED",
  energyWh = 0.0617,
  formattedDuration = "10m 00s",
  latestCurrent = 74
}) {
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
                Estimated consumption is approximately <strong>{Number(energyWh).toFixed(4)} Wh</strong> for the active {formattedDuration} telemetry runtime.
              </span>
            </div>
            
            <div style={{ backgroundColor: "#1e293b", padding: "12px", borderRadius: "6px", marginTop: "8px" }}>
              <strong style={{ fontSize: "11px", color: "#f59e0b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Why is this estimated?
              </strong>
              <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
                INA219 current telemetry is real and dynamically received from the EcoTwin edge device. The INA219 voltage reading is currently outside the configured 5 V motor supply expectation, so EcoTwin does not treat it as validated voltage. Estimated power therefore uses the nominal 5 V motor supply together with the real INA219 current.
              </p>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px", borderTop: "1px solid #334155", paddingTop: "8px" }}>
                <div><strong>Estimated Power</strong> = 5.0 V &times; latest INA219 current ({latestCurrent !== null ? `${latestCurrent.toFixed(1)} mA` : "-- mA"}) &approx; <strong>{latestCurrent !== null ? `${(5.0 * latestCurrent / 1000).toFixed(3)} W` : "-- W"}</strong></div>
                <div style={{ marginTop: "4px" }}><strong>Estimated Energy</strong> = time-integrated estimated power over active telemetry runtime ({formattedDuration}) &approx; <strong>{Number(energyWh).toFixed(4)} Wh</strong></div>
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
