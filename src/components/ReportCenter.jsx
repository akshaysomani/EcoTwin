import { useState, useMemo } from "react";
import { FileText, Printer, Download, Eye, EyeOff } from "lucide-react";
import { reportEngine } from "../utils/reportEngine";
import ReportPreview from "./ReportPreview";

export default function ReportCenter({
  telemetry = [],
  energyAssessment = null,
  healthAssessment = null,
  maintenanceAssessment = null,
  sustainabilityAssessment = null,
  alerts = []
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Memoize report object
  const report = useMemo(() => {
    return reportEngine.generateReport({
      telemetry,
      energyAssessment,
      healthAssessment,
      maintenanceAssessment,
      sustainabilityAssessment,
      alerts
    });
  }, [telemetry, energyAssessment, healthAssessment, maintenanceAssessment, sustainabilityAssessment, alerts]);

  // Exporter: Tabular CSV file writer
  const exportToCSV = () => {
    if (!report) return;

    const headers = ["Metric", "Value", "Unit", "Source", "Status"];
    const rows = [
      ["Report Title", report.reportMetadata.title, "", "Metadata", "AVAILABLE"],
      ["Device ID", report.reportMetadata.deviceId, "", "Metadata", "AVAILABLE"],
      ["Generated At", report.reportMetadata.generationTimestamp, "", "Metadata", "AVAILABLE"],
      ["Record Observations", report.reportingPeriod.recordCount, "frames", "Metadata", "AVAILABLE"],
      ["Energy Consumption", report.energy.totalWh || 0, "Wh", "Energy Engine", report.energy.status],
      ["Power Averages", report.energy.avgPowerMw || 0, "mW", "Energy Engine", report.energy.status],
      ["Power Stability", report.energy.stability !== null ? report.energy.stability : "N/A", "%", "Energy Engine", report.energy.stability !== null ? "AVAILABLE" : "NOT AVAILABLE"],
      ["Electrical Coverage", report.energy.coverage, "%", "Energy Engine", "AVAILABLE"],
      ["Valid Electrical Records", report.electrical.validRecords, "frames", "Energy Engine", "AVAILABLE"],
      ["Invalid Electrical Records", report.electrical.invalidRecords, "frames", "Energy Engine", "AVAILABLE"],
      ["Equipment Health Rating", report.health.score !== null ? report.health.score : "N/A", "/100", "Health Engine", report.health.score !== null ? "AVAILABLE" : "INSUFFICIENT DATA"],
      ["Grid Carbon Factor", report.sustainability.emissionFactor !== null ? report.sustainability.emissionFactor : "N/A", "kgCO2e/kWh", "Sustainability Engine", report.sustainability.emissionFactor !== null ? "AVAILABLE" : "NOT CONFIGURED"],
      ["Carbon Emissions", report.sustainability.emissionsKg !== null ? report.sustainability.emissionsKg : "N/A", "kgCO2e", "Sustainability Engine", report.sustainability.carbonStatus],
      ["Energy Efficiency", "N/A", "", "Sustainability Engine", "NOT AVAILABLE"],
      ["Energy Intensity", "N/A", "", "Sustainability Engine", "NOT AVAILABLE"]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecotwin_esg_report_${report.reportMetadata.deviceId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="panel report-center-panel">
      <div className="panel-header border-b no-print">
        <div>
          <h2>ESG & SUSTAINABILITY REPORTING CENTER</h2>
          <p>Export real-time parameters, energy assessments, and carbon compliance scores</p>
        </div>
        <FileText size={19} className="text-normal" />
      </div>

      <div className="report-center-body">
        <div className="report-controls-row no-print">
          <button
            className={`btn-action ${isPreviewOpen ? "active" : ""}`}
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            title="Toggle print ready report previews"
          >
            {isPreviewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{isPreviewOpen ? "Close Preview" : "Preview Report"}</span>
          </button>

          <button
            className="btn-action"
            onClick={exportToCSV}
            title="Export CSV metrics file"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            className="btn-action"
            onClick={handlePrint}
            title="Trigger browser print menu"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>

        {/* Embedded Report Preview section */}
        {isPreviewOpen && (
          <div className="report-preview-container-box mt-4 border-t no-print">
            <ReportPreview report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
