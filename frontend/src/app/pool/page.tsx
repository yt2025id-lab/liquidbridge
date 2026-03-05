import { PoolDashboard } from "@/components/pool/PoolDashboard";

export default function PoolPage() {
  return (
    <div className="page-enter">
      <div className="text-center mb-8" style={{ paddingTop: 28 }}>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Markets
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Live BUIDL price, fund health, and real-time analytics
        </p>
      </div>
      <PoolDashboard />
    </div>
  );
}
