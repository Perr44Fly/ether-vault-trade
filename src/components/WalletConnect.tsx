import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const WalletConnect = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <Card className="border-corporate-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-corporate-primary">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-corporate-secondary">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {formatAddress(address)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="bg-corporate-success/10 text-corporate-success">
              Connected
            </Badge>
          </div>
          
          <Button
            variant="outline"
            onClick={() => disconnect()}
            className="w-full border-corporate-border hover:bg-muted"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-corporate-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-corporate-primary">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-corporate-secondary">
          Connect your wallet to start trading with privacy protection
        </p>
        
        <div className="space-y-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full justify-start border-corporate-border hover:bg-muted"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {connector.name}
              {isPending && ' (Connecting...)'}
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Your wallet connection is secured with enterprise-grade encryption
        </p>
      </CardContent>
    </Card>
  )
}

export default WalletConnect
