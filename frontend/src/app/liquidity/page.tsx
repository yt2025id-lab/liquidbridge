"use client";

import { LiquidityManager } from "@/components/liquidity/LiquidityManager";
import { usePool } from "@/hooks/usePool";
import { useNAV } from "@/hooks/useNAV";
import { Shield, TrendingUp } from "lucide-react";

export default function LiquidityPage() {
  const { poolState, totalFees, swapCount } = usePool();
  const { nav, reserveRatio } = useNAV();

  const navPrice = nav ? Number(nav) / 1e6 : 100;
  const tvl = poolState
    ? Number(poolState.reserveUSDC) / 1e6 + (Number(poolState.reserveRWA) / 1e18) * navPrice
    : 2000000;
  const reservePercent = reserveRatio ? Number(reserveRatio) / 100 : 99.6;
  const currentFeePercent = poolState ? Number(poolState.baseFee) / 100 : 0.05;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Earn Rewards</h1>
        <p className="text-gray-400">
          Provide liquidity to the BUIDL/USDC pool and earn platform fees
        </p>
      </div>

      {/* Pool Info Card */}
      <div className="bg-gray-900 rounded-2xl border border-teal-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-900">B</div>
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-900">$</div>
            </div>
            <div>
              <p className="text-white font-semibold">BUIDL/USDC Pool</p>
              <p className="text-xs text-gray-500">LiquidBridge · Chainlink Oracle</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">
            <Shield size={11} />
            KYC Required
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Value Locked</p>
            <p className="text-white font-semibold font-mono">
              ${tvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">APY</p>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} className="text-teal-400" />
              <p className="text-teal-400 font-semibold">Variable</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Fee</p>
            <p className="text-white font-semibold font-mono">{currentFeePercent.toFixed(2)}%</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Swaps: <span className="text-white">{swapCount?.toString() || "0"}</span></span>
            <span>Fees Earned: <span className="text-white">${totalFees ? (Number(totalFees) / 1e6).toFixed(2) : "0.00"}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${reservePercent >= 99 ? "bg-green-400" : reservePercent >= 98 ? "bg-yellow-400" : "bg-red-400"}`} />
            <span className={`text-xs font-medium ${reservePercent >= 99 ? "text-green-400" : reservePercent >= 98 ? "text-yellow-400" : "text-red-400"}`}>
              {reservePercent.toFixed(1)}% Reserve
            </span>
          </div>
        </div>
      </div>

      <LiquidityManager />
    </div>
  );
}
