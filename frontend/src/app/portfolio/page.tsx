import { Portfolio } from "@/components/portfolio/Portfolio";

export default function PortfolioPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-gray-400">
          Your balances, positions, and test token faucet
        </p>
      </div>
      <Portfolio />
    </div>
  );
}
