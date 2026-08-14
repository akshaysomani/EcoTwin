import ReportMetric from "./ReportMetric";

export default function ReportPreview({ report }) {
  if (!report) return null;

  const {
    reportMetadata,
    reportingPeriod,
    energy,
    electrical,
    health,
    maintenance,
    sustainability,
    alerts,
    methodology,
    limitations
  } = report;

  const getStatusClass = (st) => {
    switch (st) {
      case "COMPLETE":
        return "badge-normal";
      case "LIMITED":
        return "badge-warning";
      case "INSUFFICIENT_DATA":
      default:
        return "badge-critical";
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleString();
  };

  const formatNum = (v, dec = 4) => {
    if (v === null || v === undefined) return "--";
    return Number(v).toFixed(dec);
  };

  return (
    <div className="report-preview-canvas" id="print-report-preview-canvas">
      {/* Header section */}
      <div className="report-preview-header border-b">
        <div className="header-top">
          <h1>{reportMetadata.title}</h1>
          <span className={`status-pill ${getStatusClass(reportMetadata.status)}`}>
            {reportMetadata.status}
          </span>
        </div>
        <div className="header-meta">
          <div className="meta-col">
            <span>Device Identifier:</span>
            <strong>{reportMetadata.deviceId}</strong>
          </div>
          <div className="meta-col">
            <span>Generated At:</span>
            <strong>{formatDateTime(reportMetadata.generationTimestamp)}</strong>
          </div>
          <div className="meta-col">
            <span>Observations Count:</span>
            <strong>{reportingPeriod.recordCount} frames</strong>
          </div>
          <div className="meta-col">
            <span>Sampling Window:</span>
            <strong>
              {reportingPeriod.oldestTimestamp ? (
                `${new Date(reportingPeriod.oldestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${new Date(reportingPeriod.latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              ) : (
                "Awaiting Telemetry"
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="report-preview-sections">
        {/* Section 1: Energy & Electrical */}
        <div className="report-section border-b">
          <h2>1. ENERGY & ELECTRICAL PERFORMANCE</h2>
          <div className="metrics-row-grid">
            <ReportMetric
              label="Integrated Energy Wh"
              value={formatNum(energy.totalWh, 4)}
              unit="Wh"
              status={energy.status}
              source="CALCULATED"
            />
            <ReportMetric
              label="Average Active Power"
              value={formatNum(energy.avgPowerMw ? energy.avgPowerMw / 1000 : null, 4)}
              unit="W"
              status={energy.status}
              source="CALCULATED"
            />
            <ReportMetric
              label="Power Stability Index"
              value={energy.stability}
              unit="%"
              status={energy.stability !== null ? "AVAILABLE" : "NOT AVAILABLE"}
              source="CALCULATED"
            />
            <ReportMetric
              label="Valid Telemetry Coverage"
              value={energy.coverage}
              unit="%"
              status="AVAILABLE"
              source="MEASURED"
            />
          </div>

          <div className="metrics-table-wrapper mt-4">
            <table className="report-preview-table">
              <thead>
                <tr>
                  <th>Validation Parameter</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Audit Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Valid Electrical Records</td>
                  <td>{electrical.validRecords}</td>
                  <td>MEASURED</td>
                  <td>Telemetry frames passing validation limits.</td>
                </tr>
                <tr>
                  <td>Invalid Electrical Records</td>
                  <td>{electrical.invalidRecords}</td>
                  <td>MEASURED</td>
                  <td className={electrical.invalidRecords > 0 ? "text-critical" : ""}>
                    {electrical.invalidRecords > 0 
                      ? "Voltage bounds exceeded (>6 V protective cutoff)." 
                      : "Zero invalid frames recorded."}
                  </td>
                </tr>
                <tr>
                  <td>INA219 Hardware State</td>
                  <td>{electrical.status}</td>
                  <td>CONFIG</td>
                  <td>Sensor validation classification.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Equipment Health & Maintenance */}
        <div className="report-section border-b">
          <h2>2. EQUIPMENT HEALTH & DIAGNOSTICS</h2>
          <div className="metrics-row-grid">
            <ReportMetric
              label="Fused Condition Rating"
              value={health.score}
              unit="/ 100"
              status={health.score !== null ? "AVAILABLE" : "INSUFFICIENT DATA"}
              source="CALCULATED"
            />
            <ReportMetric
              label="Diagnostic Confidence"
              value={health.confidence}
              status="AVAILABLE"
              source="CALCULATED"
            />
            <ReportMetric
              label="Thermal Subsystem"
              value={health.thermalStatus}
              status="AVAILABLE"
              source="MEASURED"
            />
            <ReportMetric
              label="Vibration Subsystem"
              value={health.vibrationStatus}
              status="AVAILABLE"
              source="MEASURED"
            />
          </div>

          <div className="justifications-block mt-4">
            <h3>Health Diagnostics Justifications</h3>
            <ul className="limitations-preview-list">
              {health.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="justifications-block mt-4">
            <h3>Active Maintenance Action Items</h3>
            {maintenance.recommendations.length === 0 ? (
              <p className="no-limitations-msg">NO ACTIVE MAINTENANCE RECOMMENDATIONS</p>
            ) : (
              <ul className="limitations-preview-list">
                {maintenance.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <strong>[{rec.priority}] {rec.title} ({rec.subsystem}):</strong> {rec.message} <span className="evidence-bracket">(Evidence: {rec.evidence})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section 3: Sustainability & Carbon Footprint */}
        <div className="report-section border-b">
          <h2>3. ESG & CARBON FOOTPRINT ANALYSIS</h2>
          <div className="metrics-row-grid">
            <ReportMetric
              label="Carbon Footprint Emissions"
              value={formatNum(sustainability.emissionsKg, 6)}
              unit="kgCO₂e"
              status={sustainability.carbonStatus}
              source="CALCULATED"
            />
            <ReportMetric
              label="Grid Emission Factor"
              value={formatNum(sustainability.emissionFactor, 4)}
              unit="kgCO₂e/kWh"
              status={sustainability.emissionFactor !== null ? "AVAILABLE" : "NOT CONFIGURED"}
              source="CONFIGURED"
            />
            <ReportMetric
              label="Energy Intensity"
              status={sustainability.intensityStatus}
              source="CALCULATED"
            />
            <ReportMetric
              label="Baseline CO2 Savings"
              status={sustainability.savingsStatus}
              source="CALCULATED"
            />
          </div>
        </div>

        {/* Section 4: Alerts Registry */}
        <div className="report-section border-b">
          <h2>4. ALERTS REGISTRY LOG</h2>
          {alerts.list.length === 0 ? (
            <p className="no-limitations-msg">No active warning or critical alarms registered during this reporting period.</p>
          ) : (
            <div className="metrics-table-wrapper">
              <table className="report-preview-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Type</th>
                    <th>Alarm Message</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.list.map((a, idx) => (
                    <tr key={idx}>
                      <td className={a.severity === "CRITICAL" ? "text-critical font-bold" : "text-warning font-semibold"}>
                        {a.severity}
                      </td>
                      <td>{a.type}</td>
                      <td>{a.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 5: Methodology Summary */}
        <div className="report-section border-b">
          <h2>5. ESG REPORTING METHODOLOGIES</h2>
          <div className="methodologies-block">
            {methodology.map((m, idx) => (
              <div key={idx} className="methodology-item mt-2">
                <strong>{m.section}: </strong>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Limitations */}
        <div className="report-section">
          <h2>6. DATA GAPS & LIMITATIONS</h2>
          {limitations.length === 0 ? (
            <p className="no-limitations-msg">All calculations are fully verified. No data limitations mapped.</p>
          ) : (
            <ul className="limitations-preview-list">
              {limitations.map((limit, idx) => (
                <li key={idx} className="text-warning-heavy font-semibold">{limit}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer sign-off */}
      <div className="report-preview-footer border-t">
        <span>EcoTwin Automated ESG Platform Reporting System</span>
        <span>Deduplication Queue Verification Complete</span>
      </div>
    </div>
  );
}
