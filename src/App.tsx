import { useState, useEffect, use } from 'react'
import './App.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import TestComponent from './TestComponent'
import { initWaaP } from '@human.tech/waap-sdk'
import Uniswap from './assets/uniswap.svg'
import { wagmiConfig } from './wagmi-config'

function App() {
  const [queryClient] = useState(() => new QueryClient())
  const [silkReady, setSilkReady] = useState(false)
  const [useStagingSwitch, setUseStagingSwitch] = useState(null);

  useEffect(() => {
    if (useStagingSwitch === null) return;
    try {
      const testReferralCode = 'aaaaaaaaaaaaaaaaaaaaaaaa'
      const provider = initWaaP({
        useStaging: useStagingSwitch,
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
  }, [useStagingSwitch])

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
                <p>Initializing WaaP...Would you like to use the staging or production environment?</p>
                <button onClick={() => setUseStagingSwitch(true)}>Staging</button>
                <button onClick={() => setUseStagingSwitch(false)}>Production</button>
              </div>
            </div>
          )}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
