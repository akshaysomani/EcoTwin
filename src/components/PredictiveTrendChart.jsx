import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

export default function PredictiveTrendChart({ data, dataKey = "risk" }) {
  const isInsufficient = !data || data.length < 5;
  const isEmpty = !data || data.length === 0;

  return (
    <div className="chart-card predictive-trend-chart-card">
      <div className="chart-header">
        <div>
          <h3>Historical Risk Trajectory</h3>
          <p>Rule-based operational risk trend line (non-forecasting model)</p>
        </div>
        <span className="chart-unit">% Risk</span>
      </div>

      <div className="chart-container">
        {isEmpty ? (
          <div className="empty-chart">Waiting for telemetry data...</div>
        ) : isInsufficient ? (
          <div className="empty-chart insufficient-chart">
            <span>Insufficient data for trajectory plotting ({data.length}/5 readings)</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradient-risk-trajectory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(148, 163, 184, 0.12)"
              />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                dy={6}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fontSize: 10, fill: "#64748b" }}
                dx={-4}
                domain={[0, 100]}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  background: "#ffffff",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: 600, color: "#1e293b" }}
              />

              <ReferenceLine
                y={60}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: "HIGH RISK THRESHOLD",
                  fill: "#ef4444",
                  fontSize: 8,
                  position: "top",
                  fontWeight: 700,
                }}
              />

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradient-risk-trajectory)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-disclaimer-text">
        * This chart displays the computed historical risk index based on past sensor values. It does not represent a statistical future forecast.
      </div>
    </div>
  );
}
