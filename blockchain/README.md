# Pravaah Blockchain Audit Trail

Immutable record of document actions on Polygon Amoy testnet.

## Setup

1. Get your MetaMask private key:
   - Open MetaMask
   - Click three dots → Account details
   - Click "Show private key"
   - Enter password
   - Copy the key (NEVER share this!)

2. Add to `/backend/.env`:
```
METAMASK_PRIVATE_KEY=your_private_key_here
```

3. Install dependencies:
```bash
cd blockchain
npm install
```

4. Deploy contract:
```bash
npm run deploy
```

5. Copy the contract address to `.env`:
```
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
```

## What This Does

- Every document approval/rejection/forward is recorded on blockchain
- Records are immutable (even admin can't change)
- Provides tamper-proof audit trail for RTI/court cases
- No documents stored on-chain, only action hashes

## Contract Functions

- `logAction()` - Record document action
- `getAllActions()` - Get audit trail for document
- `getActionCount()` - Count actions for document
