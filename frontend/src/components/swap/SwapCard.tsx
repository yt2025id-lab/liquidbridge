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
import { formatNAV, cn } from "@/lib/utils";
import { usePool } from "@/hooks/usePool";
import { useNAV } from "@/hooks/useNAV";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useCompliance } from "@/hooks/useCompliance";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";

type Tab = "buy" | "sell";

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const { poolState, currentFee } = usePool();
  const { nav, reserveRatio, isStale } = useNAV();
  const { usdcBalance, rwaBalance, refetch: refetchBalances } = useTokenBalances();
  const { isCompliant, selfWhitelist, isWhitelisting } = useCompliance();

  const [tab, setTab] = useState<Tab>("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [quoteResult, setQuoteResult] = useState<{ amountOut: bigint; fee: bigint } | null>(null);

  // buy = USDC → mBUILD, sell = mBUILD → USDC
  const isBuy = tab === "buy";
  const tokenIn = isBuy ? CONTRACTS.mockUSDC : CONTRACTS.mockRWAToken;
  const tokenInDecimals = isBuy ? 6 : 18;
  const tokenOutDecimals = isBuy ? 18 : 6;
  const balance = isBuy ? usdcBalance : rwaBalance;

  const parsedAmount = inputAmount ? parseUnits(inputAmount, tokenInDecimals) : BigInt(0);

  const { data: quote } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "getAmountOut",
    args: [tokenIn, parsedAmount],
    query: { enabled: parsedAmount > BigInt(0), refetchInterval: 5000 },
  });

  useEffect(() => {
    if (quote) {
      const [amountOut, fee] = quote as [bigint, bigint];
      setQuoteResult({ amountOut, fee });
    } else {
      setQuoteResult(null);
    }
  }, [quote]);

  const { data: allowance } = useReadContract({
    address: isBuy ? CONTRACTS.mockUSDC : CONTRACTS.mockRWAToken,
    abi: isBuy ? ABIS.usdc : ABIS.rwaToken,
    functionName: "allowance",
    args: [address!, CONTRACTS.pool],
    query: { enabled: !!address },
  });
  const needsApproval = allowance !== undefined && parsedAmount > (allowance as bigint);

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: swap, data: swapHash, isPending: isSwapping } = useWriteContract();
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
      address: isBuy ? CONTRACTS.mockUSDC : CONTRACTS.mockRWAToken,
      abi: isBuy ? ABIS.usdc : ABIS.rwaToken,
      functionName: "approve",
      args: [CONTRACTS.pool, parsedAmount],
    });
  };

  const handleSwap = () => {
    if (!quoteResult || !address) return;
    const minOut = (quoteResult.amountOut * BigInt(995)) / BigInt(1000);
    swap({
      address: CONTRACTS.pool,
      abi: ABIS.pool,
      functionName: "swap",
      args: [tokenIn, parsedAmount, minOut, address],
    });
  };

  const navPrice = nav ? Number(nav) / 1e6 : 0;
  const feePercent = currentFee ? Number(currentFee) / 100 : 0.05;
  const reservePercent = reserveRatio ? Number(reserveRatio) / 100 : 0;
  const isLoading = isApproving || isApproveConfirming || isSwapping || isSwapConfirming;

  const balanceFormatted =
    balance !== undefined
      ? Number(formatUnits(balance, tokenInDecimals)).toFixed(isBuy ? 2 : 4)
      : "—";

  const outputFormatted = quoteResult
    ? Number(formatUnits(quoteResult.amountOut, tokenOutDecimals)).toFixed(isBuy ? 4 : 2)
    : "—";

  // unused var suppression
  void formatNAV;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

        {/* Buy / Sell Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setTab("buy"); setInputAmount(""); }}
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold transition-all",
              tab === "buy"
                ? "text-teal-700 border-b-2 border-teal-600 bg-teal-50/50"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Buy BUIDL
          </button>
          <button
            onClick={() => { setTab("sell"); setInputAmount(""); }}
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold transition-all",
              tab === "sell"
                ? "text-rose-600 border-b-2 border-rose-500 bg-rose-50/50"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Sell BUIDL
          </button>
        </div>

        <div className="p-6">
          {/* Circuit Breaker */}
          {poolState?.circuitBreakerActive && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              Trading is temporarily paused. Please try again later.
            </div>
          )}

          {/* Stale Oracle */}
          {isStale && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              Price data is being refreshed. Please wait a moment.
            </div>
          )}

          {/* You Pay */}
          <div className="mb-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                You Pay
              </span>
              {balance !== undefined && (
                <button
                  onClick={() => setInputAmount(formatUnits(balance, tokenInDecimals))}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Balance: {balanceFormatted}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-teal-400 transition-colors">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white",
                  isBuy ? "bg-emerald-500" : "bg-blue-500"
                )}
              >
                {isBuy ? "$" : "B"}
              </div>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-xl font-semibold text-slate-900 outline-none placeholder-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-slate-600 font-semibold text-sm">
                {isBuy ? "USDC" : "BUIDL"}
              </span>
            </div>
          </div>

          {/* Arrow divider */}
          <div className="flex justify-center my-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
              ↓
            </div>
          </div>

          {/* You Receive */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                You Receive
              </span>
              <span className="text-xs text-slate-400">Estimated</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white",
                  isBuy ? "bg-blue-500" : "bg-emerald-500"
                )}
              >
                {isBuy ? "B" : "$"}
              </div>
              <span className="flex-1 text-xl font-semibold text-slate-900">
                {quoteResult ? outputFormatted : <span className="text-slate-300">0.00</span>}
              </span>
              <span className="text-slate-600 font-semibold text-sm">
                {isBuy ? "BUIDL" : "USDC"}
              </span>
            </div>
          </div>

          {/* Price Details */}
          {navPrice > 0 && (
            <div className="mb-5 bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500">Current price</span>
                <span className="font-semibold text-slate-800">
                  ${navPrice.toFixed(2)} per BUIDL
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500">Platform fee</span>
                <span className="font-medium text-slate-700">{feePercent.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500">Fund health</span>
                <span
                  className={cn(
                    "font-medium flex items-center gap-1",
                    reservePercent >= 99
                      ? "text-emerald-600"
                      : reservePercent >= 98
                      ? "text-amber-600"
                      : "text-red-500"
                  )}
                >
                  {reservePercent >= 98 && <CheckCircle size={13} />}
                  {reservePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* KYC Notice */}
          {isConnected && !isCompliant && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-semibold">Identity verification required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Securities regulations require a one-time check before trading.
                  </p>
                </div>
              </div>
              <button
                onClick={selfWhitelist}
                disabled={isWhitelisting}
                className="mt-2.5 w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2"
              >
                {isWhitelisting && <Loader2 size={14} className="animate-spin" />}
                {isWhitelisting ? "Verifying..." : "Verify Identity (Free)"}
              </button>
            </div>
          )}

          {/* Success */}
          {swapSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle size={15} />
              {isBuy ? "Purchase" : "Sale"} complete! Your balance has been updated.
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <div className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm text-center">
              Connect your wallet to trade
            </div>
          ) : !isCompliant ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm"
            >
              Verify identity to continue
            </button>
          ) : poolState?.circuitBreakerActive ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-red-50 text-red-400 font-semibold text-sm"
            >
              Trading paused
            </button>
          ) : !inputAmount || parsedAmount === BigInt(0) ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm"
            >
              Enter an amount
            </button>
          ) : needsApproval && !approveSuccess ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              {(isApproving || isApproveConfirming) && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {isApproving
                ? "Waiting for approval..."
                : isApproveConfirming
                ? "Confirming..."
                : "Approve to continue"}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !quoteResult}
              className={cn(
                "w-full py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-white text-base",
                tab === "buy"
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-rose-500 hover:bg-rose-600"
              )}
            >
              {(isSwapping || isSwapConfirming) && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {isSwapping
                ? "Processing..."
                : isSwapConfirming
                ? "Confirming on chain..."
                : tab === "buy"
                ? "Buy BUIDL"
                : "Sell BUIDL"}
            </button>
          )}

          <p className="text-center text-xs text-slate-400 mt-4">
            ⛓ Price updated every 60s by Chainlink · 0.5% slippage protection
          </p>
        </div>
      </div>
    </div>
  );
}
