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

  useEffect(() => {
    try {
      const testReferralCode = 'aaaaaaaaaaaaaaaaaaaaaaaa'
      const provider = initSilk({
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
    } catch (err) {
      console.error(err)
    }
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className='App'>
          <TestComponent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
