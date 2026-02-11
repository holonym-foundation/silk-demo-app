import { useEffect, useState } from 'react'
// import { RequestPermissionTokenParams, RequestPermissionTokenResult } from '@human.tech/waap-interface-core'

// TODO: remove it, when newer version of waap-interface-core is released
interface RequestPermissionTokenParams {
  /** Contract addresses that the PT should allow transactions to */
  allowedAddresses: string[];
  /** Chain ID the PT should be valid for */
  chainId: number;
  /** Requested spend limit in USD (e.g., "100.00") */
  requestedAmountUsd: string;
  /** Requested expiry duration in seconds (max 7200 = 2 hours) */
  requestedExpirySeconds: number;
}
// TODO: remove it, when newer version of waap-interface-core is released
interface RequestPermissionTokenResult {
  /** Whether the user approved and signed the PT */
  success: boolean;
  /** Error message if the request failed */
  error?: string;
}

import { useWaapTransaction } from '@human.tech/waap-sdk'

// The allowed address that matches our PT configuration
const ALLOWED_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

// A random address NOT in the PT's allowed list (for testing invalid transactions)
const INVALID_ADDRESS = '0x32Be343B94f860124dC4fEe278FDCBD38C102D88'

// Use Sepolia testnet for testing (chain ID 11155111 = 0xaa36a7)
const SEPOLIA_CHAIN_ID = '0xaa36a7'

// A known "dead" or Malicious address often flagged by simulators
const MALICIOUS_ADDRESS = '0x0a5738064da9dda3cf4a4ae8d8e49b16fd7467c5'

