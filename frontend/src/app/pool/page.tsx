import { PoolDashboard } from "@/components/pool/PoolDashboard";

export default function PoolPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Markets</h1>
        <p className="text-slate-500">
          Live BUIDL price, fund health, and real-time analytics
        </p>
      </div>
      <PoolDashboard />
    </div>
  );
}
