import { Portfolio } from "@/components/portfolio/Portfolio";

export default function PortfolioPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Assets</h1>
        <p className="text-slate-500">
          Your balances, positions, and test token faucet
        </p>
      </div>
      <Portfolio />
    </div>
  );
}
