require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",// Latest stable version as of Oct 2025
    settings: {
      evmVersion: "cancun",  // Add this line
    },
  },
  networks: {
    hardhat: {
      chainId: 31337, // Standard local network ID
      hardfork: "cancun",    // Also update the network hardfork
      mining: {
        auto: true,
        interval: 0 // Instant mining for faster testing
      }
    },
    sepolia: {
      chainId: 11155111, // Sepolia test network ID
      url: process.env.SEPOLIA_RPC_URL || `https://sepolia.drpc.org`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [] // Your private key (use .env to secure this)
    }
  }
};
