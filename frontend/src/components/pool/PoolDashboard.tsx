"use client";

import { usePool } from "@/hooks/usePool";
import { useNAV } from "@/hooks/useNAV";
import { formatUSDC, formatRWA, formatNAV, cn } from "@/lib/utils";
import { NAVChart } from "./NAVChart";
import { Activity, DollarSign, BarChart3, Shield, AlertTriangle } from "lucide-react";

export function PoolDashboard() {
  const { poolState, totalVolume, totalFees, swapCount, currentFee, impliedPrice } = usePool();
  const { nav, reserveRatio, isStale, history } = useNAV();

  const navPrice = nav ? Number(nav) / 1e6 : 0;
  const marketPrice = impliedPrice ? Number(impliedPrice) / 1e6 : 0;
  const deviation = navPrice > 0 ? ((marketPrice - navPrice) / navPrice) * 100 : 0;
  const reservePercent = reserveRatio ? Number(reserveRatio) / 100 : 0;
  const feePercent = currentFee ? Number(currentFee) / 100 : 0;

  const tvl = poolState
    ? Number(poolState.reserveUSDC) / 1e6 +
      (Number(poolState.reserveRWA) / 1e18) * navPrice
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Circuit Breaker Alert */}
      {poolState?.circuitBreakerActive && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <p className="font-semibold">Circuit Breaker Active</p>
            <p className="text-sm opacity-80">
              Trading is paused due to reserve ratio falling below 98%
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={20} />}
          label="Total Value Locked"
          value={`$${tvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          color="teal"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="24h Volume"
          value={`$${totalVolume ? formatUSDC(totalVolume) : "0.00"}`}
          color="blue"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Total Swaps"
          value={swapCount?.toString() || "0"}
          color="purple"
        />
        <StatCard
          icon={<Shield size={20} />}
          label="Total Fees"
          value={`$${totalFees ? formatUSDC(totalFees) : "0.00"}`}
          color="amber"
        />
      </div>

      {/* NAV Chart + Price Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            NAV vs Market Price
          </h3>
          <NAVChart history={history} />
        </div>

        <div className="space-y-4">
          {/* Price Card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Price Information
            </h3>
            <div className="space-y-3">
              <PriceRow label="Oracle NAV" value={formatNAV(nav || BigInt(0))} />
              <PriceRow
                label="Market Price"
                value={`$${marketPrice.toFixed(2)}`}
              />
              <PriceRow
                label="Deviation"
                value={`${deviation >= 0 ? "+" : ""}${deviation.toFixed(3)}%`}
                valueColor={
                  Math.abs(deviation) < 0.1
                    ? "text-green-400"
                    : Math.abs(deviation) < 0.3
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              />
              <PriceRow
                label="Dynamic Fee"
                value={`${feePercent.toFixed(2)}%`}
              />
              <div className="border-t border-gray-700 pt-3">
                <PriceRow
                  label="Upper Bound"
                  value={poolState ? formatNAV(poolState.upperBound) : "-"}
                />
                <PriceRow
                  label="Lower Bound"
                  value={poolState ? formatNAV(poolState.lowerBound) : "-"}
                />
              </div>
            </div>
          </div>

          {/* Reserve Card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Proof of Reserve
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Reserve Ratio</span>
                <span
                  className={cn(
                    "font-mono font-semibold",
                    reservePercent >= 99
                      ? "text-green-400"
                      : reservePercent >= 98
                      ? "text-yellow-400"
                      : "text-red-400"
                  )}
                >
                  {reservePercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className={cn(
                    "h-3 rounded-full transition-all",
                    reservePercent >= 99
                      ? "bg-green-500"
                      : reservePercent >= 98
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(reservePercent, 100)}%` }}
                />
              </div>
              {isStale && (
                <p className="text-xs text-yellow-400 mt-1">
                  Oracle data is stale
                </p>
              )}
            </div>
          </div>

          {/* Pool Reserves */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Pool Reserves
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">mBUILD</span>
                <span className="text-white font-mono">
                  {poolState ? formatRWA(poolState.reserveRWA) : "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">USDC</span>
                <span className="text-white font-mono">
                  {poolState ? formatUSDC(poolState.reserveUSDC) : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    teal: "text-teal-400 bg-teal-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    amber: "text-amber-400 bg-amber-400/10",
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          colorMap[color]
        )}
      >
        {icon}
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-white mt-1 font-mono">
        {value}
      </p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  valueColor = "text-white",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={cn("font-mono text-sm", valueColor)}>{value}</span>
    </div>
  );
}
