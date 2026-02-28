import { SwapCard } from "@/components/swap/SwapCard";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 pt-4">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-teal-100">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
          Powered by Chainlink · Live on Base Sepolia
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Invest in tokenized funds.<br />
          <span className="text-teal-600">Instantly.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Buy and sell <strong className="text-slate-700">BlackRock BUIDL</strong> tokens at the exact real-world price.
          No waiting. No middleman. Price guaranteed within <strong className="text-slate-700">0.5%</strong> of fund value.
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <span>⛓</span> Secured by Chainlink
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <span>🏦</span> BlackRock BUIDL
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <span>🛡️</span> Price Guaranteed
          </div>
        </div>
      </div>

      {/* Trade Card */}
      <SwapCard />

      {/* How it works */}
      <div className="mt-16 max-w-3xl mx-auto pb-8">
        <h2 className="text-center text-xl font-bold text-slate-900 mb-8">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Connect your wallet",
              desc: "Use MetaMask or any Web3 wallet. Takes 10 seconds.",
              icon: "🔗",
            },
            {
              step: "2",
              title: "Verify your identity",
              desc: "One-time verification to comply with securities regulations.",
              icon: "✅",
            },
            {
              step: "3",
              title: "Buy or sell instantly",
              desc: "Trade at the real fund price. No slippage, no surprises.",
              icon: "⚡",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs font-bold text-teal-600 mb-1 uppercase tracking-wide">
                Step {item.step}
              </div>
              <div className="font-semibold text-slate-900 mb-2">{item.title}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
