// scripts/deploy.js
async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  
  const contract = await SimpleStorage.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("SimpleStorage deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
