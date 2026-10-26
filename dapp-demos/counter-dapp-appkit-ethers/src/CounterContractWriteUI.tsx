// Src/CounterContractWriteUI.tsx
import { useState } from "react";
//import type { Contract } from "ethers";
import {
  parseUnits,
  //type Contract,
  ContractTransactionResponse,
  type Signer,
} from "ethers";
import { polygonAmoy } from "wagmi/chains";
import { useCounterEthersWrite } from "./utils/useCounterContract";
import { stringToUintSafe, formatErrorMessage } from "./utils/utils";
import { useRefreshStore } from "./utils/refreshStrore";

export default function CounterContractWriteUI({
  apiAddress,
}: {
  apiAddress: string;
}) {
  const [contract, signer, chainId] = useCounterEthersWrite(apiAddress);
  const setRefresh = useRefreshStore((state) => state.setRefresh);

  const resetStates = (action: string | null = null) => {
    setTxState({
      isLoading: false,
      isError: false,
      isTxConfirming: false,
      isSuccess: false,
      action,
      hash: null,
      txReceipt: null,
      errorMessage: null,
    });
  };

  const [txState, setTxState] = useState({
    isLoading: false,
    isTxConfirming: false,
    isError: false,
    isSuccess: false,
    hash: null as string | null,
    txReceipt: null as string | null,
    action: null as string | null,
    errorMessage: null as string | null,
  });

  async function incSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signer) {
      alert("Please connect your wallet first!");
      // Launch wallet connect modal, use first available connector
      return;
    }
    // Reset loading state whenever the contract instance changes
    resetStates("inc");

    try {
      // 1. Set loading state
      setTxState((prev) => ({
        ...prev,
        isLoading: true,
      }));
      // 2. contract write and update transaction state
      let tx: ContractTransactionResponse;

      if (chainId === polygonAmoy.id) {
        tx = await (contract!.increment({
          maxPriorityFeePerGas: parseUnits("25", "gwei"),
          maxFeePerGas: parseUnits("30", "gwei"),
        }) as Promise<ContractTransactionResponse>);
      } else {
        tx =
          await (contract!.increment() as Promise<ContractTransactionResponse>);
      }
      setTxState((prev) => ({
        ...prev,
        isTxConfirming: true,
        hash: tx.hash,
      }));
      // 3. transaction confirm and update transaction state
      const receipt = await tx.wait();

      setTxState((prev) => ({
        ...prev,
        isSuccess: true,
        isError: false,
        txReceipt: receipt ? receipt.hash : null,
      }));
    } catch (err: unknown) {
      let errorMsg = null;
      if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = "Count read failed";
      }
      // Console.error("Count read failed:", e.message);
      setTxState((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
        errorMessage: errorMsg,
      }));
    }
    setTimeout(() => {
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        isTxConfirming: false,
        isSuccess: false,
        hash: null,
        txReceipt: null,
      }));
      setRefresh();
    }, 2000);
  }

  async function incBySubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signer) {
      alert("Please connect your wallet first!");
      // Launch wallet connect modal, use first available connector
      return;
    }
    // Reset loading state whenever the contract instance changes
    resetStates("incBy");

    const formData = new FormData(e.target);
    const stepBy = formData.get("stepAmount") as string;
    // Console.log(stepBy);
    const stepByRes = stringToUintSafe(stepBy);

    if (!stepByRes.ok) {
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        isTxConfirming: false,
        isError: true,
        errorMessage: stepByRes.errorMsg,
      }));
      return;
    }
    try {
      // 1. Set loading state
      setTxState((prev) => ({
        ...prev,
        isLoading: true,
      }));
      // 2. contract write and update transaction state
      //Const tx = await (contract as Contract).incrementBy!(stepByRes.value);
      let tx: ContractTransactionResponse;
      if (chainId === polygonAmoy.id) {
        tx = await (contract!.incrementBy(stepByRes.value, {
          maxPriorityFeePerGas: parseUnits("25", "gwei"),
          maxFeePerGas: parseUnits("30", "gwei"),
        }) as Promise<ContractTransactionResponse>);
      } else {
        tx = await (contract!.incrementBy(
          stepByRes.value,
        ) as Promise<ContractTransactionResponse>);
      }

      setTxState((prev) => ({
        ...prev,
        isTxConfirming: true,
        hash: tx.hash,
      }));
      // 3. transaction confirm and update transaction state
      const receipt = await tx.wait();

      setTxState((prev) => ({
        ...prev,
        isSuccess: true,
        isError: false,
        txReceipt: receipt ? receipt.hash : null,
      }));
    } catch (err: unknown) {
      let errorMsg = null;
      if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = "Count read failed";
      }
      // Console.error("Count read failed:", e.message);
      setTxState((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
        errorMessage: errorMsg,
      }));
    }
    setTimeout(() => {
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        isTxConfirming: false,
        isSuccess: false,
        hash: null,
        txReceipt: null,
      }));
      setRefresh();
    }, 2000);
  }

  async function resetSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signer) {
      alert("Please connect your wallet first!");
      // Launch wallet connect modal, use first available connector
      return;
    }

    // Reset loading state whenever the contract instance changes
    resetStates("reset");
    try {
      // 2. Fetch both the owner and the signer address asynchronously
      const [ownerAddress, walletAddress] = await Promise.all([
        contract!.owner() as Promise<string>,
        (signer as Signer).getAddress(), // Use the official ethers.js method
      ]);
      // 2. Perform the authorization check immediately where the variables are guaranteed to exist
      if (ownerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        setTxState((prev) => ({
          ...prev,
          isLoading: false,
          isTxConfirming: false,
          isError: true,
          isSuccess: false,
          hash: null,
          txReceipt: null,
          errorMessage: "Only the contract owner can reset the count.",
        }));
        return;
      }
      //Console.log("contract owner: ", owner, "signer address: ", signerAddress);
    } catch (err: unknown) {
      let errorMsg = "unknown error";
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        isTxConfirming: false,
        isError: true,
        isSuccess: false,
        hash: null,
        txReceipt: null,
        errorMessage: `failed to get contract owner: ${errorMsg}`,
      }));
      return;
    }

    try {
      // 1. Set loading state
      setTxState((prev) => ({
        ...prev,
        isLoading: true,
      }));
      // 2. contract write and update transaction state
      //Const tx = await (contract as Contract).reset!();
      let tx: ContractTransactionResponse;
      if (chainId === polygonAmoy.id) {
        tx = await (contract!.reset({
          maxPriorityFeePerGas: parseUnits("25", "gwei"),
          maxFeePerGas: parseUnits("30", "gwei"),
        }) as Promise<ContractTransactionResponse>);
      } else {
        tx = await (contract!.reset() as Promise<ContractTransactionResponse>);
      }

      setTxState((prev) => ({
        ...prev,
        isTxConfirming: true,
        hash: tx.hash,
      }));
      // 3. transaction confirm and update transaction state
      const receipt = await tx.wait();

      setTxState((prev) => ({
        ...prev,
        isSuccess: true,
        isError: false,
        txReceipt: receipt ? receipt.hash : null,
      }));
    } catch (err: unknown) {
      let errorMsg = null;
      if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = "Count read failed";
      }
      // Console.error("Count read failed:", e.message);
      setTxState((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
        errorMessage: errorMsg,
      }));
    }
    setTimeout(() => {
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        isTxConfirming: false,
        isSuccess: false,
        hash: null,
        txReceipt: null,
      }));
      setRefresh();
    }, 2000);
  }

  return (
    <div className="ui-section-wrapper">
      <h4 className="sub-heading-center">Contract Write</h4>
      <div className="contract-card">
        <div>
          <strong>Count ++</strong>
          <span style={{ fontSize: "0.8rem" }}>
            <form onSubmit={(e) => void incSubmit(e)}>
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
                <div>Waiting for confirmation...</div>
              )}
              {txState.action === "inc" && txState.isSuccess && (
                <div>Transaction confirmed: {txState.txReceipt}</div>
              )}
              {txState.action === "inc" && txState.isError && (
                <div style={{ color: "darkred" }}>
                  {formatErrorMessage(txState.errorMessage)}
                </div>
              )}
            </form>
          </span>
        </div>
        <div className="write-card-row-gap">
          <strong>Step</strong>
          <span style={{ fontSize: "0.8rem" }}>
            <form onSubmit={(e) => void incBySubmit(e)}>
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
                <div>Waiting for confirmation...</div>
              )}
              {txState.action === "incBy" && txState.isSuccess && (
                <div>Transaction confirmed: {txState.txReceipt}</div>
              )}
              {txState.action === "incBy" && txState.isError && (
                <div style={{ color: "darkred" }}>
                  {formatErrorMessage(txState.errorMessage)}
                </div>
              )}
            </form>
          </span>
        </div>
        <div className="write-card-row-gap">
          <strong>Count := 0</strong>
          <span style={{ fontSize: "0.8rem" }}>
            <form onSubmit={(e) => void resetSubmit(e)}>
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
                <div>Waiting for confirmation...</div>
              )}
              {txState.action === "reset" && txState.isSuccess && (
                <div>Transaction confirmed: {txState.txReceipt}</div>
              )}
              {txState.action === "reset" && txState.isError && (
                <div style={{ color: "darkred" }}>
                  {formatErrorMessage(txState.errorMessage)}
                </div>
              )}
            </form>
          </span>
        </div>
      </div>
    </div>
  );
}
