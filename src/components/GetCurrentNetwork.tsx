import { useState } from 'react'
import { SilkEthereumProviderInterface } from '@human.tech/waap-sdk'

// Add TypeScript declaration for window.silk
declare global {
  interface Window {
    silk: SilkEthereumProviderInterface
  }
}

function GetCurrentNetwork() {
  const [chainId, setChainId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getCurrentNetwork = async () => {
    setChainId(null)
    setError(null)
    
    try {
      const chainIdHex = await window.silk.request({
        method: 'eth_chainId'
      })
      setChainId(chainIdHex as string)
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch network'
      setError(message)
      console.error('Error fetching network:', err)
    }
  }

  return (
    <div>
      <h2>Get Current Network</h2>
      <button onClick={getCurrentNetwork} className="button">
        Get Current Network
      </button>
      {chainId && !error && (
        <p style={{ 
          marginTop: '8px',
          fontSize: '0.9em',
          color: '#646cff'
        }}>
          Current network chainId: {chainId}
        </p>
      )}
      {error && (
        <p style={{ 
          marginTop: '8px',
          fontSize: '0.9em',
          color: '#ef4444'
        }}>
          Error: {error}
        </p>
      )}
    </div>
  )
}

export default GetCurrentNetwork
