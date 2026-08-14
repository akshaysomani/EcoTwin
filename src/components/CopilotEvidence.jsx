import { Database } from "lucide-react";

export default function CopilotEvidence({ evidence = [] }) {
  if (evidence.length === 0) return null;

  return (
    <div className="copilot-evidence-box">
      <div className="evidence-header">
        <Database size={12} className="text-info" />
        <span>Grounded Diagnostic Evidence</span>
      </div>

      <div className="evidence-rows-list">
        {evidence.map((item, idx) => (
          <div key={idx} className="evidence-item-row">
            <div className="item-meta">
              <span className="source-badge">{item.source}</span>
              <span className="metric-name">{item.metric}:</span>
              <strong className="metric-val">{item.value} {item.unit}</strong>
            </div>
            <p className="interpretation">{item.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
