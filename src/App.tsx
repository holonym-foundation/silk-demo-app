import { useState, useEffect } from 'react'
import './App.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import TestComponent from './TestComponent'
import { initSilk } from '@silk-wallet/silk-wallet-sdk'
import Uniswap from './assets/uniswap.svg'
import { wagmiConfig } from './wagmi-config'

function App() {
  const [queryClient] = useState(() => new QueryClient())
  const [silkReady, setSilkReady] = useState(false)

  useEffect(() => {
    try {
      const testReferralCode = 'aaaaaaaaaaaaaaaaaaaaaaaa'
      const provider = initSilk({
        useStaging: false,
        // useStaging: process.env.VITE_VERCEL_ENV !== 'production'
        // referralCode: testReferralCode
        // config: {
        //   appName: 'Uniswap',
        //   darkMode: true
        //   // appLogo: `${window.location.origin}${Uniswap}`
        // }
      })
      
      // @ts-ignore
      window.silk = provider
      
      // Give the provider a moment to fully initialize
      setTimeout(() => {
        setSilkReady(true)
      }, 100)
      
    } catch (err) {
      console.error('Failed to initialize Silk:', err)
      // Still allow the app to render even if Silk fails
      setSilkReady(true)
    }
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className='App'>
          {silkReady ? (
            <TestComponent />
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Initializing Silk Wallet...</p>
              </div>
            </div>
          )}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
