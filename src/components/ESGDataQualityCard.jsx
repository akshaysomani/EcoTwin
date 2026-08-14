import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function ESGDataQualityCard({ assessment }) {
  const { dataQuality } = assessment;

  const getOverallStateClass = (st) => {
    switch (st) {
      case "GOOD":
        return "badge-normal";
      case "LIMITED":
        return "badge-warning";
      case "UNAVAILABLE":
      default:
        return "badge-critical";
    }
  };

  const getStatusIcon = (st) => {
    return st === "GOOD" ? (
      <ShieldCheck size={12} className="text-normal" />
    ) : (
      <ShieldAlert size={12} className="text-warning" />
    );
  };

  return (
    <div className="panel esg-data-quality-card">
      <div className="panel-header border-b">
        <div>
          <h2>ESG DATA QUALITY CARD</h2>
          <p>Telemetry completeness and validation indices</p>
        </div>
      </div>

      <div className="quality-card-body">
        <div className="quality-summary-metric">
          <span className="lbl">Overall Data Quality Rating</span>
          <div className="badge-row">
            <span className={`status-pill ${getOverallStateClass(dataQuality.state)}`}>
              {getStatusIcon(dataQuality.state)}
              {dataQuality.state}
            </span>
          </div>
        </div>

        <div className="quality-metrics-list mt-4">
          <div className="quality-item-row">
            <span className="name">Telemetry Records Evaluated:</span>
            <span className="val font-semibold">{dataQuality.totalRecords}</span>
            <span className="source-tag measured">MEASURED</span>
          </div>

          <div className="quality-item-row">
            <span className="name">Valid Electrical Frames:</span>
            <span className="val font-semibold">{dataQuality.validRecords}</span>
            <span className="source-tag measured">MEASURED</span>
          </div>

          <div className="quality-item-row">
            <span className="name">Electrical Coverage:</span>
            <span className="val font-semibold">{dataQuality.coverage}%</span>
            <span className="source-tag calculated">CALCULATED</span>
          </div>

          <div className="quality-item-row">
            <span className="name">Energy Calculation:</span>
            <span className={`val font-bold ${dataQuality.energyAvailable ? "text-normal" : "text-critical"}`}>
              {dataQuality.energyAvailable ? "AVAILABLE" : "UNAVAILABLE"}
            </span>
            <span className="source-tag calculated">CALCULATED</span>
          </div>

          <div className="quality-item-row">
            <span className="name">Grid Carbon Factor:</span>
            <span className={`val font-bold ${dataQuality.emissionFactorAvailable ? "text-normal" : "text-warning"}`}>
              {dataQuality.emissionFactorAvailable ? "CONFIGURED" : "NOT CONFIGURED"}
            </span>
            <span className="source-tag measured">CONFIG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
