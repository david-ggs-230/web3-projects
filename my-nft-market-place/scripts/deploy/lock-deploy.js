const { ethers } = require("hardhat");

// deploy Lock.sol contract
async function main() {
  const currentTime= Math.floor(Date.now() / 1000);
  const ONE_GWEI = 1000000000n;
  const unlockTime = currentTime+6000; // Current time in seconds + 100 minutes buffer  
  console.log(`Current Timestamp: ${currentTime}, Deploying Lock contract with unlockTime: ${unlockTime}`);
  const Lock = await ethers.getContractFactory("Lock");
  // Deploy contract and send 1 Fwei of ETH to it  
  const lock = await Lock.deploy(unlockTime, {
    value: ONE_GWEI// 1 Gwei
  });
  await lock.waitForDeployment();

  const address = await lock.getAddress();
  console.log("Lock contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
