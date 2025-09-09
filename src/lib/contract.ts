import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem'
import { sepolia, mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Contract ABI - This would be generated from the compiled contract
export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_feeCollector", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tradeId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "trader", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "fromToken", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "toToken", "type": "address"}
    ],
    "name": "TradeCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tradeId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "trader", "type": "address"},
      {"indexed": false, "internalType": "uint32", "name": "fromAmount", "type": "uint32"},
      {"indexed": false, "internalType": "uint32", "name": "toAmount", "type": "uint32"}
    ],
    "name": "TradeExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "fromToken", "type": "address"},
      {"internalType": "address", "name": "toToken", "type": "address"},
      {"internalType": "uint256", "name": "fromAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "minToAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "name": "createTrade",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tradeId", "type": "uint256"}
    ],
    "name": "executeTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tradeId", "type": "uint256"}
    ],
    "name": "cancelTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "getBalance",
    "outputs": [
      {"internalType": "uint8", "name": "", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tradeId", "type": "uint256"}
    ],
    "name": "getTradeInfo",
    "outputs": [
      {"internalType": "address", "name": "trader", "type": "address"},
      {"internalType": "address", "name": "fromToken", "type": "address"},
      {"internalType": "address", "name": "toToken", "type": "address"},
      {"internalType": "uint8", "name": "fromAmount", "type": "uint8"},
      {"internalType": "uint8", "name": "toAmount", "type": "uint8"},
      {"internalType": "uint8", "name": "price", "type": "uint8"},
      {"internalType": "bool", "name": "isExecuted", "type": "bool"},
      {"internalType": "bool", "name": "isPrivate", "type": "bool"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "deadline", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000'

// Token addresses (example addresses for common tokens)
export const TOKEN_ADDRESSES = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
  USDC: '0xA0b86a33E6441b8c4C8C0E4b8c4C8C0E4b8c4C8C' as `0x${string}`,
  ETH: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  BTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
}

// Create public client for reading from blockchain
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/demo')
})

// Create wallet client for writing to blockchain
export const createWalletClient = (account: any) => {
  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/demo')
  })
}

// Contract interaction functions
export const contractFunctions = {
  // Create a new trade
  async createTrade(
    walletClient: any,
    fromToken: `0x${string}`,
    toToken: `0x${string}`,
    fromAmount: bigint,
    minToAmount: bigint,
    deadline: bigint
  ) {
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createTrade',
        args: [fromToken, toToken, fromAmount, minToAmount, deadline],
      })
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return { hash, receipt }
    } catch (error) {
      console.error('Error creating trade:', error)
      throw error
    }
  },

  // Execute a trade
  async executeTrade(walletClient: any, tradeId: bigint) {
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'executeTrade',
        args: [tradeId],
      })
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return { hash, receipt }
    } catch (error) {
      console.error('Error executing trade:', error)
      throw error
    }
  },

  // Cancel a trade
  async cancelTrade(walletClient: any, tradeId: bigint) {
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelTrade',
        args: [tradeId],
      })
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      return { hash, receipt }
    } catch (error) {
      console.error('Error canceling trade:', error)
      throw error
    }
  },

  // Get user balance for a token
  async getBalance(userAddress: `0x${string}`, tokenAddress: `0x${string}`) {
    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getBalance',
        args: [userAddress, tokenAddress],
      })
      return balance
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  },

  // Get trade information
  async getTradeInfo(tradeId: bigint) {
    try {
      const tradeInfo = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTradeInfo',
        args: [tradeId],
      })
      return tradeInfo
    } catch (error) {
      console.error('Error getting trade info:', error)
      return null
    }
  }
}

// Utility functions
export const formatTokenAmount = (amount: bigint, decimals: number = 18) => {
  return formatEther(amount)
}

export const parseTokenAmount = (amount: string, decimals: number = 18) => {
  return parseEther(amount)
}

// Event listeners
export const contractEvents = {
  // Listen for trade creation events
  async watchTradeCreated(callback: (event: any) => void) {
    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: 'TradeCreated',
      onLogs: callback,
    })
    return unwatch
  },

  // Listen for trade execution events
  async watchTradeExecuted(callback: (event: any) => void) {
    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      eventName: 'TradeExecuted',
      onLogs: callback,
    })
    return unwatch
  }
}
