import { Clock, AlertCircle, Wrench, CheckCircle } from "lucide-react";

export default function MaintenanceTimeline({ historyAlerts = [] }) {
  const getEvents = () => {
    const events = [];

    historyAlerts.forEach((alert) => {
      // 1. Generation Event
      events.push({
        id: `${alert.id}-gen`,
        timestamp: alert.created_at,
        icon: <AlertCircle size={12} className="text-warning" />,
        title: `Warning Trigger: ${alert.title}`,
        message: alert.message,
        source: alert.source
      });

      // 2. Acknowledged Event
      if (alert.acknowledged_at) {
        events.push({
          id: `${alert.id}-ack`,
          timestamp: alert.acknowledged_at,
          icon: <Wrench size={12} className="text-info" />,
          title: "Operator Workflow Actioned",
          message: `Operator acknowledged [${alert.alertType}] and scheduled inspection.`,
          source: "Human-in-the-Loop"
        });
      }

      // 3. Resolved Event
      if (alert.resolved_at) {
        events.push({
          id: `${alert.id}-res`,
          timestamp: alert.resolved_at,
          icon: <CheckCircle size={12} className="text-normal" />,
          title: "Maintenance Verification Resolved",
          message: `Baseline cleared. Alert [${alert.alertType}] marked as resolved.`,
          source: "Human-in-the-Loop"
        });
      }
    });

    return events
      .filter((e) => e.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  const timelineEvents = getEvents();

  const formatDateTime = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="panel maintenance-timeline-panel">
      <div className="panel-header border-b">
        <div>
          <h2>MAINTENANCE EVENT TIMELINE</h2>
          <p>Chronological audit trail of diagnostic and repair logs</p>
        </div>
        <div className="panel-icon">
          <Clock size={19} />
        </div>
      </div>

      <div className="timeline-content">
        {timelineEvents.length === 0 ? (
          <div className="timeline-empty">NO MAINTENANCE EVENTS LOGGED</div>
        ) : (
          <div className="maintenance-vertical-track">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="timeline-row-item">
                <div className="marker-badge">{evt.icon}</div>
                <div className="item-details">
                  <div className="details-header">
                    <strong className="title">{evt.title}</strong>
                    <span className="time">{formatDateTime(evt.timestamp)}</span>
                  </div>
                  <p className="description-text">{evt.message}</p>
                  <span className="origin-lbl">Origin: <strong className="font-semibold">{evt.source}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
