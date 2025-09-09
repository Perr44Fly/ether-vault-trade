# Ether Vault Trade - Deployment Guide

## Overview

This guide covers the deployment process for the Ether Vault Trade platform, including smart contract deployment and frontend deployment to Vercel.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Vercel account
- Wallet with testnet ETH for contract deployment

## Smart Contract Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Contract Addresses (will be set after deployment)
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# RPC URLs
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-infura-key
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your-infura-key

# Private key for deployment (keep secure!)
PRIVATE_KEY=your-private-key-here
```

### 3. Deploy Smart Contract

The smart contract needs to be deployed to a FHE-enabled network. Currently, this would be deployed to Zama's testnet or mainnet.

```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Update Contract Address

After deployment, update the `VITE_CONTRACT_ADDRESS` in your environment variables with the deployed contract address.

## Frontend Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Environment Variables in Vercel

Set the following environment variables in your Vercel dashboard:

- `VITE_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
- `VITE_CONTRACT_ADDRESS`: Deployed smart contract address
- `VITE_SEPOLIA_RPC_URL`: Sepolia RPC endpoint
- `VITE_MAINNET_RPC_URL`: Mainnet RPC endpoint

## Configuration

### WalletConnect Setup

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Add it to your environment variables

### RPC Endpoints

For production, use reliable RPC providers:
- [Infura](https://infura.io)
- [Alchemy](https://alchemy.com)
- [QuickNode](https://quicknode.com)

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Environment Variables**: Use Vercel's environment variable system
3. **HTTPS**: Ensure all connections use HTTPS in production
4. **CORS**: Configure CORS properly for your domain

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints for monitoring:
- Contract connectivity
- Wallet connection status
- RPC endpoint availability

### Error Tracking

Consider integrating error tracking services:
- Sentry
- LogRocket
- Bugsnag

## Troubleshooting

### Common Issues

1. **Contract Not Found**: Ensure contract address is correct and deployed
2. **RPC Errors**: Check RPC endpoint URLs and rate limits
3. **Wallet Connection**: Verify WalletConnect project ID
4. **Build Failures**: Check Node.js version and dependencies

### Support

For technical support, please refer to:
- [Documentation](./README.md)
- [GitHub Issues](https://github.com/Perr44Fly/ether-vault-trade/issues)

## Production Checklist

- [ ] Smart contract deployed and verified
- [ ] Environment variables configured
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Error tracking configured
- [ ] Monitoring alerts set up
- [ ] Backup procedures in place
- [ ] Security audit completed
