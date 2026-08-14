import { ArrowUpRight } from "lucide-react";

export default function CopilotSuggestedActions({ recommendations = [] }) {
  if (recommendations.length === 0) return null;

  const handleActionClick = (action) => {
    let target = null;
    const lower = action.toLowerCase();

    if (lower.includes("power") || lower.includes("sustainability") || lower.includes("electric") || lower.includes("carbon")) {
      // Scroll to energy/sustainability section
      target = document.querySelector(".sustainability-overview-card") || document.querySelector(".energy-overview-card");
    } else if (lower.includes("vibration") || lower.includes("temp") || lower.includes("ambient") || lower.includes("bearing")) {
      // Scroll to live telemetry/health section
      target = document.querySelector(".equipment-health-card") || document.querySelector(".overview-grid");
    } else if (lower.includes("alert") || lower.includes("warning")) {
      // Scroll to alerts center
      target = document.querySelector(".active-alerts-section") || document.querySelector(".alerts-panel");
    } else if (lower.includes("maintenance") || lower.includes("inspect") || lower.includes("audit")) {
      // Scroll to maintenance action items
      target = document.querySelector(".maintenance-recommendations-panel");
    }

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="copilot-suggested-actions border-t">
      <span className="action-lbl">Suggested Operator Actions:</span>
      <div className="actions-buttons-row">
        {recommendations.map((action, idx) => (
          <button
            key={idx}
            className="action-btn"
            onClick={() => handleActionClick(action)}
            title={`Scroll viewport to address: ${action}`}
          >
            <span>{action}</span>
            <ArrowUpRight size={10} className="action-icon" />
          </button>
        ))}
      </div>
    </div>
  );
}
