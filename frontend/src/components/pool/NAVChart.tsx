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
      <div className="h-64 flex items-center justify-center text-gray-500">
        Waiting for NAV data...
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
    nav: point.nav,
    upper: upperBound,
    lower: lowerBound,
  }));

  const minY = Math.min(...history.map((p) => p.nav)) * 0.998;
  const maxY = Math.max(...history.map((p) => p.nav)) * 1.002;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            domain={[minY, maxY]}
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(value) => [`$${Number(value).toFixed(4)}`, ""]}
            labelStyle={{ color: "#9CA3AF" }}
          />
          <ReferenceLine
            y={upperBound}
            stroke="#EF4444"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
            label={{
              value: "Upper",
              position: "right",
              fill: "#EF4444",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={lowerBound}
            stroke="#EF4444"
            strokeDasharray="5 5"
            strokeOpacity={0.5}
            label={{
              value: "Lower",
              position: "right",
              fill: "#EF4444",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="nav"
            stroke="#14B8A6"
            strokeWidth={2}
            dot={false}
            name="NAV Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
