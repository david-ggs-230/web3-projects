// Src/utils/ethers6Provider.ts
import { BrowserProvider } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { useConnectorClient } from "wagmi";

export function clientToProvider(client: Client<Transport, Chain, Account>) {
  const { chain, transport } = client;
  const network = {
    chainId: (chain as { id: number }).id,
    name: (chain as { name: string }).name,
  };
  const provider = new BrowserProvider(transport, network);
  return provider;
}
// Action to convert a viem Client to an ethers.js Provider.

export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  //Console.log("client signer: ",client);
  return useMemo(() => {
    if (!client) {
      return undefined;
    }
    return clientToProvider(client);
  }, [client]);
}
