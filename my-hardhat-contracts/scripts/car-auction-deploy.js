// scripts/deploy.js
async function main() {
  const CarAuction = await ethers.getContractFactory("CarAuction");
  console.log("Deploying contract...");
  
  const contract = await CarAuction.deploy(5,"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","Ferrari","IS2012");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("CarAuction deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
