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
import { AlertTriangle, Loader2, CheckCircle, ArrowDown, Shield } from "lucide-react";

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
    : "";

  // suppress unused warning
  void formatNAV;

  const healthColor =
    reservePercent >= 99
      ? "var(--accent-green)"
      : reservePercent >= 98
      ? "var(--accent-yellow)"
      : "var(--accent-red)";

  return (
    <div className="w-full">
      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {/* Buy / Sell tab toggle */}
        <div className="p-4 pb-0">
          {/* Alerts */}
          {(poolState?.circuitBreakerActive || isStale) && (
            <div
              className="flex items-center gap-2 font-medium"
              style={{
                background: poolState?.circuitBreakerActive
                  ? "rgba(255,107,107,0.08)"
                  : "rgba(255,170,0,0.08)",
                color: poolState?.circuitBreakerActive ? "#CC3333" : "#996600",
                border: poolState?.circuitBreakerActive
                  ? "1px solid rgba(255,107,107,0.25)"
                  : "1px solid rgba(255,170,0,0.25)",
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={15} className="flex-shrink-0" />
              {poolState?.circuitBreakerActive
                ? "Trading is temporarily paused. Reserve ratio below threshold."
                : "Price data is being refreshed. Please wait a moment."}
            </div>
          )}
          <div
            className="flex p-1 rounded-full gap-1"
            style={{ background: "var(--surface-secondary)" }}
          >
            <button
              onClick={() => { setTab("buy"); setInputAmount(""); }}
              className="flex-1 py-2 rounded-full transition-all"
              style={{
                background: tab === "buy" ? "var(--bg-surface)" : "transparent",
                color: tab === "buy" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: tab === "buy" ? "var(--card-shadow)" : "none",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
              }}
            >
              Buy BUIDL
            </button>
            <button
              onClick={() => { setTab("sell"); setInputAmount(""); }}
              className="flex-1 py-2 rounded-full transition-all"
              style={{
                background: tab === "sell" ? "var(--bg-surface)" : "transparent",
                color: tab === "sell" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: tab === "sell" ? "var(--card-shadow)" : "none",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
              }}
            >
              Sell BUIDL
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* YOU PAY input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span
                className="font-bold uppercase"
                style={{ fontSize: 11, letterSpacing: "0.8px", color: "var(--text-secondary)" }}
              >
                You Pay
              </span>
              {balance !== undefined && (
                <button
                  onClick={() => setInputAmount(formatUnits(balance, tokenInDecimals))}
                  className="font-semibold transition-opacity hover:opacity-70"
                  style={{ fontSize: 12, color: "var(--accent-blue)" }}
                >
                  Balance: {balanceFormatted}
                </button>
              )}
            </div>
            <div
              className="flex items-center gap-3 px-4 rounded-xl transition-all"
              style={{
                background: "var(--bg-input)",
                border: "1.5px solid var(--border-strong)",
                padding: "14px 16px",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-blue)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-input-focus)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-input-focus)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-input)";
              }}
            >
              {/* Token avatar */}
              <div
                className="rounded-full flex items-center justify-center font-extrabold flex-shrink-0 text-white"
                style={{ width: 36, height: 36, fontSize: 13, background: isBuy ? "#2775CA" : "#1A2024" }}
              >
                {isBuy ? "$" : "B"}
              </div>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent outline-none"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  caretColor: "var(--accent-blue)",
                }}
              />
              <span className="font-bold flex-shrink-0" style={{ fontSize: 15, color: "var(--text-primary)" }}>
                {isBuy ? "USDC" : "mBUILD"}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 34,
                height: 34,
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border)",
                color: "var(--text-secondary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <ArrowDown size={14} strokeWidth={2.5} />
            </div>
          </div>

          {/* YOU RECEIVE */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span
                className="font-bold uppercase"
                style={{ fontSize: 11, letterSpacing: "0.8px", color: "var(--text-secondary)" }}
              >
                You Receive
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Estimated</span>
            </div>
            <div
              className="flex items-center gap-3 rounded-xl"
              style={{
                background: "var(--bg-input)",
                border: "1.5px solid var(--border-strong)",
                padding: "14px 16px",
              }}
            >
              <div
                className="rounded-full flex items-center justify-center font-extrabold flex-shrink-0 text-white"
                style={{ width: 36, height: 36, fontSize: 13, background: isBuy ? "#1A2024" : "#2775CA" }}
              >
                {isBuy ? "B" : "$"}
              </div>
              <span
                className="flex-1"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 22,
                  fontWeight: 500,
                  color: outputFormatted ? "var(--text-primary)" : "var(--text-placeholder)",
                }}
              >
                {outputFormatted || "0.00"}
              </span>
              <span className="font-bold flex-shrink-0" style={{ fontSize: 15, color: "var(--text-primary)" }}>
                {isBuy ? "mBUILD" : "USDC"}
              </span>
            </div>
          </div>

          {/* KYC Notice */}
          {isConnected && !isCompliant && (
            <div
              className="rounded-lg p-3.5"
              style={{
                background: "rgba(255,170,0,0.08)",
                border: "1px solid rgba(255,170,0,0.3)",
              }}
            >
              <div className="flex items-start gap-2 mb-2.5">
                <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#B37700" }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#B37700" }}>Identity verification required</p>
                  <p className="text-xs mt-0.5" style={{ color: "#B37700" }}>
                    Securities regulations require a one-time check before trading.
                  </p>
                </div>
              </div>
              <button
                onClick={selfWhitelist}
                disabled={isWhitelisting}
                className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
                style={{ background: "#FFAA00", color: "white" }}
              >
                {isWhitelisting && <Loader2 size={14} className="animate-spin" />}
                {isWhitelisting ? "Verifying..." : "Verify Identity (Free)"}
              </button>
            </div>
          )}

          {/* Success */}
          {swapSuccess && (
            <div
              className="rounded-lg px-4 py-3 flex items-center gap-2 text-sm font-medium"
              style={{
                background: "rgba(0,204,136,0.08)",
                border: "1px solid rgba(0,204,136,0.3)",
                color: "var(--accent-green)",
              }}
            >
              <CheckCircle size={15} />
              {isBuy ? "Purchase" : "Sale"} complete! Your balance has been updated.
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <div
              className="w-full text-center font-bold"
              style={{
                padding: "14px",
                borderRadius: 10,
                fontSize: 15,
                background: "var(--bg-input)",
                color: "var(--text-muted)",
                marginTop: 16,
              }}
            >
              Connect your wallet to trade
            </div>
          ) : !isCompliant ? (
            <button
              disabled
              className="w-full font-bold"
              style={{
                padding: "14px",
                borderRadius: 10,
                fontSize: 15,
                background: "var(--bg-input)",
                color: "var(--text-muted)",
                cursor: "not-allowed",
                border: "none",
                marginTop: 16,
              }}
            >
              Verify identity to continue
            </button>
          ) : poolState?.circuitBreakerActive ? (
            <button
              disabled
              className="w-full font-bold"
              style={{
                padding: "14px",
                borderRadius: 10,
                fontSize: 15,
                background: "rgba(255,107,107,0.1)",
                color: "var(--accent-red)",
                cursor: "not-allowed",
                border: "none",
                marginTop: 16,
              }}
            >
              Trading paused
            </button>
          ) : !inputAmount || parsedAmount === BigInt(0) ? (
            <button
              disabled
              className="w-full font-bold"
              style={{
                padding: "14px",
                borderRadius: 10,
                fontSize: 15,
                background: "var(--bg-input)",
                color: "var(--text-muted)",
                cursor: "not-allowed",
                border: "none",
                marginTop: 16,
              }}
            >
              Enter an amount
            </button>
          ) : needsApproval && !approveSuccess ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                padding: "14px",
                borderRadius: 10,
                fontSize: 15,
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                marginTop: 16,
              }}
            >
              {(isApproving || isApproveConfirming) && <Loader2 size={16} className="animate-spin" />}
              {isApproving ? "Waiting for approval..." : isApproveConfirming ? "Confirming..." : "Approve to continue"}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !quoteResult}
              className="w-full font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                padding: "14px",
                borderRadius: 10,
                fontSize: 15,
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                marginTop: 16,
              }}
            >
              {(isSwapping || isSwapConfirming) && <Loader2 size={16} className="animate-spin" />}
              {isSwapping
                ? "Processing..."
                : isSwapConfirming
                ? "Confirming on chain..."
                : isBuy
                ? "Buy BUIDL"
                : "Sell BUIDL"}
            </button>
          )}
        </div>

        {/* Info rows */}
        {navPrice > 0 && (
          <div
            className="px-5 pb-5"
            style={{ borderTop: "1px solid var(--border)", paddingTop: 4 }}
          >
            <InfoRow
              label="You will receive"
              value={outputFormatted ? `${outputFormatted} ${isBuy ? "mBUILD" : "USDC"}` : "—"}
            />
            <InfoRow
              label="Current price"
              value={`$${navPrice.toFixed(2)} per BUIDL`}
            />
            <InfoRow
              label="Platform fee"
              value={`${feePercent.toFixed(2)}%`}
            />
            <InfoRow
              label="Fund health"
              value={
                <span className="flex items-center gap-1" style={{ color: healthColor }}>
                  {reservePercent >= 98 && <CheckCircle size={12} />}
                  {reservePercent.toFixed(1)}%
                </span>
              }
            />
            <InfoRow
              label="Slippage protection"
              value="0.5%"
              last
            />
          </div>
        )}
      </div>

      {/* Footer note */}
      <p
        className="text-center font-medium mt-3"
        style={{ fontSize: 12, color: "var(--text-muted)" }}
      >
        ⛓ Price updated every 60s by Chainlink · 0.5% slippage protection
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex justify-between items-center"
      style={{
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid var(--border)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      <span
        className="font-semibold"
        style={{ color: "var(--text-primary)", fontFamily: "'Roboto Mono', monospace" }}
      >
        {value}
      </span>
    </div>
  );
}
