import { counterAbi } from "./abis/counterAbi";
import CounterContractReadUI from "./CounterContractReadUI";
import CounterContractWriteUI from "./CounterContractWriteUI"

export default function SepoliaChainUI() {
  const address = counterAbi.sepoliaaddress;
  return (
    <div className="profile-container">
      <h2 className="profile-heading">Sepolia Chain</h2>
      <CounterContractReadUI apiAddress={address} />
      <div className="block-gap">
       <CounterContractWriteUI apiAddress={address} />
      </div>
    </div>
  );
}
