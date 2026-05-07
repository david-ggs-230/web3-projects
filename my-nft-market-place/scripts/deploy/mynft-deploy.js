// deploy Lock.sol contract
async function main() {
  [owner] = await ethers.getSigners();
  // Deploy marketplace first
    // Deploy Marketplace
    const MarketplaceFactory = await ethers.getContractFactory("MyNFTMarketplace");
    const marketplace = await MarketplaceFactory.deploy();
    await marketplace.waitForDeployment();
   const marketplaceAddr = await marketplace.getAddress();
    console.log("Marketplace deployed to:", marketplaceAddr);
  
    // Deploy NFT contract
  const MyNFT = await ethers.getContractFactory("MyNFT");
  console.log("Deploying MyNFT contract...");

  const nft = await MyNFT.deploy(marketplaceAddr);
  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log("MyNFT contract deployed to:", nftAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
