import { Zap, TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";

export default function EnergyOverviewCard({ assessment }) {
  const {
    available,
    avgVoltage,
    avgCurrent,
    avgPower,
    maxPower,
    energyWh,
    trend
  } = assessment;

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

  const formatNum = (v, dec = 2) => {
    if (v === null || v === undefined) return "--";
    return Number(v).toFixed(dec);
  };

  if (!available) {
    return (
      <div className="panel energy-overview-card border-warning-heavy">
        <div className="panel-header border-b">
          <div>
            <h2>ENERGY PERFORMANCE</h2>
            <p>RULE-BASED ENERGY ANALYSIS</p>
          </div>
          <Zap size={19} className="text-warning" />
        </div>
        <div className="energy-unavailable-state">
          <ShieldAlert size={36} className="text-warning" />
          <h3>ELECTRICAL TELEMETRY UNAVAILABLE</h3>
          <p>Energy calculations require valid INA219 measurements.</p>
          <span className="help-text">Connect/verify INA219 hardware to calculate energy metrics.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="panel energy-overview-card">
      <div className="panel-header border-b">
        <div>
          <h2>ENERGY PERFORMANCE</h2>
          <p>RULE-BASED ENERGY ANALYSIS</p>
        </div>
        <Zap size={19} className="text-normal" />
      </div>

      <div className="energy-grid">
        <div className="energy-item">
          <span className="lbl">Average Power Draw</span>
          <strong className="val">{formatNum(avgPower, 3)} W</strong>
        </div>

        <div className="energy-item">
          <span className="lbl">Peak Power Draw</span>
          <strong className="val">{formatNum(maxPower, 3)} W</strong>
        </div>

        <div className="energy-item">
          <span className="lbl">Average Current</span>
          <strong className="val">{formatNum(avgCurrent, 1)} mA</strong>
        </div>

        <div className="energy-item">
          <span className="lbl">Average Bus Voltage</span>
          <strong className="val">{formatNum(avgVoltage, 2)} V</strong>
        </div>

        <div className="energy-item full-width highlight-item">
          <span className="lbl">Total Energy Consumed</span>
          <strong className="val">{formatNum(energyWh, 4)} Wh</strong>
          <span className="sub-val">({formatNum(energyWh / 1000, 6)} kWh)</span>
        </div>

        <div className="energy-item">
          <span className="lbl">Power Trend</span>
          <div className="badge-row">{renderTrendBadge(trend)}</div>
        </div>
      </div>
    </div>
  );
}
