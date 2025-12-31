const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PravahAuditTrail contract to Polygon Amoy...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "POL\n");

  // Deploy contract
  console.log("⏳ Deploying contract...");
  const PravahAuditTrail = await hre.ethers.getContractFactory("PravahAuditTrail");
  const contract = await PravahAuditTrail.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ SUCCESS! Contract deployed!");
  console.log("📄 Contract Address:", contractAddress);
  console.log("\n🔗 View on PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${contractAddress}`);
  
  console.log("\n📝 IMPORTANT: Save this address!");
  console.log("Add to your .env file:");
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
