import { Clock } from "lucide-react";

export default function DecisionTimeline({ timelineEvents }) {
  if (!timelineEvents || timelineEvents.length === 0) {
    return (
      <div className="panel decision-timeline-panel">
        <div className="panel-header border-b">
          <h2>DECISION TIMELINE</h2>
          <p>Chronological record of recent machine condition states</p>
        </div>
        <div className="timeline-empty">No recent cycles logged.</div>
      </div>
    );
  }

  const getRiskColorClass = (level) => {
    switch (level) {
      case "LOW":
        return "status-normal";
      case "MODERATE":
      case "ELEVATED":
        return "status-warning";
      case "HIGH":
      case "CRITICAL":
      default:
        return "status-critical";
    }
  };

  return (
    <div className="panel decision-timeline-panel">
      <div className="panel-header border-b">
        <div>
          <h2>DECISION TIMELINE</h2>
          <p>Chronological record of recent machine condition states</p>
        </div>
        <div className="panel-icon">
          <Clock size={19} />
        </div>
      </div>

      <div className="timeline-content">
        <div className="timeline-list">
          {timelineEvents.map((event, idx) => (
            <div key={event.id || idx} className="timeline-item">
              <div className="timeline-marker">
                <span className={`marker-dot ${getRiskColorClass(event.riskLevel)}`} />
                {idx < timelineEvents.length - 1 && <span className="marker-line" />}
              </div>

              <div className="timeline-body">
                <div className="timeline-time-row">
                  <strong className="time">{event.time}</strong>
                  <span className={`risk-tag ${getRiskColorClass(event.riskLevel)}`}>
                    {event.riskScore}% RISK ({event.riskLevel})
                  </span>
                </div>

                <div className="timeline-metrics-summary">
                  <div className="metric-tag">
                    <span className="lbl">Temp:</span>
                    <strong className="val">
                      {event.temperature !== null && event.temperature !== undefined ? `${event.temperature}°C` : "UNAVAILABLE"} ({event.tempStatus})
                    </strong>
                  </div>
                  
                  <div className="metric-tag">
                    <span className="lbl">Vib:</span>
                    <strong className="val">
                      Dev {typeof event.vibration === 'number' && Number.isFinite(event.vibration) ? event.vibration.toFixed(2) : "--"} m/s² ({event.vibStatus})
                    </strong>
                  </div>

                  <div className="metric-tag">
                    <span className="lbl">Elec:</span>
                    <strong className="val">
                      {event.isElecUnavailable || event.voltage === null || event.voltage === undefined ? "UNAVAILABLE" : `${event.voltage} V`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
