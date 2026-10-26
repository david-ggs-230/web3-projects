// Src/utils/useCounterContract.ts
import { useMemo } from "react";
import { Contract } from "ethers";
import { useChainId } from "wagmi";
import { useEthersProvider } from "./ethers6Provider";
import { useEthersSigner } from "./ethers6Signer";
import { counterAbi } from "../abis/counterAbi";

export function useCounterEthersRead(address: string) {
  const chainId = useChainId();
  const provider = useEthersProvider({ chainId });

  const contract = useMemo(() => {
    //Console.log("Create contract provider: ", provider)
    if (!provider || !address) {
      return null;
    }
    // Only instantiates when a true network change or address mutation occurs
    return new Contract(address, counterAbi.abi, provider);
  }, [provider, address]);
  return [contract, provider, chainId];
}

export function useCounterEthersWrite(address: string) {
  const chainId = useChainId();
  const ethersContext = useEthersSigner({ chainId });
  const contract = useMemo(() => {
    // Gracefully handle missing prerequisites inside the memo
    if (!ethersContext?.signer || !address) {
      return null;
    }

    return new Contract(address, counterAbi.abi, ethersContext.signer);
  }, [address, ethersContext]);

  // 2. Return values safely. If context is missing, return fallback values
  // so the hook structure remains consistent.
  const signer = ethersContext?.signer ?? null;
  const provider = ethersContext?.provider ?? null;

  return [contract, signer, chainId, provider] as const;
}
