// deploy Lock.sol contract
async function main() {
  const JAN_1ST_2030 = 1893456000;
  const ONE_FWEI = 1000000000000n;
  const Lock = await ethers.getContractFactory("Lock");
  console.log("Deploying Lock contract...");
  
  const contract = await Lock.deploy(JAN_1ST_2030, { value: ONE_FWEI });
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("Lock contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
