import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useEstimateFeesPerGas,
} from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { type Address } from "viem";
import { counterAbi } from "./abis/counterAbi";
import {
  type BigIntParseResult,
  stringToUintSafe,
  formatErrorMessage,
} from "./utils/utils";
import { parseGwei } from "viem";
import { useChainId } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import {
  type RefreshStoreState,
  useRefreshStore,
  type OwnerStoreState,
  useOwnerStore,
} from "./utils/zustandStrore";

export default function CounterContractWriteUI({
  apiAddress,
}: {
  apiAddress: Address;
}) {
  const COUNTER_CONTRACT: Address = apiAddress; //counterAbi.sepoliaaddress;
  const chainId = useChainId();
  const ownerStore = useOwnerStore() as OwnerStoreState;

  const setRefresh = useRefreshStore(
    (state: RefreshStoreState) => state.setRefresh,
  );

  const [signerAddress, setSignerAddress] = useState<string | null>(null);

  const { data: feeData } = useEstimateFeesPerGas();
  // 2. Fetch live data with fallback safety boundaries
  const estimatedMaxFee = feeData?.maxFeePerGas ?? parseGwei("30");
  const { isConnected, address, status } = useAccount();
  if (status === "connected" && address !== signerAddress) {
    setSignerAddress(address);
  }
  const [txState, setTxState] = useState({
    isLoading: false,
    isTxConfirming: false,
    isWalletError: false,
    isWalletSuccess: false,
    walletError: null as string | null,
    isTxError: false,
    isTxSuccess: false,
    txError: null as string | null,
    isNonOwnerError: false,
    nonOwnerError: null as string | null,
    hash: null as string | null,
    txReceipt: null as string | null,
    action: null as string | null,
  });

  const {
    data: hash,
    isPending: isWalletPending,
    isError: isWalletError,
    error: walletError,
    isSuccess: isWalletSuccess,
    writeContract,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });
  const resetStates = useCallback(
    (action: string | null = null) => {
      resetWriteContract();

      setTxState({
        isLoading: false,
        isTxConfirming: false,
        isWalletError: false,
        isWalletSuccess: false,
        walletError: null,
        isTxError: false,
        isTxSuccess: false,
        txError: null,
        isNonOwnerError: false,
        nonOwnerError: null,
        hash: null,
        txReceipt: null,
        action: action,
      });
    },
    [resetWriteContract],
  ); // Only re-create if Wagmi's reset function changes

  const clearNonErrorStates = () => {
    setTxState((prev) => ({
      ...prev,
      isLoading: false,
      isTxConfirming: false,
      isWalletSuccess: false,
      isTxSuccess: false,
      hash: null,
      txReceipt: null,
    }));
  };
  if (isWalletPending && !txState.isLoading) {
    setTxState((prev) => ({
      ...prev,
      isLoading: true,
    }));
  }
  if (hash && txState.hash === null) {
    setTxState((prev) => ({
      ...prev,
      hash: hash,
    }));
  }
  if (isWalletError && !txState.isWalletError) {
    setTxState((prev) => ({
      ...prev,
      isWalletError: true,
      isWalletSuccess: false,
      walletError: `Wallet connect error: ${formatErrorMessage(walletError.message || "Unknown wallet error")}`,
    }));
  }
  if (isWalletSuccess && !txState.isWalletSuccess) {
    setTxState((prev) => ({
      ...prev,
      isWalletSuccess: true,
      isWalletError: false,
      walletError: null,
    }));
  }
  if (isTxConfirming && !txState.isTxConfirming) {
    setTxState((prev) => ({
      ...prev,
      isTxConfirming: true,
    }));
  }
  if (isTxSuccess && receipt.status === "success" && !txState.isTxSuccess) {
    setTxState((prev) => ({
      ...prev,
      isTxSuccess: true,
      isTxError: false,
      txError: null,
    }));
  }
  if (receipt && txState.txReceipt === null) {
    setTxState((prev) => ({
      ...prev,
      txReceipt: receipt.transactionHash,
    }));
  }
  if (isTxError && !txState.isTxError) {
    setTxState((prev) => ({
      ...prev,
      isTxError: true,
      txError: `Transaction error: ${formatErrorMessage(txError.message || "Unknown transaction error")}`,
    }));
  }
  if (isTxSuccess && receipt.status === "reverted" && !txState.isTxError) {
    setTxState((prev) => ({
      ...prev,
      isTxError: true,
      isTxSuccess: false,
      txError: `Transaction error: The transaction was mined but REVERTED on-chain.`,
    }));
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isWalletSuccess && isTxSuccess && receipt.status === "success") {
      timeoutId = setTimeout(() => {
        resetStates(null);
        setRefresh();
      }, 2000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWalletSuccess, isTxSuccess, setRefresh, receipt, resetStates]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (
      isWalletError ||
      isTxError ||
      (isTxSuccess && receipt.status !== "success")
    ) {
      timeoutId = setTimeout(() => {
        clearNonErrorStates();
      }, 2000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isWalletError, isTxError, isTxSuccess, receipt]);

  function incSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first!");
      // launch wallet connect modal, use first available connector
      return;
    }

    // Reset loading state whenever the contract instance changes
    resetStates("inc");

    if (chainId !== polygonAmoy.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore writeContract triggers a false positive type error; this call follows official docs and works properly in runtime
      writeContract({
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "increment",
        args: [],
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore writeContract triggers a false positive type error; this call follows official docs and works properly in runtime
      writeContract({
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "increment",
        args: [],
        maxPriorityFeePerGas: parseGwei("25"), // Reaches the strict 25 Gwei requirement
        maxFeePerGas:
          estimatedMaxFee < parseGwei("30") ? parseGwei("30") : estimatedMaxFee,
      });
    }
  }

  function incBySubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    resetStates("incBy");
    //if (activeAction !== "incBy") setActiveAction("incBy");
    const formData = new FormData(e.target);
    const stepBy = formData.get("stepAmount") as string;
    //console.log(stepBy);
    const stepByRes: BigIntParseResult = stringToUintSafe(stepBy);
    if (!stepByRes.ok) {
      //setTxErrorMessage(stepByRes.errorMsg);
      return;
    }
    //if (txErrorMessage !== null) setTxErrorMessage(null);
    if (chainId !== polygonAmoy.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore writeContract triggers a false positive type error; this call follows official docs and works properly in runtime
      writeContract({
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "incrementBy",
        args: [stepByRes.value],
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore writeContract triggers a false positive type error; this call follows official docs and works properly in runtime
      writeContract({
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "incrementBy",
        args: [stepByRes.value],

        maxPriorityFeePerGas: parseGwei("25"), // Reaches the strict 25 Gwei requirement
        maxFeePerGas:
          estimatedMaxFee < parseGwei("30") ? parseGwei("30") : estimatedMaxFee,
      });
    }
  }

  function resetSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first!");
      // launch wallet connect modal, use first available connector
      return;
    }

    // Reset loading state whenever the contract instance changes
    resetStates("reset");
    // 3. Perform a safe, null-checked comparison
    const owner = ownerStore.counterOwner?.toLowerCase();
    const signer = signerAddress?.toLowerCase();
    if (!owner || !signer || owner !== signer) {
      setTxState((prev) => ({
        ...prev,
        isNonOwnerError: true,
        nonOwnerError: "Only the contract owner can reset the count.",
      }));
      return;
    }
    if (chainId !== polygonAmoy.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore writeContract triggers a false positive type error; this call follows official docs and works properly in runtime
      writeContract({
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "reset",
        args: [],
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore writeContract triggers a false positive type error; this call follows official docs and works properly in runtime
      writeContract({
        address: COUNTER_CONTRACT,
        abi: counterAbi.abi,
        functionName: "reset",
        args: [],
        maxPriorityFeePerGas: parseGwei("25"), // Reaches the strict 25 Gwei requirement
        maxFeePerGas:
          estimatedMaxFee < parseGwei("30") ? parseGwei("30") : estimatedMaxFee,
      });
    }
  }

  return (
    <div className="ui-section-wrapper">
      <h4 className="sub-heading-center">Contract Write</h4>
      <div className="contract-card">
        <div>
          <strong>Count ++</strong>
          <span style={{ fontSize: "0.8rem" }}>
            <form onSubmit={incSubmit}>
              <button
                type="submit"
                disabled={txState.isLoading || txState.isTxConfirming}
              >
                Increment
              </button>
              {txState.action === "inc" && txState.isLoading && (
                <div>Waiting for wallet connection...</div>
              )}
              {txState.action === "inc" && Boolean(txState.hash) && (
                <div>Transaction Hash: {txState.hash}</div>
              )}

              {txState.action === "inc" && txState.isTxConfirming && (
                <div>Waiting for on-chain confirmation...</div>
              )}
              {txState.action === "inc" && txState.isTxSuccess && (
                <div>Transaction confirmed.</div>
              )}
              {txState.action === "inc" && txState.isWalletError && (
                <div style={{ color: "darkred" }}>{txState.walletError}</div>
              )}
              {txState.action === "inc" && txState.isTxError && (
                <div style={{ color: "darkred" }}>{txState.txError}</div>
              )}
              {txState.action === "inc" &&
                txState.isTxSuccess &&
                receipt?.status === "reverted" && (
                  <div style={{ color: "darkred" }}>
                    Transaction was mined but REVERTED on-chain.
                  </div>
                )}
            </form>
          </span>
        </div>

        <div className="write-card-row-gap">
          <strong>Step</strong>
          <span style={{ fontSize: "0.8rem" }}>
            <form onSubmit={incBySubmit}>
              <div className="form-row-step">
                <input name="stepAmount" placeholder="5" required />
                <button
                  type="submit"
                  disabled={txState.isLoading || txState.isTxConfirming}
                >
                  IncrementBy
                </button>
              </div>
              {txState.action === "incBy" && txState.isLoading && (
                <div>Waiting for wallet connection...</div>
              )}
              {txState.action === "incBy" && Boolean(txState.hash) && (
                <div>Transaction Hash: {txState.hash}</div>
              )}

              {txState.action === "incBy" && txState.isTxConfirming && (
                <div>Waiting for on-chain confirmation...</div>
              )}
              {txState.action === "incBy" && txState.isTxSuccess && (
                <div>Transaction confirmed.</div>
              )}
              {txState.action === "incBy" && txState.isWalletError && (
                <div style={{ color: "darkred" }}>{txState.walletError}</div>
              )}
              {txState.action === "incBy" && txState.isTxError && (
                <div style={{ color: "darkred" }}>{txState.txError}</div>
              )}
              {txState.action === "incBy" &&
                txState.isTxSuccess &&
                receipt?.status === "reverted" && (
                  <div style={{ color: "darkred" }}>
                    Transaction was mined but REVERTED on-chain.
                  </div>
                )}
            </form>
          </span>
        </div>

        <div className="write-card-row-gap">
          <strong>Count := 0</strong>
          <span style={{ fontSize: "0.8rem" }}>
            <form onSubmit={resetSubmit}>
              <button
                type="submit"
                disabled={txState.isLoading || txState.isTxConfirming}
              >
                Reset
              </button>
              {txState.action === "reset" && txState.isLoading && (
                <div>Waiting for wallet connection...</div>
              )}
              {txState.action === "reset" && Boolean(txState.hash) && (
                <div>Transaction Hash: {txState.hash}</div>
              )}

              {txState.action === "reset" && txState.isTxConfirming && (
                <div>Waiting for on-chain confirmation...</div>
              )}
              {txState.action === "reset" && txState.isTxSuccess && (
                <div>Transaction confirmed.</div>
              )}
              {txState.action === "reset" && txState.isWalletError && (
                <div style={{ color: "darkred" }}>{txState.walletError}</div>
              )}
              {txState.action === "reset" && txState.isTxError && (
                <div style={{ color: "darkred" }}>{txState.txError}</div>
              )}
              {txState.action === "reset" &&
                txState.isTxSuccess &&
                receipt?.status === "reverted" && (
                  <div style={{ color: "darkred" }}>
                    Transaction was mined but REVERTED on-chain.
                  </div>
                )}

              {txState.action === "reset" && txState.isNonOwnerError && (
                <div style={{ color: "darkred" }}>{txState.nonOwnerError}</div>
              )}
            </form>
          </span>
        </div>
      </div>
    </div>
  );
}
