// scripts/deploy.js
async function main() {
  const TestContract = await ethers.getContractFactory("TestContract");
  console.log("Deploying contract...");
  
  const contract = await TestContract.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("TestContract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
