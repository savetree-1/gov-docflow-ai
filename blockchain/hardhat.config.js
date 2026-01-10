require('dotenv').config({ path: '../backend/.env' });
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: process.env.METAMASK_PRIVATE_KEY ? [process.env.METAMASK_PRIVATE_KEY] : [],
      chainId: 80002
    }
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
