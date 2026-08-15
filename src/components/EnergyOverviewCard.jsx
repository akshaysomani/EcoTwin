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

  if (assessment.mode === "ESTIMATED") {
    return (
      <div className="panel energy-overview-card border-warning-heavy">
        <div className="panel-header border-b">
          <div>
            <h2>ENERGY PERFORMANCE</h2>
            <p>RULE-BASED ENERGY ANALYSIS</p>
          </div>
          <span className="trend-badge-pill trend-volatile" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}>
            <Zap size={12} />
            ESTIMATED
          </span>
        </div>

        <div className="energy-grid">
          <div className="energy-item">
            <span className="lbl">Estimated Power</span>
            <strong className="val">{formatNum(avgPower, 3)} W</strong>
          </div>

          <div className="energy-item">
            <span className="lbl">Latest Current</span>
            <strong className="val">{formatNum(assessment.latestCurrent, 1)} mA</strong>
          </div>

          <div className="energy-item">
            <span className="lbl">Voltage Basis</span>
            <strong className="val">{formatNum(avgVoltage, 1)} V</strong>
          </div>

          <div className="energy-item">
            <span className="lbl">Runtime</span>
            <strong className="val">{assessment.formattedDuration || "0s"}</strong>
          </div>

          <div className="energy-item full-width highlight-item" style={{ borderLeftColor: '#f59e0b' }}>
            <span className="lbl">Estimated Energy Consumed</span>
            <strong className="val">{formatNum(energyWh, 4)} Wh</strong>
            <span className="sub-val">({formatNum(energyWh / 1000, 7)} kWh)</span>
          </div>

          <div className="energy-item full-width">
            <span className="lbl" style={{ marginBottom: '8px', display: 'block' }}>Data Source & Quality Parameters</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
              <div>Current source: <strong style={{ color: '#fff' }}>REAL INA219</strong></div>
              <div>Voltage basis: <strong style={{ color: '#fff' }}>5 V NOMINAL</strong></div>
              <div>Calculation: <strong style={{ color: '#fff' }}>DYNAMIC</strong></div>
              <div>Verification: <strong style={{ color: '#ef4444' }}>NOT INDEPENDENTLY VERIFIED</strong></div>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', lineHeight: '1.4', borderTop: '1px solid #334155', paddingTop: '8px' }}>
              Estimated dynamically from real INA219 current telemetry using the nominal 5 V motor supply. Physical voltage readings (~9.9 V) are currently unverified.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
