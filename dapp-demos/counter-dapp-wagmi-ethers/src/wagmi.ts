import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { http, webSocket, fallback } from "wagmi";
import { sepolia, polygonAmoy } from "wagmi/chains";

export const config = getDefaultConfig({
  //Export const config = createConfig({
  appName: "RainbowKit Wagmi App",
  projectId: "94d9861d16f29ff196678f449668ed6a",
  ssr: false,
  chains: [sepolia, polygonAmoy],
  transports: {
    [sepolia.id]: fallback([
      webSocket(`wss://ethereum-sepolia-rpc.publicnode.com`, {
        reconnect: true,
        retryCount: 5,
      }),
      webSocket(`wss://sepolia.gateway.tenderly.co`, {
        reconnect: true,
        retryCount: 5,
      }),
      webSocket(`wss://eth-sepolia-testnet.api.pocket.network`, {
        reconnect: true,
        retryCount: 5,
      }),
      webSocket(`wss://0xrpc.io/sep`, {
        reconnect: true,
        retryCount: 5,
      }),

      http(`https://ethereum-sepolia-rpc.publicnode.com`),
      http(`https://eth-sepolia-testnet.api.pocket.network`),
      http(`https://sepolia.gateway.tenderly.co`),
      http(`https://public.1rpc.io/sepolia`),
    ]),
    [polygonAmoy.id]: fallback([
      webSocket(`wss://polygon-amoy-bor-rpc.publicnode.com`),
      webSocket(`wss://polygon-amoy.drpc.org`),
      http(`https://polygon-amoy-bor-rpc.publicnode.com`),
      http(`https://polygon-amoy.drpc.org`),
    ]),
  },
});
