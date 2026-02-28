"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { CONTRACTS, ABIS } from "@/lib/contracts";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatUSDC, formatRWA } from "@/lib/utils";
import { Plus, Minus, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export function LiquidityManager() {
  const { address } = useAccount();
  const [tab, setTab] = useState<"add" | "remove">("add");
  const [rwaAmount, setRwaAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [removePercent, setRemovePercent] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const { usdcBalance, rwaBalance, lpBalance, refetch } = useTokenBalances();

  // Check allowances
  const { data: rwaAllowance, refetch: refetchRwaAllowance } = useReadContract({
    address: CONTRACTS.mockRWAToken,
    abi: ABIS.rwaToken,
    functionName: "allowance",
    args: [address!, CONTRACTS.pool],
    query: { enabled: !!address },
  });

  const { data: usdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: ABIS.usdc,
    functionName: "allowance",
    args: [address!, CONTRACTS.pool],
    query: { enabled: !!address },
  });

  // Approve RWA
  const { writeContract: approveRwa, data: approveRwaHash, isPending: approvingRwa, error: approveRwaError } = useWriteContract();
  const { isLoading: confirmingApproveRwa, isSuccess: approveRwaSuccess } = useWaitForTransactionReceipt({ hash: approveRwaHash });

  // Approve USDC
  const { writeContract: approveUsdc, data: approveUsdcHash, isPending: approvingUsdc, error: approveUsdcError } = useWriteContract();
  const { isLoading: confirmingApproveUsdc, isSuccess: approveUsdcSuccess } = useWaitForTransactionReceipt({ hash: approveUsdcHash });

  // Add Liquidity
  const { writeContract: addLiq, data: addLiqHash, isPending: addingLiq, error: addLiqError } = useWriteContract();
  const { isLoading: confirmingAddLiq, isSuccess: addLiqSuccess } = useWaitForTransactionReceipt({ hash: addLiqHash });

  // Remove Liquidity
  const { writeContract: removeLiq, data: removeLiqHash, isPending: removingLiq, error: removeLiqError } = useWriteContract();
  const { isLoading: confirmingRemoveLiq, isSuccess: removeLiqSuccess } = useWaitForTransactionReceipt({ hash: removeLiqHash });

  // Parsed amounts
  const parsedRwa = rwaAmount ? parseUnits(rwaAmount, 18) : BigInt(0);
  const parsedUsdc = usdcAmount ? parseUnits(usdcAmount, 6) : BigInt(0);

  const needsRwaApproval = rwaAllowance !== undefined && parsedRwa > BigInt(0) && parsedRwa > (rwaAllowance as bigint);
  const needsUsdcApproval = usdcAllowance !== undefined && parsedUsdc > BigInt(0) && parsedUsdc > (usdcAllowance as bigint);

  // Refetch allowances after approval
  useEffect(() => {
    if (approveRwaSuccess) refetchRwaAllowance();
  }, [approveRwaSuccess, refetchRwaAllowance]);

  useEffect(() => {
    if (approveUsdcSuccess) refetchUsdcAllowance();
  }, [approveUsdcSuccess, refetchUsdcAllowance]);

  // Refetch balances after add/remove
  useEffect(() => {
    if (addLiqSuccess || removeLiqSuccess) {
      refetch();
      if (addLiqSuccess) {
        setRwaAmount("");
        setUsdcAmount("");
      }
    }
  }, [addLiqSuccess, removeLiqSuccess, refetch]);

  // Track errors
  useEffect(() => {
    const err = approveRwaError || approveUsdcError || addLiqError || removeLiqError;
    if (err) {
      const message = (err as Error).message || "Transaction failed";
      if (message.includes("User rejected")) {
        setError("Transaction rejected by user");
      } else if (message.includes("insufficient") || message.includes("Insufficient")) {
        setError("Insufficient balance");
      } else if (message.includes("not compliant")) {
        setError("KYC verification required. Go to Portfolio to verify.");
      } else {
        setError(message.length > 100 ? message.slice(0, 100) + "..." : message);
      }
    }
  }, [approveRwaError, approveUsdcError, addLiqError, removeLiqError]);

  const handleApproveRwa = () => {
    setError(null);
    approveRwa({
      address: CONTRACTS.mockRWAToken,
      abi: ABIS.rwaToken,
      functionName: "approve",
      args: [CONTRACTS.pool, maxUint256],
    });
  };

  const handleApproveUsdc = () => {
    setError(null);
    approveUsdc({
      address: CONTRACTS.mockUSDC,
      abi: ABIS.usdc,
      functionName: "approve",
      args: [CONTRACTS.pool, maxUint256],
    });
  };

  const handleAddLiquidity = () => {
    if (!rwaAmount || !usdcAmount) return;
    setError(null);
    addLiq({
      address: CONTRACTS.pool,
      abi: ABIS.pool,
      functionName: "addLiquidity",
      args: [parsedRwa, parsedUsdc],
    });
  };

  const handleRemoveLiquidity = () => {
    if (!lpBalance || lpBalance === BigInt(0)) return;
    setError(null);
    const amount = (lpBalance * BigInt(removePercent)) / BigInt(100);
    removeLiq({
      address: CONTRACTS.pool,
      abi: ABIS.pool,
      functionName: "removeLiquidity",
      args: [amount],
    });
  };

  const isLoading = approvingRwa || confirmingApproveRwa || approvingUsdc || confirmingApproveUsdc || addingLiq || confirmingAddLiq || removingLiq || confirmingRemoveLiq;

  // Render the correct action button based on approval state
  const renderAddButton = () => {
    if (!rwaAmount || !usdcAmount || parsedRwa === BigInt(0) || parsedUsdc === BigInt(0)) {
      return (
        <button disabled className="w-full py-4 rounded-xl bg-gray-700 text-gray-400 font-semibold">
          Enter Amounts
        </button>
      );
    }

    if (needsRwaApproval && !approveRwaSuccess) {
      return (
        <button
          onClick={handleApproveRwa}
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-teal-500/20 text-teal-400 font-semibold hover:bg-teal-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(approvingRwa || confirmingApproveRwa) && <Loader2 size={18} className="animate-spin" />}
          {approvingRwa ? "Approving..." : confirmingApproveRwa ? "Confirming..." : "Step 1: Approve mBUILD"}
        </button>
      );
    }

    if (needsUsdcApproval && !approveUsdcSuccess) {
      return (
        <button
          onClick={handleApproveUsdc}
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-teal-500/20 text-teal-400 font-semibold hover:bg-teal-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(approvingUsdc || confirmingApproveUsdc) && <Loader2 size={18} className="animate-spin" />}
          {approvingUsdc ? "Approving..." : confirmingApproveUsdc ? "Confirming..." : "Step 2: Approve USDC"}
        </button>
      );
    }

    return (
      <button
        onClick={handleAddLiquidity}
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold hover:from-teal-600 hover:to-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {(addingLiq || confirmingAddLiq) && <Loader2 size={18} className="animate-spin" />}
        {addingLiq ? "Adding..." : confirmingAddLiq ? "Confirming..." : "Add Liquidity"}
      </button>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setTab("add"); setError(null); }}
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
            onClick={() => { setTab("remove"); setError(null); }}
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 shrink-0">
              ✕
            </button>
          </div>
        )}

        {/* Success Display */}
        {addLiqSuccess && tab === "add" && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            Liquidity added successfully!
          </div>
        )}
        {removeLiqSuccess && tab === "remove" && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            Liquidity removed successfully!
          </div>
        )}

        {tab === "add" ? (
          <div className="space-y-4">
            {/* Approval Status Chips */}
            {rwaAmount && usdcAmount && parsedRwa > BigInt(0) && parsedUsdc > BigInt(0) && (
              <div className="flex gap-2 text-xs">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  !needsRwaApproval || approveRwaSuccess ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-500"
                }`}>
                  {(!needsRwaApproval || approveRwaSuccess) && <CheckCircle size={10} />}
                  mBUILD {!needsRwaApproval || approveRwaSuccess ? "Approved" : "Pending"}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  !needsUsdcApproval || approveUsdcSuccess ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-500"
                }`}>
                  {(!needsUsdcApproval || approveUsdcSuccess) && <CheckCircle size={10} />}
                  USDC {!needsUsdcApproval || approveUsdcSuccess ? "Approved" : "Pending"}
                </span>
              </div>
            )}

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
                onChange={(e) => { setRwaAmount(e.target.value); setError(null); }}
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
                onChange={(e) => { setUsdcAmount(e.target.value); setError(null); }}
                placeholder="0.00"
                className="w-full bg-transparent text-xl text-white outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {renderAddButton()}
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
              {(removingLiq || confirmingRemoveLiq) && <Loader2 size={18} className="animate-spin" />}
              {removingLiq ? "Removing..." : confirmingRemoveLiq ? "Confirming..." : "Remove Liquidity"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
