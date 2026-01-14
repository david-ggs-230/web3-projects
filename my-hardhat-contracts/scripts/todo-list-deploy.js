// scripts/deploy.js
async function main() {
  const TodoList = await ethers.getContractFactory("TodoList");
  console.log("Deploying contract...");
  
  const contract = await TodoList.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("TodoList deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
