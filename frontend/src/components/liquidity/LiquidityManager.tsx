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
import { Loader2, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";

export function LiquidityManager() {
  const { address } = useAccount();
  const [tab, setTab] = useState<"add" | "remove">("add");
  const [rwaAmount, setRwaAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [removePercent, setRemovePercent] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { usdcBalance, rwaBalance, lpBalance, refetch } = useTokenBalances();

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

  const { writeContract: approveRwa, data: approveRwaHash, isPending: approvingRwa, error: approveRwaError } = useWriteContract();
  const { isLoading: confirmingApproveRwa, isSuccess: approveRwaSuccess } = useWaitForTransactionReceipt({ hash: approveRwaHash });

  const { writeContract: approveUsdc, data: approveUsdcHash, isPending: approvingUsdc, error: approveUsdcError } = useWriteContract();
  const { isLoading: confirmingApproveUsdc, isSuccess: approveUsdcSuccess } = useWaitForTransactionReceipt({ hash: approveUsdcHash });

  const { writeContract: addLiq, data: addLiqHash, isPending: addingLiq, error: addLiqError } = useWriteContract();
  const { isLoading: confirmingAddLiq, isSuccess: addLiqSuccess } = useWaitForTransactionReceipt({ hash: addLiqHash });

  const { writeContract: removeLiq, data: removeLiqHash, isPending: removingLiq, error: removeLiqError } = useWriteContract();
  const { isLoading: confirmingRemoveLiq, isSuccess: removeLiqSuccess } = useWaitForTransactionReceipt({ hash: removeLiqHash });

  const parsedRwa = rwaAmount ? parseUnits(rwaAmount, 18) : BigInt(0);
  const parsedUsdc = usdcAmount ? parseUnits(usdcAmount, 6) : BigInt(0);

  const needsRwaApproval = rwaAllowance !== undefined && parsedRwa > BigInt(0) && parsedRwa > (rwaAllowance as bigint);
  const needsUsdcApproval = usdcAllowance !== undefined && parsedUsdc > BigInt(0) && parsedUsdc > (usdcAllowance as bigint);

  useEffect(() => { if (approveRwaSuccess) refetchRwaAllowance(); }, [approveRwaSuccess, refetchRwaAllowance]);
  useEffect(() => { if (approveUsdcSuccess) refetchUsdcAllowance(); }, [approveUsdcSuccess, refetchUsdcAllowance]);
  useEffect(() => {
    if (addLiqSuccess || removeLiqSuccess) {
      refetch();
      if (addLiqSuccess) { setRwaAmount(""); setUsdcAmount(""); }
    }
  }, [addLiqSuccess, removeLiqSuccess, refetch]);

  useEffect(() => {
    const err = approveRwaError || approveUsdcError || addLiqError || removeLiqError;
    if (err) {
      const message = (err as Error).message || "Transaction failed";
      if (message.includes("User rejected")) setError("Transaction rejected by user");
      else if (message.includes("insufficient") || message.includes("Insufficient")) setError("Insufficient balance");
      else if (message.includes("not compliant")) setError("KYC verification required. Go to My Assets to verify.");
      else setError(message.length > 100 ? message.slice(0, 100) + "..." : message);
    }
  }, [approveRwaError, approveUsdcError, addLiqError, removeLiqError]);

  const handleApproveRwa = () => { setError(null); approveRwa({ address: CONTRACTS.mockRWAToken, abi: ABIS.rwaToken, functionName: "approve", args: [CONTRACTS.pool, maxUint256] }); };
  const handleApproveUsdc = () => { setError(null); approveUsdc({ address: CONTRACTS.mockUSDC, abi: ABIS.usdc, functionName: "approve", args: [CONTRACTS.pool, maxUint256] }); };
  const handleAddLiquidity = () => { if (!rwaAmount || !usdcAmount) return; setError(null); addLiq({ address: CONTRACTS.pool, abi: ABIS.pool, functionName: "addLiquidity", args: [parsedRwa, parsedUsdc] }); };
  const handleRemoveLiquidity = () => { if (!lpBalance || lpBalance === BigInt(0)) return; setError(null); const amount = (lpBalance * BigInt(removePercent)) / BigInt(100); removeLiq({ address: CONTRACTS.pool, abi: ABIS.pool, functionName: "removeLiquidity", args: [amount] }); };

  const isLoading = approvingRwa || confirmingApproveRwa || approvingUsdc || confirmingApproveUsdc || addingLiq || confirmingAddLiq || removingLiq || confirmingRemoveLiq;

  const sliderBg = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${removePercent}%, var(--bg-input) ${removePercent}%, var(--bg-input) 100%)`;

  const renderAddButton = () => {
    if (!rwaAmount || !usdcAmount || parsedRwa === BigInt(0) || parsedUsdc === BigInt(0)) {
      return (
        <button disabled style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: "var(--bg-input)", color: "var(--text-muted)",
          fontSize: 14, fontWeight: 700, cursor: "not-allowed",
          fontFamily: "'Manrope', sans-serif",
        }}>
          Enter Amounts
        </button>
      );
    }
    if (needsRwaApproval && !approveRwaSuccess) {
      return (
        <button onClick={handleApproveRwa} disabled={isLoading} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: "var(--accent)", color: "white",
          fontSize: 14, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: isLoading ? 0.6 : 1, fontFamily: "'Manrope', sans-serif",
          transition: "opacity 0.15s, transform 0.1s",
        }}>
          {(approvingRwa || confirmingApproveRwa) && <Loader2 size={16} className="animate-spin" />}
          {approvingRwa ? "Approving..." : confirmingApproveRwa ? "Confirming..." : "Step 1: Approve mBUILD"}
        </button>
      );
    }
    if (needsUsdcApproval && !approveUsdcSuccess) {
      return (
        <button onClick={handleApproveUsdc} disabled={isLoading} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: "var(--accent)", color: "white",
          fontSize: 14, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: isLoading ? 0.6 : 1, fontFamily: "'Manrope', sans-serif",
          transition: "opacity 0.15s, transform 0.1s",
        }}>
          {(approvingUsdc || confirmingApproveUsdc) && <Loader2 size={16} className="animate-spin" />}
          {approvingUsdc ? "Approving..." : confirmingApproveUsdc ? "Confirming..." : "Step 2: Approve USDC"}
        </button>
      );
    }
    return (
      <button onClick={handleAddLiquidity} disabled={isLoading} style={{
        width: "100%", padding: "14px", borderRadius: 10, border: "none",
        background: "var(--accent)", color: "white",
        fontSize: 14, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: isLoading ? 0.6 : 1, fontFamily: "'Manrope', sans-serif",
        transition: "opacity 0.15s, transform 0.1s",
      }}>
        {(addingLiq || confirmingAddLiq) && <Loader2 size={16} className="animate-spin" />}
        {addingLiq ? "Adding..." : confirmingAddLiq ? "Confirming..." : "Add Liquidity"}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Vault card */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
      }}>
        {/* Gradient accent bar */}
        <div style={{
          height: 3,
          background: "linear-gradient(90deg, #00A3FF, #00CC88)",
          width: "100%",
        }} />

        {/* Pool identity row */}
        <div style={{
          padding: "20px 24px 16px",
          display: "flex", alignItems: "center", gap: 14,
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #00A3FF 0%, #00CC88 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: "white",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(0, 163, 255, 0.25)",
          }}>
            LP
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
              BUIDL/USDC Pool
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Curated by{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>LiquidBridge</span>
              {" · "}Infra provider{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Chainlink</span>
            </div>
          </div>
          {/* Live badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 9999,
            background: "rgba(0, 204, 136, 0.08)",
            border: "1px solid rgba(0, 204, 136, 0.2)",
            fontSize: 10, fontWeight: 700,
            color: "#00CC88", letterSpacing: "0.5px",
            flexShrink: 0,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#00CC88", display: "inline-block",
              animation: "pulse 2s infinite",
            }} />
            LIVE
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          padding: "16px 24px",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          borderBottom: "1px solid var(--border)",
        }}>
          {[
            { label: "TVL", value: "—", sub: "Total Value Locked", highlight: false },
            { label: "APY", value: "Variable", sub: "Based on volume", highlight: true },
            { label: "FEE TIER", value: "0.05%", sub: "Dynamic fee", highlight: false },
          ].map((stat, i) => (
            <div key={i} style={{
              paddingLeft: i === 0 ? 0 : 16,
              paddingRight: i === 2 ? 0 : 16,
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
                textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4,
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700,
                fontFamily: "'Roboto Mono', monospace",
                color: stat.highlight ? "var(--accent-green)" : "var(--text-primary)",
                letterSpacing: "-0.3px",
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            Provide liquidity to the BUIDL/USDC AMM and earn a share of all trading fees.
            LPs capture every basis point of volume with dynamic fee distribution.
          </p>
        </div>

        {/* Deposit token badges */}
        <div style={{
          padding: "12px 24px",
          display: "flex", alignItems: "center", gap: 8,
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Deposit tokens</span>
          {[
            { symbol: "mBUILD", letter: "m", color: "#1A2024" },
            { symbol: "USDC", letter: "$", color: "#2775CA" },
          ].map((t, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 10px 3px 6px",
              borderRadius: 9999,
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: t.color, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800,
              }}>
                {t.letter}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {t.symbol}
              </span>
            </div>
          ))}
        </div>

        {/* My position + toggle */}
        <div style={{
          padding: "12px 24px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>My position</span>
            <div style={{
              fontSize: 15, fontWeight: 700,
              fontFamily: "'Roboto Mono', monospace",
              color: "var(--text-primary)", marginTop: 1,
            }}>
              {lpBalance && lpBalance > BigInt(0)
                ? `${formatRWA(lpBalance)} lbLP`
                : "—"}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: "9px 20px", borderRadius: 10,
              border: "1.5px solid var(--border)",
              background: expanded ? "var(--bg-input)" : "var(--accent)",
              color: expanded ? "var(--text-secondary)" : "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (expanded) (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            {expanded ? "Close" : "Manage"}
            <ChevronDown
              size={15}
              style={{ transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>

        {/* Expandable panel */}
        {expanded && (
          <div style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface-2)",
            padding: "20px 24px",
          }}>
            {/* Tab toggle */}
            <div style={{
              display: "flex",
              background: "var(--bg-input)",
              borderRadius: 10,
              padding: 4,
              gap: 4,
              marginBottom: 20,
            }}>
              {(["add", "remove"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(null); }}
                  style={{
                    flex: 1, padding: "9px 0",
                    textAlign: "center", borderRadius: 7,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    border: "none",
                    background: tab === t ? "var(--bg-surface)" : "transparent",
                    color: tab === t
                      ? (t === "add" ? "var(--accent)" : "var(--accent-red)")
                      : "var(--text-muted)",
                    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {t === "add" ? "Add Liquidity" : "Remove"}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(255,107,107,0.08)",
                border: "1px solid rgba(255,107,107,0.3)",
                color: "#CC3333",
                display: "flex", alignItems: "center", gap: 8, fontSize: 13,
              }}>
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span style={{ flex: 1 }}>{error}</span>
                <button onClick={() => setError(null)} style={{ opacity: 0.6, cursor: "pointer", background: "none", border: "none", color: "inherit" }}>✕</button>
              </div>
            )}

            {/* Success banners */}
            {(addLiqSuccess && tab === "add") && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(0,204,136,0.08)", border: "1px solid rgba(0,204,136,0.3)",
                color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 8, fontSize: 13,
              }}>
                <CheckCircle size={14} />
                Liquidity added successfully!
              </div>
            )}
            {(removeLiqSuccess && tab === "remove") && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(0,204,136,0.08)", border: "1px solid rgba(0,204,136,0.3)",
                color: "var(--accent-green)", display: "flex", alignItems: "center", gap: 8, fontSize: 13,
              }}>
                <CheckCircle size={14} />
                Liquidity removed successfully!
              </div>
            )}

            {/* Approval chips */}
            {tab === "add" && rwaAmount && usdcAmount && parsedRwa > BigInt(0) && parsedUsdc > BigInt(0) && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, fontSize: 12 }}>
                {[
                  { label: "mBUILD", approved: !needsRwaApproval || approveRwaSuccess },
                  { label: "USDC",   approved: !needsUsdcApproval || approveUsdcSuccess },
                ].map((chip) => (
                  <span key={chip.label} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", borderRadius: 9999, fontWeight: 600,
                    background: chip.approved ? "rgba(0,204,136,0.10)" : "var(--bg-input)",
                    color: chip.approved ? "var(--accent-green)" : "var(--text-secondary)",
                  }}>
                    {chip.approved && <CheckCircle size={10} />}
                    {chip.label} {chip.approved ? "Approved" : "Pending"}
                  </span>
                ))}
              </div>
            )}

            {tab === "add" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <TokenInput
                  label="mBUILD"
                  balance={rwaBalance ? formatRWA(rwaBalance) : "0"}
                  value={rwaAmount}
                  onChange={(v) => { setRwaAmount(v); setError(null); }}
                  avatarBg="#1A2024"
                  avatarLetter="m"
                />
                <TokenInput
                  label="USDC"
                  balance={usdcBalance ? formatUSDC(usdcBalance) : "0"}
                  value={usdcAmount}
                  onChange={(v) => { setUsdcAmount(v); setError(null); }}
                  avatarBg="#2775CA"
                  avatarLetter="$"
                />
                {renderAddButton()}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* LP Balance */}
                <div style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: 12, padding: 16,
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.8px",
                    textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6,
                  }}>
                    Your LP Balance
                  </div>
                  <div style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 28, fontWeight: 600,
                    color: "var(--text-primary)", letterSpacing: "-0.5px",
                  }}>
                    {lpBalance ? formatRWA(lpBalance) : "0.0000"}
                    <span style={{ fontSize: 16, color: "var(--text-muted)", marginLeft: 6 }}>lbLP</span>
                  </div>
                </div>

                {/* Slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Remove Amount</span>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      fontFamily: "'Roboto Mono', monospace",
                      color: "var(--accent)",
                    }}>
                      {removePercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1} max={100}
                    value={removePercent}
                    onChange={(e) => setRemovePercent(Number(e.target.value))}
                    style={{ width: "100%", background: sliderBg }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 8 }}>
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setRemovePercent(pct)}
                        style={{
                          flex: 1, padding: "5px 0", borderRadius: 9999,
                          border: "1px solid var(--border)",
                          background: removePercent === pct ? "var(--accent)" : "var(--bg-input)",
                          color: removePercent === pct ? "white" : "var(--text-secondary)",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRemoveLiquidity}
                  disabled={!lpBalance || lpBalance === BigInt(0) || isLoading}
                  style={{
                    width: "100%", padding: 14, borderRadius: 10,
                    background: "rgba(239, 68, 68, 0.08)",
                    color: "var(--accent-red)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    fontSize: 14, fontWeight: 700, cursor: (!lpBalance || lpBalance === BigInt(0) || isLoading) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: (!lpBalance || lpBalance === BigInt(0) || isLoading) ? 0.5 : 1,
                    transition: "all 0.15s",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (lpBalance && lpBalance > BigInt(0) && !isLoading)
                      (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.08)";
                  }}
                >
                  {(removingLiq || confirmingRemoveLiq) && <Loader2 size={16} className="animate-spin" />}
                  {removingLiq ? "Removing..." : confirmingRemoveLiq ? "Confirming..." : "Remove Liquidity"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p style={{
        maxWidth: 640, margin: "16px auto 0",
        fontSize: 12, color: "var(--text-muted)",
        lineHeight: 1.6, textAlign: "center", padding: "0 8px",
      }}>
        APY figures are estimates based on trading volume. Past performance does not guarantee future results.
        Rewards are distributed proportionally to LP token holders based on pool activity.
      </p>
    </div>
  );
}

function TokenInput({
  label, balance, value, onChange, avatarBg, avatarLetter,
}: {
  label: string;
  balance: string;
  value: string;
  onChange: (v: string) => void;
  avatarBg: string;
  avatarLetter: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-input)",
        border: "1.5px solid var(--border)",
        borderRadius: 12, padding: "12px 14px",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-input-focus)";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: avatarBg, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800,
          }}>
            {avatarLetter}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Balance:{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{balance}</span>
        </span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        style={{
          width: "100%", background: "transparent", border: "none", outline: "none",
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 22, fontWeight: 500, color: "var(--text-primary)",
        }}
      />
    </div>
  );
}