function RequestPermissionToken() {
  const [result, setResult] = useState<RequestPermissionTokenResult | null>(null)
  const [ptChainId, setPtChainId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<string | null>(null)
  const [asyncTxHash, setAsyncTxHash] = useState<string | null>(null)
  const [asyncTxStatus, setAsyncTxStatus] = useState<string | null>(null)
  const [pendingTxId, setPendingTxId] = useState<string | null>(null)

  // Use the WaaP transaction hook for async transaction events
  const { isAnyPending, pendingTransactions } = useWaapTransaction({
    onPending: (result) => {
      console.log('[PT] onPending (waap_sign_pending)', result)
      setAsyncTxStatus('Signing pending...')
    },
    on2faRequired: (result) => {
      console.log('[PT] on2faRequired (waap_2fa_required)', result)
      setAsyncTxStatus('2FA required...')
    },
    onSigned: (result) => {
      console.log('[PT] onSigned (waap_sign_complete)', result)
      setAsyncTxStatus('Signed! Broadcasting...')
    },
    onSignFailed: (result) => {
      console.log('[PT] onSignFailed (waap_sign_failed)', result)
      const errorMsg = result?.error || ''
      const isTimeout = errorMsg.includes('Timed out')

      setAsyncTxHash(null) // Sign failure = no tx hash
      setAsyncTxStatus(isTimeout ? 'Confirmation Timeout' : 'Sign failed')
      setError(errorMsg || 'Signing failed')
    },
    onTxPending: (result) => {
      console.log('[PT] onTxPending (waap_tx_pending)', result)
      setAsyncTxStatus('Transaction pending...')
      if (result?.txHash) {
        setAsyncTxHash(result.txHash)
      }
    },
    onConfirmed: (result) => {
      console.log('[PT] onConfirmed (waap_tx_confirmed)', result)
      setAsyncTxHash(result?.txHash || null)
      setAsyncTxStatus('Transaction confirmed!')
    },
    onFailed: (result) => {
      console.log('[PT] onFailed (waap_tx_failed)', result)
      const errorMsg = result?.error || ''
      const isTimeout = errorMsg.includes('Timed out')
      const stage = result?.stage // 'broadcast' | 'confirmation'

      setAsyncTxHash(null) // Broadcast/confirmation failure = no on-chain hash; do not parse error (often contains serialized tx, not hash)
      setAsyncTxStatus(
        isTimeout
          ? 'Confirmation Timeout'
          : stage
            ? `Transaction failed (${stage})`
            : 'Transaction failed'
      )
      setError(errorMsg || 'Transaction failed')
    }
  })

  // Also set up raw event listeners for debugging
  useEffect(() => {
    if (!window.silk) return

    const handleSignComplete = (event: any) => {
      console.log('[PT] waap_sign_complete event:', event)
    }

    const handleTxConfirmed = (event: any) => {
      console.log('[PT] waap_tx_confirmed event:', event)
      if (event?.txHash) {
        setAsyncTxHash(event.txHash)
        setAsyncTxStatus('Transaction confirmed!')
      }
    }

    const handleTxFailed = (event: any) => {
      console.log('[PT] waap_tx_failed event:', event)
      const payload = event?.payload ?? event
      const errorMsg = payload?.error || 'Transaction failed'
      const stage = payload?.stage
      setAsyncTxHash(null)
      setAsyncTxStatus(stage ? `Transaction failed (${stage})` : 'Transaction failed')
      setError(errorMsg)
    }

    window.silk.on('waap_sign_complete', handleSignComplete)
    window.silk.on('waap_tx_confirmed', handleTxConfirmed)
    window.silk.on('waap_tx_failed', handleTxFailed)

    // Cleanup
    return () => {
      // Note: silk.off may not exist, so we don't clean up
    }
  }, [])

  // Step 1: Create Permission Token
  const requestToken = async (amountUsd: string, expiryHours: number = 1, malicious: boolean = false) => {
    setResult(null)
    setPtChainId(null)
    setError(null)
    try {
      if (!window.silk) throw new Error('Silk SDK not initialized')
      
      // Get chain ID of SEPOLIA_CHAIN_ID
      const currentChainId = parseInt(SEPOLIA_CHAIN_ID, 16)
      
      console.log('Creating PT for chain ID:', currentChainId)
      console.log('Allowed address:', ALLOWED_ADDRESS)
      console.log('Origin:', window.location.origin)
      console.log('Requested Amount USD:', amountUsd)


      
      const params: RequestPermissionTokenParams = {
        allowedAddresses: malicious ? [ALLOWED_ADDRESS, MALICIOUS_ADDRESS] : [ALLOWED_ADDRESS],
        chainId: currentChainId, // Use current chain
        requestedAmountUsd: amountUsd,
        requestedExpirySeconds: expiryHours * 3600
      }
      
      const response = await window.silk.requestPermissionToken(params) as RequestPermissionTokenResult
      
      console.log('Permission Token Response:', response)
      setResult(response)
      if (response.success) {
        setPtChainId(currentChainId) // Track chain ID separately
      }
    } catch (err: any) {
      console.error('Permission Token Error:', err)
      setError(err.message || 'Unknown error')
    }
  }

  // Step 2: Send ASYNC transaction using the stored PT
  // The PT is automatically attached by sign.ts if valid for this transaction
  const sendAsyncTransactionWithPT = async () => {
    setAsyncTxHash(null)
    setAsyncTxStatus('Sending async transaction with PT...')
    setError(null)
    setPendingTxId(null)
    
    try {
      if (!window.silk) throw new Error('Silk SDK not initialized')
      
      // Get user's address
      const accounts = await window.silk.request({ method: 'eth_accounts' }) as string[]
      if (!accounts || accounts.length === 0) {
        throw new Error('No account connected')
      }
      
      const fromAddress = accounts[0]
      
      // Switch to Sepolia testnet for testing
      console.log('Switching to Sepolia testnet...')
      await window.silk.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      })

      // Get current chain ID
      const chainIdHex = await window.silk.request({ method: 'eth_chainId' }) as string
      const currentChainId = parseInt(chainIdHex, 16)
      
      console.log('=== Async Transaction with PT ===')
      console.log('From:', fromAddress)
      console.log('To:', ALLOWED_ADDRESS)
      console.log('Current Chain ID:', currentChainId)
      console.log('PT was created for Chain ID:', ptChainId ?? 'unknown')
      if (ptChainId && currentChainId !== ptChainId) {
        console.warn('⚠️ Chain mismatch! PT created for chain', ptChainId, 'but wallet is on chain', currentChainId)
      }
      console.log('PT origin:', window.location.origin)
      
      // Send a small transaction to the allowed address with async mode
      // The PT should be automatically attached by sign.ts
      const txParams = {
        from: fromAddress,
        to: ALLOWED_ADDRESS, // Must match allowedAddresses in PT
        value: '0x0', // 0 ETH (just testing the flow)
        data: '0x' // No data
      }
      
      // The wallet will check for a valid PT and if found and valid, process in background
      const result = await window.silk.request({
        method: 'eth_sendTransaction',
        params: [txParams],
        withPT: true
      })
      
      console.log('Async Transaction result:', result)
      
      // In async mode, we get back { pendingTxId, status } initially
      // Then events fire as tx progresses via useWaapTransaction callbacks
      if (typeof result === 'object' && result !== null && 'pendingTxId' in result) {
        setPendingTxId((result as any).pendingTxId)
        setAsyncTxStatus(`Pending broadcast...`)
        // The tx hash will be set by the event listeners when confirmed
      } else {
        // Fallback: result is the tx hash directly
        setAsyncTxHash(result as string)
        setAsyncTxStatus('Transaction sent successfully!')
      }
      
    } catch (err: any) {
      console.error('Async Transaction Error:', err)
      setError(err.message || 'Transaction failed')
      setAsyncTxStatus(null)
    }
  }

  // Step 3: Send INVALID async transaction (to address NOT in PT)
  // This should trigger the modal since PT doesn't cover this address
  const sendInvalidTransactionWithPT = async () => {
    setAsyncTxHash(null)
    setAsyncTxStatus('Sending invalid async transaction...')
    setError(null)
    setPendingTxId(null)
    
    try {
      if (!window.silk) throw new Error('Silk SDK not initialized')
      
      // Get user's address
      const accounts = await window.silk.request({ method: 'eth_accounts' }) as string[]
      if (!accounts || accounts.length === 0) {
        throw new Error('No account connected')
      }
      
      const fromAddress = accounts[0]
      
      // Switch to Sepolia testnet for testing
      console.log('Switching to Sepolia testnet...')
      await window.silk.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      })
      
      // Get current chain ID
      const chainIdHex = await window.silk.request({ method: 'eth_chainId' }) as string
      const currentChainId = parseInt(chainIdHex, 16)
      
      console.log('=== Invalid Async Transaction (NOT covered by PT) ===')
      console.log('From:', fromAddress)
      console.log('To:', INVALID_ADDRESS, '(NOT in PT allowed list!)')
      console.log('Current Chain ID:', currentChainId)
      console.log('PT was created for Chain ID:', ptChainId ?? 'unknown')
      console.log('Async mode: ENABLED')
      console.log('Expected: Modal should appear since PT does not cover this address')
      
      // Send transaction to address NOT in PT's allowedAddresses
      // This should trigger the modal
      const txParams = {
        from: fromAddress,
        to: INVALID_ADDRESS, // NOT in PT's allowedAddresses - should trigger modal
        value: '0x0', // 0 ETH
        data: '0x'
      }
      
      const result = await window.silk.request({
        method: 'eth_sendTransaction',
        params: [txParams],
        withPT: true
      })
      
      console.log('Invalid Transaction result:', result)
      
      if (typeof result === 'object' && result !== null && 'pendingTxId' in result) {
        setPendingTxId((result as any).pendingTxId)
        setAsyncTxStatus(`Pending broadcast...`)
      } else {
        setAsyncTxHash(result as string)
        setAsyncTxStatus('Transaction sent successfully!')
      }
      
    } catch (err: any) {
      console.error('Invalid Transaction Error:', err)
      setError(err.message || 'Transaction failed')
      setAsyncTxStatus(null)
    }
  }

  return (
    <div className='p-4 border rounded-lg'>
      <h3 className='text-xl font-semibold mb-4'>Permission Token</h3>
      <p className='mb-4 text-sm text-gray-600'>
        Request a spending limit permission token for your current origin on ETH Sepolia.
        <br/>
        Get some free ETH from <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank">Google Faucet</a>
        <br />
        If existing PT is below limit or insufficient, the modal will be shown.
      </p>
      
      {/* Step 1: Create PT */}
      <div className='mb-4'>
        <div className='flex gap-4'>
          <button onClick={() => requestToken('100.00', 1, false)} className='button'>
            1a. Create PT ($100, 1 hour)
          </button>
          <br /><br />
          <button onClick={() => requestToken('500.00', 2, false)} className='button' style={{ backgroundColor: '#9333ea' }}>
            1b. Create PT ($500, 2 hour)
          </button>
          <br /><br />
          <button onClick={() => requestToken('500.00', 2, true)} className='button' style={{ backgroundColor: '#9333ea' }}>
            1c. Create PT ($500, 2 hour, malicious)
          </button>
        </div>
      </div>
      {/* PT Creation Result */}
      {result && (
        <div className='mt-4'>
          <h4 className='font-bold'>PT Created:</h4>
          <div className='p-2 bg-green-50 rounded break-all overflow-auto max-h-60'>
            <pre className='text-xs'>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
      <br />
            
      {/* Step 2: Send transaction with PT */}
      <div className='mb-4 flex flex-col gap-4'>
        <div>
          <button 
            onClick={sendAsyncTransactionWithPT} 
            className='button'
            style={{ backgroundColor: '#2196F3' }}
          >
            2. Send Transaction with PT (Async)
          </button>
          <div className='text-xs text-gray-500 mt-1'>
            <pre className='text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-left'><code>{`const result = await window.silk.request({
  method: 'eth_sendTransaction',
  params: [txParams],
  withPT: true
})`}</code></pre>
          </div>
        </div>

        <div>
          <button 
            onClick={async () => {
              // Sends 0 value to a "Malicious" address to trigger risk flag
              setAsyncTxHash(null)
              setAsyncTxStatus('Sending Malicious transaction with PT...')
              setError(null)
              
              try {
                if (!window.silk) throw new Error('Silk SDK not initialized')
                const accounts = await window.silk.request({ method: 'eth_accounts' }) as string[]
                const fromAddress = accounts[0]
                
                const txParams = {
                  from: fromAddress,
                  to: MALICIOUS_ADDRESS,
                  value: '0x0', // 0 ETH (passes balance check)
                  data: '0x'
                }
                
                const result = await window.silk.request({
                  method: 'eth_sendTransaction',
                  params: [txParams],
                  withPT: true
                })
                
                if (typeof result === 'object' && result !== null && 'pendingTxId' in result) {
                  setPendingTxId((result as any).pendingTxId)
                  // Status will be updated by useWaapTransaction callbacks
                }
              } catch (err: any) {
                setError(err.message)
              }
            }} 
            className='button'
            style={{ backgroundColor: '#dc2626' }}
          >
            2b. Send Malicious Transaction (0 ETH, Trigger 2FA)
          </button>
          <p className='text-xs text-gray-500 mt-1'>
            Sends 0 ETH to <code>{MALICIOUS_ADDRESS}</code>.
            <br />Since this address is malicious, <em>IF require 2FA is on</em>, the modal should pop back up for 2FA confirmation even though the value is 0.
          </p>
        </div>
      </div>
      
      {/* Step 3: Send Invalid Transaction with PT */}
      <div className='mb-4'>
        <button 
          onClick={sendInvalidTransactionWithPT} 
          className='button'
          style={{ backgroundColor: '#ef4444' }}
        >
          3. Send Invalid Transaction With PT (Async)
        </button>
        <p className='text-xs text-gray-500 mt-1'>
          Sends to {INVALID_ADDRESS.slice(0, 10)}... (NOT in PT allowed list)
          <br />
          Should trigger modal since PT doesn't cover this address
        </p>
      </div>
      
      {/* Async Transaction Result */}
      {asyncTxStatus && (
        <div className='mt-4'>
          <h4 className='font-bold'>Async Transaction Status:</h4>
          <div className='p-2 bg-purple-50 rounded'>
            <p className='text-sm'>{asyncTxStatus}</p>
            {pendingTxId && (
              <p className='text-xs font-mono mt-1 break-all text-gray-600'>
                Pending ID: {pendingTxId}
              </p>
            )}
            {asyncTxHash && (
              <p className='text-xs font-mono mt-1 break-all'>
                Hash: {asyncTxHash}
              </p>
            )}
            {isAnyPending && !error && (
              <p className='text-xs text-blue-600 mt-1'>
                ⏳ Transaction in progress...
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Sync Transaction Result */}
      {txStatus && (
        <div className='mt-4'>
          <h4 className='font-bold'>Transaction Status:</h4>
          <div className='p-2 bg-blue-50 rounded'>
            <p className='text-sm'>{txStatus}</p>
            {pendingTxId && (
              <p className='text-xs font-mono mt-1 break-all text-gray-600'>
                Pending ID: {pendingTxId}
              </p>
            )}
            {txHash && (
              <p className='text-xs font-mono mt-1 break-all'>
                Hash: {txHash}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className='mt-4 p-2 bg-red-50 text-red-700 rounded max-w-md overflow-auto max-h-40' style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
          <h4 className='font-bold'>Error:</h4>
          <p className='text-xs' style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{error}</p>
        </div>
      )}
    </div>
  )
}

export default RequestPermissionToken
