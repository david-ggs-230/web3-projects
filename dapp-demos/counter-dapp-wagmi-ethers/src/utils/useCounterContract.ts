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
    return [contract, provider,chainId];
}


export function useCounterEthersWrite(address: string) {
    const chainId = useChainId();
    const signer = useEthersSigner({ chainId });

    const contract = useMemo(() => {
        //Console.log("Create contract writer: ", signer)
        if (!signer || !address) {
            return null;
        }
        // Only instantiates when a true network change or address mutation occurs
        return new Contract(address, counterAbi.abi, signer);

        // CRUCIAL: Depend on the internal network chainId string/number, not the root provider object
    }, [address,signer]);
    return [contract, signer,chainId];
}