"use client";

import { useState, useEffect, useRef } from "react";
import { usePool } from "@/hooks/usePool";
import { useNAV } from "@/hooks/useNAV";
import { formatUSDC, formatRWA, formatNAV, cn } from "@/lib/utils";
import { NAVChart } from "./NAVChart";
import { Activity, DollarSign, BarChart3, Shield, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export function PoolDashboard() {
  const { poolState, totalVolume, totalFees, swapCount, currentFee, impliedPrice, isLoading } = usePool();
  const { nav, timestamp, reserveRatio, isStale, history } = useNAV();

  const navPrice = nav ? Number(nav) / 1e6 : 0;
  const marketPrice = impliedPrice ? Number(impliedPrice) / 1e6 : 0;
  const deviation = navPrice > 0 ? ((marketPrice - navPrice) / navPrice) * 100 : 0;
  const reservePercent = reserveRatio ? Number(reserveRatio) / 100 : 0;
  const feePercent = currentFee ? Number(currentFee) / 100 : 0;

  const tvl = poolState
    ? Number(poolState.reserveUSDC) / 1e6 +
      (Number(poolState.reserveRWA) / 1e18) * navPrice
    : 0;

  void cn;

  const healthColor =
    reservePercent >= 99
      ? "#00CC88"
      : reservePercent >= 98
      ? "var(--accent-yellow)"
      : "var(--accent-red)";

  const deviationColor =
    Math.abs(deviation) < 0.1
      ? "var(--accent-green)"
      : Math.abs(deviation) < 0.3
      ? "var(--accent-yellow)"
      : "var(--accent-red)";

  // Oracle countdown timer — ticks every second
  const [secondsSince, setSecondsSince] = useState(0);
  useEffect(() => {
    const tick = () => {
      setSecondsSince(timestamp ? Math.floor(Date.now() / 1000) - Number(timestamp) : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timestamp]);
  const nextUpdateIn = Math.max(0, 60 - (secondsSince % 60));
  const lastUpdatedText =
    secondsSince === 0 ? "just now"
    : secondsSince < 60 ? `${secondsSince}s ago`
    : `${Math.floor(secondsSince / 60)}m ago`;

  // Price change tracking (compared to previous oracle update)
  const prevNavRef = useRef<number>(0);
  const [navChangePct, setNavChangePct] = useState<number | null>(null);
  useEffect(() => {
    if (nav) {
      const cur = Number(nav) / 1e6;
      if (prevNavRef.current > 0 && cur !== prevNavRef.current) {
        setNavChangePct(((cur - prevNavRef.current) / prevNavRef.current) * 100);
      }
      prevNavRef.current = cur;
    }
  }, [nav]);

  // Market health badge
  const healthBadge =
    reservePercent >= 99
      ? { label: "Healthy", color: "#00CC88", bg: "rgba(0,204,136,0.08)", border: "1px solid rgba(0,204,136,0.2)" }
      : reservePercent >= 98
      ? { label: "Warning", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }
      : { label: "Risk", color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Circuit Breaker Alert */}
      {poolState?.circuitBreakerActive && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
          style={{
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.3)",
            color: "#CC3333",
          }}
        >
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold">Circuit Breaker Active</p>
            <p className="text-xs mt-0.5" style={{ color: "#CC3333", opacity: 0.8 }}>
              Trading is paused due to reserve ratio falling below 98%
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !poolState ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={<DollarSign size={18} />}
              label="Total Value Locked"
              value={`$${tvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
              color="#00CC88"
              bgColor="rgba(0, 204, 136, 0.10)"
            />
            <StatCard
              icon={<Activity size={18} />}
              label="24h Volume"
              value={`$${totalVolume ? formatUSDC(totalVolume) : "0.00"}`}
              color="#00A3FF"
              bgColor="rgba(0, 163, 255, 0.10)"
            />
            <StatCard
              icon={<BarChart3 size={18} />}
              label="Total Swaps"
              value={swapCount?.toString() || "0"}
              color="#8B5CF6"
              bgColor="rgba(139, 92, 246, 0.10)"
            />
            <StatCard
              icon={<Shield size={18} />}
              label="Total Fees"
              value={`$${totalFees ? formatUSDC(totalFees) : "0.00"}`}
              color="var(--accent-yellow)"
              bgColor="rgba(245, 158, 11, 0.10)"
            />
          </>
        )}
      </div>

      {/* Chart + Side cards */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* NAV Chart */}
        <div
          className="lg:col-span-2"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            boxShadow: "var(--card-shadow)",
            display: "flex",
            flexDirection: "column",
            minHeight: 400,
          }}
        >
          {/* Chart header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.2px" }}>
                NAV vs Market Price
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Real-time price comparison
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 9999,
                background: "rgba(0, 204, 136, 0.08)",
                border: "1px solid rgba(0, 204, 136, 0.2)",
                fontSize: 11, fontWeight: 700,
                color: "#00CC88", letterSpacing: "0.5px",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#00CC88", display: "inline-block",
                  animation: "pulse 2s infinite",
                }} />
                LIVE
              </div>
              {timestamp && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Next update in {nextUpdateIn}s
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 260 }}>
            <NAVChart history={history} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Price Information */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 16, padding: "20px 24px",
            boxShadow: "var(--card-shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <h3 style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
                textTransform: "uppercase", color: "var(--text-muted)", margin: 0,
              }}>
                Price Information
              </h3>
              {timestamp && (
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>
                  Updated {lastUpdatedText}
                </span>
              )}
            </div>
            <PriceRow
              label="Oracle NAV"
              value={
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {formatNAV(nav || BigInt(0))}
                  {navChangePct !== null && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 1,
                      color: navChangePct >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                    }}>
                      {navChangePct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {navChangePct >= 0 ? "+" : ""}{navChangePct.toFixed(3)}%
                    </span>
                  )}
                </span>
              }
            />
            <PriceRow label="Market Price" value={`$${marketPrice.toFixed(2)}`} />
            <PriceRow
              label="Deviation"
              value={`${deviation >= 0 ? "+" : ""}${deviation.toFixed(3)}%`}
              valueColor={deviationColor}
            />
            <PriceRow label="Dynamic Fee" value={`${feePercent.toFixed(2)}%`} />
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 4 }}>
              <PriceRow
                label="Upper Bound"
                value={poolState ? formatNAV(poolState.upperBound) : "—"}
              />
              <PriceRow
                label="Lower Bound"
                value={poolState ? formatNAV(poolState.lowerBound) : "—"}
                last
              />
            </div>
          </div>

          {/* Proof of Reserve */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 16, padding: "20px 24px",
            boxShadow: "var(--card-shadow)",
          }}>
            <h3 style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
              textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 16px",
            }}>
              Proof of Reserve
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Reserve Ratio</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{
                  fontSize: 20, fontWeight: 700,
                  fontFamily: "'Roboto Mono', monospace",
                  color: healthColor,
                }}>
                  {reservePercent.toFixed(1)}%
                </span>
                {reservePercent > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 9999,
                    background: healthBadge.bg,
                    border: healthBadge.border,
                    color: healthBadge.color,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: healthBadge.color, flexShrink: 0 }} />
                    {healthBadge.label}
                  </span>
                )}
              </div>
            </div>
            <div style={{
              borderRadius: 100,
              boxShadow: reservePercent > 0 ? "0 0 10px rgba(0,204,136,0.35)" : "none",
              transition: "box-shadow 1s ease",
            }}>
              <div style={{
                height: 8, borderRadius: 100,
                background: "var(--bg-input)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(reservePercent, 100)}%`,
                  borderRadius: 100,
                  background: "linear-gradient(90deg, #00CC88, #00E5A0)",
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
            {isStale && (
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.15)",
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 12, color: "#D97706",
              }}>
                <AlertTriangle size={13} className="flex-shrink-0" />
                Oracle data is stale
              </div>
            )}
          </div>

          {/* Pool Reserves */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 16, padding: "20px 24px",
            boxShadow: "var(--card-shadow)",
          }}>
            <h3 style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
              textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 16px",
            }}>
              Pool Reserves
            </h3>
            <ReserveRow
              avatar="B"
              avatarBg="#1A2024"
              token="mBUILD"
              value={poolState ? formatRWA(poolState.reserveRWA) : "0"}
            />
            <ReserveRow
              avatar="$"
              avatarBg="#2775CA"
              token="USDC"
              value={poolState ? formatUSDC(poolState.reserveUSDC) : "0"}
              last
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16, padding: "20px 24px",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-input)" }} />
        <div style={{ height: 10, borderRadius: 6, background: "var(--bg-input)", width: "55%" }} />
        <div style={{ height: 22, borderRadius: 6, background: "var(--bg-input)", width: "75%" }} />
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, color, bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16, padding: "20px 24px",
        boxShadow: "var(--card-shadow)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default", position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
      }}
    >
      {/* Background glow orb */}
      <div style={{
        position: "absolute", top: -10, right: -10,
        width: 100, height: 100, borderRadius: "50%",
        background: color, filter: "blur(32px)",
        opacity: 0.18, pointerEvents: "none",
      }} />
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: bgColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14, color,
      }}>
        {icon}
      </div>
      {/* Label */}
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
        textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6,
      }}>
        {label}
      </div>
      {/* Value */}
      <div style={{
        fontFamily: "'Roboto Mono', monospace",
        fontSize: "clamp(17px, 2.2vw, 24px)", fontWeight: 600,
        color: "var(--text-primary)",
        letterSpacing: "-0.5px", lineHeight: 1,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {value}
      </div>
    </div>
  );
}

function PriceRow({
  label, value, valueColor, last,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600,
        fontFamily: "'Roboto Mono', monospace",
        color: valueColor || "var(--text-primary)",
      }}>
        {value}
      </span>
    </div>
  );
}

function ReserveRow({
  avatar, avatarBg, token, value, last,
}: {
  avatar: string;
  avatarBg: string;
  token: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: avatarBg, color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {avatar}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          {token}
        </span>
      </div>
      <span style={{
        fontSize: 13, fontWeight: 600,
        fontFamily: "'Roboto Mono', monospace",
        color: "var(--text-primary)",
      }}>
        {value}
      </span>
    </div>
  );
}
