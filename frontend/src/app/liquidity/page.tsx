import { LiquidityManager } from "@/components/liquidity/LiquidityManager";

export default function LiquidityPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Earn Rewards</h1>
        <p className="text-slate-500">
          Provide liquidity to the BUIDL/USDC pool and earn platform fees
        </p>
      </div>
      <LiquidityManager />
    </div>
  );
}
