import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Thermometer,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function formatVal(v, suffix = "") {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "--";
  return `${Number(v).toFixed(2)}${suffix}`;
}

export default function AnalyticsSummary({ trendData }) {
  const { temp, vib, elec } = trendData;

  const renderTrendBadge = (trend) => {
    let Icon = Minus;
    let badgeClass = "trend-stable";

    if (trend === "INCREASING") {
      Icon = TrendingUp;
      badgeClass = "trend-increasing";
    } else if (trend === "DECREASING") {
      Icon = TrendingDown;
      badgeClass = "trend-decreasing";
    } else if (trend === "VOLATILE") {
      Icon = AlertTriangle;
      badgeClass = "trend-volatile";
    }

    return (
      <span className={`trend-badge-pill ${badgeClass}`}>
        <Icon size={12} className="trend-icon-mini" />
        {trend}
      </span>
    );
  };

  const renderDiff = (current, average, suffix = "") => {
    const cur = Number(current);
    const avg = Number(average);
    if (!Number.isFinite(cur) || !Number.isFinite(avg)) return <span className="diff-stable">--</span>;
    const diff = cur - avg;
    if (Math.abs(diff) < 0.01) {
      return <span className="diff-stable">0.00 {suffix}</span>;
    }
    const isPos = diff > 0;
    const ArrowIcon = isPos ? ArrowUpRight : ArrowDownRight;
    const sign = isPos ? "+" : "";

    return (
      <span className={isPos ? "diff-positive" : "diff-negative"}>
        <ArrowIcon size={12} className="diff-arrow" />
        {sign}{diff.toFixed(2)}{suffix}
      </span>
    );
  };

  return (
    <div className="panel analytics-summary-panel">
      <div className="panel-header border-b">
        <div>
          <h2>Historical Trend Analytics</h2>
          <p>Comparative sensor performance & stability summary</p>
        </div>
      </div>

      <div className="analytics-summary-grid">
        {/* Temperature Analytics */}
        <div className="analytics-col">
          <div className="col-title-row">
            <div className="title-left">
              <Thermometer size={16} className="text-temp" />
              <span>Temperature</span>
            </div>
            {renderTrendBadge(temp.trend)}
          </div>

          <div className="metrics-compare-box">
            <div className="metric-compare-row">
              <span className="compare-lbl">Current</span>
              <span className="compare-val font-bold">{formatVal(temp.current, " °C")}</span>
            </div>
            <div className="metric-compare-row">
              <span className="compare-lbl">Hist. Average</span>
              <span className="compare-val">{formatVal(temp.avg, " °C")}</span>
            </div>
            <div className="metric-compare-row">
              <span className="compare-lbl">Variance</span>
              <span className="compare-val">{renderDiff(temp.current, temp.avg, " °C")}</span>
            </div>
            <div className="metric-compare-row border-t-dashed">
              <span className="compare-lbl">Historical Min</span>
              <span className="compare-val text-muted">{formatVal(temp.min, " °C")}</span>
            </div>
            <div className="metric-compare-row">
              <span className="compare-lbl">Historical Max</span>
              <span className="compare-val text-muted">{formatVal(temp.max, " °C")}</span>
            </div>
          </div>
        </div>

        {/* Vibration Analytics */}
        <div className="analytics-col">
          <div className="col-title-row">
            <div className="title-left">
              <Activity size={16} className="text-vib" />
              <span>Vibration</span>
            </div>
            {renderTrendBadge(vib.trend)}
          </div>

          <div className="metrics-compare-box">
            <div className="metric-compare-row">
              <span className="compare-lbl">Current Dev.</span>
              <span className="compare-val font-bold">{formatVal(vib.current, " m/s²")}</span>
            </div>
            <div className="metric-compare-row">
              <span className="compare-lbl">Hist. Average</span>
              <span className="compare-val">{formatVal(vib.avg, " m/s²")}</span>
            </div>
            <div className="metric-compare-row">
              <span className="compare-lbl">Variance</span>
              <span className="compare-val">{renderDiff(vib.current, vib.avg, " m/s²")}</span>
            </div>
            <div className="metric-compare-row border-t-dashed">
              <span className="compare-lbl">Historical Min</span>
              <span className="compare-val text-muted">{formatVal(vib.min, " m/s²")}</span>
            </div>
            <div className="metric-compare-row">
              <span className="compare-lbl">Historical Max</span>
              <span className="compare-val text-muted">{formatVal(vib.max, " m/s²")}</span>
            </div>
          </div>
        </div>

        {/* Electrical Analytics */}
        <div className="analytics-col">
          <div className="col-title-row">
            <div className="title-left">
              <Zap size={16} className="text-elec" />
              <span>Electrical</span>
            </div>
            {elec.status === "AVAILABLE" ? renderTrendBadge(elec.voltTrend) : <span className="trend-badge-pill trend-unavailable">UNAVAILABLE</span>}
          </div>

          {elec.status === "AVAILABLE" ? (
            <div className="metrics-compare-box">
              <div className="metric-compare-row">
                <span className="compare-lbl">Current Volt.</span>
                <span className="compare-val font-bold">{formatVal(elec.voltCurrent, " V")}</span>
              </div>
              <div className="metric-compare-row">
                <span className="compare-lbl">Volt. Average</span>
                <span className="compare-val">{formatVal(elec.voltAvg, " V")}</span>
              </div>
              <div className="metric-compare-row">
                <span className="compare-lbl">Volt. Variance</span>
                <span className="compare-val">{renderDiff(elec.voltCurrent, elec.voltAvg, " V")}</span>
              </div>
              <div className="metric-compare-row border-t-dashed">
                <span className="compare-lbl">Current Average</span>
                <span className="compare-val text-muted">{formatVal(elec.currAvg, " mA")}</span>
              </div>
              <div className="metric-compare-row">
                <span className="compare-lbl">Power Average</span>
                <span className="compare-val text-muted">{formatVal(elec.pwrAvg, " mW")}</span>
              </div>
            </div>
          ) : (
            <div className="electrical-unavailable-notice">
              <div className="notice-label">ELECTRICAL TELEMETRY UNAVAILABLE</div>
              <p>Could not build trend models. Connect INA219 hardware.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
