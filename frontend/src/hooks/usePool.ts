"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, ABIS } from "@/lib/contracts";

export function usePool() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "getPoolState",
    query: { refetchInterval: 10000 },
  });

  const { data: totalVolume } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "totalVolume",
    query: { refetchInterval: 10000 },
  });

  const { data: totalFees } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "totalFees",
    query: { refetchInterval: 10000 },
  });

  const { data: swapCount } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "swapCount",
    query: { refetchInterval: 10000 },
  });

  const { data: currentFee } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "getCurrentFee",
    query: { refetchInterval: 10000 },
  });

  const { data: impliedPrice } = useReadContract({
    address: CONTRACTS.pool,
    abi: ABIS.pool,
    functionName: "getImpliedPrice",
    query: { refetchInterval: 10000 },
  });

  const poolState = data as
    | {
        reserveRWA: bigint;
        reserveUSDC: bigint;
        totalLiquidity: bigint;
        navPrice: bigint;
        upperBound: bigint;
        lowerBound: bigint;
        baseFee: bigint;
        circuitBreakerActive: boolean;
      }
    | undefined;

  return {
    poolState,
    totalVolume: totalVolume as bigint | undefined,
    totalFees: totalFees as bigint | undefined,
    swapCount: swapCount as bigint | undefined,
    currentFee: currentFee as bigint | undefined,
    impliedPrice: impliedPrice as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}
