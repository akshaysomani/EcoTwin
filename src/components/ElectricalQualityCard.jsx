import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export default function ElectricalQualityCard({ quality, latestReading, estimationConfig }) {
  const { totalRecords, validRecords, invalidRecords, coverage, state } = quality;

  const isHardwareOk = latestReading?.sensor_ina219_ok !== false;

  const getQualityBadge = (s) => {
    switch (s) {
      case "GOOD":
        return <span className="status-pill status-normal"><ShieldCheck size={12} /> GOOD</span>;
      case "LIMITED":
        return <span className="status-pill status-warning"><Shield size={12} /> LIMITED</span>;
      case "UNAVAILABLE":
      default:
        return <span className="status-pill status-critical"><ShieldAlert size={12} /> UNAVAILABLE</span>;
    }
  };

  return (
    <div className="panel electrical-quality-card">
      <div className="panel-header border-b">
        <div>
          <h2>ELECTRICAL TELEMETRY QUALITY</h2>
          <p>Real-time reliability indicators for INA219 energy calculations</p>
        </div>
      </div>

      <div className="quality-card-content">
        <div className="quality-summary-metric">
          <span className="lbl">Electrical Data Coverage</span>
          <strong className="val">{coverage}%</strong>
        </div>

        <div className="quality-info-grid">
          <div className="info-col">
            <span className="lbl">Valid Telemetry Rows</span>
            <span className="val font-semibold">{validRecords} / {totalRecords}</span>
          </div>

          <div className="info-col">
            <span className="lbl">Invalid Telemetry Rows</span>
            <span className="val font-semibold">{invalidRecords}</span>
          </div>

          <div className="info-col">
            <span className="lbl">INA219 Hardware State</span>
            <span className={`val font-bold ${isHardwareOk ? "text-normal" : "text-critical"}`}>
              {isHardwareOk ? "OPERATIONAL" : "FAULT/OFFLINE"}
            </span>
          </div>

          <div className="info-col">
            <span className="lbl">Quality Index</span>
            <div className="badge-row">{getQualityBadge(state)}</div>
          </div>

          <div className="info-col">
            <span className="lbl">Energy Estimation</span>
            <span className="val font-semibold">{estimationConfig?.enabled ? "Enabled" : "Disabled"}</span>
          </div>

          <div className="info-col">
            <span className="lbl">Estimation Status</span>
            <span className={`val font-bold ${estimationConfig?.enabled && validRecords === 0 ? "text-warning" : "text-neutral"}`}>
              {estimationConfig?.enabled && validRecords === 0 ? "ESTIMATED" : "UNAVAILABLE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
