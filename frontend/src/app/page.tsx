import { SwapCard } from "@/components/swap/SwapCard";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          NAV-Anchored Swap
        </h1>
        <p className="text-gray-400">
          Trade tokenized securities with prices anchored to Chainlink NAVLink
          oracle
        </p>
      </div>
      <SwapCard />
    </div>
  );
}
