import { useState, useEffect } from "react";
import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, createConfig } from "wagmi";
import {
  Chain,
  mainnet,
  sepolia,
  hardhat,
  polygon,
  gnosis,
  optimism,
} from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { WagmiProvider } from "wagmi";
import TestComponent from "./TestComponent";
import { initSilk } from "@silk-wallet/silk-wallet-sdk";
import Uniswap from "./assets/uniswap.svg";

const defaultChains: Chain[] = [mainnet, polygon, gnosis, sepolia, optimism];

if (process.env.NODE_ENV == "development") {
  defaultChains.push(hardhat);
}

const wagmiConfig = createConfig({
  chains: defaultChains as any as readonly [Chain, ...Chain[]],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [gnosis.id]: http(),
    [optimism.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID,
    }),
  ],
});

function App() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    try {
      const testReferralCode = "aaaaaaaaaaaaaaaaaaaaaaaa";
      const provider = initSilk({
        // referralCode: testReferralCode
        // config: {
        //   appName: 'Uniswap',
        //   darkMode: true
        //   // appLogo: `${window.location.origin}${Uniswap}`
        // }
      });
      // @ts-ignore
      window.silk = provider;
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <TestComponent />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
