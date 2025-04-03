import { useEffect, useState } from 'react'
import { SilkEthereumProviderInterface } from '@silk-wallet/silk-wallet-sdk'

declare global {
  interface Window {
    silk: SilkEthereumProviderInterface
  }
}

/**
 * This component demonstrates how to listen for account changes
 * in a dApp integrating with Silk Wallet.
 */
function AccountListener() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [accountHistory, setAccountHistory] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  // Function to start listening for account changes
  const startListening = () => {
    if (!window.silk) {
      console.error('Silk wallet not available')
      return
    }

    try {
      // Get the current accounts
      window.silk
        .request({ method: 'eth_requestAccounts' })
        // @ts-ignore
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0])
            setAccountHistory((prev) => [
              ...prev,
              `Initial account: ${accounts[0]}`
            ])
          }
        })
        .catch((error) => {
          console.error('Failed to get accounts', error)
        })

      // Set up the account change listener
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed event received:', accounts)

        const newAccount = accounts.length > 0 ? accounts[0] : null
        setCurrentAccount(newAccount)

        setAccountHistory((prev) => [
          ...prev,
          `Account changed: ${newAccount || 'No account'}`
        ])
      }

      // Add the event listener
      window.silk.on('accountsChanged', handleAccountsChanged)
      setIsListening(true)

      //   // Return a cleanup function to remove the listener when the component unmounts
      //   return () => {
      //     window.silk.removeListener('accountsChanged', handleAccountsChanged)
      //     setIsListening(false)
      //   }
    } catch (error) {
      console.error('Error setting up account listener:', error)
    }
  }

  // Set up the listener when the component mounts
  useEffect(() => {
    const cleanup = startListening()

    // Clean up when the component unmounts
    // return () => {
    //   if (cleanup) cleanup()
    // }
  }, [])

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Account Listener Demo</h2>

      <div className='mb-4'>
        <p className='text-lg font-semibold'>Status:</p>
        <p className={`${isListening ? 'text-green-600' : 'text-red-600'}`}>
          {isListening ? 'Listening for account changes' : 'Not listening'}
        </p>
      </div>

      <div className='mb-4'>
        <p className='text-lg font-semibold'>Current Account:</p>
        <p className='font-mono bg-gray-100 p-2 rounded'>
          {currentAccount || 'No account connected'}
        </p>
      </div>

      <div>
        <p className='text-lg font-semibold mb-2'>Account History:</p>
        <ul className='bg-gray-100 p-2 rounded max-h-60 overflow-y-auto'>
          {accountHistory.length === 0 ? (
            <li className='text-gray-500'>No history yet</li>
          ) : (
            accountHistory.map((entry, index) => (
              <li
                key={index}
                className='font-mono mb-1 border-b border-gray-200 pb-1'
              >
                {entry}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className='mt-4'>
        <p className='text-sm text-gray-600'>
          Try switching accounts in your wallet to see the event triggered.
        </p>
      </div>
    </div>
  )
}

export default AccountListener
