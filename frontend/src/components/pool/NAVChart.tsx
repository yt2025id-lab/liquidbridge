"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface NAVHistoryPoint {
  nav: number;
  timestamp: number;
  reserveRatio: number;
}

export function NAVChart({ history }: { history: NAVHistoryPoint[] }) {
  if (history.length === 0) {
    return (
      <div
        className="animate-pulse"
        style={{
          height: "100%", minHeight: 260,
          borderRadius: 8,
          background: "var(--bg-input)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        Loading chart data...
      </div>
    );
  }

  const latestNAV = history[history.length - 1]?.nav || 100;
  const upperBound = latestNAV * 1.005;
  const lowerBound = latestNAV * 0.995;

  const chartData = history.map((point, i) => ({
    index: i,
    time: new Date(point.timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fullTime: new Date(point.timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    nav: point.nav,
  }));

  const minY = Math.min(...history.map((p) => p.nav)) * 0.998;
  const maxY = Math.max(...history.map((p) => p.nav)) * 1.002;

  return (
    <div style={{ height: "100%", minHeight: 260 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={260}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "var(--card-shadow)",
              color: "var(--text-primary)",
            }}
            labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
            formatter={(value) => [`$${Number(value).toFixed(4)}`, "NAV Price"]}
            labelFormatter={(_label, payload) =>
              (payload?.[0]?.payload as { fullTime?: string })?.fullTime || _label
            }
          />
          <ReferenceLine
            y={upperBound}
            stroke="var(--accent-yellow)"
            strokeDasharray="5 5"
            strokeOpacity={0.6}
            label={{ value: "Upper", position: "right", fill: "var(--accent-yellow)", fontSize: 10 }}
          />
          <ReferenceLine
            y={lowerBound}
            stroke="var(--accent-yellow)"
            strokeDasharray="5 5"
            strokeOpacity={0.6}
            label={{ value: "Lower", position: "right", fill: "var(--accent-yellow)", fontSize: 10 }}
          />
          <Line
            key={history[history.length - 1]?.timestamp}
            type="monotone"
            dataKey="nav"
            stroke="#00A3FF"
            strokeWidth={2.5}
            dot={false}
            name="NAV Price"
            activeDot={{ r: 4, fill: "#00A3FF", stroke: "var(--bg-surface)", strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
