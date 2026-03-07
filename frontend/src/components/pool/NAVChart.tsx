"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface NAVHistoryPoint {
  nav: number;
  timestamp: number;
  reserveRatio: number;
}

export function NAVChart({ history }: { history: NAVHistoryPoint[] }) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (history.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-500">
        Waiting for NAV data...
      </div>
    );
  }

  const chartData = history.map((point, i) => ({
    index: i,
    time: new Date(point.timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    nav: point.nav,
  }));

  const minY = Math.min(...history.map((p) => p.nav)) * 0.9985;
  const maxY = Math.max(...history.map((p) => p.nav)) * 1.0015;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-medium text-gray-400">Real-time price comparison</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Next update in {countdown}s
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/15 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis
              dataKey="time"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minY, maxY]}
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(2)}`}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toFixed(4)}`, "NAV Price"]}
              labelStyle={{ color: "#9CA3AF" }}
            />
            <Line
              type="monotone"
              dataKey="nav"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={false}
              name="NAV Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
