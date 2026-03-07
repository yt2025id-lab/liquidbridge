"use client";

import { useState, useEffect } from "react";
import { usePool } from "@/hooks/usePool";
import { useNAV } from "@/hooks/useNAV";
import { formatUSDC, formatRWA, formatNAV, cn } from "@/lib/utils";
import { NAVChart } from "./NAVChart";
import { Activity, DollarSign, BarChart3, Shield, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export function PoolDashboard() {
  const { poolState, totalVolume, totalFees, swapCount, currentFee, impliedPrice } = usePool();
  const { nav, timestamp, reserveRatio, isStale, history } = useNAV();
  const [updatedAgo, setUpdatedAgo] = useState("just now");

  useEffect(() => {
    if (!timestamp) return;
    const update = () => {
      const secs = Math.floor(Date.now() / 1000) - Number(timestamp);
      if (secs < 60) setUpdatedAgo(`${secs}s ago`);
      else setUpdatedAgo(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [timestamp]);

  const navPrice = nav ? Number(nav) / 1e6 : 0;
  const marketPrice = impliedPrice ? Number(impliedPrice) / 1e6 : 0;
  const deviation = navPrice > 0 ? ((marketPrice - navPrice) / navPrice) * 100 : 0;
  const reservePercent = reserveRatio ? Number(reserveRatio) / 100 : 0;
  const feePercent = currentFee ? Number(currentFee) / 100 : 0;

  const prevNav = history.length >= 2 ? history[history.length - 2]?.nav : navPrice;
  const navChange = prevNav > 0 ? ((navPrice - prevNav) / prevNav) * 100 : 0;

  const tvl = poolState
    ? Number(poolState.reserveUSDC) / 1e6 +
      (Number(poolState.reserveRWA) / 1e18) * navPrice
    : 0;

  const reserveStatus =
    reservePercent >= 99 ? "Healthy" : reservePercent >= 98 ? "Warning" : "Critical";
  const reserveStatusColor =
    reservePercent >= 99
      ? "text-green-400 bg-green-400/10 border-green-400/20"
      : reservePercent >= 98
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : "text-red-400 bg-red-400/10 border-red-400/20";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {poolState?.circuitBreakerActive && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <p className="font-semibold">Circuit Breaker Active</p>
            <p className="text-sm opacity-80">Trading is paused due to reserve ratio falling below 98%</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={20} />}
          label="TOTAL VALUE LOCKED"
          value={`$${tvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          gradient="from-teal-500/20 to-cyan-500/10"
          iconBg="bg-teal-500/20 text-teal-400"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="24H VOLUME"
          value={`$${totalVolume ? formatUSDC(totalVolume) : "0.00"}`}
          gradient="from-blue-500/20 to-indigo-500/10"
          iconBg="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="TOTAL SWAPS"
          value={swapCount?.toString() || "0"}
          gradient="from-purple-500/20 to-violet-500/10"
          iconBg="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          icon={<Shield size={20} />}
          label="TOTAL FEES"
          value={`$${totalFees ? formatUSDC(totalFees) : "0.00"}`}
          gradient="from-amber-500/20 to-orange-500/10"
          iconBg="bg-amber-500/20 text-amber-400"
        />
      </div>

      {/* NAV Chart + Price Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">NAV vs Market Price</h3>
          </div>
          <NAVChart history={history} />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Price Info */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Price Information</h3>
              <span className="text-xs text-gray-500">Updated {updatedAgo}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Oracle NAV</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono text-sm">{formatNAV(nav || BigInt(0))}</span>
                  <span className={cn("text-xs font-medium flex items-center gap-0.5", navChange >= 0 ? "text-green-400" : "text-red-400")}>
                    {navChange >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {navChange >= 0 ? "+" : ""}{navChange.toFixed(3)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Market Price</span>
                <span className="text-white font-mono text-sm">${marketPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Deviation</span>
                <span className={cn("font-mono text-sm", Math.abs(deviation) < 0.1 ? "text-green-400" : Math.abs(deviation) < 0.3 ? "text-yellow-400" : "text-red-400")}>
                  {deviation >= 0 ? "+" : ""}{deviation.toFixed(3)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Dynamic Fee</span>
                <span className="text-white font-mono text-sm">{feePercent.toFixed(2)}%</span>
              </div>
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Upper Bound</span>
                  <span className="text-white font-mono text-sm">{poolState ? formatNAV(poolState.upperBound) : "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Lower Bound</span>
                  <span className="text-white font-mono text-sm">{poolState ? formatNAV(poolState.lowerBound) : "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proof of Reserve */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">Proof of Reserve</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Reserve Ratio</span>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono font-semibold", reservePercent >= 99 ? "text-green-400" : reservePercent >= 98 ? "text-yellow-400" : "text-red-400")}>
                    {reservePercent.toFixed(1)}%
                  </span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", reserveStatusColor)}>
                    • {reserveStatus}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={cn("h-2.5 rounded-full transition-all", reservePercent >= 99 ? "bg-green-500" : reservePercent >= 98 ? "bg-yellow-500" : "bg-red-500")}
                  style={{ width: `${Math.min(reservePercent, 100)}%` }}
                />
              </div>
              {isStale && <p className="text-xs text-yellow-400">Oracle data is stale</p>}
            </div>
          </div>

          {/* Pool Reserves */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">Pool Reserves</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold text-xs">B</div>
                  <span className="text-gray-300 text-sm">mBUILD</span>
                </div>
                <span className="text-white font-mono text-sm">{poolState ? formatRWA(poolState.reserveRWA) : "0"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">$</div>
                  <span className="text-gray-300 text-sm">USDC</span>
                </div>
                <span className="text-white font-mono text-sm">{poolState ? formatUSDC(poolState.reserveUSDC) : "0"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, gradient, iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div className={cn("bg-gradient-to-br rounded-2xl border border-gray-800 p-5", gradient)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", iconBg)}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-semibold text-white font-mono">{value}</p>
    </div>
  );
}
