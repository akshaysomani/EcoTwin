import { useState } from "react";
import { History } from "lucide-react";

export default function AlertHistory({ historyAlerts }) {
  const [filter, setFilter] = useState("ALL");

  const filteredAlerts = historyAlerts.filter((alert) => {
    if (filter === "ALL") return true;
    return alert.status === filter;
  });

  const getSeverityClass = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return "badge-critical";
      case "WARNING":
        return "badge-warning";
      case "INFO":
      default:
        return "badge-info";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "RESOLVED":
        return "status-normal";
      case "ACKNOWLEDGED":
        return "status-warning";
      case "ACTIVE":
      default:
        return "status-critical";
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "--";
    const d = new Date(isoString);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="panel alert-history-panel">
      <div className="panel-header border-b">
        <div>
          <h2>ALERT REGISTRY HISTORY</h2>
          <p>Complete historical log of all generated machine warnings</p>
        </div>
        <div className="panel-icon">
          <History size={19} />
        </div>
      </div>

      <div className="history-filters-bar">
        <div className="filter-buttons">
          {["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="count-label">{filteredAlerts.length} Logs</span>
      </div>

      <div className="history-table-container">
        {filteredAlerts.length === 0 ? (
          <div className="history-empty">No alerts in this category.</div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Alert Type</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="timestamp">{formatDateTime(alert.created_at)}</td>
                  <td className="font-semibold text-xs">{alert.alertType}</td>
                  <td>
                    <span className={`severity-badge-mini ${getSeverityClass(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td>{alert.source}</td>
                  <td className="message-col">{alert.message}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
