"use client";

import Link from "next/link";

const FEATURES = [
  {
    color: "#00A3FF",
    bgColor: "rgba(0, 163, 255, 0.08)",
    title: "Real NAV Pricing",
    desc: "Trade at the exact fund NAV from BlackRock. No AMM slippage, no price manipulation.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    color: "#00CC88",
    bgColor: "rgba(0, 204, 136, 0.08)",
    title: "Chainlink Oracles",
    desc: "Price feeds secured by the industry-standard oracle network. Updated every 60 seconds.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    color: "#6366F1",
    bgColor: "rgba(99, 102, 241, 0.08)",
    title: "Earn Yield",
    desc: "Provide liquidity to the BUIDL/USDC pool and earn platform fees passively.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.08)",
    title: "Compliant by Design",
    desc: "Built-in KYC verification and slippage protection. Institutional-grade DeFi.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];

const STATS = [
  { label: "Fund NAV", value: "~$100.00", sub: "per BUIDL token" },
  { label: "Slippage Protection", value: "±0.5%", sub: "max deviation" },
  { label: "Platform Fee", value: "0.05%", sub: "minimum fee" },
  { label: "Oracle Network", value: "Chainlink", sub: "price feeds" },
];

export default function LandingPage() {
  return (
    <div className="page-enter" style={{ margin: "0 -16px" }}>

      {/* ── HERO ── */}
      <section style={{
        textAlign: "center",
        paddingTop: 80,
        paddingBottom: 64,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Atmospheric glow */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "100%",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,163,255,0.08) 0%, rgba(0,204,136,0.04) 50%, transparent 75%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            borderRadius: 9999,
            background: "rgba(0, 163, 255, 0.08)",
            border: "1px solid rgba(0, 163, 255, 0.2)",
            marginBottom: 28,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#00A3FF", display: "inline-block",
              animation: "pulse 2s ease infinite",
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.5px" }}>
              Live on Base Sepolia
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-1.5px",
            lineHeight: 1.05,
            margin: "0 0 20px",
          }}>
            Trade Tokenized<br />
            <span style={{ color: "var(--accent-blue)" }}>Real-World Assets</span>
          </h1>

          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: "0 auto 40px",
            maxWidth: 500,
          }}>
            Buy and sell BlackRock BUIDL tokens at the exact fund NAV.
            Powered by Chainlink oracles. No slippage. No surprises.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/trade" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px",
              borderRadius: 12,
              background: "var(--accent-blue)",
              color: "white",
              fontSize: 15, fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "-0.2px",
              boxShadow: "0 4px 20px rgba(0,163,255,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,163,255,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,163,255,0.35)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Start Trading
            </Link>

            <Link href="/pool" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px",
              borderRadius: 12,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
              fontSize: 15, fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "-0.2px",
              boxShadow: "var(--card-shadow)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              View Markets
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ maxWidth: 780, margin: "0 auto 64px", padding: "0 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--border)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "var(--card-shadow)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)",
              padding: "20px 24px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 20, fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.5px",
                marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 780, margin: "0 auto 72px", padding: "0 24px", textAlign: "center" }}>
        <h2 style={{
          fontSize: 28, fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.6px",
          marginBottom: 8,
        }}>
          Built for institutional-grade trading
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 36, fontWeight: 400 }}>
          The infrastructure that makes DeFi RWA trading safe and transparent.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "24px",
              textAlign: "left",
              boxShadow: "var(--card-shadow)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Glow orb */}
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: f.bgColor,
                filter: "blur(24px)",
                pointerEvents: "none",
              }} />
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: f.bgColor,
                color: f.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.2px" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        maxWidth: 780, margin: "0 auto 48px", padding: "0 24px",
      }}>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "40px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--card-shadow)",
        }}>
          {/* Accent top line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, #00A3FF, #00CC88)",
          }} />
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,163,255,0.07), transparent 70%)",
            pointerEvents: "none",
          }} />

          <h2 style={{
            fontSize: 28, fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.6px",
            marginBottom: 12,
          }}>
            Ready to trade?
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 28 }}>
            Get test tokens from the faucet and start trading in under 2 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/trade" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px",
              borderRadius: 12,
              background: "var(--accent-blue)",
              color: "white",
              fontSize: 14, fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,163,255,0.3)",
            }}>
              Open Trade App
            </Link>
            <Link href="/portfolio" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px",
              borderRadius: 12,
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: 14, fontWeight: 600,
              textDecoration: "none",
            }}>
              Get Test Tokens
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
