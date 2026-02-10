"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ABIS } from "@/lib/contracts";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useCompliance } from "@/hooks/useCompliance";
import { useNAV } from "@/hooks/useNAV";
import { formatUSDC, formatRWA, formatNAV } from "@/lib/utils";
import { Droplets, Shield, Wallet, Loader2 } from "lucide-react";

export function Portfolio() {
  const { address, isConnected } = useAccount();
  const { usdcBalance, rwaBalance, lpBalance, refetch } = useTokenBalances();
  const { isCompliant, selfWhitelist, isWhitelisting } = useCompliance();
  const { nav } = useNAV();

  const { writeContract: faucetUsdc, data: usdcHash, isPending: usdcPending } = useWriteContract();
  const { isLoading: usdcConfirming, isSuccess: usdcSuccess } = useWaitForTransactionReceipt({ hash: usdcHash });

  const { writeContract: faucetRwa, data: rwaHash, isPending: rwaPending } = useWriteContract();
  const { isLoading: rwaConfirming, isSuccess: rwaSuccess } = useWaitForTransactionReceipt({ hash: rwaHash });

  if (usdcSuccess || rwaSuccess) {
    refetch();
  }

  const navPrice = nav ? Number(nav) / 1e6 : 100;
  const usdcValue = usdcBalance ? Number(usdcBalance) / 1e6 : 0;
  const rwaValue = rwaBalance ? (Number(rwaBalance) / 1e18) * navPrice : 0;
  const totalValue = usdcValue + rwaValue;

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Wallet size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400">
          Connect your wallet to view your portfolio and get test tokens
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Faucet Card - Most important for judges */}
      <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-2xl border border-teal-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Droplets size={20} className="text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Test Token Faucet</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Get test tokens to try LiquidBridge. Each click gives you 10,000 USDC
          or 100 mBUILD.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() =>
              faucetUsdc({
                address: CONTRACTS.mockUSDC,
                abi: ABIS.usdc,
                functionName: "faucet",
              })
            }
            disabled={usdcPending || usdcConfirming}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500/20 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition disabled:opacity-50"
          >
            {usdcPending || usdcConfirming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span className="text-lg">$</span>
            )}
            {usdcPending
              ? "Minting..."
              : usdcConfirming
              ? "Confirming..."
              : "Get 10,000 USDC"}
          </button>
          <button
            onClick={() =>
              faucetRwa({
                address: CONTRACTS.mockRWAToken,
                abi: ABIS.rwaToken,
                functionName: "faucet",
              })
            }
            disabled={rwaPending || rwaConfirming}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-500/20 text-blue-400 rounded-xl font-medium hover:bg-blue-500/30 transition disabled:opacity-50"
          >
            {rwaPending || rwaConfirming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span className="text-lg">B</span>
            )}
            {rwaPending
              ? "Minting..."
              : rwaConfirming
              ? "Confirming..."
              : "Get 100 mBUILD"}
          </button>
        </div>

        {/* Self-whitelist */}
        {!isCompliant && (
          <button
            onClick={selfWhitelist}
            disabled={isWhitelisting}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 bg-yellow-500/20 text-yellow-400 rounded-xl font-medium hover:bg-yellow-500/30 transition disabled:opacity-50"
          >
            {isWhitelisting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Shield size={16} />
            )}
            {isWhitelisting ? "Verifying..." : "Complete KYC Verification"}
          </button>
        )}
        {isCompliant && (
          <div className="mt-3 flex items-center gap-2 text-sm text-teal-400">
            <Shield size={14} />
            KYC Verified - You can trade on LiquidBridge
          </div>
        )}
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-1">
          Total Portfolio Value
        </h3>
        <p className="text-3xl font-bold text-white font-mono">
          ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Token Balances */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800">
        <TokenRow
          symbol="USDC"
          name="USD Coin"
          balance={usdcBalance ? formatUSDC(usdcBalance) : "0.00"}
          value={`$${usdcValue.toFixed(2)}`}
          icon="$"
          iconColor="bg-green-500"
        />
        <TokenRow
          symbol="mBUILD"
          name="Mock BUIDL Token"
          balance={rwaBalance ? formatRWA(rwaBalance) : "0.0000"}
          value={`$${rwaValue.toFixed(2)}`}
          icon="B"
          iconColor="bg-blue-500"
        />
        <TokenRow
          symbol="lbLP"
          name="LP Token"
          balance={lpBalance ? formatRWA(lpBalance) : "0.0000"}
          value="-"
          icon="LP"
          iconColor="bg-purple-500"
        />
      </div>
    </div>
  );
}

function TokenRow({
  symbol,
  name,
  balance,
  value,
  icon,
  iconColor,
}: {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  icon: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center text-white font-bold text-xs`}
        >
          {icon}
        </div>
        <div>
          <p className="text-white font-medium">{symbol}</p>
          <p className="text-gray-500 text-sm">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-mono">{balance}</p>
        <p className="text-gray-500 text-sm font-mono">{value}</p>
      </div>
    </div>
  );
}
