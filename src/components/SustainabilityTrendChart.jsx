import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Leaf } from "lucide-react";

export default function SustainabilityTrendChart({ data = [], available = false, emissionFactorAvailable = false }) {
  if (!available || data.length === 0) {
    return (
      <div className="panel sustainability-trend-chart-panel border-dashed">
        <div className="panel-header border-b">
          <div>
            <h2>SUSTAINABILITY TREND TRAJECTORY</h2>
            <p>Chronological power and carbon emission graphs</p>
          </div>
        </div>
        <div className="chart-empty-state">
          <Leaf size={32} className="text-info animate-pulse" />
          <p>No valid electrical telemetry available to build trend trajectories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel sustainability-trend-chart-panel">
      <div className="panel-header border-b">
        <div>
          <h2>SUSTAINABILITY TREND TRAJECTORY</h2>
          <p>Chronological active power (W), Wh energy, and calculated carbon emissions</p>
        </div>
      </div>

      <div className="chart-wrapper mt-4" style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            {/* Left Y Axis for Power and Carbon */}
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              label={{ value: "Power (W) / Carbon (kgCO2e)", angle: -90, position: "insideLeft", fontSize: 9, offset: 10, fill: "#475569" }}
            />
            {/* Right Y Axis for Wh Energy */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              label={{ value: "Energy (Wh)", angle: 90, position: "insideRight", fontSize: 9, offset: 10, fill: "#475569" }}
            />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "11px" }}
            />
            <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
            
            {/* Area for integrated Energy Wh */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="energyWh"
              name="Accumulated Energy (Wh)"
              fill="url(#sustainEnergyGrad)"
              stroke="#10b981"
              strokeWidth={2}
            />

            {/* Line for active power W */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="powerW"
              name="Active Power (W)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />

            {/* Line for Carbon emissions (only if factor available) */}
            {emissionFactorAvailable && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="carbonKg"
                name="Carbon Footprint (kgCO2e)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            )}

            <defs>
              <linearGradient id="sustainEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
