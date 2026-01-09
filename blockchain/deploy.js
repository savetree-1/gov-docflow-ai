const hre = require("hardhat");

async function main() {
  console.log("Deploying PravahAuditTrail contract to Polygon Amoy...\n");

  /****** Setting up deployer account ******/
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  
  /****** Checking the balance ******/
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "POL\n");

  /****** Deploying the contract ******/
  console.log("Deploying contract...");
  const PravahAuditTrail = await hre.ethers.getContractFactory("PravahAuditTrail");
  const contract = await PravahAuditTrail.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\nSUCCESS! Contract deployed!");
  console.log("Contract Address:", contractAddress);
  console.log("\nView on PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${contractAddress}`);
  
  console.log("\nIMPORTANT: Save this address!");
  console.log("Add to your .env file:");
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
