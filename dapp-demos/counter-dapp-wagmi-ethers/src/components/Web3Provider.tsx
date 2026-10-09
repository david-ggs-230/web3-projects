// Src/components/Web3Provider.tsx
import "@rainbow-me/rainbowkit/styles.css"; // Moved here!
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme  } from "@rainbow-me/rainbowkit";
import { polygonAmoy } from "viem/chains";
import { config } from "../wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export default function Web3Provider({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Force RainbowKit to match your polished layout light style */}
        <RainbowKitProvider 
          modalSize="compact" 
          initialChain={polygonAmoy}
          theme={lightTheme({
            accentColor: '#2563eb', // Matches your custom bright primary accent
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
