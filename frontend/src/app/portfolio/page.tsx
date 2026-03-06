import { Portfolio } from "@/components/portfolio/Portfolio";

export default function PortfolioPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          My Assets
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Your balances, positions, and test token faucet
        </p>
      </div>
      <Portfolio />
    </div>
  );
}
