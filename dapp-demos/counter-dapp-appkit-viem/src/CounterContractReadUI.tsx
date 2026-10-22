import { useQueryClient } from "@tanstack/react-query";
import { useReadContracts, useWatchContractEvent } from "wagmi";
import type { Address } from "viem";
import { counterAbi } from "./abis/counterAbi";
import {
  useRefreshStore,
  type OwnerStoreState,
  useOwnerStore,
} from "./utils/zustandStrore";

import { useEffect } from "react";

export default function CounterContractReadUI({
  apiAddress,
}: {
  apiAddress: Address;
}) {
  const queryClient = useQueryClient();
  const COUNTER_CONTRACT: Address = apiAddress;
  const refresh = useRefreshStore((state) => state.refresh);
  const ownerStore = useOwnerStore() as OwnerStoreState;
  useEffect(() => {
    void queryClient.invalidateQueries({
      queryKey: ["readContracts"],
    });
  }, [refresh, queryClient]);
  // 1. Use useReadContracts to read on-chain data
  const {
    data: readData,
    isLoading: readLoading,
    isError: readError,
  } = useReadContracts({
    contracts: [
      {
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "count",
      },
      {
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "owner",
      },
    ],
    query: {
      enabled: true, // Simplified since COUNTER_CONTRACT is guaranteed to exist by prop types
      staleTime: 4000,
    },
  });

  // 2. Listen to contract events to dynamically refresh cache
  useWatchContractEvent({
    address: COUNTER_CONTRACT,
    abi: counterAbi.abi,
    eventName: "CountChanged",
    onLogs() {
      void queryClient.invalidateQueries({
        queryKey: ["readContracts"],
      });
    },
  });

  // 3. Align data parsing and fallback logic
  const countResult = readData?.[0];
  const ownerResult = readData?.[1];

  // Calculate separate loading/error states cleanly without type overlaps or redundant code
  const isCountLoading = readLoading;
  const isOwnerLoading = readLoading;

  const isCountError = countResult?.status === "failure";
  const isOwnerError = ownerResult?.status === "failure";

  const currentCount =
    countResult?.status === "success" ? countResult.result : undefined;
  const contractOwner =
    ownerResult?.status === "success"
      ? (ownerResult.result as string)
      : undefined;

  useEffect(() => {
    if (contractOwner && contractOwner !== ownerStore.counterOwner) {
      ownerStore.setCounterOwner(contractOwner);
    }
  }, [contractOwner, ownerStore]);
  // if (contractOwner && contractOwner !== ownerStore.counterOwner) {
  //   ownerStore.setCounterOwner(contractOwner);
  // }
  return (
    <div className="ui-section-wrapper">
      <h4 className="sub-heading-center">Contract Read</h4>

      {/* Show loading text only when both data fields are loading */}
      {isCountLoading && isOwnerLoading && (
        <div className="status-text-center">🔍 Reading on‑chain data...</div>
      )}

      {/* Display error message if any read operation fails */}
      {(readError || isCountError || isOwnerError) && (
        <div className="status-text-center" style={{ color: "red" }}>
          Failed to read contract
        </div>
      )}

      <div className="contract-card">
        <p>
          <strong>Count:</strong> {currentCount?.toString() ?? "--"}
        </p>
        <p>
          <strong>Owner:</strong>
          <span style={{ fontSize: "0.8rem" }}>{contractOwner ?? "--"}</span>
        </p>
      </div>
    </div>
  );
}
