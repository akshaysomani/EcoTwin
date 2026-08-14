export default function ReportMetric({ label, value, unit = "", status = "AVAILABLE", source = "CALCULATED" }) {
  const getSourceBadgeClass = (src) => {
    switch (src) {
      case "MEASURED":
        return "source-tag measured";
      case "CONFIGURED":
      case "CONFIG":
        return "source-tag configured";
      case "CALCULATED":
      default:
        return "source-tag calculated";
    }
  };

  const getStatusClass = (st) => {
    switch (st) {
      case "AVAILABLE":
        return "text-normal font-semibold";
      case "NOT CONFIGURED":
        return "text-warning font-semibold";
      case "NOT AVAILABLE":
      default:
        return "text-neutral font-semibold";
    }
  };

  return (
    <div className="report-metric-cell">
      <span className="lbl">{label}</span>
      <div className="val-row">
        {status === "AVAILABLE" ? (
          <strong className="val">{value} {unit}</strong>
        ) : (
          <span className={`val ${getStatusClass(status)}`}>{status}</span>
        )}
      </div>
      <span className={getSourceBadgeClass(source)}>{source}</span>
    </div>
  );
}
