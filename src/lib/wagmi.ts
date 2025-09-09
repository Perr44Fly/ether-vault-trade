import { createConfig, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Get projectId from https://cloud.walletconnect.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Create wagmi config
export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/demo'),
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/demo'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
