"use client";

import { useAccount, useReadContracts } from "wagmi";
import { CONTRACTS, ABIS } from "@/lib/contracts";

export function useTokenBalances() {
  const { address } = useAccount();

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.mockUSDC,
        abi: ABIS.usdc,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: CONTRACTS.mockRWAToken,
        abi: ABIS.rwaToken,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: CONTRACTS.pool,
        abi: ABIS.pool,
        functionName: "balanceOf",
        args: [address!],
      },
    ],
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  return {
    usdcBalance: data?.[0]?.result as bigint | undefined,
    rwaBalance: data?.[1]?.result as bigint | undefined,
    lpBalance: data?.[2]?.result as bigint | undefined,
    refetch,
  };
}
