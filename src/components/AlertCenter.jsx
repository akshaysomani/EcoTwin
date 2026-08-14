import { AlertTriangle, ShieldAlert, Info, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AlertCenter({ activeAlerts, onAcknowledge, onResolve }) {
  const getSeverityIcon = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return <ShieldAlert className="alert-icon text-critical" size={18} />;
      case "WARNING":
        return <AlertTriangle className="alert-icon text-warning" size={18} />;
      case "INFO":
      default:
        return <Info className="alert-icon text-info" size={18} />;
    }
  };

  const getSeverityClass = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return "alert-critical";
      case "WARNING":
        return "alert-warning";
      case "INFO":
      default:
        return "alert-info";
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="panel alert-center-panel">
      <div className="panel-header border-b">
        <div>
          <h2>ACTIVE ALERTS QUEUE</h2>
          <p>Real-time machine warnings requiring operator confirmation</p>
        </div>
        <span className="alert-count-badge">
          {activeAlerts.length} ACTIVE
        </span>
      </div>

      <div className="alert-center-content">
        {activeAlerts.length === 0 ? (
          <div className="alert-empty-state">
            <ShieldCheck size={36} className="text-normal" />
            <p>System operational. No active conditions detected.</p>
          </div>
        ) : (
          <div className="active-alerts-list">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-card-row ${getSeverityClass(alert.severity)} ${
                  alert.status === "ACKNOWLEDGED" ? "acknowledged-row" : ""
                }`}
              >
                <div className="alert-card-header">
                  <div className="header-left">
                    {getSeverityIcon(alert.severity)}
                    <strong className="title">{alert.title}</strong>
                  </div>
                  <span className="time-badge">{formatTimestamp(alert.created_at)}</span>
                </div>

                <p className="message-text">{alert.message}</p>

                <div className="alert-card-footer">
                  <div className="meta-info">
                    <span>Source: <strong className="font-semibold">{alert.source}</strong></span>
                    <span className="dot-sep">•</span>
                    <span>Device: <strong className="font-semibold">ECOTWIN-001</strong></span>
                  </div>

                  <div className="action-buttons-group">
                    {alert.status === "ACTIVE" && (
                      <button
                        className="btn-ack"
                        onClick={() => onAcknowledge(alert.id, alert)}
                        aria-label={`Acknowledge alert: ${alert.title}`}
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      className="btn-resolve"
                      onClick={() => onResolve(alert.id, alert)}
                      aria-label={`Resolve alert: ${alert.title}`}
                    >
                      <CheckCircle2 size={13} />
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
