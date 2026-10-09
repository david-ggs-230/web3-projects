// Src/CounterContractReadUI.tsx
import { useState, useEffect } from "react";
import type { Address } from "viem";
import type { Contract } from "ethers";
import { useCounterEthersRead } from "./utils/useCounterContract";
import { useRefreshStore } from "./utils/refreshStrore";

export default function CounterContractReadUI({
  apiAddress,
}: {
  apiAddress: Address;
}) {
  const [contract] = useCounterEthersRead(apiAddress);
  //Const refresh = useRefreshStore((state: any) => state.refresh);
  const { refresh, setRefresh } = useRefreshStore() as any;
  useEffect(() => {
    if (contract) {
       void (contract as Contract).on("CountChanged", () => {
      setRefresh();
    });
    }else{
      return;
    }

   
    return () => {
       (contract as Contract).removeAllListeners("CountChanged");
    };
  }, [contract]);

  const [countState, setCountState] = useState({
    isLoading: true,
    isError: false,
    count: 0n,
    errorMessage: null as string | null,
  });

  const [ownerState, setOwnerState] = useState({
    isLoading: true,
    isError: false,
    owner: null as string | null,
    errorMessage: null as string | null,
  });

  // Isolate on-chain data fetching inside an effect layer
  useEffect(() => {
    // If the contract isn't ready or initialized yet, wait for it
    if (!contract) {
      return;
    }
    // Reset loading state whenever the contract instance changes
    setCountState((prev) => ({ ...prev, isLoading: true, isError: false }));
    setOwnerState((prev) => ({ ...prev, isLoading: true, isError: false }));

    // 1. Fetch count safely
     (contract as Contract).count()
      .then((c: bigint) => {
        setCountState((prev) => ({
          ...prev,
          isLoading: false,
          isError: false,
          count: c,
        }));
      })
      .catch((e: Error) => {
        // Console.error("Count read failed:", e);
        setCountState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          errorMessage: e.message,
        }));
      });

    // 2. Fetch owner safely
     (contract as Contract).owner()
      .then((o: string) => {
        setOwnerState((prev) => ({
          ...prev,
          isLoading: false,
          isError: false,
          owner: o,
        }));
      })
      .catch((e: Error) => {
        // Console.error("Owner read failed:", e);
        setOwnerState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          errorMessage: e.message,
        }));
      });
  }, [contract, refresh]); // Re-runs ONLY when the contract instance truly modifies
  if(!contract) {return(<>Failed to initialize BrowserProvider for retrieving contract data</>);}
  return (
    <div className="ui-section-wrapper">
      <h4 className="sub-heading-center">Contract Read</h4>
      {countState.isLoading && ownerState.isLoading && (
        <div className="status-text-center">🔍 Reading on‑chain data...</div>
      )}
      {(countState.isError || ownerState.isError) && (
        <div className="status-text-center" style={{ color: "red" }}>
          Failed to read contract
        </div>
      )}
      <div className="contract-card">
        <p>
          <strong>Count:</strong> {countState.count?.toString() ?? "--"}
        </p>
        <p>
          <strong>Owner:</strong>
          <span style={{ fontSize: "0.8rem" }}>{ownerState.owner ?? "--"}</span>
        </p>
      </div>
    </div>
  );
}
