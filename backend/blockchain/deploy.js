/****** Deploy AuditTrail Smart Contract to Polygon Amoy Testnet ******/

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

async function main() {
  console.log('Starting AuditTrail Contract Deployment...\n');

  /****** Loading environment variables from parent directory ******/
  const envPath = path.join(__dirname, '..', '.env');
  require('dotenv').config({ path: envPath });

  /****** STEP 1: Connecting to Polygon Amoy ******/
  console.log('Connecting to Polygon Amoy Testnet...');
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
  
  console.log('Connected to:', process.env.POLYGON_RPC_URL);
  console.log('Deploying from:', wallet.address);
  
  /****** Checking the balance ******/
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'POL\n');
  
  if (balance === 0n) {
    console.error('ERROR: No POL tokens. Get testnet tokens from https://faucet.polygon.technology/');
    process.exit(1);
  }

  /****** STEP 2: Compiling the contract ******/
  console.log('Compiling smart contract...');
  const contractPath = path.join(__dirname, 'AuditTrail.sol');
  const source = fs.readFileSync(contractPath, 'utf8');
  
  const input = {
    language: 'Solidity',
    sources: {
      'AuditTrail.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    output.errors.forEach(err => {
      if (err.severity === 'error') {
        console.error('Compilation error:', err.message);
        process.exit(1);
      }
    });
  }
  
  const contract = output.contracts['AuditTrail.sol']['AuditTrail'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;
  
  console.log('Contract compiled successfully\n');

  /****** STEP 3: Deploying the contract ******/
  console.log('Deploying contract to Polygon Amoy...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  const deploymentTx = await factory.deploy();
  console.log('Transaction sent:', deploymentTx.deploymentTransaction().hash);
  console.log('Waiting for confirmation...\n');
  
  await deploymentTx.waitForDeployment();
  const contractAddress = await deploymentTx.getAddress();
  
  console.log('CONTRACT DEPLOYED SUCCESSFULLY!\n');
  console.log('Contract Address:', contractAddress);
  console.log('View on PolygonScan:', `https://amoy.polygonscan.com/address/${contractAddress}`);
  
  /****** STEP 4: Saving the deployment information ******/
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: 'Polygon Amoy Testnet',
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    txHash: deploymentTx.deploymentTransaction().hash,
    abi: abi
  };
  
  const deploymentPath = path.join(__dirname, 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('\nDeployment info saved to:', deploymentPath);
  
  /****** STEP 5: Updateing the .env instruction ******/
  console.log('\nNEXT STEP: Add this to your .env file:');
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
