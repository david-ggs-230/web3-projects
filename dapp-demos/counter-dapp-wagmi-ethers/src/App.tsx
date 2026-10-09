// Src/App.tsx
import "./App.css";
import { lazy, Suspense } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId } from "wagmi";
import { sepolia, polygonAmoy } from "wagmi/chains";

// Dynamically split the chain-specific UIs
const SepoliaChainUI = lazy(() => import("./SepoliaChainUI"));
const PolygonAmoyChainUI = lazy(() => import("./PolyAmoyChainUI"));

// Clean inner container loader component
function LocalModuleSpinner() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px 0",
      width: "100%"
    }}>
      <div className="spinner-element" />
      <p style={{
        marginTop: "16px",
        color: "var(--text-muted)",
        fontSize: "0.9rem",
        fontWeight: 500
      }}>
        Resolving chain contract views...
      </p>
    </div>
  );
}

function App() {
  const chainId = useChainId();

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Counter Contract</h1>
      <h2 style={{ textAlign: "center" }}>(RainbowKit, Wagmi, and Ethers)</h2>
      <div className="app-shell">
        
        {/* Swapped raw text loader for the matching layout spinner */}
        <Suspense fallback={<LocalModuleSpinner />}>
        <div className="app-header-bar">
          <ConnectButton chainStatus="full" showBalance />
        </div>

          {chainId === sepolia.id && <SepoliaChainUI />}
          {chainId === polygonAmoy.id && <PolygonAmoyChainUI />}
          {chainId !== sepolia.id && chainId !== polygonAmoy.id && (
            <div style={{ textAlign: "center", color: "red", marginTop: "20px" }}>
              {chainId.toString()} is not supported!
            </div>
          )}
        </Suspense>
      </div>
    </>
  );
}

export default App;
