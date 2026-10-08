# Counter DApp

A simple on‑chain Counter decentralized application built with **React 19**, RainbowKit, Wagmi, Viem & Ethers v6.
Users can connect wallet, read counter value, increment / decrement the counter by sending blockchain transactions.

## 🛠 Tech Stack

- **React**: 19 (latest)
- **Vite**: Build tool
- **Wagmi**: React hooks for Ethereum
- **Viem**: Low‑level blockchain client (peer of wagmi)
- **RainbowKit**: Wallet connection modal
- **Ethers**: v6 (Ethers.js for contract interaction)
- **TypeScript**: Type‑safe development
- **Hardhat** (optional): Smart contract development & deployment

> Note: Wagmi internally uses Viem; we also import Ethers v6 for alternative contract calls for demonstration purpose.

## 📦 Project Setup

### Prerequisites
- Node.js >= 20
- npm / pnpm / yarn
- MetaMask / Rainbow wallet for testing
- RPC endpoint for your target chain (Sepolia testnet recommended)

### Install dependencies
```bash
pnpm install
# or
npm install
