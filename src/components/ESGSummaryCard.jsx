import { Landmark } from "lucide-react";

export default function ESGSummaryCard({ assessment }) {
  const { energy, carbon, efficiency, intensity, dataQuality } = assessment;

  const formatNum = (v, dec = 4) => {
    if (v === null || v === undefined) return "--";
    return Number(v).toFixed(dec);
  };

  return (
    <div className="panel esg-summary-card">
      <div className="panel-header border-b">
        <div>
          <h2>ESG INTEGRATION SUMMARY</h2>
          <p>Environmental, Operational, and Data Governance pillars</p>
        </div>
        <Landmark size={19} className="text-normal" />
      </div>

      <div className="esg-summary-body">
        {/* Environmental Pillar */}
        <div className="esg-pillar border-b">
          <div className="pillar-header">
            <span className="pillar-num">E</span>
            <div>
              <h3>ENVIRONMENTAL SUMMARY</h3>
              <p>Active energy draw & CO₂ equivalence</p>
            </div>
          </div>
          <div className="pillar-stats">
            <div className="stat-col">
              <span className="lbl">Integrated Energy:</span>
              <strong className="val">{formatNum(energy.totalKwh, 6)} kWh</strong>
            </div>
            <div className="stat-col">
              <span className="lbl">Emissions Estimate:</span>
              <strong className="val">
                {carbon.emissions !== null ? `${formatNum(carbon.emissions, 6)} kgCO₂e` : "NOT CONFIGURED"}
              </strong>
            </div>
          </div>
        </div>

        {/* Operational Pillar */}
        <div className="esg-pillar border-b">
          <div className="pillar-header">
            <span className="pillar-num">O</span>
            <div>
              <h3>OPERATIONAL EFFICIENCY</h3>
              <p>Energy intensity per physical output</p>
            </div>
          </div>
          <div className="pillar-stats">
            <div className="stat-col full-width">
              <span className="lbl">Operational Intensity:</span>
              <span className="val text-neutral font-semibold">{intensity.reason}</span>
            </div>
            <div className="stat-col full-width">
              <span className="lbl">Useful-Output Ratio:</span>
              <span className="val text-neutral font-semibold">{efficiency.reason}</span>
            </div>
          </div>
        </div>

        {/* Governance / Data Quality Pillar */}
        <div className="esg-pillar">
          <div className="pillar-header">
            <span className="pillar-num">G</span>
            <div>
              <h3>DATA GOVERNANCE</h3>
              <p>Traceability & metadata registration quality</p>
            </div>
          </div>
          <div className="pillar-stats">
            <div className="stat-col">
              <span className="lbl">Telemetry Coverage:</span>
              <strong className="val">{energy.coverage}%</strong>
            </div>
            <div className="stat-col">
              <span className="lbl">ESG Configuration:</span>
              <strong className="val">
                {dataQuality.emissionFactorAvailable ? "COMPLETE (ACTIVE)" : "INCOMPLETE"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
