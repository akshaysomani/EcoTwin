import { Activity, Wrench, ShieldCheck, UserCheck } from "lucide-react";

export default function MaintenanceActivity({ historyAlerts }) {
  const getEvents = () => {
    const events = [];
    if (!historyAlerts) return events;

    historyAlerts.forEach((alert) => {
      // 1. Creation event
      events.push({
        id: `${alert.id}-gen`,
        timestamp: alert.created_at,
        icon: <Wrench size={12} className="text-warning" />,
        text: `Inspection Recommended: Alert [${alert.alertType}] generated for ECOTWIN-001.`
      });

      // 2. Acknowledged event
      if (alert.acknowledged_at) {
        events.push({
          id: `${alert.id}-ack`,
          timestamp: alert.acknowledged_at,
          icon: <UserCheck size={12} className="text-info" />,
          text: `Alert Acknowledged: Operator flagged [${alert.alertType}] and scheduled inspection.`
        });
      }

      // 3. Resolved event
      if (alert.resolved_at) {
        events.push({
          id: `${alert.id}-res`,
          timestamp: alert.resolved_at,
          icon: <ShieldCheck size={12} className="text-normal" />,
          text: `Alert Resolved: [${alert.alertType}] resolved and reset to normal monitoring.`
        });
      }
    });

    return events
      .filter((e) => e.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };

  const sortedEvents = getEvents();

  const formatTime = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="panel maintenance-activity-panel">
      <div className="panel-header border-b">
        <div>
          <h2>MAINTENANCE ACTIVITY LOG</h2>
          <p>Recent human-in-the-loop repair & validation actions</p>
        </div>
        <div className="panel-icon">
          <Activity size={19} />
        </div>
      </div>

      <div className="activity-content">
        {sortedEvents.length === 0 ? (
          <div className="activity-empty">No maintenance workflow activities logged.</div>
        ) : (
          <div className="activity-timeline">
            {sortedEvents.map((evt) => (
              <div key={evt.id} className="activity-item-row">
                <div className="icon-badge">{evt.icon}</div>
                <div className="body-content">
                  <span className="text">{evt.text}</span>
                  <span className="time">{formatTime(evt.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
