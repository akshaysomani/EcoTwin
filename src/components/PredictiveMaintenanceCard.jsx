import { ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function PredictiveMaintenanceCard({ assessment, trendData }) {
  const { maintenanceRisk, riskLevel, confidence, dominantRisk, recommendation } = assessment;

  // Determine trend direction for display
  let overallTrend = "STABLE";
  if (trendData) {
    overallTrend = trendData.overall || "STABLE";
  }

  const getRiskColorClass = (level) => {
    switch (level) {
      case "LOW":
        return "risk-low";
      case "MODERATE":
        return "risk-moderate";
      case "ELEVATED":
        return "risk-elevated";
      case "HIGH":
        return "risk-high";
      case "CRITICAL":
      default:
        return "risk-critical";
    }
  };

  const getConfidenceColorClass = (conf) => {
    switch (conf) {
      case "HIGH":
      case "GOOD":
        return "status-normal";
      case "MODERATE":
        return "status-warning";
      case "LOW":
      default:
        return "status-critical";
    }
  };

  const renderTrendIcon = (trend) => {
    if (trend === "INCREASING") return <TrendingUp size={14} className="text-critical inline-block" />;
    if (trend === "DECREASING") return <TrendingDown size={14} className="text-normal inline-block" />;
    return <Minus size={14} className="text-muted inline-block" />;
  };

  return (
    <div className="panel predictive-maintenance-card">
      <div className="panel-header border-b">
        <div>
          <h2>PREDICTIVE MAINTENANCE</h2>
          <p>Rule-based condition risk & failure avoidance metrics</p>
        </div>
        <div className="panel-icon">
          <ShieldCheck size={19} />
        </div>
      </div>

      <div className="predictive-card-content">
        <div className="risk-score-layout">
          <div className="risk-radial">
            <div className="risk-value">{maintenanceRisk}<span>/100</span></div>
            <div className="risk-label">Maintenance Risk</div>
          </div>

          <div className="risk-details-list">
            <div className="detail-row">
              <span className="lbl">Risk Level:</span>
              <span className={`risk-badge ${getRiskColorClass(riskLevel)}`}>
                {riskLevel} RISK
              </span>
            </div>

            <div className="detail-row">
              <span className="lbl">Assessment Confidence:</span>
              <span className={`confidence-badge ${getConfidenceColorClass(confidence)}`}>
                {confidence}
              </span>
            </div>

            <div className="detail-row">
              <span className="lbl">Primary Risk:</span>
              <strong className="val font-semibold">{dominantRisk === "NONE" ? "None Detected" : dominantRisk}</strong>
            </div>

            <div className="detail-row">
              <span className="lbl">Trend:</span>
              <span className="val inline-flex items-center gap-1 font-semibold">
                {renderTrendIcon(overallTrend)} {overallTrend}
              </span>
            </div>
          </div>
        </div>

        <div className="recommendation-banner-mini">
          <strong>Insight: </strong>
          {recommendation}
        </div>
      </div>
    </div>
  );
}
