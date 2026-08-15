import { Globe, AlertTriangle } from "lucide-react";

export default function CarbonImpactCard({ assessment, emissionFactorInput, onFactorChange, onSourceChange, emissionSourceInput }) {
  const { energy, carbon, status } = assessment;

  const handleFactorInputChange = (e) => {
    const val = e.target.value;
    onFactorChange(val);
  };

  const handleSourceInputChange = (e) => {
    const val = e.target.value;
    onSourceChange(val);
  };

  const formatNum = (v, dec = 6) => {
    if (v === null || v === undefined) return "--";
    return Number(v).toFixed(dec);
  };

  if (status === "UNAVAILABLE") {
    return (
      <div className="panel carbon-impact-card border-dashed">
        <div className="panel-header border-b">
          <div>
            <h2>CARBON FOOTPRINT IMPACT</h2>
            <p>Calculated CO₂ equivalence metrics</p>
          </div>
        </div>
        <div className="carbon-unavailable-state">
          <Globe size={32} className="text-info" />
          <p>Carbon footprint metrics are unavailable due to missing telemetry feeds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel carbon-impact-card">
      <div className="panel-header border-b">
        <div>
          <h2>CARBON FOOTPRINT IMPACT</h2>
          <p>Calculated CO₂ equivalence metrics</p>
        </div>
        <Globe size={19} className="text-normal" />
      </div>

      <div className="carbon-card-body">
        {carbon.emissions !== null ? (
          <div className="carbon-emissions-showcase">
            <span className="lbl">Estimated Carbon Emissions</span>
            <strong className="val text-critical">{formatNum(carbon.emissions, 6)} kgCO₂e</strong>
            <span className="source-tag calculated">CALCULATED: Energy (kWh) × Factor</span>
          </div>
        ) : (
          <div className="carbon-empty-state">
            <AlertTriangle size={24} className="text-warning" />
            <strong>CARBON CALCULATION NOT CONFIGURED</strong>
            <p className="help-text">Input an electricity grid emission factor below to activate.</p>
          </div>
        )}

        <div className="carbon-details-grid border-t">
          <div className="detail-row">
            <span className="lbl">Integrated Energy Draw</span>
            <span className="val font-semibold">{formatNum(energy.totalKwh, 6)} kWh</span>
            <span className="source-tag calculated">CALCULATED</span>
          </div>

          <div className="detail-row">
            <span className="lbl">Baseline Savings</span>
            <span className="val font-semibold text-neutral">NOT AVAILABLE</span>
            <span className="source-tag calculated">No baseline configured</span>
          </div>
        </div>

        {/* Dynamic Parameter Configuration Bar */}
        <div className="carbon-configuration-box border-t">
          <h3>ESG PARAMETER CONFIGURATION</h3>
          <div className="config-inputs-row">
            <div className="input-group">
              <label htmlFor="emission-factor-input">Grid Emission Factor (kgCO₂e/kWh):</label>
              <input
                id="emission-factor-input"
                type="number"
                step="0.0001"
                min="0"
                placeholder="e.g. 0.716"
                value={emissionFactorInput}
                onChange={handleFactorInputChange}
                aria-label="Grid Emission Factor in kgCO2e/kWh"
              />
            </div>

            <div className="input-group">
              <label htmlFor="emission-source-input">Data Source / Agency:</label>
              <input
                id="emission-source-input"
                type="text"
                placeholder="e.g. EPA eGRID 2026"
                value={emissionSourceInput}
                onChange={handleSourceInputChange}
                aria-label="Emission factor data source agency"
              />
            </div>
          </div>
          <div className="config-footer">
            <span className="config-state">
              State: <strong className={carbon.emissions !== null ? "text-normal" : "text-warning"}>
                {carbon.emissions !== null ? "ACTIVE" : "NOT CONFIGURED"}
              </strong>
            </span>
            {emissionSourceInput && (
              <span className="config-source">Source: <strong className="font-semibold">{emissionSourceInput}</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
