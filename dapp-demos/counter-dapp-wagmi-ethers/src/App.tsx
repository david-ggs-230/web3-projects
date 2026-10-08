import "./App.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId } from "wagmi";
import { sepolia, polygonAmoy } from "wagmi/chains";
import SepoliaChainUI from "./SepoliaChainUI";
import PolygonAmoyChainUI from "./PolyAmoyChainUI";

function App() {
  const chainId = useChainId();
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Counter Contract</h1>
      <h2 style={{ textAlign: "center" }}>(RainbowKit, Wagmi, and Ethers)</h2>
      <div className="app-shell">
        <div className="app-header-bar">
          <ConnectButton chainStatus="full" showBalance />
        </div>
        {chainId === sepolia.id && <SepoliaChainUI />}
        {chainId === polygonAmoy.id && <PolygonAmoyChainUI />}
        {chainId !== sepolia.id &&
          chainId !== polygonAmoy.id &&
          `<div>${chainId.toString()} is not supported!</div>`}
      </div>
    </>
  );
}
export default App;
