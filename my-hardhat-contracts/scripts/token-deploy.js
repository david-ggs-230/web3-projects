// scripts/deploy.js
async function main() {
  const Token = await ethers.getContractFactory("Token");
  console.log("Deploying contract...");
  
  const contract = await Token.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("Token deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
