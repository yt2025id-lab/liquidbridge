"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ABIS } from "@/lib/contracts";

export function useCompliance() {
  const { address } = useAccount();

  const { data: isCompliant, refetch } = useReadContract({
    address: CONTRACTS.complianceVerifier,
    abi: ABIS.compliance,
    functionName: "isCompliant",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const selfWhitelist = () => {
    writeContract({
      address: CONTRACTS.complianceVerifier,
      abi: ABIS.compliance,
      functionName: "selfWhitelist",
    });
  };

  if (isSuccess) {
    refetch();
  }

  return {
    isCompliant: isCompliant as boolean | undefined,
    selfWhitelist,
    isWhitelisting: isPending || isConfirming,
    refetch,
  };
}
