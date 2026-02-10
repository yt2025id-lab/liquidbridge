import { LiquidityManager } from "@/components/liquidity/LiquidityManager";

export default function LiquidityPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Manage Liquidity
        </h1>
        <p className="text-gray-400">
          Add or remove liquidity from the mBUILD/USDC pool
        </p>
      </div>
      <LiquidityManager />
    </div>
  );
}
