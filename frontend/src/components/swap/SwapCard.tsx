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
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          boxShadow: "var(--card-shadow)",
          overflow: "hidden",
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
            className="flex gap-1"
            style={{ background: "var(--bg-input)", borderRadius: 12, padding: 4 }}
          >
            <button
              onClick={() => { setTab("buy"); setInputAmount(""); }}
              className="flex-1 transition-all"
              style={{
                background: tab === "buy" ? "var(--bg-surface)" : "transparent",
                color: tab === "buy" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: tab === "buy" ? "0 1px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)" : "none",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                borderRadius: 9,
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              Buy BUIDL
            </button>
            <button
              onClick={() => { setTab("sell"); setInputAmount(""); }}
              className="flex-1 transition-all"
              style={{
                background: tab === "sell" ? "var(--bg-surface)" : "transparent",
                color: tab === "sell" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: tab === "sell" ? "0 1px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)" : "none",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                borderRadius: 9,
                padding: "10px 0",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
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
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-muted)" }}
              >
                You Pay
              </span>
            </div>
            <div
              style={{
                background: "var(--bg-input)",
                border: "1.5px solid var(--border-strong)",
                borderRadius: 14,
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
              {/* Balance banner */}
              {balance !== undefined && (
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                    Available
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 13, fontWeight: 600,
                      color: "var(--text-primary)",
                    }}>
                      {balanceFormatted} {isBuy ? "USDC" : "mBUILD"}
                    </span>
                    <button
                      onClick={() => setInputAmount(formatUnits(balance, tokenInDecimals))}
                      style={{
                        background: "var(--accent-blue)",
                        border: "none",
                        borderRadius: 5,
                        padding: "2px 9px",
                        fontSize: 11, fontWeight: 700,
                        color: "white", cursor: "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
              )}
              {/* Input row */}
              <div className="flex items-center gap-3">
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
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div
              className="flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border)",
                color: "var(--text-muted)",
                boxShadow: "var(--card-shadow)",
                cursor: "default",
                transition: "border-color 0.15s, color 0.15s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--accent-blue)";
                el.style.color = "var(--accent-blue)";
                el.style.transform = "rotate(180deg)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--text-muted)";
                el.style.transform = "rotate(0deg)";
              }}
            >
              <ArrowDown size={14} strokeWidth={2.5} />
            </div>
          </div>

          {/* YOU RECEIVE */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-muted)" }}
              >
                You Receive
              </span>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.18)",
                fontSize: 10, fontWeight: 700,
                color: "#F59E0B",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Estimated
              </span>
            </div>
            <div
              className="flex items-center gap-3"
              style={{
                background: "var(--bg-input)",
                border: "1.5px solid var(--border-strong)",
                borderRadius: 14,
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
                padding: "15px",
                borderRadius: 12,
                fontSize: 15,
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                marginTop: 16,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                letterSpacing: "-0.2px",
                boxShadow: "0 4px 16px rgba(0,163,255,0.25)",
              }}
            >
              {(isApproving || isApproveConfirming) && <Loader2 size={16} className="animate-spin" />}
              {isApproving ? "Waiting for approval..." : isApproveConfirming ? "Confirming..." : "Approve to continue"}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !quoteResult}
              className="w-full font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                padding: "15px",
                borderRadius: 12,
                fontSize: 15,
                background: isBuy
                  ? "var(--accent-blue)"
                  : "linear-gradient(135deg, #EF4444, #DC2626)",
                color: "white",
                border: "none",
                marginTop: 16,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                letterSpacing: "-0.2px",
                boxShadow: isBuy
                  ? "0 4px 16px rgba(0,163,255,0.25)"
                  : "0 4px 16px rgba(239,68,68,0.25)",
                transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                if (!el.disabled) { el.style.opacity = "0.9"; el.style.transform = "translateY(-1px)"; }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.opacity = "1"; el.style.transform = "translateY(0)";
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
