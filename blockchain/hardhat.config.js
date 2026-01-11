require("dotenv").config({ path: "../backend/.env" }); // Loads your backend .env
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      // 1. Use the variable from your .env
      url:
        process.env.BLOCKCHAIN_NETWORK ||
        "https://rpc-amoy.polygon.technology/",
      // 2. Use the consistent variable name
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [],
      chainId: 80002,
    },
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
