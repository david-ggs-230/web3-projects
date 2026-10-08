import { useState } from "react";
import type { Contract } from "ethers";
import { parseUnits } from "ethers";
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
  const setRefresh = useRefreshStore((state: any) => state.setRefresh);

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
      let tx;
      if (chainId === polygonAmoy.id) {
        tx = await (contract as Contract).increment({
          maxPriorityFeePerGas: parseUnits("25", "gwei"),
          maxFeePerGas: parseUnits("30", "gwei"),
        });
      } else {
        tx = await (contract as Contract).increment();
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
        txReceipt: receipt.hash,
      }));
    } catch (e: any) {
      // Console.error("Count read failed:", e.message);
      setTxState((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
        errorMessage: e.message,
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
      let tx;
      if (chainId === polygonAmoy.id) {
        tx = await (contract as Contract).incrementBy(stepByRes.value, {
          maxPriorityFeePerGas: parseUnits("25", "gwei"),
          maxFeePerGas: parseUnits("30", "gwei"),
        });
      } else {
        tx = await (contract as Contract).incrementBy(stepByRes.value);
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
        txReceipt: receipt.hash,
      }));
    } catch (e: any) {
      // Console.error("Count read failed:", e.message);
      setTxState((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
        errorMessage: e.message,
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

    let owner = null;
    let signerAddress = null; // 1. Declare a variable for the signer address

    try {
      // 2. Fetch both the owner and the signer address asynchronously
      [owner, signerAddress] = await Promise.all([
        (contract as Contract).owner(),
        (signer as any).getAddress(), // Use the official ethers.js method
      ]);

      //Console.log("contract owner: ", owner, "signer address: ", signerAddress);
    } catch (e: any) {
      setTxState((prev) => ({
        ...prev,
        isLoading: false,
        isTxConfirming: false,
        isError: true,
        isSuccess: false,
        hash: null,
        txReceipt: null,
        errorMessage: `failed to get contract owner: ${e.message}`,
      }));
      return;
    }
    // 3. Perform a safe, null-checked comparison
    if (
      !owner ||
      !signerAddress ||
      owner.toLowerCase() !== signerAddress.toLowerCase()
    ) {
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

    try {
      // 1. Set loading state
      setTxState((prev) => ({
        ...prev,
        isLoading: true,
      }));
      // 2. contract write and update transaction state
      //Const tx = await (contract as Contract).reset!();
      let tx;
      if (chainId === polygonAmoy.id) {
        tx = await (contract as Contract).reset({
          maxPriorityFeePerGas: parseUnits("25", "gwei"),
          maxFeePerGas: parseUnits("30", "gwei"),
        });
      } else {
        tx = await (contract as Contract).reset();
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
        txReceipt: receipt.hash,
      }));
    } catch (e: any) {
      // Console.error("Count read failed:", e.message);
      setTxState((prev) => ({
        ...prev,
        isSuccess: false,
        isError: true,
        errorMessage: e.message,
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
