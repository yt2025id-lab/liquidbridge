"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACTS, ABIS } from "@/lib/contracts";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { usePool } from "@/hooks/usePool";
import { formatUSDC, formatRWA } from "@/lib/utils";
import { Plus, Minus, Loader2 } from "lucide-react";

export function LiquidityManager() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"add" | "remove">("add");
  const [rwaAmount, setRwaAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [removePercent, setRemovePercent] = useState(50);
  const { usdcBalance, rwaBalance, lpBalance, refetch } = useTokenBalances();
  const { poolState } = usePool();

  // Approve + Add Liquidity
  const { writeContract: approveRwa, data: approveRwaHash, isPending: approvingRwa } = useWriteContract();
  const { isLoading: confirmingApproveRwa } = useWaitForTransactionReceipt({ hash: approveRwaHash });

  const { writeContract: approveUsdc, data: approveUsdcHash, isPending: approvingUsdc } = useWriteContract();
  const { isLoading: confirmingApproveUsdc } = useWaitForTransactionReceipt({ hash: approveUsdcHash });

  const { writeContract: addLiq, data: addLiqHash, isPending: addingLiq } = useWriteContract();
  const { isLoading: confirmingAddLiq, isSuccess: addLiqSuccess } = useWaitForTransactionReceipt({ hash: addLiqHash });

  const { writeContract: removeLiq, data: removeLiqHash, isPending: removingLiq } = useWriteContract();
  const { isLoading: confirmingRemoveLiq, isSuccess: removeLiqSuccess } = useWaitForTransactionReceipt({ hash: removeLiqHash });

  if (addLiqSuccess || removeLiqSuccess) {
    refetch();
  }

  const handleAddLiquidity = async () => {
    if (!rwaAmount || !usdcAmount) return;
    const rwa = parseUnits(rwaAmount, 18);
    const usdc = parseUnits(usdcAmount, 6);

    // Approve both tokens
    approveRwa({
      address: CONTRACTS.mockRWAToken,
      abi: ABIS.rwaToken,
      functionName: "approve",
      args: [CONTRACTS.pool, rwa],
    });
    approveUsdc({
      address: CONTRACTS.mockUSDC,
      abi: ABIS.usdc,
      functionName: "approve",
      args: [CONTRACTS.pool, usdc],
    });
  };

  const handleAddLiquidityAfterApproval = () => {
    if (!rwaAmount || !usdcAmount) return;
    const rwa = parseUnits(rwaAmount, 18);
    const usdc = parseUnits(usdcAmount, 6);

    addLiq({
      address: CONTRACTS.pool,
      abi: ABIS.pool,
      functionName: "addLiquidity",
      args: [rwa, usdc],
    });
  };

  const handleRemoveLiquidity = () => {
    if (!lpBalance || lpBalance === BigInt(0)) return;
    const amount = (lpBalance * BigInt(removePercent)) / BigInt(100);

    removeLiq({
      address: CONTRACTS.pool,
      abi: ABIS.pool,
      functionName: "removeLiquidity",
      args: [amount],
    });
  };

  const isLoading = approvingRwa || confirmingApproveRwa || approvingUsdc || confirmingApproveUsdc || addingLiq || confirmingAddLiq || removingLiq || confirmingRemoveLiq;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("add")}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${
              tab === "add"
                ? "bg-teal-500/20 text-teal-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Plus size={14} className="inline mr-1" />
            Add Liquidity
          </button>
          <button
            onClick={() => setTab("remove")}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${
              tab === "remove"
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Minus size={14} className="inline mr-1" />
            Remove
          </button>
        </div>

        {tab === "add" ? (
          <div className="space-y-4">
            {/* mBUILD Input */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">mBUILD</span>
                <span className="text-xs text-gray-500">
                  Balance: {rwaBalance ? formatRWA(rwaBalance) : "0"}
                </span>
              </div>
              <input
                type="number"
                value={rwaAmount}
                onChange={(e) => setRwaAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-xl text-white outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* USDC Input */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">USDC</span>
                <span className="text-xs text-gray-500">
                  Balance: {usdcBalance ? formatUSDC(usdcBalance) : "0"}
                </span>
              </div>
              <input
                type="number"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-xl text-white outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <button
              onClick={handleAddLiquidityAfterApproval}
              disabled={!rwaAmount || !usdcAmount || isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold hover:from-teal-600 hover:to-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Processing..." : "Add Liquidity"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Make sure to approve both tokens first via the swap page or
              directly
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Your LP Balance</p>
              <p className="text-2xl font-bold text-white font-mono">
                {lpBalance ? formatRWA(lpBalance) : "0.0000"} lbLP
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Remove Amount</span>
                <span className="text-sm text-white font-mono">
                  {removePercent}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={removePercent}
                onChange={(e) => setRemovePercent(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between mt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRemovePercent(pct)}
                    className="text-xs text-gray-500 hover:text-white transition"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRemoveLiquidity}
              disabled={!lpBalance || lpBalance === BigInt(0) || isLoading}
              className="w-full py-4 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Processing..." : "Remove Liquidity"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
