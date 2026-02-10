"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { type Abi } from "viem";
import { CONTRACTS, ABIS } from "@/lib/contracts";

export function useNAV() {
  const { data: latestNAV, refetch } = useReadContract({
    address: CONTRACTS.navOracle,
    abi: ABIS.navOracle,
    functionName: "getLatestNAV",
    query: { refetchInterval: 5000 },
  });

  const { data: historyLen } = useReadContract({
    address: CONTRACTS.navOracle,
    abi: ABIS.navOracle,
    functionName: "historyLength",
    query: { refetchInterval: 10000 },
  });

  const length = Number(historyLen || 0);
  const indices = Array.from({ length: Math.min(length, 24) }, (_, i) =>
    length > 24 ? length - 24 + i : i
  );

  const { data: historyData } = useReadContracts({
    contracts: indices.map((i) => ({
      address: CONTRACTS.navOracle,
      abi: ABIS.navOracle as Abi,
      functionName: "getHistoricalNAV",
      args: [BigInt(i)],
    })),
    query: { refetchInterval: 15000 },
  });

  const navData = latestNAV as
    | {
        nav: bigint;
        timestamp: bigint;
        reserveRatio: bigint;
        isStale: boolean;
      }
    | undefined;

  const history = historyData
    ?.filter((r) => r.status === "success")
    .map((r) => {
      const d = r.result as {
        nav: bigint;
        timestamp: bigint;
        reserveRatio: bigint;
        isStale: boolean;
      };
      return {
        nav: Number(d.nav) / 1e6,
        timestamp: Number(d.timestamp),
        reserveRatio: Number(d.reserveRatio) / 100,
      };
    }) || [];

  return {
    nav: navData?.nav,
    timestamp: navData?.timestamp,
    reserveRatio: navData?.reserveRatio,
    isStale: navData?.isStale ?? false,
    history,
    refetch,
  };
}
