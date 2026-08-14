import { Activity } from "lucide-react";

export default function MachineConditionSummary({ decision }) {
  const { explanation, confidence } = decision;

  return (
    <div className="panel machine-condition-summary-panel">
      <div className="panel-header border-b">
        <div>
          <h2>CURRENT MACHINE CONDITION</h2>
          <p>Explainable operational health narrative</p>
        </div>
        <div className="panel-icon">
          <Activity size={19} className="text-vib" />
        </div>
      </div>

      <div className="condition-summary-content">
        <p className="summary-paragraph">
          {explanation} Assessment confidence is <strong>{confidence}</strong>.
        </p>
      </div>
    </div>
  );
}
