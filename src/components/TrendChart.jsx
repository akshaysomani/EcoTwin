import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function TrendChart({
  title,
  subtitle,
  data,
  dataKey,
  unit,
  color = "#4257c9",
  gradientId,
}) {
  const isInsufficient = !data || data.length < 5;
  const isEmpty = !data || data.length === 0;

  const gradId = gradientId || `gradient-trend-${dataKey}`;

  return (
    <div className="chart-card trend-chart-card">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {unit && <span className="chart-unit">{unit}</span>}
      </div>

      <div className="chart-container">
        {isEmpty ? (
          <div className="empty-chart">Waiting for telemetry data...</div>
        ) : isInsufficient ? (
          <div className="empty-chart insufficient-chart">
            <span>Insufficient data for trend plotting ({data.length}/5 readings)</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
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
                domain={["auto", "auto"]}
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

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
