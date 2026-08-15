import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Activity } from "lucide-react";

export default function EnergyTrendChart({ data = [], available = false, mode = "VALIDATED", energyWh = 0.0617, runtimeMinutes = 10 }) {
  if (!available || data.length === 0) {
    return (
      <div className="panel energy-trend-chart-panel border-dashed">
        <div className="panel-header border-b">
          <div>
            <h2>Energy Accumulation & Power Trends</h2>
            <p>Chronological power loading vs. integrated Wh metrics</p>
          </div>
        </div>
        <div className="chart-empty-state" style={{ padding: '30px 20px' }}>
          <Activity size={32} className="text-warning" />
          <p style={{ fontWeight: 'bold', fontSize: '15px', marginTop: '10px' }}>Validated electrical telemetry unavailable.</p>
          
          {mode === "ESTIMATED" && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e293b', borderRadius: '6px', maxWidth: '400px', margin: '20px auto 0 auto', textAlign: 'left', border: '1px solid #334155' }}>
              <span className="lbl" style={{ display: 'block', color: '#f59e0b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                Energy Estimation Summary
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Estimated Power:</span>
                <strong style={{ fontSize: '12px', color: '#fff' }}>0.37 W</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Estimated Energy:</span>
                <strong style={{ fontSize: '12px', color: '#fff' }}>{Number(energyWh).toFixed(4)} Wh</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Runtime:</span>
                <strong style={{ fontSize: '12px', color: '#fff' }}>{runtimeMinutes} min</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Status:</span>
                <span className="trend-badge-pill trend-volatile" style={{ fontSize: '9px', padding: '1px 4px' }}>ESTIMATED</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="panel energy-trend-chart-panel">
      <div className="panel-header border-b">
        <div>
          <h2>Energy Accumulation & Power Trends</h2>
          <p>Chronological power loading vs. integrated Wh metrics</p>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />

            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            {/* Left Y Axis: Power Draw in Watts */}
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Number(v).toFixed(2)} W`}
              dx={-5}
            />

            {/* Right Y Axis: Accumulated Wh */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Number(v).toFixed(2)} Wh`}
              dx={5}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "8px",
                padding: "10px",
              }}
              labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700" }}
              itemStyle={{ fontSize: "12px", padding: "2px 0" }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconSize={10}
              wrapperStyle={{ fontSize: "11px", fontWeight: "700" }}
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="energyWh"
              name="Energy Consumed (Wh)"
              stroke="#10b981"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#energyGrad)"
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="powerW"
              name="Active Power (W)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
