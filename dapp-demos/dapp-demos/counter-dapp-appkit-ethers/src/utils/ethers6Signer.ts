// Src/utils/ethers6Signer.ts
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { useConnectorClient } from "wagmi";

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: (chain as { id: number }).id,
    name: (chain as { name: string }).name,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(
    provider,
    (account as { address: string }).address,
  );
  return { signer, provider };
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  //Console.log("client signer: ",client);
  return useMemo(() => {
    if (!client) {
      return undefined;
    }
    return clientToSigner(client);
  }, [client]);
}
