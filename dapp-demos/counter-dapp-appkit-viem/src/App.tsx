import "./App.css";
import { useSyncExternalStore } from "react";
//import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AppKitButton } from "@reown/appkit/react";
import { useChainId } from "wagmi";
import { sepolia, polygonAmoy } from "wagmi/chains";

import SepoliaChainUI from "./SepoliaChainUI";
import PolygonAmoyChainUI from "./PolygonAmoyChainUI";

// Named placeholder function satisfies the linter by explicitly outlining intent
const noopCleanup = () => {
  /* No cleanup required as hydration state is static post-load */
};
const subscribe = () => noopCleanup;

function App() {
  const chainId = useChainId();

  // Safely tracks client hydration status without scheduling extra state renders
  const isClient = useSyncExternalStore(
    subscribe,
    () => true, // Executed on client side
    () => false, // Executed during initial server build/snapshot
  );

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Counter Contract</h1>
      <h2 style={{ textAlign: "center" }}>(AppKit, Wagmi, and Viem)</h2>

      {!isClient ? (
        /* Displays loading spinner instantly before scripts fully initialize */
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <div className="spinner">Loading Counter DApp...</div>
        </div>
      ) : (
        /* Mounts your active UI shell only after full script execution */
        <div className="app-shell">
          <div className="app-header-bar">
            <AppKitButton />
          </div>
          {chainId === sepolia.id && <SepoliaChainUI />}
          {chainId === polygonAmoy.id && <PolygonAmoyChainUI />}
          {chainId !== sepolia.id && chainId !== polygonAmoy.id && (
            <div>{chainId.toString()} is not supported!</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
