import { createAppKit } from "@reown/appkit/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, http } from "wagmi";
import { polygonAmoy, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { type AppKitNetwork } from "@reown/appkit/networks";
import App from "./App";

// 1. Define your custom RPC mapping using CAIP-2 network IDs
const myCustomRpcUrls = {
  "eip155:11155111": [{ url: "https://ethereum-sepolia-rpc.publicnode.com" }],
  "eip155:80002": [{ url: "https://polygon-amoy-bor-rpc.publicnode.com" }],
};
// 0. Setup queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
    },
  },
});
// 1. Get projectId from https://dashboard.reown.com
const projectId = "94d9861d16f29ff196678f449668ed6a";

// 2. Create a metadata object - optional
const metadata = {
  name: "AppKit",
  description: "AppKit Example",
  url: "https://example.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Set the networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia, polygonAmoy];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,

  // Pass customRpcUrls for native AppKit features
  customRpcUrls: myCustomRpcUrls,
  // Map Wagmi transports to override Wagmi-specific provider calls
  transports: {
    //[polygonAmoy.id]: http(),
    //[sepolia.id]: http(),
    [polygonAmoy.id]: http("https://polygon-amoy-bor-rpc.publicnode.com"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
  ssr: false,
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  customRpcUrls: myCustomRpcUrls, // Crucial to keep aligned with the adapter
  metadata,
  features: {
    email: true, // default to true
    socials: [
      "google",
      "x",
      "github",
      "discord",
      "apple",
      "facebook",
      "farcaster",
    ],
    emailShowWallets: true, // default to true
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
