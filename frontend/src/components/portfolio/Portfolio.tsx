"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ABIS } from "@/lib/contracts";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useCompliance } from "@/hooks/useCompliance";
import { useNAV } from "@/hooks/useNAV";
import { formatUSDC, formatRWA, formatNAV } from "@/lib/utils";
import { Shield, Wallet, Loader2 } from "lucide-react";

export function Portfolio() {
  const { address, isConnected } = useAccount();
  const { usdcBalance, rwaBalance, lpBalance, refetch } = useTokenBalances();
  const { isCompliant, selfWhitelist, isWhitelisting } = useCompliance();
  const { nav } = useNAV();

  const { writeContract: faucetUsdc, data: usdcHash, isPending: usdcPending } = useWriteContract();
  const { isLoading: usdcConfirming, isSuccess: usdcSuccess } = useWaitForTransactionReceipt({ hash: usdcHash });

  const { writeContract: faucetRwa, data: rwaHash, isPending: rwaPending } = useWriteContract();
  const { isLoading: rwaConfirming, isSuccess: rwaSuccess } = useWaitForTransactionReceipt({ hash: rwaHash });

  if (usdcSuccess || rwaSuccess) refetch();

  const navPrice = nav ? Number(nav) / 1e6 : 100;
  const usdcValue = usdcBalance ? Number(usdcBalance) / 1e6 : 0;
  const rwaValue = rwaBalance ? (Number(rwaBalance) / 1e18) * navPrice : 0;
  const totalValue = usdcValue + rwaValue;

  // suppress unused
  void formatNAV;
  void address;

  if (!isConnected) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "80px 16px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "var(--bg-input)",
          color: "var(--text-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Wallet size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          Connect Your Wallet
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Connect your wallet to view your portfolio and get test tokens
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" }}>

      {/* FIX 1 — Premium stat cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "16px",
      }}>
        {[
          {
            label: "USDC Balance",
            value: usdcBalance ? formatUSDC(usdcBalance) : "—",
            prefix: "$",
            color: "#2775CA",
            bgColor: "rgba(39, 117, 202, 0.08)",
            letter: "$",
          },
          {
            label: "mBUILD Balance",
            value: rwaBalance ? formatRWA(rwaBalance) : "—",
            prefix: "",
            color: "#6366F1",
            bgColor: "rgba(99, 102, 241, 0.08)",
            letter: "B",
          },
          {
            label: "LP Position",
            value: lpBalance && lpBalance > BigInt(0) ? formatRWA(lpBalance) : "—",
            prefix: "",
            color: "#00A3FF",
            bgColor: "rgba(0, 163, 255, 0.08)",
            letter: "LP",
          },
          {
            label: "NAV Price",
            value: nav ? `$${(Number(nav) / 1e6).toFixed(2)}` : "—",
            prefix: "",
            color: "#00CC88",
            bgColor: "rgba(0, 204, 136, 0.08)",
            letter: "↗",
          },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 18px",
            boxShadow: "var(--card-shadow)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Glow orb */}
            <div style={{
              position: "absolute",
              top: -16, right: -16,
              width: 60, height: 60,
              borderRadius: "50%",
              background: stat.bgColor,
              filter: "blur(20px)",
              pointerEvents: "none",
            }} />

            {/* Icon */}
            <div style={{
              width: 30, height: 30,
              borderRadius: 8,
              background: stat.bgColor,
              color: stat.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
              marginBottom: 10,
            }}>
              {stat.letter}
            </div>

            <div style={{
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.5px", textTransform: "uppercase",
              color: "var(--text-muted)", marginBottom: 4,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 16, fontWeight: 700,
              fontFamily: "'Roboto Mono', monospace",
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {stat.prefix}{stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* FIX 2 — Hero card (theme-aware) */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
      }}>
        {/* BG decorations */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,163,255,0.07), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -30,
          width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,204,136,0.05), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          fontSize: 11, fontWeight: 700,
          letterSpacing: "1px", textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}>
          Total Portfolio Value
        </div>

        <div style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 40, fontWeight: 700,
          color: "var(--accent-blue)",
          letterSpacing: "-1px",
          lineHeight: 1,
          marginBottom: 16,
        }}>
          ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
        </div>

        <div style={{
          display: "flex", gap: 24,
          borderTop: "1px solid var(--border)",
          paddingTop: 14,
        }}>
          {[
            { label: "USDC", value: `$${usdcValue.toLocaleString("en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` },
            { label: "mBUILD", value: `$${rwaValue.toFixed(2)}` },
            { label: "LP Value", value: "—" },
          ].map((item, i) => (
            <div key={i}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.5px", textTransform: "uppercase",
                marginBottom: 2,
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                fontFamily: "'Roboto Mono', monospace",
                color: "var(--text-secondary)",
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FIX 3 — Premium faucet card */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 16,
        boxShadow: "var(--card-shadow)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2,
          background: "linear-gradient(90deg, #00A3FF, #00CC88)",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(0, 163, 255, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A3FF" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            Test Token Faucet
          </span>
        </div>

        <p style={{
          fontSize: 13, color: "var(--text-secondary)",
          margin: "0 0 16px", lineHeight: 1.5,
        }}>
          Get test tokens to try LiquidBridge. Each click gives you 10,000 USDC or 100 mBUILD.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <button
            onClick={() => faucetUsdc({ address: CONTRACTS.mockUSDC, abi: ABIS.usdc, functionName: "faucet" })}
            disabled={usdcPending || usdcConfirming}
            style={{
              padding: 11,
              borderRadius: 10,
              border: "1.5px solid rgba(39, 117, 202, 0.3)",
              background: "rgba(39, 117, 202, 0.06)",
              color: "#2775CA",
              fontSize: 13, fontWeight: 700,
              cursor: usdcPending || usdcConfirming ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
              fontFamily: "'Manrope', sans-serif",
              opacity: usdcPending || usdcConfirming ? 0.6 : 1,
            }}
          >
            {(usdcPending || usdcConfirming) ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "#2775CA", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, flexShrink: 0,
              }}>$</span>
            )}
            {usdcPending ? "Minting..." : usdcConfirming ? "Confirming..." : "Get 10,000 USDC"}
          </button>

          <button
            onClick={() => faucetRwa({ address: CONTRACTS.mockRWAToken, abi: ABIS.rwaToken, functionName: "faucet" })}
            disabled={rwaPending || rwaConfirming}
            style={{
              padding: 11,
              borderRadius: 10,
              border: "1.5px solid rgba(0, 163, 255, 0.3)",
              background: "rgba(0, 163, 255, 0.06)",
              color: "var(--accent)",
              fontSize: 13, fontWeight: 700,
              cursor: rwaPending || rwaConfirming ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.15s",
              fontFamily: "'Manrope', sans-serif",
              opacity: rwaPending || rwaConfirming ? 0.6 : 1,
            }}
          >
            {(rwaPending || rwaConfirming) ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--accent)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, flexShrink: 0,
              }}>B</span>
            )}
            {rwaPending ? "Minting..." : rwaConfirming ? "Confirming..." : "Get 100 mBUILD"}
          </button>
        </div>

        {/* KYC section */}
        {!isCompliant ? (
          <button
            onClick={selfWhitelist}
            disabled={isWhitelisting}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 16px",
              borderRadius: 10,
              border: "none",
              background: "var(--accent-yellow)",
              color: "white",
              fontSize: 13, fontWeight: 700,
              cursor: isWhitelisting ? "not-allowed" : "pointer",
              opacity: isWhitelisting ? 0.6 : 1,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            {isWhitelisting ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Shield size={14} />
            )}
            {isWhitelisting ? "Verifying..." : "Complete KYC Verification"}
          </button>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(0, 204, 136, 0.06)",
            border: "1px solid rgba(0, 204, 136, 0.2)",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00CC88" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#00CC88" }}>
              KYC Verified — You can trade on LiquidBridge
            </span>
          </div>
        )}
      </div>

      {/* FIX 4 — Premium token balances list */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
      }}>
        <div style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            letterSpacing: "0.6px", textTransform: "uppercase",
            color: "var(--text-muted)",
          }}>
            Token Balances
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
            3 assets
          </span>
        </div>

        {[
          {
            symbol: "USDC", name: "USD Coin",
            letter: "$", letterBg: "#2775CA",
            amount: usdcBalance ? formatUSDC(usdcBalance) : "0.00",
            usd: `$${usdcValue.toFixed(2)}`,
            positive: usdcValue > 0,
          },
          {
            symbol: "mBUILD", name: "Mock BUIDL Token",
            letter: "B", letterBg: "#6366F1",
            amount: rwaBalance ? formatRWA(rwaBalance) : "0.0000",
            usd: `$${rwaValue.toFixed(2)}`,
            positive: rwaValue > 0,
          },
          {
            symbol: "lbLP", name: "LP Token",
            letter: "LP", letterBg: "linear-gradient(135deg, #00A3FF, #00CC88)",
            amount: lpBalance ? formatRWA(lpBalance) : "0.0000",
            usd: "—",
            positive: false,
          },
        ].map((token, i, arr) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-input)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: token.letterBg,
              color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
              marginRight: 12, flexShrink: 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}>
              {token.letter}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                {token.symbol}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                {token.name}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: 15, fontWeight: 600,
                fontFamily: "'Roboto Mono', monospace",
                color: "var(--text-primary)",
                letterSpacing: "-0.3px",
              }}>
                {token.amount}
              </div>
              <div style={{
                fontSize: 12,
                color: token.positive ? "var(--accent-green)" : "var(--text-muted)",
                marginTop: 1, fontWeight: 500,
              }}>
                {token.usd}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
