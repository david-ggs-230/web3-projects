require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28", // Latest stable version as of Oct 2025
  networks: {
    hardhat: {
      chainId: 31337, // Standard local network ID
      mining: {
        auto: true,
        interval: 0 // Instant mining for faster testing
      }
    }
  }
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});