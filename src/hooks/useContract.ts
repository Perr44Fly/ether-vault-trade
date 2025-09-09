import { useState, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { contractFunctions, TOKEN_ADDRESSES } from '@/lib/contract'
import { toast } from 'sonner'

export const useContract = () => {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTrade = useCallback(async (
    fromToken: string,
    toToken: string,
    fromAmount: string,
    minToAmount: string,
    deadline: number
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert token symbols to addresses
      const fromTokenAddress = TOKEN_ADDRESSES[fromToken as keyof typeof TOKEN_ADDRESSES]
      const toTokenAddress = TOKEN_ADDRESSES[toToken as keyof typeof TOKEN_ADDRESSES]

      if (!fromTokenAddress || !toTokenAddress) {
        throw new Error('Invalid token selection')
      }

      // Convert amounts to BigInt (assuming 18 decimals for simplicity)
      const fromAmountBigInt = BigInt(Math.floor(parseFloat(fromAmount) * 1e18))
      const minToAmountBigInt = BigInt(Math.floor(parseFloat(minToAmount) * 1e18))
      const deadlineBigInt = BigInt(deadline)

      const result = await contractFunctions.createTrade(
        walletClient,
        fromTokenAddress,
        toTokenAddress,
        fromAmountBigInt,
        minToAmountBigInt,
        deadlineBigInt
      )

      toast.success('Trade created successfully!')
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create trade'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, address])

  const executeTrade = useCallback(async (tradeId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await contractFunctions.executeTrade(walletClient, BigInt(tradeId))
      toast.success('Trade executed successfully!')
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to execute trade'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, address])

  const cancelTrade = useCallback(async (tradeId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await contractFunctions.cancelTrade(walletClient, BigInt(tradeId))
      toast.success('Trade canceled successfully!')
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel trade'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, address])

  const getBalance = useCallback(async (token: string) => {
    if (!address) {
      return 0
    }

    try {
      const tokenAddress = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES]
      if (!tokenAddress) {
        return 0
      }

      const balance = await contractFunctions.getBalance(address, tokenAddress)
      return Number(balance)
    } catch (err) {
      console.error('Error getting balance:', err)
      return 0
    }
  }, [address])

  const getTradeInfo = useCallback(async (tradeId: number) => {
    try {
      const tradeInfo = await contractFunctions.getTradeInfo(BigInt(tradeId))
      return tradeInfo
    } catch (err) {
      console.error('Error getting trade info:', err)
      return null
    }
  }, [])

  return {
    createTrade,
    executeTrade,
    cancelTrade,
    getBalance,
    getTradeInfo,
    isLoading,
    error,
    isConnected: !!address && !!walletClient
  }
}
