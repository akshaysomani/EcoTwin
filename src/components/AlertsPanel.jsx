import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export default function AlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="panel alerts-panel">
      <div className="panel-header">
        <div>
          <h2>Active Alerts</h2>
          <p>Conditions requiring immediate attention</p>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map((alert, index) => {
          const isCritical = alert.type === "CRITICAL";
          const isWarning = alert.type === "WARNING";
          const isInfo = alert.type === "INFO";

          let alertClass = "";
          let Icon = AlertTriangle;

          if (isCritical) {
            alertClass = "alert-critical";
            Icon = AlertCircle;
          } else if (isWarning) {
            alertClass = "alert-warning";
            Icon = AlertTriangle;
          } else if (isInfo) {
            alertClass = "alert-info";
            Icon = Info;
          }

          return (
            <div className={`alert-row ${alertClass}`} key={index}>
              <div className="alert-icon-wrapper">
                <Icon size={18} />
              </div>
              <div className="alert-content">
                <span className="alert-badge">{alert.type}</span>
                <span className="alert-message">{alert.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
