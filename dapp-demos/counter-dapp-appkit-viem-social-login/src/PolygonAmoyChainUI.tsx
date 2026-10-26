import CounterContractReadUI from "./CounterContractReadUI";
import CounterContractWriteUI from "./CounterContractWriteUI";
import { counterAbi } from "./abis/counterAbi";

export default function PolygonAmoyChainUI() {
  const address = counterAbi.amoyaddress;
  return (
    <div className="profile-container">
      <h2 className="profile-heading">Polygon Amoy Chain</h2>
      <CounterContractReadUI apiAddress={address} />
      <div className="block-gap">
        <CounterContractWriteUI apiAddress={address} />
      </div>
    </div>
  );
}
