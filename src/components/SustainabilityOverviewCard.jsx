import { Leaf, TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";

export default function SustainabilityOverviewCard({ assessment }) {
  const { status, energy, carbon, dataQuality } = assessment;

  const renderTrendBadge = (t) => {
    let colorClass = "trend-stable";
    let Icon = Minus;

    if (t === "INCREASING") {
      colorClass = "trend-increasing";
      Icon = TrendingUp;
    } else if (t === "DECREASING") {
      colorClass = "trend-decreasing";
      Icon = TrendingDown;
    } else if (t === "VOLATILE") {
      colorClass = "trend-volatile";
      Icon = ShieldAlert;
    }

    return (
      <span className={`trend-badge-pill ${colorClass}`}>
        <Icon size={12} className="trend-icon-mini" />
        {t}
      </span>
    );
  };

  const getQualityBadgeClass = (q) => {
    switch (q) {
      case "GOOD":
        return "status-normal";
      case "LIMITED":
        return "status-warning";
      case "UNAVAILABLE":
      default:
        return "status-critical";
    }
  };

  const formatNum = (v, dec = 4) => {
    if (v === null || v === undefined) return "--";
    return Number(v).toFixed(dec);
  };

  if (status === "UNAVAILABLE") {
    return (
      <div className="panel sustainability-overview-card border-warning-heavy">
        <div className="panel-header border-b">
          <div>
            <h2>SUSTAINABILITY OVERVIEW</h2>
            <p>Calculated environmental and carbon indicators</p>
          </div>
          <Leaf size={19} className="text-warning" />
        </div>
        <div className="sustainability-unavailable-state">
          <ShieldAlert size={36} className="text-warning" />
          <h3>ELECTRICAL SUSTAINABILITY DATA UNAVAILABLE</h3>
          <p>Valid INA219 measurements are required to calculate sustainability footprints.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel sustainability-overview-card">
      <div className="panel-header border-b">
        <div>
          <h2>SUSTAINABILITY OVERVIEW</h2>
          <p>Calculated environmental and carbon indicators</p>
        </div>
        <Leaf size={19} className="text-normal" />
      </div>

      <div className="sustainability-grid">
        <div className="sustainability-item">
          <span className="lbl">Energy Consumption</span>
          <strong className="val">{formatNum(energy.totalWh, 4)} Wh</strong>
          <span className="source-tag calculated">CALCULATED FROM TELEMETRY</span>
        </div>

        <div className="sustainability-item">
          <span className="lbl">Carbon Footprint</span>
          {carbon.emissions !== null ? (
            <strong className="val text-critical">{formatNum(carbon.emissions, 6)} kgCO₂e</strong>
          ) : (
            <strong className="val text-neutral">NOT CONFIGURED</strong>
          )}
          <span className="source-tag calculated">CALCULATED</span>
        </div>

        <div className="sustainability-item">
          <span className="lbl">Operational Coverage</span>
          <strong className="val">{energy.coverage}%</strong>
          <span className="source-tag measured">MEASURED</span>
        </div>

        <div className="sustainability-item">
          <span className="lbl">ESG Data Quality</span>
          <div className="badge-row mt-1">
            <span className={`status-pill ${getQualityBadgeClass(dataQuality.state)}`}>
              {dataQuality.state}
            </span>
          </div>
          <span className="source-tag measured">MEASURED</span>
        </div>

        <div className="sustainability-item full-width">
          <span className="lbl">Energy Trend Vector</span>
          <div className="badge-row mt-1">{renderTrendBadge(energy.trend)}</div>
          <span className="source-tag calculated">CALCULATED</span>
        </div>
      </div>
    </div>
  );
}
