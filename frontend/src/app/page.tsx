"use client";

import Link from "next/link";

const FEATURES = [
  {
    color: "#00A3FF",
    bgColor: "rgba(0, 163, 255, 0.08)",
    glowColor: "rgba(0, 163, 255, 0.22)",
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
    glowColor: "rgba(0, 204, 136, 0.20)",
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
    glowColor: "rgba(99, 102, 241, 0.22)",
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
    glowColor: "rgba(245, 158, 11, 0.20)",
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

export default function LandingPage() {
  return (
    <div className="page-enter landing-page" style={{ margin: "0 -16px" }}>

      {/* ── HERO — full-width wrapper for smooth edge-to-edge atmosphere ── */}
      <div style={{
        background: `
          radial-gradient(ellipse 70% 60% at 10% 50%, rgba(0,163,255,0.10), transparent 55%),
          radial-gradient(ellipse 60% 50% at 90% 30%, rgba(0,204,136,0.07), transparent 55%)
        `,
        width: "100%",
      }}>
      <section className="hero-split" style={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        padding: "80px 64px 60px",
        maxWidth: 1200,
        margin: "0 auto",
        gap: 60,
      }}>

        {/* LEFT — text */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Status pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px", borderRadius: 9999,
            background: "rgba(0, 214, 143, 0.08)",
            border: "1px solid rgba(0, 214, 143, 0.2)",
            fontSize: 12, fontWeight: 600, color: "#00CC88",
            marginBottom: 28, letterSpacing: "0.2px",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#00CC88",
              boxShadow: "0 0 8px rgba(0,204,136,0.6)",
              animation: "pulse 2s infinite",
              flexShrink: 0, display: "inline-block",
            }} />
            Live on Base Sepolia · Powered by Chainlink
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(40px, 5vw, 68px)",
            fontWeight: 900,
            color: "var(--text-primary)",
            letterSpacing: "-2px",
            lineHeight: 1.05,
            margin: "0 0 20px",
            fontFamily: "'Manrope', sans-serif",
          }}>
            Trade Tokenized<br />
            <span style={{
              color: "transparent",
              backgroundImage: "linear-gradient(135deg, #00A3FF 0%, #00CC88 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}>
              Real-World Assets.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 17, fontWeight: 400,
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            margin: "0 0 36px",
            maxWidth: 460,
          }}>
            Buy and sell BlackRock BUIDL tokens at the exact fund NAV.
            Powered by Chainlink oracles. No slippage. No surprises.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
            <Link href="/trade" style={{
              padding: "14px 32px", borderRadius: 9999,
              background: "#00A3FF", color: "white",
              fontSize: 15, fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,163,255,0.30)",
              display: "flex", alignItems: "center", gap: 7,
              transition: "transform 0.15s, box-shadow 0.15s",
              fontFamily: "'Manrope', sans-serif",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,163,255,0.40)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,163,255,0.30)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Start Trading
            </Link>

            <Link href="/pool" style={{
              padding: "14px 28px", borderRadius: 9999,
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: 15, fontWeight: 600,
              textDecoration: "none",
              border: "1.5px solid var(--border-strong)",
              display: "flex", alignItems: "center", gap: 7,
              transition: "background 0.15s",
              fontFamily: "'Manrope', sans-serif",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-input)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              View Markets
            </Link>
          </div>

          {/* Stats row */}
          <div className="hero-stats" style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", marginTop: 40 }}>
            {[
              { value: "~$100", label: "Fund NAV" },
              { value: "±0.5%", label: "Slippage Protection" },
              { value: "0.05%", label: "Platform Fee" },
              { value: "Chainlink", label: "Oracle Network" },
            ].map((stat, i, arr) => (
              <div key={i} style={{
                paddingRight: i < arr.length - 1 ? 24 : 0,
                marginRight: i < arr.length - 1 ? 24 : 0,
                borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                flexShrink: 0,
              }}>
                <div style={{
                  fontSize: 17, fontWeight: 700,
                  fontFamily: "'Roboto Mono', monospace",
                  color: "var(--text-primary)", letterSpacing: "-0.3px",
                  whiteSpace: "nowrap",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: "var(--text-muted)", textTransform: "uppercase",
                  letterSpacing: "0.5px", marginTop: 2,
                  whiteSpace: "nowrap",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — large logo visual */}
        <div className="logo-side" style={{
          flex: "0 0 420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute",
            width: 380, height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,163,255,0.12) 0%, rgba(0,204,136,0.08) 40%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/LogoLiquidBridgeTransparan.png"
            alt="LiquidBridge"
            style={{
              width: 380, height: 380,
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 20px 60px rgba(0,163,255,0.15)) drop-shadow(0 0 40px rgba(0,204,136,0.10))",
              animation: "logoFloat 4s ease-in-out infinite",
            }}
          />
        </div>

      </section>
      </div>{/* end full-width hero wrapper */}

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto 72px", padding: "0 64px", textAlign: "center" }}>
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

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)",
              border: "none",
              borderRadius: 16,
              padding: "24px",
              textAlign: "left",
              boxShadow: "var(--card-shadow)",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${f.glowColor}, 0 4px 12px ${f.glowColor}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
              }}
            >
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: f.bgColor, filter: "blur(24px)", pointerEvents: "none",
              }} />
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: f.bgColor, color: f.color,
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
      <section style={{ maxWidth: 780, margin: "0 auto 48px", padding: "0 24px" }}>
        <div className="cta-section" style={{
          borderRadius: 20,
          padding: "52px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--card-shadow)",
        }}>
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

          <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.6px", marginBottom: 12 }}>
            Ready to trade?
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 28 }}>
            Get test tokens from the faucet and start trading in under 2 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/trade" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 12,
              background: "var(--accent-blue)", color: "white",
              fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,163,255,0.3)",
            }}>
              Open Trade App
            </Link>
            <Link href="/portfolio" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 12,
              background: "var(--bg-input)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: 14, fontWeight: 600,
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
