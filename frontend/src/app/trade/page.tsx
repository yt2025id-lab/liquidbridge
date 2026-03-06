"use client";

import { SwapCard } from "@/components/swap/SwapCard";

const STEPS = [
  {
    color: "#00A3FF",
    bgColor: "rgba(0, 163, 255, 0.08)",
    step: "STEP 01",
    title: "Connect your wallet",
    desc: "Use MetaMask or any Web3 wallet. Takes 10 seconds.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    color: "#00CC88",
    bgColor: "rgba(0, 204, 136, 0.08)",
    step: "STEP 02",
    title: "Verify your identity",
    desc: "One-time KYC to comply with securities regulations.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.08)",
    step: "STEP 03",
    title: "Buy or sell instantly",
    desc: "Trade at the real fund price. No slippage, no surprises.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "What is LiquidBridge?",
    a: "LiquidBridge is a DeFi protocol that lets you buy and sell tokenized real-world assets (RWAs) at the exact fund NAV, powered by Chainlink oracle pricing.",
  },
  {
    q: "What is BlackRock BUIDL?",
    a: "BUIDL is BlackRock's tokenized money market fund. Each token represents a share in the fund, priced at ~$100 per token and backed by US treasuries.",
  },
  {
    q: "How is the price determined?",
    a: "The price is set by Chainlink Data Feeds, which report the official NAV from BlackRock. Trading is constrained to ±0.5% of this NAV.",
  },
  {
    q: "What are the fees?",
    a: "LiquidBridge charges a dynamic fee between 0.05% and 0.5%, depending on market conditions. Fees are distributed to liquidity providers.",
  },
  {
    q: "How do I get started?",
    a: "Connect your wallet, get test tokens from the faucet in My Assets, complete the one-time KYC check, then buy or sell BUIDL tokens on the Trade page.",
  },
];

export default function TradePage() {
  return (
    <div className="page-enter">
      {/* Hero + SwapCard */}
      <div className="max-w-[560px] mx-auto">
        <div className="text-center trade-hero" style={{
          paddingTop: 48,
          paddingBottom: 40,
          position: "relative",
          background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(0,163,255,0.06) 0%, rgba(0,163,255,0.03) 40%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        }}>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.8px",
            lineHeight: 1.1,
            margin: "0 0 12px",
          }}>
            Trade BUIDL
          </h1>
          <p style={{
            fontSize: 15,
            fontWeight: 400,
            color: "var(--text-secondary)",
            margin: 0,
            letterSpacing: "-0.1px",
          }}>
            Buy and sell BlackRock BUIDL tokens at the real fund price
          </p>
        </div>

        <SwapCard />
      </div>

      {/* How it works */}
      <section style={{ marginTop: 56, marginBottom: 16, textAlign: "center", width: "100%" }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.4px",
          marginBottom: 24,
        }}>
          How it works
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 16px",
          alignItems: "stretch",
        }}>
          {STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                background: "var(--bg-surface)",
                borderRadius: 16,
                padding: "24px 20px 28px",
                border: "1px solid var(--border)",
                boxShadow: "var(--card-shadow)",
                textAlign: "left",
                cursor: "default",
                display: "flex",
                flexDirection: "column",
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
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: s.bgColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.color, marginBottom: 14,
                marginLeft: "auto", marginRight: "auto",
              }}>
                {s.icon}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "1px",
                textTransform: "uppercase", color: s.color,
                marginBottom: 8, textAlign: "center",
              }}>
                {s.step}
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: "var(--text-primary)", marginBottom: 8,
                letterSpacing: "-0.2px", lineHeight: 1.3,
              }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)", lineHeight: 1.65, flex: 1 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-[520px] mx-auto mt-10 mb-8">
        <h2 className="mb-4" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
          FAQ
        </h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details
      className="rounded-xl overflow-hidden group"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        marginBottom: 8,
      }}
    >
      <summary
        className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold"
        style={{ fontSize: 14, color: "var(--text-primary)" }}
      >
        {question}
        <span
          className="ml-3 flex-shrink-0 group-open:rotate-180"
          style={{
            color: "var(--text-secondary)", fontSize: 12,
            transition: "transform 0.2s",
            border: "none", background: "transparent", boxShadow: "none",
          }}
        >
          ▾
        </span>
      </summary>
      <div
        className="px-5 pb-4 leading-relaxed"
        style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, borderTop: "1px solid var(--border)" }}
      >
        <div className="pt-3">{answer}</div>
      </div>
    </details>
  );
}
