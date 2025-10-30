require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
  networks: {
    // Define a network for Hedera Testnet/Mainnet if needed for deployment
    // For now, we will use the Hedera SDK for deployment, not Hardhat's deployment system.
    // This configuration is primarily for compilation.
  }
};
