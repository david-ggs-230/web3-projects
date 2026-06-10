// deploy Marketplace contract
import { ethers, NonceManager } from "ethers";
import marketplace_sol_json from "./abis/MyNFTMarketplace.json" with { type: 'json' };
import mynft_sol_json from "./abis/MyNFT.json" with { type: 'json' };

// local hardhat node
const rpc_url: string = "http://localhost:8545";

// Account #10: 0xBcd4042DE499D14e55001CcbB24a551F3b954096 (10000 ETH)
const marketplace_owner_privkey: string = "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897";

// Account #11: 0x71bE63f3384f5fb98995898A86B02Fb2426c5788 (10000 ETH)
const mynft_owner_privkey: string = "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82";

const deployMarketplaceContract = async (owner: ethers.Signer): Promise<string> => {
  console.log("Deploying Marketplace contract...");
  const MarketplaceFactory = new ethers.ContractFactory(
    marketplace_sol_json.abi,
    marketplace_sol_json.bytecode,
    owner
  );
  const marketplace = await MarketplaceFactory.deploy();
  await marketplace.deploymentTransaction()?.wait();
  const marketplaceAddr = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddr);
  return marketplaceAddr;
};

const deployMyNFTContract = async (owner: ethers.Signer, marketplace_addr: string): Promise<string> => {
  console.log("Deploying MyNFT contract...");
  const MyNFTFactory = new ethers.ContractFactory(
    mynft_sol_json.abi,
    mynft_sol_json.bytecode,
    owner
  );
  const mynft = await MyNFTFactory.deploy(marketplace_addr);
  await mynft.deploymentTransaction()?.wait();
  const mynftAddr = await mynft.getAddress();
  console.log("MyNFT deployed to:", mynftAddr);
  return mynftAddr;
};

async function main(): Promise<void> {
  // --------------------------
  // Initialize Provider & Signers
  // --------------------------
  const provider = new ethers.JsonRpcProvider(rpc_url);

  const marketplace_owner = new ethers.Wallet(marketplace_owner_privkey, provider);
  const marketplace_signer = new NonceManager(marketplace_owner);

  const mynft_owner = new ethers.Wallet(mynft_owner_privkey, provider);
  const mynft_signer = new NonceManager(mynft_owner);

  const marketplaceAddr = await deployMarketplaceContract(marketplace_signer);
  const nftAddr = await deployMyNFTContract(mynft_signer, marketplaceAddr);

  console.log("\n*********************************************************************************");
  console.log("Marketplace Contract Owner:", marketplace_owner.address);
  console.log("Marketplace Contract Address:", marketplaceAddr);
  console.log("MyNFT Contract Owner:", mynft_owner.address);
  console.log("MyNFT Contract Address:", nftAddr);
  console.log("*********************************************************************************");
}

await main();
