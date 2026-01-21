import { useState } from 'react'
import { SilkEthereumProviderInterface } from '@human.tech/waap-sdk'

// Add TypeScript declaration for window.silk
declare global {
  interface Window {
    silk: SilkEthereumProviderInterface
  }
}

interface ChainFormData {
  chainId: string
  chainName: string
  rpcUrls: string
  nativeCurrencyName: string
  nativeCurrencySymbol: string
  nativeCurrencyDecimals: string
  blockExplorerUrls: string
}

function AddCustomNetwork() {
  const [formData, setFormData] = useState<ChainFormData>({
    chainId: '',
    chainName: '',
    rpcUrls: '',
    nativeCurrencyName: '',
    nativeCurrencySymbol: '',
    nativeCurrencyDecimals: '18',
    blockExplorerUrls: ''
  })
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addCustomNetwork = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Adding custom network...')
    setError(null)

    try {
      // Validate required fields
      if (!formData.chainId || !formData.chainName || !formData.rpcUrls) {
        throw new Error('Chain ID, Chain Name, and RPC URLs are required')
      }

      // Convert chainId to hex if it's a decimal number
      let chainIdHex = formData.chainId
      if (!chainIdHex.startsWith('0x')) {
        const chainIdNum = parseInt(chainIdHex, 10)
        if (isNaN(chainIdNum)) {
          throw new Error('Chain ID must be a valid number')
        }
        chainIdHex = `0x${chainIdNum.toString(16)}`
      }

      // Parse RPC URLs (comma-separated or single)
      const rpcUrlsArray = formData.rpcUrls
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      if (rpcUrlsArray.length === 0) {
        throw new Error('At least one RPC URL is required')
      }

      // Parse block explorer URLs (comma-separated or single, optional)
      const blockExplorerUrlsArray = formData.blockExplorerUrls
        ? formData.blockExplorerUrls
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0)
        : []

      // Build params object
      const params: any = {
        chainId: chainIdHex,
        chainName: formData.chainName,
        rpcUrls: rpcUrlsArray,
        nativeCurrency: {
          name: formData.nativeCurrencyName || 'Ether',
          symbol: formData.nativeCurrencySymbol || 'ETH',
          decimals: parseInt(formData.nativeCurrencyDecimals || '18', 10)
        }
      }

      // Only add blockExplorerUrls if provided
      if (blockExplorerUrlsArray.length > 0) {
        params.blockExplorerUrls = blockExplorerUrlsArray
      }

      await window.silk.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      })

      setStatus('Successfully added custom network!')
      // Reset form
      setFormData({
        chainId: '',
        chainName: '',
        rpcUrls: '',
        nativeCurrencyName: '',
        nativeCurrencySymbol: '',
        nativeCurrencyDecimals: '18',
        blockExplorerUrls: ''
      })
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to add network'
      setError(errorMessage)
      setStatus('Error occurred')
      console.error('Error adding network:', err)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h2>Add Custom Network</h2>
      
      <form onSubmit={addCustomNetwork}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div>
            <label htmlFor="chainId" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
              Chain ID <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              id="chainId"
              name="chainId"
              value={formData.chainId}
              onChange={handleInputChange}
              placeholder="42101 or 0xa475"
              required
              style={{
                width: '100%',
                padding: '0.4em 0.8em',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '0.9em',
                fontFamily: 'inherit',
                backgroundColor: '#f9f9f9',
                color: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="chainName" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
              Chain Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              id="chainName"
              name="chainName"
              value={formData.chainName}
              onChange={handleInputChange}
              placeholder="Push Testnet Donut"
              required
              style={{
                width: '100%',
                padding: '0.4em 0.8em',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '0.9em',
                fontFamily: 'inherit',
                backgroundColor: '#f9f9f9',
                color: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="rpcUrls" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
            RPC URLs <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            id="rpcUrls"
            name="rpcUrls"
            value={formData.rpcUrls}
            onChange={handleInputChange}
            placeholder="https://evm.donut.rpc.push.org/"
            required
            style={{
              width: '100%',
              padding: '0.4em 0.8em',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '0.9em',
              fontFamily: 'inherit',
              backgroundColor: '#f9f9f9',
              color: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 80px',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div>
            <label htmlFor="nativeCurrencyName" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
              Currency Name
            </label>
            <input
              type="text"
              id="nativeCurrencyName"
              name="nativeCurrencyName"
              value={formData.nativeCurrencyName}
              onChange={handleInputChange}
              placeholder="PUSH Chain"
              style={{
                width: '100%',
                padding: '0.4em 0.8em',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '0.9em',
                fontFamily: 'inherit',
                backgroundColor: '#f9f9f9',
                color: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="nativeCurrencySymbol" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
              Symbol
            </label>
            <input
              type="text"
              id="nativeCurrencySymbol"
              name="nativeCurrencySymbol"
              value={formData.nativeCurrencySymbol}
              onChange={handleInputChange}
              placeholder="PC"
              style={{
                width: '100%',
                padding: '0.4em 0.8em',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '0.9em',
                fontFamily: 'inherit',
                backgroundColor: '#f9f9f9',
                color: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor="nativeCurrencyDecimals" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
              Decimals
            </label>
            <input
              type="number"
              id="nativeCurrencyDecimals"
              name="nativeCurrencyDecimals"
              value={formData.nativeCurrencyDecimals}
              onChange={handleInputChange}
              placeholder="18"
              style={{
                width: '100%',
                padding: '0.4em 0.8em',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '0.9em',
                fontFamily: 'inherit',
                backgroundColor: '#f9f9f9',
                color: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="blockExplorerUrls" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
            Block Explorer URLs (optional)
          </label>
          <input
            type="text"
            id="blockExplorerUrls"
            name="blockExplorerUrls"
            value={formData.blockExplorerUrls}
            onChange={handleInputChange}
            placeholder="https://donut.push.network"
            style={{
              width: '100%',
              padding: '0.4em 0.8em',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '0.9em',
              fontFamily: 'inherit',
              backgroundColor: '#f9f9f9',
              color: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button type="submit" className="button">
          Add Custom Network
        </button>
      </form>

      {status && (
        <p style={{ 
          marginTop: '12px',
          fontSize: '0.9em',
          color: error ? '#ef4444' : '#22c55e'
        }}>
          {status}
        </p>
      )}
      {error && (
        <p style={{ 
          marginTop: '6px',
          fontSize: '0.9em',
          color: '#ef4444'
        }}>
          Error: {error}
        </p>
      )}
    </div>
  )
}

export default AddCustomNetwork
