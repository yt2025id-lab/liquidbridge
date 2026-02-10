"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACTS, ABIS } from "@/lib/contracts";
import { formatUSDC, formatNAV, cn } from "@/lib/utils";
import { usePool } from "@/hooks/usePool";
import { useNAV } from "@/hooks/useNAV";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useCompliance } from "@/hooks/useCompliance";
import { ArrowDownUp, Shield, AlertTriangle, Loader2 } from "lucide-react";

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const { poolState, currentFee } = usePool();
  const { nav, reserveRatio, isStale } = useNAV();
  const { usdcBalance, rwaBalance, refetch: refetchBalances } = useTokenBalances();
  const { isCompliant, selfWhitelist, isWhitelisting } = useCompliance();

  const [isRwaToUsdc, setIsRwaToUsdc] = useState(true);
  const [inputAmount, setInputAmount] = useState("");
  const [quoteResult, setQuoteResult] = useState<{
    amountOut: bigint;
    fee: bigint;
  } | null>(null);

  const tokenIn = isRwaToUsdc ? CONTRACTS.mockRWAToken : CONTRACTS.mockUSDC;
  const tokenInSymbol = isRwaToUsdc ? "mBUILD" : "USDC";
  const tokenOutSymbol = isRwaToUsdc ? "USDC" : "mBUILD";
  const tokenInDecimals = isRwaToUsdc ? 18 : 6;
  const tokenOutDecimals = isRwaToUsdc ? 6 : 18;
  const balance = isRwaToUsdc ? rwaBalance : usdcBalance;

  const parsedAmount = inputAmount
    ? parseUnits(inputAmount, tokenInDecimals)
    : BigInt(0);

  // Get quote
  const { data: quote } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "getAmountOut",
    args: [tokenIn, parsedAmount],
    query: {
      enabled: parsedAmount > BigInt(0),
      refetchInterval: 5000,
    },
  });

  useEffect(() => {
    if (quote) {
      const [amountOut, fee] = quote as [bigint, bigint];
      setQuoteResult({ amountOut, fee });
    } else {
      setQuoteResult(null);
    }
  }, [quote]);

  // Check allowance
  const { data: allowance } = useReadContract({
    address: isRwaToUsdc ? CONTRACTS.mockRWAToken : CONTRACTS.mockUSDC,
    abi: isRwaToUsdc ? ABIS.rwaToken : ABIS.usdc,
    functionName: "allowance",
    args: [address!, CONTRACTS.pool],
    query: { enabled: !!address },
  });

  const needsApproval =
    allowance !== undefined && parsedAmount > (allowance as bigint);

  // Approve
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
  } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Swap
  const {
    writeContract: swap,
    data: swapHash,
    isPending: isSwapping,
  } = useWriteContract();
  const { isLoading: isSwapConfirming, isSuccess: swapSuccess } =
    useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (swapSuccess) {
      setInputAmount("");
      refetchBalances();
    }
  }, [swapSuccess, refetchBalances]);

  const handleApprove = () => {
    approve({
      address: isRwaToUsdc ? CONTRACTS.mockRWAToken : CONTRACTS.mockUSDC,
      abi: isRwaToUsdc ? ABIS.rwaToken : ABIS.usdc,
      functionName: "approve",
      args: [CONTRACTS.pool, parsedAmount],
    });
  };

  const handleSwap = () => {
    if (!quoteResult) return;
    const minOut = (quoteResult.amountOut * BigInt(995)) / BigInt(1000); // 0.5% slippage
    swap({
      address: CONTRACTS.pool,
      abi: ABIS.pool,
      functionName: "swap",
      args: [tokenIn, parsedAmount, minOut, address!],
    });
  };

  const navPrice = nav ? Number(nav) / 1e6 : 0;
  const feePercent = currentFee ? Number(currentFee) / 100 : 0;
  const reservePercent = reserveRatio ? Number(reserveRatio) / 100 : 0;

  const isLoading = isApproving || isApproveConfirming || isSwapping || isSwapConfirming;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Swap</h2>
          <div className="flex items-center gap-2">
            {isCompliant ? (
              <span className="flex items-center gap-1 text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full">
                <Shield size={12} /> Verified
              </span>
            ) : isConnected ? (
              <button
                onClick={selfWhitelist}
                disabled={isWhitelisting}
                className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full hover:bg-yellow-400/20 transition"
              >
                {isWhitelisting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <AlertTriangle size={12} />
                )}
                {isWhitelisting ? "Verifying..." : "Verify KYC"}
              </button>
            ) : null}
          </div>
        </div>

        {/* Circuit Breaker Warning */}
        {poolState?.circuitBreakerActive && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            Circuit breaker active - Trading paused
          </div>
        )}

        {/* From Token */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            {balance !== undefined && (
              <button
                onClick={() =>
                  setInputAmount(formatUnits(balance, tokenInDecimals))
                }
                className="text-xs text-gray-400 hover:text-teal-400 transition"
              >
                Balance: {Number(formatUnits(balance, tokenInDecimals)).toFixed(tokenInDecimals === 6 ? 2 : 4)}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl text-white outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-xl">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isRwaToUsdc
                    ? "bg-blue-500 text-white"
                    : "bg-green-500 text-white"
                )}
              >
                {isRwaToUsdc ? "B" : "$"}
              </div>
              <span className="text-white font-medium">{tokenInSymbol}</span>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={() => {
              setIsRwaToUsdc(!isRwaToUsdc);
              setInputAmount("");
            }}
            className="bg-gray-800 border-4 border-gray-900 rounded-xl p-2 hover:bg-gray-700 transition text-gray-400 hover:text-teal-400"
          >
            <ArrowDownUp size={18} />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">To (estimated)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-1 text-2xl text-white">
              {quoteResult
                ? Number(
                    formatUnits(quoteResult.amountOut, tokenOutDecimals)
                  ).toFixed(tokenOutDecimals === 6 ? 2 : 4)
                : "0.00"}
            </span>
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-xl">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  !isRwaToUsdc
                    ? "bg-blue-500 text-white"
                    : "bg-green-500 text-white"
                )}
              >
                {!isRwaToUsdc ? "B" : "$"}
              </div>
              <span className="text-white font-medium">{tokenOutSymbol}</span>
            </div>
          </div>
        </div>

        {/* Price Info */}
        {parsedAmount > BigInt(0) && (
          <div className="mt-4 p-3 bg-gray-800/30 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Oracle NAV</span>
              <span className="text-white font-mono">
                {formatNAV(nav || BigInt(0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dynamic Fee</span>
              <span className="text-teal-400 font-mono">
                {feePercent.toFixed(2)}%
              </span>
            </div>
            {quoteResult && (
              <div className="flex justify-between">
                <span className="text-gray-400">Fee Amount</span>
                <span className="text-gray-300 font-mono">
                  {isRwaToUsdc
                    ? `$${formatUSDC(quoteResult.fee)}`
                    : `${Number(formatUnits(quoteResult.fee, 18)).toFixed(4)} mBUILD`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Reserve Ratio</span>
              <span
                className={cn(
                  "font-mono",
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
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          {!isConnected ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-gray-700 text-gray-400 font-semibold text-lg"
            >
              Connect Wallet
            </button>
          ) : !isCompliant ? (
            <button
              onClick={selfWhitelist}
              disabled={isWhitelisting}
              className="w-full py-4 rounded-xl bg-yellow-500/20 text-yellow-400 font-semibold text-lg hover:bg-yellow-500/30 transition flex items-center justify-center gap-2"
            >
              {isWhitelisting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Shield size={20} />
              )}
              {isWhitelisting ? "Verifying..." : "Complete KYC Verification"}
            </button>
          ) : poolState?.circuitBreakerActive ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-red-500/20 text-red-400 font-semibold text-lg"
            >
              Circuit Breaker Active
            </button>
          ) : !inputAmount || parsedAmount === BigInt(0) ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-gray-700 text-gray-400 font-semibold text-lg"
            >
              Enter Amount
            </button>
          ) : needsApproval && !approveSuccess ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-teal-500/20 text-teal-400 font-semibold text-lg hover:bg-teal-500/30 transition flex items-center justify-center gap-2"
            >
              {isApproving || isApproveConfirming ? (
                <Loader2 size={20} className="animate-spin" />
              ) : null}
              {isApproving
                ? "Approving..."
                : isApproveConfirming
                ? "Confirming..."
                : `Approve ${tokenInSymbol}`}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold text-lg hover:from-teal-600 hover:to-blue-600 transition flex items-center justify-center gap-2"
            >
              {isSwapping || isSwapConfirming ? (
                <Loader2 size={20} className="animate-spin" />
              ) : null}
              {isSwapping
                ? "Swapping..."
                : isSwapConfirming
                ? "Confirming..."
                : `Swap ${tokenInSymbol} → ${tokenOutSymbol}`}
            </button>
          )}
        </div>

        {/* Powered By */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Powered by Chainlink CRE + NAVLink
        </p>
      </div>
    </div>
  );
}
