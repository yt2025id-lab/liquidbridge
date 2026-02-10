import { PoolDashboard } from "@/components/pool/PoolDashboard";

export default function PoolPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pool Dashboard</h1>
        <p className="text-gray-400">
          Real-time NAV tracking, reserve status, and pool analytics
        </p>
      </div>
      <PoolDashboard />
    </div>
  );
}
