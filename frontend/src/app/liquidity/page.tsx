import { LiquidityManager } from "@/components/liquidity/LiquidityManager";

export default function LiquidityPage() {
  return (
    <div className="page-enter">
      <div className="text-center mb-8" style={{ paddingTop: 28 }}>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Earn Rewards
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Provide liquidity to the BUIDL/USDC pool and earn platform fees
        </p>
      </div>
      <LiquidityManager />
    </div>
  );
}
